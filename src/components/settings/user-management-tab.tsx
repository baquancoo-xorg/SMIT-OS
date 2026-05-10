import { useState } from 'react';
import { Save, X, UserCog } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types';
import { Input, Button, Card, Badge } from '../ui';
import CustomSelect from '../ui/CustomSelect';
import { TableRowActions } from '../ui/TableRowActions';
import { TableShell } from '../ui/TableShell';
import { getTableContract } from '../ui/table-contract';

const ALL_DEPARTMENTS = ['BOD', 'Tech', 'Marketing', 'Media', 'Sale'];
const ROLE_OPTIONS = [
  { value: 'Admin', label: 'Admin' },
  { value: 'Member', label: 'Member' }
];
const ROLE_BADGE_VARIANT: Record<string, 'info' | 'warning' | 'neutral'> = {
  Admin: 'info',
  Member: 'neutral',
};

interface UserManagementTabProps {
  onDeleteConfirm: (type: 'user', id: string) => void;
  isAddingUser: boolean;
  setIsAddingUser: (v: boolean) => void;
}

export function UserManagementTab({ onDeleteConfirm, isAddingUser, setIsAddingUser }: UserManagementTabProps) {
  const { users, refreshUsers, currentUser } = useAuth();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState({
    fullName: '', username: '', password: '', departments: ['Tech'] as string[],
    role: 'Member', scope: '', isAdmin: false
  });
  const [newUser, setNewUser] = useState({
    fullName: '', username: '', password: '', departments: ['Tech'] as string[],
    role: 'Member', scope: '', isAdmin: false
  });
  const standardTable = getTableContract('standard');

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
        credentials: 'include',
        body: JSON.stringify(newUser)
      });
      if (res.ok) {
        await refreshUsers();
        setIsAddingUser(false);
        setNewUser({ fullName: '', username: '', password: '', departments: ['Tech'], role: 'Member', scope: '', isAdmin: false });
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
      scope: user.scope || '', isAdmin: user.isAdmin,
    });
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      const data: Record<string, unknown> = {
        fullName: editFormData.fullName, username: editFormData.username,
        departments: editFormData.departments, role: editFormData.role,
        scope: editFormData.scope, isAdmin: editFormData.isAdmin,
      };
      if (editFormData.password.trim()) data.password = editFormData.password;

      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
    <div className="space-y-8">
      {isAddingUser && (
        <div className="bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white/20 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Full Name" placeholder="Nguyen Van A" value={newUser.fullName} onChange={e => setNewUser({ ...newUser, fullName: e.target.value })} />
            <Input label="Username" placeholder="nva_smit" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} />
          </div>
          <Input type="password" label="Password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Departments</label>
            <div className="flex flex-wrap gap-2">
              {ALL_DEPARTMENTS.map(dept => (
                <button key={dept} type="button" onClick={() => toggleDepartment(dept, false)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${newUser.departments.includes(dept) ? 'bg-primary text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{dept}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Role</label>
              <CustomSelect value={newUser.role} onChange={val => setNewUser({ ...newUser, role: val })} options={ROLE_OPTIONS} />
            </div>
            <Input label="Scope (Position)" placeholder="e.g., Backend Developer" value={newUser.scope} onChange={e => setNewUser({ ...newUser, scope: e.target.value })} />
          </div>

          <div className="flex items-center gap-3 px-1">
            <input type="checkbox" id="isNewAdmin" checked={newUser.isAdmin} onChange={e => setNewUser({ ...newUser, isAdmin: e.target.checked })} className="w-4 h-4 rounded accent-primary" />
            <label htmlFor="isNewAdmin" className="text-xs font-bold text-slate-500 uppercase cursor-pointer">Admin Access</label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleAddUser} className="flex-1">Save User</Button>
            <Button onClick={() => setIsAddingUser(false)} variant="ghost">Cancel</Button>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setEditingUser(null)}>
          <Card className="p-8 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <UserCog size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-on-surface">Edit User</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{editingUser.fullName}</p>
                </div>
              </div>
              <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X size={20} /></button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Full Name" value={editFormData.fullName} onChange={e => setEditFormData({ ...editFormData, fullName: e.target.value })} />
                <Input label="Username" value={editFormData.username} onChange={e => setEditFormData({ ...editFormData, username: e.target.value })} />
              </div>
              <Input type="password" label="New Password" placeholder="••••••••" value={editFormData.password} onChange={e => setEditFormData({ ...editFormData, password: e.target.value })} />

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Departments</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_DEPARTMENTS.map(dept => (
                    <button key={dept} type="button" onClick={() => toggleDepartment(dept, true)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${editFormData.departments.includes(dept) ? 'bg-primary text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{dept}</button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Role</label>
                  <CustomSelect value={editFormData.role} onChange={val => setEditFormData({ ...editFormData, role: val })} options={ROLE_OPTIONS} />
                </div>
                <Input label="Scope (Position)" value={editFormData.scope} onChange={e => setEditFormData({ ...editFormData, scope: e.target.value })} />
              </div>

              <div className="flex items-center gap-3 px-1">
                <input type="checkbox" id="editIsAdmin" checked={editFormData.isAdmin} onChange={e => setEditFormData({ ...editFormData, isAdmin: e.target.checked })} className="w-4 h-4 rounded accent-primary" />
                <label htmlFor="editIsAdmin" className="text-xs font-bold text-slate-500 uppercase cursor-pointer">Admin Access</label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleUpdateUser} className="flex-1 gap-2"><Save size={16} /> Save Changes</Button>
                <Button onClick={() => setEditingUser(null)} variant="outline">Cancel</Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Desktop: table */}
      <div className="hidden lg:block">
        <TableShell variant="standard" className="border border-white/20">
          <thead>
            <tr className={standardTable.headerRow}>
              <th className={standardTable.headerCell}>User</th>
              <th className={standardTable.headerCell}>Dept</th>
              <th className={standardTable.headerCell}>Role</th>
              <th className={standardTable.headerCell}>Scope</th>
              <th className={standardTable.actionHeaderCell}>Actions</th>
            </tr>
          </thead>
          <tbody className={standardTable.body}>
            {users.map(user => (
              <tr key={user.id} className={`${standardTable.row} group`}>
                <td className={standardTable.cell}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xs font-black text-primary">
                      {user.fullName[0]}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-on-surface block">{user.fullName}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{user.username}</span>
                    </div>
                  </div>
                </td>
                <td className={standardTable.cell}>
                  <div className="flex flex-wrap gap-1">
                    {user.departments?.map(dept => (<span key={dept} className="px-2 py-0.5 bg-primary/5 text-primary rounded-lg text-[9px] font-black uppercase tracking-wider">{dept}</span>))}
                  </div>
                </td>
                <td className={standardTable.cell}>
                  <Badge variant={ROLE_BADGE_VARIANT[user.role] || 'neutral'}>{user.role}</Badge>
                </td>
                <td className={standardTable.cell}>
                  <span className="text-xs font-bold text-slate-500">{user.scope || '-'}</span>
                </td>
                <td className={standardTable.actionCell}>
                  <TableRowActions
                    onEdit={() => openEditUser(user)}
                    onDelete={user.id !== currentUser?.id ? () => onDeleteConfirm('user', user.id) : undefined}
                    size={16}
                    variant="standard"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      </div>

      {/* Tablet/Mobile: card list */}
      <div className="lg:hidden space-y-3">
        {users.map(user => (
          <Card key={user.id} variant="flat" className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xs font-black text-primary shrink-0">
                  {user.fullName[0]}
                </div>
                <div>
                  <span className="text-sm font-bold text-on-surface block">{user.fullName}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{user.username}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={ROLE_BADGE_VARIANT[user.role] || 'neutral'}>{user.role}</Badge>
                <TableRowActions
                  onEdit={() => openEditUser(user)}
                  onDelete={user.id !== currentUser?.id ? () => onDeleteConfirm('user', user.id) : undefined}
                  size={16}
                  variant="standard"
                />
              </div>
            </div>
            {(user.departments?.length > 0 || user.scope) && (
              <div className="mt-2 flex flex-wrap gap-1">
                {user.departments?.map(dept => (<span key={dept} className="px-2 py-0.5 bg-primary/5 text-primary rounded-lg text-[9px] font-black uppercase tracking-wider">{dept}</span>))}
                {user.scope && <span className="text-[10px] text-slate-400 ml-1">{user.scope}</span>}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
