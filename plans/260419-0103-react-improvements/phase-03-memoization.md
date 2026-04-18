# Phase 3: Memoization & Performance

**Effort:** 1.5h | **Priority:** P1 | **Status:** completed

## Tasks

### 3.1 Memoize AuthContext Value

**Update src/contexts/AuthContext.tsx:**
```tsx
import { useMemo } from 'react';

// Inside AuthProvider component:
const contextValue = useMemo(() => ({
  currentUser,
  setCurrentUser,
  users,
  loading,
  isAdmin: currentUser?.isAdmin || false,
  login,
  logout,
  refreshUsers: fetchUsers
}), [currentUser, users, loading, login, logout, fetchUsers]);

return (
  <AuthContext.Provider value={contextValue}>
    {children}
  </AuthContext.Provider>
);
```

### 3.2 Memoize TaskCard Component

**Update src/components/board/TaskCard.tsx:**
```tsx
import { memo, useMemo, useCallback } from 'react';

interface TaskCardProps {
  item: WorkItem;
  onUpdate: (id: string, updates: Partial<WorkItem>) => void;
  onDelete: (id: string) => void;
}

export default memo(function TaskCard({ item, onUpdate, onDelete }: TaskCardProps) {
  // Memoize expensive lookups
  const linkedKr = useMemo(() => item.krLinks?.[0]?.keyResult, [item.krLinks]);
  
  // Memoize callbacks that use item.id
  const handleStatusChange = useCallback((status: string) => {
    onUpdate(item.id, { status });
  }, [item.id, onUpdate]);

  const handleDelete = useCallback(() => {
    onDelete(item.id);
  }, [item.id, onDelete]);

  // ... rest of component
});
```

### 3.3 Memoize Sidebar NavItem

**Update src/components/layout/Sidebar.tsx:**
```tsx
import { memo, useMemo } from 'react';

// Extract NavItem as memoized component
const NavItem = memo(function NavItem({ 
  to, icon: Icon, label, isActive 
}: { 
  to: string; 
  icon: any; 
  label: string; 
  isActive: boolean;
}) {
  return (
    <NavLink to={to} className={...}>
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </NavLink>
  );
});

// In Sidebar, memoize nav items array
const navItems = useMemo(() => [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/board', icon: Kanban, label: 'Board' },
  // ...
], []);
```

### 3.4 Wrap useCallback for Inline Handlers

**Pattern for high-render components:**
```tsx
// Before (creates new function every render)
onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}

// After (stable reference)
const toggleMenu = useCallback((e: React.MouseEvent) => {
  e.stopPropagation();
  setIsMenuOpen(prev => !prev);
}, []);
// ...
onClick={toggleMenu}
```

Apply to:
- TaskCard.tsx menu toggle
- TaskTableView.tsx row handlers
- DailyReportBase.tsx modal handlers

## Checklist

- [ ] AuthContext value wrapped in useMemo
- [ ] TaskCard wrapped in memo
- [ ] TaskCard uses useCallback for handlers
- [ ] Sidebar NavItem extracted and memoized
- [ ] Inline handlers converted to useCallback
- [ ] No unnecessary re-renders (React DevTools)
