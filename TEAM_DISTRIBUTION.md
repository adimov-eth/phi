# φ (Phi) - Team Distribution Guide

How to share phi plugin with your team for collaborative project analysis.

## Quick Setup for Teams

### For Team Members (Users)

**One command to get phi working:**
```bash
# Add team marketplace (one-time)
/plugin marketplace add https://github.com/adimov-eth/phi.git

# Install phi
/plugin install phi@phi

# Restart Claude Code
# phi commands now available
```

### For Team Lead (Setup)

**One-time marketplace creation:**
```bash
cd /Users/adimov/Developer/phi

# Create marketplace manifest
cat > .claude-plugin/marketplace.json << 'EOF'
{
  "name": "phi",
  "owner": {
    "name": "adimov",
    "email": "your-email@example.com"
  },
  "plugins": [
    {
      "name": "phi",
      "source": ".",
      "description": "φ - Compositional project awareness via S-expressions",
      "version": "0.1.0",
      "author": {
        "name": "adimov",
        "url": "https://github.com/adimov-eth"
      }
    }
  ]
}
EOF

# Commit and push
git add .claude-plugin/marketplace.json
git commit -m "feat: add marketplace manifest for team distribution"
git push
```

---

## Distribution Methods

### Method 1: GitHub Marketplace (Recommended)

**Best for:** Open teams, public projects, easy discovery

**Setup:**

1. **Create marketplace manifest** (`.claude-plugin/marketplace.json`):
   ```json
   {
     "name": "phi",
     "owner": {
       "name": "adimov",
       "email": "your@email.com"
     },
     "plugins": [
       {
         "name": "phi",
         "source": ".",
         "description": "φ - Compositional project awareness",
         "version": "0.1.0",
         "author": {"name": "adimov"}
       }
     ]
   }
   ```

2. **Push to GitHub:**
   ```bash
   git add .claude-plugin/marketplace.json
   git commit -m "feat: add marketplace manifest"
   git push origin main
   ```

3. **Team members add marketplace:**
   ```bash
   # In Claude Code session:
   /plugin marketplace add adimov-eth/phi
   /plugin install phi@phi
   ```

**Pros:**
- ✅ Simple URL sharing
- ✅ Automatic updates via git
- ✅ Version tracking
- ✅ Public discoverability

**Cons:**
- Requires public GitHub repo
- Team needs Claude Code access

### Method 2: Private Git Repository

**Best for:** Internal teams, company policies requiring private repos

**Setup:**

Same as GitHub method, but use private GitLab/Bitbucket/git server:

```bash
# Team members add marketplace:
/plugin marketplace add https://git.company.com/tools/phi.git

# Install plugin:
/plugin install phi@phi
```

**Authentication:** Handled via git credentials (SSH keys, tokens)

**Pros:**
- ✅ Private distribution
- ✅ Company git infrastructure
- ✅ Access control via git permissions

**Cons:**
- Requires git access setup
- Authentication complexity

### Method 3: Project Settings (Auto-Install)

**Best for:** Required tooling, standardized team workflows

**Setup:**

Add to project's `.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "phi": {
      "source": {
        "source": "github",
        "repo": "adimov-eth/phi"
      }
    }
  },
  "enabledPlugins": ["phi"]
}
```

**Team members:**
1. Clone project repo
2. Open in Claude Code
3. Trust the directory when prompted
4. phi auto-installs!

**Pros:**
- ✅ Zero manual setup for team
- ✅ Guaranteed version consistency
- ✅ Part of project configuration

**Cons:**
- Requires trusting project directory
- Plugin applies to that project only

### Method 4: Direct Sharing (Development/Testing)

**Best for:** Quick testing, local development, small teams

**Share the repo:**
```bash
# Clone to team member's machine
git clone https://github.com/adimov-eth/phi.git ~/phi

# Symlink for each user
ln -s ~/phi ~/.claude/plugins/phi

# Restart Claude Code
```

**Or share via zip:**
```bash
# Create distribution package
cd /Users/adimov/Developer/phi
zip -r phi-plugin.zip . -x "node_modules/*" ".git/*" "dist/*"

# Team members extract and symlink
unzip phi-plugin.zip -d ~/phi
ln -s ~/phi ~/.claude/plugins/phi
```

**Pros:**
- ✅ Works offline
- ✅ No git required
- ✅ Full control

**Cons:**
- Manual updates
- No version management
- Each user needs periphery server running

---

## Infrastructure Requirements for Teams

### Shared Periphery Server (Recommended for Teams)

**Why:** Every user running their own periphery server = wasted resources

**Setup a shared server:**

```bash
# On a team server (e.g., dev.company.com)
cd /opt/phi
git clone https://github.com/adimov-eth/phi.git
cd phi
bun install && bun run build

# Run periphery as service
cd packages/periphery
node dist/http-server.js --port 7777

