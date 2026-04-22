import DatePicker from '../ui/date-picker';
import { useState, useEffect } from 'react';
import { Trash2, Save, Edit2, X } from 'lucide-react';
import { Sprint } from '../../types';

interface SprintCyclesTabProps {
  onDeleteConfirm: (type: 'sprint', id: string) => void;
  isAddingSprint: boolean;
  setIsAddingSprint: (v: boolean) => void;
}

export function SprintCyclesTab({ onDeleteConfirm, isAddingSprint, setIsAddingSprint }: SprintCyclesTabProps) {
  const [sprints, setSprints] = useState<Sprint[]>([]);
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

      {isAddingSprint && (
        <div className="bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white/20 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sprint Name</label>
            <input type="text" className="w-full bg-white border border-outline-variant/30 rounded-3xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/20" placeholder="e.g., Sprint 4: Deep Space" value={newSprint.name} onChange={e => setNewSprint({ ...newSprint, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Date</label>
              <DatePicker value={newSprint.startDate} onChange={(v) => setNewSprint({ ...newSprint, startDate: v })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End Date</label>
              <DatePicker value={newSprint.endDate} onChange={(v) => setNewSprint({ ...newSprint, endDate: v })} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAddSprint} className="flex-1 bg-secondary text-white py-2 rounded-xl text-sm font-bold">Create Sprint</button>
            <button onClick={() => { setIsAddingSprint(false); setNewSprint({ name: '', startDate: '', endDate: '' }); }} className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-sm font-bold">Cancel</button>
          </div>
        </div>
      )}

      {editingSprint && (
        <div className="bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white/20 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
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
              <DatePicker className="w-full" value={editingSprint.startDate.split('T')[0]} onChange={(v) => setEditingSprint({ ...editingSprint, startDate: v })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End Date</label>
              <DatePicker className="w-full" value={editingSprint.endDate.split('T')[0]} onChange={(v) => setEditingSprint({ ...editingSprint, endDate: v })} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleUpdateSprint(editingSprint)} className="flex-1 bg-secondary text-white py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2"><Save size={14} />Save</button>
            <button onClick={() => setEditingSprint(null)} className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-sm font-bold">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white/50 backdrop-blur-md rounded-3xl shadow-sm border border-white/20 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-outline-variant/10 bg-surface-container-low/30">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sprint</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {sprints.map(sprint => (
              <tr key={sprint.id} className="hover:bg-surface-container-low/30 transition-all">
                <td className="px-6 py-4"><span className="text-sm font-bold text-on-surface">{sprint.name}</span></td>
                <td className="px-6 py-4"><span className="text-xs font-medium text-slate-500">{new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}</span></td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => setEditingSprint(sprint)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all" title="Edit Sprint"><Edit2 size={16} /></button>
                    <button onClick={() => onDeleteConfirm('sprint', sprint.id)} className="p-2 text-slate-400 hover:text-error hover:bg-error/5 rounded-xl transition-all" title="Delete Sprint"><Trash2 size={16} /></button>
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
