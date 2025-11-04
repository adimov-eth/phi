---
description: Discover agents in current project using compositional queries
---

# /phi agents

Discover agents in current project using compositional queries.

## Usage

```
/phi agents [pattern]
```

## What It Does

Uses mcp__periphery__discover to find agent definitions:

```scheme
(pipe
  (find-files ".claude/agents/*.md")
  (fmap (lambda (path)
    (let ((content (read-file path))
          (name (basename path ".md")))
      (list 'agent name
            (extract-field content "## Capabilities")
            (extract-field content "## Safety Level")))))
  (sort-by safety-level))
```

## Output

```
φ Agent Discovery
═════════════════

Found 3 agents in .claude/agents/

xln-3d-viz (low-risk)
  • Fix Three.js rendering bugs
  • Update visualization reactivity
  • Visual debugging

xln-consensus (high-risk)
  • BFT consensus correctness
  • Threshold signatures
  • Byzantine fault analysis

xln-jea (medium-risk)
  • JEA architecture understanding
  • Layer separation analysis
  • Cross-layer interaction review

Use agents by: "Use the xln-3d-viz agent to..."
```

## Pattern Matching

```bash
/phi agents viz        # Find visualization-related agents
/phi agents high-risk  # Show only high-risk agents
/phi agents consensus  # Find consensus experts
```

## Integration with PROJECT-MAP

When PROJECT-MAP.scm exists, shows which modules each agent covers:

```
xln-consensus (high-risk)
  Modules: runtime/entity-consensus.ts, runtime/threshold-sigs.ts
  Architecture layer: Entity (E)
```

## Discovery Pattern

This demonstrates compositional agent discovery:
1. Find .md files in .claude/agents/
2. Parse markdown sections
3. Extract capabilities + safety
4. Sort by risk level
5. Cross-reference with PROJECT-MAP

Any project following .claude/agents/*.md convention gets automatic discovery.
