# Phase 3 — P2 Sprint Refactor

## Context Links

- Parent plan: [`plan.md`](./plan.md)
- Source: brainstorm § P2-1 → P2-9
- Prerequisite: Phase 2 hoàn thành (deps clean, CSP enforce stable)

## Overview

- **Date:** 2026-05-08
- **Priority:** 🟡 P2 (sprint refactor 1-2 tuần)
- **Effort:** ~16h
- **Status:** pending
- **Description:** Codebase consistency — archive scripts một-lần, chốt naming convention, consolidate type duplication, đồng nhất validation, cleanup dead exports.

## Key Insights

- ~3000 LOC scripts một-lần (`scripts/seed-*.ts`, `scripts/backfill-*.ts`) đã chạy production xong, giữ trong root `scripts/` gây nhiễu.
- Type duplication client/server (28+ interfaces) tạo drift risk — mỗi schema change phải sync 2 nơi.
- `src/components/ui/` mix PascalCase (`Card.tsx`) và kebab-case (`date-picker.tsx`) trong cùng folder.
- Validation pattern split: `auth.routes.ts` dùng `validate()` middleware, `dashboard-product.routes.ts` dùng inline `.safeParse()` 100%.
- ts-prune báo 219 dead exports — nhiều schema Input types unused.

## Requirements

### Functional
- One-time scripts archived nhưng không xoá (giữ git history accessible).
- All `src/components/ui/` files dùng cùng convention.
- Shared types có 1 source of truth.
- All routes dùng cùng validation pattern.
- Dead exports < 50 (cleanup confirmed dead).

### Non-functional
- Zero typecheck errors sau mỗi step.
- Không break runtime behavior.
- Mỗi sub-task = 1 commit để dễ revert.

## Architecture

```
[before]
scripts/                         src/                          server/
├── seed-tasks.ts (used)         ├── types/                    ├── types/
├── seed-okrs.ts (used)          │   └── dashboard-product.ts  │   └── dashboard-product.types.ts
├── seed-weekly-reports.ts       ├── components/ui/            ├── routes/
│   (orphan, 860 LOC)            │   ├── Card.tsx              │   ├── dashboard-product.routes.ts
└── ... 11 orphans               │   ├── date-picker.tsx       │   │   (15 inline safeParse)
                                  │   └── ...                   │   └── auth.routes.ts (uses validate())
                                                                 └── middleware/validate.middleware.ts

[after]
scripts/                         shared/types/                 server/
├── archive/                     ├── dashboard-product.ts      ├── routes/
│   ├── README.md                ├── lead-flow.ts              │   └── *.routes.ts (all use validate*)
│   └── 11 files                 └── ...
└── 9 actively-used files        src/components/ui/            src/types/
                                  └── *.tsx (PascalCase)        └── (UI-specific only)
```

## Related Code Files

**Modify:**
- `server.ts` (route mounts unchanged)
- All routes ở `server/routes/` — replace inline `.safeParse()` với `validate*` middleware
- `tsconfig.json` — add path alias cho `shared/`
- All imports referencing renamed components

**Create:**
- `scripts/archive/` (folder) + `scripts/archive/README.md`
- `shared/types/` (folder) + index file

**Delete (sau khi confirmed dead):**
- ~150 dead exports (post-cleanup)

**Move:**
- 11 scripts → `scripts/archive/`
- 5 type files → `shared/types/` (selective)
- 3 components rename: `date-picker` → `DatePicker`, `table-shell` → `TableShell`, `table-row-actions` → `TableRowActions`

## Implementation Steps

### Sub-phase 3.1: Archive one-time scripts (1h)

