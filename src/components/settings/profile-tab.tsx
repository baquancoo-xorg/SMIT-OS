import { useState } from 'react';
import { Check, ShieldCheck, ShieldOff, QrCode, Copy, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Input, Button, GlassCard as Card } from '../ui/v2';

type SetupState = 'idle' | 'setup' | 'backup-codes';

export function ProfileTab() {
  const { currentUser, refreshCurrentUser } = useAuth();
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
    <div className="max-w-5xl space-y-6">
      <Card variant="surface" className="p-6 space-y-6">
        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Profile Information</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Input
            label="Display Name"
            value={currentUser?.fullName ?? ''}
            disabled
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
      </Card>

      <Card variant="surface" className="p-6 space-y-6">
        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Two-Factor Authentication</p>

        {setupState === 'backup-codes' && (
          <div className="max-w-md space-y-6">
            <div className="flex items-center gap-3 text-emerald-600">
              <ShieldCheck size={28} />
              <h4 className="text-xl font-bold">2FA Enabled!</h4>
            </div>
            <div className="bg-warning-container/30 border border-warning-container/60 rounded-card p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle size={18} className="text-warning mt-0.5 flex-shrink-0" />
                <p className="text-sm text-warning">
                  Save your <strong>backup codes</strong> below. They will not be shown again.
                </p>
              </div>
            </div>
            <div className="bg-on-surface rounded-card p-4">
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map(code => (
                  <span key={code} className="font-mono text-sm text-emerald-400 text-center py-1">{code}</span>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={copyBackupCodes}
                variant="secondary"
                size="sm"
                className="gap-2"
              >
                {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy all'}
              </Button>
              <Button
                onClick={() => setSetupState('idle')}
                className="flex-1"
              >
                Done
              </Button>
            </div>
          </div>
        )}

        {setupState === 'setup' && (
          <div className="max-w-sm space-y-6">
            <h4 className="text-xl font-bold flex items-center gap-2"><QrCode size={24} /> Set up 2FA</h4>
            <p className="text-sm text-on-surface-variant">
              Scan the QR code with <strong>Google Authenticator</strong> or <strong>Microsoft Authenticator</strong>:
            </p>
            <div className="flex justify-center">
              <img src={qrUrl} alt="2FA QR Code" className="border border-outline-variant/40" width={200} height={200} />
            </div>
            <p className="text-xs text-on-surface-variant text-center">
              Or enter manually: <code className="font-mono bg-surface-variant/60 px-1 rounded">{secret}</code>
            </p>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                Enter 6-digit code from app
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={verifyCode}
                onChange={e => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full text-center font-mono text-2xl tracking-[0.5em] bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 outline-none transition-all focus:ring-2 focus:ring-primary/35 focus:border-primary/40"
              />
            </div>
            {twoFaError && <p className="text-error text-sm">{twoFaError}</p>}
            <div className="flex gap-3">
              <Button
                onClick={() => { setSetupState('idle'); setTwoFaError(''); }}
                variant="secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEnable2FA}
                disabled={verifyCode.length !== 6 || twoFaLoading}
                className="flex-1"
              >
                {twoFaLoading ? 'Verifying...' : 'Activate 2FA'}
              </Button>
            </div>
          </div>
        )}

        {setupState === 'idle' && (
          <div className="max-w-md space-y-4">
            <div className={`rounded-card p-5 border ${
              totpEnabled ? 'bg-emerald-50 border-emerald-200' : 'bg-surface-variant/30 border-outline-variant/40'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-on-surface">{totpEnabled ? '2FA is enabled' : '2FA is disabled'}</p>
                  <p className="text-sm text-on-surface-variant mt-0.5">
                    {totpEnabled
                      ? 'Your account is protected by an authenticator app'
                      : 'Enable 2FA to add an extra layer of security'}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  totpEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-surface-variant text-on-surface-variant'
                }`}>{totpEnabled ? 'On' : 'Off'}</span>
              </div>
            </div>

            {!totpEnabled && (
              <Button
                onClick={handleStartSetup}
                disabled={twoFaLoading}
                className="w-full"
              >
                {twoFaLoading ? 'Loading...' : 'Enable 2FA'}
              </Button>
            )}

            {totpEnabled && !showDisable && (
              <Button
                onClick={() => setShowDisable(true)}
                variant="ghost"
                size="sm"
                className="gap-2 text-error"
              >
                <ShieldOff size={16} /> Disable 2FA
              </Button>
            )}

            {showDisable && (
              <div className="space-y-3">
                <p className="text-sm text-on-surface-variant">Enter your password to confirm disabling 2FA:</p>
                <Input
                  type="password"
                  value={disablePassword}
                  onChange={e => setDisablePassword(e.target.value)}
                  placeholder="Current password"
                />
                {twoFaError && <p className="text-error text-sm">{twoFaError}</p>}
                <div className="flex gap-3">
                  <Button
                    onClick={() => { setShowDisable(false); setDisablePassword(''); setTwoFaError(''); }}
                    variant="secondary"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDisable2FA}
                    disabled={!disablePassword || twoFaLoading}
                    variant="destructive"
                    className="flex-1"
                  >
                    {twoFaLoading ? 'Disabling...' : 'Confirm disable 2FA'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
