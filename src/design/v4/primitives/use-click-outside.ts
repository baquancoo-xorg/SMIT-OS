import { useEffect, type RefObject } from 'react';

/**
 * Call `handler` when a pointerdown lands outside `ref`.
 * Useful for dismissing popovers, dropdowns, modals via overlay click.
 */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  handler: (event: PointerEvent) => void,
  enabled = true,
): void {
  useEffect(() => {
    if (!enabled) return;
    const onDown = (e: PointerEvent) => {
      const el = ref.current;
      if (!el || el.contains(e.target as Node)) return;
      handler(e);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [ref, handler, enabled]);
}
