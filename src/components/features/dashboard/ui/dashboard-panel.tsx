import type { ReactNode } from 'react';
import { GlassCard } from '../../../ui';

/**
 * Generic dashboard panel wrapper — used as base by other dashboard/ui components.
 *
 * Phase 8 follow-up batch 10 (2026-05-11): re-export over v2 GlassCard
 * (variant=surface) — fixes legacy `rounded-card` inline class to `rounded-card`
 * token. API identical.
 */

interface DashboardPanelProps {
  children: ReactNode;
  className?: string;
}

export default function DashboardPanel({ children, className = '' }: DashboardPanelProps) {
  return (
    <GlassCard variant="surface" padding="none" className={className}>
      {children}
    </GlassCard>
  );
}
