import { useState } from 'react';
import { Check, ShieldCheck, ShieldOff, QrCode, Copy, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { Input, Button, GlassCard, Badge } from '../../ui/v2';

type SetupState = 'idle' | 'setup' | 'backup-codes';

/**
 * ProfileTab v2 — token-driven Settings/Profile sub-tab.
 *
 * API + state identical to v1 (`/api/auth/2fa/setup|enable|disable`).
 * Visual layer only: GlassCard sections, Badge for 2FA status, Input/Button v2.
 */
export function ProfileTabV2() {
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
    <div className="flex flex-col gap-6 max-w-5xl">
      {/* Profile Information */}
      <GlassCard
        variant="raised"
        padding="lg"
        ariaLabel="Profile information"
      >
        <p className="text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant">
          Profile information
        </p>
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Display name" value={currentUser?.fullName ?? ''} disabled />
          <Input label="Username" value={currentUser?.username ?? ''} disabled />
          <Input label="Role" value={currentUser?.role ?? ''} disabled />
        </div>
      </GlassCard>

      {/* Two-Factor Authentication */}
      <GlassCard
        variant="raised"
        padding="lg"
        ariaLabel="Two-factor authentication"
      >
        <p className="text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant">
          Two-factor authentication
        </p>

        {setupState === 'backup-codes' && (
          <div className="mt-5 max-w-md flex flex-col gap-5">
            <div className="flex items-center gap-3 text-success">
              <ShieldCheck className="size-7" aria-hidden="true" />
              <h4 className="font-headline text-xl font-bold">2FA Enabled!</h4>
            </div>
            <div className="rounded-card bg-warning-container/40 border border-warning/30 p-3 flex items-start gap-2">
              <AlertTriangle className="size-4 text-warning shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm text-on-warning-container">
                Save your <strong>backup codes</strong> below. They will not be shown again.
              </p>
            </div>
            <div className="rounded-card bg-on-surface p-4">
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code) => (
                  <span key={code} className="font-mono text-sm text-success-container text-center py-1">
                    {code}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={copyBackupCodes}
                variant="secondary"
                size="sm"
                iconLeft={copied ? <Check /> : <Copy />}
              >
                {copied ? 'Copied!' : 'Copy all'}
              </Button>
              <Button onClick={() => setSetupState('idle')} variant="primary" fullWidth>
                Done
              </Button>
            </div>
          </div>
        )}

        {setupState === 'setup' && (
          <div className="mt-5 max-w-sm flex flex-col gap-5">
            <h4 className="font-headline text-xl font-bold flex items-center gap-2 text-on-surface">
              <QrCode className="size-6" aria-hidden="true" /> Set up 2FA
            </h4>
            <p className="text-sm text-on-surface-variant">
              Scan the QR code with <strong>Google Authenticator</strong> or <strong>Microsoft Authenticator</strong>:
            </p>
            <div className="flex justify-center">
              <img src={qrUrl} alt="2FA QR Code" className="rounded-card border border-outline-variant/40" width={200} height={200} />
            </div>
            <p className="text-xs text-on-surface-variant text-center">
              Or enter manually: <code className="font-mono bg-surface-container-low px-1.5 py-0.5 rounded-sm">{secret}</code>
            </p>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="totp-verify" className="text-[length:var(--text-label)] font-medium text-on-surface-variant">
                Enter 6-digit code from app
              </label>
              <input
                id="totp-verify"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="h-14 rounded-input border border-outline-variant bg-surface-container-lowest px-4 text-center text-2xl font-mono tracking-[0.5em] text-on-surface focus-visible:outline-none focus-visible:border-primary"
              />
            </div>
            {twoFaError && <p className="text-sm text-error">{twoFaError}</p>}
            <div className="flex gap-2">
              <Button
                variant="ghost"
                iconLeft={<ArrowLeft />}
                onClick={() => {
                  setSetupState('idle');
                  setTwoFaError('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleEnable2FA}
                disabled={verifyCode.length !== 6}
                isLoading={twoFaLoading}
                fullWidth
              >
                Activate 2FA
              </Button>
            </div>
          </div>
        )}

        {setupState === 'idle' && (
          <div className="mt-5 max-w-md flex flex-col gap-4">
            <div
              className={`rounded-card border p-4 flex items-start justify-between gap-3 ${
                totpEnabled
                  ? 'border-success/30 bg-success-container/40'
                  : 'border-outline-variant/40 bg-surface-container-low'
              }`}
            >
              <div>
                <p className="font-semibold text-on-surface">
                  {totpEnabled ? '2FA is enabled' : '2FA is disabled'}
                </p>
                <p className="mt-0.5 text-sm text-on-surface-variant">
                  {totpEnabled
                    ? 'Your account is protected by an authenticator app.'
                    : 'Enable 2FA to add an extra layer of security.'}
                </p>
              </div>
              <Badge variant={totpEnabled ? 'success' : 'neutral'}>{totpEnabled ? 'On' : 'Off'}</Badge>
            </div>

            {!totpEnabled && (
              <Button onClick={handleStartSetup} variant="primary" isLoading={twoFaLoading} fullWidth>
                Enable 2FA
              </Button>
            )}

            {totpEnabled && !showDisable && (
              <Button
                onClick={() => setShowDisable(true)}
                variant="ghost"
                size="sm"
                iconLeft={<ShieldOff />}
                className="text-error hover:bg-error-container/40"
              >
                Disable 2FA
              </Button>
            )}

            {showDisable && (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-on-surface-variant">
                  Enter your password to confirm disabling 2FA:
                </p>
                <Input
                  type="password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  placeholder="Current password"
                />
                {twoFaError && <p className="text-sm text-error">{twoFaError}</p>}
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowDisable(false);
                      setDisablePassword('');
                      setTwoFaError('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDisable2FA}
                    disabled={!disablePassword}
                    isLoading={twoFaLoading}
                    fullWidth
                  >
                    Confirm disable 2FA
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
