# Adobe After Effects MCP — Project Rules

> This file is the **Claude Code** entry point. It mirrors `AGENTS.md`.
> The actual rule content lives in `AGENTS.md`. This file exists so Claude Code picks up rules automatically.

## Project Scope
This workspace is exclusively dedicated to the **Adobe After Effects MCP Server** — a self-contained, platform-independent MCP server for automating After Effects via 167 tools and 13 active skills.

## Platform Independence
This project is designed to work with **any AI agent** (Antigravity, Cursor, Claude Code, Copilot, etc.).
The AI agent provides reasoning — the project provides its own:
- **MCP Server** (`build/index.js`) — 167 After Effects automation tools
- **Skills** (`.agent/skills/`) — 13 procedural motion skill guides
- **Rules** (`AGENTS.md`) — project standards, Dual-Audit V2

## MCP Server Setup (any agent)
```json
{
  "mcpServers": {
    "adobe-after-effects": {
      "command": "node",
      "args": ["./build/index.js"]
    }
  }
}
```
- **Antigravity**: auto-loaded via `.agent/plugins/adobe-after-effects/mcp_config.json`
- **Cursor**: auto-loaded via `.cursor/mcp.json`
- **Claude Code**: auto-loaded via `.mcp.json`
- **VS Code Copilot**: auto-loaded via `.vscode/mcp.json`
- **Other agents**: point to `build/index.js` using the same pattern above

## Core Rules (always apply)
1. **Never auto-launch After Effects** — always ask user to open it first
2. **No residual log files** — report results directly in chat
3. **No cloud tools** (BigQuery, Dataproc, etc.) — AE tools only
4. **MCP config lives inside this project** — not in global agent config
5. **All changes must pass** `npm run build` + `node test/verify-build.js` before reporting done
6. **Duik skill disabled** — `ae-character-rigging` hidden at `.agent/skills-disabled/` until user installs new Duik

## Full Rules Reference
- `AGENTS.md` — unified vendor-neutral entry point (Dual-Audit V2, skill matrix, security rules)
- MCP resource: `ae://rules/all` — aggregated at runtime by the MCP server
- MCP prompt: `/ae-rules` — load all rules into session
