---
type: brainstorm
date: 2026-05-12
slug: mcp-cowork-smitos-data-access
status: design-approved
related:
  - prisma/schema.prisma
  - server/routes/daily-report.routes.ts
  - server/routes/report.routes.ts
  - CLAUDE.md (Cloudflare Tunnel section)
---

# Brainstorm — MCP Server cho Claude Desktop/Cowork đọc data SMIT-OS

## Problem Statement

User dùng Claude Desktop + Claude Cowork song song với SMIT-OS để cộng tác. Cowork cần **đọc real-time** dữ liệu SMIT-OS (báo cáo daily/weekly + các chỉ số CRM, Ads, Revenue, OKR, Dashboard) **mà không cần xuất thủ công** mỗi lần. Hiện chỉ có `SheetsExportService` chạy on-demand, không phù hợp workflow hỏi-đáp liên tục.

## Requirements (đã chốt)

| Khía cạnh | Quyết định |
|-----------|------------|
| Cowork host | Claude Desktop (local) |
| Transport | stdio MCP (subprocess Claude spawn) |
| Data path | REST API SMIT-OS (portable, future-proof) |
| Scope data | Toàn team (all users), real-time |
| Tools scope | Full: Reports + CRM + Ads + Revenue + OKR + Dashboard (~13 tools) |
| Code location | Repo riêng `smitos-mcp-server` |
| Auth | ApiKey middleware mới (long-lived, scope read-only) |
| Delivery | Big-bang 1 PR full 13 tools |

## Approaches Evaluated

### Approach A — MCP server query Prisma trực tiếp ❌
**Pros:** Nhanh nhất, không phụ thuộc app server up.
**Cons:** Coupled với Prisma schema → migrate schema phải rebuild MCP. Khi DB chuyển server công ty phải copy `.env` DATABASE_URL, expose port DB ra ngoài (security risk).

### Approach B — MCP server gọi REST API SMIT-OS ✅ CHỌN
**Pros:** Schema-agnostic, tận dụng auth/RBAC/business logic có sẵn. Khi đổi server chỉ cần đổi `SMITOS_API_URL`. Không expose DB port.
**Cons:** Phụ thuộc app server lên 24/7 (đã giải quyết bằng `com.smitos.dev` LaunchAgent + Cloudflare Tunnel).

### Approach C — Auto-export Google Sheets + Drive Connector ❌
**Pros:** Zero-code, dùng connector Anthropic có sẵn.
**Cons:** Không real-time (delay daily/weekly), Cowork đọc snapshot tĩnh, không filter/query linh hoạt được, lệ thuộc Google quota.

## Final Architecture

### High-level flow

```
Claude Desktop (Cowork)
    │ stdio
    ▼
smitos-mcp-server (Node process, local)
    │ HTTPS + X-API-Key header
    ▼
qdashboard.smitbox.com (Cloudflare Tunnel)
    │
    ▼
SMIT-OS Express :3000
    │ Prisma
    ▼
PostgreSQL :5435
```

### Repo `smitos-mcp-server` structure

```
smitos-mcp-server/
├── src/
│   ├── index.ts                # MCP server entry, registerAllTools()
│   ├── lib/
│   │   ├── api-client.ts       # axios + X-API-Key + retry
│   │   ├── env.ts              # SMITOS_API_URL, SMITOS_API_KEY
│   │   ├── format.ts           # response → MCP content blocks
│   │   └── tool-registry.ts    # auto-load tools/**/*.ts
│   └── tools/
│       ├── reports/
│       │   ├── list-daily-reports.ts
│       │   ├── list-weekly-reports.ts
│       │   └── get-report-by-id.ts
│       ├── crm/
│       │   ├── list-leads.ts
│       │   ├── lead-distribution.ts
│       │   └── lead-flow.ts
│       ├── ads/
│       │   ├── list-ad-campaigns.ts
│       │   └── ad-spend-summary.ts
│       ├── revenue/
│       │   └── revenue-summary.ts
│       ├── okr/
│       │   ├── list-objectives.ts
│       │   └── kr-progress.ts
│       └── dashboard/
│           ├── overview-snapshot.ts
│           └── call-performance.ts
├── package.json                # @modelcontextprotocol/sdk, axios, zod
├── tsconfig.json
├── .env.example
└── README.md
```

