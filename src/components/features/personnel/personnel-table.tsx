import { useMemo, useState } from 'react';
import { Eye } from 'lucide-react';
import { Badge, SortableTh, TableShell, formatTableDate, getTableContract } from '../../ui';
import { POSITION_LABEL } from '../../../lib/personnel/personnel-types';
import type { Personnel, PersonnelPosition, SkillAssessment } from '../../../lib/personnel/personnel-types';

type SortKey = 'name' | 'position' | 'startDate';
type SortDir = 'asc' | 'desc';

const C = getTableContract('standard');

const POSITION_BADGE: Record<PersonnelPosition, 'info' | 'primary' | 'success'> = {
  MARKETING: 'primary',
  MEDIA: 'info',
  ACCOUNT: 'success',
};

function tenureLabel(startDate: string): string {
  const start = new Date(startDate);
  const now = new Date();
  const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  if (months < 1) return 'Mới onboard';
  if (months < 12) return `${months} tháng`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return m === 0 ? `${y} năm` : `${y}n ${m}t`;
}

interface PersonnelTableProps {
  personnel: Personnel[];
  assessmentsMap: Map<string, SkillAssessment[]>;
  onOpen?: (id: string) => void;
}

export function PersonnelTable({ personnel, assessmentsMap, onOpen }: PersonnelTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = useMemo(() => {
    const copy = [...personnel];
    copy.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') cmp = a.user.fullName.localeCompare(b.user.fullName);
      else if (sortKey === 'position') cmp = a.position.localeCompare(b.position);
      else if (sortKey === 'startDate') cmp = a.startDate.localeCompare(b.startDate);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [personnel, sortKey, sortDir]);

  if (personnel.length === 0) return null;

  return (
    <TableShell variant="standard">
      <thead>
        <tr className={C.headerRow}>
          <SortableTh sortKey="name" current={sortKey} dir={sortDir} onClick={handleSort} className={C.headerCell}>Personnel</SortableTh>
          <SortableTh sortKey="position" current={sortKey} dir={sortDir} onClick={handleSort} className={C.headerCell}>Position</SortableTh>
          <SortableTh sortKey="startDate" current={sortKey} dir={sortDir} onClick={handleSort} className={C.headerCell}>Start Date</SortableTh>
          <th className={C.headerCell}>Tenure</th>
          <th className={C.headerCell}>Last Assessment</th>
          <th className={C.headerCell}>Status</th>
          <th className={C.actionHeaderCell} aria-label="Actions" />
        </tr>
      </thead>
      <tbody className={C.body}>
        {sorted.map((p) => {
          const assessments = assessmentsMap.get(p.id) ?? [];
          const latest = assessments[0];
          return (
            <tr key={p.id} className={C.row}>
              <td className={C.cell}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-8 shrink-0 overflow-hidden rounded-full bg-surface-2">
                    {p.user.avatar ? (
                      <img src={p.user.avatar} alt={p.user.fullName} className="size-full object-cover" loading="lazy" />
                    ) : (
                      <div className="flex size-full items-center justify-center text-sm font-semibold text-on-surface-variant">
                        {p.user.fullName.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-on-surface font-medium">{p.user.fullName}</div>
                    <div className="truncate text-[length:var(--text-caption)] text-on-surface-variant">@{p.user.username}</div>
                  </div>
                </div>
              </td>
              <td className={C.cell}>
                <Badge variant={POSITION_BADGE[p.position]} size="sm">{POSITION_LABEL[p.position]}</Badge>
              </td>
              <td className={`${C.cell} text-on-surface-variant`}>{formatTableDate(p.startDate)}</td>
              <td className={`${C.cell} text-on-surface-variant`}>{tenureLabel(p.startDate)}</td>
              <td className={`${C.cell} text-on-surface-variant`}>
                {latest ? latest.quarter : <span className="italic">Chưa có</span>}
              </td>
              <td className={C.cell}>
                <Badge variant="success" size="sm">On Track</Badge>
              </td>
              <td className={C.actionCell}>
                <button
                  type="button"
                  onClick={() => onOpen?.(p.id)}
                  aria-label={`Open profile ${p.user.fullName}`}
                  className="inline-flex size-7 items-center justify-center rounded-button text-on-surface-variant transition-colors hover:bg-surface-2 hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35"
                >
                  <Eye className="size-4" />
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </TableShell>
  );
}
