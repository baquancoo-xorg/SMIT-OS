# UX Audit — Layout Components (5 Core Files)

## Quick Stats
- **Files:** AppLayout (50 LOC), Header (57), Sidebar (102), NotificationCenter (121), OkrCycleCountdown (31)
- **Total:** ~361 LOC
- **Architecture:** Fixed header (h-16), fixed/collapsible sidebar (w-60/64), main content scrollable
- **Mobile breakpoint:** xl (1280px) for sidebar toggle
- **Responsive strategy:** Mobile-first; sidebar collapses to drawer on <1280px

---

## Drift Inventory

| Component | Pattern | Expected | Drift | Severity |
|-----------|---------|----------|-------|----------|
| Header height | `h-16` | Style guide doesn't specify | AMBIGUOUS | Low |
| Header background | `bg-surface/80 backdrop-blur-md` | Should match guide | OK | - |
| Sidebar width desktop | `w-64` | Guide: no spec | OK | - |
| Sidebar width mobile | Drawer (fixed full-height) | Guide: no spec | OK | - |
| Sidebar rounding | `rounded-r-3xl` | Matches glass card `rounded-3xl` ✓ | OK | - |
| Notification badge | `min-w-4 h-4 px-1 rounded-full` | No badge spec in guide | MISSING | Low |
| NavItem active state | `border border-primary/20 bg-primary/10` | Guide: no nav spec | MISSING | Low |
| Breadcrumb separator | Unicode `›` (line 44) | Guide: Material icon `chevron_right` | DRIFT | Med |
| OKR countdown badge | `rounded-full border` (line 22 OkrCycleCountdown) | Guide: no badge spec | MISSING | Low |

---

## Component Analysis

### 1. AppLayout (50 LOC)

**Structure:**
```
<div class="flex h-screen">
  <Sidebar (fixed/mobile drawer)>
  <div class="flex-1 flex flex-col">
    <Header (fixed)>
    <main class="flex-1 overflow-hidden">
      {children (scrollable or not)}
```

**Mobile behavior:**
- Sidebar: Fixed overlay on mobile, static on xl+
- Escape key closes sidebar ✓
- Click backdrop closes sidebar ✓
- Header stays visible on all breakpoints ✓

**Scrolling:**
- `SCROLLABLE_PATHS` set (line 12) limits scroll to certain routes
- Routes: `/okrs`, `/settings`, `/profile`, `/checkin`, `/daily-sync`, `/dashboard`, `/lead-tracker`
- Non-scrollable routes: Any other path (assumes static content)
- **Issue:** Hardcoded list; new pages need manual addition. **Better:** Assume scrollable by default, opt-out for landing pages

**Issues:**
- `custom-scrollbar` class (line 42) — not defined in provided code, assumes global CSS
- Main content `pt-16` compensates for fixed header ✓
- `overflow-x-hidden` (line 42) — why hide horizontal scroll? Might hide needed content on narrow screens

---

### 2. Header (57 LOC)

**Layout:**
```
<header class="fixed top-0 left-0 right-0 h-16">
  <div class="flex items-center justify-between">
    <Menu button (mobile only)>
    <Breadcrumb>
    <Widgets (OKR countdown + Notifications)>
```

**Breadcrumb:**
- Auto-generated from pathname via `resolveBreadcrumb()`
- Format: `[Section] › [Page]` (line 43-45)
- Example: "Analytics › Dashboard"
- **Drift:** Separator is `›` (unicode), not Material icon `chevron_right` per style guide (line 30 ui-style-guide.md)
- **Styling:** `text-xs text-slate-500` (section), `text-slate-700 font-semibold` (page)
- **UX:** Click on section doesn't navigate (not a link). Should it?

**Widgets:**
- OkrCycleCountdown (hidden on mobile) ✓
- NotificationCenter (hidden on mobile) ✓
- **Missing:** Notification count visible on mobile? (Badge appears on NotificationCenter button, so accessible via tap)

**Issues:**
- `truncate` on page name (line 45) — breadcrumb takes space but can overflow on narrow screens
- No search / command palette
- No user menu / quick settings
- `focus:ring-2 focus:ring-primary/50` on menu button (good accessibility)

---

