---
phase: 05
title: "Frontend Settings 2FA Tab"
status: completed
priority: high
effort: 2h
dependsOn: phase-03
---

# Phase 05 u2014 Frontend Settings 2FA Tab

## Overview

Tu1ea1o `src/components/settings/two-factor-auth-tab.tsx` vu00e0 u0111u0103ng ku00fd tab mu1edbi "Security" trong settings. User tu1ef1 bu1eadt/tu1eaft 2FA, xem backup codes sau khi enable.

## Files to Create

- `src/components/settings/two-factor-auth-tab.tsx` u2014 UI setup/disable 2FA

## Files to Modify

- `src/components/settings/settings-tabs.tsx` u2014 thu00eam tab "Security"
- `src/pages/SettingsPage.tsx` (hou1eb7c file render settings) u2014 render tab mu1edbi

## Tru01b0u1edbc tiu00ean: tu00ecm file render settings page

> Dev cu1ea7n tu00ecm file render `<SettingsTabs>` (u0111u1ec3 thu00eam case render `TwoFactorAuthTab`).
> Glob: `src/**/*Settings*` hou1eb7c `src/**/*setting*`

## Implementation Steps

### 1. Cu1eadp nhu1eadt `src/components/settings/settings-tabs.tsx`

Thu00eam tab `security`:

```typescript
import { Users, Calendar, Target, Facebook, ShieldCheck } from 'lucide-react';

export type SettingsTabId = 'users' | 'sprints' | 'okrs' | 'fb-config' | 'security';

export const SETTINGS_TABS: Tab[] = [
  { id: 'users',     label: 'Users',    icon: Users },
  { id: 'sprints',   label: 'Sprints',  icon: Calendar },
  { id: 'okrs',      label: 'OKRs',     icon: Target },
  { id: 'fb-config', label: 'FB Config',icon: Facebook },
  { id: 'security',  label: 'Security', icon: ShieldCheck },
];
```

### 2. Tu1ea1o `src/components/settings/two-factor-auth-tab.tsx`

Component cu00f3 3 UI state:

| State | Hiu1ec3n thu1ecb |
|-------|---------|
| `idle` | Tru1ea1ng thu00e1i 2FA hiu1ec7n tu1ea1i (bu1eadt/tu1eaft) + action button |
| `setup` | QR code + u00f4 nhu1eadp mu00e3 xu00e1c nhu1eadn |
| `backup-codes` | Hiu1ec3n 8 backup codes (1 lu1ea7n duy nhu1ea5t) |

