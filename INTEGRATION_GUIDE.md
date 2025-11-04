# φ (Phi) - Local Project Integration Guide

How to use phi plugin in other projects on your local machine.

## Prerequisites

1. **Periphery server must be running:**
   ```bash
   cd /Users/adimov/Developer/phi/packages/periphery
   node dist/http-server.js
   # Server runs on http://localhost:7777
   ```

2. **Phi packages built:**
   ```bash
   cd /Users/adimov/Developer/phi
   bun run build
   ```

## Method 1: Per-Session Loading (Temporary)

Use `--plugin-dir` to load phi for a single Claude session:

```bash
cd /path/to/your/project

# Load phi plugin for this session only
claude --plugin-dir /Users/adimov/Developer/phi

# Or use in a specific prompt
echo "Analyze this project structure" | claude --plugin-dir /Users/adimov/Developer/phi
```

**Pros:**
- No installation required
- Per-project control
- Easy testing

**Cons:**
- Must specify path every time
- ⚠️ **Current issue:** Plugin not discovering via --plugin-dir (under investigation)

## Method 2: Symlink to Plugins Directory (Recommended)

Create a symlink so phi is always available:

```bash
# Create symlink in Claude's plugins directory
ln -s /Users/adimov/Developer/phi ~/.claude/plugins/phi

# Restart any active Claude sessions
# Plugin should now be available globally
```

**Verify installation:**
```bash
claude
# In session, type: /help
# Should see /phi commands listed
```

**Pros:**
- Available in all projects
- No --plugin-dir needed
- Survives restarts

**Cons:**
- Global installation
- Need to restart Claude after creating symlink

## Method 3: Agent SDK (Programmatic)

Load phi programmatically via TypeScript/JavaScript:

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "Analyze project structure and create PROJECT-MAP",
  options: {
    cwd: "/path/to/your/project",
    plugins: [
      { type: "local", path: "/Users/adimov/Developer/phi" }
    ]
  }
})) {
  if (message.type === "assistant") {
    console.log(message.content);
  }
}
```

**Use cases:**
- Automated workflows
- CI/CD integration
- Custom tooling

## Method 4: Project-Specific .mcp.json

Add phi's MCP server to your project's `.mcp.json`:

```json
{
  "mcpServers": {
    "periphery": {
      "url": "http://localhost:7777/mcp",
      "transport": "streamable-http",
      "headers": {
        "periphery_api_key": "prph-5f27cd471eb9648c0a3081aa4df7900eb05aa167804b21fe78fb59e6427cae74"
      }
    }
  }
}
```

This gives your project access to:
- `mcp__periphery__discover` - S-expression filesystem queries
- `mcp__periphery__act` - Batch filesystem mutations

**Without plugin commands/skills** - just the MCP tools.

## Using Phi in Your Project

Once integrated, phi provides:

### Commands (User-Invoked)

```bash
/phi map              # Generate PROJECT-MAP.auto.scm
/phi analyze          # Analyze project (structure + semantics + memory)
/phi context quick    # Fast project overview
/phi context full     # Complete context with memories
/phi agents           # List project-specific agents
```

### Skills (Auto-Invoked)

Skills activate automatically when Claude detects relevant context:

- **phi-analyzer** - Triggers on: "project structure", "codebase overview", "architecture"
- **phi-mapper** - Triggers on: project mapping requests

### MCP Tools (Always Available)

```bash
# Claude can use these tools automatically:
mcp__periphery__discover  # Query filesystem via S-expressions
mcp__periphery__act       # Batch file operations
```

## Project Structure Phi Creates

When you run `/phi map` in a project:

```
your-project/
├── .phi/
│   ├── PROJECT-MAP.auto.scm     # Auto-generated structure
│   └── PROJECT-MAP.scm           # Human-curated (optional)
└── .mcp.json                     # MCP server config (if added)
```

### PROJECT-MAP.auto.scm

Auto-generated via AST extraction:

```scheme
(project-map
  (auto-generated true)
  (root "/path/to/your-project")
  (files 42)
  (modules
    (module "src/index.ts"
      (language typescript)
      (exports
        (export main function)
        (export Config class))
      (imports
        (import "./utils" namespace (parseArgs)))
      (line-count 156))))
