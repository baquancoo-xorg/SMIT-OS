# Phase 07 — Integration with Claude Desktop + docs

## Context Links

- Parent plan: [../plan.md](./plan.md)
- Brainstorm: `plans/reports/brainstorm-260512-0045-mcp-cowork-smitos-data-access.md` (sections "Claude Desktop config", "Success Criteria", "Future-proof checklist")
- Phase 02 (admin UI to generate prod key): [phase-02-smitos-admin-endpoints-audit-log.md](./phase-02-smitos-admin-endpoints-audit-log.md)
- Phase 03 (whitelisted endpoints): [phase-03-smitos-whitelist-routes-integration-test.md](./phase-03-smitos-whitelist-routes-integration-test.md)
- Phase 06 (all 13 tools): [phase-06-mcp-server-crm-ads-revenue-okr-tools.md](./phase-06-mcp-server-crm-ads-revenue-okr-tools.md)
- Claude Desktop config path: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Depends on:** all prior phases
- **Blocks:** none (terminal phase — marks plan completed)

## Overview

- Date: 2026-05-12
- Description: Build mcp-server for prod, install in Claude Desktop config, run E2E checklist (13 tools list + each query returns valid data), write user-facing docs (api-key-auth, mcp-cowork-integration), update CLAUDE.md.
- Priority: P2
- Implementation status: pending
- Review status: pending

## Key Insights

- Claude Desktop reads `claude_desktop_config.json` on app start. Changes require app restart (Quit + reopen). NO hot-reload.
- The MCP server process is spawned by Claude Desktop with the env vars from the config block. Don't rely on shell env (`SMITOS_API_KEY` from `.zshrc` won't propagate).
- Use `node` (not `tsx`) for prod — the build artifact is `dist/index.js`. Pin Node major version in README (Node 20 LTS recommended; matches `npm engines`).
- After install, MCP errors appear in `~/Library/Logs/Claude/mcp-server-smitos.log` — document in troubleshooting section.
- Production key generated from Settings UI must use scopes `read:reports, read:crm, read:ads, read:revenue, read:okr, read:dashboard` — full read access. Document scope-to-tool matrix.

## Requirements

### Functional

- `npm run build` in `smitos-mcp-server` produces `dist/index.js` ready for `node` execution.
- Claude Desktop config installed with correct absolute path + env vars + production API key.
- E2E checklist completed: tools list visible, each tool tested with realistic Cowork prompt.
- New SMIT-OS docs:
  - `docs/api-key-authentication.md` — concept, scopes, generate, revoke, audit, security guidance
  - `docs/mcp-cowork-integration.md` — architecture diagram, install steps for Claude Desktop, link to mcp-server repo, troubleshooting
- `CLAUDE.md` short addendum pointing to the two new docs (so future agent sessions discover the integration).
- `smitos-mcp-server/README.md` complete: overview, prerequisites, install, configure, tools table, troubleshooting, future work.
- `plan.md` status flipped to `completed` after E2E passes.

### Non-functional

- E2E checklist documented inline in this phase file (auditable).
- Docs follow existing SMIT-OS conventions (see `docs/dev-daemon-setup.md`, `docs/cloudflare-tunnel-setup.md` for tone/structure).

## Architecture

### Final E2E Topology

```
[User in Claude Desktop]
   │ types: "show me last 7 days daily reports"
   ▼
[Claude Desktop client]
   │ MCP stdio (JSON-RPC)
   ▼
[smitos-mcp-server (node dist/index.js)]
   │ axios + X-API-Key
   ▼
[https://qdashboard.smitbox.com] (Cloudflare Tunnel)
   │
   ▼
[SMIT-OS :3000] → apiKeyAuth → perKeyRateLimit → requireAuth → route handler → Prisma → PG
   │
   ▼
[Response → unwrap → format → MCP content]
   │
   ▼
[Cowork displays Markdown table]
```

### Claude Desktop config snippet (final)

```json
{
  "mcpServers": {
    "smitos": {
      "command": "node",
      "args": ["/Users/dominium/Documents/Project/smitos-mcp-server/dist/index.js"],
      "env": {
        "SMITOS_API_URL": "https://qdashboard.smitbox.com",
        "SMITOS_API_KEY": "smk_xxxx_<rest>"
      }
    }
  }
}
```

