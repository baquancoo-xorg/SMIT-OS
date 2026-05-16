# Phase 04 — Login + App Suspense Wiring

## Context
- Parent: [plan.md](plan.md)
- Depends on: [phase-01-foundation.md](phase-01-foundation.md), [phase-02-loaders.md](phase-02-loaders.md)

## Overview
- **Date:** 2026-05-16
- **Priority:** P2
- **Status:** pending
- **Description:** Replace `/logo-only.png` trên Login page bằng `AnimatedLogo` idle loop. Wire top-level Suspense fallback `PageLoader` trong `App.tsx` (verify chưa có).

## Key Insights
- LoginPage.tsx:126 dùng `<img src="/logo-only.png" alt="SMIT OS" className="size-20 drop-shadow-md" />`
- Size hiện tại `size-20` = 80px → use `size="lg"` của AnimatedLogo (80px)
- App.tsx có thể đã có Suspense (lazy route loading) — verify, không double-wrap
- Login loop = `<AnimatedLogo looping size="lg" route="/login" />` → start frame = login mapping, loop 4s

## Requirements
- LoginPage hero logo: animated, idle loop, lg size, drop-shadow preserved
- App-level Suspense fallback uses PageLoader (replace any existing fallback)
- Other Suspense boundaries (per-route, per-section) NOT touched (handled by features later)

## Architecture
No new files. Edit 2 existing.

## Related Code Files
**Edit:**
- `src/pages/LoginPage.tsx` (line 126)
- `src/App.tsx` (top-level Suspense fallback if any, else skip)

**Reference (read-only):**
- Phase 02 output: `src/components/branding/logo-loader.tsx`

## Implementation Steps
1. Open `src/pages/LoginPage.tsx`.
2. Add import: `import { AnimatedLogo } from '../components/branding';`
3. Replace line 126:
   ```diff
   - <img src="/logo-only.png" alt="SMIT OS" className="size-20 drop-shadow-md" />
   + <AnimatedLogo looping size="lg" route="/login" className="drop-shadow-md" />
   ```
4. Open `src/App.tsx`. Grep `Suspense` to locate existing fallback.
5. If exists with generic spinner/null → swap to `<PageLoader />` import from branding.
6. If no Suspense at top-level → add one wrapping the Routes tree:
   ```tsx
   import { Suspense } from 'react';
   import { PageLoader } from './components/branding';
   <Suspense fallback={<PageLoader label="Đang tải" />}>...</Suspense>
   ```
7. TS compile check.

## Todo List
- [ ] Replace LoginPage img with AnimatedLogo
- [ ] Verify App.tsx Suspense, wire PageLoader if needed
- [ ] TS compile clean
- [ ] Manual: open /login, observe 4s loop
- [ ] Manual: trigger a lazy route to see PageLoader

## Success Criteria
- Login page shows animated logo cycling 12 frames over 4s
- `/logo-only.png` import removed from LoginPage (grep verification)
- App-level Suspense fallback uses PageLoader (or remains untouched if intentional)
- No layout shift on login (size-20 maintained)

## Risk Assessment
- **Risk:** App.tsx may not have Suspense (SPA loads sync). **Mitigation:** Verify before adding — if all routes eager-imported, skip the App.tsx edit; document in completion note.
- **Risk:** Login loop loops infinitely → CPU drain. **Mitigation:** Phase 01 `document.hidden` pause handles this.

## Security Considerations
- N/A — pure UI swap, no auth flow change.

## Next Steps
- Phase 05 verification across all surfaces.