### 3. Sidebar (102 LOC)

**Layout:**
```
<aside class="h-full flex flex-col w-60 xl:w-64">
  <Logo + tagline>
  <Nav (8 items across 4 sections)>
  <User info + Settings/Logout buttons>
```

**Logo:**
- Icon + "SMIT OS" text (line 18-19)
- Tagline: "The Kinetic Workspace" (line 21)
- Size: `h-7 w-7` icon, `text-[22px]` title
- **UX:** Clickable? No — not wrapped in a link. Should navigate to dashboard?

**Navigation:**
- **Sections:**
  - Analytics: Dashboard
  - Planning: OKRs
  - Rituals: Daily Sync, Weekly Checkin
  - Acquisition: Media Tracker, Ads Tracker, Lead Tracker
- **NavItem pattern:**
  - Icon: Material Symbols Outlined (line 93), filled when active via `fontVariationSettings: "'FILL' 1"`
  - Label: `text-sm font-medium`
  - Active state: `text-primary font-bold bg-primary/10 border border-primary/20`
  - Inactive state: `text-slate-500 hover:text-primary hover:bg-slate-50`
  - All: `rounded-full` (pill-shaped)
- **Accessibility:** `focus-visible:ring-2 focus-visible:ring-primary/50` ✓
- **Issues:**
  - Section header: `text-[9px]` (too tiny) — barely readable
  - No collapsible sections (good for space, but no deep nav support)
  - No badge counts (e.g., unread tasks, pending reports) — might reduce engagement

**User Info Section:**
- Display name + role (read-only)
- Settings icon (admin only, navigates to /settings)
- Logout button
- Background: `bg-slate-50` (not glassy)
- **Issue:** Settings icon doesn't show for non-admins; could confuse users who expect personal settings

