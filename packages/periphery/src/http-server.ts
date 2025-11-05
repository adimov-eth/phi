#!/usr/bin/env node

/**
 * Production MCP HTTP server for @agi/periphery
 *
 * Follows MCP Streamable HTTP specification with session persistence:
 * - Single /mcp endpoint with POST/GET/DELETE
 * - Session management via Mcp-Session-Id header
 * - SSE streams for server-to-client communication
 * - Token-based authentication
 * - Session persistence across server restarts (transparent to clients)
 *
 * Session Persistence:
 * - Sessions stored to tmpdir/periphery-sessions.json
 * - On restart, sessions restored from disk
 * - Clients never notice server restarts (transport state restored)
 * - DELETE endpoint required for explicit session cleanup
 */

import express from 'express';
import cors from 'cors';
import { randomUUID } from 'node:crypto';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { CallToolRequestSchema, ListToolsRequestSchema, isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { MCPServer } from './framework/MCPServer.js';
import { DiscoverTool } from './tools/discover.js';
import { ActionTool } from './tools/action.js';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const PORT = parseInt(process.env.PORT ?? '7777', 10);
const MCP_SERVER_URL = process.env.MCP_SERVER_URL ?? `http://localhost:${PORT}`;

/**
 * Session metadata - schema compatible with KV/Durable Object storage
 */
interface SessionData {
  sessionId: string;
  createdAt: number;
  lastAccessedAt: number;
}

/**
 * Session storage abstraction
 *
 * Implementation: file-based with debounced writes
 * - set/delete: immediate persist (structural changes)
 * - touch: debounced persist (batches lastAccessedAt updates)
 * - Ensures session state survives crashes without excessive I/O
 * - Portable to KV/Durable Object storage later
 *
 * Performance: touch() happens on every request, so we batch writes
 * with a 1-second debounce. Structural changes (set/delete) persist
 * immediately since they're infrequent and critical.
 */
class SessionStore {
  private storePath: string;
  private sessions: Map<string, SessionData>;
  private saveTimer: NodeJS.Timeout | null = null;
  private readonly SAVE_DEBOUNCE_MS = 1000;

  constructor(storePath: string = join(tmpdir(), 'periphery-sessions.json')) {
    this.storePath = storePath;
    this.sessions = new Map();
    this.load();
  }

  private load() {
    try {
      const data = readFileSync(this.storePath, 'utf-8');
      const parsed = JSON.parse(data) as SessionData[];
      this.sessions = new Map(parsed.map(s => [s.sessionId, s]));
      console.log(`📦 Loaded ${this.sessions.size} session(s) from ${this.storePath}`);
    } catch (error) {
      // File doesn't exist or invalid - start fresh
      console.log(`📦 No existing sessions, starting fresh`);
    }
  }

  private saveImmediate() {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
    const data = Array.from(this.sessions.values());
    writeFileSync(this.storePath, JSON.stringify(data, null, 2));
  }

  private saveDebounced() {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }
    this.saveTimer = setTimeout(() => {
      this.saveImmediate();
    }, this.SAVE_DEBOUNCE_MS);
  }

  get(sessionId: string): SessionData | undefined {
    return this.sessions.get(sessionId);
  }

  set(sessionId: string, data: SessionData): void {
    this.sessions.set(sessionId, data);
    this.saveImmediate(); // New session = immediate persist
  }

  delete(sessionId: string): void {
    this.sessions.delete(sessionId);
    this.saveImmediate(); // Session deletion = immediate persist
  }

  touch(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastAccessedAt = Date.now();
      this.saveDebounced(); // Batch lastAccessedAt updates
    }
  }

  list(): SessionData[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Flush any pending writes
   * Called on graceful shutdown
   */
  flush(): void {
    if (this.saveTimer) {
      this.saveImmediate();
    }
  }
}

// Register filesystem tools: eyes (discover) + hands (act)
const mcpServer = new MCPServer(DiscoverTool, ActionTool);

