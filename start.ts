#!/usr/bin/env bun
/**
 * φ (phi) - One-command startup
 *
 * Usage: bun start.ts
 *
 * This script:
 * 1. Checks if packages are built
 * 2. Builds if needed (or uses pre-built)
 * 3. Starts periphery HTTP server
 */

import { spawn } from "bun";
import { existsSync } from "fs";
import { join } from "path";

const PERIPHERY_DIST = join(import.meta.dir, "packages/periphery/dist");
const SERVER_PATH = join(PERIPHERY_DIST, "http-server.js");

console.log("φ Starting phi MCP server...\n");

// Check if built
if (!existsSync(SERVER_PATH)) {
  console.log("📦 Building packages (first time only)...");
  const build = spawn({
    cmd: ["bun", "install"],
    cwd: import.meta.dir,
    stdout: "inherit",
    stderr: "inherit",
  });

  await build.exited;

  if (build.exitCode !== 0) {
    console.error("❌ Install failed");
    process.exit(1);
  }

  const buildProc = spawn({
    cmd: ["bun", "run", "build"],
    cwd: import.meta.dir,
    stdout: "inherit",
    stderr: "inherit",
  });

  await buildProc.exited;

  if (buildProc.exitCode !== 0) {
    console.error("❌ Build failed");
    process.exit(1);
  }

  console.log("✅ Build complete\n");
}

// Start server
console.log("🚀 Starting periphery server on http://localhost:7777");
console.log("📡 MCP endpoint: http://localhost:7777/mcp");
console.log("🔑 Default API key: prph-5f27cd471eb9648c0a3081aa4df7900eb05aa167804b21fe78fb59e6427cae74");
console.log("\n💡 Press Ctrl+C to stop\n");

const server = spawn({
  cmd: ["node", SERVER_PATH],
  cwd: join(import.meta.dir, "packages/periphery"),
  stdout: "inherit",
  stderr: "inherit",
  env: {
    ...process.env,
    PORT: process.env.PORT || "7777",
  },
});

await server.exited;
process.exit(server.exitCode || 0);
