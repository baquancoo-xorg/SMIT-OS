# Phase 2: Responsive Global Search

## Overview
- **Priority:** High
- **Status:** pending
- **Estimated:** 45 minutes

Global Search cần responsive:
- **Desktop (≥1440px):** Full search bar
- **Tablet (768-1439px):** Shorter search bar
- **Mobile (<768px):** Search icon → click opens overlay

## Current State

```tsx
// Header.tsx line 75
<div className="flex-1 max-w-[280px] sm:max-w-md md:max-w-lg lg:max-w-xl relative ml-4 xl:ml-6">
```

Search bar luôn hiện, chiều dài lớn trên tablet.

## Implementation

### Step 1: Create search state for mobile overlay

**File:** `src/components/layout/Header.tsx`

```tsx
const [isSearchOpen, setIsSearchOpen] = useState(false);
```

### Step 2: Conditional render - icon vs input

```tsx
{/* Mobile: Search icon button */}
<button
  onClick={() => setIsSearchOpen(true)}
  className="tablet:hidden w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-50 rounded-xl"
>
  <Search size={20} />
</button>

{/* Tablet+: Search input */}
<div className="hidden tablet:flex flex-1 max-w-[180px] lg:max-w-xs xl:max-w-md 2xl:max-w-lg relative ml-4" ref={searchRef}>
  {/* existing search input */}
</div>
```

### Step 3: Mobile search overlay

```tsx
{/* Mobile search overlay */}
<AnimatePresence>
  {isSearchOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-white tablet:hidden"
    >
      <div className="flex items-center gap-3 p-4 border-b">
        <button onClick={() => setIsSearchOpen(false)}>
          <X size={24} />
        </button>
        <input
          autoFocus
          className="flex-1 bg-slate-100 rounded-xl py-3 px-4"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
      {/* Search results */}
      <div className="p-4 overflow-y-auto">
        {/* render searchResults */}
      </div>
    </motion.div>
  )}
</AnimatePresence>
```

### Step 4: Add tablet breakpoint to Tailwind

**File:** `src/index.css`

Already exists: `--breakpoint-tablet: 768px`

Verify Tailwind generates `tablet:` prefix.

## Todo

- [ ] Add isSearchOpen state
- [ ] Create mobile search icon button
- [ ] Shorten tablet search bar (`max-w-[180px]`)
- [ ] Create mobile search overlay
- [ ] Import X icon from lucide-react
- [ ] Test on mobile/tablet/desktop

## Success Criteria

- Mobile: Search icon, tap opens full overlay
- Tablet: Shorter search bar, not touching icons
- Desktop: Full search bar as before
