import { useCallback, useEffect, useState } from 'react';

interface Options {
  /** Number of items to navigate. */
  count: number;
  /** Index to focus when activated. -1 = nothing focused yet. */
  initialIndex?: number;
  /** Wrap from last → first and vice versa. Default true. */
  loop?: boolean;
  /** Disable nav. */
  enabled?: boolean;
  /** Called when user activates current item (Enter/Space). */
  onSelect?: (index: number) => void;
}

/**
 * Arrow Up / Down keyboard navigation across a list of `count` items.
 * Returns `{activeIndex, setActiveIndex, onKeyDown}` for attachment to a roving container.
 */
export function useKeyboardListNav({
  count,
  initialIndex = -1,
  loop = true,
  enabled = true,
  onSelect,
}: Options) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  // Clamp when count shrinks.
  useEffect(() => {
    if (activeIndex >= count) setActiveIndex(count > 0 ? count - 1 : -1);
  }, [count, activeIndex]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!enabled || count === 0) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => {
          const next = i + 1;
          if (next >= count) return loop ? 0 : count - 1;
          return next;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => {
          const next = i - 1;
          if (next < 0) return loop ? count - 1 : 0;
          return next;
        });
      } else if (e.key === 'Home') {
        e.preventDefault();
        setActiveIndex(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setActiveIndex(count - 1);
      } else if ((e.key === 'Enter' || e.key === ' ') && activeIndex >= 0) {
        e.preventDefault();
        onSelect?.(activeIndex);
      }
    },
    [count, loop, enabled, activeIndex, onSelect],
  );

  return { activeIndex, setActiveIndex, onKeyDown };
}
