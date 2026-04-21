import { useState } from 'react';
import { Save, Check, ShieldCheck, ShieldOff, QrCode, Copy, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Input, Button } from '../ui';

type SetupState = 'idle' | 'setup' | 'backup-codes';

export function ProfileTab() {
  const { currentUser, refreshCurrentUser } = useAuth();
  const [fullName, setFullName] = useState(currentUser?.fullName ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [setupState, setSetupState] = useState<SetupState>('idle');
  const [qrUrl, setQrUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [disablePassword, setDisablePassword] = useState('');
  const [showDisable, setShowDisable] = useState(false);
  const [twoFaLoading, setTwoFaLoading] = useState(false);
  const [twoFaError, setTwoFaError] = useState('');
  const [copied, setCopied] = useState(false);
  const [totpEnabled, setTotpEnabled] = useState(currentUser?.totpEnabled ?? false);

  const handleUpdateProfile = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName }),
        credentials: 'include',
      });
      if (!res.ok) {
        const e = await res.json();
        setError(e.error || 'Update failed');
      } else {
        setSuccess('Profile updated successfully');
        await refreshCurrentUser();
      }
    } catch {
      setError('Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/users/me/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
        credentials: 'include',
      });
      if (!res.ok) {
        const e = await res.json();
        setError(e.error || 'Password change failed');
      } else {
        setSuccess('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setError('Password change failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSetup = async () => {
    setTwoFaLoading(true);
    setTwoFaError('');
    const res = await fetch('/api/auth/2fa/setup', { credentials: 'include' });
    if (!res.ok) {
      setTwoFaError('Cannot start setup');
      setTwoFaLoading(false);
      return;
    }
    const data = await res.json();
    setSecret(data.secret);
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.otpauthUrl)}`);
    setSetupState('setup');
    setTwoFaLoading(false);
  };

  const handleEnable2FA = async () => {
    setTwoFaLoading(true);
    setTwoFaError('');
    const res = await fetch('/api/auth/2fa/enable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: verifyCode }),
      credentials: 'include',
    });
    if (!res.ok) {
      const e = await res.json();
      setTwoFaError(e.error);
      setTwoFaLoading(false);
      return;
    }
    const data = await res.json();
    setBackupCodes(data.backupCodes);
    setTotpEnabled(true);
    setSetupState('backup-codes');
    await refreshCurrentUser();
    setTwoFaLoading(false);
  };

  const handleDisable2FA = async () => {
    setTwoFaLoading(true);
    setTwoFaError('');
    const res = await fetch('/api/auth/2fa/disable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: disablePassword }),
      credentials: 'include',
    });
    if (!res.ok) {
      const e = await res.json();
      setTwoFaError(e.error);
      setTwoFaLoading(false);
      return;
    }
    setTotpEnabled(false);
    setShowDisable(false);
    setDisablePassword('');
    await refreshCurrentUser();
    setTwoFaLoading(false);
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl space-y-12">
      {/* Personal Information */}
      <section className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Display Name"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
          />
          <Input
            label="Username"
            value={currentUser?.username ?? ''}
            disabled
          />
          <Input
            label="Role"
            value={currentUser?.role ?? ''}
            disabled
          />
        </div>
        <Button
          onClick={handleUpdateProfile}
          isLoading={loading}
          disabled={fullName === currentUser?.fullName}
          className="gap-2"
        >
          <Save size={16} /> Save Changes
        </Button>
      </section>

      <hr className="border-slate-100" />

      {/* Change Password */}
      <section className="space-y-6">
        <h3 className="text-base font-bold text-on-surface">Change Password</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            type="password"
            label="Current Password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
          />
          <div className="hidden md:block" />
          <Input
            type="password"
            label="New Password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
          />
          <Input
            type="password"
            label="Confirm New Password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />
        </div>
        <Button
          onClick={handleChangePassword}
          isLoading={loading}
          disabled={!currentPassword || !newPassword || !confirmPassword}
          variant="secondary"
          className="gap-2"
        >
          <Check size={16} /> Change Password
        </Button>
      </section>

      {(error || success) && (
        <div className={`p-4 rounded-xl border text-sm font-medium ${
          error ? 'bg-error/10 border-error/20 text-error' : 'bg-tertiary/10 border-tertiary/20 text-tertiary'
        }`}>
          {error || success}
        </div>
      )}

      <hr className="border-slate-100" />

      {/* Two-Factor Authentication */}
      <section className="space-y-6">
        <h3 className="text-base font-bold text-on-surface">Two-Factor Authentication</h3>

        {setupState === 'backup-codes' && (
          <div className="max-w-md space-y-6">
            <div className="flex items-center gap-3 text-emerald-600">
              <ShieldCheck size={28} />
              <h4 className="text-xl font-bold">2FA Enabled!</h4>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-800">
                  Save your <strong>backup codes</strong> below. They will not be shown again.
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
              <button
                onClick={copyBackupCodes}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy all'}
              </button>
              <button
                onClick={() => setSetupState('idle')}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {setupState === 'setup' && (
          <div className="max-w-sm space-y-6">
            <h4 className="text-xl font-bold flex items-center gap-2"><QrCode size={24} /> Set up 2FA</h4>
            <p className="text-sm text-slate-600">
              Scan the QR code with <strong>Google Authenticator</strong> or <strong>Microsoft Authenticator</strong>:
            </p>
            <div className="flex justify-center">
              <img src={qrUrl} alt="2FA QR Code" className="border border-slate-200" width={200} height={200} />
            </div>
            <p className="text-xs text-slate-400 text-center">
              Or enter manually: <code className="font-mono bg-slate-100 px-1 rounded">{secret}</code>
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Enter 6-digit code from app
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={verifyCode}
                onChange={e => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full text-center font-mono text-2xl tracking-[0.5em] bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            {twoFaError && <p className="text-red-500 text-sm">{twoFaError}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => { setSetupState('idle'); setTwoFaError(''); }}
                className="px-4 py-2 bg-slate-100 rounded-xl text-sm font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleEnable2FA}
                disabled={verifyCode.length !== 6 || twoFaLoading}
                className="flex-1 py-2 bg-primary text-white rounded-xl text-sm font-bold disabled:opacity-50"
              >
                {twoFaLoading ? 'Verifying...' : 'Activate 2FA'}
              </button>
            </div>
          </div>
        )}

        {setupState === 'idle' && (
          <div className="max-w-md space-y-4">
            <div className={`rounded-2xl p-5 border ${
              totpEnabled ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">{totpEnabled ? '2FA is enabled' : '2FA is disabled'}</p>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {totpEnabled
                      ? 'Your account is protected by an authenticator app'
                      : 'Enable 2FA to add an extra layer of security'}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  totpEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                }`}>{totpEnabled ? 'On' : 'Off'}</span>
              </div>
            </div>

            {!totpEnabled && (
              <button
                onClick={handleStartSetup}
                disabled={twoFaLoading}
                className="w-full py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-95 transition-all disabled:opacity-50"
              >
                {twoFaLoading ? 'Loading...' : 'Enable 2FA'}
              </button>
            )}

            {totpEnabled && !showDisable && (
              <button
                onClick={() => setShowDisable(true)}
                className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
              >
                <ShieldOff size={16} /> Disable 2FA
              </button>
            )}

            {showDisable && (
              <div className="space-y-3">
                <p className="text-sm text-slate-600">Enter your password to confirm disabling 2FA:</p>
                <input
                  type="password"
                  value={disablePassword}
                  onChange={e => setDisablePassword(e.target.value)}
                  placeholder="Current password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-200"
                />
                {twoFaError && <p className="text-red-500 text-sm">{twoFaError}</p>}
                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowDisable(false); setDisablePassword(''); setTwoFaError(''); }}
                    className="px-4 py-2 bg-slate-100 rounded-xl text-sm font-bold text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDisable2FA}
                    disabled={!disablePassword || twoFaLoading}
                    className="flex-1 py-2 bg-red-500 text-white rounded-xl text-sm font-bold disabled:opacity-50"
                  >
                    {twoFaLoading ? 'Disabling...' : 'Confirm disable 2FA'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
