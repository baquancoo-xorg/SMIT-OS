import { useState } from 'react';
import { Plus, Trash2, Users, Save, Edit2, X, UserCog } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import CustomSelect from '../ui/CustomSelect';
import { User } from '../../types';

const ALL_DEPARTMENTS = ['BOD', 'Tech', 'Marketing', 'Media', 'Sale'];
const ROLE_OPTIONS = [
  { value: 'Admin', label: 'Admin' },
  { value: 'Leader', label: 'Leader' },
  { value: 'Member', label: 'Member' }
];
const ROLE_COLORS: Record<string, string> = {
  Admin: 'bg-primary/10 text-primary',
  Leader: 'bg-secondary/10 text-secondary',
  Member: 'bg-slate-100 text-slate-600',
};

interface UserManagementTabProps {
  onDeleteConfirm: (type: 'user', id: string) => void;
}

export function UserManagementTab({ onDeleteConfirm }: UserManagementTabProps) {
  const { users, refreshUsers, currentUser } = useAuth();
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState({
    fullName: '', username: '', password: '', departments: ['Tech'] as string[],
    role: 'Member', scope: '', avatar: 'https://picsum.photos/seed/user/200', isAdmin: false
  });
  const [newUser, setNewUser] = useState({
    fullName: '', username: '', password: '', departments: ['Tech'] as string[],
    role: 'Member', scope: '', avatar: 'https://picsum.photos/seed/user/200', isAdmin: false
  });

  const toggleDepartment = (dept: string, isEdit: boolean) => {
    if (isEdit) {
      setEditFormData(prev => ({
        ...prev,
        departments: prev.departments.includes(dept)
          ? prev.departments.filter(d => d !== dept)
          : [...prev.departments, dept]
      }));
    } else {
      setNewUser(prev => ({
        ...prev,
        departments: prev.departments.includes(dept)
          ? prev.departments.filter(d => d !== dept)
          : [...prev.departments, dept]
      }));
    }
  };

  const handleAddUser = async () => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      if (res.ok) {
        await refreshUsers();
        setIsAddingUser(false);
        setNewUser({ fullName: '', username: '', password: '', departments: ['Tech'], role: 'Member', scope: '', avatar: 'https://picsum.photos/seed/user/200', isAdmin: false });
      }
    } catch (error) {
      console.error('Failed to add user:', error);
    }
  };

  const openEditUser = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      fullName: user.fullName, username: user.username, password: '',
      departments: user.departments || [], role: user.role,
      scope: user.scope || '', avatar: user.avatar, isAdmin: user.isAdmin,
    });
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      const data: Record<string, unknown> = {
        fullName: editFormData.fullName, username: editFormData.username,
        departments: editFormData.departments, role: editFormData.role,
        scope: editFormData.scope, avatar: editFormData.avatar, isAdmin: editFormData.isAdmin,
      };
      if (editFormData.password.trim()) data.password = editFormData.password;

      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        await refreshUsers();
        setEditingUser(null);
      }
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold flex items-center gap-2">
          <Users className="text-primary" />
          User Management
        </h3>
        <button onClick={() => setIsAddingUser(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-95 transition-all">
          <Plus size={16} /> Add User
        </button>
      </div>

      {isAddingUser && (
        <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/20 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
              <input type="text" className="w-full bg-white border border-outline-variant/30 rounded-3xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20" value={newUser.fullName} onChange={e => setNewUser({ ...newUser, fullName: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Username</label>
              <input type="text" className="w-full bg-white border border-outline-variant/30 rounded-3xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
            <input type="password" className="w-full bg-white border border-outline-variant/30 rounded-3xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Departments</label>
            <div className="flex flex-wrap gap-2">
              {ALL_DEPARTMENTS.map(dept => (
                <button key={dept} type="button" onClick={() => toggleDepartment(dept, false)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${newUser.departments.includes(dept) ? 'bg-primary text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{dept}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role</label>
              <CustomSelect value={newUser.role} onChange={val => setNewUser({ ...newUser, role: val })} options={ROLE_OPTIONS} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Scope (Position)</label>
              <input type="text" className="w-full bg-white border border-outline-variant/30 rounded-3xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g., Backend Developer" value={newUser.scope} onChange={e => setNewUser({ ...newUser, scope: e.target.value })} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isNewAdmin" checked={newUser.isAdmin} onChange={e => setNewUser({ ...newUser, isAdmin: e.target.checked })} className="w-4 h-4" />
            <label htmlFor="isNewAdmin" className="text-xs font-bold text-slate-500 uppercase">Admin Access</label>
          </div>
          <div className="flex items-end gap-2">
            <button onClick={handleAddUser} className="flex-1 bg-primary text-white py-2 rounded-xl text-sm font-bold">Save User</button>
            <button onClick={() => { setIsAddingUser(false); setNewUser({ fullName: '', username: '', password: '', departments: ['Tech'], role: 'Member', scope: '', avatar: 'https://picsum.photos/seed/user/200', isAdmin: false }); }} className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-sm font-bold">Cancel</button>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditingUser(null)}>
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-on-surface flex items-center gap-2"><UserCog className="text-primary" size={24} /> Edit User</h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-on-surface"><X size={24} /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                  <input type="text" className="w-full bg-slate-50 border border-outline-variant/30 rounded-3xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20" value={editFormData.fullName} onChange={e => setEditFormData({ ...editFormData, fullName: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Username</label>
                  <input type="text" className="w-full bg-slate-50 border border-outline-variant/30 rounded-3xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20" value={editFormData.username} onChange={e => setEditFormData({ ...editFormData, username: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">New Password <span className="text-slate-400 font-normal">(leave blank to keep)</span></label>
                <input type="password" className="w-full bg-slate-50 border border-outline-variant/30 rounded-3xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20" placeholder="••••••••" value={editFormData.password} onChange={e => setEditFormData({ ...editFormData, password: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Departments</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_DEPARTMENTS.map(dept => (
                    <button key={dept} type="button" onClick={() => toggleDepartment(dept, true)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${editFormData.departments.includes(dept) ? 'bg-primary text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{dept}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role</label>
                  <CustomSelect value={editFormData.role} onChange={val => setEditFormData({ ...editFormData, role: val })} options={ROLE_OPTIONS} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Scope (Position)</label>
                  <input type="text" className="w-full bg-slate-50 border border-outline-variant/30 rounded-3xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g., Backend Developer" value={editFormData.scope} onChange={e => setEditFormData({ ...editFormData, scope: e.target.value })} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="editIsAdmin" checked={editFormData.isAdmin} onChange={e => setEditFormData({ ...editFormData, isAdmin: e.target.checked })} className="w-4 h-4" />
                <label htmlFor="editIsAdmin" className="text-xs font-bold text-slate-500 uppercase">Admin Access</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleUpdateUser} className="flex-1 bg-primary text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"><Save size={16} />Save Changes</button>
                <button onClick={() => setEditingUser(null)} className="px-6 py-3 bg-slate-100 text-slate-500 rounded-xl text-sm font-bold">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-outline-variant/10 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-outline-variant/10">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Dept</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Scope</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div><span className="text-sm font-bold text-on-surface block">{user.fullName}</span><span className="text-[10px] text-slate-400 font-medium">{user.username}</span></div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {user.departments?.map(dept => (<span key={dept} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold">{dept}</span>))}
                  </div>
                </td>
                <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-[10px] font-bold ${ROLE_COLORS[user.role] || 'bg-slate-100 text-slate-600'}`}>{user.role}</span></td>
                <td className="px-6 py-4"><span className="text-xs font-medium text-slate-500">{user.scope || '-'}</span></td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEditUser(user)} className="p-2 text-slate-400 hover:text-primary transition-colors" title="Edit User"><Edit2 size={16} /></button>
                    <button onClick={() => onDeleteConfirm('user', user.id)} disabled={user.id === currentUser?.id} className="p-2 text-slate-400 hover:text-error transition-colors disabled:opacity-30 disabled:cursor-not-allowed" title="Delete User"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
