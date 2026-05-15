import { format } from 'date-fns';
import { Minus, TrendingDown, TrendingUp, Users2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import type { DataTableColumn } from '@/components/ui/data-table';
import type { PersonnelListItem, PerformanceTier, StaffLevel } from '@/hooks/use-personnel';

const LEVEL_COLOR: Record<StaffLevel, 'neutral' | 'info' | 'warning' | 'success'> = {
  INTERN: 'neutral',
  JUNIOR: 'neutral',
  MIDDLE: 'info',
  SENIOR: 'warning',
  LEAD: 'success',
  MANAGER: 'success',
};

const TIER_COLOR: Record<PerformanceTier, 'success' | 'warning' | 'error' | 'neutral'> = {
  EXCEPTIONAL: 'success',
  STRONG: 'success',
  DEVELOPING: 'warning',
  UNDERPERFORM: 'error',
};

const TIER_LABEL: Record<PerformanceTier, string> = {
  EXCEPTIONAL: 'Exceptional',
  STRONG: 'Strong',
  DEVELOPING: 'Developing',
  UNDERPERFORM: 'Under',
};

function TrendIcon({ score }: { score: number }) {
  if (score >= 1) return <TrendingUp size={13} className="text-success" />;
  if (score >= 0.7) return <Minus size={13} className="text-warning" />;
  return <TrendingDown size={13} className="text-error" />;
}

function AvatarCell({ name, avatar }: { name: string; avatar: string }) {
  if (avatar) {
    return <img src={avatar} alt={name} className="size-7 rounded-full object-cover" />;
  }

  const initials = name.split(' ').map((word) => word[0]).slice(0, 2).join('').toUpperCase();
  return (
    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[var(--brand-500)]/20 text-[10px] font-bold text-[var(--brand-500)]">
      {initials}
    </span>
  );
}

const columns: DataTableColumn<PersonnelListItem>[] = [
  {
    key: 'fullName',
    label: 'Name',
    render: (row) => (
      <div className="flex items-center gap-2.5">
        <AvatarCell name={row.fullName} avatar={row.avatar} />
        <div className="min-w-0">
          <p className="truncate font-semibold text-text-1">{row.fullName}</p>
          <p className="truncate text-[11px] text-text-muted">{row.scope ?? '—'}</p>
        </div>
      </div>
    ),
  },
  {
    key: 'level',
    label: 'Level',
    render: (row) => {
      const level = row.staffProfile?.level;
      if (!level) return <span className="text-text-muted">—</span>;
      return <Badge variant={LEVEL_COLOR[level]} size="sm">{level}</Badge>;
    },
  },
  {
    key: 'skillScore',
    label: 'Skill Score',
    align: 'right',
    render: (row) => {
      const latest = row.staffProfile?.skillAssessments?.[0];
      if (!latest) return <span className="text-text-muted">—</span>;
      return (
        <span className="font-mono font-semibold text-text-1">
          {latest.overallScore.toFixed(0)}
          <span className="font-normal text-text-muted">/100</span>
        </span>
      );
    },
  },
  {
    key: 'performance',
    label: 'Performance',
    align: 'right',
    render: (row) => {
      const snap = row.staffProfile?.performanceSnapshots?.[0];
      if (!snap) return <span className="text-text-muted">—</span>;
      return (
        <div className="flex items-center justify-end gap-1.5">
          <TrendIcon score={snap.adjustedScore} />
          <Badge variant={TIER_COLOR[snap.tier]} size="sm">{TIER_LABEL[snap.tier]}</Badge>
          <span className="font-mono text-xs text-text-muted">{snap.adjustedScore.toFixed(2)}</span>
        </div>
      );
    },
  },
  {
    key: 'lastAssessment',
    label: 'Last Assessed',
    align: 'right',
    render: (row) => {
      const latest = row.staffProfile?.skillAssessments?.[0];
      if (!latest) return <span className="text-text-muted">—</span>;
      return <span className="text-xs text-text-muted">{format(new Date(latest.assessedAt), 'dd/MM/yyyy')}</span>;
    },
  },
];

interface PersonnelTableProps {
  data: PersonnelListItem[];
  error: Error | null;
  isLoading: boolean;
  onSelect: (userId: string) => void;
}

export function PersonnelTable({ data, error, isLoading, onSelect }: PersonnelTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2 p-1">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} variant="rect" className="h-12 w-full rounded-[var(--radius-input)]" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={<Users2 size={32} />}
        title="Could not load personnel"
        description={error.message}
      />
    );
  }

  return (
    <DataTable<PersonnelListItem>
      columns={columns}
      data={data}
      rowKey={(row) => row.id}
      onRowClick={(row) => onSelect(row.id)}
      label="Personnel directory"
      empty={
        <EmptyState
          title="No personnel records"
          description="Add team members and fill in their StaffProfile to see data here."
        />
      }
    />
  );
}
