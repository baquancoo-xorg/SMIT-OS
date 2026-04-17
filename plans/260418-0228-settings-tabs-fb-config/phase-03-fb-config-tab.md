# Phase 3 — FB Config Tab Component

**Priority:** P1  •  **Status:** pending  •  **Effort:** 3h

## Context

- Plan: [../plan.md](./plan.md)
- Depends on: Phase 2 (API endpoints ready)
- UI patterns: Copy từ existing Settings.tsx

## Overview

Tạo FB Config tab với 2 sections: FB Ad Accounts management và Exchange Rate settings.

## Requirements

**Functional**
- List FB accounts với status indicators
- Add/Edit/Delete accounts
- Manual sync trigger per account
- Exchange rate view/edit
- Loading/error states

**Non-functional**
- Component <200 lines
- Consistent UI với existing tabs
- Responsive design

## Architecture

```
src/components/settings/
└── fb-config-tab.tsx    # Main component (~180 lines)

Sections:
├── FB Ad Accounts Table
│   ├── Account ID, Name, Currency
│   ├── Sync Status (lastSyncAt, badge)
│   └── Actions: Sync, Edit, Delete
└── Exchange Rate Section
    └── Single input with Save button
```

## Files

**Create**
- `src/components/settings/fb-config-tab.tsx`

**Modify**
- `src/pages/Settings.tsx` — import and render FbConfigTab

## Implementation Steps

### 1. Create fb-config-tab.tsx