```bash
mkdir -p scripts/archive
cat > scripts/archive/README.md <<'EOF'
# Archived Scripts

One-time scripts đã chạy production xong. Giữ làm reference, không add vào package.json.
- `seed-*.ts`: initial DB seeding
- `backfill-*.ts`: data migration
- `fix-*.ts`: ad-hoc fixes
- `verify-*.ts`: spot-check tools

Kích hoạt lại bằng `tsx scripts/archive/<file>.ts` nếu cần.
EOF

# Move các file orphan (không có trong package.json scripts)
mv scripts/assign-okr-owners.ts scripts/archive/
mv scripts/backfill-ae.ts scripts/archive/
mv scripts/backfill-lead-type.ts scripts/archive/
mv scripts/fix-sprints-scopes.ts scripts/archive/
mv scripts/seed-sprints.ts scripts/archive/
mv scripts/seed-user-crm-employee-id.ts scripts/archive/
mv scripts/seed-users.ts scripts/archive/
mv scripts/seed-weekly-reports.ts scripts/archive/
mv scripts/seed-workitems.ts scripts/archive/
mv scripts/sync-fb-historical.ts scripts/archive/
mv scripts/verify-tasks.ts scripts/archive/

git add scripts/
git commit -m "chore(scripts): archive 11 one-time scripts (~3000 LOC)"
```

### Sub-phase 3.2: Naming convention `src/components/ui/` (1h)

Chốt: **PascalCase** (theo React convention + đã chiếm phần lớn).

```bash
cd src/components/ui
git mv date-picker.tsx DatePicker.tsx
git mv table-shell.tsx TableShell.tsx
git mv table-row-actions.tsx TableRowActions.tsx
cd ../../..

# Update imports — find all references
grep -rln "components/ui/date-picker\|components/ui/table-shell\|components/ui/table-row-actions" src/ server/ --include="*.ts" --include="*.tsx" \
  | xargs sed -i '' -e 's|ui/date-picker|ui/DatePicker|g' \
                    -e 's|ui/table-shell|ui/TableShell|g' \
                    -e 's|ui/table-row-actions|ui/TableRowActions|g'

npm run typecheck
git commit -am "refactor(ui): rename ui/ components to PascalCase"
```

**Note:** macOS case-insensitive FS — `git mv` đảm bảo git track được rename.

### Sub-phase 3.3: Consolidate type duplication (4h)

3.3a. **Tạo `shared/types/`:**
```bash
mkdir -p shared/types
```

3.3b. **Update `tsconfig.json`:**
```json
{
  "compilerOptions": {
    "paths": {
      "@shared/*": ["./shared/*"]
    }
  },
  "include": ["src", "server", "shared"]
}
```

3.3c. **Move types từng domain một (commit sau mỗi domain):**

Domain `dashboard-product`:
```bash
# Compare 2 files, merge unique interfaces
diff src/types/dashboard-product.ts server/types/dashboard-product.types.ts
# Cherry-pick shared interfaces vào shared/types/dashboard-product.ts
# Keep request/response wrappers ở server-side, UI-specific ở client
```

Update imports:
- `src/types/dashboard-product.ts` re-exports từ `@shared/types/dashboard-product`
- `server/types/dashboard-product.types.ts` re-exports tương tự
- Hoặc remove hoàn toàn 2 file local + update tất cả imports trỏ sang `@shared/types`

```bash
npm run typecheck
git commit -am "refactor(types): consolidate dashboard-product types to shared/"
```

Lặp cho: `lead-flow`, `lead-distribution`, `dashboard-overview`, `call-performance`.

### Sub-phase 3.4: Đồng nhất validation pattern (3h)

Chuẩn: dùng `validate()` cho body, `validateQuery()` cho query.

3.4a. **Verify `validateQuery` middleware works** (currently dead per ts-prune):
```ts
// server/middleware/validate.middleware.ts:26
// Code đã có sẵn, chỉ cần dùng
```

3.4b. **Refactor route từng cái:**

`server/routes/dashboard-product.routes.ts` — 15 inline `.safeParse()`:
```ts
// before
router.get('/funnel', async (req, res) => {
  const parsed = dateRangeQuerySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json(...);
  // ...
});

// after
router.get('/funnel', validateQuery(dateRangeQuerySchema), async (req, res) => {
  const { dateFrom, dateTo } = req.query as z.infer<typeof dateRangeQuerySchema>;
  // ...
});
```

Routes cần refactor:
- `dashboard-product.routes.ts` (15 endpoints)
- `dashboard-overview.routes.ts` (3 endpoints)
- `lead.routes.ts` (parts)
- `daily-report.routes.ts` (parts)
- `admin-fb-config.routes.ts` (4 mutating)