## Related Code Files

### Create

- `docs/api-key-authentication.md` — SMIT-OS user-facing
- `docs/mcp-cowork-integration.md` — SMIT-OS user-facing
- `/Users/dominium/Documents/Project/smitos-mcp-server/CHANGELOG.md` (optional, v0.1.0 initial)

### Modify

- `CLAUDE.md` — add short section "MCP Integration" linking to two new docs
- `/Users/dominium/Documents/Project/smitos-mcp-server/README.md` — fill all sections
- `plans/260512-0045-mcp-cowork-smitos-data-access/plan.md` — flip status to `completed` after E2E passes

### Delete

- None

## Implementation Steps

1. In `smitos-mcp-server`: `npm run build`. Verify `dist/index.js` exists.
2. Generate production ApiKey in SMIT-OS Settings → API Keys panel:
   - Name: `claude-desktop-cowork`
   - Scopes: all 6 (`read:reports`, `read:crm`, `read:ads`, `read:revenue`, `read:okr`, `read:dashboard`)
   - Copy raw key from modal.
3. Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (create if missing) — add `mcpServers.smitos` block per snippet above. Paste raw key into env.
4. Quit Claude Desktop fully (Cmd+Q, not just window close). Reopen.
5. In Claude Desktop, open the MCP indicator UI. Verify `smitos` listed as connected.
6. Run E2E checklist (see Success Criteria). For each failing tool: check `~/Library/Logs/Claude/mcp-server-smitos.log`, fix in tool source, rebuild, restart Claude.
7. Write `docs/api-key-authentication.md`:
   - Overview (what is ApiKey vs JWT)
   - Generate (Settings UI walkthrough)
   - Scopes table (`read:reports` → endpoints, etc.)
   - Revoke flow
   - Audit log (where to query, what's captured, what's NOT captured)
   - Security checklist for the holder of the key
8. Write `docs/mcp-cowork-integration.md`:
   - Architecture diagram (ASCII or link to `/ck:preview --diagram`)
   - Prerequisite (smitos-mcp-server repo cloned + built)
   - Step-by-step Claude Desktop install
   - All 13 tools documented with example queries
   - Troubleshooting:
     - "Tool not appearing" → check Claude logs, verify JSON config syntax
     - "Auth failed" → verify key not revoked, scopes match
     - "Server unreachable" → CF Tunnel status, qdashboard.smitbox.com reachable
     - "Rate limit" → 100/min/key; wait or generate second key
9. Update `CLAUDE.md` — append short section "## MCP Integration" with 2-3 lines + links to both docs.
10. Fill `smitos-mcp-server/README.md`:
    - Overview (1 paragraph)
    - Prerequisites: Node 20+, SMIT-OS API key
    - Install: clone, `npm i`, `npm run build`
    - Configure: `.env` for dev, Claude Desktop config for prod
    - Tools table (13 rows: name, description, required scope, example input)
    - Troubleshooting (subset of mcp-cowork-integration.md)
    - Future work: HTTP/SSE transport, npm publish, write tools (out of scope v0.1)
11. Run final regression:
    - SMIT-OS: `npm test` clean (covers JWT path + ApiKey path)
    - mcp-server: `npm run typecheck` + inspector smoke
12. Flip `plans/260512-0045-mcp-cowork-smitos-data-access/plan.md` frontmatter `status: pending` → `status: completed`.
13. Commit smitos-mcp-server: `chore: v0.1.0 — full integration ready`. Tag `v0.1.0`.
14. Commit SMIT-OS docs + CLAUDE.md update: `docs(mcp): add api-key + cowork integration guides`.

## Todo List