// Create MCP SDK Server
const sdkServer = new Server(
  {
    name: '@agi/periphery',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register handlers
sdkServer.setRequestHandler(ListToolsRequestSchema, async (request) => {
  const context = {} as any; // Minimal context for HTTP
  return {
    tools: await mcpServer.getToolDefinitions(context),
  };
});

sdkServer.setRequestHandler(CallToolRequestSchema, async (request) => {
  const context = {} as any; // Minimal context for HTTP
  return await mcpServer.callTool(context, request.params);
});

const app = express();
app.use(express.json());
app.use(cors({
  origin: '*',
  exposedHeaders: ['Mcp-Session-Id'],
}));

// Token authentication middleware (optional for localhost)
app.use('/mcp', (req, res, next) => {
  if (process.env.PERIPHERY_NO_AUTH === 'true') {
    next();
    return;
  }

  const expectedToken = process.env.PERIPHERY_API_KEY || 'prph-5f27cd471eb9648c0a3081aa4df7900eb05aa167804b21fe78fb59e6427cae74';
  const token = req.headers['periphery_api_key'] as string;

  if (token !== expectedToken) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  next();
});

// Session storage (in-memory transports + persistent metadata)
const transports: Record<string, StreamableHTTPServerTransport> = {};
const sessionStore = new SessionStore();

/**
 * Internal transport state interface
 *
 * StreamableHTTPServerTransport has private fields we need to access
 * for session restoration. These aren't exposed in the public API,
 * so we define this interface for type-safe access.
 *
 * @internal This is a workaround until MCP SDK exposes a restoration API
 */
interface TransportInternals {
  sessionId?: string;
  _initialized: boolean;
}

/**
 * Restore transport internal state after server restart
 *
 * StreamableHTTPServerTransport has two critical private fields that must be
 * manually set when restoring a session from persistence:
 * - sessionId: The session identifier
 * - _initialized: Flag indicating initialization handshake completed
 *
 * Without these, the transport will reject all requests with "Server not initialized"
 * even though the session exists in the persisted store.
 *
 * @param transport The transport to restore
 * @param sessionId The session ID to restore
 */
function restoreTransportState(transport: StreamableHTTPServerTransport, sessionId: string): void {
  const internals = transport as unknown as TransportInternals;
  internals.sessionId = sessionId;
  internals._initialized = true;
}

// POST /mcp - client sends requests
app.post('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  console.log(`📨 POST - sid:${sessionId?.slice(0,8) || 'none'} method:${req.body?.method} inMemory:${!!transports[sessionId!]} persisted:${!!sessionStore.get(sessionId!)}`);

  try {
    let transport: StreamableHTTPServerTransport;

    if (sessionId && transports[sessionId]) {
      transport = transports[sessionId];
      sessionStore.touch(sessionId); // Update last access time
    } else if (sessionId && sessionStore.get(sessionId)) {
      // RESTORE: Session exists in persisted store but not in memory
      console.log(`♻️  Restoring session ${sessionId.slice(0,8)} for ${req.body?.method}`);
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => sessionId,
        onsessioninitialized: (sid) => {
          console.log(`✅ Session restored: ${sid.slice(0,8)}`);
          transports[sid] = transport;
        },
      });

      // Restore internal state to match pre-restart transport
      restoreTransportState(transport, sessionId);

      transports[sessionId] = transport;
      sessionStore.touch(sessionId);

      // NOTE: Don't set onclose - let sessions persist across restarts
      // Only delete explicitly via DELETE endpoint

      await sdkServer.connect(transport);
      res.setHeader('Mcp-Session-Id', sessionId);
      await transport.handleRequest(req, res, req.body);
      return;
    } else if (!sessionId && isInitializeRequest(req.body)) {
      const newSessionId = randomUUID();
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => newSessionId,
        onsessioninitialized: (sid) => {
          console.log(`📍 ${sid}`);
          transports[sid] = transport;
        },
      });

      // Store transport and persist session metadata IMMEDIATELY
      transports[newSessionId] = transport;
      sessionStore.set(newSessionId, {
        sessionId: newSessionId,
        createdAt: Date.now(),
        lastAccessedAt: Date.now(),
      });

      // NOTE: Don't set onclose - let sessions persist across restarts
      // Only delete explicitly via DELETE endpoint

      await sdkServer.connect(transport);

      // Set session ID header BEFORE handling request
      res.setHeader('Mcp-Session-Id', newSessionId);

      await transport.handleRequest(req, res, req.body);
      return;
    } else {
      res.status(400).json({
        jsonrpc: '2.0',
        error: { code: -32000, message: 'Bad Request: No valid session ID' },
        id: null,
      });
      return;
    }

    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error('POST error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: { code: -32603, message: 'Internal server error' },
        id: null,
      });
    }
  }
});

