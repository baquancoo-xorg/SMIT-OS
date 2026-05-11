import { ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react';
import type { ReactNode } from 'react';
import type { SortDirection } from './use-sortable-data';

interface SortableThProps<K extends string> {
  sortKey: K;
  current: K;
  dir: SortDirection;
  onClick: (key: K) => void;
  children: ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
}

/**
 * Sortable table header cell — click to toggle sort direction.
 * Arrow indicator: ↑ asc / ↓ desc when active, ↕ when inactive.
 */
export function SortableTh<K extends string>({
  sortKey,
  current,
  dir,
  onClick,
  children,
  className = '',
  align = 'left',
}: SortableThProps<K>) {
  const isActive = sortKey === current;
  const Icon = !isActive ? ChevronsUpDown : dir === 'asc' ? ArrowUp : ArrowDown;

  const alignClass = align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start';

  return (
    <th className={className}>
      <button
        type="button"
        onClick={() => onClick(sortKey)}
        className={`inline-flex w-full items-center gap-1 ${alignClass} text-inherit transition-colors hover:text-on-surface focus-visible:outline-none cursor-pointer`}
        aria-sort={isActive ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}
      >
        <span>{children}</span>
        <Icon
          className={`size-3 ${isActive ? 'text-primary' : 'text-on-surface-variant/50'}`}
          aria-hidden="true"
        />
      </button>
    </th>
  );
}
