import { useMemo } from 'react';
import { POSITION_LABEL } from '../../../lib/personnel/personnel-types';
import type { Personnel, PersonnelPosition, SkillAssessment } from '../../../lib/personnel/personnel-types';
import { PersonnelTable } from './personnel-table';

interface Props {
  personnel: Personnel[];
  assessmentsMap: Map<string, SkillAssessment[]>;
  onOpen?: (id: string) => void;
}

const POSITION_ORDER: PersonnelPosition[] = ['MARKETING', 'MEDIA', 'ACCOUNT'];

export function PersonnelGroupTable({ personnel, assessmentsMap, onOpen }: Props) {
  const groups = useMemo(() => {
    const map = new Map<PersonnelPosition, Personnel[]>();
    personnel.forEach((p) => {
      const arr = map.get(p.position) ?? [];
      arr.push(p);
      map.set(p.position, arr);
    });
    return POSITION_ORDER
      .filter((pos) => (map.get(pos)?.length ?? 0) > 0)
      .map((pos) => ({ position: pos, rows: map.get(pos) ?? [] }));
  }, [personnel]);

  return (
    <div className="space-y-4">
      {groups.map((g) => (
        <section key={g.position}>
          <h3 className="mb-2 px-4 text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] text-accent-text">
            {POSITION_LABEL[g.position]} <span className="text-on-surface-variant">({g.rows.length})</span>
          </h3>
          <PersonnelTable personnel={g.rows} assessmentsMap={assessmentsMap} onOpen={onOpen} />
        </section>
      ))}
    </div>
  );
}
