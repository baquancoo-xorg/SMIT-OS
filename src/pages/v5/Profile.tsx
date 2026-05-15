import { useEffect, useState } from 'react';
import { Camera, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { useToast } from '../../components/ui/notification-toast';

export default function Profile() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(currentUser?.fullName ?? '');
  const [role, setRole] = useState(currentUser?.scope || currentUser?.role || '');
  const username = currentUser?.username ?? '';
  const initials = (name || username || 'U').slice(0, 2).toUpperCase();

  useEffect(() => {
    setName(currentUser?.fullName ?? '');
    setRole(currentUser?.scope || currentUser?.role || '');
  }, [currentUser]);

  function handleSave() {
    toast({ tone: 'info', title: 'Profile update queued', description: 'Profile API chưa có endpoint ghi; dữ liệu hiển thị đang lấy từ phiên đăng nhập thật.' });
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <Card padding="lg" glow>
        <div className="flex flex-wrap items-center gap-5 border-b border-border pb-6">
          {/* ui-canon-ok: font-black for hero avatar initial */}
          <div className="flex size-20 items-center justify-center rounded-card border border-border bg-surface-2 font-headline text-2xl font-black text-accent-text shadow-card">
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt={`${name} avatar`} className="size-full rounded-card object-cover" />
            ) : initials}
          </div>
          <div className="flex flex-col gap-1.5">
            {/* ui-canon-ok: font-black for label */}
            <p className="text-xs font-black uppercase tracking-[0.18em] text-text-muted">Profile photo</p>
            <Button variant="secondary" size="sm" iconLeft={<Camera />} disabled>
              Change avatar
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-6">
          <Input label="Full name" value={name} onChange={(event) => setName(event.target.value)} required />
          <Input label="Role" value={role} onChange={(event) => setRole(event.target.value)} />
          <Input label="Username" value={username} readOnly helperText="Used for login." />

          <div className="flex justify-end pt-3">
            <Button variant="primary" iconLeft={<Save />} onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
