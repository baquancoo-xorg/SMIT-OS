# Phase 02 u2014 Settings Page Overhaul

## Overview

- **Priority:** High
- **Status:** completed
- **Blocked by:** Phase 01 (cu1ea7n `SectionHeader`, `Badge` tu1eeb Phase 01)
- **Effort:** ~3h

Tu00e1i thiu1ebft ku1ebf Settings page u0111u1ec3 khu1edbp vu1edbi glass aesthetic cu1ee7a tou00e0n bu1ed9 SMIT OS. Fix responsive table tru00ean tablet.

## Key Insights

- `SettingsTabs` du00f9ng `bg-slate-100` u2014 khu00f4ng khu1edbp surface tokens
- `user-management-tab` vu00e0 `fb-config-tab` u0111u1ec1u du00f9ng negative margin hack `overflow-x-auto -mx-8 px-8` cho table u2014 vu1ee1 layout tru00ean tablet
- Cu00e1c tab cu00f3 pattern SectionHeader lu1eb7p lu1ea1i nhu01b0ng chu01b0a du00f9ng shared component
- `fb-config-tab` cu00f3 `select` native styling khu00f4ng nhu1ea5t quu00e1n vu1edbi `Input` component
- Settings tu00ednh nu0103ng chu1ec9 hiu1ec3n icon bu00e1nh ru0103ng cho admin, non-admin khu00f4ng vu00e0o u0111u01b0u1ee3c (bug tiu1ec1m u1ea9n)

## Requirements

### settings-tabs.tsx
- `bg-slate-100` u2192 `bg-surface-container-low`
- Active tab: `bg-white text-primary shadow-sm` u2192 `bg-surface-container-lowest text-primary shadow-sm`
- Inactive tab hover: `hover:text-slate-700` u2192 `hover:text-on-surface`

### user-management-tab.tsx
- Thay `SectionHeader` du00f9ng component tu1eeb Phase 01
- **Responsive table strategy:** Giu1eef table tru00ean desktop (`lg:` tru1edf lu00ean), tru00ean tablet/nhu1ecf hu01a1n hiu1ec3n card list
  ```
  tablet (768-1279px): Du1ea1ng card mu1ed7i user u2014 avatar + info + role badge + action buttons
  desktop (1280px+): Table hiu1ec7n tu1ea1i (giu1eef nguyu00ean)
  ```
- Xu00f3a hack `-mx-8 px-8` u2014 thay bu1eb1ng `overflow-x-auto` su1ea1ch
- Du00f9ng `Badge` cho role display thay vu00ec hardcode classes
- Edit modal: giu1eef nguyu00ean (OK)

### fb-config-tab.tsx
- Thay `SectionHeader` du00f9ng component tu1eeb Phase 01
- Xu00f3a hack `-mx-8 px-8` cho table, thay bu1eb1ng responsive cards tru00ean tablet
- Native `select` cho Currency: wrap trong `div` cu00f3 same styling vu1edbi `Input` component
  ```tsx
  // Thay thu1ebf raw select bu1eb1ng styled wrapper
  <div className="w-full bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-2.5 text-sm">
    <select className="w-full bg-transparent outline-none">...</select>
  </div>
  ```
- Du00f9ng `Badge` cho sync status (success/error/neutral)

### profile-tab.tsx
- Thay `SectionHeader` du00f9ng component tu1eeb Phase 01 (2 sections: profile info + u0111u1ed5i mu1eadt khu1ea9u)
- Alert messages: u0111u1ed5i `bg-red-50/bg-emerald-50` u2192 du00f9ng `Badge` hou1eb7c inline alert style du00f9ng tokens

### sprint-cycles-tab.tsx & okr-cycles-tab.tsx
- Kiu1ec3m tra vu00e0 refactor du00f9ng `SectionHeader` nu1ebfu cu00f3 pattern tru00f9ng lu1eb7p
- Fix negative margin table hack nu1ebfu cu00f3

## Files to Modify

- `src/components/settings/settings-tabs.tsx`
- `src/components/settings/user-management-tab.tsx`
- `src/components/settings/fb-config-tab.tsx`
- `src/components/settings/profile-tab.tsx`
- `src/components/settings/sprint-cycles-tab.tsx`
- `src/components/settings/okr-cycles-tab.tsx`

## Implementation Steps

1. **Fix `settings-tabs.tsx`**: u0110u1ed5i surface colors
2. **Refactor `profile-tab.tsx`**: Du00f9ng `SectionHeader` cho 2 sections
3. **Refactor `user-management-tab.tsx`**: `SectionHeader` + responsive card/table layout + `Badge` cho role
4. **Refactor `fb-config-tab.tsx`**: `SectionHeader` + responsive fix + styled select + `Badge` cho sync status
5. **Kiu1ec3m tra `sprint-cycles-tab.tsx` vu00e0 `okr-cycles-tab.tsx`**: Refactor nu1ebfu cu1ea7n
6. **Compile check**

## Responsive Layout Strategy (user-management-tab)

```tsx
{/* Desktop: table */}
<div className="hidden lg:block overflow-x-auto">
  <table>...</table>
</div>

{/* Tablet/Mobile: card list */}
<div className="lg:hidden space-y-3">
  {users.map(user => (
    <Card variant="flat" className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* avatar + name + username */}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="info">{user.role}</Badge>
          {/* edit/delete buttons */}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {/* department badges */}
        {/* scope */}
      </div>
    </Card>
  ))}
</div>
```

## Todo

- [x] Fix `settings-tabs.tsx` surface colors
- [x] Refactor `profile-tab.tsx` u2014 `SectionHeader`
- [x] Refactor `user-management-tab.tsx` u2014 responsive + `SectionHeader` + `Badge`
- [x] Refactor `fb-config-tab.tsx` u2014 responsive + `SectionHeader` + `Badge` + styled select
- [x] Kiu1ec3m tra vu00e0 fix `sprint-cycles-tab.tsx`
- [x] Kiu1ec3m tra vu00e0 fix `okr-cycles-tab.tsx`
- [x] Compile check

## Success Criteria

- Settings page tru00f4ng khu1edbp glass aesthetic cu1ee7a app
- User table hiu1ec3n u0111u00fang du1ea1ng card tru00ean tablet (< 1280px)
- Khu00f4ng cu00f3 horizontal overflow tru00ean 768px
- Tu1ea5t cu1ea3 tabs du00f9ng `SectionHeader` nhu1ea5t quu00e1n
