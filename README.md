# φ (Phi)

MCP server for filesystem operations via S-expressions. Compositional, type-safe filesystem access for Claude Code.

## What is this?

Two MCP tools that let Claude interact with filesystems using S-expressions:

**Ψ (Psi - discover)**: Compositional filesystem queries
```scheme
(fmap basename (filter (lambda (f) (string-contains? (read-file f) "TODO")) 
                        (find-files "**/*.ts")))
```

**~ (Tilde - act)**: Atomic batch filesystem operations
```scheme
[["mkdir", "src/components/foo"],
 ["write", "src/components/foo/index.ts", "export { Foo } from './Component';"],
 ["write", "src/components/foo/Component.tsx", "..."]]
```

## Installation as Claude Code Plugin

### 1. Clone and Build

```bash
git clone https://github.com/adimov-eth/phi
cd phi
bun install
bun run build
```

### 2. Run the Server

```bash
cd packages/periphery
node dist/http-server.js
```

Server runs on `http://localhost:7777` by default.

### 3. Configure Claude Code Plugin

Create `~/.config/claude/plugins/phi.json`:

```json
{
  "name": "phi",
  "mcpServers": {
    "periphery": {
      "url": "http://localhost:7777/mcp",
      "transport": "streamable-http",
      "headers": {
        "periphery_api_key": "prph-5f27cd471eb9648c0a3081aa4df7900eb05aa167804b21fe78fb59e6427cae74"
      }
    }
  }
}
```

(Change API key via `PERIPHERY_API_KEY` env var)

### 4. Restart Claude Code

Tools `mcp__periphery__discover` and `mcp__periphery__act` will be available.

## Features

### Session Persistence
- Server restarts are transparent to clients
- Sessions stored to tmpdir/periphery-sessions.json
- No reconnection needed after crashes

### S-Expression Composition
- Code = Data = S-expressions
- Fantasy Land combinators (fmap, chain, filter, compose)
- Point-free transformation pipelines

### Type Safety
- Full TypeScript implementation
- Zod schema validation for actions
- Batch operations with ValidateAllExecuteAny semantics

## Packages

- **@agi/arrival**: S-expression serialization with LIPS Scheme interpreter
- **@agi/periphery**: MCP server framework + filesystem tools

## Environment Variables

- `PORT`: Server port (default: 7777)
- `PERIPHERY_API_KEY`: Authentication token
- `MCP_SERVER_URL`: Public URL for server (for tunnels)

## License

MIT
