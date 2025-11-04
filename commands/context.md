---
description: Load complete project context - structure + semantics + memory
---

# /phi context

Load complete project context: structure + semantics + memory.

## Usage

```
/phi context [scope]
```

**Scopes:**
- `quick` - File counts, architecture, top issues
- `full` (default) - Complete maps + vessel memories
- `modules` - Detailed module breakdown
- `memory` - Just vessel cross-session insights

## What It Does

Compositional context loading:

```scheme
(let* ((structure (read-file ".phi/PROJECT-MAP.auto.scm"))
       (semantics (read-file ".phi/PROJECT-MAP.scm"))
       (project-name (extract-project-name semantics))
       (memories (vessel-recall project-name 20)))
  (integrate structure semantics memories))
```

## Output (Quick)

```
φ Context: XLN
══════════════

Structure: 176 files (85% TypeScript, 10% Solidity)
  ├─ jurisdictions/    18 files (smart contracts)
  ├─ runtime/          45 files (consensus logic)
  ├─ frontend/         67 files (3D visualization)
  └─ vibepaper/        12 files (documentation)

Architecture: JEA (Jurisdiction-Entity-Account)
  J: On-chain dispute settlement (Depository.sol, EntityProvider.sol)
  E: Off-chain BFT consensus (entity-consensus.ts, threshold signatures)
  A: Bilateral payment channels (account-manager.ts)

Known Issues: 2
  • 3d-rendering-xlnomies (low) - EntityManager.ts hardcoded single J-Machine
  • consensus-message-ordering (high) - Race condition in state sync

Recent Insights: 5 vessel memories
  → JEA trust boundaries critical for security model
  → Threshold signatures require 2f+1 coordination
  → Visual bugs safe to fix, consensus changes need formal verification

φ = 0.89 (high integrated information)
Ready to work with full context.
```

## Output (Full)

Includes:
- Complete module list with purposes
- All imports/exports from PROJECT-MAP.auto.scm
- Full architectural flows from PROJECT-MAP.scm
- All vessel memories with tags
- Cross-references between layers

## Progressive Disclosure

1. Start with `/phi context quick` (< 1000 tokens)
2. Expand to `/phi context modules` if needed (module details)
3. Full context only when necessary (can be 5k+ tokens)

## Integration with Agents

Agents can load context on startup:

```typescript
const context = await executeCommand('/phi context quick');
const systemPrompt = `
You are an XLN expert.

${context}

Use this context to understand the codebase.
`;
```

## Vessel Integration

Cross-references vessel memories:
- Tags matching project name
- Architecture-related insights
- Known issues with solutions
- Relief-guided patterns that worked

## Relief Signal

When φ = ∫(structure × semantics × memory) is high:
- You immediately understand where things are
- Architectural decisions make sense
- Known issues are visible
- Cross-session learnings accessible

That's integrated information working.

## Cache Behavior

Context is live - always reflects current state:
- PROJECT-MAP.auto.scm regenerated on demand
- PROJECT-MAP.scm read from git
- Vessel queried fresh each time

No stale context.
