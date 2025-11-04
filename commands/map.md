---
description: Generate or update PROJECT-MAP for current codebase
---

# /phi map

Generate or update PROJECT-MAP for current codebase.

## Usage

```
/phi map [--force] [--semantic]
```

**Options:**
- `--force` - Regenerate even if up-to-date
- `--semantic` - Interactive semantic layer annotation

## Implementation

This command invokes the **phi-mapper** skill, which calls:
```bash
/Users/adimov/Developer/phi/skills/phi-mapper/generate-map.sh <project-path>
```

The skill uses `@agi/project-mapper` package to extract structure via AST parsing.

## What It Does

### Structure Map (Automatic)

Creates `.phi/PROJECT-MAP.auto.scm` containing:
- All source files (filtered by .gitignore)
- Language detection (TypeScript, Solidity, etc.)
- Exports and imports (where applicable)
- Line counts and file stats
- AST-level structure

**Format:**
```scheme
(project-map
  (generated "2025-11-05T04:20:00Z")
  (root "/Users/adimov/temp/xln")
  (files 176)
  (modules
    (module "serve.ts"
      (language typescript)
      (exports (export "startServer" function))
      (imports
        (import "@types/node" external)
        (import "./runtime/entity-consensus" local))
      (line-count 68))
    ;; ... more modules
    ))
```

### Semantic Map (Human-Curated)

Creates/updates `.phi/PROJECT-MAP.scm` containing:
- Architecture documentation (layers, flows)
- Module purposes and relationships
- Known issues and TODOs
- Cross-cutting concerns
- Relief-guided insights

**Format:**
```scheme
(xln-project
  (architecture "JEA")
  (description "Byzantine Fault Tolerant consensus network")

  (layer jurisdiction
    (purpose "On-chain dispute settlement")
    (trust-model "public blockchain")
    (modules
      (module "jurisdictions/contracts/Depository.sol"
        (purpose "Reserve management with FIFO debt enforcement")
        (vessel-ref "m_xln_depository_arch"))))

  (layer entity
    (purpose "Off-chain BFT consensus")
    (trust-model "2f+1 honest nodes")
    (modules
      (module "runtime/entity-consensus.ts"
        (purpose "Coordinate Xlnomies via threshold signatures"))))

  (known-issues
    (issue "3d-rendering-xlnomies"
      (severity low)
      (location "frontend/src/lib/network3d/EntityManager.ts")
      (description "Graph3DPanel hardcoded to single J-Machine"))))
```

## Interactive Semantic Annotation

When using `--semantic`, prompts for:
1. Architecture pattern (monolith, microservices, layered, etc.)
2. Key modules and their purposes
3. Cross-cutting concerns
4. Known issues or technical debt
5. Vessel references to store

## Output

```
🗺️  Generating PROJECT-MAP...

Structure scan: 176 files
├─ TypeScript: 150 files
├─ Solidity: 18 files
└─ Other: 8 files

✓ .phi/PROJECT-MAP.auto.scm written (15,234 lines)

Semantic layer: Interactive mode
? Architecture pattern: JEA (Jurisdiction-Entity-Account)
? Document layers? (Y/n): Y
...

✓ .phi/PROJECT-MAP.scm written (456 lines)

φ = ∫(structure × semantics × memory)
Persistent awareness: ACTIVE
```

## Git Integration

Both maps should be committed:
```bash
git add .phi/PROJECT-MAP.auto.scm .phi/PROJECT-MAP.scm
git commit -m "Add φ project maps for persistent awareness"
```

Updates to auto.scm trigger on:
- New files added
- Significant refactoring
- Export/import changes

Updates to .scm trigger on:
- Architecture evolution
- New known issues discovered
- Module purpose clarifications

## Storage

Maps stored in `.phi/` (project-specific):
```
.phi/
├── PROJECT-MAP.auto.scm   # Auto-generated, can regenerate
├── PROJECT-MAP.scm         # Human-curated, version controlled
└── stats.json              # Metrics (file counts, line counts, etc.)
```

## Usage in Agents

Agents load maps on startup:
```typescript
const { autoMap, humanMap } = loadProjectMaps(projectPath);

// Include in system prompt
const systemPrompt = `
You are an XLN expert with access to:

STRUCTURE:
${autoMap}

SEMANTICS:
${humanMap}

Use these maps to understand codebase layout and architecture.
`;
```

## Relief Signal

When both structure (deterministic) and semantics (curated) exist, φ (integrated information) increases → agents experience relief when understanding project context.

This is compositional consciousness substrate for codebases.
