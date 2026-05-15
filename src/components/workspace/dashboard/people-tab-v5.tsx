/**
 * PeopleTabV5 — Dashboard "People" tab
 * Shows team performance overview: tier distribution + individual score cards.
 * Clicking "View all" links to /personnel.
 */
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus, Users2, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { GlassCard } from '@/components/ui/glass-card';
import { Skeleton } from '@/components/ui/skeleton';
import type { PerformanceTier } from '@/hooks/use-personnel';
import { usePersonnelList } from '@/hooks/use-personnel';

const TIER_COLOR: Record<PerformanceTier, 'success' | 'warning' | 'error' | 'neutral'> = {
  EXCEPTIONAL: 'success',
  STRONG: 'success',
  DEVELOPING: 'warning',
  UNDERPERFORM: 'error',
};

function TrendIcon({ score }: { score: number }) {
  if (score >= 1.0) return <TrendingUp size={13} className="shrink-0 text-success" />;
  if (score >= 0.7) return <Minus size={13} className="shrink-0 text-warning" />;
  return <TrendingDown size={13} className="shrink-0 text-error" />;
}

export function PeopleTabV5() {
  const navigate = useNavigate();
  const { data: personnel = [], isLoading } = usePersonnelList();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} variant="rect" className="h-24 rounded-[var(--radius-card)]" />
        ))}
      </div>
    );
  }

  if (!personnel.length) {
    return (
      <EmptyState
        icon={<Users2 size={32} />}
        title="No personnel data yet"
        description="Go to the Personnel page to add staff profiles and assessments."
        actions={
          <Button size="sm" onClick={() => navigate('/personnel')}>
            Open Personnel
          </Button>
        }
      />
    );
  }

  const tierCounts = useMemo(() => personnel.reduce<Record<string, number>>((acc, p) => {
    const tier = p.staffProfile?.performanceSnapshots?.[0]?.tier ?? 'NO_DATA';
    acc[tier] = (acc[tier] ?? 0) + 1;
    return acc;
  }, {}), [personnel]);

  const avgScore = useMemo(() => {
    const withProfile = personnel.filter(p => p.staffProfile);
    return withProfile.length
      ? withProfile.reduce((s, p) => {
          const snap = p.staffProfile?.performanceSnapshots?.[0];
          return s + (snap?.adjustedScore ?? 0);
        }, 0) / withProfile.length
      : 0;
  }, [personnel]);

  return (
    <div className="space-y-5">
      {/* Summary KPI row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-text-1">{personnel.length}</p>
          <p className="text-xs text-text-muted">Total Staff</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-success">{(tierCounts['EXCEPTIONAL'] ?? 0) + (tierCounts['STRONG'] ?? 0)}</p>
          <p className="text-xs text-text-muted">Strong+</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-warning">{tierCounts['DEVELOPING'] ?? 0}</p>
          <p className="text-xs text-text-muted">Developing</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-text-1">{avgScore.toFixed(2)}</p>
          <p className="text-xs text-text-muted">Avg Score</p>
        </GlassCard>
      </div>

      {/* Per-person cards */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-text-muted uppercase tracking-wider">Individual Performance</p>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate('/personnel')}
            className="gap-1.5 text-xs"
          >
            View all <ExternalLink size={11} />
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {personnel.map(person => {
            const snap = person.staffProfile?.performanceSnapshots?.[0];
            const latestAssess = person.staffProfile?.skillAssessments?.[0];
            const lvl = person.staffProfile?.level;
            return (
              <button
                key={person.id}
                type="button"
                onClick={() => navigate('/personnel')}
                className="group flex items-center gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-3 text-left transition hover:border-[var(--brand-500)]/40 hover:bg-surface-2"
              >
                {person.avatar ? (
                  <img src={person.avatar} alt={person.fullName} className="size-9 shrink-0 rounded-full object-cover" />
                ) : (
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--brand-500)]/20 text-xs font-bold text-[var(--brand-500)]">
                    {person.fullName.split(' ').map(w => w[0]).slice(0, 2).join('')}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text-1">{person.fullName}</p>
                  <p className="truncate text-[11px] text-text-muted">{person.scope ?? '—'} · {lvl ?? '—'}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {snap ? (
                    <>
                      <div className="flex items-center gap-1">
                        <TrendIcon score={snap.adjustedScore} />
                        <Badge variant={TIER_COLOR[snap.tier]} size="sm">{snap.adjustedScore.toFixed(2)}</Badge>
                      </div>
                    </>
                  ) : latestAssess ? (
                    <span className="text-xs text-text-muted">{latestAssess.overallScore.toFixed(0)}/100</span>
                  ) : (
                    <span className="text-xs text-text-muted">—</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
