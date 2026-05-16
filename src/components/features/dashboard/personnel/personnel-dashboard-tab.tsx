/**
 * Dashboard Personnel tab — team overview for admin.
 * Mini cards (avatar + status + lastAssessment) + drilldown drawer reused.
 */

import { Suspense, useState } from 'react';
import { Users } from 'lucide-react';
import { usePersonnelListQuery } from '../../../../hooks/use-personnel';
import { PersonnelCard } from '../../personnel/personnel-card';
import { PersonnelProfileDrawer } from '../../personnel/personnel-profile-drawer';
import { useQueries } from '@tanstack/react-query';
import { api } from '../../../../lib/api';
import type { SkillAssessment } from '../../../../lib/personnel/personnel-types';
import { Card } from '../../../ui';

export default function PersonnelDashboardTab() {
  const [openId, setOpenId] = useState<string | null>(null);
  const { data, isLoading, error } = usePersonnelListQuery();

  const assessmentQueries = useQueries({
    queries: (data ?? []).map((p) => ({
      queryKey: ['skill-assessments', p.id],
      queryFn: () => api.get<SkillAssessment[]>(`/personnel/${p.id}/assessments`),
      staleTime: 60_000,
    })),
  });

  return (
    <div className="space-y-4">
      <Card padding="md">
        <div className="flex items-center gap-3">
          <div className="rounded-card bg-surface-2 p-2 text-accent-text">
            <Users className="size-4" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-text-muted">Team Personnel</p>
            <h2 className="font-headline text-lg font-black text-text-1">
              {data?.length ?? 0} nhân sự đang có hồ sơ
            </h2>
          </div>
        </div>
      </Card>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-card bg-surface-2" />
          ))}
        </div>
      )}

      {error && (
        <Card padding="md">
          <p className="text-sm text-error">Lỗi tải: {(error as Error).message}</p>
        </Card>
      )}

      {data && data.length === 0 && (
        <Card padding="lg">
          <p className="text-sm text-text-2">Chưa có Personnel record. Admin tạo qua Settings → Users → Edit user.</p>
        </Card>
      )}

      {data && data.length > 0 && (
        <Suspense fallback={<div className="h-32 animate-pulse rounded-card bg-surface-2" />}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.map((p, i) => (
              <PersonnelCard
                key={p.id}
                personnel={p}
                assessments={assessmentQueries[i]?.data ?? []}
                onOpen={setOpenId}
              />
            ))}
          </div>
        </Suspense>
      )}

      {openId && <PersonnelProfileDrawer personnelId={openId} onClose={() => setOpenId(null)} />}
    </div>
  );
}
