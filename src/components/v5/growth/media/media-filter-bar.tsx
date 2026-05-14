import { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { Button, CustomSelect, DateRangePicker } from '../../ui';
import type { DateRange } from '../../ui';
import type { MediaFilter } from '../../../../hooks/use-media-tracker';

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
    <div className="flex flex-wrap items-center gap-2">
      {/* Channel */}
      <CustomSelect
        value={filter.channelId ?? ''}
        onChange={(v) => onChange({ channelId: v || undefined })}
        options={channelOptions}
        className="w-48"
      />

      {/* Format */}
      <CustomSelect
        value={filter.format ?? ''}
        onChange={(v) => onChange({ format: v || undefined })}
        options={FORMAT_OPTIONS}
        className="w-40"
      />

      {/* Date range */}
      <DateRangePicker
        value={dateRangeValue}
        onChange={handleDateRange}
        label="Filter date range"
        size="sm"
      />

      {/* Search */}
      <div className="relative flex items-center">
        <Search className="absolute left-3 size-3.5 text-on-surface-variant pointer-events-none" aria-hidden="true" />
        <input
          type="search"
          value={searchDraft}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search posts…"
          aria-label="Search posts"
          className="h-8 rounded-input border border-outline-variant bg-surface-container-lowest pl-8 pr-3 text-[length:var(--text-body-sm)] text-on-surface placeholder:text-on-surface-variant/60 focus-visible:border-primary focus-visible:outline-none"
        />
      </div>

      {/* Group-by — pushed to right via ml-auto */}
      <div className="ml-auto flex items-center gap-2">
        <span className="text-[length:var(--text-body-sm)] text-on-surface-variant whitespace-nowrap">Group:</span>
        <CustomSelect
          value={filter.groupBy ?? ''}
          onChange={(v) => onChange({ groupBy: (v as MediaFilter['groupBy']) || undefined })}
          options={GROUP_OPTIONS}
          className="w-36"
        />
      </div>

      {/* Refresh — admin only */}
      {showRefresh && (
        <Button
          variant="ghost"
          size="sm"
          iconLeft={<RefreshCw className={isSyncing ? 'animate-spin text-accent' : 'text-accent'} />}
          onClick={onRefresh}
          disabled={isSyncing}
          aria-label="Refresh posts from social channels"
        >
          {isSyncing ? 'Syncing…' : 'Refresh'}
        </Button>
      )}
    </div>
  );
}
