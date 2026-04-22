import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { SettingsTabs, SettingsTabId } from '../components/settings/settings-tabs';
import { UserManagementTab } from '../components/settings/user-management-tab';
import { SprintCyclesTab } from '../components/settings/sprint-cycles-tab';
import { OkrCyclesTab } from '../components/settings/okr-cycles-tab';
import { FbConfigTab } from '../components/settings/fb-config-tab';
import { ProfileTab } from '../components/settings/profile-tab';
import { SheetsExportTab } from '../components/settings/sheets-export-tab';

import { Card, Button } from '../components/ui';

type DeleteConfirmType = { type: 'user' | 'sprint' | 'cycle'; id: string } | null;

export default function Settings() {
  const { isAdmin, refreshUsers } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTabId>(isAdmin ? 'users' : 'profile');
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmType>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isAddingSprint, setIsAddingSprint] = useState(false);
  const [isAddingCycle, setIsAddingCycle] = useState(false);
  const [isAddingFb, setIsAddingFb] = useState(false);

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    const { type, id } = deleteConfirm;

    try {
      let url = '';
      if (type === 'user') url = `/api/users/${id}`;
      else if (type === 'sprint') url = `/api/sprints/${id}`;
      else url = `/api/okr-cycles/${id}`;

      const res = await fetch(url, { method: 'DELETE' });
      if (res.ok) {
        if (type === 'user') await refreshUsers();
        setDeleteConfirm(null);
        window.location.reload();
      } else {
        const error = await res.json();
        alert(error.error || `Failed to delete ${type}`);
      }
    } catch (error) {
      console.error(`Failed to delete ${type}:`, error);
      alert(`Failed to delete ${type}`);
    }
  };

  const handleDeleteConfirm = (type: 'user' | 'sprint' | 'cycle', id: string) => {
    setDeleteConfirm({ type, id });
  };

  const headerAction = (() => {
    if (!isAdmin) return null;
    if (activeTab === 'users') return (
      <Button onClick={() => setIsAddingUser(true)} size="sm" className="flex items-center gap-2">
        <Plus size={16} /> Add User
      </Button>
    );
    if (activeTab === 'sprints') return (
      <button onClick={() => setIsAddingSprint(true)} className="flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-secondary/20 hover:scale-95 transition-all">
        <Plus size={16} /> New Sprint
      </button>
    );
    if (activeTab === 'okrs') return (
      <button onClick={() => setIsAddingCycle(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-95 transition-all">
        <Plus size={16} /> New Cycle
      </button>
    );
    if (activeTab === 'fb-config') return (
      <Button onClick={() => setIsAddingFb(true)} size="sm" className="flex items-center gap-2">
        <Plus size={16} /> Add Account
      </Button>
    );
    return null;
  })();

  return (
    <div className="h-full flex flex-col gap-[var(--space-lg)] w-full">
      <section className="shrink-0 flex flex-col md:flex-row md:items-end justify-between gap-[var(--space-md)]">
        <div>
          <nav className="flex items-center gap-2 mb-2 text-on-surface-variant font-medium text-sm">
            <span className="hover:text-primary cursor-pointer">System</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface">Settings</span>
          </nav>
          <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">
            {isAdmin ? 'Workspace' : 'User'} <span className="text-primary italic">Settings</span>
          </h2>
        </div>
        {headerAction && <div>{headerAction}</div>}
      </section>

      <Card className="p-1 shrink-0 bg-white/30">
        <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} isAdmin={isAdmin} />
      </Card>

      <div className="flex-1 overflow-y-auto pb-8">
        <Card variant="panel" className="p-8 min-h-full">
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'users' && isAdmin && (
            <UserManagementTab
              onDeleteConfirm={handleDeleteConfirm}
              isAddingUser={isAddingUser}
              setIsAddingUser={setIsAddingUser}
            />
          )}
          {activeTab === 'sprints' && isAdmin && (
            <SprintCyclesTab
              onDeleteConfirm={handleDeleteConfirm}
              isAddingSprint={isAddingSprint}
              setIsAddingSprint={setIsAddingSprint}
            />
          )}
          {activeTab === 'okrs' && isAdmin && (
            <OkrCyclesTab
              onDeleteConfirm={handleDeleteConfirm}
              isAddingCycle={isAddingCycle}
              setIsAddingCycle={setIsAddingCycle}
            />
          )}
          {activeTab === 'fb-config' && isAdmin && (
            <FbConfigTab
              isAddingFb={isAddingFb}
              setIsAddingFb={setIsAddingFb}
            />
          )}
          {activeTab === 'export' && isAdmin && <SheetsExportTab />}
        </Card>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-on-surface mb-2">Confirm Delete</h3>
            <p className="text-slate-500 mb-6 text-sm">
              Are you sure you want to delete this {deleteConfirm.type}? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button onClick={() => setDeleteConfirm(null)} variant="outline" className="flex-1">Cancel</Button>
              <Button onClick={handleDelete} variant="danger" className="flex-1">Delete</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