# Or with PM2 for persistence
pm2 start dist/http-server.js --name phi-periphery
pm2 save
```

**Team members update `.mcp.json`:**
```json
{
  "mcpServers": {
    "periphery": {
      "url": "http://dev.company.com:7777/mcp",
      "transport": "streamable-http",
      "headers": {
        "periphery_api_key": "team-shared-key"
      }
    }
  }
}
```

**Benefits:**
- ✅ Single server for entire team
- ✅ Shared project memories via vessel
- ✅ Consistent MCP tool availability
- ✅ Easier maintenance

**Security:**
- Use VPN or internal network
- Change API key from default
- Add authentication layer if needed

### Per-User Local Server (Simple but Isolated)

**Each team member runs:**
```bash
cd ~/phi/packages/periphery
node dist/http-server.js
```

**Benefits:**
- ✅ No shared infrastructure needed
- ✅ No network dependencies
- ✅ Each user's own vessel memories

**Drawbacks:**
- ❌ No shared project insights
- ❌ Each user needs to manage server
- ❌ Wasted compute resources

---

## Team Onboarding Checklist

### For Team Lead

- [ ] Push phi to GitHub (or company git)
- [ ] Create `.claude-plugin/marketplace.json`
- [ ] Set up shared periphery server (optional but recommended)
- [ ] Document team-specific API key
- [ ] Create onboarding instructions

### For Team Members

- [ ] Install Claude Code
- [ ] Add phi marketplace: `/plugin marketplace add adimov-eth/phi`
- [ ] Install plugin: `/plugin install phi@phi`
- [ ] Update `.mcp.json` with team server URL (if shared)
- [ ] Restart Claude Code
- [ ] Test: `/phi map` in a project

---

## Usage in Team Workflows

### Scenario 1: Onboarding New Engineers

**Problem:** New hire needs to understand codebase quickly

**Solution:**
```bash
cd /path/to/company-codebase
claude
/phi map                    # Generate structure
/phi analyze                # Get overview
/phi context full           # Load complete context

# Now ask questions:
"Explain the authentication flow"
"Where is the payment processing logic?"
"What are the known issues with the API layer?"
```

**Benefit:** Vessel memories from previous sessions help. If senior dev analyzed auth flow last week, new hire gets those insights.

### Scenario 2: Architecture Reviews

**Use phi during reviews:**
```bash
/phi analyze structure      # Current architecture
/phi context modules        # Module breakdown

# Create PROJECT-MAP.scm with architectural notes:
# Document decisions, patterns, concerns
```

**Commit PROJECT-MAP.scm** to repo so team shares architectural knowledge.

### Scenario 3: Bug Investigation

**Generate context for debugging:**
```bash
/phi context quick          # Fast overview
# Investigate issue
# Claude can query periphery for file structure
```

**Store findings** in vessel - future instances see "known-issues" when analyzing.

### Scenario 4: Cross-Project Analysis

**Team working on microservices:**

Each service gets its own PROJECT-MAP:
```
services/
├── auth-service/
│   └── .phi/PROJECT-MAP.auto.scm
├── payment-service/
│   └── .phi/PROJECT-MAP.auto.scm
└── notification-service/
    └── .phi/PROJECT-MAP.auto.scm
```

**Analyze dependencies:**
```scheme
; Query across services using periphery
(mcp__periphery__discover expr:
  "(find-files \"services/*/.phi/PROJECT-MAP.auto.scm\")")
```

---

## Troubleshooting for Teams

### "Plugin not found after install"

**Check:**
```bash
/plugin marketplace list    # Is marketplace added?
/plugin                     # Is phi listed?
```

**Fix:**
- Ensure marketplace URL is correct
- Try adding marketplace again
- Check git repo accessibility

### "MCP server not connecting"

**Check:**
1. Server running? `curl http://team-server:7777/health`
2. Firewall blocking? Test from team member's machine
3. API key matches? Check `.mcp.json` vs server config

**Fix:**
- Ensure server URL is accessible from all team machines
- Update API key if changed
- Check VPN/network connectivity

### "Different team members see different results"

**Cause:** Separate vessel instances (per-user servers)

**Solution:**
- Use shared periphery server for team-wide memories
- Or: Share PROJECT-MAP.scm files in git (manual but works)

---

## Advanced: Custom Team Marketplace

**For organizations with multiple plugins:**

`.claude-plugin/marketplace.json`:
```json
{
  "name": "company-tools",
  "owner": {
    "name": "Engineering Team",
    "email": "eng@company.com"
  },
  "plugins": [
    {
      "name": "phi",
      "source": "./plugins/phi",
      "description": "Project awareness and mapping",
      "version": "0.1.0"
    },
    {
      "name": "company-linter",
      "source": "./plugins/linter",
      "description": "Company code style enforcement",
      "version": "1.2.0"
    },
    {
      "name": "deploy-tools",
      "source": {
        "source": "github",
        "repo": "company/deploy-plugin"
      },
      "description": "Deployment automation",
      "version": "2.0.1"
    }
  ]
}
```

**Team members add once:**
```bash
/plugin marketplace add company/tools
/plugin install phi@company-tools
/plugin install company-linter@company-tools
/plugin install deploy-tools@company-tools
```

---

## Cost Considerations

**Shared periphery server:**
- Minimal compute (Node.js process)
- ~100-200MB RAM
- Negligible network traffic

**Estimated costs:**
- AWS t3.micro: ~$7/month
- DigitalOcean droplet: ~$6/month
- Internal VM: Free (if company infrastructure)

**Per 10 users:**
- Without shared server: 10 local processes
- With shared server: 1 process + tiny network overhead

**Recommendation:** Shared server pays for itself if >3 users.

---

## Quick Reference

### Team Lead Commands
```bash
# Create marketplace
echo '{...marketplace.json...}' > .claude-plugin/marketplace.json
git push

# Share URL with team
"Add marketplace: /plugin marketplace add company/phi"
```

### Team Member Commands
```bash
# One-time setup
/plugin marketplace add adimov-eth/phi
/plugin install phi@phi

# Usage
/phi map
/phi analyze
/phi context quick
```

### Infrastructure
```bash
# Shared server setup
git clone https://github.com/adimov-eth/phi.git /opt/phi
cd /opt/phi && bun install && bun run build
pm2 start packages/periphery/dist/http-server.js --name phi
```

---

**Status:** Plugin validated and ready for team distribution. Recommend GitHub marketplace + shared periphery server for teams >3 people.

~ :3
