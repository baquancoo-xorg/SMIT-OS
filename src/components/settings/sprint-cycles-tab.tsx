import { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, Save, Edit2, X } from 'lucide-react';
import { Sprint } from '../../types';

interface SprintCyclesTabProps {
  onDeleteConfirm: (type: 'sprint', id: string) => void;
}

export function SprintCyclesTab({ onDeleteConfirm }: SprintCyclesTabProps) {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [isAddingSprint, setIsAddingSprint] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="text-secondary" />
          Sprint Cycles
        </h3>
        <button onClick={() => setIsAddingSprint(true)} className="flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-secondary/20 hover:scale-95 transition-all">
          <Plus size={16} /> New Sprint
        </button>
      </div>

      {isAddingSprint && (
        <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/20 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sprint Name</label>
            <input type="text" className="w-full bg-white border border-outline-variant/30 rounded-3xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/20" placeholder="e.g., Sprint 4: Deep Space" value={newSprint.name} onChange={e => setNewSprint({ ...newSprint, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Date</label>
              <input type="date" className="w-full bg-white border border-outline-variant/30 rounded-3xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/20" value={newSprint.startDate} onChange={e => setNewSprint({ ...newSprint, startDate: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End Date</label>
              <input type="date" className="w-full bg-white border border-outline-variant/30 rounded-3xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/20" value={newSprint.endDate} onChange={e => setNewSprint({ ...newSprint, endDate: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAddSprint} className="flex-1 bg-secondary text-white py-2 rounded-xl text-sm font-bold">Create Sprint</button>
            <button onClick={() => { setIsAddingSprint(false); setNewSprint({ name: '', startDate: '', endDate: '' }); }} className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-sm font-bold">Cancel</button>
          </div>
        </div>
      )}

      {editingSprint && (
        <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/20 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-on-surface">Edit Sprint</h4>
            <button onClick={() => setEditingSprint(null)} className="text-slate-400 hover:text-on-surface"><X size={18} /></button>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sprint Name</label>
            <input type="text" className="w-full bg-white border border-outline-variant/30 rounded-3xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/20" value={editingSprint.name} onChange={e => setEditingSprint({ ...editingSprint, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Date</label>
              <input type="date" className="w-full bg-white border border-outline-variant/30 rounded-3xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/20" value={editingSprint.startDate.split('T')[0]} onChange={e => setEditingSprint({ ...editingSprint, startDate: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End Date</label>
              <input type="date" className="w-full bg-white border border-outline-variant/30 rounded-3xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/20" value={editingSprint.endDate.split('T')[0]} onChange={e => setEditingSprint({ ...editingSprint, endDate: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleUpdateSprint(editingSprint)} className="flex-1 bg-secondary text-white py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2"><Save size={14} />Save</button>
            <button onClick={() => setEditingSprint(null)} className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-sm font-bold">Cancel</button>
          </div>
        </div>
      )}

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
                <td className="px-6 py-4"><span className="text-sm font-bold text-on-surface">{sprint.name}</span></td>
                <td className="px-6 py-4"><span className="text-xs font-medium text-slate-500">{new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}</span></td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setEditingSprint(sprint)} className="p-2 text-slate-400 hover:text-primary transition-colors" title="Edit Sprint"><Edit2 size={16} /></button>
                    <button onClick={() => onDeleteConfirm('sprint', sprint.id)} className="p-2 text-slate-400 hover:text-error transition-colors" title="Delete Sprint"><Trash2 size={16} /></button>
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
