import { Suspense, useMemo, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { Users } from 'lucide-react';
import { api } from '../lib/api';
import { usePersonnelListQuery } from '../hooks/use-personnel';
import { PersonnelToolbar } from '../components/features/personnel/personnel-toolbar';
import type { PersonnelFilter } from '../components/features/personnel/personnel-toolbar';
import { PersonnelTable } from '../components/features/personnel/personnel-table';
import { PersonnelGroupTable } from '../components/features/personnel/personnel-group-table';
import { PersonnelProfileDrawer } from '../components/features/personnel/personnel-profile-drawer';
import { Card, EmptyState, GlassCard, PageSectionStack, Skeleton, StatBar } from '../components/ui';
import type { SkillAssessment } from '../lib/personnel/personnel-types';

export default function PersonnelPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState<PersonnelFilter>({});
  const { data, isLoading, error } = usePersonnelListQuery();

  const personnel = data ?? [];

  const assessmentQueries = useQueries({
    queries: personnel.map((p) => ({
      queryKey: ['skill-assessments', p.id],
      queryFn: () => api.get<SkillAssessment[]>(`/personnel/${p.id}/assessments`),
      staleTime: 60_000,
    })),
  });

  const assessmentsMap = useMemo(() => {
    const map = new Map<string, SkillAssessment[]>();
    personnel.forEach((p, i) => {
      map.set(p.id, assessmentQueries[i]?.data ?? []);
    });
    return map;
  }, [personnel, assessmentQueries]);

  const filtered = useMemo(() => {
    const q = filter.search?.trim().toLowerCase() ?? '';
    return personnel.filter((p) => {
      if (filter.position && p.position !== filter.position) return false;
      if (q) {
        const blob = `${p.user.fullName} ${p.user.username} ${p.position}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });
  }, [personnel, filter]);

  const statGroups = useMemo(() => {
    const count = (pos: string) => filtered.filter((p) => p.position === pos).length;
    return [
      {
        items: [
          { label: 'Total', value: filtered.length, dotClass: 'bg-on-surface-variant' },
          { label: 'Marketing', value: count('MARKETING'), dotClass: 'bg-accent' },
          { label: 'Media', value: count('MEDIA'), dotClass: 'bg-info' },
          { label: 'Account', value: count('ACCOUNT'), dotClass: 'bg-success' },
        ],
      },
    ];
  }, [filtered]);

  const patchFilter = (patch: Partial<PersonnelFilter>) =>
    setFilter((prev) => ({ ...prev, ...patch }));

  const isGrouped = filter.groupBy === 'position';

  return (
    <PageSectionStack>
      <PersonnelToolbar filter={filter} onChange={patchFilter} />

      <GlassCard variant="surface" padding="sm" className="shrink-0">
        <StatBar groups={statGroups} />
      </GlassCard>

      <section className="flex flex-1 min-h-0 flex-col" aria-label="Personnel">
        <Card padding="none" glow className="flex-1 min-h-0 overflow-y-auto">
          <Suspense
            fallback={
              <div className="flex flex-col gap-2 p-4">
                <Skeleton variant="rect" height={40} />
                <Skeleton variant="rect" height={40} />
                <Skeleton variant="rect" height={40} />
              </div>
            }
          >
            {error ? (
              <EmptyState
                variant="inline"
                title="Failed to load personnel"
                description={(error as Error)?.message ?? 'Unknown error'}
              />
            ) : isLoading ? (
              <div className="flex flex-col gap-2 p-4">
                <Skeleton variant="rect" height={40} />
                <Skeleton variant="rect" height={40} />
                <Skeleton variant="rect" height={40} />
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                variant="inline"
                icon={<Users />}
                title="No personnel found"
                description="Thử bỏ filter hoặc thêm nhân sự từ User Management."
              />
            ) : isGrouped ? (
              <PersonnelGroupTable personnel={filtered} assessmentsMap={assessmentsMap} onOpen={setOpenId} />
            ) : (
              <PersonnelTable personnel={filtered} assessmentsMap={assessmentsMap} onOpen={setOpenId} />
            )}
          </Suspense>
        </Card>
      </section>

      {openId && <PersonnelProfileDrawer personnelId={openId} onClose={() => setOpenId(null)} />}
    </PageSectionStack>
  );
}
