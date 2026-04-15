import { CSSProperties, HTMLAttributes, Key } from 'react';

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  className?: string;
  style?: CSSProperties;
  key?: Key;
}

export function Skeleton({ className = '', variant = 'text', ...props }: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-surface-container-high';
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };
  return <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props} />;
}

export function CardSkeleton() {
  return (
    <div className="p-4 rounded-3xl bg-surface-container space-y-3">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-3">
      <Skeleton variant="circular" className="h-8 w-8" />
      <Skeleton className="h-4 flex-1" />
      <Skeleton className="h-4 w-20" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="p-6 rounded-3xl bg-surface-container space-y-4">
      <Skeleton className="h-5 w-1/3" />
      <div className="flex items-end gap-2 h-32">
        {[40, 65, 45, 80, 55, 70, 50].map((h, i) => (
          <Skeleton key={i} variant="rectangular" className="flex-1" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}
