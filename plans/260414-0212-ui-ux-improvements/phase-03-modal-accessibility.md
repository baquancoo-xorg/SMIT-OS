# Phase 3: Modal Accessibility

## Priority: P1 (Short-term)

## Overview

Fix modal accessibility gaps: focus trap, ARIA attributes, body scroll lock.

## Issues Addressed

| # | Issue | Files Affected |
|---|-------|----------------|
| 7 | No focus trap | All modals |
| 7 | Missing role="dialog" | All modals |
| 7 | Missing aria-labelledby | All modals |
| 7 | No Escape handler | DailySync modals |
| 7 | Body scroll not locked | All modals |

---

## Task 1: Create Modal Wrapper Component

**New File:** `src/components/ui/Modal.tsx`

```tsx
import { ReactNode, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = `modal-title-${Math.random().toString(36).slice(2)}`;

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;
    
    const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    firstElement?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={`relative ${sizes[size]} w-full bg-surface rounded-3xl shadow-xl`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-outline/10">
              <h2 id={titleId} className="text-lg font-bold">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-surface-container focus:outline-none focus:ring-2 focus:ring-primary/50"
                aria-label="Close modal"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
```

---

## Task 2: Migrate Existing Modals

### TaskDetailsModal.tsx
- Wrap content with Modal component
- Remove duplicate backdrop/animation code

### TaskModal.tsx  
- Wrap content with Modal component
- Add proper title prop

### DailySync.tsx modals
- DailyReportModal (line 273-340)
- DailyReportDetailModal (line 342-418)
- Both need: Escape handler, focus trap, ARIA

### WeeklyCheckinModal.tsx
- Add role="dialog", aria-labelledby

---

## Files to Modify

**Create:**
- `src/components/ui/Modal.tsx`

**Update:**
- `src/components/board/TaskDetailsModal.tsx`
- `src/components/board/TaskModal.tsx`
- `src/components/modals/WeeklyCheckinModal.tsx`
- `src/pages/DailySync.tsx` - Inline modals

## Validation

```bash
# Check for modals missing role="dialog"
grep -rn "fixed inset-0" src/ | grep -v "role="

# Manual: Tab through modal, verify focus stays inside
```

## Success Criteria

- [x] All modals have focus trap
- [x] Escape closes all modals
- [x] Body scroll locked when modal open
- [x] All modals have role="dialog" and aria-labelledby
- [x] Focus returns to trigger element on close
