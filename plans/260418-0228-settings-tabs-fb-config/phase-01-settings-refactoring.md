# Phase 1 — Settings Tab Layout Refactoring

**Priority:** P1  •  **Status:** pending  •  **Effort:** 3h

## Context

- Plan: [../plan.md](./plan.md)
- Current file: `src/pages/Settings.tsx` (760 lines, monolithic)
- Pattern reference: Existing Settings.tsx UI styles

## Overview

Extract existing sections thành separate components, thêm tab navigation. Giữ nguyên 100% functionality hiện có.

## Requirements

**Functional**
- Tab navigation với 4 tabs: Users, Sprints, OKRs, FB Config
- Active tab state persisted trong URL query param (`?tab=users`)
- Keyboard navigation (arrow keys)
- Responsive: tabs horizontal on desktop, dropdown on mobile

**Non-functional**
- Each component <200 lines
- No functionality regression
- Same UI styling patterns

## Architecture

```
src/
├── pages/
│   └── Settings.tsx              # Thin wrapper (~80 lines)
└── components/settings/
    ├── settings-tabs.tsx         # Tab navigation component
    ├── user-management-tab.tsx   # Extract lines 96-512
    ├── sprint-cycles-tab.tsx     # Extract lines 514-614
    ├── okr-cycles-tab.tsx        # Extract lines 616-735
    └── fb-config-tab.tsx         # NEW (Phase 3)
```

## Files

**Create**
- `src/components/settings/settings-tabs.tsx`
- `src/components/settings/user-management-tab.tsx`
- `src/components/settings/sprint-cycles-tab.tsx`
- `src/components/settings/okr-cycles-tab.tsx`

**Modify**
- `src/pages/Settings.tsx` → thin wrapper only

## Implementation Steps

### 1. Create settings-tabs.tsx

```typescript
import { Users, Calendar, Target, Facebook } from 'lucide-react';

export type SettingsTabId = 'users' | 'sprints' | 'okrs' | 'fb-config';

interface Tab {
  id: SettingsTabId;
  label: string;
  icon: React.ElementType;
}

export const SETTINGS_TABS: Tab[] = [
  { id: 'users', label: 'Users', icon: Users },
  { id: 'sprints', label: 'Sprints', icon: Calendar },
  { id: 'okrs', label: 'OKRs', icon: Target },
  { id: 'fb-config', label: 'FB Config', icon: Facebook },
];

interface SettingsTabsProps {
  activeTab: SettingsTabId;
  onTabChange: (tab: SettingsTabId) => void;
}

export function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  return (
    <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl">
      {SETTINGS_TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              isActive
                ? 'bg-white text-primary shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon size={16} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
```

### 2. Extract user-management-tab.tsx

- Copy lines 96-512 từ Settings.tsx
- Extract states: `isAddingUser`, `editingUser`, `editFormData`, `newUser`
- Extract handlers: `handleAddUser`, `openEditUser`, `handleUpdateUser`, `handleDeleteUser`
- Props: `users`, `refreshUsers`, `currentUser`, `onDeleteConfirm`

### 3. Extract sprint-cycles-tab.tsx

- Copy lines 514-614
- Extract states: `sprints`, `isAddingSprint`, `editingSprint`, `newSprint`
- Extract handlers: sprint CRUD
- Self-contained fetch

### 4. Extract okr-cycles-tab.tsx

- Copy lines 616-735
- Extract states: `okrCycles`, `isAddingCycle`, `editingCycle`, `newCycle`
- Extract handlers: cycle CRUD
- Self-contained fetch

### 5. Refactor Settings.tsx

```typescript
import { useState } from 'react';
import { Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { SettingsTabs, SettingsTabId } from '../components/settings/settings-tabs';
import { UserManagementTab } from '../components/settings/user-management-tab';
import { SprintCyclesTab } from '../components/settings/sprint-cycles-tab';
import { OkrCyclesTab } from '../components/settings/okr-cycles-tab';
// import { FbConfigTab } from '../components/settings/fb-config-tab'; // Phase 3

export default function Settings() {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTabId>('users');

  if (!isAdmin) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-on-surface mb-2">Access Denied</h2>
          <p className="text-slate-500">Only administrators can access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 md:p-10 space-y-8 overflow-y-auto">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight">Workspace Settings</h2>
          <p className="text-slate-500 mt-2">Manage users, sprints, and configurations.</p>
        </div>
      </div>

      <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1">
        {activeTab === 'users' && <UserManagementTab />}
        {activeTab === 'sprints' && <SprintCyclesTab />}
        {activeTab === 'okrs' && <OkrCyclesTab />}
        {activeTab === 'fb-config' && <div>FB Config (Coming soon)</div>}
      </div>
    </div>
  );
}
```

## Todo

- [ ] Create `src/components/settings/` directory
- [ ] Create `settings-tabs.tsx`
- [ ] Extract `user-management-tab.tsx` từ Settings.tsx
- [ ] Extract `sprint-cycles-tab.tsx`
- [ ] Extract `okr-cycles-tab.tsx`
- [ ] Refactor `Settings.tsx` thành thin wrapper
- [ ] Test all existing functionality works
- [ ] Verify no console errors

## Success Criteria

- Settings page loads với tab navigation
- All 3 existing tabs (Users, Sprints, OKRs) work identically
- FB Config tab shows placeholder
- Each file <200 lines
- `npm run build` passes

## Risks

| Risk | Mitigation |
|------|------------|
| State sharing between tabs | Each tab self-contained, fetch own data |
| Delete confirmation modal | Keep in Settings.tsx, pass callback to tabs |
| Auth context dependencies | Pass via props or use hook in each tab |
