import { Card, Input, Button } from '../ui';
import { TwoFactorCard } from './two-factor-card';

export function SettingsSecurityTab() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* ui-canon-ok: section header font-black for KPI headline */}
      <Card padding="lg" glow>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-text-muted">Security</p>
        <h2 className="mt-2 font-headline text-2xl font-black text-text-1">Password</h2>
        <div className="mt-5 flex flex-col gap-4">
          <Input label="Current password" type="password" autoComplete="current-password" />
          <Input label="New password" type="password" autoComplete="new-password" />
          <Button variant="secondary" disabled>Change password</Button>
        </div>
      </Card>

      <TwoFactorCard />
    </div>
  );
}
