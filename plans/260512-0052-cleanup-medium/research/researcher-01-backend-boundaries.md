---
name: Backend cleanup scope verification — 5 critical questions
description: Verify exact backend boundaries for SMIT-OS medium cleanup (Tier 1-3): google-oauth login flow, sheets export files, stories.tsx paths, server.ts edits, Prisma models
type: reference
---

## Q1 — google-oauth.service.ts for LOGIN or SHEETS ONLY?

**Answer: SHEETS EXPORT ONLY. Safe to drop completely.**

Evidence:
- `auth.routes.ts` (232 lines): Uses local username/password + TOTP 2FA. **ZERO google references.** Auth flow: POST `/login` → verify password → TOTP if enabled → JWT token.
- `google-oauth.service.ts` (176 lines): **Sheets-only scopes:**
  - `https://www.googleapis.com/auth/spreadsheets` (write sheets)
  - `https://www.googleapis.com/auth/drive.metadata.readonly` (folder list)
  - NOT `https://www.googleapis.com/auth/userinfo.profile` for login
- `google-oauth.routes.ts` (129 lines): Routes mount at `/api/google/*` for sheets export admin panel. Callback redirects to `/settings?tab=export`, NOT login page.
- Frontend `sheets-export-tab.tsx`: Calls `/api/google/{status,auth,disconnect,folder,folders}` — all sheets export operations.

**Conclusion:** Login is purely JWT username/password. Google OAuth = sheets export domain only. **Drop entire service & routes safely.**

---

## Q2 — EXACT files to DELETE for Tier 2 (Sheets export domain)

**Backend services & routes (DELETE):**
- `/Users/dominium/Documents/Project/SMIT-OS/server/routes/sheets-export.routes.ts`
- `/Users/dominium/Documents/Project/SMIT-OS/server/routes/google-oauth.routes.ts`
- `/Users/dominium/Documents/Project/SMIT-OS/server/services/sheets-export.service.ts`
- `/Users/dominium/Documents/Project/SMIT-OS/server/services/sheets-export/extractors/analytics-overview.extractor.ts`
- `/Users/dominium/Documents/Project/SMIT-OS/server/services/sheets-export/extractors/crm.extractor.ts`
- `/Users/dominium/Documents/Project/SMIT-OS/server/services/sheets-export/extractors/rituals.extractor.ts`
- `/Users/dominium/Documents/Project/SMIT-OS/server/services/sheets-export/extractors/types.ts`
- `/Users/dominium/Documents/Project/SMIT-OS/server/services/sheets-export/extractors/index.ts`
- `/Users/dominium/Documents/Project/SMIT-OS/server/services/google-oauth.service.ts`
- `/Users/dominium/Documents/Project/SMIT-OS/server/jobs/sheets-export-scheduler.ts`

