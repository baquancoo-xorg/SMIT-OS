# Phase 06 Report — Admin SocialChannel UI

## Files Created

| File | Lines |
|---|---|
| `src/hooks/use-social-channels.ts` | 104 |
| `src/components/v5/integrations/social-channel-expiry-badge.tsx` | 53 |
| `src/components/v5/integrations/social-channel-list.tsx` | 119 |
| `src/components/v5/integrations/social-channel-form.tsx` | 147 |
| `src/pages/v5/IntegrationsManagement.tsx` | 86 |

## Files Modified (additive)

- `src/App.tsx` — added lazy import + `<Route path="/integrations" element={<IntegrationsManagement />} />`
- `src/components/v5/layout/workspace-nav-items.ts` — added `Link` icon import + `{ label: 'Integrations', href: '/integrations', icon: Link, workspace: 'admin' }` to admin group
- `src/components/v5/layout/sidebar-v5.tsx` — added `{ label: 'Admin', items: ['Settings', 'Profile', 'Integrations'] }` section (previously Settings/Profile were not in any sidebar section)

## Hook API (`use-social-channels.ts`)

- `useSocialChannelsList()` → GET `/api/social-channels`, returns `SocialChannel[]`
- `useSocialChannelCreate()` → POST, invalidates list on success
- `useSocialChannelUpdate()` → PATCH `/:id`, invalidates list on success
- `useSocialChannelDeactivate()` → DELETE `/:id` (soft delete per Phase 04 route), invalidates list
- `useSocialChannelTest()` → POST `/:id/test`, returns `{ ok, pageName?, error? }`

## Sidebar/Route Registration

- Route: `/integrations` (root, no v5 prefix — matches existing pattern)
- Nav item appended to `workspace: 'admin'` group in `workspace-nav-items.ts`
- `sidebarSections` in `sidebar-v5.tsx` gained new `Admin` group, which surfaced Settings+Profile (previously missing from sidebar sections) + Integrations together

## Form Library

Plain controlled inputs + Zod (`^4.3.6` already installed). `react-hook-form` not in deps — did not add it (YAGNI).

## Empty State Design

Facebook icon (opacity 40) + "No channels yet. Add your first FB Fanpage to start tracking media." + secondary "Add channel" button. Rendered when `channels.length === 0`.

## Expiry Badge Logic

- `null` → gray "No expiry"
- `>30d` → green "Valid"
- `7–30d` → amber "Expires in {N}d"
- `<7d` → red "Expires in {N}d"
- past → red "Expired {N}d ago"
All semantic token classes (`bg-*-container`, `text-on-*-container`, `border-*/30`).

## Validation Results

- `npm run typecheck` — 0 errors in Phase 06 files. Pre-existing errors in Phase 05 files (MediaTracker, media-tab, Playground, charts) are out of scope.
- `npm run lint` — 0 errors in Phase 06 files.
- All files < 200 lines. ✓
- No solid orange CTAs. ✓
- Token never stored/displayed in state after close. ✓
- Admin guard: `useAuth().currentUser?.isAdmin` → redirect `/dashboard`. ✓

## Status: DONE
