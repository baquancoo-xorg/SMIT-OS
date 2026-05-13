import { useState } from 'react';
import { Key, ShieldCheck, SlidersHorizontal, UserCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ApiKeysPanelV2, ProfileTabV2 } from '../../components/settings';
import { PageHeader, TabPill } from '../../components/v5/ui';
import type { TabPillItem } from '../../components/v5/ui';
import { SettingsAppearanceTab, SettingsSecurityTab } from '../../components/v5/admin';

type SettingsTab = 'profile' | 'security' | 'appearance' | 'api-keys';

const tabs: TabPillItem<SettingsTab>[] = [
  { value: 'profile', label: 'Profile', icon: <UserCircle /> },
  { value: 'security', label: 'Security', icon: <ShieldCheck /> },
  { value: 'appearance', label: 'Appearance', icon: <SlidersHorizontal /> },
  { value: 'api-keys', label: 'API Keys', icon: <Key /> },
];

export default function Settings() {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);

  return (
    <div className="flex min-h-full flex-col gap-6">
      <PageHeader
        breadcrumb={[{ label: 'Admin' }, { label: 'Settings' }]}
        title="System "
        accent="Settings"
        description="Profile, security, appearance và API access cho SMIT OS command center."
      />

      <div className="overflow-x-auto pb-1">
        <TabPill<SettingsTab>
          label="Settings sections"
          value={activeTab}
          onChange={setActiveTab}
          items={isAdmin ? tabs : tabs.filter((tab) => tab.value !== 'api-keys')}
        />
      </div>

      <section className="min-h-0 flex-1" aria-label="Settings content">
        {activeTab === 'profile' && <ProfileTabV2 />}
        {activeTab === 'security' && <SettingsSecurityTab />}
        {activeTab === 'appearance' && <SettingsAppearanceTab />}
        {activeTab === 'api-keys' && isAdmin && (
          <ApiKeysPanelV2 isGenerating={isGeneratingKey} setIsGenerating={setIsGeneratingKey} />
        )}
      </section>
    </div>
  );
}
