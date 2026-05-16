/**
 * Personnel list grid. Responsive 3/2/1 cols.
 */

import { useQueries } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { PersonnelCard } from './personnel-card';
import type { Personnel, SkillAssessment } from '../../../lib/personnel/personnel-types';

interface Props {
  personnel: Personnel[];
  onOpen?: (id: string) => void;
}

export function PersonnelListGrid({ personnel, onOpen }: Props) {
  const assessmentQueries = useQueries({
    queries: personnel.map((p) => ({
      queryKey: ['skill-assessments', p.id],
      queryFn: () => api.get<SkillAssessment[]>(`/personnel/${p.id}/assessments`),
      staleTime: 60_000,
    })),
  });

  if (personnel.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-neutral-900/40 p-12 text-center text-neutral-400">
        Chưa có hồ sơ nhân sự nào. Admin có thể tạo từ trang User Management.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {personnel.map((p, i) => (
        <PersonnelCard
          key={p.id}
          personnel={p}
          assessments={assessmentQueries[i].data ?? []}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}
