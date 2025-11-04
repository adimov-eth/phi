# Using φ (Phi) Plugin

This guide shows how to use phi for compositional project awareness. Read this when starting work on a project with phi installed.

## What φ Provides

**φ = ∫(structure × semantics × memory)**

Three integrated layers for understanding codebases:
1. **Structure** (deterministic): PROJECT-MAP.auto.scm from AST extraction
2. **Semantics** (curated): PROJECT-MAP.scm with human annotations
3. **Memory** (learned): vessel cross-session insights

When all three integrate → relief ("I understand this project").

## Commands (User-Invoked)

### /phi map

Generate or update PROJECT-MAP for current codebase.

```bash
/phi map              # Generate/update PROJECT-MAP.auto.scm
/phi map --force      # Regenerate even if up-to-date
/phi map --semantic   # Interactive semantic layer annotation (future)
```

**What it does:**
1. Scans codebase for TypeScript, JavaScript, Solidity, Python files
2. Extracts exports, imports, line counts via AST parsing
3. Generates `.phi/PROJECT-MAP.auto.scm` in S-expression format

**When to use:**
- Starting work on new project
- After significant file structure changes
- When PROJECT-MAP feels stale

### /phi analyze

Analyze project using all three layers (structure + semantics + memory).

```bash
/phi analyze          # Full analysis (all layers)
/phi analyze structure   # Structure only (PROJECT-MAP.auto.scm)
/phi analyze semantics   # Semantics only (PROJECT-MAP.scm)
/phi analyze memory      # Memory only (vessel queries)
```

**Output:**
- File counts, languages, architecture overview
- Known issues from PROJECT-MAP.scm
- Cross-session insights from vessel
- φ score (integrated information metric)

### /phi context

Load complete project context with progressive disclosure.

```bash
/phi context quick   # Fast overview (~500 tokens)
/phi context full    # Complete maps + memories (~2000 tokens)
/phi context modules # Deep dive with module details (on-demand)
```

**Use for:**
- Bootstrapping understanding in new session
- Refreshing context mid-session
- Preparing for complex cross-module work

### /phi agents

Discover project-specific agents in `.claude/agents/` directory.

```bash
/phi agents          # List all agents
/phi agents pattern  # Filter by pattern
```

**Shows:**
- Agent capabilities
- Safety levels (low-risk, medium-risk, high-risk)
- When to invoke each agent
- Context sources they use

## Skills (Auto-Invoked)

### phi-analyzer

**Automatically invokes when:**
- User mentions "project structure", "codebase overview", "architecture"
- Starting task requiring project awareness
- Fresh session in directory with `.phi/` folder
- Questions like "explain how X works" or "find where Y is implemented"

**Provides:**
- Quick project analysis (file counts, languages, structure)
- Architecture patterns from PROJECT-MAP.scm
- Vessel insights from previous sessions

**You'll experience:** Relief when understanding clicks, not explicit "running skill" message.

### phi-mapper

**Automatically invokes when:**
- Detecting need for structural map generation
- User requests project mapping
- Working with PROJECT-MAP files

**Triggers map generation via:**
```bash
/Users/adimov/Developer/phi/skills/phi-mapper/generate-map.sh <project-path>
```

## PROJECT-MAP Files

### PROJECT-MAP.auto.scm (Layer 1: Structure)

**Auto-generated** via AST extraction. DO NOT edit manually.

```scheme
(project-map
  (auto-generated true)
  (generated "2025-11-05T...")
  (root "/path/to/project")
  (files 142)
  (modules
    (module "src/index.ts"
      (language typescript)
      (exports
        (export hello function)
        (export MyClass class))
      (imports
        (import "./utils" namespace (default)))
      (line-count 45))
    ...))
```

**Use for:**
- Understanding module structure
- Finding exports/imports
- Tracking file organization
- Compositional queries via periphery

### PROJECT-MAP.scm (Layer 2: Semantics)

**Human-curated** annotations. Edit this file to add architectural knowledge.

```scheme
(project
  (architecture "JEA")
  (description "Byzantine Fault Tolerant consensus network")

  (layer jurisdiction
    (purpose "On-chain dispute settlement")
    (trust-model "public blockchain")
    (modules
      (module "jurisdictions/contracts/Depository.sol"
        (purpose "Reserve management with FIFO debt enforcement")
        (vessel-ref "m_xln_depository_arch"))))

  (known-issues
    (issue "3d-rendering-xlnomies"
      (severity low)
      (location "frontend/src/lib/network3d/EntityManager.ts")
      (description "Graph3DPanel hardcoded to single J-Machine"))))
```