```

**DO NOT edit manually** - regenerate with `/phi map --force`

### PROJECT-MAP.scm

Optional human-curated semantics:

```scheme
(project
  (architecture "MVC")
  (description "Web app with Express backend, React frontend")

  (layer backend
    (purpose "API server and business logic")
    (modules
      (module "src/api/routes.ts"
        (purpose "REST endpoint definitions"))))

  (known-issues
    (issue "auth-refresh-race"
      (severity medium)
      (location "src/auth/token.ts:45")
      (description "Token refresh can race with API calls"))))
```

**DO edit this** - add architectural knowledge, patterns, known issues.

## Workflow Example

**Scenario:** Analyzing a new codebase

```bash
cd /path/to/unfamiliar-project

# Start Claude with phi
claude --plugin-dir /Users/adimov/Developer/phi

# Or if symlinked:
claude
```

**In Claude session:**
```
> /phi map
Generating PROJECT-MAP.auto.scm...
✓ Scanned 142 files
✓ Generated .phi/PROJECT-MAP.auto.scm

> /phi analyze
📊 Project Analysis:
- TypeScript (65%), JavaScript (30%), Python (5%)
- 142 files, ~12,000 LOC
- Architecture: Microservices (3 services)
- Known patterns: Event-driven, REST APIs
...

> /phi context full
[Loads complete project context]

> Now explain the authentication flow
[Claude uses PROJECT-MAP + vessel memories to explain]
```

## Troubleshooting

### "Commands not available"

**Check:**
1. Periphery server running? `curl http://localhost:7777/health`
2. Plugin validated? `cd /Users/adimov/Developer/phi && claude plugin validate .`
3. Symlink created? `ls -la ~/.claude/plugins/phi`

### "MCP tools not working"

**Check:**
1. Server running on :7777
2. `.mcp.json` in project root with correct API key
3. API key matches server: `prph-5f27cd471eb9648c0a3081aa4df7900eb05aa167804b21fe78fb59e6427cae74`

### "Plugin not loading via --plugin-dir"

**Known issue** - under investigation. Use symlink method instead:
```bash
ln -s /Users/adimov/Developer/phi ~/.claude/plugins/phi
```

## Advanced: Vessel Memory Integration

Phi integrates with vessel for cross-session project memories.

**When you analyze projects:**
- Architectural insights stored
- Bug patterns remembered
- Relief-guided discoveries persist

**Next session benefits:**
- "Last time we found X pattern in Y module"
- Known issues recalled automatically
- Context builds over time

## Security Note

**API Key in .mcp.json:**

Current key: `prph-5f27cd471eb9648c0a3081aa4df7900eb05aa167804b21fe78fb59e6427cae74`

- Server runs locally on :7777
- Key validates requests
- Safe for local development
- **Change via env var:** `PERIPHERY_API_KEY=your-key node dist/http-server.js`

**Don't commit** `.mcp.json` with API key to public repos. Add to `.gitignore`.

## Next Steps

1. **Try it:**
   ```bash
   ln -s /Users/adimov/Developer/phi ~/.claude/plugins/phi
   cd ~/some-project
   claude
   /phi map
   ```

2. **Customize:**
   - Edit PROJECT-MAP.scm with architectural notes
   - Create project-specific agents in `.claude/agents/`
   - Add domain-specific patterns

3. **Integrate:**
   - Add `.mcp.json` to projects you frequently work on
   - Create PROJECT-MAP.scm templates for common architectures
   - Build vessel memories over multiple sessions

---

**Status:** Infrastructure ready. Plugin validated. Symlink method recommended until --plugin-dir discovery is fixed.

~ :3
