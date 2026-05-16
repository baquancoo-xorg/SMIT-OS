import { useCallback, useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { CustomSelect, PageToolbar } from '../../ui';
import type { PersonnelPosition } from '../../../lib/personnel/personnel-types';

export interface PersonnelFilter {
  search?: string;
  position?: PersonnelPosition;
  groupBy?: 'position';
}

const POSITION_OPTIONS = [
  { value: '', label: 'All Positions' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'MEDIA', label: 'Media' },
  { value: 'ACCOUNT', label: 'Account' },
];

const GROUP_OPTIONS = [
  { value: '', label: 'No grouping' },
  { value: 'position', label: 'By Position' },
];

interface Props {
  filter: PersonnelFilter;
  onChange: (patch: Partial<PersonnelFilter>) => void;
}

export function PersonnelToolbar({ filter, onChange }: Props) {
  const [searchDraft, setSearchDraft] = useState(filter.search ?? '');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchDraft(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => onChange({ search: value || undefined }), 300);
    },
    [onChange],
  );

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  return (
    <PageToolbar
      left={
        <>
          <div className="relative flex items-center">
            <Search className="absolute left-3 size-3.5 text-on-surface-variant pointer-events-none" aria-hidden="true" />
            <input
              type="search"
              value={searchDraft}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search personnel…"
              aria-label="Search personnel"
              className="h-8 rounded-input border border-outline-variant bg-surface-container-lowest pl-8 pr-3 text-[length:var(--text-body-sm)] font-medium text-on-surface placeholder:text-on-surface-variant/60 hover:border-accent/25 hover:shadow-glass focus-visible:border-accent/25 focus-visible:outline-none"
            />
          </div>

          <CustomSelect
            value={filter.position ?? ''}
            onChange={(v) => onChange({ position: (v as PersonnelPosition) || undefined })}
            options={POSITION_OPTIONS}
            className="w-36"
          />

          <CustomSelect
            value={filter.groupBy ?? ''}
            onChange={(v) => onChange({ groupBy: (v as 'position') || undefined })}
            options={GROUP_OPTIONS}
            className="w-36"
          />
        </>
      }
    />
  );
}
