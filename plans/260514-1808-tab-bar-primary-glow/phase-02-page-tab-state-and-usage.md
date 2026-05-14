---
title: "Phase 2 — Page Tab Usage & URL State Migration"
status: pending
priority: P2
effort: 1h
---

# Phase 2 — Page Tab Usage & URL State Migration

## Context Links

- Phase 1: `phase-01-tab-pill-visual-standard.md` (must complete first — introduces `size="page"`)
- Contract: `docs/ui-design-contract.md` §13 (Tab Bar), §43 (Accessibility)
- Reference pattern: `src/pages/v5/DashboardOverview.tsx` (canonical URL state implementation)
- Reference pattern: `src/pages/v5/Settings.tsx` (URL state + visibility filter pattern)

## Overview

Four changes per-page:
1. Switch `size` prop from default (`md`) or `sm` to `size="page"` on all page-level `<TabPill>`.
2. Migrate OKRs, Leads, and Ads from `useState<Tab>` to `useSearchParams` for tab selection.
3. Settings: change `size` from default `md` → `size="page"` (URL state already correct).
4. LeadTracker: tab state migrated; existing `date_from`/`date_to` params coexist unchanged.

## Key Insights

- **Dashboard / DailySync / Settings** already use `useSearchParams` — these are the reference.
- **OKRs** (`src/pages/OKRsManagement.tsx`): pure `useState`, no `useSearchParams` import at all.
- **Leads** (`src/pages/v5/LeadTracker.tsx`): has `useSearchParams` for date range but tab uses `useState<ActiveTab>`.
- **Ads** (`src/pages/v5/AdsTracker.tsx`): has `useSearchParams` for dates but tab uses `useState<Tab>`.
- URL param name for tab: `tab` — consistent with Dashboard and Settings. Do not introduce a different param name.
- Guard pattern (used in Dashboard + Settings): `parseTab(raw)` validates against `Set<Tab>` and falls back to default — prevents invalid URL values from crashing.

## Requirements

**Functional**
- All 4 pages pass `size="page"` to `<TabPill>`.
- OKRs: add `useSearchParams`; read/write `tab` param; guard with `parseTab`.
- Leads: read/write `tab` param from existing `useSearchParams`; remove `useState<ActiveTab>`.
- Ads: read/write `tab` param from existing `useSearchParams`; remove `useState<Tab>`.
- Settings: only size prop change (URL state already correct).
- Default tab values: OKRs → `'L1'`, Leads → `'logs'`, Ads → `'campaigns'`.
- Browser Back/Forward navigates between tabs — side effect of URL state, no extra work needed.

**Non-Functional**
- No behavioral change beyond URL persistence — existing filters/date params untouched.
- No new hooks or abstractions — YAGNI; the 4-line pattern is simple enough inline.

## Architecture / Data Flow

### URL State Pattern (canonical — copy from DashboardOverview)

```
URL ?tab=<value>
  → useSearchParams()
  → parseTab(raw) → validated Tab value
  → <TabPill value={tab} onChange={setTab} />

onChange:
  const next = new URLSearchParams(searchParams);
  next.set('tab', value);
  setSearchParams(next, { replace: true });   // replace so Back skips intermediate tabs
```

`replace: true` matches Settings behavior — avoids polluting history stack with every tab click.

### Per-Page Delta

| Page | Add import | Remove | Add | Size change |
|------|-----------|--------|-----|-------------|
| `OKRsManagement.tsx` | `useSearchParams` from react-router-dom | `useState<ActiveTab>` | `parseTab()`, URL read/write | `md` → `page` |
| `LeadTracker.tsx` | — (already imported) | `useState<ActiveTab>` line | `parseTab()`, `tab` from searchParams | `sm`/default → `page` |
| `AdsTracker.tsx` | — (already imported) | `useState<Tab>` line | `parseTab()`, `tab` from searchParams | `sm`/default → `page` |
| `Settings.tsx` | — | — | — | default `md` → `page` |

## Related Code Files

- **Modify:** `src/pages/OKRsManagement.tsx`
- **Modify:** `src/pages/v5/LeadTracker.tsx`
- **Modify:** `src/pages/v5/AdsTracker.tsx`
- **Modify:** `src/pages/v5/Settings.tsx`
- **Read only:** `src/pages/v5/DashboardOverview.tsx` (reference for `parseTab` pattern)

## Implementation Steps

