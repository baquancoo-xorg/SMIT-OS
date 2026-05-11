import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { ChevronDown, Filter, X } from 'lucide-react';
import DatePicker from '../ui/date-picker';
import type { LeadFilters } from './lead-logs-tab';

interface LeadFiltersPopoverProps {
  filters: LeadFilters;
  setFilter: (key: keyof LeadFilters, value: string) => void;
  aeOptions: { id: string; fullName: string }[];
}

const STATUSES = ['Mới', 'Đang liên hệ', 'Đang nuôi dưỡng', 'Qualified', 'Unqualified'];
const STATUS_LABEL: Record<string, string> = {
  'Mới': 'NEW',
  'Đang liên hệ': 'ATT',
  'Đang nuôi dưỡng': 'NUR',
  'Qualified': 'QLD',
  'Unqualified': 'UQLD',
};

const HAS_NOTE_OPTIONS = [
  { value: '', label: 'All Notes' },
  { value: 'yes', label: 'With note' },
  { value: 'no', label: 'Without note' },
];

/**
 * Single trigger that gathers AE / Status / Notes / Note-changed-date filters
 * into one popover. Reduces header chip clutter (was 4 chips → 1 chip + badge).
 *
 * Active count badge counts non-default values across the 4 fields.
 */
export default function LeadFiltersPopover({ filters, setFilter, aeOptions }: LeadFiltersPopoverProps) {
  const activeCount =
    (filters.ae ? 1 : 0) + (filters.status ? 1 : 0) + (filters.hasNote ? 1 : 0) + (filters.noteDate ? 1 : 0);

  const reset = () => {
    setFilter('ae', '');
    setFilter('status', '');
    setFilter('hasNote', '');
    setFilter('noteDate', '');
  };

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <PopoverButton
            aria-label="Open filters"
            className={[
              'inline-flex h-8 items-center gap-1.5 rounded-input border bg-surface-container-lowest px-3',
              'text-[length:var(--text-body-sm)] text-on-surface',
              'transition-colors motion-fast ease-standard',
              'hover:border-outline focus-visible:outline-none data-[open]:border-primary',
              activeCount > 0 ? 'border-primary text-primary' : 'border-outline-variant',
            ].join(' ')}
          >
            <Filter aria-hidden="true" className="size-3.5" />
            <span className="font-medium">Filters</span>
            {activeCount > 0 && (
              <span className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-on-primary">
                {activeCount}
              </span>
            )}
            <ChevronDown
              aria-hidden="true"
              className={`size-3.5 text-on-surface-variant transition-transform ${open ? 'rotate-180' : ''}`}
            />
          </PopoverButton>

          <PopoverPanel
            anchor={{ to: 'bottom end', gap: 8 }}
            className={[
              'z-dropdown w-[280px] rounded-card border border-outline-variant',
              'bg-white/95 backdrop-blur-md shadow-lg p-3',
              'data-closed:opacity-0 transition-opacity motion-fast ease-standard',
            ].join(' ')}
          >
            <div className="flex flex-col gap-3">
              {/* AE */}
              <FilterField label="Account Executive">
                <select
                  value={filters.ae}
                  onChange={(e) => setFilter('ae', e.target.value)}
                  className="h-8 w-full rounded-input border border-outline-variant bg-white px-2 text-[length:var(--text-body-sm)] text-on-surface focus-visible:outline-none focus-visible:border-primary"
                >
                  <option value="">All AE</option>
                  {aeOptions.map((a) => (
                    <option key={a.id} value={a.fullName}>{a.fullName}</option>
                  ))}
                </select>
              </FilterField>

              {/* Status */}
              <FilterField label="Status">
                <select
                  value={filters.status}
                  onChange={(e) => setFilter('status', e.target.value)}
                  className="h-8 w-full rounded-input border border-outline-variant bg-white px-2 text-[length:var(--text-body-sm)] text-on-surface focus-visible:outline-none focus-visible:border-primary"
                >
                  <option value="">All Status</option>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_LABEL[s] ?? s}</option>
                  ))}
                </select>
              </FilterField>

              {/* Has note */}
              <FilterField label="Notes">
                <select
                  value={filters.hasNote}
                  onChange={(e) => setFilter('hasNote', e.target.value)}
                  className="h-8 w-full rounded-input border border-outline-variant bg-white px-2 text-[length:var(--text-body-sm)] text-on-surface focus-visible:outline-none focus-visible:border-primary"
                >
                  {HAS_NOTE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </FilterField>

              {/* Note changed date */}
              <FilterField label="Note changed at">
                <DatePicker
                  value={filters.noteDate}
                  onChange={(v) => setFilter('noteDate', v)}
                  placeholder="Pick date"
                  className="w-full"
                />
              </FilterField>

              {activeCount > 0 && (
                <button
                  type="button"
                  onClick={reset}
                  className="mt-1 inline-flex items-center justify-center gap-1.5 self-end rounded-button px-2 py-1 text-[length:var(--text-body-sm)] font-medium text-on-surface-variant hover:bg-surface-container-low"
                >
                  <X className="size-3.5" aria-hidden="true" />
                  Reset all
                </button>
              )}
            </div>
          </PopoverPanel>
        </>
      )}
    </Popover>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-[length:var(--text-label)] font-medium text-on-surface-variant">
      {label}
      {children}
    </label>
  );
}
