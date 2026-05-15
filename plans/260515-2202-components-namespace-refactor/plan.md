---
name: components-namespace-refactor
description: Refactor src/components into canonical ui, layout, and workspace namespaces
status: completed
created: 2026-05-15
updated: 2026-05-16
blockedBy: []
blocks: []
---

# Components Namespace Refactor Plan

## Overview

Chuẩn hóa `src/components` thành một namespace chuyên nghiệp, không gom phẳng. Target:

```txt
src/components/
  ui/
  layout/
  workspace/
```

Mục tiêu là làm rõ component nào là canonical primitive, component nào là app shell, component nào là workspace/domain-specific.

## Rationale

- `docs/ui-design-contract.md` §22, §24, §27 xác định Button/Card/DataTable là canonical primitives.
- `docs/ui-design-contract.md` §45 yêu cầu direct import, không barrel import.
- `docs/ui-design-contract.md` §618 Legacy Migration Rules cấm dùng legacy pattern cho UI mới.
- `docs/codebase-summary.md` Key Directories hiện vẫn đặt source of truth ở `src/components/v5/**`, nhưng tên `v5` không còn lý tưởng cho long-term DX.

## Target Structure

```txt
src/components/
  ui/
    charts/
  layout/
  workspace/
    dashboard/
    growth/
      ads/
      lead/
      media/
    execution/
      okr/
      checkin/
      daily-sync/
    intelligence/
    admin/
```

## Phases

| Phase | Status | File | Goal |
|---|---:|---|---|
| 01 | Completed | [Inventory + Mapping](phase-01-inventory-and-mapping.md) | Map current folders/imports before moves |
| 02 | Completed | [Canonical UI Move](phase-02-move-canonical-ui.md) | Move `v5/ui` to `components/ui` |
| 03 | Completed | [Layout Move](phase-03-move-layout.md) | Move `v5/layout` to `components/layout` |
| 04 | Completed | [Workspace Move](phase-04-move-workspace-components.md) | Move domain components into `workspace/*` |
| 05 | Completed | [Validation + Docs](phase-05-validation-and-docs.md) | Typecheck/build, update docs if needed |

## Import Contract

Use direct imports only:

```ts
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
```

Avoid barrel imports:

```ts
import { Button, Card } from '@/components/ui';
```

## Success Criteria

- `src/components/v5` removed or reduced to zero-use temporary bridge only.
- No page imports from legacy roots: `components/ads-tracker`, `components/lead-tracker`, `components/okr`, `components/settings`, `components/modals`, `components/checkin`.
- Canonical UI primitives live under `src/components/ui/**`.
- Layout shell lives under `src/components/layout/**`.
- Domain/workspace components live under `src/components/workspace/**`.
- `npm run typecheck` passes.
- `npm run build` passes.
- Docs updated to reference new component source of truth.

## Risks

- Large import churn can hide real regressions.
- Existing uncommitted changes in component files must be preserved.
- Barrel `index.ts` files currently exist; removing or bypassing them must be sequenced carefully.
- Case-sensitive rename issues can appear on macOS when renaming PascalCase files.

## Recommended Cook Command

```bash
/ck:cook plans/260515-2202-components-namespace-refactor/plan.md
```

## Unresolved Questions

- Có muốn giữ `src/components/v5` như compatibility bridge trong 1 commit hay xóa ngay khi imports đã chuyển xong?
