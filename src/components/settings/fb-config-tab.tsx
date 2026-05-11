import { useState, useEffect } from 'react';
import { RefreshCw, Pencil, Trash2, MoreHorizontal, Save, Facebook } from 'lucide-react';
import {
  DataTable,
  Badge,
  Button,
  Input,
  FormDialog,
  EmptyState,
  DropdownMenu,
  GlassCard,
  Spinner,
  useToast,
} from '../ui';
import type { DataTableColumn, BadgeVariant } from '../ui';

interface FbAccount {
  id: number;
  accountId: string;
  accountName: string | null;
  currency: string;
  isActive: boolean;
  lastSyncAt: string | null;
  lastSyncStatus: string | null;
}

interface FbFormState {
  accountId: string;
  accountName: string;
  accessToken: string;
  currency: string;
}

const EMPTY_FORM: FbFormState = { accountId: '', accountName: '', accessToken: '', currency: 'USD' };

interface FbConfigTabProps {
  isAddingFb: boolean;
  setIsAddingFb: (v: boolean) => void;
}

function formatDateTime(s: string | null) {
  if (!s) return 'Never';
  return new Date(s).toLocaleString('vi-VN');
}

const SYNC_STATUS_BADGE: Record<string, BadgeVariant> = {
  success: 'success',
  failed: 'error',
};

/**
 * FbConfigTab v2 — CRITICAL tab for Acquisition (Meta Ads token + ad accounts).
 *
 * Logic + API identical to v1: /api/admin/fb-accounts (GET/POST/PUT/DELETE/sync)
 * + /api/admin/exchange-rates (GET/PUT). Visual layer migrated to v2.
 */
