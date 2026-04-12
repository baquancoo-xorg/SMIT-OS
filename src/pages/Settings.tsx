import React, { useState, useEffect } from 'react';
import { User, Sprint } from '../types';
import { Plus, Trash2, Users, Calendar, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Settings() {
  const { users, refreshUsers } = useAuth();
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isAddingSprint, setIsAddingSprint] = useState(false);
  
  const [newUser, setNewUser] = useState({ fullName: '', department: 'Tech', role: 'Member', avatar: 'https://picsum.photos/seed/user/200' });
  const [newSprint, setNewSprint] = useState({ name: '', startDate: '', endDate: '' });

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
        setNewUser({ fullName: '', department: 'Tech', role: 'Member', avatar: 'https://picsum.photos/seed/user/200' });
      }
    } catch (error) {
      console.error('Failed to add user:', error);
    }
  };

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

  return (
    <div className="h-full flex flex-col p-6 md:p-10 space-y-12 w-full overflow-y-auto">
      <div>
        <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">Workspace Settings</h2>
        <p className="text-slate-500 mt-2">Manage users, sprints, and system configurations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* User Management */}
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

          {isAddingUser && (
            <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/20 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-white border border-outline-variant/30 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    value={newUser.fullName}
                    onChange={e => setNewUser({...newUser, fullName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Department</label>
                  <select 
                    className="w-full bg-white border border-outline-variant/30 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    value={newUser.department}
                    onChange={e => setNewUser({...newUser, department: e.target.value})}
                  >
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
                  <input 
                    type="text" 
                    className="w-full bg-white border border-outline-variant/30 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    value={newUser.role}
                    onChange={e => setNewUser({...newUser, role: e.target.value})}
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button 
                    onClick={handleAddUser}
                    className="flex-1 bg-primary text-white py-2 rounded-xl text-sm font-bold"
                  >
                    Save User
                  </button>
                  <button 
                    onClick={() => setIsAddingUser(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-sm font-bold"
                  >
                    Cancel
                  </button>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={user.avatar} alt="" className="w-8 h-8 rounded-full" />
                        <span className="text-sm font-bold text-on-surface">{user.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-slate-500">{user.department}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-slate-500">{user.role}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sprint Management */}
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

          {isAddingSprint && (
            <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/20 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sprint Name</label>
                <input 
                  type="text" 
                  className="w-full bg-white border border-outline-variant/30 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-secondary/20"
                  placeholder="e.g., Sprint 4: Deep Space"
                  value={newSprint.name}
                  onChange={e => setNewSprint({...newSprint, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Date</label>
                  <input 
                    type="date" 
                    className="w-full bg-white border border-outline-variant/30 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-secondary/20"
                    value={newSprint.startDate}
                    onChange={e => setNewSprint({...newSprint, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End Date</label>
                  <input 
                    type="date" 
                    className="w-full bg-white border border-outline-variant/30 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-secondary/20"
                    value={newSprint.endDate}
                    onChange={e => setNewSprint({...newSprint, endDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleAddSprint}
                  className="flex-1 bg-secondary text-white py-2 rounded-xl text-sm font-bold"
                >
                  Create Sprint
                </button>
                <button 
                  onClick={() => setIsAddingSprint(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-sm font-bold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl border border-outline-variant/10 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-outline-variant/10">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sprint</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</th>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
