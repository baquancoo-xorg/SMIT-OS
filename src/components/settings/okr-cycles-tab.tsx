import { useState, useEffect } from 'react';
import { Plus, Trash2, Target, Save, Edit2, X } from 'lucide-react';
import { OkrCycle } from '../../types';

interface OkrCyclesTabProps {
  onDeleteConfirm: (type: 'cycle', id: string) => void;
}

export function OkrCyclesTab({ onDeleteConfirm }: OkrCyclesTabProps) {
  const [okrCycles, setOkrCycles] = useState<OkrCycle[]>([]);
  const [isAddingCycle, setIsAddingCycle] = useState(false);
  const [editingCycle, setEditingCycle] = useState<OkrCycle | null>(null);
  const [newCycle, setNewCycle] = useState({ name: '', startDate: '', endDate: '' });

  const fetchOkrCycles = async () => {
    try {
      const res = await fetch('/api/okr-cycles');
      const data = await res.json();
      setOkrCycles(data);
    } catch (error) {
      console.error('Failed to fetch OKR cycles:', error);
    }
  };

  useEffect(() => {
    fetchOkrCycles();
  }, []);

  const handleAddCycle = async () => {
    try {
      const res = await fetch('/api/okr-cycles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCycle)
      });
      if (res.ok) {
        await fetchOkrCycles();
        setIsAddingCycle(false);
        setNewCycle({ name: '', startDate: '', endDate: '' });
      }
    } catch (error) {
      console.error('Failed to add OKR cycle:', error);
    }
  };

  const handleUpdateCycle = async (cycle: OkrCycle) => {
    try {
      const res = await fetch(`/api/okr-cycles/${cycle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cycle)
      });
      if (res.ok) {
        await fetchOkrCycles();
        setEditingCycle(null);
      }
    } catch (error) {
      console.error('Failed to update OKR cycle:', error);
    }
  };

  const handleSetActiveCycle = async (id: string) => {
    try {
      const res = await fetch(`/api/okr-cycles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: true })
      });
      if (res.ok) await fetchOkrCycles();
    } catch (error) {
      console.error('Failed to set active cycle:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold flex items-center gap-2">
          <Target className="text-primary" />
          OKRs Cycle
        </h3>
        <button onClick={() => setIsAddingCycle(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-95 transition-all">
          <Plus size={16} /> New Cycle
        </button>
      </div>

      {isAddingCycle && (
        <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/20 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cycle Name</label>
            <input type="text" className="w-full bg-white border border-outline-variant/30 rounded-3xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g., Q2/2026" value={newCycle.name} onChange={e => setNewCycle({ ...newCycle, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Date</label>
              <input type="date" className="w-full bg-white border border-outline-variant/30 rounded-3xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20" value={newCycle.startDate} onChange={e => setNewCycle({ ...newCycle, startDate: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End Date</label>
              <input type="date" className="w-full bg-white border border-outline-variant/30 rounded-3xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20" value={newCycle.endDate} onChange={e => setNewCycle({ ...newCycle, endDate: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAddCycle} className="flex-1 bg-primary text-white py-2 rounded-xl text-sm font-bold">Create Cycle</button>
            <button onClick={() => { setIsAddingCycle(false); setNewCycle({ name: '', startDate: '', endDate: '' }); }} className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-sm font-bold">Cancel</button>
          </div>
        </div>
      )}

      {editingCycle && (
        <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/20 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-on-surface">Edit Cycle</h4>
            <button onClick={() => setEditingCycle(null)} className="text-slate-400 hover:text-on-surface"><X size={18} /></button>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cycle Name</label>
            <input type="text" className="w-full bg-white border border-outline-variant/30 rounded-3xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20" value={editingCycle.name} onChange={e => setEditingCycle({ ...editingCycle, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Date</label>
              <input type="date" className="w-full bg-white border border-outline-variant/30 rounded-3xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20" value={editingCycle.startDate.split('T')[0]} onChange={e => setEditingCycle({ ...editingCycle, startDate: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End Date</label>
              <input type="date" className="w-full bg-white border border-outline-variant/30 rounded-3xl px-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20" value={editingCycle.endDate.split('T')[0]} onChange={e => setEditingCycle({ ...editingCycle, endDate: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleUpdateCycle(editingCycle)} className="flex-1 bg-primary text-white py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2"><Save size={14} />Save</button>
            <button onClick={() => setEditingCycle(null)} className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-sm font-bold">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-outline-variant/10 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-outline-variant/10">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cycle</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {okrCycles.map(cycle => (
              <tr key={cycle.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4"><span className="text-sm font-bold text-on-surface">{cycle.name}</span></td>
                <td className="px-6 py-4"><span className="text-xs font-medium text-slate-500">{new Date(cycle.startDate).toLocaleDateString('vi-VN')} - {new Date(cycle.endDate).toLocaleDateString('vi-VN')}</span></td>
                <td className="px-6 py-4">
                  {cycle.isActive ? (
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold">Active</span>
                  ) : (
                    <button onClick={() => handleSetActiveCycle(cycle.id)} className="px-2 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold hover:bg-primary/10 hover:text-primary transition-colors">Set Active</button>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setEditingCycle(cycle)} className="p-2 text-slate-400 hover:text-primary transition-colors" title="Edit Cycle"><Edit2 size={16} /></button>
                    <button onClick={() => onDeleteConfirm('cycle', cycle.id)} className="p-2 text-slate-400 hover:text-error transition-colors" title="Delete Cycle"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {okrCycles.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400 text-sm">No OKR cycles created yet. Create one to start tracking quarterly objectives.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