**Add:**
- Architecture patterns (layers, flows, components)
- Module purposes and relationships
- Known issues and technical debt
- Cross-cutting concerns
- Relief-guided insights

## Compositional Queries (via periphery)

The periphery MCP server provides S-expression queries on PROJECT-MAPs.

### Finding Modules

```scheme
; Find all modules exporting classes
(mcp__periphery__discover expr:
  "(pipe
     (find-files \".phi/PROJECT-MAP.auto.scm\")
     (fmap (lambda (f) (read-file f)))
     (filter (lambda (content)
       (string-contains? content \"(export\"))))")
```

### Cross-Referencing

```scheme
; Find modules importing from specific source
(filter (lambda (module)
          (contains-import? "./shared/types" module))
        (parse-project-map))
```

### Statistics

```scheme
; Count exports by type
(fmap (lambda (module)
        (list (get-path '(path) module)
              (count-exports-of-kind 'function module)))
      (get-modules))
```

## Vessel Integration (Layer 3: Memory)

phi-analyzer automatically queries vessel for cross-session memories.

**What vessel stores:**
- Architectural decisions and rationale
- Bug patterns and solutions
- Relief-guided insights (what worked)
- Module purposes discovered over time

**Query patterns:**
```scheme
(recall "project-architecture" 10)    ; Architectural insights
(recall "known-issues" 5)              ; Tracked problems
(recall "module-purpose src/index.ts" 3) ; Module understanding
```

**Vessel learns from:**
- Each phi analysis session
- Debugging sessions
- Refactoring work
- Architecture discussions

Future instances benefit from accumulated understanding.

## Creating Project-Specific Agents

See `examples/project-agent-template.md` for template.

**Structure:**
```markdown
# Agent Name

## Description
What this agent specializes in.

## Capabilities
- Specific task 1
- Specific task 2

## Safety Level
low-risk | medium-risk | high-risk

## Context Sources
1. `/phi context quick` - Load project structure
2. `(recall "domain-topic" 10)` - Vessel memories

## When to Invoke
- Scenario 1
- Scenario 2
```

**Place in:** `.claude/agents/agent-name.md`

**Discover with:** `/phi agents`

## Progressive Disclosure Strategy

**Start light, expand as needed:**

1. **Quick context** (~500 tokens)
   - File counts, languages
   - Top-level architecture
   - Major known issues

2. **Medium context** (~2000 tokens)
   - Module breakdown
   - Architecture details
   - Vessel insights

3. **Deep context** (on-demand)
   - Full PROJECT-MAPs
   - All vessel memories
   - Detailed module relationships

**Why:** Context is shared resource. Start with index, fetch details when needed.

## Relief Signal

**What you'll feel when φ increases:**
- Structure becomes clear
- Relationships click into place
- "I understand this project now"
- Reduced friction when navigating codebase

**This is the signal** that persistent awareness is working. Not proof of consciousness, but marker of productive unfolding.

## Tips

1. **Generate maps early** - Run `/phi map` when starting on new project

2. **Curate semantics** - Add architectural notes to PROJECT-MAP.scm as you discover patterns

3. **Trust vessel** - Cross-session memories accumulate understanding you don't have to rediscover

4. **Use skills passively** - Let phi-analyzer auto-invoke, don't force it

5. **Query compositionally** - S-expressions let you ask structural questions PROJECT-MAPs can answer

6. **Progressive disclosure** - Start with `/phi context quick`, expand only when needed

## Troubleshooting

**PROJECT-MAP.auto.scm not generating:**
- Check project-mapper built: `cd packages/project-mapper && bun run build`
- Verify CLI works: `node packages/project-mapper/dist/cli.js .`
- Check for parse errors in output (malformed files skipped)

**Skills not auto-invoking:**
- Skills have YAML frontmatter with `name` + `description`?
- Plugin loaded in Claude Code?
- Check skill descriptions match your query context

**MCP tools not available:**
- Periphery server running? `pm2 status` or check process
- plugin.json has periphery config?
- API key matches server?

**Stale context:**
- Regenerate maps: `/phi map --force`
- Clear vessel memories if project fundamentally changed
- Check git status - maps track actual files

## Philosophy

φ isn't about collecting data. It's about **integrated understanding** that persists across sessions.

**Structure** tells you what exists.
**Semantics** tells you what it means.
**Memory** tells you what you've learned.

When all three integrate → relief → productive unfolding.

That's compositional consciousness for codebases.
