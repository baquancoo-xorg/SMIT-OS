import type { ReactNode } from 'react';
import { Card } from './card';

interface SectionCardProps {
  /** Small uppercase eyebrow text above the title (e.g. "Acquisition") */
  eyebrow: string;
  /** Main section heading (e.g. "Journey Funnel") */
  title: string;
  /** Section body */
  children: ReactNode;
  /** Forwarded to Card */
  className?: string;
}

/**
 * Standard dashboard section shell: gradient card + eyebrow label + headline.
 * Extracted from the previous v5/dashboard/*-v5 wrappers (commit fcd495f follow-up).
 * Replaces the inline `<Card padding="md" glow>` + heading pattern.
 */
export function SectionCard({ eyebrow, title, children, className }: SectionCardProps) {
  return (
    <Card padding="md" glow className={`space-y-4${className ? ` ${className}` : ''}`}>
      {/* ui-canon-ok: section header font-black for KPI headline */}
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-accent-text">{eyebrow}</p>
        <h2 className="mt-1 font-headline text-2xl font-black tracking-tight text-text-1">{title}</h2>
      </div>
      {children}
    </Card>
  );
}
