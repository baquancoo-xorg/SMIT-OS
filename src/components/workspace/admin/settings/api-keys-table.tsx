/**
 * Presentational table for API key list.
 * Shows prefix, name, scopes (badges), createdBy, dates, status, revoke action.
 */

import { Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import type { BadgeVariant } from '@/components/ui/badge';
import type { DataTableColumn } from '@/components/ui/data-table';
import type { ApiKeyListItem } from '@/api/admin-api-keys';

interface ApiKeysTableProps {
  keys: ApiKeyListItem[];
  onRevoke: (key: ApiKeyListItem) => void;
  revokingId: string | null;
}

function formatDate(s: string | null): string {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('vi-VN');
}

function statusVariant(key: ApiKeyListItem): BadgeVariant {
  return key.revokedAt ? 'error' : 'success';
}

const SCOPE_LABELS: Record<string, string> = {
  'read:reports': 'Reports',
  'read:crm': 'CRM',
  'read:ads': 'Ads',
  'read:okr': 'OKR',
  'read:dashboard': 'Dashboard',
};

export function ApiKeysTable({ keys, onRevoke, revokingId }: ApiKeysTableProps) {
  const columns: DataTableColumn<ApiKeyListItem>[] = [
    {
      key: 'prefix',
      label: 'Prefix',
      render: (k) => (
        <span className="font-mono text-[length:var(--text-body-sm)] text-on-surface-variant">
          {k.prefix}…
        </span>
      ),
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      sort: (a, b) => a.name.localeCompare(b.name),
      render: (k) => <span className="font-medium text-on-surface">{k.name}</span>,
    },
    {
      key: 'scopes',
      label: 'Scopes',
      hideBelow: 'md',
      render: (k) => (
        <div className="flex flex-wrap gap-1">
          {k.scopes.map((s) => (
            <Badge key={s} variant="neutral" size="sm">
              {SCOPE_LABELS[s] ?? s}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'createdBy',
      label: 'Created by',
      hideBelow: 'lg',
      render: (k) => <span className="text-on-surface-variant">{k.createdBy}</span>,
    },
    {
      key: 'createdAt',
      label: 'Created',
      hideBelow: 'lg',
      render: (k) => <span className="text-on-surface-variant">{formatDate(k.createdAt)}</span>,
    },
    {
      key: 'lastUsedAt',
      label: 'Last used',
      hideBelow: 'md',
      render: (k) => <span className="text-on-surface-variant">{formatDate(k.lastUsedAt)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (k) => (
        <Badge variant={statusVariant(k)} size="sm">
          {k.revokedAt ? 'Revoked' : 'Active'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      width: 'w-16',
      render: (k) =>
        k.revokedAt ? null : (
          <button
            type="button"
            onClick={() => onRevoke(k)}
            disabled={revokingId === k.id}
            aria-label={`Revoke ${k.name}`}
            className="inline-flex size-8 items-center justify-center rounded-button text-error hover:bg-error/10 disabled:opacity-40 focus-visible:outline-none"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        ),
    },
  ];

  return (
    <DataTable<ApiKeyListItem>
      label="API keys"
      data={keys}
      rowKey={(k) => k.id}
      columns={columns}
    />
  );
}