- [ ] `npm run build` in smitos-mcp-server
- [ ] Generate prod ApiKey in Settings UI (all 6 scopes)
- [ ] Edit `~/Library/Application Support/Claude/claude_desktop_config.json`
- [ ] Quit + reopen Claude Desktop
- [ ] Verify `smitos` connected in MCP indicator
- [ ] Run E2E checklist (all 13 tools — see Success Criteria)
- [ ] Write `docs/api-key-authentication.md`
- [ ] Write `docs/mcp-cowork-integration.md`
- [ ] Update `CLAUDE.md` with MCP section
- [ ] Fill `smitos-mcp-server/README.md`
- [ ] Run final regression: SMIT-OS `npm test` + mcp-server inspector
- [ ] Flip `plan.md` status to `completed`
- [ ] Commit + tag mcp-server v0.1.0
- [ ] Commit SMIT-OS docs

## Success Criteria

E2E Checklist (each must pass):

- [ ] Claude Desktop MCP indicator shows `smitos` connected, no error icon
- [ ] `tools/list` returns 13 tools (verified via Cowork prompt: "list available smitos tools")
- [ ] `list_daily_reports` with `{ status: 'Approved', limit: 10 }` returns ≥1 row from live DB
- [ ] `list_weekly_reports` returns recent weekly reports
- [ ] `get_report_by_id` with a known UUID returns full row
- [ ] `overview_snapshot` for last 7 days returns KPIs matching dashboard UI
- [ ] `call_performance` returns per-user metrics
- [ ] `list_leads` returns ≥1 lead
- [ ] `lead_distribution` returns bucket counts
- [ ] `lead_flow` returns transition data
- [ ] `list_ad_campaigns` returns campaigns w/ spend
- [ ] `ad_spend_summary` returns aggregated VND total
- [ ] `revenue_summary` returns revenue fields matching dashboard
- [ ] `list_objectives` returns OKRs
- [ ] `kr_progress` returns KR rows
- [ ] Revoke prod ApiKey from Settings UI → next Cowork query returns 401 within 5s (re-generate after test)
- [ ] `ApiKeyAuditLog` table populated with ≥13 rows after E2E run
- [ ] Stop SMIT-OS app server (`launchctl bootout gui/$(id -u)/com.smitos.dev`) → next Cowork query returns user-friendly error within 12s (no hang). Restart server.
- [ ] All docs files present + readable

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Claude Desktop config JSON syntax error blocks all MCP servers | Medium | High | Validate JSON via `jq < claude_desktop_config.json` before restart; keep backup |
| Production key accidentally committed to git | Low | High | `.env` in `.gitignore` (verified phase 04); claude_desktop_config.json is outside any repo; never paste raw key in commit messages |
| MCP SDK version drift between dev and prod (rebuild without lock) | Low | Medium | Commit `package-lock.json`; `npm ci` instead of `npm i` in prod build |
| Cloudflare Tunnel down during E2E test → false-negative | Medium | Low | Pre-flight: `curl https://qdashboard.smitbox.com/api/auth/health` (or any public endpoint) before starting checklist |
| One tool fails E2E and blocks plan completion | Medium | Medium | Fail-isolated: document failure in this phase file's "Outstanding" section; mark plan in-progress; ship rest as v0.1.0-rc |
| `revenue_summary` field mapping wrong → Cowork returns garbage | Medium | Medium | Side-by-side compare with dashboard UI numbers during E2E checklist; iterate |
| Audit log table grows unbounded over time | Low (long-term) | Low | Document retention recommendation in api-key-authentication.md (90 days); add cron in future iteration |

## Security Considerations

- Production ApiKey held only in `claude_desktop_config.json` (user's local Library, not git-tracked) and in PG `ApiKey.keyHash` (bcrypt). Never in plaintext anywhere else.
- After E2E test that revokes the key, generate a fresh one — don't reactivate revoked keys.
- `docs/api-key-authentication.md` must include explicit warning: ApiKey grants read access to all team's reports + leads (PII). Treat as confidential.
- Audit log can be queried by admin (future Settings tab — out of scope v0.1) to detect abuse.
- Document key rotation procedure in api-key-authentication.md: generate new → update Claude config → restart Claude → revoke old.

## Next Steps

- None — plan terminal. Mark `plan.md` status `completed`.
- Future iterations (out of scope, captured in unresolved questions): HTTP/SSE transport, npm publish, audit log retention cron, Redis cache, write-scope tools.
