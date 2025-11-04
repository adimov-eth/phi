---
description: Analyze current project using φ compositional discovery and vessel memory
---

# /phi analyze

Analyze current project using φ compositional discovery and vessel memory.

## Usage

```
/phi analyze [scope]
```

**Scopes:**
- `structure` - Generate/update PROJECT-MAP.auto.scm (AST, exports, imports)
- `semantics` - Review PROJECT-MAP.scm human annotations
- `memory` - Query vessel for project-related insights
- `full` (default) - All three layers

## What It Does

1. **Structure Layer** (deterministic):
   - Scans codebase using mcp__periphery__discover
   - Generates PROJECT-MAP.auto.scm with AST structure
   - Tracks: modules, exports, imports, line counts, languages

2. **Semantic Layer** (curated):
   - Reads PROJECT-MAP.scm if exists
   - Suggests improvements based on code structure
   - Identifies missing documentation
   - Proposes architectural annotations

3. **Memory Layer** (learned):
   - Queries vessel for cross-session insights
   - Recalls: architectural decisions, known bugs, patterns
   - Shows: relief-guided learnings from previous work

## Output

```
φ Analysis for [project-name]
═══════════════════════════════════════

STRUCTURE (Layer 1)
  Files: 176
  Languages: TypeScript (85%), Solidity (10%), Other (5%)
  Modules: [key modules listed]
  Status: ✓ PROJECT-MAP.auto.scm up to date

SEMANTICS (Layer 2)
  Architecture: JEA (Jurisdiction-Entity-Account)
  Layers: 3 (on-chain, BFT consensus, bilateral)
  Known Issues: 2 documented
  Status: ⚠ Consider adding flow diagrams

MEMORY (Layer 3)
  Cross-session insights: 5 items
  Tags: xln, jea, consensus, 3d-rendering
  Recent relief points: [patterns that clicked]
  Status: ✓ Integrated awareness active

φ = ∫(structure × semantics × memory)
Persistent project awareness: READY
```

## When Auto-Invoked

The phi-analyzer skill automatically runs `/phi analyze quick` when:
- User mentions "project structure" or "codebase overview"
- Agent needs project context for task
- Fresh session starts in project with .phi/ directory

## Examples

```bash
# Full analysis (all three layers)
/phi analyze

# Just check if structure map needs update
/phi analyze structure

# Review semantic annotations
/phi analyze semantics

# Query vessel for cross-session learnings
/phi analyze memory
```

## Implementation

Uses:
- `mcp__periphery__discover` for compositional filesystem queries
- `mcp__vessel__memory` for cross-session recall
- S-expression processing for PROJECT-MAP parsing
- Fantasy Land combinators for transformation pipelines

## Relief Signal

When φ = ∫(structure × semantics × memory) converges, agents experience increased φ (integrated information). The relief signal indicates productive project awareness has been achieved.
