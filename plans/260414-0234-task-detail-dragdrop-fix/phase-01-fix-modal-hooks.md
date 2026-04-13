# Phase 1: Fix TaskDetailsModal Hooks Order

## Context

- **File:** `src/components/board/TaskDetailsModal.tsx`
- **Problem:** `useEffect` called AFTER early return - violates React Hooks Rules
- **Effort:** 5 minutes

## Current Code (Bug)

```tsx
// Line 13-35
export default function TaskDetailsModal({ isOpen, onClose, task }: TaskDetailsModalProps) {
  const { users } = useAuth();
  const [allObjectives, setAllObjectives] = useState<Objective[]>([]);

  if (!isOpen || !task) return null;  // ❌ Early return BEFORE hook

  // ❌ Hook AFTER early return - VIOLATES RULES
  useEffect(() => {
    const fetchObjectives = async () => {
      try {
        const res = await fetch('/api/objectives');
        const data = await res.json();
        if (Array.isArray(data)) {
          setAllObjectives(data);
        }
      } catch (error) {
        console.error('Failed to fetch objectives:', error);
      }
    };
    fetchObjectives();
  }, []);
  // ...
}
```

## Fixed Code

```tsx
export default function TaskDetailsModal({ isOpen, onClose, task }: TaskDetailsModalProps) {
  const { users } = useAuth();
  const [allObjectives, setAllObjectives] = useState<Objective[]>([]);

  // ✅ Hook BEFORE early return
  useEffect(() => {
    if (!isOpen) return;  // Guard inside hook
    
    const fetchObjectives = async () => {
      try {
        const res = await fetch('/api/objectives');
        const data = await res.json();
        if (Array.isArray(data)) {
          setAllObjectives(data);
        }
      } catch (error) {
        console.error('Failed to fetch objectives:', error);
      }
    };
    fetchObjectives();
  }, [isOpen]);  // Add isOpen dependency

  // ✅ Early return AFTER hooks
  if (!isOpen || !task) return null;
  
  // ... rest of component
}
```

## Implementation Steps

- [ ] Open `src/components/board/TaskDetailsModal.tsx`
- [ ] Move `useEffect` block (lines 22-35) to BEFORE the early return (line 17)
- [ ] Add `if (!isOpen) return;` guard at start of useEffect
- [ ] Add `isOpen` to useEffect dependency array
- [ ] Test: Click "View Details" on any task card

## Verification

```bash
# Start dev server
npm run dev

# Test in browser:
# 1. Go to any workspace (Tech, Marketing, etc.)
# 2. Click task card menu (3 dots)
# 3. Click "View Details"
# 4. Modal should open without crash
# 5. Check console for errors
```

## Notes

- This is a common React anti-pattern
- All hooks must be called in same order every render
- Early returns before hooks break this rule
