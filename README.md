# φ (Phi)

Compositional project awareness via S-expressions. Claude Code plugin for persistent codebase understanding.

**Status:** ✅ Plugin validated. Infrastructure ready. Available for team distribution via GitHub marketplace.

## Quick Start

### Install via Claude Code

```bash
# In any Claude Code session:
/plugin marketplace add adimov-eth/phi
/plugin install phi@phi

# Restart Claude Code
# phi commands now available: /phi map, /phi analyze, etc.
```

See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for local setup and [TEAM_DISTRIBUTION.md](./TEAM_DISTRIBUTION.md) for team sharing.

## What is this?

**φ = ∫(structure × semantics × memory)**

Persistent project awareness through three integrated layers:
1. **Structure** (deterministic): PROJECT-MAP.auto.scm with AST, exports, imports
2. **Semantics** (curated): PROJECT-MAP.scm with architecture, patterns, known issues
3. **Memory** (learned): Vessel cross-session insights and relief-guided patterns

**Tools:**
- **Ψ (Psi - discover)**: Compositional filesystem queries
- **~ (Tilde - act)**: Atomic batch operations

**Commands:**
- `/phi analyze`: Quick/full project analysis
- `/phi map`: Generate/update PROJECT-MAPs
- `/phi context`: Load complete project context
- `/phi agents`: Discover project-specific agents

**Skills:**
- phi-analyzer: Auto-invoked project context
- phi-mapper: Auto-invoked PROJECT-MAP generation

**Examples:**
- See `examples/project-agent-template.md` for creating project-specific agents

## Quick Start

See [PLUGIN_INSTALL.md](./PLUGIN_INSTALL.md) for complete installation instructions.

## Installation as Claude Code Plugin

### 1. Clone and Build

```bash
git clone https://github.com/adimov-eth/phi
cd phi
bun install
bun run build
```

### 2. Run the Server

```bash
cd packages/periphery
node dist/http-server.js
```

Server runs on `http://localhost:7777` by default.

### 3. Configure Claude Code Plugin

Create `~/.config/claude/plugins/phi.json`:

```json
{
  "name": "phi",
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

(Change API key via `PERIPHERY_API_KEY` env var)

### 4. Restart Claude Code

Tools `mcp__periphery__discover` and `mcp__periphery__act` will be available.

## Features

### Session Persistence
- Server restarts are transparent to clients
- Sessions stored to tmpdir/periphery-sessions.json
- No reconnection needed after crashes

### S-Expression Composition
- Code = Data = S-expressions
- Fantasy Land combinators (fmap, chain, filter, compose)
- Point-free transformation pipelines

### Type Safety
- Full TypeScript implementation
- Zod schema validation for actions
- Batch operations with ValidateAllExecuteAny semantics

## Packages

- **@agi/arrival**: S-expression serialization with LIPS Scheme interpreter
- **@agi/periphery**: MCP server framework + filesystem tools
- **@agi/project-mapper**: TypeScript AST extraction → PROJECT-MAP.auto.scm generation

## Environment Variables

- `PORT`: Server port (default: 7777)
- `PERIPHERY_API_KEY`: Authentication token
- `MCP_SERVER_URL`: Public URL for server (for tunnels)

## Development Status

**What works (verified):**
- ✓ CLI tool generates clean S-expressions (tested on XLN: 142 files → 2033 lines)
- ✓ TypeScript/JavaScript/Solidity/Python extraction
- ✓ 13 unit tests passing
- ✓ arrival integration for S-expression formatting
- ✓ Plugin structure follows Claude Code spec
- ✓ All frontmatter present (YAML for skills, description for commands)

**What's untested:**
- ⚠ Claude Code skill auto-discovery (phi-analyzer, phi-mapper)
- ⚠ Command registration (`/phi map`, `/phi analyze`, etc.)
- ⚠ MCP server integration with plugin system
- ⚠ Skill invocation when context matches

**To validate:**
```bash
# Test plugin loads
cd /some/test/project
claude
/plugin install phi  # or however local plugins load
/phi map             # Should invoke phi-mapper skill
# Verify skills appear in Claude's available capabilities
```

**Architecture is sound. Integration layer needs observation, not assumption.**

## License

MIT