Mỗi tool file pattern:
```typescript
export default {
  name: 'list_daily_reports',
  description: 'List daily reports filtered by date range, user, status',
  inputSchema: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    userId: z.string().optional(),
    status: z.enum(['Review', 'Approved']).optional(),
    limit: z.number().min(1).max(200).default(50),
  }),
  handler: async (input) => {
    const data = await api.get('/api/daily-reports', { params: input });
    return formatTable(data);
  },
};
```

### SMIT-OS changes (≈150 LOC)

1. **Model `ApiKey`** trong Prisma:
   ```prisma
   model ApiKey {
     id         String    @id @default(uuid())
     name       String                 // "mcp-cowork"
     keyHash    String    @unique      // bcrypt hash của raw key
     prefix     String                 // "smk_xxxx" (4 chars để identify)
     scopes     String[]               // ["read:reports", "read:crm", ...]
     createdBy  String
     createdAt  DateTime  @default(now())
     lastUsedAt DateTime?
     revokedAt  DateTime?
   }
   ```

2. **Middleware `apiKeyAuth.ts`** trong `server/middleware/`:
   - Đọc `X-API-Key` header → bcrypt compare → check `revokedAt is null` → check scope → set `req.user = { type: 'api-key', scopes }`
   - Coexist với JWT middleware: route protected dùng `requireAuth(jwt OR apiKey)`

3. **Admin endpoint** `POST /api/admin/api-keys` để generate key (return raw 1 lần duy nhất, store hash).

4. **Whitelist endpoints cho api-key**: chỉ GET endpoints đọc reports + dashboard + crm/ads/revenue/okr.

### Tools full list (13 tools)

| Group | Tool | API endpoint sử dụng |
|-------|------|----------------------|
| reports | `list_daily_reports` | GET /api/daily-reports |
| reports | `list_weekly_reports` | GET /api/reports |
| reports | `get_report_by_id` | GET /api/{daily-reports\|reports}/:id |
| crm | `list_leads` | GET /api/leads |
| crm | `lead_distribution` | GET /api/dashboard/lead-distribution |
| crm | `lead_flow` | GET /api/dashboard/lead-flow |
| ads | `list_ad_campaigns` | GET /api/ads-tracker/campaigns (cần check) |
| ads | `ad_spend_summary` | GET /api/dashboard/overview (ads section) |
| revenue | `revenue_summary` | GET /api/dashboard/product hoặc tương tự |
| okr | `list_objectives` | GET /api/objectives |
| okr | `kr_progress` | GET /api/key-results |
| dashboard | `overview_snapshot` | GET /api/dashboard/overview |
| dashboard | `call_performance` | GET /api/dashboard/call-performance |

### Claude Desktop config

`~/Library/Application Support/Claude/claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "smitos": {
      "command": "node",
      "args": ["/Users/dominium/Documents/Project/smitos-mcp-server/dist/index.js"],
      "env": {
        "SMITOS_API_URL": "https://qdashboard.smitbox.com",
        "SMITOS_API_KEY": "smk_<raw-key-from-admin-ui>"
      }
    }
  }
}
```

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Cowork upload business data ra Anthropic | Privacy/compliance | API key scope read-only; log tất cả query với apiKeyId trong SMIT-OS để audit; không expose `users.password`/`integrations.refreshToken` |
| Real-time query nặng khi Cowork hỏi nhiều | Server load | Default `limit=50`, max `limit=200`; rate-limit per ApiKey (100 req/min); add Redis cache nếu thấy chậm |
| Một số dashboard endpoint trả structure phức tạp khó cho Cowork parse | UX | `format.ts` chuyển sang Markdown table/summary trước khi return MCP content |
| Cowork beta — MCP API có thể đổi | Maintenance | Dùng `@modelcontextprotocol/sdk` chính chủ, pin version, monitor changelog |
| Quên revoke key khi đổi máy | Security | Admin UI có nút Revoke + show `lastUsedAt` |
| App server SMIT-OS down → MCP fail | UX | api-client retry 2 lần với backoff; tool trả lỗi rõ ràng "SMIT-OS unreachable" thay vì timeout im lặng |
| Schema response endpoint thay đổi | MCP break | Mỗi tool có integration test gọi staging API, CI chạy weekly |

