import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../../lib/cn';

export interface PageSectionStackProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function PageSectionStack({ className, children, ...props }: PageSectionStackProps) {
  return (
    <div className={cn('flex h-full flex-col gap-5 pb-8', className)} {...props}>
      {children}
    </div>
  );
}