export function FbConfigTabV2({ isAddingFb, setIsAddingFb }: FbConfigTabProps) {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<FbAccount[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number>(27000);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [syncingId, setSyncingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FbFormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [savingRate, setSavingRate] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const isEditing = editingId !== null;
  const dialogOpen = isAddingFb || isEditing;

  useEffect(() => {
    fetchAccounts();
    fetchExchangeRate();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/admin/fb-accounts', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setAccounts(data.data);
    } catch (err) {
      console.error('Failed to fetch accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExchangeRate = async () => {
    try {
      const res = await fetch('/api/admin/exchange-rates', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setExchangeRate(data.data.exchangeRate);
    } catch (err) {
      console.error('Failed to fetch exchange rate:', err);
    }
  };

  const closeDialog = () => {
    setIsAddingFb(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
  };

  const openEdit = (acc: FbAccount) => {
    setEditingId(acc.id);
    setFormData({ accountId: acc.accountId, accountName: acc.accountName ?? '', accessToken: '', currency: acc.currency });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (isEditing && editingId !== null) {
        const body: Record<string, string> = {};
        if (formData.accountName) body.accountName = formData.accountName;
        if (formData.accessToken) body.accessToken = formData.accessToken;
        if (formData.currency) body.currency = formData.currency;

        const res = await fetch(`/api/admin/fb-accounts/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          await fetchAccounts();
          closeDialog();
          toast({ tone: 'success', title: 'Account updated' });
        } else {
          toast({ tone: 'error', title: 'Update failed', description: data.error || 'Network error' });
        }
      } else {
        const res = await fetch('/api/admin/fb-accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          await fetchAccounts();
          closeDialog();
          toast({ tone: 'success', title: 'Account added' });
        } else {
          toast({ tone: 'error', title: 'Add failed', description: data.error || 'Network error' });
        }
      }
    } catch (err) {
      console.error('Failed to save account:', err);
      toast({ tone: 'error', title: 'Network error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this account?')) return;
    setDeletingId(id);
    try {
      await fetch(`/api/admin/fb-accounts/${id}`, { method: 'DELETE', credentials: 'include' });
      await fetchAccounts();
      toast({ tone: 'success', title: 'Account deleted' });
    } catch (err) {
      console.error('Failed to delete account:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSync = async (id: number) => {
    setSyncingId(id);
    const today = new Date().toISOString().slice(0, 10);
    const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10);

    try {
      await fetch(`/api/admin/fb-accounts/${id}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ dateStart: weekAgo, dateEnd: today }),
      });
      setTimeout(() => {
        setSyncingId(null);
        fetchAccounts();
        toast({ tone: 'success', title: 'Sync triggered', description: 'Last 7 days requested.' });
      }, 2000);
    } catch (err) {
      setSyncingId(null);
      console.error('Failed to sync:', err);
    }
  };

  const handleUpdateExchangeRate = async () => {
    setSavingRate(true);
    try {
      const res = await fetch('/api/admin/exchange-rates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ exchangeRate: Number(exchangeRate) }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast({ tone: 'success', title: 'Rate updated', description: `1 USD = ${exchangeRate.toLocaleString('vi-VN')} đ` });
      } else {
        toast({ tone: 'error', title: 'Failed to save', description: data.error || 'Network error' });
      }
    } catch (err) {
      console.error('Failed to update exchange rate:', err);
      toast({ tone: 'error', title: 'Network error' });
    } finally {
      setSavingRate(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-primary">
        <Spinner size="lg" hideLabel={false} label="Loading FB config..." />
      </div>
    );
  }

  const columns: DataTableColumn<FbAccount>[] = [
    {
      key: 'account',
      label: 'Account',
      sortable: true,
      sort: (a, b) => (a.accountName ?? a.accountId).localeCompare(b.accountName ?? b.accountId),
      render: (acc) => (
        <div className="min-w-0">
          <p className="truncate font-semibold text-on-surface">{acc.accountName ?? acc.accountId}</p>
          <p className="truncate text-[length:var(--text-caption)] text-on-surface-variant font-mono">{acc.accountId}</p>
        </div>
      ),
    },
    {
      key: 'currency',
      label: 'Currency',
      hideBelow: 'md',
      render: (acc) => <Badge variant="neutral">{acc.currency}</Badge>,
    },
    {
      key: 'lastSync',
      label: 'Last sync',
      render: (acc) => (
        <Badge variant={acc.lastSyncStatus ? SYNC_STATUS_BADGE[acc.lastSyncStatus] ?? 'neutral' : 'neutral'}>
          {formatDateTime(acc.lastSyncAt)}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      width: 'w-24',
      render: (acc) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => handleSync(acc.id)}
            disabled={syncingId === acc.id}
            aria-label={`Sync ${acc.accountId}`}
            className="inline-flex size-8 items-center justify-center rounded-button text-on-surface-variant hover:bg-surface-container hover:text-primary disabled:opacity-50 focus-visible:outline-none"
          >
            <RefreshCw className={['size-4', syncingId === acc.id ? 'animate-spin' : ''].join(' ')} aria-hidden="true" />
          </button>
          <DropdownMenu
            label={`Actions for ${acc.accountId}`}
            trigger={
              <button
                type="button"
                aria-label={`Actions for ${acc.accountId}`}
                className="inline-flex size-8 items-center justify-center rounded-button text-on-surface-variant hover:bg-surface-container focus-visible:outline-none"
              >
                <MoreHorizontal className="size-4" aria-hidden="true" />
              </button>
            }
            items={[
              { key: 'edit', label: 'Edit account', icon: <Pencil />, onClick: () => openEdit(acc) },
              {
                key: 'delete',
                label: 'Delete',
                icon: <Trash2 />,
                destructive: true,
                disabled: deletingId === acc.id,
                onClick: () => handleDelete(acc.id),
              },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      {accounts.length > 0 ? (
        <DataTable<FbAccount>
          label="Meta Ads accounts"
          data={accounts}
          rowKey={(a) => a.id}
          columns={columns}
        />
      ) : (
        <EmptyState
          icon={<Facebook />}
          title="No Meta Ads accounts"
          description="Add an account to start syncing campaign data."
          actions={
            <Button variant="primary" onClick={() => setIsAddingFb(true)}>
              Add account
            </Button>
          }
          decorative
        />
      )}

      {/* Exchange rate card */}
      <GlassCard variant="raised" padding="lg" ariaLabel="USD to VND exchange rate">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant">
              USD → VND exchange rate
            </p>
            <p className="mt-1 text-[length:var(--text-body-sm)] text-on-surface-variant">
              Used for converting USD spend on Meta Ads accounts to VND for reporting.
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex items-baseline gap-2 text-on-surface">
              <span className="font-semibold">1 USD =</span>
            </div>
            <Input
              type="number"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(Number(e.target.value))}
              containerClassName="flex-1 min-w-[12rem] max-w-xs"
              aria-label="USD to VND rate"
            />
            <Button
              variant="secondary"
              iconLeft={<Save />}
              onClick={handleUpdateExchangeRate}
              isLoading={savingRate}
            >
              Save rate
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Add/Edit dialog */}
      <FormDialog
        open={dialogOpen}
        onClose={closeDialog}
        onSubmit={handleSubmit}
        title={isEditing ? 'Edit ad account' : 'New ad account'}
        description={isEditing ? 'Leave access token blank to keep current.' : 'Enter the Meta Ads account credentials.'}
        icon={<Facebook />}
        size="md"
        submitLabel={isEditing ? 'Save changes' : 'Add account'}
        isSubmitting={submitting}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Account ID"
            placeholder="act_XXXXXXXXX"
            value={formData.accountId}
            onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
            disabled={isEditing}
            helperText="Use _ not ="
            required={!isEditing}
          />
          <Input
            label="Account name"
            placeholder="e.g., Main Account"
            value={formData.accountName}
            onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
          />
        </div>
        <Input
          type="password"
          label="Access token"
          placeholder="••••••••"
          value={formData.accessToken}
          onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
          helperText={isEditing ? 'Leave blank to keep current.' : undefined}
          required={!isEditing}
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="fb-currency" className="text-[length:var(--text-label)] font-medium text-on-surface-variant">
            Currency
          </label>
          <select
            id="fb-currency"
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            className="h-10 rounded-input border border-outline-variant bg-surface-container-lowest px-3 text-[length:var(--text-body)] text-on-surface focus-visible:outline-none focus-visible:border-primary"
          >
            <option value="USD">USD</option>
            <option value="VND">VND</option>
          </select>
        </div>
      </FormDialog>
    </div>
  );
}
