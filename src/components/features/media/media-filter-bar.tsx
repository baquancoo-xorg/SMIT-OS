import { useCallback, useEffect, useRef, useState } from 'react';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { ChevronDown, Filter, RefreshCw, Search } from 'lucide-react';
import { Button, CustomSelect, DateRangePicker, PageToolbar } from '../../ui';
import type { DateRange } from '../../ui';
import type { MediaFilter } from '../../../hooks/use-media-tracker';

// ── Constants ─────────────────────────────────────────────────────────────

const FORMAT_OPTIONS = [
  { value: '', label: 'All Formats' },
  { value: 'STATUS', label: 'Status' },
  { value: 'PHOTO', label: 'Photo' },
  { value: 'VIDEO', label: 'Video' },
  { value: 'REEL', label: 'Reel' },
  { value: 'ALBUM', label: 'Album' },
  { value: 'LINK', label: 'Link' },
  { value: 'EVENT', label: 'Event' },
];

const GROUP_OPTIONS = [
  { value: '', label: 'No grouping' },
  { value: 'channel', label: 'By Channel' },
  { value: 'format', label: 'By Format' },
  { value: 'month', label: 'By Month' },
];

export interface ChannelOption {
  id: string;
  name: string;
  platform: string;
}

export interface MediaFilterBarProps {
  filter: MediaFilter;
  onChange: (patch: Partial<MediaFilter>) => void;
  channels: ChannelOption[];
  isSyncing: boolean;
  onRefresh: () => void;
  showRefresh: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────

export function MediaFilterBar({
  filter,
  onChange,
  channels,
  isSyncing,
  onRefresh,
  showRefresh,
}: MediaFilterBarProps) {
  const [searchDraft, setSearchDraft] = useState(filter.search ?? '');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search 300ms
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchDraft(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => onChange({ search: value || undefined }), 300);
    },
    [onChange],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const channelOptions = [
    { value: '', label: 'All Channels' },
    ...channels.map((c) => ({ value: c.id, label: `${c.name} (${c.platform})` })),
  ];

  const handleDateRange = useCallback(
    (range: DateRange) => {
      onChange({
        dateFrom: range.from.toISOString().slice(0, 10),
        dateTo: range.to.toISOString().slice(0, 10),
      });
    },
    [onChange],
  );

  const dateRangeValue: DateRange = {
    from: filter.dateFrom ? new Date(filter.dateFrom) : new Date(Date.now() - 30 * 86_400_000),
    to: filter.dateTo ? new Date(filter.dateTo) : new Date(),
  };

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
              placeholder="Search posts…"
              aria-label="Search posts"
              className="h-8 rounded-input border border-outline-variant bg-surface-container-lowest pl-8 pr-3 text-[length:var(--text-body-sm)] font-medium text-on-surface placeholder:text-on-surface-variant/60 hover:border-accent/25 hover:shadow-glass focus-visible:border-accent/25 focus-visible:outline-none"
            />
          </div>

          <CustomSelect
            value={filter.groupBy ?? ''}
            onChange={(v) => onChange({ groupBy: (v as MediaFilter['groupBy']) || undefined })}
            options={GROUP_OPTIONS}
            className="w-36"
          />

          <Popover className="relative">
            {({ open }) => (
              <>
                <PopoverButton className="flex h-8 items-center gap-2 rounded-input border border-outline-variant bg-surface-container-lowest px-3 text-[length:var(--text-body-sm)] font-medium text-on-surface outline-none transition-all duration-medium ease-standard hover:border-accent/25 hover:shadow-glass focus-visible:border-accent/25">
                  <Filter size={14} className="text-on-surface-variant" />
                  <span>Filter</span>
                  {(filter.channelId || filter.format) && (
                    <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-on-primary">
                      {(filter.channelId ? 1 : 0) + (filter.format ? 1 : 0)}
                    </span>
                  )}
                  <ChevronDown size={14} className={`text-on-surface-variant transition-transform ${open ? 'rotate-180' : ''}`} />
                </PopoverButton>
                <PopoverPanel className="absolute left-0 z-50 mt-1.5 w-64 rounded-input border border-outline-variant bg-surface-container-lowest p-3 shadow-elevated">
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1.5 block text-[length:var(--text-label-sm)] font-medium text-on-surface-variant">Channel</label>
                      <CustomSelect
                        value={filter.channelId ?? ''}
                        onChange={(v) => onChange({ channelId: v || undefined })}
                        options={channelOptions}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[length:var(--text-label-sm)] font-medium text-on-surface-variant">Format</label>
                      <CustomSelect
                        value={filter.format ?? ''}
                        onChange={(v) => onChange({ format: v || undefined })}
                        options={FORMAT_OPTIONS}
                        className="w-full"
                      />
                    </div>
                  </div>
                </PopoverPanel>
              </>
            )}
          </Popover>
        </>
      }
      right={
        <>
          {showRefresh && (
            <Button
              variant="primary"
              size="sm"
              className="h-8 text-[length:var(--text-body-sm)]"
              iconLeft={<RefreshCw className={isSyncing ? 'animate-spin' : ''} />}
              onClick={onRefresh}
              disabled={isSyncing}
              aria-label="Refresh posts from social channels"
            >{isSyncing ? 'Syncing Posts' : 'Refresh Posts'}</Button>
          )}

          <DateRangePicker
            value={dateRangeValue}
            onChange={handleDateRange}
            label="Filter date range"
            size="sm"
          />
        </>
      }
    />
  );
}
