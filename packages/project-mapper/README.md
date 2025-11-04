# @agi/project-mapper

TypeScript-based PROJECT-MAP generator for compositional project awareness.

## What It Does

Extracts structure from code → generates S-expression PROJECT-MAP:

```bash
node dist/cli.js /path/to/project
# → /path/to/project/.phi/PROJECT-MAP.auto.scm
```

## Supported Languages

- **TypeScript/JavaScript** (`.ts`, `.tsx`, `.js`, `.jsx`) - Full AST parsing
- **Solidity** (`.sol`) - Contracts, interfaces, libraries, functions
- **Python** (`.py`) - Public functions and classes

## Output Format

```scheme
(project-map
  (auto-generated #t)
  (generated "2025-11-04T...")
  (root "/path/to/project")
  (files 142)

  (modules
    (module "path/to/file.ts"
      (language typescript)
      (exports
        (export "functionName" function)
        (export "ClassName" class))
      (imports
        (import "fs" external ("readFile" "writeFile"))
        (import "./utils" local ("helper")))
      (line-count 123))))
```

## Usage

### As CLI

```bash
cd /path/to/project
node /path/to/phi/packages/project-mapper/dist/cli.js .
```

### As Library

```typescript
import { generateProjectMap } from '@agi/project-mapper';

const output = await generateProjectMap({
  rootDir: '/path/to/project',
  ignorePatterns: ['**/node_modules/**', '**/dist/**']
});

console.log(output); // S-expression string
```

## Integration with phi

This package is used by phi's `/phi map` command to generate PROJECT-MAP.auto.scm files for any project.

## Testing

```bash
bun test              # Run tests
bun test:watch        # Watch mode
```

Tests verify:
- TypeScript/JavaScript extraction (exports, imports, types)
- Solidity contract extraction
- Python function/class extraction
- S-expression formatting
- Error handling (invalid syntax)

## Why TypeScript (not Racket)

Original project-map-tool used Racket. We rewrote in TypeScript for:
1. Single language consistency with phi
2. No external Racket dependency
3. Direct integration with phi's MCP server
4. Users only need Node/Bun

Output format remains identical to Racket version.
