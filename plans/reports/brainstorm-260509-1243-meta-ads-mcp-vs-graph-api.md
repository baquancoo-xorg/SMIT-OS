# Báo cáo Brainstorm: Meta Ads MCP vs Marketing Graph API cho SMIT-OS

**Ngày:** 2026-05-09 12:43 (Asia/Saigon)
**Trạng thái:** Research-only, chưa implement
**Người yêu cầu:** Quân Bá

---

## 1. Câu hỏi gốc

> Meta đã cung cấp MCP tại `https://mcp.facebook.com/ads`. Có thể qua MCP này lấy data quảng cáo + hoá đơn về SMIT-OS không?

## 2. Câu trả lời ngắn

**Về mặt kỹ thuật: được, nhưng KHÔNG nên.** MCP designed cho conversational AI client (Claude Desktop, ChatGPT, Cursor), không phải backend ETL pipeline. SMIT-OS đã có integration Marketing Graph API trực tiếp — thêm tầng MCP wrapper là over-engineering và sai use case.

**Recommend:** Extend code Graph API hiện có để lấy thêm field billing/threshold/funding. Effort 1-2 ngày, không vendor lock.

---

## 3. Hiểu lầm cốt lõi cần làm rõ

### MCP là gì?

MCP = **Model Context Protocol** — giao thức để **AI agent/LLM** gọi tools trong cuộc hội thoại. Không phải REST API thông thường.

**Flow MCP đúng nghĩa:**
```
User chat with Claude Desktop
  → Claude calls mcp.facebook.com/ads tool
  → Tool returns data
  → Claude synthesizes natural language reply
```

**Flow user đang muốn (sai use case):**
```
SMIT-OS cron job → mcp.facebook.com/ads → store DB → dashboard
                  ❌ MCP không design cho ETL backend
```

### Meta Ads MCP cụ thể

| Đặc điểm | Chi tiết |
|---|---|
| Endpoint | `https://mcp.facebook.com/ads` (beta từ 29/04/2026) |
| Auth | Meta Business OAuth tương tác (cần user sign in qua browser) |
| Scope tiers | `read-only` / `read/write` / `read/write/financial` |
| Tools | 29 tools: campaign mgmt, product catalog, accounts/pages, dataset quality, insights |
| Latency | Synchronous vài giây/call |
| Underlying | Wrapper trên Marketing Graph API (cùng API SMIT-OS đang dùng) |

