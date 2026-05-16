import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Sidebar from './sidebar';

interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
  onCollapsedChange: (collapsed: boolean) => void;
  onLogout: () => void;
}

const DRAWER_TRANSITION = { duration: 0.25, ease: [0.2, 0, 0, 1] as const };

export default function MobileNavDrawer({ open, onClose, onCollapsedChange, onLogout }: MobileNavDrawerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    closeButtonRef.current?.focus();
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-modal xl:hidden" role="dialog" aria-modal="true" aria-label="Mobile navigation">
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={DRAWER_TRANSITION}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-label="Close navigation overlay"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={DRAWER_TRANSITION}
            className="absolute left-0 top-0 h-full w-[min(20rem,86vw)]"
          >
            <Sidebar collapsed={false} onCollapsedChange={onCollapsedChange} onLogout={onLogout} onNavigate={onClose} />
          </motion.div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-text-1 shadow-elevated"
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>
      )}
    </AnimatePresence>
  );
}
