import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface PageToolbarProps extends HTMLAttributes<HTMLDivElement> {
  left?: ReactNode;
  right?: ReactNode;
}

export function PageToolbar({ left, right, className, children, ...props }: PageToolbarProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-2',
        className,
      )}
      {...props}
    >
      {children ?? (
        <>
          {left ? <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">{left}</div> : null}
          {right ? <div className="ml-auto flex shrink-0 flex-wrap items-center justify-end gap-2">{right}</div> : null}
        </>
      )}
    </div>
  );
}
