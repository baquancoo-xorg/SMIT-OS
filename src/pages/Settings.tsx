import React, { useState, useEffect } from 'react';
import { User, Sprint } from '../types';
import { Plus, Trash2, Users, Calendar, Save, Edit2, X, Shield, UserCog } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Settings() {
  const { users, refreshUsers, isAdmin, currentUser } = useAuth();
  const [sprints, setSprints] = useState<Sprint[]>([]);

  // User states
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState({ fullName: '', username: '', password: '', department: 'Tech', role: 'Member', scope: '', avatar: 'https://picsum.photos/seed/user/200', isAdmin: false });
  const [newUser, setNewUser] = useState({ fullName: '', username: '', password: '', department: 'Tech', role: 'Member', scope: '', avatar: 'https://picsum.photos/seed/user/200', isAdmin: false });

  // Sprint states
  const [isAddingSprint, setIsAddingSprint] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
  const [newSprint, setNewSprint] = useState({ name: '', startDate: '', endDate: '' });

  // Modal states
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'user' | 'sprint'; id: string } | null>(null);

  const fetchSprints = async () => {
    try {
      const res = await fetch('/api/sprints');
      const data = await res.json();
      setSprints(data);
    } catch (error) {
      console.error('Failed to fetch sprints:', error);
    }
  };

  useEffect(() => {
    fetchSprints();
  }, []);

  // Redirect if not admin
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

  // --- User Handlers ---
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
        setNewUser({ fullName: '', username: '', password: '', department: 'Tech', role: 'Member', scope: '', avatar: 'https://picsum.photos/seed/user/200', isAdmin: false });
      }
    } catch (error) {
      console.error('Failed to add user:', error);
    }
  };

  const openEditUser = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      fullName: user.fullName,
      username: user.username,
      password: '', // Don't show existing password
      department: user.department,
      role: user.role,
      scope: user.scope || '',
      avatar: user.avatar,
      isAdmin: user.isAdmin,
    });
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      const data: any = {
        fullName: editFormData.fullName,
        username: editFormData.username,
        department: editFormData.department,
        role: editFormData.role,
        scope: editFormData.scope,
        avatar: editFormData.avatar,
        isAdmin: editFormData.isAdmin,
      };
      // Only update password if a new one is provided
      if (editFormData.password.trim()) {
        data.password = editFormData.password;
      }

      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        await refreshUsers();
        setEditingUser(null);
        setEditFormData({ fullName: '', username: '', password: '', department: 'Tech', role: 'Member', scope: '', avatar: 'https://picsum.photos/seed/user/200', isAdmin: false });
      }
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (id === currentUser?.id) {
      alert('You cannot delete yourself!');
      return;
    }
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await refreshUsers();
        setDeleteConfirm(null);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user');
    }
  };

  // --- Sprint Handlers ---
  const handleAddSprint = async () => {
    try {
      const res = await fetch('/api/sprints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSprint)
      });
      if (res.ok) {
        await fetchSprints();
        setIsAddingSprint(false);
        setNewSprint({ name: '', startDate: '', endDate: '' });
      }
    } catch (error) {
      console.error('Failed to add sprint:', error);
    }
  };

  const handleUpdateSprint = async (sprint: Sprint) => {
    try {
      const res = await fetch(`/api/sprints/${sprint.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sprint)
      });
      if (res.ok) {
        await fetchSprints();
        setEditingSprint(null);
      }
    } catch (error) {
      console.error('Failed to update sprint:', error);
    }
  };

  const handleDeleteSprint = async (id: string) => {
    try {
      const res = await fetch(`/api/sprints/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchSprints();
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Failed to delete sprint:', error);
    }
  };

  const roleColors: Record<string, string> = {
    Admin: 'bg-primary/10 text-primary',
    Leader: 'bg-secondary/10 text-secondary',
    Member: 'bg-slate-100 text-slate-600',
  };

  return (
    <div className="h-full flex flex-col p-6 md:p-10 space-y-12 w-full overflow-y-auto">
      <div>
        <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">Workspace Settings</h2>
        <p className="text-slate-500 mt-2">Manage users, sprints, and system configurations.</p>
      </div>

      {/* C5: Earlier breakpoint for tablet */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
        {/* ===== USER MANAGEMENT ===== */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <Users className="text-primary" />
              User Management
            </h3>
            <button
              onClick={() => setIsAddingUser(true)}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-95 transition-all"
            >
              <Plus size={16} />
              Add User
            </button>
          </div>

          {/* Add User Form */}
          {isAddingUser && (
            <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/20 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                  <input type="text" className="w-full bg-white border border-outline-variant/30 rounded-2xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20" value={newUser.fullName} onChange={e => setNewUser({ ...newUser, fullName: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Username</label>
                  <input type="text" className="w-full bg-white border border-outline-variant/30 rounded-2xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                  <input type="password" className="w-full bg-white border border-outline-variant/30 rounded-2xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Department</label>
                  <select className="w-full bg-white border border-outline-variant/30 rounded-2xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20" value={newUser.department} onChange={e => setNewUser({ ...newUser, department: e.target.value })}>
                    <option value="BOD">BOD</option>
                    <option value="Tech">Tech</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Media">Media</option>
                    <option value="Sale">Sale</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role</label>
                  <select className="w-full bg-white border border-outline-variant/30 rounded-2xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                    <option value="Admin">Admin</option>
                    <option value="Leader">Leader</option>
                    <option value="Member">Member</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Scope (Position)</label>
                  <input type="text" className="w-full bg-white border border-outline-variant/30 rounded-2xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g., Backend Developer" value={newUser.scope} onChange={e => setNewUser({ ...newUser, scope: e.target.value })} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isNewAdmin" checked={newUser.isAdmin} onChange={e => setNewUser({ ...newUser, isAdmin: e.target.checked })} className="w-4 h-4" />
                <label htmlFor="isNewAdmin" className="text-xs font-bold text-slate-500 uppercase">Admin Access</label>
              </div>
              <div className="flex items-end gap-2">
                <button onClick={handleAddUser} className="flex-1 bg-primary text-white py-2 rounded-xl text-sm font-bold">Save User</button>
                <button onClick={() => { setIsAddingUser(false); setNewUser({ fullName: '', username: '', password: '', department: 'Tech', role: 'Member', scope: '', avatar: 'https://picsum.photos/seed/user/200', isAdmin: false }); }} className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-sm font-bold">Cancel</button>
              </div>
            </div>
          )}

          {/* Edit User Modal */}
          {editingUser && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditingUser(null)}>
              <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
                    <UserCog className="text-primary" size={24} />
                    Edit User
                  </h3>
                  <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-on-surface"><X size={24} /></button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                      <input type="text" className="w-full bg-slate-50 border border-outline-variant/30 rounded-2xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20" value={editFormData.fullName} onChange={e => setEditFormData({ ...editFormData, fullName: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Username</label>
                      <input type="text" className="w-full bg-slate-50 border border-outline-variant/30 rounded-2xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20" value={editFormData.username} onChange={e => setEditFormData({ ...editFormData, username: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">New Password <span className="text-slate-400 font-normal">(leave blank to keep)</span></label>
                      <input type="password" className="w-full bg-slate-50 border border-outline-variant/30 rounded-2xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20" placeholder="••••••••" value={editFormData.password} onChange={e => setEditFormData({ ...editFormData, password: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Department</label>
                      <select className="w-full bg-slate-50 border border-outline-variant/30 rounded-2xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20" value={editFormData.department} onChange={e => setEditFormData({ ...editFormData, department: e.target.value })}>
                        <option value="BOD">BOD</option>
                        <option value="Tech">Tech</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Media">Media</option>
                        <option value="Sale">Sale</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role</label>
                      <select className="w-full bg-slate-50 border border-outline-variant/30 rounded-2xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20" value={editFormData.role} onChange={e => setEditFormData({ ...editFormData, role: e.target.value })}>
                        <option value="Admin">Admin</option>
                        <option value="Leader">Leader</option>
                        <option value="Member">Member</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Scope (Position)</label>
                      <input type="text" className="w-full bg-slate-50 border border-outline-variant/30 rounded-2xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g., Backend Developer" value={editFormData.scope} onChange={e => setEditFormData({ ...editFormData, scope: e.target.value })} />
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

          {/* Users Table */}
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
                      <div>
                        <span className="text-sm font-bold text-on-surface block">{user.fullName}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{user.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-slate-500">{user.department}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${roleColors[user.role] || 'bg-slate-100 text-slate-600'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-slate-500">{user.scope || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditUser(user)}
                          className="p-2 text-slate-400 hover:text-primary transition-colors"
                          title="Edit User"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ type: 'user', id: user.id })}
                          disabled={user.id === currentUser?.id}
                          className="p-2 text-slate-400 hover:text-error transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ===== SPRINT MANAGEMENT ===== */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="text-secondary" />
              Sprint Cycles
            </h3>
            <button
              onClick={() => setIsAddingSprint(true)}
              className="flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-secondary/20 hover:scale-95 transition-all"
            >
              <Plus size={16} />
              New Sprint
            </button>
          </div>

          {/* Add Sprint Form */}
          {isAddingSprint && (
            <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/20 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sprint Name</label>
                <input type="text" className="w-full bg-white border border-outline-variant/30 rounded-2xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/20" placeholder="e.g., Sprint 4: Deep Space" value={newSprint.name} onChange={e => setNewSprint({ ...newSprint, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Date</label>
                  <input type="date" className="w-full bg-white border border-outline-variant/30 rounded-2xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/20" value={newSprint.startDate} onChange={e => setNewSprint({ ...newSprint, startDate: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End Date</label>
                  <input type="date" className="w-full bg-white border border-outline-variant/30 rounded-2xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/20" value={newSprint.endDate} onChange={e => setNewSprint({ ...newSprint, endDate: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleAddSprint} className="flex-1 bg-secondary text-white py-2 rounded-xl text-sm font-bold">Create Sprint</button>
                <button onClick={() => { setIsAddingSprint(false); setNewSprint({ name: '', startDate: '', endDate: '' }); }} className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-sm font-bold">Cancel</button>
              </div>
            </div>
          )}

          {/* Edit Sprint Form */}
          {editingSprint && (
            <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/20 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-on-surface">Edit Sprint</h4>
                <button onClick={() => setEditingSprint(null)} className="text-slate-400 hover:text-on-surface"><X size={18} /></button>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sprint Name</label>
                <input type="text" className="w-full bg-white border border-outline-variant/30 rounded-2xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/20" value={editingSprint.name} onChange={e => setEditingSprint({ ...editingSprint, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Date</label>
                  <input type="date" className="w-full bg-white border border-outline-variant/30 rounded-2xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/20" value={editingSprint.startDate.split('T')[0]} onChange={e => setEditingSprint({ ...editingSprint, startDate: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End Date</label>
                  <input type="date" className="w-full bg-white border border-outline-variant/30 rounded-2xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/20" value={editingSprint.endDate.split('T')[0]} onChange={e => setEditingSprint({ ...editingSprint, endDate: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleUpdateSprint(editingSprint)} className="flex-1 bg-secondary text-white py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2"><Save size={14} />Save</button>
                <button onClick={() => setEditingSprint(null)} className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-sm font-bold">Cancel</button>
              </div>
            </div>
          )}

          {/* Sprints Table */}
          <div className="bg-white rounded-3xl border border-outline-variant/10 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-outline-variant/10">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sprint</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {sprints.map(sprint => (
                  <tr key={sprint.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-on-surface">{sprint.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-slate-500">
                        {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setEditingSprint(sprint)} className="p-2 text-slate-400 hover:text-primary transition-colors" title="Edit Sprint"><Edit2 size={16} /></button>
                        <button onClick={() => setDeleteConfirm({ type: 'sprint', id: sprint.id })} className="p-2 text-slate-400 hover:text-error transition-colors" title="Delete Sprint"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-on-surface mb-2">Confirm Delete</h3>
            <p className="text-slate-500 mb-6">
              Are you sure you want to delete this {deleteConfirm.type}? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 bg-slate-100 text-slate-500 py-3 rounded-xl font-bold">Cancel</button>
              <button onClick={() => {
                if (deleteConfirm.type === 'user') handleDeleteUser(deleteConfirm.id);
                else handleDeleteSprint(deleteConfirm.id);
              }} className="flex-1 bg-error text-white py-3 rounded-xl font-bold">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
