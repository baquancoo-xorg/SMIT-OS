# Phase 1 — P0 Critical Security Hotfix

## Context Links

- Parent plan: [`plan.md`](./plan.md)
- Source finding: brainstorm report § P0-1, P0-2
- Dependencies: Yêu cầu CRM admin access để rotate credential

## Overview

- **Date:** 2026-05-08
- **Priority:** 🔴 P0 (khẩn cấp, trong ngày)
- **Effort:** <1h
- **Status:** pending
- **Description:** Đóng credential exposure (CRM password lộ trong terminal) + xoá orphan plist file.

## Key Insights

- CRM password `quan_coo_crm:JGGudf8745jhjhs98034hdjhfdf34` đã render trong agent context khi audit `.env`. Coi như leaked.
- `.env` permissions hiện `-rw-r--r--` (644) → mọi user trên máy đọc được.
- `com.smitos.server.plist` reference `~/Library/Application Support/SMIT-OS/start-server.sh` — script đã removed ở commit `6f8019b`. Nếu ai load plist sẽ retry vô hạn → log noise.
- App không có CI/CD external, deploy manual qua `npm run dev` + Cloudflare Tunnel.

## Requirements

### Functional
- CRM connection vẫn hoạt động sau rotate (lead-sync cron tiếp tục chạy mỗi 10 phút).
- File `.env` chỉ owner đọc/ghi (mode 600).
- Repo không còn `com.smitos.server.plist`.

### Non-functional
- Downtime tối đa 5 phút (cho lead-sync cron skip 1 cycle).
- Không phá vỡ `npm run dev` workflow hiện tại.

## Architecture

Không thay đổi architecture. Chỉ là ops + cleanup.

```
[CRM Server]            [SMIT-OS]
quan_coo_crm     ──→    .env (CRM_DATABASE_URL)
   ▲                       │
   │ rotate                ▼
   │                    crm-lead-sync.service.ts
   │                       │
   └─────── new pwd ───────┘
```

## Related Code Files

**Modify:**
- `.env` — update `CRM_DATABASE_URL` với new password
- File system: `chmod 600 .env`

**Delete:**
- `com.smitos.server.plist` (root)

**Create (temporary):**
- `.env.backup` — fallback trong case rotate fail (xoá sau khi verify OK)

**Read for context:**
- `server/lib/crm-db.ts` — verify connection retry logic
- `server/services/lead-sync/crm-lead-sync.service.ts` — verify nó dùng `process.env.CRM_DATABASE_URL`

## Implementation Steps

1. **Backup `.env`:**
   ```bash
   cp .env .env.backup
   chmod 600 .env.backup
   ```

2. **Coordinate với CRM admin để rotate password:**
   - Login PostgreSQL CRM server (host `100.114.94.34:12222`)
   - Generate new strong password (≥ 32 chars, random)
   - `ALTER USER quan_coo_crm WITH PASSWORD '<new-password>';`
   - Verify connect với new password từ máy SMIT-OS:
     ```bash
     PGPASSWORD='<new-password>' psql -h 100.114.94.34 -p 12222 -U quan_coo_crm -d scrm_quan -c "SELECT 1;"
     ```

3. **Update `.env`:**
   ```bash
   # Edit CRM_DATABASE_URL line trong .env với new password
   # KHÔNG dùng inline tools agent — edit thủ công để tránh log
   ```

4. **Set restrictive permissions:**
   ```bash
   chmod 600 .env
   ls -la .env  # verify -rw------- (600)
   ```

5. **Verify app reconnect:**
   ```bash
   # Restart dev server (tsx watch sẽ tự pick up .env change? Check: nó không watch .env, cần manual restart)
   pkill -f "tsx watch" || true
   npm run dev &
   sleep 5
   curl http://localhost:3000/api/leads/sync-status -H "Cookie: jwt=<admin-jwt>" 2>&1 | head
   ```

6. **Trigger lead-sync để verify CRM connect:**
   - Login dashboard với admin
   - Settings → Lead Sync → "Sync Now"
   - Verify response status `success` + check log không có connection error

7. **Xoá orphan plist:**
   ```bash
   git rm com.smitos.server.plist
   git commit -m "chore: remove orphan launchd plist (referenced deleted start-server.sh)"
   ```

8. **Cleanup backup nếu OK:**
   ```bash
   shred -uvz .env.backup  # securely delete (Linux). On macOS: rm -P .env.backup
   ```

9. **Optional: verify history sạch:**
   ```bash
   git log --all -p -- .env 2>/dev/null | grep -E "JGGudf|quan_coo_crm.*:" | head -3
   # Expect: empty (.env never committed). Already verified in audit.
   ```

## Todo List

- [ ] Backup `.env` → `.env.backup` với chmod 600
- [ ] Coordinate CRM admin để rotate password `quan_coo_crm`
- [ ] Verify new password connect được từ máy SMIT-OS (psql)
- [ ] Update `.env` với new credential
- [ ] `chmod 600 .env`
- [ ] Restart `npm run dev` + smoke test
- [ ] Trigger manual lead-sync, verify success
- [ ] `git rm com.smitos.server.plist` + commit
- [ ] Securely delete `.env.backup`

## Success Criteria

- ✅ `psql` với old password fails (`password authentication failed`)
- ✅ `psql` với new password succeeds
- ✅ `ls -la .env` shows `-rw-------`
- ✅ Lead-sync manual trigger return `status: 'success'`
- ✅ `com.smitos.server.plist` removed từ repo
- ✅ `git status` clean

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Rotate fail → app không connect CRM | Low | High | Backup `.env.backup`, có rollback path |
| New password chứa special chars phá URL parsing | Medium | Medium | URL-encode special chars hoặc dùng alphanumeric only |
| Lead-sync cron đang chạy lúc rotate → fail mid-transaction | Low | Low | Cron mỗi 10 phút, miss 1 cycle OK |
| CRM admin không respond kịp | Medium | High | Schedule ngay, có deadline rõ |

## Security Considerations

- **Không paste new password vào agent chat** — type thẳng vào editor.
- **Không commit `.env.backup`** — đã trong `.gitignore`.
- **Audit log:** ghi nhận rotate event ở đâu đó (CRM server log hoặc internal note).
- **Rotate downstream:** verify không service nào khác dùng credential này (chỉ SMIT-OS theo audit).

## Next Steps

→ Phase 2: P1 Cleanup + CSP Enforce sau khi Phase 1 stable ≥ 1h.
