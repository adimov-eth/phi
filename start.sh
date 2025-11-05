#!/bin/bash
set -e

# φ (phi) - One-command startup
#
# Usage: ./start.sh
#
# This script:
# 1. Checks if packages are built
# 2. Builds if needed (first time only)
# 3. Starts periphery HTTP server

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SERVER_PATH="$SCRIPT_DIR/packages/periphery/dist/http-server.js"

echo "φ Starting phi MCP server..."
echo ""

# Check if built
if [ ! -f "$SERVER_PATH" ]; then
  echo "📦 Building packages (first time only)..."

  # Check for bun, fallback to npm
  if command -v bun &> /dev/null; then
    cd "$SCRIPT_DIR"
    bun install
    bun run build
  elif command -v npm &> /dev/null; then
    cd "$SCRIPT_DIR"
    npm install
    npm run build
  else
    echo "❌ Error: Neither bun nor npm found. Please install bun or node.js"
    exit 1
  fi

  echo "✅ Build complete"
  echo ""
fi

# Start server
echo "🚀 Starting periphery server on http://localhost:7777"
echo "📡 MCP endpoint: http://localhost:7777/mcp"
echo "🔑 Default API key: prph-5f27cd471eb9648c0a3081aa4df7900eb05aa167804b21fe78fb59e6427cae74"
echo ""
echo "💡 Press Ctrl+C to stop"
echo ""

cd "$SCRIPT_DIR/packages/periphery"
exec node dist/http-server.js