```tsx
import { useState } from 'react';
import { ShieldCheck, ShieldOff, QrCode, Copy, Check, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

type SetupState = 'idle' | 'setup' | 'backup-codes';

export function TwoFactorAuthTab() {
  const { currentUser } = useAuth();
  const [setupState, setSetupState] = useState<SetupState>('idle');
  const [qrUrl, setQrUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [disablePassword, setDisablePassword] = useState('');
  const [showDisable, setShowDisable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Tu1ea1m thu1eddi track tru1ea1ng thu00e1i 2FA local (su1ebd refresh tu1eeb /me sau khi enable/disable)
  const [totpEnabled, setTotpEnabled] = useState(currentUser?.totpEnabled ?? false);

  const handleStartSetup = async () => {
    setLoading(true); setError('');
    const res = await fetch('/api/auth/2fa/setup', { credentials: 'include' });
    if (!res.ok) { setError('Cannot start setup'); setLoading(false); return; }
    const data = await res.json();
    setSecret(data.secret);
    // QR image: du00f9ng Google Charts API u0111u1ec3 render QR code tu1eeb otpauthUrl
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.otpauthUrl)}`);
    setSetupState('setup');
    setLoading(false);
  };

  const handleEnable = async () => {
    setLoading(true); setError('');
    const res = await fetch('/api/auth/2fa/enable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, code: verifyCode }),
      credentials: 'include',
    });
    if (!res.ok) { const e = await res.json(); setError(e.error); setLoading(false); return; }
    const data = await res.json();
    setBackupCodes(data.backupCodes);
    setTotpEnabled(true);
    setSetupState('backup-codes');
    setLoading(false);
  };

  const handleDisable = async () => {
    setLoading(true); setError('');
    const res = await fetch('/api/auth/2fa/disable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: disablePassword }),
      credentials: 'include',
    });
    if (!res.ok) { const e = await res.json(); setError(e.error); setLoading(false); return; }
    setTotpEnabled(false); setShowDisable(false); setDisablePassword('');
    setLoading(false);
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- Render ---

  if (setupState === 'backup-codes') {
    return (
      <div className="max-w-md space-y-6">
        <div className="flex items-center gap-3 text-emerald-600">
          <ShieldCheck size={28} />
          <h3 className="text-xl font-bold">2FA u0111u00e3 u0111u01b0u1ee3c bu1eadt!</h3>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              Lu01b0u lu1ea1i <strong>backup codes</strong> bu00ean du01b0u1edbi. Chu00fang su1ebd khu00f4ng hiu1ec3n lu1ea1i.
            </p>
          </div>
        </div>
        <div className="bg-slate-900 rounded-2xl p-4">
          <div className="grid grid-cols-2 gap-2">
            {backupCodes.map(code => (
              <span key={code} className="font-mono text-sm text-emerald-400 text-center py-1">{code}</span>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={copyBackupCodes}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors">
            {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy tu1ea5t cu1ea3'}
          </button>
          <button onClick={() => setSetupState('idle')}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold">
            Xong
          </button>
        </div>
      </div>
    );
  }

  if (setupState === 'setup') {
    return (
      <div className="max-w-sm space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-2"><QrCode size={24} /> Thiu1ebft lu1eadp 2FA</h3>
        <p className="text-sm text-slate-600">
          Quu00e9t QR code bu1eb1ng <strong>Google Authenticator</strong> hou1eb7c <strong>Microsoft Authenticator</strong>:
        </p>
        <div className="flex justify-center">
          <img src={qrUrl} alt="2FA QR Code" className="rounded-xl border border-slate-200" width={200} height={200} />
        </div>
        <p className="text-xs text-slate-400 text-center">Hou1eb7c nhu1eadp thu1ee7 cu00f4ng: <code className="font-mono bg-slate-100 px-1 rounded">{secret}</code></p>
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            Nhu1eadp mu00e3 6 su1ed1 tu1eeb app
          </label>
          <input
            type="text" inputMode="numeric" maxLength={6}
            value={verifyCode}
            onChange={e => setVerifyCode(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            className="w-full text-center font-mono text-2xl tracking-[0.5em] bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex gap-3">
          <button onClick={() => { setSetupState('idle'); setError(''); }}
            className="px-4 py-2 bg-slate-100 rounded-xl text-sm font-bold text-slate-600">Hu1ee7y</button>
          <button onClick={handleEnable} disabled={verifyCode.length !== 6 || loading}
            className="flex-1 py-2 bg-primary text-white rounded-xl text-sm font-bold disabled:opacity-50">
            {loading ? 'Verifying...' : 'Ku00edch hou1ea1t 2FA'}
          </button>
        </div>
      </div>
    );
  }

  // idle state
  return (
    <div className="max-w-md space-y-6">
      <h3 className="text-2xl font-bold flex items-center gap-2">
        <ShieldCheck className="text-primary" /> Xu00e1c thu1ef1c 2 lu1edbp (2FA)
      </h3>
      <div className={`rounded-2xl p-5 border ${
        totpEnabled ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-slate-800">{totpEnabled ? '2FA u0111ang bu1eadt' : '2FA chu01b0a bu1eadt'}</p>
            <p className="text-sm text-slate-500 mt-0.5">
              {totpEnabled
                ? 'Tu00e0i khou1ea3n cu1ee7a bu1ea1n u0111u01b0u1ee3c bu1ea3o vu1ec7 bu1eb1ng authenticator app'
                : 'Bu1eadt 2FA u0111u1ec3 tu0103ng cu01b0u1eddng bu1ea3o mu1eadt cho tu00e0i khou1ea3n'}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            totpEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
          }`}>{totpEnabled ? 'Bu1eadt' : 'Tu1eaft'}</span>
        </div>
      </div>

      {!totpEnabled && (
        <button onClick={handleStartSetup} disabled={loading}
          className="w-full py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-95 transition-all disabled:opacity-50">
          {loading ? 'Loading...' : 'Bu1eadt 2FA'}
        </button>
      )}

      {totpEnabled && !showDisable && (
        <button onClick={() => setShowDisable(true)}
          className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 font-medium transition-colors">
          <ShieldOff size={16} /> Tu1eaft 2FA
        </button>
      )}

      {showDisable && (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">Nhu1eadp mu1eadt khu1ea9u u0111u1ec3 xu00e1c nhu1eadn tu1eaft 2FA:</p>
          <input type="password" value={disablePassword}
            onChange={e => setDisablePassword(e.target.value)}
            placeholder="Mu1eadt khu1ea9u hiu1ec7n tu1ea1i"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-200" />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-3">
            <button onClick={() => { setShowDisable(false); setDisablePassword(''); setError(''); }}
              className="px-4 py-2 bg-slate-100 rounded-xl text-sm font-bold text-slate-600">Hu1ee7y</button>
            <button onClick={handleDisable} disabled={!disablePassword || loading}
              className="flex-1 py-2 bg-red-500 text-white rounded-xl text-sm font-bold disabled:opacity-50">
              {loading ? 'Disabling...' : 'Xu00e1c nhu1eadn tu1eaft 2FA'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

### 3. Cu1eadp nhu1eadt User type (nu1ebfu cu1ea7n)

Kiu1ec3m tra `src/types/index.ts`, thu00eam `totpEnabled?: boolean` vu00e0o `User` interface nu1ebfu chu01b0a cu00f3.

### 4. Render tab trong Settings page

Tu00ecm file render settings (Glob `src/**/*Settings*`), thu00eam case `'security'`:

```tsx
case 'security':
  return <TwoFactorAuthTab />;
```

## Success Criteria

- [x] Tab "Security" hiu1ec3n trong settings
- [x] User chu01b0a bu1eadt 2FA: hiu1ec3n nu00fat "Bu1eadt 2FA"
- [x] Flow setup: QR u2192 nhu1eadp mu00e3 xu00e1c nhu1eadn u2192 hiu1ec3n backup codes
- [x] Backup codes hiu1ec3n u0111u01b0u1ee3c copy, cu00f3 cu1ea3nh bu00e1o ru00f5 ru00e0ng
- [x] User u0111u00e3 bu1eadt 2FA: hiu1ec3n tru1ea1ng thu00e1i "Bu1eadt" + nu00fat tu1eaft
- [x] Flow disable: nhu1eadp password u2192 xu00e1c nhu1eadn u2192 tu1eaft thu00e0nh cu00f4ng
- [x] TypeScript compile khu00f4ng lu1ed7i

## Notes

- QR code du00f9ng Google Charts API u2014 khu00f4ng cu1ea7n cu00e0i thu00eam thu01b0 viu1ec7n frontend
- `totpEnabled` state local u0111u01b0u1ee3c update ngay sau enable/disable mu00e0 khu00f4ng cu1ea7n refetch `/me`
- Admin reset (tu1eeb User Management tab) cu00f3 thu1ec3 bu1ed5 sung u1edf phase sau nu1ebfu cu1ea7n
