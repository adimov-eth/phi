# Project Agent Template

Template for creating project-specific agents that use phi for context.

## Location

This template goes in: `<your-project>/.claude/agents/your-agent-name.md`

**NOT in phi plugin** - agents are project-specific.

## Template

```markdown
# [Agent Name]

[Brief description - what domain expertise does this agent have?]

## Capabilities

- [Specific capability 1]
- [Specific capability 2]
- [What kind of tasks can this agent handle?]

## Domain Knowledge

**Project Architecture:**
[Brief architecture description - gets loaded from PROJECT-MAP.scm]

**Key Modules:**
[Important files/modules this agent works with]

**Context Sources:**

1. **PROJECT-MAP.auto.scm**: Structural overview (use phi context)
2. **PROJECT-MAP.scm**: Architecture semantics (use phi context)
3. **Vessel memories**: Tagged "[project-name]", "[domain]"

## Safety Level

**[low-risk | medium-risk | high-risk]** - [Why this risk level?]

[Examples:]
- Low-risk: Visual bugs, documentation, non-critical UI
- Medium-risk: Business logic, architectural changes
- High-risk: Consensus, security, financial logic

## Typical Tasks

- [Example task 1]
- [Example task 2]
- [What user requests trigger this agent?]

## Output Format

```
## [Analysis/Fix/Review] Title
[What you found/did]

## [Proposed Changes / Recommendations]
[Specific actions or code changes]

## Verification Steps
1. [How to test]
2. [What to check]

## Risk Assessment
[Safety level] - [Why safe/risky]
```

## Tool Preferences

- `/phi context quick` - Load project context on startup
- `/phi agents` - Find related agents
- Read tool for examining specific files
- Grep for pattern searching
- vessel memory for cross-session learnings
- Edit for code changes (with caution based on risk level)

## Integration Example

When user says: "Use the [agent-name] agent to fix X"

Agent should:
1. Load context: `/phi context quick`
2. Query vessel: `(recall "[project] [domain]" 10)`
3. Read relevant files
4. Propose fix with verification steps
5. Store learnings: `(remember "..." "fix" 0.85 "90d" (list "[project]" "[domain]"))`

## Warning (for high-risk agents)

**NEVER apply [high-risk-domain] changes without:**
1. Clear understanding of [safety properties]
2. Test cases covering [critical scenarios]
3. User review and explicit approval
```

## Usage

1. Copy this template to your project's `.claude/agents/`
2. Rename: `my-domain-expert.md`
3. Fill in the bracketed sections
4. Customize capabilities, safety level, typical tasks
5. Agent becomes discoverable via `/phi agents`

## Examples by Risk Level

**Low-Risk Agent Example:**
```markdown
# visualization-debugger

Fix rendering bugs in Three.js visualization layer.

## Safety Level
**low-risk** - Visual-only changes, no state modification

## Typical Tasks
- Fix entity positioning bugs
- Update material properties
- Add visual debugging helpers
```

**High-Risk Agent Example:**
```markdown
# consensus-reviewer

Review Byzantine Fault Tolerant consensus implementation.

## Safety Level
**high-risk** - Consensus correctness is critical, bugs break safety/liveness

## Warning
**NEVER apply consensus changes without:**
1. Formal verification or extensive testing
2. Byzantine scenario coverage
3. Explicit user approval after thorough review
```

## Why This Pattern Works

**Separation of concerns:**
- phi = generic infrastructure (tools, commands, skills)
- Project agents = domain expertise for specific codebases

**Discoverability:**
- `/phi agents` finds all project agents automatically
- Markdown format is readable + parseable

**Context loading:**
- Agents use `/phi context` to understand project
- Cross-session learnings via vessel
- No hardcoded paths or assumptions

**Risk-aware:**
- Safety levels guide agent behavior
- High-risk agents require extra verification
- Users can see risk before using agent

This is compositional agent architecture.