### Settings.tsx (simplest — size only)
1. Locate `<TabPill<SettingsTab>` (line ~50).
2. Add `size="page"` prop.

### AdsTracker.tsx
1. Remove `const [activeTab, setActiveTab] = useState<Tab>('campaigns');` (line 30).
2. After existing `useSearchParams` destructure, add:
   ```ts
   const validTabs = new Set<Tab>(['campaigns', 'performance', 'attribution']);
   function parseTab(raw: string | null): Tab {
     return raw && validTabs.has(raw as Tab) ? (raw as Tab) : 'campaigns';
   }
   const activeTab = parseTab(searchParams.get('tab'));
   function setActiveTab(next: Tab) {
     const p = new URLSearchParams(searchParams);
     p.set('tab', next);
     setSearchParams(p, { replace: true });
   }
   ```
3. Change `<TabPill` prop to `size="page"`.

### LeadTracker.tsx
1. Remove `const [activeTab, setActiveTab] = useState<ActiveTab>('logs');` (line 22).
2. After existing `useSearchParams` destructure, add equivalent `parseTab` + URL read/write (default `'logs'`).
3. Change `<TabPill` prop to `size="page"`.

### OKRsManagement.tsx
1. Add `useSearchParams` to react-router-dom import.
2. Inside component, add `const [searchParams, setSearchParams] = useSearchParams();`.
3. Replace `const [activeTab, setActiveTab] = useState<ActiveTab>('L1');` with:
   ```ts
   const validTabs = new Set<ActiveTab>(['L1', 'L2']);
   function parseTab(raw: string | null): ActiveTab {
     return raw && validTabs.has(raw as ActiveTab) ? (raw as ActiveTab) : 'L1';
   }
   const activeTab = parseTab(searchParams.get('tab'));
   function setActiveTab(next: ActiveTab) {
     const p = new URLSearchParams(searchParams);
     p.set('tab', next);
     setSearchParams(p, { replace: true });
   }
   ```
4. Change `<TabPill` prop to `size="page"`.
5. Remove unused `useState` import if `activeTab` was the only state (check remaining `useState` calls first).

### All pages — after edits
6. Run `npx tsc --noEmit` — zero errors required.

## Todo List

- [ ] Settings.tsx — add `size="page"` to `<TabPill>`
- [ ] AdsTracker.tsx — remove `useState<Tab>`, add `parseTab` + URL read/write, `size="page"`
- [ ] LeadTracker.tsx — remove `useState<ActiveTab>`, add `parseTab` + URL read/write, `size="page"`
- [ ] OKRsManagement.tsx — add `useSearchParams`, replace `useState<ActiveTab>`, add `parseTab` + URL read/write, `size="page"`
- [ ] OKRsManagement.tsx — clean up unused `useState` import if applicable
- [ ] `npx tsc --noEmit` — zero errors

## Success Criteria

- Navigating to `/okrs?tab=L2`, `/leads?tab=stats`, `/ads?tab=performance` lands on correct tab.
- Invalid `?tab=garbage` falls back to default tab without crash.
- Browser Back after switching tabs restores previous tab (URL state).
- All four `<TabPill>` render at 36px outer height (DevTools verified).
- No existing date-range filter behavior broken on Leads or Ads.

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| OKRs `useState` removal breaks other local state that depends on `activeTab` indirectly | Low | Medium | Scan full file for `activeTab` usages before removal; `parseTab` drop-in is transparent to consumers |
| Leads `useState` removal conflicts with existing `useSearchParams` date params | Low | Low | `tab` param is orthogonal to `date_from`/`date_to`; `URLSearchParams` preserves other params via `new URLSearchParams(searchParams)` copy pattern |
| `replace: true` in `setSearchParams` hides legitimate history entries | Low | Low | Matches Settings/Dashboard behavior; document as intentional |
| File > 200 lines after edits | Low | Low | OKRsManagement.tsx is already large — `parseTab` adds ~8 lines, `useState` removal saves 1; net neutral |

## Accessibility Considerations (§43)

- URL state means tab is bookmarkable and shareable — improves a11y for users who return to specific views.
- `aria-selected` and keyboard navigation handled by `TabPill` primitive — no regression.

## Security Considerations

- URL params are user-controlled input; `parseTab` whitelist guard prevents unexpected values from propagating to render logic or API calls.

## Next Steps

Phase 3: visual + functional validation across all four pages.
