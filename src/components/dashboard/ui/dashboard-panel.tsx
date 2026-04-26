import type { ReactNode } from 'react';

interface DashboardPanelProps {
  children: ReactNode;
  className?: string;
}

const baseClassName = 'bg-white/50 backdrop-blur-md border border-white/20 rounded-3xl shadow-sm';

export default function DashboardPanel({ children, className = '' }: DashboardPanelProps) {
  return <div className={`${baseClassName} ${className}`.trim()}>{children}</div>;
}