**Frontend UI (DELETE):**
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/settings/sheets-export-tab.tsx`

**Verify in Settings.tsx after delete:**
- Line 10: remove `SheetsExportTabV2` import
- Line 159: remove `<SheetsExportTabV2 />` render
- Line 27: remove export tab from ADMIN_TABS

---

## Q3 — EXACT *.stories.tsx file paths (26 total)

**Frontend Storybook files (DELETE all 26):**
1. `/Users/dominium/Documents/Project/SMIT-OS/src/components/ui/date-range-picker.stories.tsx`
2. `/Users/dominium/Documents/Project/SMIT-OS/src/components/ui/okr-cycle-countdown.stories.tsx`
3. `/Users/dominium/Documents/Project/SMIT-OS/src/components/ui/form-dialog.stories.tsx`
4. `/Users/dominium/Documents/Project/SMIT-OS/src/components/ui/input.stories.tsx`
5. `/Users/dominium/Documents/Project/SMIT-OS/src/components/ui/button.stories.tsx`
6. `/Users/dominium/Documents/Project/SMIT-OS/src/components/ui/page-header.stories.tsx`
7. `/Users/dominium/Documents/Project/SMIT-OS/src/components/ui/empty-state.stories.tsx`
8. `/Users/dominium/Documents/Project/SMIT-OS/src/components/ui/app-layout.stories.tsx`
9. `/Users/dominium/Documents/Project/SMIT-OS/src/components/ui/error-boundary.stories.tsx`
10. `/Users/dominium/Documents/Project/SMIT-OS/src/components/ui/not-found-page.stories.tsx`
11. `/Users/dominium/Documents/Project/SMIT-OS/src/components/ui/notification-toast.stories.tsx`
12. `/Users/dominium/Documents/Project/SMIT-OS/src/components/ui/tab-pill.stories.tsx`
13. `/Users/dominium/Documents/Project/SMIT-OS/src/components/ui/kpi-card.stories.tsx`
14. `/Users/dominium/Documents/Project/SMIT-OS/src/components/ui/data-table.stories.tsx`
15. `/Users/dominium/Documents/Project/SMIT-OS/src/components/ui/spinner.stories.tsx`
16. `/Users/dominium/Documents/Project/SMIT-OS/src/components/ui/glass-card.stories.tsx`
17. `/Users/dominium/Documents/Project/SMIT-OS/src/components/ui/dropdown-menu.stories.tsx`
18. `/Users/dominium/Documents/Project/SMIT-OS/src/components/ui/notification-center.stories.tsx`
19. `/Users/dominium/Documents/Project/SMIT-OS/src/components/ui/skeleton.stories.tsx`
20. `/Users/dominium/Documents/Project/SMIT-OS/src/components/ui/header.stories.tsx`
21. `/Users/dominium/Documents/Project/SMIT-OS/src/components/ui/filter-chip.stories.tsx`
22. `/Users/dominium/Documents/Project/SMIT-OS/src/components/ui/confirm-dialog.stories.tsx`
23. `/Users/dominium/Documents/Project/SMIT-OS/src/components/ui/sidebar.stories.tsx`
24. `/Users/dominium/Documents/Project/SMIT-OS/src/components/ui/badge.stories.tsx`
25. `/Users/dominium/Documents/Project/SMIT-OS/src/components/ui/modal.stories.tsx`
26. `/Users/dominium/Documents/Project/SMIT-OS/src/components/ui/status-dot.stories.tsx`

Plus directories: Delete `/Users/dominium/Documents/Project/SMIT-OS/.storybook/` and `/Users/dominium/Documents/Project/SMIT-OS/storybook-static/`

---

## Q4 — server.ts lines to EDIT

**Line-by-line cleanup needed:**

**Delete imports (lines 31-39):**
- Line 31: `import { createSheetsExportRoutes } from "./server/routes/sheets-export.routes";`
- Line 32: `import { createGoogleOAuthPublicRoutes, createGoogleOAuthAdminRoutes } from "./server/routes/google-oauth.routes";`
- Line 34: `import { createGoogleOAuthService } from "./server/services/google-oauth.service";`
- Line 39: `import { initSheetsExportScheduler } from "./server/jobs/sheets-export-scheduler";`

**Delete/modify mount (lines 126-127, 131, 152-153):**
- Line 126-127: `const googleOAuthService = createGoogleOAuthService(prisma); app.use("/api/google", createGoogleOAuthPublicRoutes(googleOAuthService));`
- Line 131: `app.use("/api/google", createGoogleOAuthAdminRoutes(googleOAuthService));`
- Line 152: `const sheetsExportService = initSheetsExportScheduler(prisma, googleOAuthService);`
- Line 153: `app.use("/api/sheets-export", createSheetsExportRoutes(sheetsExportService));`

**Verify post-cleanup:**
- No routes starting with `/api/google` or `/api/sheets-export`
- No scheduler init for sheets-export (line 199: `startFbSyncScheduler()` stays — used by FB sync, not sheets)
- Line 194-199: FB sync + lead sync + ads sync schedulers remain (all keep data sync working)

---

## Q5 — Prisma models SAFE to DROP?

**GoogleIntegration & SheetsExportRun: YES, SAFE to drop.**
- No FK references from other models
- Used ONLY in `google-oauth.service.ts` + `sheets-export.service.ts` → both deleted in Tier 2
- Schema: both models have `@@map(...)` (table mapping) but NO `@relation` fields pointing to them

**EtlErrorLog: NO, DO NOT DROP.**
- **Active usage confirmed:** `fb-sync.service.ts` (lines 77, 176) + `ads-sync.service.ts` (lines 74, 101, 150)
- All 3 create() calls for error logging in FB/Ads sync crons
- Belongs to Tier 5 (protected models) per brainstorm

**Action: Create single migration**
```sql
DROP TABLE IF EXISTS google_integrations;
DROP TABLE IF EXISTS sheets_export_runs;
```

**Verify safe:** `prisma migrate dev --name cleanup-sheets-export-domain` will pass schema validation (no FK conflicts).

---

## Unresolved Questions

None. All 5 boundaries verified conclusively.
