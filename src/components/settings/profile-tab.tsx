import { useState } from 'react';
import { User, Save, KeyRound, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Input, Button, SectionHeader } from '../ui';

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
    <div className="max-w-2xl space-y-12">
      {/* Profile info */}
      <section className="space-y-6">
        <SectionHeader
          icon={<User size={20} />}
          title="Thông tin cá nhân"
          subtitle="Public Profile"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Tên hiển thị"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
          />
          <Input
            label="Username"
            value={currentUser?.username ?? ''}
            disabled
          />
          <Input
            label="Vai trò"
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
          <Save size={16} /> Lưu thay đổi
        </Button>
      </section>

      <hr className="border-slate-100" />

      {/* Change password */}
      <section className="space-y-6">
        <SectionHeader
          icon={<KeyRound size={20} />}
          title="Đổi mật khẩu"
          subtitle="Security Settings"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            type="password"
            label="Mật khẩu hiện tại"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
          />
          <div className="hidden md:block"></div>
          <Input
            type="password"
            label="Mật khẩu mới"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
          />
          <Input
            type="password"
            label="Xác nhận mật khẩu mới"
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
          <Check size={16} /> Đổi mật khẩu
        </Button>
      </section>

      {(error || success) && (
        <div className={`p-4 rounded-xl border text-sm font-medium ${error ? 'bg-error/10 border-error/20 text-error' : 'bg-tertiary/10 border-tertiary/20 text-tertiary'}`}>
          {error || success}
        </div>
      )}
    </div>
  );
}
