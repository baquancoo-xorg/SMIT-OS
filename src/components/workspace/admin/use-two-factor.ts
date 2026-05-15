import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export type TwoFactorSetupState = 'idle' | 'setup' | 'backup-codes';

export function useTwoFactor() {
  const { currentUser, refreshCurrentUser } = useAuth();
  const [setupState, setSetupState] = useState<TwoFactorSetupState>('idle');
  const [qrUrl, setQrUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [disablePassword, setDisablePassword] = useState('');
  const [showDisable, setShowDisable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [totpEnabled, setTotpEnabled] = useState(currentUser?.totpEnabled ?? false);

  async function startSetup() {
    setLoading(true);
    setError('');
    const res = await fetch('/api/auth/2fa/setup', { credentials: 'include' });
    if (!res.ok) {
      setError('Cannot start setup');
      setLoading(false);
      return;
    }
    const data = await res.json();
    setSecret(data.secret);
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.otpauthUrl)}`);
    setSetupState('setup');
    setLoading(false);
  }

  async function enable() {
    setLoading(true);
    setError('');
    const res = await fetch('/api/auth/2fa/enable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: verifyCode }),
      credentials: 'include',
    });
    if (!res.ok) {
      const e = await res.json();
      setError(e.error);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setBackupCodes(data.backupCodes);
    setTotpEnabled(true);
    setSetupState('backup-codes');
    await refreshCurrentUser();
    setLoading(false);
  }

  async function disable() {
    setLoading(true);
    setError('');
    const res = await fetch('/api/auth/2fa/disable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: disablePassword }),
      credentials: 'include',
    });
    if (!res.ok) {
      const e = await res.json();
      setError(e.error);
      setLoading(false);
      return;
    }
    setTotpEnabled(false);
    setShowDisable(false);
    setDisablePassword('');
    await refreshCurrentUser();
    setLoading(false);
  }

  function copyBackupCodes() {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function cancelSetup() {
    setSetupState('idle');
    setError('');
  }

  function cancelDisable() {
    setShowDisable(false);
    setDisablePassword('');
    setError('');
  }

  return {
    setupState, setSetupState,
    qrUrl, secret,
    verifyCode, setVerifyCode,
    backupCodes,
    disablePassword, setDisablePassword,
    showDisable, setShowDisable,
    loading, error, copied, totpEnabled,
    startSetup, enable, disable, copyBackupCodes,
    cancelSetup, cancelDisable,
  };
}
