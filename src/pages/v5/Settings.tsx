import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Facebook, Key, Link2, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ApiKeysPanelV2, FbConfigTabV2 } from '../../components/settings';
import { TabPill } from '../../components/v5/ui';
import type { TabPillItem } from '../../components/v5/ui';
import {
  IntegrationsTab,
  SettingsAppearanceTab,
  SettingsSecurityTab,
} from '../../components/v5/admin';

type SettingsTab = 'security' | 'appearance' | 'integrations' | 'api-keys' | 'fb-config';

const ALL_TABS: TabPillItem<SettingsTab>[] = [
  { value: 'security', label: 'Security', icon: <ShieldCheck /> },
  { value: 'appearance', label: 'Appearance', icon: <SlidersHorizontal /> },
  { value: 'integrations', label: 'Integrations', icon: <Link2 /> },
  { value: 'api-keys', label: 'API Keys', icon: <Key /> },
  { value: 'fb-config', label: 'FB Config', icon: <Facebook /> },
];

const ADMIN_ONLY: SettingsTab[] = ['integrations', 'api-keys', 'fb-config'];

export default function Settings() {
  const { isAdmin } = useAuth();
  const [params, setParams] = useSearchParams();
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [isAddingFb, setIsAddingFb] = useState(false);

  const visibleTabs = useMemo(
    () => ALL_TABS.filter((tab) => isAdmin || !ADMIN_ONLY.includes(tab.value)),
    [isAdmin],
  );

  const requested = (params.get('tab') ?? 'security') as SettingsTab;
  const isVisible = visibleTabs.some((tab) => tab.value === requested);
  const activeTab: SettingsTab = isVisible ? requested : 'security';

  function setActiveTab(next: SettingsTab) {
    const nextParams = new URLSearchParams(params);
    nextParams.set('tab', next);
    setParams(nextParams, { replace: true });
  }

  return (
    <div className="flex min-h-full flex-col gap-6">
      <div className="overflow-x-auto pb-1">
        <TabPill<SettingsTab>
          label="Settings sections"
          value={activeTab}
          onChange={setActiveTab}
          items={visibleTabs}
          size="page"
        />
      </div>

      <section className="min-h-0 flex-1" aria-label="Settings content">
        {activeTab === 'security' && <SettingsSecurityTab />}
        {activeTab === 'appearance' && <SettingsAppearanceTab />}
        {activeTab === 'integrations' && isAdmin && <IntegrationsTab />}
        {activeTab === 'api-keys' && isAdmin && (
          <ApiKeysPanelV2 isGenerating={isGeneratingKey} setIsGenerating={setIsGeneratingKey} />
        )}
        {activeTab === 'fb-config' && isAdmin && (
          <FbConfigTabV2 isAddingFb={isAddingFb} setIsAddingFb={setIsAddingFb} />
        )}
      </section>
    </div>
  );
}
