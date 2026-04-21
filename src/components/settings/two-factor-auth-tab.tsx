import { useState } from 'react';
import { ShieldCheck, ShieldOff, QrCode, Copy, Check, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

type SetupState = 'idle' | 'setup' | 'backup-codes';

export function TwoFactorAuthTab() {
  const { currentUser, refreshCurrentUser } = useAuth();
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
  const [totpEnabled, setTotpEnabled] = useState(currentUser?.totpEnabled ?? false);

  const handleStartSetup = async () => {
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
  };

  const handleEnable = async () => {
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
  };

  const handleDisable = async () => {
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
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (setupState === 'backup-codes') {
    return (
      <div className="max-w-md space-y-6">
        <div className="flex items-center gap-3 text-emerald-600">
          <ShieldCheck size={28} />
          <h3 className="text-xl font-bold">2FA đã được bật!</h3>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              Lưu lại <strong>backup codes</strong> bên dưới. Chúng sẽ không hiện lại.
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
            {copied ? 'Copied!' : 'Copy tất cả'}
          </button>
          <button
            onClick={() => setSetupState('idle')}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold"
          >
            Xong
          </button>
        </div>
      </div>
    );
  }

  if (setupState === 'setup') {
    return (
      <div className="max-w-sm space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-2"><QrCode size={24} /> Thiết lập 2FA</h3>
        <p className="text-sm text-slate-600">
          Quét QR code bằng <strong>Google Authenticator</strong> hoặc <strong>Microsoft Authenticator</strong>:
        </p>
        <div className="flex justify-center">
          <img src={qrUrl} alt="2FA QR Code" className="rounded-xl border border-slate-200" width={200} height={200} />
        </div>
        <p className="text-xs text-slate-400 text-center">
          Hoặc nhập thủ công: <code className="font-mono bg-slate-100 px-1 rounded">{secret}</code>
        </p>
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            Nhập mã 6 số từ app
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
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex gap-3">
          <button
            onClick={() => { setSetupState('idle'); setError(''); }}
            className="px-4 py-2 bg-slate-100 rounded-xl text-sm font-bold text-slate-600"
          >
            Hủy
          </button>
          <button
            onClick={handleEnable}
            disabled={verifyCode.length !== 6 || loading}
            className="flex-1 py-2 bg-primary text-white rounded-xl text-sm font-bold disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Kích hoạt 2FA'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md space-y-6">
      <h3 className="text-2xl font-bold flex items-center gap-2">
        <ShieldCheck className="text-primary" /> Xác thực 2 lớp (2FA)
      </h3>
      <div className={`rounded-2xl p-5 border ${
        totpEnabled ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-slate-800">{totpEnabled ? '2FA đang bật' : '2FA chưa bật'}</p>
            <p className="text-sm text-slate-500 mt-0.5">
              {totpEnabled
                ? 'Tài khoản của bạn được bảo vệ bằng authenticator app'
                : 'Bật 2FA để tăng cường bảo mật cho tài khoản'}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            totpEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
          }`}>{totpEnabled ? 'Bật' : 'Tắt'}</span>
        </div>
      </div>

      {!totpEnabled && (
        <button
          onClick={handleStartSetup}
          disabled={loading}
          className="w-full py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Bật 2FA'}
        </button>
      )}

      {totpEnabled && !showDisable && (
        <button
          onClick={() => setShowDisable(true)}
          className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
        >
          <ShieldOff size={16} /> Tắt 2FA
        </button>
      )}

      {showDisable && (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">Nhập mật khẩu để xác nhận tắt 2FA:</p>
          <input
            type="password"
            value={disablePassword}
            onChange={e => setDisablePassword(e.target.value)}
            placeholder="Mật khẩu hiện tại"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-200"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-3">
            <button
              onClick={() => { setShowDisable(false); setDisablePassword(''); setError(''); }}
              className="px-4 py-2 bg-slate-100 rounded-xl text-sm font-bold text-slate-600"
            >
              Hủy
            </button>
            <button
              onClick={handleDisable}
              disabled={!disablePassword || loading}
              className="flex-1 py-2 bg-red-500 text-white rounded-xl text-sm font-bold disabled:opacity-50"
            >
              {loading ? 'Disabling...' : 'Xác nhận tắt 2FA'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
