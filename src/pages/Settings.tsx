import { useState } from 'react';
import { Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { SettingsTabs, SettingsTabId } from '../components/settings/settings-tabs';
import { UserManagementTab } from '../components/settings/user-management-tab';
import { SprintCyclesTab } from '../components/settings/sprint-cycles-tab';
import { OkrCyclesTab } from '../components/settings/okr-cycles-tab';
import { FbConfigTab } from '../components/settings/fb-config-tab';

type DeleteConfirmType = { type: 'user' | 'sprint' | 'cycle'; id: string } | null;

export default function Settings() {
  const { isAdmin, refreshUsers } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTabId>('users');
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmType>(null);

  if (!isAdmin) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-on-surface mb-2">Access Denied</h2>
          <p className="text-slate-500">Only administrators can access this page.</p>
        </div>
      </div>
    );
  }

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

  return (
    <div className="h-full flex flex-col gap-[var(--space-lg)] overflow-y-auto">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">Workspace Settings</h2>
          <p className="text-slate-500 mt-2">Manage users, sprints, and system configurations.</p>
        </div>
      </div>

      <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1">
        {activeTab === 'users' && <UserManagementTab onDeleteConfirm={handleDeleteConfirm} />}
        {activeTab === 'sprints' && <SprintCyclesTab onDeleteConfirm={handleDeleteConfirm} />}
        {activeTab === 'okrs' && <OkrCyclesTab onDeleteConfirm={handleDeleteConfirm} />}
        {activeTab === 'fb-config' && <FbConfigTab />}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
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
