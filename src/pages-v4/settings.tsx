import { useState } from 'react';
import { Key, Palette, Shield, User as UserIcon } from 'lucide-react';
import {
  Badge,
  Button,
  EmptyState,
  PageHeader,
  SurfaceCard,
  TabPill,
} from '../design/v4/index.js';

type SettingsTab = 'profile' | 'security' | 'appearance' | 'api-keys';

const TABS = [
  { value: 'profile' as SettingsTab, label: 'Profile' },
  { value: 'security' as SettingsTab, label: 'Security' },
  { value: 'appearance' as SettingsTab, label: 'Appearance' },
  { value: 'api-keys' as SettingsTab, label: 'API Keys' },
];

export default function SettingsV4() {
  const [tab, setTab] = useState<SettingsTab>('profile');

  return (
    <div className="flex flex-col gap-comfy">
      <PageHeader
                subtitle="Account preferences and integrations"
        actions={<TabPill value={tab} onChange={(v) => setTab(v as SettingsTab)} items={TABS} size="sm" />}
      />

      {tab === 'profile' && (
        <SurfaceCard padding="md">
          <div className="flex items-center gap-snug mb-comfy">
            <UserIcon size={20} className="text-accent" />
            <h3 className="text-h6 font-semibold text-fg">Profile information</h3>
          </div>
          <EmptyState
            title="Profile settings v4 — coming soon"
            description="Edit name, avatar, and contact info. v3 functionality remains at /settings."
            action={<Button variant="ghost" onClick={() => window.location.assign('/settings')}>Open v3 Settings</Button>}
          />
        </SurfaceCard>
      )}

      {tab === 'security' && (
        <SurfaceCard padding="md">
          <div className="flex items-center gap-snug mb-comfy">
            <Shield size={20} className="text-accent" />
            <h3 className="text-h6 font-semibold text-fg">Security</h3>
            <Badge intent="success">2FA available</Badge>
          </div>
          <EmptyState title="Security panel — coming soon" description="Manage 2FA, password rotation, and active sessions." />
        </SurfaceCard>
      )}

      {tab === 'appearance' && (
        <SurfaceCard padding="md">
          <div className="flex items-center gap-snug mb-comfy">
            <Palette size={20} className="text-accent" />
            <h3 className="text-h6 font-semibold text-fg">Appearance</h3>
            <Badge intent="info">Dark only (v4)</Badge>
          </div>
          <p className="text-body-sm text-fg-muted">
            v4 ships dark-mode-first. Light variant is scheduled for a future sprint per the rebuild plan.
          </p>
        </SurfaceCard>
      )}

      {tab === 'api-keys' && (
        <SurfaceCard padding="md">
          <div className="flex items-center gap-snug mb-comfy">
            <Key size={20} className="text-accent" />
            <h3 className="text-h6 font-semibold text-fg">API Keys</h3>
          </div>
          <EmptyState
            title="API key manager"
            description="Manage MCP / Cowork integration tokens. Existing v3 management lives under v3 Settings → API Keys."
            action={<Button variant="ghost" onClick={() => window.location.assign('/settings')}>Open v3 manager</Button>}
          />
        </SurfaceCard>
      )}
    </div>
  );
}