```bash
# Sau mỗi file:
npm run typecheck
git commit -am "refactor(routes): use validate*() middleware in <route>"
```

### Sub-phase 3.5: Cleanup dead exports (3h)

```bash
npx ts-prune > /tmp/ts-prune-output.txt
grep -v "used in module" /tmp/ts-prune-output.txt | head -100

# Manual review từng entry:
# - Default exports → kiểm tra có dùng dynamic import không
# - Re-exports qua index.ts → kiểm tra barrel pattern
# - Schema Input types → có dùng cho validation không
# - Confirmed dead → delete
```

Targets ban đầu:
- `server/lib/currency-converter.ts` — `getExchangeRate` (verify trước, có thể dùng cron)
- `server/middleware/validate.middleware.ts` — `validateQuery` (sau khi đã dùng ở 3.4)
- `server/schemas/index.ts` — Input types không dùng (`OverviewQuery`, `KpiQuery`, `FbSyncBody`, `CreateUserInput`...)
- `server/routes/google-oauth.routes.ts` — `createGoogleOAuthRoutes` (verify dùng `Public` + `Admin` variants)

```bash
npm run typecheck
git commit -am "refactor: remove confirmed dead exports"
```

### Sub-phase 3.6: Final verify (1h)

```bash
npm run typecheck
npm run lint
npm audit
npx ts-prune | grep -v "used in module" | wc -l   # target < 50
npm run build
npm run dev &
# Smoke test: login + dashboard pages
```

## Todo List

- [ ] **3.1** Archive 11 one-time scripts + README
- [ ] **3.2** Rename 3 components → PascalCase + update imports
- [ ] **3.3** Setup `shared/types/` + tsconfig path alias
- [ ] **3.3** Migrate dashboard-product types
- [ ] **3.3** Migrate lead-flow types
- [ ] **3.3** Migrate lead-distribution types
- [ ] **3.3** Migrate dashboard-overview types
- [ ] **3.3** Migrate call-performance types
- [ ] **3.4** Refactor dashboard-product.routes.ts (15 endpoints)
- [ ] **3.4** Refactor dashboard-overview.routes.ts
- [ ] **3.4** Refactor lead.routes.ts mutating endpoints
- [ ] **3.4** Refactor daily-report.routes.ts mutating endpoints
- [ ] **3.4** Refactor admin-fb-config.routes.ts (add validate())
- [ ] **3.5** Run ts-prune + manual review
- [ ] **3.5** Remove confirmed dead exports
- [ ] **3.6** Final verify typecheck + build + smoke test

## Success Criteria

- ✅ `scripts/archive/` chứa 11 files + README
- ✅ `scripts/` (root) chỉ còn 9 files actively used trong `package.json`
- ✅ `src/components/ui/` 100% PascalCase
- ✅ `shared/types/` exist với ≥ 5 domain types
- ✅ Zero duplicate interface giữa `src/types/` và `server/types/`
- ✅ All routes mutating có `validate()` middleware
- ✅ All routes với query có `validateQuery()` (where applicable)
- ✅ ts-prune dead exports < 50 (từ 219)
- ✅ `npm run typecheck` + `npm run build` pass

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Type consolidation break nhiều imports | High | Medium | Migrate từng domain, typecheck sau mỗi domain |
| Rename component case-sensitive issue trên macOS | Medium | Low | `git mv` (không `mv`) đảm bảo Git tracking |
| Validation middleware change break route behavior | Low | Medium | Test mỗi route sau refactor, có rollback per-commit |
| ts-prune false positive xoá nhầm export đang dùng | Medium | Medium | Run typecheck + smoke test sau mỗi batch delete |
| Archived script cần re-run sau này | Low | Low | Đã archive không xoá, vẫn run được qua path đầy đủ |

## Security Considerations

- Validation middleware standardization → giảm risk inconsistent input handling.
- Type consolidation không impact security (compile-time only).
- Archived scripts không expose qua HTTP → an toàn.

## Rollback Strategy

Mỗi sub-phase = 1+ commits → revert per-commit. Không big-bang merge.

## Next Steps

→ Phase 4: P3 Long-term Tech Debt (ongoing).