**Issues:**
- Scrollable nav (`.overflow-y-auto`) but no scroll indicator on mobile (invisible scrollbar with custom-scrollbar class)
- No active indicator persistence (nav scrolls but doesn't scroll active item into view)
- Padding: `p-4 md:p-5 xl:p-5` — why different on mobile? Seems inconsistent

---

### 4. NotificationCenter (121 LOC)

**Layout:**
```
<div class="relative">
  <Button with bell icon>
    {unreadCount badge}
  <Dropdown menu (AnimatePresence)>
    <Header: "Notifications" + "Mark all read" button>
    <Scrollable list (max-h-96)>
      {notification items}
```

**Bell Button:**
- White bg, shadow ✓
- Unread count badge: `min-w-4 h-4 px-1 bg-red-500 text-white text-[10px]` (line 54)
- Shows "9+" if >9 unread ✓
- Hover scale effect (implicit via `shadow-md`) ✓

**Dropdown Behavior:**
- Click toggle (open/close) ✓
- Click outside closes (ref.current click handler) ✓
- `AnimatePresence` + motion spring (fade in/out, y offset) ✓
- Width: `w-80` (fixed) — nice for consistency
- **Issue:** No keyboard escape close (Escape key doesn't close dropdown)

**Notification Item:**
- Icon: Custom emoji map (`ICONS` record, line 8-13)
- Example: `daily_new: '🆕'` — cute but inconsistent with Material icon system used elsewhere
- Title + message (clamp 2 lines) ✓
- Timestamp: `formatDistanceToNow()` ("2 minutes ago") ✓
- Unread indicator: Blue dot (right side) ✓
- Click routing: `routeForNotification()` navigates to relevant page ✓
- **Issue:** Click marks as read only if unread; no explicit mark-as-unread

**Empty State:**
- Large bell icon + "No notifications" text
- Good visual feedback ✓

**Issues:**
- Emoji icons (`🆕`, `⏰`, `📅`) clash with Material Symbols elsewhere — should use Material icons consistently
- No grouping by date/type (flat list)
- No refresh button (polling assumed only on app focus?)
- No notification preferences/snooze
- Mark all read: Blue text, small (line 72-77) — could be button variant

---

### 5. OkrCycleCountdown (31 LOC)

**Layout:**
```
<button class="hidden md:inline-flex rounded-full border px-3 py-1">
  <material icon>
  <cycle name> · <days left or "ended">
```

**Behavior:**
- Hidden on mobile (good for space) ✓
- Navigate to /okrs on click ✓
- Color-coded by status (line 4-8):
  - `green`: "text-emerald-700 bg-emerald-50 border-emerald-100"
  - `amber`: "text-amber-700 bg-amber-50 border-amber-100"
  - `red`: "text-rose-700 bg-rose-50 border-rose-100"
- Displays "Xd left" (days remaining) or "ended"
- Uses hook `useActiveOkrCycle()` (line 11)
- **Issue:** Returns null silently if cycle not found (line 14); no fallback message
- **Tooltip:** Shows full end date (line 23)

**Issues:**
- Position: Right-aligned in header, competes with NotificationCenter ✓
- Color palette: Uses emerald/amber/rose (not theme colors `primary/tertiary/error`)
- Border: Default thin border (not styled per guide)
- No styling spec in guide — appears ad-hoc

---

## Responsive Behavior

| Breakpoint | Sidebar | Header | Notifications | OKR Countdown | Main Content |
|-----------|---------|--------|---------------|---------------|--------------|
| Mobile (<768px) | Drawer (hidden, toggle via menu) | Full width with menu button | Bell icon on button | Hidden | Full width, scrollable |
| Tablet (768-1279px) | Drawer (hidden, toggle via menu) | Full width with menu button | Bell icon visible | Hidden | Full width, scrollable |
| Desktop (≥1280px) | Fixed sidebar (w-64) | Full width, breadcrumb visible | Bell icon visible | Visible badge | Scrollable, padded |

**Issues:**
- Header breadcrumb `truncate` on tablet might hide page names
- Sidebar width (w-60/64) takes 25% of desktop space — large margin
- No tablet-optimized layout (sidebar still drawer at 768-1279px)

---

## Accessibility Analysis

| Issue | Component | Severity | Fix |
|-------|-----------|----------|-----|
| No keyboard breadcrumb navigation | Header | Med | Make section clickable → navigate or open menu |
| Missing Escape key close (dropdown) | NotificationCenter | Med | Add `keydown` handler for Escape |
| Emoji icons (not accessible) | NotificationCenter | High | Replace with Material icons + `aria-label` |
| Section header text too small | Sidebar | Med | `text-[9px]` → `text-[10px]` |
| Settings icon hides for non-admin | Sidebar | Low | Show greyed-out or hide gracefully |
| No focus visible on nav items | Sidebar | Low | Already has `focus-visible:ring`, good ✓ |
| Notification icon color only | Bell badge | Low | Badge already has number, good ✓ |
| No alternative text on logo img | Sidebar | Low | Add `alt="SMIT OS logo"` |
| Header `truncate` hides breadcrumb | Header | Med | Use responsive wrapping instead of truncate |

---

## Mobile Layout Issues

### Small Screen (<375px)
- Header margin: `px-[var(--content-px-mobile)]` — assumes CSS var defined
- Sidebar drawer: Full height, width w-60 (might overflow on very small screens)
- Notification dropdown: `w-80` (80 rem = 320px) — overflows on <320px screens
- **Issue:** No max-width constraints on dropdown/drawers

### Touch UX
- Menu button: `w-10 h-10` ✓ (minimum touch target)
- Sidebar close: Backdrop tap ✓
- Sidebar close: Escape key ✓
- NotificationCenter: Tap to open, tap outside to close ✓
- But: NavLink items in sidebar — min-h-[34px] (line 85 Sidebar) ✓
- **Missing:** Visual feedback (ripple/press effect) on touch

---

## Navigation Gaps

### Missing Features
- **Search/Command palette:** No quick navigation via keyboard
- **Recent pages:** No breadcrumb "Recent" or back button
- **User menu:** No dropdown for profile, preferences, help
- **Section collapsing:** Acquisition section always expanded
- **Active indicator:** NavItem shows active but doesn't scroll into view (may hide under nav section header)

### Deep-linking
- Header breadcrumb is static route-based (line 6-14 ROUTE_BREADCRUMBS)
- Custom routes not in map fall back to generic "Page Name" (line 21-24)
- **Issue:** Settings tab doesn't preserve tab state in breadcrumb

---

## Styling Consistency

| Element | Current | Expected | Match |
|---------|---------|----------|-------|
| Sidebar card | `bg-white/70 backdrop-blur-xl rounded-r-3xl shadow-2xl` | Glass card `rounded-3xl` | ✓ (top-right only) |
| User card | `bg-slate-50 rounded-3xl shadow-sm` | Glass card | DRIFT (not glass) |
| Header | `bg-surface/80 backdrop-blur-md` | Glass card | PARTIAL (no border/blur) |
| Button (menu) | Hover: `bg-slate-50 rounded-xl` | Guide: `rounded-full` | DRIFT |
| NavItem (active) | `rounded-full bg-primary/10 border border-primary/20` | Guide: no nav spec | CUSTOM |
| Notification btn | `rounded-full shadow-sm` | Guide: no spec | CUSTOM |
| Countdown badge | `rounded-full border` | Guide: no spec | CUSTOM |

---

## Top 5 Actionable Insights

### 1. **Replace Emoji Icons with Material Symbols in NotificationCenter**
- **Issue:** Emojis (`🆕`, `⏰`, `📅`) clash with Material icon system used elsewhere
- **Impact:** Inconsistent visual language; not accessible (no labels)
- **Fix:**
  - `daily_new: '🆕'` → `notifications_active` (Material icon)
  - `daily_late: '⏰'` → `schedule` or `access_time`
  - `weekly_late: '📅'` → `calendar_month`
  - `report_approved: '✓'` → `check_circle` or `done`
  - Add `aria-label` to span icon (line 102)
- **Scope:** ~10 lines

### 2. **Fix Header Breadcrumb Separator to Use Material Icon**
- **Issue:** Breadcrumb uses unicode `›` separator (line 44), but style guide specifies Material icon `chevron_right` (line 30 ui-style-guide.md)
- **Impact:** Inconsistent with style system
- **Fix:**
  - Replace `<span className="text-slate-300">›</span>` with `<span className="material-symbols-outlined text-[14px] text-slate-300">chevron_right</span>`
- **Scope:** 1 line

### 3. **Unify Sidebar User Card to Glassmorphism**
- **Issue:** User info card (line 50) uses `bg-slate-50` (solid), not glass style like sidebar container
- **Impact:** Visual inconsistency; breaks design language
- **Fix:**
  - Change `bg-slate-50` → `bg-white/50 backdrop-blur-sm border border-white/20`
  - Adjust text colors to work on glass background
- **Scope:** ~2 lines

### 4. **Add Keyboard Navigation (Escape Close + Tab Cycling)**
- **Issue:**
  - NotificationCenter: Dropdown doesn't close on Escape key
  - Sidebar: No Tab key cycling between nav items
  - Header breadcrumb: Not keyboard navigable
- **Impact:** Keyboard-only users can't fully navigate
- **Fix:**
  - Add `keydown` handler to NotificationCenter dropdown (Escape → setIsOpen(false))
  - Sidebar nav already has `focus-visible` ring ✓; Tab works ✓
  - Make breadcrumb section clickable (navigate or dropdown menu)
- **Scope:** ~20 LOC

### 5. **Optimize Sidebar for Tablet (Show Static on 768-1279px)**
- **Issue:** Sidebar is drawer on tablet (768-1279px), but tablet has enough space for static sidebar
- **Impact:** Tab navigation less convenient; takes extra tap to access sidebar
- **Fix:**
  - Add tablet breakpoint: `md:static md:translate-x-0` (similar to xl)
  - Reduce sidebar width on tablet if needed: `md:w-56`
  - Keep drawer on mobile-only
- **Scope:** ~3 lines CSS class adjustments

---

## Cross-cutting Issues

### CSS Variables Undefined
- `--content-px-mobile`, `--content-px-tablet`, `--content-px-desktop` (line 33 Header)
- `--space-lg`, `--space-md`, `--space-sm` (assumed in other files)
- **Issue:** Code depends on CSS vars but they're not visible in audit scope
- **Recommendation:** Document in index.css or Tailwind config

### Custom CSS Classes
- `.custom-scrollbar` (line 24 Sidebar, line 42 AppLayout)
- `.page-padding` (line 42 AppLayout)
- **Issue:** Not defined in provided code; assume global CSS
- **Recommendation:** Define in Tailwind config or CSS file

### Hook Assumptions
- `useAuth()` — returns `currentUser`
- `useNotifications()` — returns `notifications`, `unreadCount`, `markAsRead`, `markAllAsRead`
- `useActiveOkrCycle()` — returns `cycle`, `daysLeft`, `color`, `isLoading`, `isError`
- **Recommendation:** Document these hook contracts in separate file

---

## Mobile UX Red Flags

### Notification Dropdown on Mobile
- Width: `w-80` (320px) — overflows on <320px screens
- No mobile-optimized layout (full screen on small screens?)
- **Fix:** Use `w-[calc(100vw-2rem)]` max-width on mobile

### Sidebar Drawer on Tablet
- Feels clunky; tablet users expect static sidebar
- Suggest: Show sidebar on tablet (md breakpoint)

### Header Breadcrumb Truncation
- Page name uses `truncate` — can hide important context on tablet
- Suggest: Use responsive width or wrap instead

---

## Performance Considerations

### NotificationCenter
- Polling via `useNotifications()` hook (assumed)
- No visible debouncing or rate limiting
- **Question:** Does polling cause layout shift? (Unread count badge updates)

### Sidebar
- NavItem is memoized ✓ (line 80-102)
- Good: Prevents re-renders of nav items on state change
- Logo not memoized (minor issue)

### OkrCycleCountdown
- Returns null if data loading (line 14) — prevents render; good ✓
- No loading skeleton

---

## Unresolved Questions

1. Are CSS variables (`--content-px-mobile`, etc.) defined somewhere? Where?
2. What does `.custom-scrollbar` class do? Is it accessible?
3. Does NotificationCenter use WebSocket or HTTP polling? How often?
4. Should breadcrumb section be navigable? To what destination?
5. Why is Sidebar user card NOT glass style while sidebar itself is?
6. Is sidebar width (w-64) intentional for 25% of desktop space?
7. Should logo image be clickable to navigate home?
8. Is OkrCycleCountdown position (right of breadcrumb) final, or should it be in dedicated widget area?

---

## Code Smell Flags

- **Hardcoded breadcrumb map:** Line 6-14 Header — needs update when routes change
- **Orphaned ref.current check:** Line 38 NotificationCenter — assumes ref is always set (ok here)
- **Silent null return:** Line 14 OkrCycleCountdown — if data missing, nothing renders (ok but could show skeleton)
- **String-based icon system:** Line 92-93 Sidebar — mixes Material icon names with conditional logic (ok but verbose)
- **Emoji as icon:** Line 8-13 NotificationCenter — accessibility issue

---

## Summary Table: Component Health

| Component | Functionality | Accessibility | Style Guide | Mobile | Grade |
|-----------|---------------|----|---------|--------|-------|
| AppLayout | Solid (scroll logic) | Good (Escape handler) | Good (spacing vars) | Good (drawer) | B+ |
| Header | Good (breadcrumb, widgets) | Med (no Escape, truncate) | Med (chevron drift) | Med (truncate issue) | B |
| Sidebar | Solid (nav structure, focus) | Good (focus-visible) | Med (user card not glass) | Good (drawer transition) | B+ |
| NotificationCenter | Good (mark read, routing) | Med (emoji not accessible) | Low (emoji icons) | Low (fixed width) | B- |
| OkrCycleCountdown | Good (color status) | Good | Low (custom colors) | Good (hidden on mobile) | B |

---

**Status:** DONE
**Summary:** Layout system is solid, functional, and mobile-responsive. Key drifts: emoji icons in NotificationCenter (accessibility + style clash), breadcrumb separator (Material icon vs unicode), sidebar user card (not glass style), and missing keyboard close on dropdown. Mobile has minor UX gaps (dropdown width overflow, tablet sidebar drawer). Accessibility is decent (focus visible, semantic nav) but needs emoji-to-icon migration and Escape key handler.

**Concerns:** 
1. Emoji icons are accessibility blocker (WCAG fail)
2. CSS variables and custom classes not visible in audit scope (assume global)
3. Tablet sidebar should be static, not drawer
4. NotificationCenter dropdown width can overflow small screens
