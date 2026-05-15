import { Check, ShieldCheck, ShieldOff, QrCode, Copy, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useTwoFactor } from './use-two-factor';

export function TwoFactorCard() {
  const tf = useTwoFactor();

  return (
    <Card padding="lg" glow>
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-1 size-6 text-accent-text" aria-hidden="true" />
        <div className="flex-1">
          {/* ui-canon-ok: font-black for KPI */}
          <p className="text-xs font-black uppercase tracking-[0.18em] text-text-muted">2FA</p>
          <h2 className="mt-2 font-headline text-2xl font-black text-text-1">Authenticator</h2>
        </div>
      </div>

      {tf.setupState === 'backup-codes' && (
        <div className="mt-5 flex max-w-md flex-col gap-5">
          <div className="flex items-center gap-3 text-success">
            <ShieldCheck className="size-7" aria-hidden="true" />
            <h4 className="font-headline text-xl font-bold">2FA Enabled!</h4>
          </div>
          <div className="flex items-start gap-2 rounded-card border border-warning/30 bg-warning-container/40 p-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
            <p className="text-sm text-on-warning-container">
              Save your <strong>backup codes</strong> below. They will not be shown again.
            </p>
          </div>
          <div className="rounded-card bg-surface-2 p-4">
            <div className="grid grid-cols-2 gap-2">
              {tf.backupCodes.map((code) => (
                <span key={code} className="py-1 text-center font-mono text-sm text-text-1">{code}</span>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={tf.copyBackupCodes} variant="secondary" size="sm" iconLeft={tf.copied ? <Check /> : <Copy />}>
              {tf.copied ? 'Copied!' : 'Copy all'}
            </Button>
            <Button onClick={() => tf.setSetupState('idle')} variant="primary" fullWidth>Done</Button>
          </div>
        </div>
      )}

      {tf.setupState === 'setup' && (
        <div className="mt-5 flex max-w-sm flex-col gap-5">
          <h4 className="flex items-center gap-2 font-headline text-xl font-bold text-text-1">
            <QrCode className="size-6" aria-hidden="true" /> Set up 2FA
          </h4>
          <p className="text-sm text-text-2">
            Scan the QR code with <strong>Google Authenticator</strong> or <strong>Microsoft Authenticator</strong>:
          </p>
          <div className="flex justify-center">
            <img src={tf.qrUrl} alt="2FA QR Code" className="rounded-card border border-border" width={200} height={200} />
          </div>
          <p className="text-center text-xs text-text-muted">
            Or enter manually: <code className="rounded-sm bg-surface-2 px-1.5 py-0.5 font-mono">{tf.secret}</code>
          </p>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="totp-verify" className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              Enter 6-digit code from app
            </label>
            <input
              id="totp-verify"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={tf.verifyCode}
              onChange={(e) => tf.setVerifyCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="h-14 rounded-[var(--radius-input)] border border-border bg-surface px-4 text-center font-mono text-2xl tracking-[0.5em] text-text-1 focus-visible:border-accent focus-visible:outline-none"
            />
          </div>
          {tf.error && <p className="text-sm text-error" role="alert">{tf.error}</p>}
          <div className="flex gap-2">
            <Button variant="ghost" iconLeft={<ArrowLeft />} onClick={tf.cancelSetup}>Cancel</Button>
            <Button variant="primary" onClick={tf.enable} disabled={tf.verifyCode.length !== 6} isLoading={tf.loading} fullWidth>
              Activate 2FA
            </Button>
          </div>
        </div>
      )}

      {tf.setupState === 'idle' && (
        <div className="mt-5 flex max-w-md flex-col gap-4">
          <div className={`flex items-start justify-between gap-3 rounded-card border p-4 ${tf.totpEnabled ? 'border-success/30 bg-success-container/40' : 'border-border bg-surface-2'}`}>
            <div>
              <p className="font-semibold text-text-1">{tf.totpEnabled ? '2FA is enabled' : '2FA is disabled'}</p>
              <p className="mt-0.5 text-sm text-text-2">
                {tf.totpEnabled ? 'Your account is protected by an authenticator app.' : 'Enable 2FA to add an extra layer of security.'}
              </p>
            </div>
            <Badge variant={tf.totpEnabled ? 'success' : 'neutral'}>{tf.totpEnabled ? 'On' : 'Off'}</Badge>
          </div>

          {!tf.totpEnabled && (
            <Button onClick={tf.startSetup} variant="primary" isLoading={tf.loading} fullWidth>
              Enable 2FA
            </Button>
          )}

          {tf.totpEnabled && !tf.showDisable && (
            <Button onClick={() => tf.setShowDisable(true)} variant="ghost" size="sm" iconLeft={<ShieldOff />} className="text-error hover:bg-error-container/40">
              Disable 2FA
            </Button>
          )}

          {tf.showDisable && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-text-2">Enter your password to confirm disabling 2FA:</p>
              <Input type="password" autoComplete="current-password" value={tf.disablePassword} onChange={(e) => tf.setDisablePassword(e.target.value)} placeholder="Current password" />
              {tf.error && <p className="text-sm text-error" role="alert">{tf.error}</p>}
              <div className="flex gap-2">
                <Button variant="ghost" onClick={tf.cancelDisable}>Cancel</Button>
                <Button variant="destructive" onClick={tf.disable} disabled={!tf.disablePassword} isLoading={tf.loading} fullWidth>
                  Confirm disable 2FA
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
