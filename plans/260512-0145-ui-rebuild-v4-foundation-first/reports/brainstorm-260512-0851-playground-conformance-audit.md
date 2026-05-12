---
type: brainstorm
date: 2026-05-12 08:51 Asia/Saigon
project: SMIT-OS
slug: playground-conformance-audit
status: approved-pending-implementation
---

# v4 Playground Conformance Audit

## Trigger

User feedback (Image 22): tree lines mờ + đường nối không đúng L-shape, tab + button không match playground style, sidebar có Logout button thừa, page subtitle + date range card cần remove.

## Findings

### Sidebar (`src/design/v4/components/sidebar.tsx`)
- **Bug:** Tree lines hiện = T-shape (vertical trunk full-height + horizontal stub per item). Image 23 ref = L-shape (`├` middle / `└` last).
- **Bug:** Logout button trong `<Sidebar footer>` (V4Shell). Avatar dropdown trong Header đã có Logout — duplicate.

### Page actions (mọi `PageHeader` trong `src/pages-v4/`)
- **Bug:** Subtitle `"2026-05-01 → 2026-05-12"`, `"Pipeline overview..."`, `"Account preferences..."` etc. — user gạch chéo. Page title trong topbar đủ context.
- **Bug:** Dashboard có `<SurfaceCard padding="sm">` chứa DateRangePicker dưới PageHeader — duplicate / chiếm vertical space. User mũi tên: merge vào action row.

### Component size mismatch (TabPill, Button)
- **Bug:** Dashboard + Settings dùng `size="sm"` (h-9). Playground default `md` (h-11). User muốn EXACT playground.

## Decisions Locked (user answers)

| # | Decision |
|---|---|
| 1 | Tree lines: **Per-item L-shape** (├ middle / └ last). Last item trunk `h-1/2`. |
| 2 | Date range: **Button trigger → popover**. Compact `"01/05 → 12/05 ▾"` button trong action row, click mở DateRangePicker dropdown. |
| 3 | Sizes: **Default md everywhere**. Drop `size="sm"` từ pages. |

## Implementation Plan

### File changes (estimated)

1. **`src/design/v4/components/sidebar.tsx`** — rewrite tree-line logic per-item with `i === items.length - 1 ? 'h-1/2' : 'inset-y-0'` for trunk. Remove ambient trunk.
2. **`src/pages-v4/v4-shell.tsx`** — drop `footer={...Logout...}` prop.
3. **New `src/design/v4/components/date-range-button.tsx`** — composes `DateRangePicker` inside `DropdownMenu`-like popover. Trigger button shows `from → to ▾`.
4. **Update `src/design/v4/index.ts`** — export DateRangeButton.
5. **8 pages strip:**
   - Remove `subtitle="..."` from PageHeader calls (perl bulk)
   - Replace direct `<DateRangePicker>` in actions with `<DateRangeButton>`
   - Drop `size="sm"` from TabPill + Button
6. **Dashboard specific:** delete dedicated `<SurfaceCard>` date range card; date range now via button in action row.

### Out of scope (defer)
- Light mode tokens (Phase 8 OQ1 deferred)
- Chart components migration (recharts re-skin)
- DailySync/WeeklyCheckin deep form rebuild

## Files touched (preview)

```
M  src/design/v4/components/sidebar.tsx
M  src/design/v4/components/page-header.tsx (already optional title)
M  src/design/v4/index.ts (export DateRangeButton)
M  src/pages-v4/v4-shell.tsx
C  src/design/v4/components/date-range-button.tsx (new)
M  src/pages-v4/dashboard-overview.tsx
M  src/pages-v4/lead-tracker.tsx
M  src/pages-v4/ads-tracker.tsx
M  src/pages-v4/media-tracker.tsx
M  src/pages-v4/okrs-management.tsx
M  src/pages-v4/daily-sync.tsx
M  src/pages-v4/weekly-checkin.tsx
M  src/pages-v4/settings.tsx
M  src/pages-v4/profile.tsx
```

## Success Criteria

- Sidebar matches Image 23 (L-shape per-item, no logout footer)
- All pages: no subtitle, date range in action row as popover button
- TabPill + Button visual identical to playground Sections 01/12
- `npm run lint` + `npm run build` exit 0
- Visual smoke test on `/v4/dashboard`, `/v4/leads`, `/v4/ads`, `/v4/media`, `/v4/okrs`, `/v4/settings`

## Unresolved questions

1. DateRangeButton popover positioning: bottom-end OK? (default — matches `DropdownMenu` align)
2. Tree line color intensity: keep `outline-subtle` (60% opacity) or upgrade to `outline-default` for clearer contrast?
3. Sidebar collapsed mode: keep tree lines hidden or show minimal vertical accents?
