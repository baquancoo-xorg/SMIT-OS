import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SettingsTabs, SettingsTabId } from '../components/settings/settings-tabs';
import { UserManagementTab } from '../components/settings/user-management-tab';
import { SprintCyclesTab } from '../components/settings/sprint-cycles-tab';
import { OkrCyclesTab } from '../components/settings/okr-cycles-tab';
import { FbConfigTab } from '../components/settings/fb-config-tab';
import { TwoFactorAuthTab } from '../components/settings/two-factor-auth-tab';
import { ProfileTab } from '../components/settings/profile-tab';

type DeleteConfirmType = { type: 'user' | 'sprint' | 'cycle'; id: string } | null;

export default function Settings() {
  const { isAdmin, refreshUsers } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTabId>(isAdmin ? 'users' : 'profile');
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmType>(null);

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

  const pageTitle = isAdmin ? 'Workspace Settings' : 'Settings';
  const pageDesc = isAdmin
    ? 'Manage users, sprints, and system configurations.'
    : 'Manage your profile and security settings.';

  return (
    <div className="h-full flex flex-col gap-[var(--space-lg)] w-full">
      <section className="shrink-0 flex items-start justify-between">
        <div>
          <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">{pageTitle}</h2>
          <p className="text-slate-500 mt-2">{pageDesc}</p>
        </div>
      </section>

      <div className="shrink-0">
        <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} isAdmin={isAdmin} />
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'users' && isAdmin && <UserManagementTab onDeleteConfirm={handleDeleteConfirm} />}
        {activeTab === 'sprints' && isAdmin && <SprintCyclesTab onDeleteConfirm={handleDeleteConfirm} />}
        {activeTab === 'okrs' && isAdmin && <OkrCyclesTab onDeleteConfirm={handleDeleteConfirm} />}
        {activeTab === 'fb-config' && isAdmin && <FbConfigTab />}
        {activeTab === 'security' && <TwoFactorAuthTab />}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-on-surface mb-2">Confirm Delete</h3>
            <p className="text-slate-500 mb-6">
              Are you sure you want to delete this {deleteConfirm.type}? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 bg-slate-100 text-slate-500 py-3 rounded-xl font-bold">Cancel</button>
              <button onClick={handleDelete} className="flex-1 bg-error text-white py-3 rounded-xl font-bold">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
