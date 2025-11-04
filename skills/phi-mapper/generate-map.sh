#!/usr/bin/env bash
# Generate PROJECT-MAP.auto.scm for a project

set -euo pipefail

PROJECT_PATH="${1:-.}"
MAPPER_PATH="/Users/adimov/Developer/phi/packages/project-mapper"

# Resolve absolute path
PROJECT_PATH=$(cd "$PROJECT_PATH" && pwd)

echo "Generating PROJECT-MAP for: $PROJECT_PATH"

# Ensure mapper is built
cd "$MAPPER_PATH"
if [ ! -f "dist/cli.js" ]; then
  echo "Building project-mapper..."
  bun run build
fi

# Generate map
node dist/cli.js "$PROJECT_PATH"

# Report result
MAP_FILE="$PROJECT_PATH/.phi/PROJECT-MAP.auto.scm"
if [ -f "$MAP_FILE" ]; then
  FILE_COUNT=$(grep -c "^  (module " "$MAP_FILE" || echo "0")
  echo "✓ Generated: $MAP_FILE"
  echo "  Modules: $FILE_COUNT"
else
  echo "✗ Failed to generate map"
  exit 1
fi
