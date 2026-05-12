import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Plus, Users, Target, Facebook, UserCircle, Key } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  ProfileTabV2,
  UserManagementTabV2,
  OkrCyclesTabV2,
  FbConfigTabV2,
  ApiKeysPanelV2,
} from '../components/settings';
import { TabPill, Button, ConfirmDialog } from '../components/ui';
import type { TabPillItem } from '../components/ui';

type SettingsTabId = 'profile' | 'users' | 'okrs' | 'fb-config' | 'api-keys';

interface DeleteConfirmState {
  type: 'user' | 'cycle';
  id: string;
}

const ADMIN_TABS: TabPillItem<SettingsTabId>[] = [
  { value: 'profile', label: 'Profile', icon: <UserCircle /> },
  { value: 'users', label: 'Users', icon: <Users /> },
  { value: 'okrs', label: 'OKR Cycles', icon: <Target /> },
  { value: 'fb-config', label: 'FB Config', icon: <Facebook /> },
  { value: 'api-keys', label: 'API Keys', icon: <Key /> },
];

const MEMBER_TABS: TabPillItem<SettingsTabId>[] = [{ value: 'profile', label: 'Profile', icon: <UserCircle /> }];

/**
 * Settings v2 — token-driven shell with TabPill nav.
 *
 * Sub-tab content blocks reuse v1 components for now (ProfileTab, UserManagementTab, etc.).
 * Sub-tab inner UI migration is Phase 5 batch 2 scope.
 *
 * Behavioral parity preserved with v1:
 *  - Member without admin → redirect to /profile
 *  - Delete confirm flow for users + okr cycles
 *  - Per-tab header action button (Add User / New Cycle / Add Account / Export Now)
 */
export default function SettingsV2() {
  const { isAdmin, refreshUsers } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTabId>(isAdmin ? 'users' : 'profile');
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState | null>(null);
  const [deletingPending, setDeletingPending] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isAddingCycle, setIsAddingCycle] = useState(false);
  const [isAddingFb, setIsAddingFb] = useState(false);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);

  if (!isAdmin && activeTab !== 'profile') {
    return <Navigate to="/profile" replace />;
  }

  const tabs = isAdmin ? ADMIN_TABS : MEMBER_TABS;

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeletingPending(true);
    try {
      const url = deleteConfirm.type === 'user' ? `/api/users/${deleteConfirm.id}` : `/api/okr-cycles/${deleteConfirm.id}`;
      const res = await fetch(url, { method: 'DELETE' });
      if (res.ok) {
        if (deleteConfirm.type === 'user') await refreshUsers();
        setDeleteConfirm(null);
        // Reload to refresh sub-tab data — preserves v1 behavior. Migrate to per-tab refetch in batch 2.
        window.location.reload();
      } else {
        const error = await res.json().catch(() => ({}));
        alert(error.error || `Failed to delete ${deleteConfirm.type}.`);
      }
    } catch (error) {
      console.error(`Failed to delete ${deleteConfirm.type}:`, error);
      alert(`Failed to delete ${deleteConfirm.type}.`);
    } finally {
      setDeletingPending(false);
    }
  };

  const headerAction = (() => {
    if (!isAdmin) return null;
    if (activeTab === 'users') {
      return (
        <Button variant="primary" iconLeft={<Plus />} onClick={() => setIsAddingUser(true)}>
          Add user
        </Button>
      );
    }
    if (activeTab === 'okrs') {
      return (
        <Button variant="primary" iconLeft={<Plus />} onClick={() => setIsAddingCycle(true)}>
          New cycle
        </Button>
      );
    }
    if (activeTab === 'fb-config') {
      return (
        <Button variant="primary" iconLeft={<Plus />} onClick={() => setIsAddingFb(true)}>
          Add account
        </Button>
      );
    }
    if (activeTab === 'api-keys') {
      return (
        <Button variant="primary" iconLeft={<Key />} onClick={() => setIsGeneratingKey(true)}>
          Generate key
        </Button>
      );
    }
    return null;
  })();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-headline text-[length:var(--text-h2)] font-bold leading-tight text-on-surface min-w-0">
          System <span className="font-semibold text-primary">Settings</span>
        </h2>
        {headerAction}
      </header>

      <div className="overflow-x-auto pb-1 -mx-1 px-1">
        <TabPill
          label="Settings sub-section"
          value={activeTab}
          onChange={(v) => setActiveTab(v as SettingsTabId)}
          items={tabs}
        />
      </div>

      <div className="min-h-0 flex-1">
        {activeTab === 'profile' && <ProfileTabV2 />}
        {activeTab === 'users' && isAdmin && (
          <UserManagementTabV2
            onDeleteConfirm={(type, id) => setDeleteConfirm({ type, id })}
            isAddingUser={isAddingUser}
            setIsAddingUser={setIsAddingUser}
          />
        )}
        {activeTab === 'okrs' && isAdmin && (
          <OkrCyclesTabV2
            onDeleteConfirm={(type, id) => setDeleteConfirm({ type, id })}
            isAddingCycle={isAddingCycle}
            setIsAddingCycle={setIsAddingCycle}
          />
        )}
        {activeTab === 'fb-config' && isAdmin && (
          <FbConfigTabV2 isAddingFb={isAddingFb} setIsAddingFb={setIsAddingFb} />
        )}
        {activeTab === 'api-keys' && isAdmin && (
          <ApiKeysPanelV2 isGenerating={isGeneratingKey} setIsGenerating={setIsGeneratingKey} />
        )}
      </div>

      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        tone="destructive"
        title={`Delete ${deleteConfirm?.type ?? 'item'}?`}
        description={`This action cannot be undone. The ${deleteConfirm?.type ?? 'item'} will be permanently removed.`}
        isLoading={deletingPending}
      />
    </div>
  );
}