## Future-proof checklist (khi đổi sang server công ty)

- [ ] Đổi `SMITOS_API_URL` env trong Claude Desktop config
- [ ] Generate API key mới trong server công ty (nếu DB không migrate cùng)
- [ ] Update Cloudflare Tunnel hoặc domain mapping
- [ ] **Không cần** đụng code MCP server nếu API contract giữ nguyên
- [ ] Nếu API contract đổi: chỉ sửa axios calls trong từng tool file (1 file/tool, isolated)

## Effort Estimate

| Task | Estimate |
|------|----------|
| SMIT-OS: ApiKey model + middleware + admin endpoint | 0.5-1 ngày |
| smitos-mcp-server scaffolding + lib/ + 3 reports tools | 1 ngày |
| 6 tools nhóm CRM + Ads + Revenue | 2 ngày |
| 4 tools nhóm OKR + Dashboard | 1-1.5 ngày |
| Integration test với Claude Desktop | 0.5 ngày |
| README + docs | 0.5 ngày |
| **Total** | **5.5-6.5 ngày làm việc** |

## Success Criteria

- [ ] Claude Desktop hiển thị `smitos` MCP server "connected" + 13 tools available
- [ ] Cowork query "show me today's daily reports" trả về data đúng từ DB live
- [ ] Cowork query "tổng doanh số tuần này" trả về số khớp dashboard hiện tại
- [ ] API key revoke ngay lập tức cắt được Cowork access
- [ ] Audit log SMIT-OS ghi rõ mỗi query: apiKeyId, endpoint, timestamp, response size
- [ ] Khi tắt SMIT-OS app server → MCP tool trả lỗi tử tế (không timeout 30s)
- [ ] Đổi `SMITOS_API_URL` env → MCP point sang server khác không cần rebuild

## Decision Log

1. **REST API > Direct DB**: portability + security ưu tiên hơn perf marginal
2. **stdio > HTTP/SSE**: Desktop-only use case, không cần expose MCP qua network
3. **ApiKey > JWT user**: avoid 24h refresh dance, scope rõ ràng, audit dễ
4. **Big-bang full 13 tools**: user accept risk wasted-tools để tránh nhiều round
5. **Repo riêng > bundled**: tách lifecycle, version độc lập, share được sau này

## Next Steps

1. User approve design này
2. Chạy `/ck:plan` để tạo implementation plan chi tiết với phases
3. Tạo branch `feat/api-key-middleware` trong SMIT-OS (repo này)
4. Tạo repo mới `smitos-mcp-server` (location: `/Users/dominium/Documents/Project/smitos-mcp-server`)

## Unresolved Questions

- **Endpoint chính xác cho Ads/Revenue**: cần verify 2 routes `ads-tracker.routes.ts` và `dashboard-product.routes.ts` có trả đúng shape mong muốn cho Cowork không (sẽ check trong plan phase)
- **Rate limit cụ thể**: 100 req/min đủ chưa? Có cần burst limit khác? → quyết khi load test
- **MCP server có cần publish npm package không?** → để sau, scope hiện tại chỉ local install
- **Backup plan nếu Anthropic đổi MCP spec**: có cần version pin `@modelcontextprotocol/sdk` strict? → recommend pin minor
