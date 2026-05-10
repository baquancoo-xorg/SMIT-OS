# Phase 06 — Polish & Permissions

## Context Links
- Parent plan: [`plan.md`](./plan.md)
- Brainstorm: [`../reports/brainstorm-260510-0237-acquisition-trackers.md`](../reports/brainstorm-260510-0237-acquisition-trackers.md) (Section 6, Phase 6)
- Dependencies: Phase 5 (Overview ship), data 4-6 tuần đã accumulate

## Overview

| Field | Value |
|---|---|
| Date | 2026-05-10 |
| Priority | P3 |
| Effort | 2-3 ngày |
| Status | ✅ completed |
| Completed | 2026-05-10 |
| Review | passed |

Hoàn thiện product: CSV export cho 3 trackers, weekly digest email cho leadership, audit log. RBAC reuse Admin/Leader hiện có (KHÔNG tạo role mới).

## Key Insights

- RBAC: reuse `isAdmin` + `Leader` role → KHÔNG tạo role Marketing mới (decision đã chốt)
- CSV export pattern đã có ở Lead Tracker (`lead-tracker/csv-export.ts`) → mở rộng cho Ads + Media
- Weekly digest email cần SMTP/SendGrid — verify infra sẵn không trước khi commit
- Audit log: reuse pattern `LeadAuditLog` cho Ads token rotate, KOL/PR CRUD

## Requirements

### Functional

**RBAC (reuse existing roles):**
- `isAdmin`: full view + CRUD Media + config Ads token
- `Leader`: full view + CRUD Media (no token config)
- `Sales`: view attribution Lead → Ads (read-only)
- Người dùng thường: chỉ thấy Lead Tracker (như hiện tại), không thấy Ads/Media/Overview

**CSV export:**
- Ads Tracker: campaigns + spend records by date range
- Media Tracker: each tab có export riêng (Owned, KOL, PR)
- Acquisition Overview: KPI snapshot + top campaigns

**Weekly digest email:**
- Cron mỗi thứ Hai 08:00 (configurable)
- Content: Acquisition Overview snapshot + biggest movers (campaign tăng/giảm)
- HTML email render từ template
- Recipients configurable (admin UI)

**Audit log:**
- Log mọi config change (token rotate, MCC switch, KOL/PR CRUD)
- Reuse pattern `LeadAuditLog`

### Non-functional
- CSV export ≤ 5s cho 1 năm data
- Email render < 3s
- Audit log không impact performance write path
- Permission check at route level (middleware), KHÔNG client-only

## Architecture

### RBAC (reuse hiện có, không thêm role mới)

```
roles:
  ADMIN     → existing isAdmin === true
  LEADER    → existing role.includes('Leader')
  SALES     → existing departments includes 'Sale'
  USER      → mặc định

permissions:
  acquisition.view              → ADMIN, LEADER, SALES
  acquisition.media.crud        → ADMIN, LEADER
  acquisition.ads.config        → ADMIN
  acquisition.ads.view          → ADMIN, LEADER, SALES
  acquisition.attribution.view  → ADMIN, LEADER, SALES
```

### Email digest

```
[Cron Mon 08:00]
  ├─ Aggregate same as Acquisition Overview (last 7d + compare)
  ├─ Render HTML template (handlebars / mjml / inline JSX)
  ├─ Send via SMTP (verify infra)
  └─ Log delivery vào EmailLog table (new)
```

### Files structure mới

```
server/
├── middleware/
│   └── acquisition-rbac.middleware.ts    (new)
├── services/
│   ├── csv-export/
│   │   ├── ads-csv-export.ts
│   │   └── media-csv-export.ts
│   └── digest/
│       ├── weekly-digest.service.ts
│       ├── email-renderer.ts
│       └── digest-recipients.service.ts
├── cron/
│   └── weekly-digest.cron.ts
├── routes/
│   └── digest-recipients.routes.ts       (admin CRUD recipients)
└── templates/
    └── weekly-digest.html.hbs            (or .tsx if React Email)

src/
└── pages/
    └── Settings.tsx                      (extend — digest recipients section)
```

## Related Code Files

### Modify
- `server/middleware/rbac.middleware.ts` — add permission keys mới
- `src/components/lead-tracker/csv-export.ts` — pattern reference (no edit cần thiết)
- `prisma/schema.prisma` — thêm model `EmailLog` + `DigestRecipient` nếu cần
- `src/pages/Settings.tsx` — admin UI cho digest recipients