// GET /mcp - SSE stream for server-to-client messages
app.get('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  console.log(`📡 GET (SSE) - sid:${sessionId?.slice(0,8) || 'none'} inMemory:${!!transports[sessionId!]} persisted:${!!sessionStore.get(sessionId!)}`);

  if (!sessionId) {
    res.status(400).send('Missing session ID');
    return;
  }

  let transport = transports[sessionId];

  if (!transport && sessionStore.get(sessionId)) {
    // RESTORE: Session exists in persisted store, create new transport
    console.log(`♻️  Restoring session ${sessionId.slice(0,8)} for SSE`);
    const newTransport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => sessionId,
      onsessioninitialized: (sid) => {
        console.log(`✅ Session restored (SSE): ${sid.slice(0,8)}`);
        transports[sid] = newTransport;
      },
    });

    // Restore internal state to match pre-restart transport
    restoreTransportState(newTransport, sessionId);

    transports[sessionId] = newTransport;
    sessionStore.touch(sessionId);

    // NOTE: Don't set onclose - let sessions persist across restarts
    // Only delete explicitly via DELETE endpoint

    await sdkServer.connect(newTransport);
    transport = newTransport;
  }

  if (!transport) {
    res.status(400).send('Invalid session ID');
    return;
  }

  await transport.handleRequest(req, res);
});

// DELETE /mcp - terminate session
app.delete('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send('Invalid or missing session ID');
    return;
  }
  try {
    await transports[sessionId].handleRequest(req, res);

    // Explicit deletion: remove from both in-memory and persisted store
    delete transports[sessionId];
    sessionStore.delete(sessionId);
    console.log(`🗑️  Session deleted: ${sessionId}`);
  } catch (error) {
    console.error('DELETE error:', error);
    if (!res.headersSent) {
      res.status(500).send('Error processing session termination');
    }
  }
});


// Health check
app.get('/health', (_req, res) => {
  const persistedSessions = sessionStore.list();
  res.json({
    status: 'ok',
    server: '@agi/periphery',
    version: '0.1.0',
    sessions: {
      active: Object.keys(transports).length,
      persisted: persistedSessions.length,
      list: persistedSessions,
    },
  });
});

app.listen(PORT, () => {
  console.log('🧠 Periphery MCP Server running');
  console.log(`   URL: ${MCP_SERVER_URL}`);
  console.log(`   API Key: ${process.env.PERIPHERY_API_KEY ? 'configured' : 'prph-5f27... (default)'}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log('');
  console.log('👁️  Afferent (Ψ): S-expression discovery');
  console.log('🤲 Efferent (~): Batch actions');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');

  // Flush any pending session writes
  sessionStore.flush();

  // Clear in-memory transports but keep sessions persisted
  // They will be restored on next startup
  const sessionCount = Object.keys(transports).length;
  for (const sessionId in transports) {
    delete transports[sessionId];
  }

  console.log(`✅ Shutdown complete (${sessionCount} sessions persisted)`);
  process.exit(0);
});
