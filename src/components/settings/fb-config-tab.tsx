import { useState, useEffect } from 'react';
import { RefreshCw, Edit2, Trash2, DollarSign, Save, X } from 'lucide-react';
import { Input, Button, Card, Badge, SectionHeader } from '../ui';

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

  useEffect(() => {
    fetchAccounts();
    fetchExchangeRate();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/admin/fb-accounts');
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
      const res = await fetch('/api/admin/exchange-rates');
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
      await fetch(`/api/admin/fb-accounts/${id}`, { method: 'DELETE' });
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

  const [rateError, setRateError] = useState<string | null>(null);
  const [rateSaved, setRateSaved] = useState(false);

  const handleUpdateExchangeRate = async () => {
    setRateError(null);
    setRateSaved(false);
    try {
      const res = await fetch('/api/admin/exchange-rates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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

  const formatSyncTime = (date: string | null) => {
    if (!date) return 'Never';
    const d = new Date(date);
    const diff = Date.now() - d.getTime();
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  if (loading) return <div className="text-center py-8 text-slate-400">Loading...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* FB Ad Accounts Section */}
      <div className="lg:col-span-2 space-y-8">

        {(isAdding || editingId) && (
          <div className="bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white/20 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-on-surface uppercase tracking-wider">{isAdding ? 'New Ad Account' : 'Edit Ad Account'}</h4>
              <button onClick={resetForm} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X size={18} /></button>
            </div>
            {formError && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-2 rounded-xl text-xs font-bold">{formError}</div>
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
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Currency</label>
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
          </div>
        )}

        <div className="bg-white/50 backdrop-blur-md rounded-3xl shadow-sm border border-white/20 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-outline-variant/10 bg-surface-container-low/30">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Account</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Currency</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Sync</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {accounts.map(acc => (
                <tr key={acc.id} className="group hover:bg-surface-container-low/30 transition-all">
                  <td className="px-6 py-4">
                    <div>
                      <span className="text-sm font-bold text-on-surface block">{acc.accountName || acc.accountId}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{acc.accountId}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="neutral">{acc.currency}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Badge variant={acc.lastSyncStatus === 'success' ? 'success' : acc.lastSyncStatus === 'failed' ? 'error' : 'neutral'}>
                        {formatSyncTime(acc.lastSyncAt)}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleSync(acc.id)} disabled={syncingId === acc.id} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all disabled:animate-spin" title="Sync Now"><RefreshCw size={16} /></button>
                      <button onClick={() => openEdit(acc)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all" title="Edit Account"><Edit2 size={16} /></button>
                      <button onClick={() => handleDeleteAccount(acc.id)} className="p-2 text-slate-400 hover:text-error hover:bg-error/5 rounded-xl transition-all" title="Delete Account"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {accounts.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm font-medium italic">No accounts configured yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Exchange Rate Section */}
      <div className="space-y-6">
        <div className="bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white/20 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <DollarSign size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-on-surface uppercase tracking-wider">Exchange Rate</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Financial Settings</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">USD to VND Rate</label>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-400 shrink-0">1 USD =</span>
              <div className="relative flex-1">
                <input
                  type="number"
                  value={exchangeRate}
                  onChange={e => setExchangeRate(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-lg font-black text-on-surface text-right outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-black text-xs opacity-20">VND</span>
              </div>
            </div>
          </div>
          
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
      </div>
    </div>
  );
}
