import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Facebook, Key, Link2, ShieldCheck, SlidersHorizontal, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ApiKeysPanelV2, FbConfigTabV2, UserManagementTabV2 } from '../../components/workspace/admin/settings';
import { Button } from '../../components/ui/button';
import { PageSectionStack } from '../../components/ui/page-section-stack';
import { PageToolbar } from '../../components/ui/page-toolbar';
import { TabPill } from '../../components/ui/tab-pill';
import type { TabPillItem } from '../../components/ui/tab-pill';
import {
  IntegrationsTab,
  SettingsAppearanceTab,
  SettingsSecurityTab,
} from '../../components/workspace/admin';

type SettingsTab = 'security' | 'appearance' | 'integrations' | 'api-keys' | 'fb-config' | 'users';

const ALL_TABS: TabPillItem<SettingsTab>[] = [
  { value: 'security', label: 'Security', icon: <ShieldCheck /> },
  { value: 'appearance', label: 'Appearance', icon: <SlidersHorizontal /> },
  { value: 'integrations', label: 'Integrations', icon: <Link2 /> },
  { value: 'api-keys', label: 'API Keys', icon: <Key /> },
  { value: 'fb-config', label: 'FB Config', icon: <Facebook /> },
  { value: 'users', label: 'Users', icon: <Users /> },
];

const ADMIN_ONLY: SettingsTab[] = ['integrations', 'api-keys', 'fb-config', 'users'];

export default function Settings() {
  const { isAdmin, refreshUsers } = useAuth();
  const [params, setParams] = useSearchParams();
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [isAddingFb, setIsAddingFb] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);

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

  async function handleDeleteUser(_type: 'user', id: string) {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        await refreshUsers();
      }
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  }

  function renderTabAction() {
    if (!isAdmin) return null;
    if (activeTab === 'users') {
      return (
        <Button variant="primary" onClick={() => setIsAddingUser(true)}>
          Add User
        </Button>
      );
    }
    if (activeTab === 'api-keys') {
      return (
        <Button variant="primary" onClick={() => setIsGeneratingKey(true)}>
          Create New Key
        </Button>
      );
    }
    if (activeTab === 'fb-config') {
      return (
        <Button variant="primary" onClick={() => setIsAddingFb(true)}>
          Add New Account
        </Button>
      );
    }
    return null;
  }

  return (
    <PageSectionStack className="min-h-full gap-6">
      <PageToolbar
        left={
          <div className="overflow-x-auto pb-1">
            <TabPill<SettingsTab>
              label="Settings sections"
              value={activeTab}
              onChange={setActiveTab}
              items={visibleTabs}
              size="page"
            />
          </div>
        }
        right={renderTabAction()}
      />

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
        {activeTab === 'users' && isAdmin && (
          <UserManagementTabV2
            isAddingUser={isAddingUser}
            setIsAddingUser={setIsAddingUser}
            onDeleteConfirm={handleDeleteUser}
          />
        )}
      </section>
    </PageSectionStack>
  );
}