Nguồn: [Meta Ads MCP and CLI Inside](https://mcp.directory/blog/meta-ads-cli-mcp), [Meta Business Help](https://www.facebook.com/business/help/1456422242197840)

---

## 4. Hiện trạng SMIT-OS

**Đã có integration Graph API (390 LOC):**
- `server/lib/facebook-api.ts` (90 LOC) — gọi `/act_<ID>/insights` lấy spend
- `server/services/facebook/fb-sync.service.ts` (200 LOC)
- `server/services/dashboard/overview-ad-spend.ts` (100 LOC)
- `server/routes/fb-sync.routes.ts`, `admin-fb-config.routes.ts`

**Schema Prisma đã có:**
- `FbAdAccountConfig` — config token/account
- `RawAdsFacebook` — raw data spend
- Đã dùng v22 Graph API + access_token pattern

**Thiếu cho user goal:** field billing (balance, spend_cap, funding_source_details, next_bill_date).

---

## 5. So sánh 3 approaches

### ⭐ Approach A: Extend Marketing Graph API (RECOMMEND)

**Nguyên tắc:** YAGNI + KISS + DRY — leverage 100% code hiện có.

**Cách làm:**
1. Add method `getAccountBilling(accountId)` vào `facebook-api.ts` (~30 LOC)
   - Endpoint: `GET /act_<ID>?fields=balance,spend_cap,amount_spent,currency,funding_source_details,is_prepay_account,next_bill_date,billing_address`
   - Permission: `ads_read` đủ
2. Prisma model mới `FbAdAccountBillingSnapshot`:
   - `id, accountId, balance, spendCap, amountSpent, currency, fundingSource (Json), nextBillDate, snapshotAt`
3. Cron job daily snapshot (reuse infra `server/cron/`)
4. API endpoint `/api/dashboard/ad-billing` trả snapshot mới nhất + delta

**Pros:**
- Không vendor lock — Graph API stable nhiều năm
- System User Token long-lived, headless cron OK
- Batch 1-3 accounts < 5s
- Control schema hoàn toàn
- Effort thấp: 1-2 ngày

**Cons:**
- Tự maintain field mapping (rủi ro thấp vì schema billing rất ổn định)

**Permission needed:** `ads_read` (Standard Access đủ cho in-house ad accounts của bạn)

Nguồn: [Marketing API Auth](https://developers.facebook.com/docs/marketing-api/get-started/authorization), [Permissions Reference](https://developers.facebook.com/docs/permissions/), [Business Assets](https://developers.facebook.com/docs/marketing-api/businessmanager/assets/v2.10)

### ❌ Approach B: SMIT-OS làm MCP Client

**Cách làm:** Cài MCP TS SDK, implement OAuth flow, lưu refresh token, schedule cron call MCP tools.

**Tại sao KHÔNG nên (5 lý do):**

1. **Sai use case** — MCP cho AI conversation, không phải ETL backend
2. **OAuth tương tác** — user phải re-authorize định kỳ; cron headless không tự refresh được dễ dàng
3. **Latency cao** — synchronous vài giây/call, batch kém
4. **Vendor lock** — beta service Meta mới 11 ngày tuổi, schema/availability không cam kết SLA
5. **Có thể hạn chế field** — 29 tools curated, có thể không expose đủ chi tiết `funding_source_details` như Graph API trực tiếp
6. **Duplicate effort** — bạn đã có Graph API integration rồi, thêm MCP wrapper là vi phạm DRY

**Effort:** 3-5 ngày + rủi ro maintain.

### ⚠️ Approach C: Hybrid (A + own MCP server)

**Cách làm:** Làm A (sync DB) + expose **SMIT-OS own MCP server** để Claude Code chat query data đã sync.

**Use case phù hợp:** Bạn ngồi trong Claude Code hỏi *"tuần này spend bao nhiêu, account nào sắp hết balance"* thay vì mở dashboard.

**Pros:** Best of both worlds — backend reliable + AI-friendly query.
**Cons:** +2-3 ngày effort, value chỉ realize nếu thực sự dùng AI chat hàng ngày.

**Khuyến nghị:** Phase 2 sau khi A xong và xác nhận có nhu cầu AI chat.

---

## 6. Recommend final

**Phase 1 (1-2 ngày):** Approach A
- Daily cron snapshot billing/threshold/funding
- Field cần: `funding_source_details`, `balance`, `spend_cap`, `amount_spent`, `currency`, `next_bill_date`, `is_prepay_account`
- Permission: `ads_read` (System User Token hiện tại đủ)
- Scope: 1-3 in-house accounts SMIT
- Chưa làm alert (phase sau)

**Phase 2 (optional):** Cân nhắc Approach C nếu xác nhận dùng Claude Code query thường xuyên.

**Phase 3 (optional):** Alert balance/threshold qua Telegram/Email khi thực sự cần.

---

## 7. Risk assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Meta thay đổi field billing schema | Low | Schema billing ổn định nhiều năm; pin API version v22 |
| Token expired | Medium | System User Token long-lived; add monitoring khi token refresh fail |
| Rate limit khi sync hourly | Low | Daily đủ cho 1-3 accounts, far below limit |
| App review bị reject | Low | `ads_read` Standard Access đủ cho self-owned ad accounts |
| `funding_source_details` cần `manage_pages` | Low | Theo docs `ads_management`/`ads_read` đủ; verify khi implement |

---

## 8. Validation criteria (khi implement)

- [ ] `getAccountBilling()` trả đầy đủ 7 field cần thiết
- [ ] Cron daily chạy < 30s cho 3 accounts
- [ ] Snapshot persist vào `FbAdAccountBillingSnapshot` table
- [ ] Dashboard hiển thị balance/threshold real-time (cache 1h)
- [ ] Test với account có funding source khác nhau (card vs prepay)

---

## 9. Câu hỏi chưa giải quyết

1. **Token hiện tại scope gì?** — Cần check `FbAdAccountConfig` table xem token đang lưu có `ads_read` chưa, hay chỉ có `ads_management`. Verify trên Graph API Explorer.
2. **Ad account có dùng Shared Funding Source qua Business Manager không?** — Nếu có, schema response có thêm `business_id` nested, cần handle.
3. **Currency consolidation?** — Nếu 3 accounts khác currency, dashboard cần convert FX hay hiển thị raw?
4. **Có cần lưu history snapshot bao lâu?** — Daily snapshot 1 năm = 1095 rows/account, nhẹ. Nhưng nếu sau muốn graph trend → cần policy retention.

---

## 10. Nguồn tham khảo

- [Meta Ads MCP and CLI Inside (mcp.directory)](https://mcp.directory/blog/meta-ads-cli-mcp)
- [Meta Business Help: AI Connectors](https://www.facebook.com/business/help/1456422242197840)
- [Marketing API Authorization](https://developers.facebook.com/docs/marketing-api/get-started/authorization)
- [Graph API Permissions Reference](https://developers.facebook.com/docs/permissions/)
- [Marketing API v22.0 Changelog](https://developers.facebook.com/docs/graph-api/changelog/version22.0/)
- [Business Assets / Shared Funding Sources](https://developers.facebook.com/docs/marketing-api/businessmanager/assets/v2.10)
- [pipeboard-co/meta-ads-mcp (community impl)](https://github.com/pipeboard-co/meta-ads-mcp)
- [gomarble-ai/facebook-ads-mcp-server (community impl)](https://github.com/gomarble-ai/facebook-ads-mcp-server)
