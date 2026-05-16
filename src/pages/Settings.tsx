import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Facebook, Key, Link2, Plus, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ApiKeysPanel, FbConfigTab, UserManagementTab } from '../components/features/settings';
import { Button, ConfirmDialog, PageSectionStack, PageToolbar, TabPill } from '../components/ui';
import type { TabPillItem } from '../components/ui';
import { IntegrationsTab } from '../components/features/settings';

type SettingsTab = 'users' | 'integrations' | 'api-keys' | 'fb-config';

const ALL_TABS: TabPillItem<SettingsTab>[] = [
  { value: 'users', label: 'Users', icon: <Users /> },
  { value: 'integrations', label: 'Integrations', icon: <Link2 /> },
  { value: 'api-keys', label: 'API Keys', icon: <Key /> },
  { value: 'fb-config', label: 'FB Config', icon: <Facebook /> },
];

const ADMIN_ONLY: SettingsTab[] = ['users', 'integrations', 'api-keys', 'fb-config'];

export default function Settings() {
  const { isAdmin, refreshUsers } = useAuth();
  const [params, setParams] = useSearchParams();
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [isAddingFb, setIsAddingFb] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ type: 'user'; id: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/users/${pendingDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        await refreshUsers();
        setPendingDelete(null);
      }
    } finally {
      setDeleting(false);
    }
  }

  const visibleTabs = useMemo(
    () => ALL_TABS.filter((tab) => isAdmin || !ADMIN_ONLY.includes(tab.value)),
    [isAdmin],
  );

  const requested = (params.get('tab') ?? 'users') as SettingsTab;
  const isVisible = visibleTabs.some((tab) => tab.value === requested);
  const activeTab: SettingsTab = isVisible ? requested : (visibleTabs[0]?.value ?? 'users');

  function setActiveTab(next: SettingsTab) {
    const nextParams = new URLSearchParams(params);
    nextParams.set('tab', next);
    setParams(nextParams, { replace: true });
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
        right={
          activeTab === 'users' && isAdmin ? (
            <Button variant="primary" iconLeft={<Plus />} onClick={() => setIsAddingUser(true)}>
              Add user
            </Button>
          ) : undefined
        }
      />

      <section className="min-h-0 flex-1" aria-label="Settings content">
        {activeTab === 'users' && isAdmin && (
          <UserManagementTab
            onDeleteConfirm={(type, id) => setPendingDelete({ type, id })}
            isAddingUser={isAddingUser}
            setIsAddingUser={setIsAddingUser}
          />
        )}
        {activeTab === 'integrations' && isAdmin && <IntegrationsTab />}
        {activeTab === 'api-keys' && isAdmin && (
          <ApiKeysPanel isGenerating={isGeneratingKey} setIsGenerating={setIsGeneratingKey} />
        )}
        {activeTab === 'fb-config' && isAdmin && (
          <FbConfigTab isAddingFb={isAddingFb} setIsAddingFb={setIsAddingFb} />
        )}
      </section>

      <ConfirmDialog
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
        tone="destructive"
        title="Xoá người dùng?"
        description="Người dùng và toàn bộ liên kết (Personnel, reports, OKRs assigned) sẽ bị ảnh hưởng. Không hoàn tác được."
        isLoading={deleting}
      />
    </PageSectionStack>
  );
}
