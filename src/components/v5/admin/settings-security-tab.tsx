import { ShieldCheck } from 'lucide-react';
import { Card, Input, Button } from '../ui';

export function SettingsSecurityTab() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card padding="lg" glow>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-text-muted">Security</p>
        <h2 className="mt-2 font-headline text-2xl font-black text-text-1">Password</h2>
        <div className="mt-5 flex flex-col gap-4">
          <Input label="Current password" type="password" autoComplete="current-password" />
          <Input label="New password" type="password" autoComplete="new-password" />
          <Button variant="secondary" disabled>Change password</Button>
        </div>
      </Card>

      <Card padding="lg" glow>
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-1 size-6 text-accent-text" />
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-text-muted">2FA</p>
            <h2 className="mt-2 font-headline text-2xl font-black text-text-1">Authenticator</h2>
            <p className="mt-2 text-sm font-medium text-text-2">2FA status đang được quản lý ở auth layer; UI cấu hình chi tiết sẽ nối vào backend security endpoint ở vòng sau.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
