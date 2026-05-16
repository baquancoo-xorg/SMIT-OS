import { useEffect, useState } from 'react';
import { Camera, Save } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useMyPersonnelQuery, useUpdateMyPersonnelMutation } from '../../../hooks/use-personnel';
import { POSITION_LABEL } from '../../../lib/personnel/personnel-types';
import { Button, Card, Input, useToast } from '../../ui';

const POSITION_HINT_VN: Record<string, string> = {
  MARKETING: 'Marketing',
  MEDIA: 'Media',
  ACCOUNT: 'Account / Sale',
};

function toDateInput(iso: string | null): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}

export function ProfileGeneralTab() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const { data: personnel, isLoading } = useMyPersonnelQuery();
  const updateMutation = useUpdateMyPersonnelMutation();

  const [name, setName] = useState(currentUser?.fullName ?? '');
  const [scope, setScope] = useState(currentUser?.scope ?? '');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthPlace, setBirthPlace] = useState('');

  const username = currentUser?.username ?? '';
  const initials = (name || username || 'U').slice(0, 2).toUpperCase();

  useEffect(() => {
    setName(currentUser?.fullName ?? '');
    setScope(currentUser?.scope ?? '');
  }, [currentUser]);

  useEffect(() => {
    if (personnel) {
      setBirthDate(toDateInput(personnel.birthDate));
      setBirthTime(personnel.birthTime ?? '');
      setBirthPlace(personnel.birthPlace ?? '');
    }
  }, [personnel]);

  function handleSaveAccount() {
    toast({
      tone: 'info',
      title: 'Account update queued',
      description: 'User API tự sửa fullName/scope chưa có endpoint; admin chỉnh giúp từ Settings → Users.',
    });
  }

  function handleSavePersonnel() {
    if (!personnel) return;
    updateMutation.mutate(
      {
        birthDate: birthDate || null,
        birthTime: birthTime || null,
        birthPlace: birthPlace || null,
      },
      {
        onSuccess: () => toast({ tone: 'success', title: 'Đã lưu thông tin cá nhân' }),
        onError: (e: Error) => toast({ tone: 'error', title: 'Lưu thất bại', description: e.message }),
      },
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card padding="lg" glow>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-text-muted">Account</p>
        <h2 className="mt-2 font-headline text-2xl font-black text-text-1">Tài khoản</h2>

        <div className="mt-5 flex flex-wrap items-center gap-5 border-b border-border pb-6">
          {/* ui-canon-ok: font-black for hero avatar initial */}
          <div className="flex size-20 items-center justify-center rounded-card border border-border bg-surface-2 font-headline text-2xl font-black text-accent-text shadow-card">
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt={`${name} avatar`} className="size-full rounded-card object-cover" />
            ) : initials}
          </div>
          <div className="flex flex-col gap-1.5">
            {/* ui-canon-ok: font-black for label */}
            <p className="text-xs font-black uppercase tracking-[0.18em] text-text-muted">Ảnh đại diện</p>
            <Button variant="secondary" size="sm" iconLeft={<Camera />} disabled>
              Đổi avatar
            </Button>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <Input label="Họ và tên" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Username" value={username} readOnly helperText="Dùng để đăng nhập." />
          <Input label="Vị trí công việc" value={scope} onChange={(e) => setScope(e.target.value)} helperText="VD: Backend Developer, Account Executive." />

          <div className="flex justify-end pt-3">
            <Button variant="primary" iconLeft={<Save />} onClick={handleSaveAccount}>Lưu thông tin</Button>
          </div>
        </div>
      </Card>

      <Card padding="lg" glow>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-text-muted">Personnel</p>
        <h2 className="mt-2 font-headline text-2xl font-black text-text-1">Hồ sơ nhân sự</h2>
        <p className="mt-2 text-sm font-medium text-text-2">
          Thông tin nền tảng dùng cho radar năng lực, numerology và bát tự. Birth date bắt buộc nếu muốn xem numerology/bát tự.
        </p>

        {isLoading ? (
          <div className="mt-5 h-48 animate-pulse rounded-card bg-surface-2" />
        ) : !personnel ? (
          <div className="mt-5 rounded-card border border-border bg-surface-2 p-4 text-sm text-text-2">
            Bạn chưa có hồ sơ Personnel. Liên hệ admin để khởi tạo.
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-4">
            <Input
              label="Phòng ban / Vị trí"
              value={`${POSITION_LABEL[personnel.position]} (${POSITION_HINT_VN[personnel.position]})`}
              readOnly
              helperText="Admin set khi tạo hồ sơ."
            />
            <Input
              label="Ngày sinh"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              helperText="Cần thiết để tính numerology + bát tự."
            />
            <Input
              label="Giờ sinh (tuỳ chọn)"
              type="time"
              value={birthTime}
              onChange={(e) => setBirthTime(e.target.value)}
              helperText="Nếu để trống, hour pillar bát tự = Không xác định."
            />
            <Input
              label="Nơi sinh (tuỳ chọn)"
              value={birthPlace}
              onChange={(e) => setBirthPlace(e.target.value)}
              placeholder="VD: Hà Nội"
            />

            <div className="flex justify-end pt-3">
              <Button
                variant="primary"
                iconLeft={<Save />}
                onClick={handleSavePersonnel}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Đang lưu...' : 'Lưu hồ sơ nhân sự'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
