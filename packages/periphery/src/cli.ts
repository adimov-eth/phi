#!/usr/bin/env node

/**
 * Periphery CLI - Per-project MCP server
 *
 * Usage:
 *   periphery [options]
 *
 * Options:
 *   --root <path>    Project root directory (default: cwd)
 *   --port <number>  HTTP port (default: 7777)
 *   --help           Show this help
 *
 * Example:
 *   periphery --root /path/to/project --port 8888
 */

import { spawn } from 'child_process';
import { resolve } from 'path';

function parseArgs() {
  const args = process.argv.slice(2);
  const options: { root?: string; port?: string; help?: boolean; noAuth?: boolean } = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--root') {
      options.root = args[++i];
    } else if (arg === '--port') {
      options.port = args[++i];
    } else if (arg === '--no-auth') {
      options.noAuth = true;
    }
  }

  return options;
}

function showHelp() {
  console.log(`
periphery - Per-project MCP server for filesystem operations

Usage:
  periphery [options]

Options:
  --root <path>    Project root directory (default: current directory)
  --port <number>  HTTP port (default: 7777)
  --no-auth        Disable authentication (for localhost MCP usage)
  --help, -h       Show this help

Examples:
  periphery
  periphery --root /path/to/project
  periphery --root ~/xln --port 8888

Environment Variables:
  FS_ROOT          Project root (overridden by --root)
  PORT             HTTP port (overridden by --port)
  PERIPHERY_API_KEY  Authentication token
`);
}

function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  const root = options.root ? resolve(options.root) : process.cwd();
  const port = options.port || process.env.PORT || '7777';

  console.log(`🧠 Periphery MCP Server`);
  console.log(`📂 Root: ${root}`);
  console.log(`🔌 Port: ${port}`);
  console.log();

  // Set environment and spawn http-server
  const serverPath = new URL('./http-server.js', import.meta.url).pathname;

  const child = spawn('node', [serverPath], {
    env: {
      ...process.env,
      FS_ROOT: root,
      PORT: port,
      PERIPHERY_NO_AUTH: options.noAuth ? 'true' : undefined,
    },
    stdio: 'inherit',
  });

  child.on('exit', (code) => {
    process.exit(code || 0);
  });

  // Forward signals
  process.on('SIGINT', () => child.kill('SIGINT'));
  process.on('SIGTERM', () => child.kill('SIGTERM'));
}

main();