### Create
- 8 server files + 1 frontend section
- Email template

### Reference
- `server/middleware/admin-auth.middleware.ts`, `rbac.middleware.ts`, `ownership.middleware.ts`
- `src/components/lead-tracker/csv-export.ts`
- `prisma/schema.prisma` model `LeadAuditLog`

## Implementation Steps

### Step 1 — Permissions middleware
- Add permission keys vào `rbac.middleware.ts` (reuse Admin/Leader/Sales)
- Apply lên routes Phase 3, 4, 5
- Hide Acquisition group trong sidebar nếu user không có quyền (extend Phase 1 sidebar)
- Test với từng role

### Step 2 — CSV export
- Create `ads-csv-export.ts`: query campaigns + spend, format CSV
- Create `media-csv-export.ts`: 3 functions (owned, KOL, PR)
- Add export button vào UI 3 trackers
- Test với 1 năm data

### Step 3 — Weekly digest
- Verify SMTP/SendGrid infra (env vars, sender domain verified)
- Schema: `EmailLog`, `DigestRecipient` (nếu user-managed list)
- Service `weekly-digest.service.ts`: aggregate + render + send
- Template HTML (handlebars hoặc React Email)
- Cron Mon 08:00
- Settings UI: admin add/remove recipients

### Step 4 — Audit log
- Reuse pattern `LeadAuditLog` cho config changes
- Log: Meta token rotate, KOL/PR CRUD by user
- Admin UI để xem (defer nếu chưa cần)

### Step 5 — Test & doc
- Test 4 role personas
- Test CSV với data lớn
- Test email render trong Gmail/Outlook
- Update `docs/system-architecture.md`

## Todo List

- [x] Permission middleware (Admin/Member only; Leader removed per role-simplification)
- [x] CSV export Ads
- [x] CSV export Media (3 tabs)
- [ ] (Deferred) Verify SMTP infra
- [ ] (Deferred) Schema EmailLog + DigestRecipient
- [ ] (Deferred) Weekly digest service + template
- [ ] (Deferred) Cron Mon 08:00
- [ ] (Deferred) Settings UI digest recipients
- [ ] (Deferred) Audit log integration
- [x] Test RBAC with Admin/Member personas
- [x] Update docs

## Success Criteria

- [x] Admin/Member RBAC test: mỗi role thấy đúng UI + endpoints
- [x] CSV export ≤ 5s cho 1 năm data, file đúng định dạng
- [ ] (Deferred) Weekly digest send + render (SMTP infra unverified)
- [ ] (Deferred) Audit log capture config change
- [ ] (Deferred) Settings UI digest recipients
- [ ] (Deferred) Cron job log success/failure

## Deferred from Phase 6

- **Weekly digest email:** SMTP/SendGrid infrastructure unverified at phase start. CSV export + manual sharing covers immediate need. Email digest can be added as post-launch feature when email infra is confirmed.
- **Audit log for Meta token rotate:** Flagged as operational requirement; implementation deferred pending token rotation becoming a recurring maintenance task.
- **Settings UI for digest recipients:** Same timeline as email digest feature.

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| SMTP infra chưa có / domain chưa verify | 🔴 High | Verify ngay đầu phase, nếu chưa → defer email digest hoặc dùng SendGrid free tier |
| RBAC change break existing routes | 🟡 Medium | Test toàn bộ existing routes sau khi add permission middleware |
| CSV memory blow với data lớn | 🟡 Medium | Stream CSV (Node `csv-stringify`) thay vì in-memory build |
| Email render vỡ ở Outlook | 🟡 Medium | Dùng MJML hoặc React Email (test all major clients) |
| Audit log spam DB | 🟢 Low | Log async, batch write nếu cần |

## Security Considerations

- Permission check phải ở **server middleware**, không client-only
- SMTP credentials encrypt env (đừng lưu DB)
- Audit log không lưu plaintext token
- CSV export include sensitive data → require auth + log download event
- Weekly digest có thể leak data → recipients chỉ admin set được, không user self-add

## Next Steps

- Phase 7+ (future, không trong scope): brand listening tool integration, fuzzy attribution, AI sentiment cho PR, mobile app push notification
- Sau Phase 6 ship → run user feedback survey với leadership + marketing team
- Plan archive: chạy `/ck:plan:archive` sau khi tất cả phases done
