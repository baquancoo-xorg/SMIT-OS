import { useState } from 'react';
import { User, Save, KeyRound, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function ProfileTab() {
  const { currentUser, refreshCurrentUser } = useAuth();
  const [fullName, setFullName] = useState(currentUser?.fullName ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
        setError(e.error || 'Cập nhật thất bại');
      } else {
        setSuccess('Cập nhật thành công');
        await refreshCurrentUser();
      }
    } catch {
      setError('Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới không khớp');
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
        setError(e.error || 'Đổi mật khẩu thất bại');
      } else {
        setSuccess('Đổi mật khẩu thành công');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setError('Đổi mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md space-y-8">
      {/* Profile info */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <User size={22} className="text-primary" /> Thông tin cá nhân
        </h3>
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Tên hiển thị</label>
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Username</label>
          <input
            type="text"
            value={currentUser?.username ?? ''}
            disabled
            className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-400 cursor-not-allowed"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Vai trò</label>
          <input
            type="text"
            value={currentUser?.role ?? ''}
            disabled
            className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-400 cursor-not-allowed"
          />
        </div>
        <button
          onClick={handleUpdateProfile}
          disabled={loading || fullName === currentUser?.fullName}
          className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-xl text-sm font-bold disabled:opacity-50 hover:scale-95 transition-all"
        >
          <Save size={16} /> Lưu thay đổi
        </button>
      </section>

      <hr className="border-slate-200" />

      {/* Change password */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <KeyRound size={22} className="text-primary" /> Đổi mật khẩu
        </h3>
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Mật khẩu hiện tại</label>
          <input
            type="password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Mật khẩu mới</label>
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Xác nhận mật khẩu mới</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button
          onClick={handleChangePassword}
          disabled={loading || !currentPassword || !newPassword || !confirmPassword}
          className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-xl text-sm font-bold disabled:opacity-50 hover:scale-95 transition-all"
        >
          <Check size={16} /> Đổi mật khẩu
        </button>
      </section>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-emerald-600 text-sm font-medium">{success}</p>}
    </div>
  );
}
