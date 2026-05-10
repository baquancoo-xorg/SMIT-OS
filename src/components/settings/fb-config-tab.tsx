import { useState, useEffect } from 'react';
import { RefreshCw, Save, X } from 'lucide-react';
import { Input, Button, GlassCard as Card, Badge } from '../ui/v2';
import { TableRowActions } from '../ui/v2/table-row-actions';
import { TableShell } from '../ui/v2/table-shell';
import { getTableContract } from '../ui/v2/table-contract';
import { formatTableDateTime } from '../ui/v2/table-date-format';

interface FbAccount {
  id: number;
  accountId: string;
  accountName: string | null;
  currency: string;
  isActive: boolean;
  lastSyncAt: string | null;
  lastSyncStatus: string | null;
}

interface FbConfigTabProps {
  isAddingFb: boolean;
  setIsAddingFb: (v: boolean) => void;
}

export function FbConfigTab({ isAddingFb, setIsAddingFb }: FbConfigTabProps) {
  const [accounts, setAccounts] = useState<FbAccount[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number>(27000);
  const [loading, setLoading] = useState(true);
  const isAdding = isAddingFb;
  const [editingId, setEditingId] = useState<number | null>(null);
  const [syncingId, setSyncingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ accountId: '', accountName: '', accessToken: '', currency: 'USD' });
  const [formError, setFormError] = useState<string | null>(null);
  const [rateError, setRateError] = useState<string | null>(null);
  const [rateSaved, setRateSaved] = useState(false);
  const standardTable = getTableContract('standard');

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

  const handleAddAccount = async () => {
    setFormError(null);
    try {
      const res = await fetch('/api/admin/fb-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await fetchAccounts();
        resetForm();
      } else {
        setFormError(data.error || 'Failed to add account');
      }
    } catch (err) {
      setFormError('Network error');
      console.error('Failed to add account:', err);
    }
  };

  const handleUpdateAccount = async (id: number) => {
    setFormError(null);
    try {
      const body: Record<string, string> = {};
      if (formData.accountName) body.accountName = formData.accountName;
      if (formData.accessToken) body.accessToken = formData.accessToken;
      if (formData.currency) body.currency = formData.currency;

      const res = await fetch(`/api/admin/fb-accounts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await fetchAccounts();
        resetForm();
      } else {
        setFormError(data.error || 'Failed to update account');
      }
    } catch (err) {
      setFormError('Network error');
      console.error('Failed to update account:', err);
    }
  };

  const handleDeleteAccount = async (id: number) => {
    if (!confirm('Delete this account?')) return;
    try {
      await fetch(`/api/admin/fb-accounts/${id}`, { method: 'DELETE', credentials: 'include' });
      await fetchAccounts();
    } catch (err) {
      console.error('Failed to delete account:', err);
    }
  };

  const handleSync = async (id: number) => {
    setSyncingId(id);
    const today = new Date().toISOString().slice(0, 10);
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);

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
      }, 2000);
    } catch (err) {
      setSyncingId(null);
      console.error('Failed to sync:', err);
    }
  };

  const handleUpdateExchangeRate = async () => {
    setRateError(null);
    setRateSaved(false);
    try {
      const res = await fetch('/api/admin/exchange-rates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ exchangeRate: Number(exchangeRate) }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRateSaved(true);
        setTimeout(() => setRateSaved(false), 2000);
      } else {
        setRateError(data.error || 'Failed to save');
      }
    } catch (err) {
      setRateError('Network error');
      console.error('Failed to update exchange rate:', err);
    }
  };

  const resetForm = () => {
    setIsAddingFb(false);
    setEditingId(null);
    setFormData({ accountId: '', accountName: '', accessToken: '', currency: 'USD' });
    setFormError(null);
  };

  const openEdit = (acc: FbAccount) => {
    setEditingId(acc.id);
    setFormData({ accountId: acc.accountId, accountName: acc.accountName || '', accessToken: '', currency: acc.currency });
  };

  const syncBadge = (acc: FbAccount) => {
    if (!acc.lastSyncAt) return 'Never';
    return formatTableDateTime(acc.lastSyncAt);
  };

  if (loading) return <div className="text-center py-8 text-on-surface-variant">Loading...</div>;

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="space-y-8">
        {(isAdding || editingId) && (
          <Card variant="surface" className="p-6 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-on-surface uppercase tracking-wider">{isAdding ? 'New Ad Account' : 'Edit Ad Account'}</h4>
              <button onClick={resetForm} className="p-2 hover:bg-surface-container-low rounded-xl transition-colors"><X size={18} /></button>
            </div>
            {formError && (
              <div className="bg-error/5 border border-error/20 text-error px-4 py-2 rounded-xl text-xs font-bold">{formError}</div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Account ID"
                placeholder="act_XXXXXXXXX"
                value={formData.accountId}
                onChange={e => setFormData({ ...formData, accountId: e.target.value })}
                disabled={!!editingId}
                helperText="Dùng dấu _ không phải ="
              />
              <Input
                label="Account Name"
                placeholder="e.g., Main Account"
                value={formData.accountName}
                onChange={e => setFormData({ ...formData, accountName: e.target.value })}
              />
            </div>
            <Input
              type="password"
              label="Access Token"
              placeholder="••••••••"
              value={formData.accessToken}
              onChange={e => setFormData({ ...formData, accessToken: e.target.value })}
              helperText={editingId ? 'Để trống nếu không muốn đổi' : undefined}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1 px-1">Currency</label>
                <div className="w-full bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-2.5 text-sm">
                  <select
                    value={formData.currency}
                    onChange={e => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full bg-transparent outline-none text-on-surface"
                  >
                    <option value="USD">USD</option>
                    <option value="VND">VND</option>
                  </select>
                </div>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => editingId ? handleUpdateAccount(editingId) : handleAddAccount()}
                  className="w-full gap-2"
                >
                  <Save size={16} />
                  {editingId ? 'Save Changes' : 'Add Account'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        <Card variant="surface" className="overflow-hidden shadow-sm">
          <TableShell variant="standard">
            <thead>
              <tr className={standardTable.headerRow}>
                <th className={standardTable.headerCell}>Account</th>
                <th className={standardTable.headerCell}>Currency</th>
                <th className={standardTable.headerCell}>Last Sync</th>
                <th className={standardTable.actionHeaderCell}>Actions</th>
              </tr>
            </thead>
            <tbody className={standardTable.body}>
              {accounts.map(acc => (
                <tr key={acc.id} className={`${standardTable.row} group`}>
                  <td className={standardTable.cell}>
                    <div>
                      <span className="text-sm font-bold text-on-surface block">{acc.accountName || acc.accountId}</span>
                      <span className="text-[10px] text-on-surface-variant font-medium">{acc.accountId}</span>
                    </div>
                  </td>
                  <td className={standardTable.cell}>
                    <Badge variant="neutral">{acc.currency}</Badge>
                  </td>
                  <td className={standardTable.cell}>
                    <Badge variant={acc.lastSyncStatus === 'success' ? 'success' : acc.lastSyncStatus === 'failed' ? 'error' : 'neutral'}>
                      {syncBadge(acc)}
                    </Badge>
                  </td>
                  <td className={standardTable.actionCell}>
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleSync(acc.id)} disabled={syncingId === acc.id} className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-xl transition-all disabled:animate-spin" title="Sync Now"><RefreshCw size={16} /></button>
                      <TableRowActions
                        onEdit={() => openEdit(acc)}
                        onDelete={() => handleDeleteAccount(acc.id)}
                        size={16}
                        variant="standard"
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {accounts.length === 0 && (
                <tr>
                  <td colSpan={4} className={standardTable.emptyState}>No accounts configured yet.</td>
                </tr>
              )}
            </tbody>
          </TableShell>
        </Card>
      </div>

      <Card variant="surface" className="overflow-hidden shadow-sm">
        <TableShell variant="standard">
          <thead>
            <tr className={standardTable.headerRow}>
              <th className={standardTable.headerCell}>Tên loại quy đổi</th>
              <th className={standardTable.headerCell}>Giá trị gốc</th>
              <th className={standardTable.headerCell}>Giá trị quy đổi</th>
            </tr>
          </thead>
          <tbody className={standardTable.body}>
            <tr className={standardTable.row}>
              <td className={standardTable.cell}>
                <div className="text-sm font-bold text-on-surface">USD to VND Rate</div>
              </td>
              <td className={standardTable.cell}>
                <div className="text-sm font-bold text-on-surface-variant">1 USD</div>
              </td>
              <td className={standardTable.cell}>
                <div className="max-w-xs">
                  <input
                    type="number"
                    value={exchangeRate}
                    onChange={e => setExchangeRate(Number(e.target.value))}
                    className="w-full bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-2.5 text-sm font-black text-on-surface text-right outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
                    placeholder="Nhập giá trị"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </TableShell>

        <div className="p-6 pt-5 border-t border-outline-variant/10 space-y-3">
          <Button
            onClick={handleUpdateExchangeRate}
            variant="secondary"
            className="w-full gap-2"
          >
            <Save size={16} />
            Save Rate
          </Button>

          {(rateError || rateSaved) && (
            <div className={`p-3 rounded-xl border text-xs font-bold text-center ${rateError ? 'bg-error/10 border-error/20 text-error' : 'bg-tertiary/10 border-tertiary/20 text-tertiary'}`}>
              {rateError || 'Rate updated successfully!'}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
