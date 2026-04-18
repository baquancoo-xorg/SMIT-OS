import { useState, useEffect } from 'react';
import { Facebook, Plus, RefreshCw, Edit2, Trash2, DollarSign, Save, X } from 'lucide-react';

interface FbAccount {
  id: number;
  accountId: string;
  accountName: string | null;
  currency: string;
  isActive: boolean;
  lastSyncAt: string | null;
  lastSyncStatus: string | null;
}

export function FbConfigTab() {
  const [accounts, setAccounts] = useState<FbAccount[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number>(27000);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
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
    setIsAdding(false);
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
      {/* FB Ad Accounts Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Facebook className="text-primary" />
            FB Ad Accounts
          </h3>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-95 transition-all"
          >
            <Plus size={16} />
            Add Account
          </button>
        </div>

        {(isAdding || editingId) && (
          <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/20 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-on-surface">{isAdding ? 'Add Account' : 'Edit Account'}</h4>
              <button onClick={resetForm} className="text-slate-400 hover:text-on-surface"><X size={18} /></button>
            </div>
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-xl text-sm">{formError}</div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Account ID</label>
                <input
                  type="text"
                  placeholder="act_XXXXXXXXX (dùng dấu _ không phải =)"
                  value={formData.accountId}
                  onChange={e => setFormData({ ...formData, accountId: e.target.value })}
                  disabled={!!editingId}
                  className="w-full bg-white border border-outline-variant/30 rounded-3xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Account Name</label>
                <input
                  type="text"
                  placeholder="e.g., Main Account"
                  value={formData.accountName}
                  onChange={e => setFormData({ ...formData, accountName: e.target.value })}
                  className="w-full bg-white border border-outline-variant/30 rounded-3xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Access Token {editingId && <span className="text-slate-400 font-normal">(leave blank to keep)</span>}
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={formData.accessToken}
                onChange={e => setFormData({ ...formData, accessToken: e.target.value })}
                className="w-full bg-white border border-outline-variant/30 rounded-3xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Currency</label>
                <select
                  value={formData.currency}
                  onChange={e => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full bg-white border border-outline-variant/30 rounded-3xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="USD">USD</option>
                  <option value="VND">VND</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => editingId ? handleUpdateAccount(editingId) : handleAddAccount()}
                  className="flex-1 bg-primary text-white py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                >
                  <Save size={14} />
                  {editingId ? 'Save Changes' : 'Add Account'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-outline-variant/10">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Account</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Currency</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Sync</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {accounts.map(acc => (
                <tr key={acc.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <span className="text-sm font-bold text-on-surface block">{acc.accountName || acc.accountId}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{acc.accountId}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold">{acc.currency}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${acc.lastSyncStatus === 'success' ? 'bg-emerald-500' : acc.lastSyncStatus === 'failed' ? 'bg-red-500' : 'bg-slate-300'}`} />
                      <span className="text-xs font-medium text-slate-500">{formatSyncTime(acc.lastSyncAt)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleSync(acc.id)} disabled={syncingId === acc.id} className="p-2 text-slate-400 hover:text-primary transition-colors disabled:animate-spin" title="Sync Now"><RefreshCw size={16} /></button>
                      <button onClick={() => openEdit(acc)} className="p-2 text-slate-400 hover:text-primary transition-colors" title="Edit Account"><Edit2 size={16} /></button>
                      <button onClick={() => handleDeleteAccount(acc.id)} className="p-2 text-slate-400 hover:text-error transition-colors" title="Delete Account"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {accounts.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400 text-sm">No accounts configured yet. Add one to start syncing Facebook Ads data.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Exchange Rate Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="text-secondary" />
            Exchange Rate
          </h3>
        </div>

        <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/20 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">USD to VND Rate</label>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-500">1 USD =</span>
              <input
                type="number"
                value={exchangeRate}
                onChange={e => setExchangeRate(Number(e.target.value))}
                className="w-40 bg-white border border-outline-variant/30 rounded-3xl px-4 py-2 text-lg font-bold text-on-surface text-right outline-none focus:ring-2 focus:ring-secondary/20"
              />
              <span className="text-sm font-medium text-slate-500">VND</span>
            </div>
          </div>
          {rateError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-xl text-sm">{rateError}</div>
          )}
          {rateSaved && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-4 py-2 rounded-xl text-sm">Saved successfully!</div>
          )}
          <button
            onClick={handleUpdateExchangeRate}
            className="w-full bg-secondary text-white py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-secondary/20 hover:scale-95 transition-all"
          >
            <Save size={14} />
            Save Exchange Rate
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm p-6">
          <h4 className="text-sm font-bold text-on-surface mb-4">Quick Reference</h4>
          <div className="space-y-2 text-sm text-slate-500">
            <div className="flex justify-between">
              <span>$100 USD</span>
              <span className="font-bold text-on-surface">{(100 * exchangeRate).toLocaleString()} VND</span>
            </div>
            <div className="flex justify-between">
              <span>$1,000 USD</span>
              <span className="font-bold text-on-surface">{(1000 * exchangeRate).toLocaleString()} VND</span>
            </div>
            <div className="flex justify-between">
              <span>$10,000 USD</span>
              <span className="font-bold text-on-surface">{(10000 * exchangeRate).toLocaleString()} VND</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