```typescript
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

interface ExchangeRate {
  exchangeRate: number;
}

export function FbConfigTab() {
  const [accounts, setAccounts] = useState<FbAccount[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number>(27000);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [syncingId, setSyncingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    accountId: '',
    accountName: '',
    accessToken: '',
    currency: 'USD',
  });

  useEffect(() => {
    fetchAccounts();
    fetchExchangeRate();
  }, []);

  const fetchAccounts = async () => {
    const res = await fetch('/api/admin/fb-accounts');
    const data = await res.json();
    if (data.success) setAccounts(data.data);
    setLoading(false);
  };

  const fetchExchangeRate = async () => {
    const res = await fetch('/api/admin/exchange-rates');
    const data = await res.json();
    if (data.success) setExchangeRate(data.data.exchangeRate);
  };

  const handleAddAccount = async () => {
    const res = await fetch('/api/admin/fb-accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      await fetchAccounts();
      resetForm();
    }
  };

  const handleUpdateAccount = async (id: number) => {
    const body: any = {};
    if (formData.accountName) body.accountName = formData.accountName;
    if (formData.accessToken) body.accessToken = formData.accessToken;
    if (formData.currency) body.currency = formData.currency;
    
    const res = await fetch(`/api/admin/fb-accounts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      await fetchAccounts();
      resetForm();
    }
  };

  const handleDeleteAccount = async (id: number) => {
    if (!confirm('Delete this account?')) return;
    await fetch(`/api/admin/fb-accounts/${id}`, { method: 'DELETE' });
    await fetchAccounts();
  };

  const handleSync = async (id: number, accountId: string) => {
    setSyncingId(id);
    const today = new Date().toISOString().slice(0, 10);
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    
    await fetch(`/api/admin/fb-accounts/${id}/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dateStart: weekAgo, dateEnd: today }),
    });
    
    setTimeout(() => {
      setSyncingId(null);
      fetchAccounts();
    }, 2000);
  };

  const handleUpdateExchangeRate = async () => {
    await fetch('/api/admin/exchange-rates', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exchangeRate }),
    });
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ accountId: '', accountName: '', accessToken: '', currency: 'USD' });
  };

  const openEdit = (acc: FbAccount) => {
    setEditingId(acc.id);
    setFormData({
      accountId: acc.accountId,
      accountName: acc.accountName || '',
      accessToken: '',
      currency: acc.currency,
    });
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
    <div className="space-y-10">
      {/* FB Ad Accounts Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Facebook className="text-blue-600" />
            FB Ad Accounts
          </h3>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold"
          >
            <Plus size={16} /> Add Account
          </button>
        </div>

        {/* Add/Edit Form */}
        {(isAdding || editingId) && (
          <div className="bg-surface-container-low p-6 rounded-3xl border space-y-4">
            <div className="flex justify-between">
              <h4 className="font-bold">{isAdding ? 'Add Account' : 'Edit Account'}</h4>
              <button onClick={resetForm}><X size={18} /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                placeholder="act_123456789"
                value={formData.accountId}
                onChange={e => setFormData({ ...formData, accountId: e.target.value })}
                disabled={!!editingId}
                className="bg-white border rounded-xl px-4 py-2 text-sm disabled:bg-slate-100"
              />
              <input
                placeholder="Account Name"
                value={formData.accountName}
                onChange={e => setFormData({ ...formData, accountName: e.target.value })}
                className="bg-white border rounded-xl px-4 py-2 text-sm"
              />
            </div>
            <input
              type="password"
              placeholder={editingId ? 'New token (leave blank to keep)' : 'Access Token'}
              value={formData.accessToken}
              onChange={e => setFormData({ ...formData, accessToken: e.target.value })}
              className="w-full bg-white border rounded-xl px-4 py-2 text-sm"
            />
            <div className="flex gap-4">
              <select
                value={formData.currency}
                onChange={e => setFormData({ ...formData, currency: e.target.value })}
                className="bg-white border rounded-xl px-4 py-2 text-sm"
              >
                <option value="USD">USD</option>
                <option value="VND">VND</option>
              </select>
              <button
                onClick={() => editingId ? handleUpdateAccount(editingId) : handleAddAccount()}
                className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-bold"
              >
                {editingId ? 'Save Changes' : 'Add Account'}
              </button>
            </div>
          </div>
        )}

        {/* Accounts Table */}
        <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Account</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Currency</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Last Sync</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {accounts.map(acc => (
                <tr key={acc.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <div className="font-bold text-sm">{acc.accountName || acc.accountId}</div>
                    <div className="text-[10px] text-slate-400">{acc.accountId}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 rounded-full text-xs font-bold">
                      {acc.currency}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        acc.lastSyncStatus === 'success' ? 'bg-emerald-500' :
                        acc.lastSyncStatus === 'failed' ? 'bg-red-500' : 'bg-slate-300'
                      }`} />
                      <span className="text-xs text-slate-500">{formatSyncTime(acc.lastSyncAt)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleSync(acc.id, acc.accountId)}
                        disabled={syncingId === acc.id}
                        className="p-2 text-slate-400 hover:text-blue-600 disabled:animate-spin"
                      >
                        <RefreshCw size={16} />
                      </button>
                      <button onClick={() => openEdit(acc)} className="p-2 text-slate-400 hover:text-primary">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDeleteAccount(acc.id)} className="p-2 text-slate-400 hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {accounts.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">No accounts configured</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Exchange Rate Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <DollarSign className="text-emerald-600" />
          Exchange Rate (USD → VND)
        </h3>
        <div className="bg-white rounded-3xl border p-6 flex items-center gap-4">
          <span className="text-sm font-medium text-slate-500">1 USD =</span>
          <input
            type="number"
            value={exchangeRate}
            onChange={e => setExchangeRate(Number(e.target.value))}
            className="w-32 bg-slate-50 border rounded-xl px-4 py-2 text-lg font-bold text-right"
          />
          <span className="text-sm font-medium text-slate-500">VND</span>
          <button
            onClick={handleUpdateExchangeRate}
            className="ml-auto flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold"
          >
            <Save size={16} /> Save
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 2. Update Settings.tsx

Import và render FbConfigTab khi activeTab === 'fb-config'.

### 3. Add Facebook icon

Verify `lucide-react` has Facebook icon, hoặc dùng custom SVG.

## Todo

- [ ] Create `src/components/settings/fb-config-tab.tsx`
- [ ] Import trong Settings.tsx
- [ ] Test add account flow
- [ ] Test edit account flow
- [ ] Test delete account flow
- [ ] Test sync trigger
- [ ] Test exchange rate update
- [ ] Verify responsive design

## Success Criteria

- FB Config tab shows in Settings
- Can add/edit/delete FB accounts
- Sync button triggers API call
- Sync status shows correctly
- Exchange rate saves to database
- UI matches existing Settings patterns

## Risks

| Risk | Mitigation |
|------|------------|
| Token leak in form | Never show existing token, only placeholder |
| Sync timeout | Fire-and-forget pattern, poll status |
| Form validation UX | Show inline errors from API response |
