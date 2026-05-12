---
title: "MCP Server cho Claude Desktop/Cowork đọc SMIT-OS data"
description: "Build smitos-mcp-server (repo riêng, 13 tools) + ApiKey middleware trong SMIT-OS để Cowork query real-time"
status: completed
priority: P2
effort: 5.5-6.5d
completed: 2026-05-12
branch: main
tags: [mcp, integration, api-key, cowork, claude-desktop]
created: 2026-05-12
---

# MCP Cowork ↔ SMIT-OS Data Access

## Goal

Cowork (trong Claude Desktop) query real-time SMIT-OS data (Reports, CRM, Ads, Revenue, OKR, Dashboard) qua MCP server local — không phải export thủ công.

## Source of Truth

- Brainstorm (approved design): `plans/reports/brainstorm-260512-0045-mcp-cowork-smitos-data-access.md`
- Architecture summary: REST API path qua `qdashboard.smitbox.com` (Cloudflare Tunnel) + ApiKey scope read-only.

## Architecture (one-liner)

`Claude Desktop ⇄ stdio ⇄ smitos-mcp-server (Node) ⇄ HTTPS+X-API-Key ⇄ qdashboard.smitbox.com ⇄ Express :3000 ⇄ Prisma ⇄ PG`

## Phases (sequential — big-bang final deploy)

| # | Phase | Effort | Status | File |
|---|-------|--------|--------|------|
| 01 | SMIT-OS ApiKey model + middleware | 1d | completed | [phase-01-smitos-apikey-model-middleware.md](./phase-01-smitos-apikey-model-middleware.md) |
| 02 | Admin endpoints + audit log + Settings UI | 1.5d | completed | [phase-02-smitos-admin-endpoints-audit-log.md](./phase-02-smitos-admin-endpoints-audit-log.md) |
| 03 | Whitelist routes + per-key rate limit + integration test | 0.5d | completed | [phase-03-smitos-whitelist-routes-integration-test.md](./phase-03-smitos-whitelist-routes-integration-test.md) |
| 04 | smitos-mcp-server scaffold + libs | 0.5d | completed | [phase-04-mcp-server-scaffold-libs.md](./phase-04-mcp-server-scaffold-libs.md) |
| 05 | Reports + Dashboard tools (5) | 1d | completed | [phase-05-mcp-server-reports-dashboard-tools.md](./phase-05-mcp-server-reports-dashboard-tools.md) |
| 06 | CRM + Ads + Revenue + OKR tools (8) | 2d | completed | [phase-06-mcp-server-crm-ads-revenue-okr-tools.md](./phase-06-mcp-server-crm-ads-revenue-okr-tools.md) |
| 07 | Integration Claude Desktop + docs + E2E | 1d | completed | [phase-07-integration-claude-desktop-docs.md](./phase-07-integration-claude-desktop-docs.md) |

**Total: 5.5-6.5 ngày làm việc.**

## Dependency Graph

```
01 → 02 → 03 ─┐
              ├─→ 07 (E2E + docs, marks plan completed)
04 → 05 → 06 ─┘
```

- 01 → 02: middleware required to gate admin endpoints
- 02 → 03: UI/admin needed to generate test key for integration test
- 04 → 05/06: scaffold + libs required before tool authoring
- 03 + 06 → 07: backend whitelisted + all tools written before E2E

## Cross-cutting Constraints

- Każdy code file < 200 LOC.
- kebab-case for `.ts` filenames.
- NO mock data / fake tests / cheats — real DB only.
- Pin `@modelcontextprotocol/sdk` minor version.
- API key prefix `smk_` (4 chars after underscore stored as `prefix` for identification).
- Audit log fields: apiKeyId, endpoint, method, statusCode, responseSize, userAgent, sourceIp (CF-Connecting-IP) — NEVER request/response body.
- Production scope set: `read:reports`, `read:crm`, `read:ads`, `read:okr`, `read:dashboard` (5 scopes, no `read:revenue` — folded into dashboard).
- Production deployment: 1 API key with all 5 scopes (decision 2026-05-12).
- File ownership: every phase touches disjoint paths (see each phase's "Related code files").

## Backwards Compatibility

- New `ApiKey` model — additive, no migration of existing data.
- Existing JWT auth flow untouched. New helper `requireAuth(['scope'])` accepts EITHER JWT OR ApiKey; legacy routes that still use `createAuthMiddleware(prisma)` directly continue working.
- Whitelist endpoints (phase 03) keep JWT path; add ApiKey path additively. Behavior for JWT users unchanged.

## Rollback Strategy

- Phase 01-02: revert migration + delete middleware/admin route file. Zero impact on existing users (no consumer yet).
- Phase 03: revert per-route middleware swap; JWT path remains.
- Phase 04-06: separate repo — `git reset` or never deploy. SMIT-OS unaffected.
- Phase 07: remove Claude Desktop config entry; revoke key in Settings UI.

## Test Matrix

| Layer | Phase | What | How |
|-------|-------|------|-----|
| Unit | 01 | api-key-auth middleware (hash compare, scope check, revoke check) | `node:test` (matches `auth.test.ts` style) |
| Integration | 03 | Whitelisted GET routes accept ApiKey, reject wrong scope, rate-limit per key | `node:test` hitting in-process Express + real PG (Docker) |
| Smoke | 05/06 | Each tool registered, executes against staging app server | `npx @modelcontextprotocol/inspector` |
| E2E | 07 | Claude Desktop lists 13 tools, each query returns valid data | manual with checklist in phase-07 |

## Success Criteria (plan-level)

- [x] All 7 phases status = completed
- [x] MCP stdio E2E: `tools/list` returns 13 tools (verified 2026-05-12)
- [x] All 13 tools `tools/call` return live DB data (1 daily report, 0 weekly, 387 leads, 6+ OKRs)
- [x] Revoke ApiKey → 401 in 438ms (<5s SLA)
- [x] Server down → CF 502 in 887ms (<12s SLA); MCP retries 5xx with 500ms+1500ms backoff
- [x] `ApiKeyAuditLog` populated (29 rows post-E2E; 401 auth-failures intentionally not logged)
- [x] Docs added: `docs/api-key-authentication.md`, `docs/mcp-cowork-integration.md`, CLAUDE.md updated

## Unresolved Questions

- **Verify Ads/Revenue endpoint shape** for Cowork consumption (`ads-tracker.routes.ts` returns `{success, data:{campaigns:[…]}}`; `dashboard-product.routes.ts` returns `{success, data, cached}`). Resolve in phase 06 implementation — `format.ts` may need per-tool adaptors.
- **Audit log retention** — 90 days reasonable? Defer decision to phase 02 (initial: keep all, add cron later if table grows).
- **Redis cache layer** for hot reads — defer until load test reveals issue (current rate limit 100/min/key should suffice).
- **Publish smitos-mcp-server as npm package** — defer; current scope local install only.
- **HTTP/SSE transport** for future web-based Cowork — defer; stdio sufficient for desktop.
