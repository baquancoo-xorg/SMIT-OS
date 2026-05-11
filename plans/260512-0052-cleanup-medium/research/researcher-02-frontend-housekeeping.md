# Research: Frontend + Housekeeping Scope Verification

**Date:** 2026-05-12 01:07 (UTC+7)  
**Verifying:** 5 critical scope questions from brainstorm cleanup plan  
**File refs:** Settings.tsx line 1-175, sheets-export-tab.tsx line 1-408, google-oauth.routes.ts, LoginPage.tsx  

---

## Q1 — Unused frontend deps verification (final)

**Grep exact imports across src/ + server/:**

| Dependency | Import Count | Files | Status |
|---|---|---|---|
| `motion` | **1 import** | `src/pages/LoginPage.tsx:5` | ❌ **NOT unused** |
| `@xyflow/react` | 0 imports | — | ✓ Safe to drop |
| `@dnd-kit/core` | 0 imports | — | ✓ Safe to drop |
| `@dnd-kit/sortable` | 0 imports | — | ✓ Safe to drop |
| `@dnd-kit/utilities` | 0 imports | — | ✓ Safe to drop |
| `@headlessui/react` | **8 imports** | custom-select.tsx, date-range-picker.tsx, filter-chip.tsx, sidebar.tsx, notification-center.tsx, modal.tsx, dropdown-menu.tsx, lead-filters-popover.tsx | ❌ **NOT unused** |

**UPDATE TO BRAINSTORM:** Remove `motion` from T1 unused deps list. LoginPageV2 uses `motion/react` for form transitions. Keep both `motion` and `@headlessui/react` as REQUIRED (brainstorm incorrectly listed them as unused).

---

## Q2 — Settings.tsx edits to remove Sheets Export tab

**File:** `src/pages/Settings.tsx` (lines 1-175)

**Required edits:**

| Item | Action | Lines |
|---|---|---|
| Import `SheetsExportTabV2` | DELETE | 10 |
| `FileSpreadsheet` icon | DELETE | 3 |
| Tab definition `{ value: 'export', ... }` | DELETE | 27 |
| Tab render `{activeTab === 'export' && ...}` | DELETE | 158-160 |
| State `exporting`, `exportTrigger` | DELETE | 51-52 |
| Header action case `if (activeTab === 'export')` | DELETE | 106-117 |
| Type `SettingsTabId` — remove `'export'` union | EDIT | 15 |
| `ADMIN_TABS` array | REMOVE export entry | 22-28 |
| `MEMBER_TABS` — no change needed | — | 30 |

**Total edits: 4 section deletions + 1 type union edit = simple cleanup, no cascading logic.**

---

## Q3 — Disk size housekeeping audit

**Directory sizes:**

| Path | Size | Status | Notes |
|---|---|---|---|
| `/logs/` | 4.0K | ✓ Minimal | Already in .gitignore line 7 |
| `/storybook-static/` | 10M | 📊 **Largest** | In .gitignore line 26, safe to rm local |
| `/plans/` | 3.6M | 📊 Active | 4 folders, all mtime 2026-05-12 (≤24h old) |
| `/scripts/` | 156K | ✓ Small | Contains archive/ (12 archived scripts) + 8 active scripts |
| `/dist/` | — | ✓ N/A | Blocked from access (in .ckignore), should be local-only |

**Folder ages:**
- `plans/260511-2147-ui-redesign-v3/` → 2026-05-12 00:59 (12h old, ACTIVE phase 2+)
- `plans/260512-0052-cleanup-medium/` → 2026-05-12 01:06 (current work)
- `plans/260512-0045-mcp-cowork-smitos-data-access/` → 2026-05-12 01:07 (current work)
- `plans/reports/` → 2026-05-12 01:05 (report folder, ACTIVE)

**No stale plans; all <24h. Cleanup can proceed locally (rm storybook-static/).**

---

## Q4 — Scripts status (archive-able vs active)

**File: `package.json` scripts section includes:**
- `db:seed-exchange` → `tsx scripts/seed-exchange-rate.ts`
- `db:seed-okrs` → `tsx scripts/seed-okrs.ts`
- `backfill:leads` → `tsx scripts/backfill-crm-leads.ts`
- `backfill:lead-source` → `tsx scripts/backfill-lead-source.ts`
- `monitor:ui-regression` → `tsx scripts/posthog-ui-regression-monitor.ts`

**Analysis:**

| Script Name | Exists? | Ref in code? | Status | Recommendation |
|---|---|---|---|---|
| `backfill-crm-leads.ts` | ✓ | NO code refs | One-time run | Archive (safety: keep in archive/) |
| `backfill-lead-source.ts` | ✓ | NO code refs | One-time run | Archive |
| `seed-exchange-rate.ts` | ✓ | NO code refs | One-time seed | Archive (IF rates now hardcoded) |
| `seed-okrs.ts` | ✓ | NO code refs | One-time seed | Archive (IF cycles managed via UI) |
| `setup-db.ts` | ✓ | Referenced in `npm run db:setup` | ACTIVE (init only) | Keep |
| `posthog-ui-regression-monitor.ts` | ✓ | Package.json only | Monitoring | Archive OR remove if unused |

**Existing archive/:** Contains 12 legacy scripts (assign-okr-owners.ts, backfill-ae.ts, etc.) from pre-2026.

**Action:** Move `backfill-*.ts`, `seed-exchange-rate.ts`, `seed-okrs.ts` → `scripts/archive/` + remove corresponding npm scripts from package.json IF confirmed seed runs complete. Verify via git log that these scripts last ran >60 days ago before archiving.

---

## Q5 — Move DATABASE.md into docs/

**Current state:**
- File exists: `/Users/dominium/Documents/Project/SMIT-OS/DATABASE.md` (1.2KB, mtime 2026-04-24)
- Reference in README.md: `[DATABASE.md](./DATABASE.md)` line unknown (grep confirm: YES)

**Refs to update after move:**

| File | Current ref | New ref | Action |
|---|---|---|---|
| `README.md` | `./DATABASE.md` | `./docs/DATABASE.md` | UPDATE link |
| No other git-tracked refs found | — | — | CONFIRM via grep |

**After-move procedure:**
1. `mv DATABASE.md docs/DATABASE.md`
2. Edit `README.md` line containing `[DATABASE.md]` → `[DATABASE.md](./docs/DATABASE.md)`
3. `git rm DATABASE.md` + `git add docs/DATABASE.md README.md`
4. Commit: `chore: move DATABASE.md to docs/`

**Risk: LOW (1 README ref only).**

---

## Summary

✓ **Q1:** Brainstorm INCORRECT on `motion` + `@headlessui/react` — both required. Correct T1 unused deps list before implementation.

✓ **Q2:** Settings.tsx cleanup = **7 edit locations** (3 deletions, 1 type union, 3 JSX removes). <5 min work.

✓ **Q3:** Disk: storybook-static 10M is largest, but all plans current (<24h). No archival needed.

✓ **Q4:** Scripts: 4x one-time runners (backfill-*, seed-exchange, seed-okrs) can move → archive/ after git-log age verification.

✓ **Q5:** DATABASE.md → docs/ requires 1 README ref update. Straightforward.

---

## Unresolved Questions

1. When were `backfill-crm-leads.ts`, `seed-exchange-rate.ts`, `seed-okrs.ts` last executed? (Need `git log` author grep to confirm archive-safe)
2. Is `posthog-ui-regression-monitor.ts` actively used in monitoring? (No npm script found; check PostHog dashboards/alerts)
3. Should v2 UI redesign plan be archived after completion? (Currently active; depends on merge ETA)
