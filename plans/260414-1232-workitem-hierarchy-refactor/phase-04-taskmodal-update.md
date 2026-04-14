# Phase 4: TaskModal Component Update

## Overview

Update TaskModal để:
- Bỏ "Link to Key Result" dropdown
- Thêm "Link to Parent" cho edit mode (Epic/Story only)
- Filter type options theo context

**Priority:** High | **Effort:** 45m | **Risk:** Medium

## Context

- [TaskModal](../../src/components/board/TaskModal.tsx)
- [Types](../../src/types/index.ts)

## Requirements

### Functional
- Remove KR linking UI
- Add parent selection (Epic/Story) for edit mode
- Accept `allowedTypes` prop to filter type dropdown

### Non-functional
- Backward compatible props
- Clean UI/UX

## Implementation Steps

### Step 1: Update Props Interface

```typescript
interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: WorkItem) => void;
  defaultType?: WorkItemType;
  defaultStatus?: string;
  initialData?: WorkItem | null;
  allowedTypes?: WorkItemType[]; // NEW: Filter type dropdown
}
```

### Step 2: Remove KR Linking State & UI

Remove:
- `linkedKrId` state
- `keyResults` state
- `loadingKR` state
- `fetchKeyResults` useEffect
- "Link to Key Result" dropdown JSX

### Step 3: Add Parent Selection (Edit Mode Only)

Add state:
```typescript
const [parentId, setParentId] = useState<string | undefined>(initialData?.parentId);
const [availableParents, setAvailableParents] = useState<WorkItem[]>([]);
const [loadingParents, setLoadingParents] = useState(false);
```

Add fetch logic:
```typescript
useEffect(() => {
  if (!isOpen || !initialData) return; // Only for edit mode
  
  const fetchParents = async () => {
    setLoadingParents(true);
    try {
      const res = await fetch('/api/work-items');
      if (res.ok) {
        const items: WorkItem[] = await res.json();
        // Filter to Epic/Story only, exclude self
        const parents = items.filter(
          item => ['Epic', 'UserStory'].includes(item.type) && item.id !== initialData?.id
        );
        setAvailableParents(parents);
      }
    } catch (error) {
      console.error('Failed to fetch parents:', error);
    } finally {
      setLoadingParents(false);
    }
  };
  
  fetchParents();
}, [isOpen, initialData]);
```

### Step 4: Filter Type Dropdown

```typescript
const typeOptions = allowedTypes || [
  'Epic', 'UserStory', 'TechTask', 'Campaign', 
  'MktTask', 'MediaTask', 'SaleTask', 'Deal'
];
```

Update select:
```tsx
<select value={type} onChange={(e) => setType(e.target.value as WorkItemType)}>
  {typeOptions.map(t => (
    <option key={t} value={t}>{t}</option>
  ))}
</select>
```

### Step 5: Add Parent Dropdown (Edit Mode)

```tsx
{initialData && !['Epic'].includes(type) && (
  <div>
    <label>Link to Parent (Optional)</label>
    {loadingParents ? (
      <div>Loading parents...</div>
    ) : (
      <select
        value={parentId || ''}
        onChange={(e) => setParentId(e.target.value || undefined)}
      >
        <option value="">No Parent</option>
        {availableParents.map(p => (
          <option key={p.id} value={p.id}>
            [{p.type}] {p.title}
          </option>
        ))}
      </select>
    )}
  </div>
)}
```

### Step 6: Update handleSave

```typescript
const handleSave = () => {
  if (!title.trim()) return;

  const newTask: WorkItem = {
    ...initialData,
    id: initialData?.id || `task-${Date.now()}`,
    title,
    description,
    type,
    priority,
    assigneeId,
    status,
    dueDate: dueDate || undefined,
    startDate: startDate || undefined,
    storyPoints,
    parentId: parentId || undefined, // NEW
    // Remove: linkedKrId
  };

  onSave(newTask);
  onClose();
};
```

## Todo

- [x] Add allowedTypes prop
- [x] Remove linkedKrId state and UI
- [x] Remove fetchKeyResults logic
- [x] Add parent selection state
- [x] Add fetchParents logic
- [x] Filter type dropdown by allowedTypes
- [x] Add parent dropdown UI (edit mode only)
- [x] Update handleSave to include parentId

## Success Criteria

- [x] No KR linking UI
- [x] Parent selection works in edit mode
- [x] Type dropdown respects allowedTypes prop
