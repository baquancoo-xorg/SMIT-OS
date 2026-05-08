import DatePicker from '../ui/DatePicker';
import { useState, useEffect } from 'react';
import { Trash2, Save, Edit2, X } from 'lucide-react';
import { Sprint } from '../../types';
import { Input, Button } from '../ui';
import { TableShell } from '../ui/TableShell';
import { getTableContract } from '../ui/table-contract';
import { formatTableDate } from '../ui/table-date-format';

interface SprintCyclesTabProps {
  onDeleteConfirm: (type: 'sprint', id: string) => void;
  isAddingSprint: boolean;
  setIsAddingSprint: (v: boolean) => void;
}

export function SprintCyclesTab({ onDeleteConfirm, isAddingSprint, setIsAddingSprint }: SprintCyclesTabProps) {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
  const [newSprint, setNewSprint] = useState({ name: '', startDate: '', endDate: '' });
  const standardTable = getTableContract('standard');

  const fetchSprints = async () => {
    try {
      const res = await fetch('/api/sprints', { credentials: 'include' });
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
        credentials: 'include',
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
        credentials: 'include',
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
          <Input label="Sprint Name" placeholder="e.g., Sprint 4: Deep Space" value={newSprint.name} onChange={e => setNewSprint({ ...newSprint, name: e.target.value })} />
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
            <Button onClick={handleAddSprint} variant="secondary" className="flex-1">Create Sprint</Button>
            <Button onClick={() => { setIsAddingSprint(false); setNewSprint({ name: '', startDate: '', endDate: '' }); }} variant="ghost">Cancel</Button>
          </div>
        </div>
      )}

      {editingSprint && (
        <div className="bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white/20 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-on-surface">Edit Sprint</h4>
            <button onClick={() => setEditingSprint(null)} className="text-slate-400 hover:text-on-surface"><X size={18} /></button>
          </div>
          <Input label="Sprint Name" value={editingSprint.name} onChange={e => setEditingSprint({ ...editingSprint, name: e.target.value })} />
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
            <Button onClick={() => handleUpdateSprint(editingSprint)} variant="secondary" className="flex-1 gap-2"><Save size={14} />Save</Button>
            <Button onClick={() => setEditingSprint(null)} variant="ghost">Cancel</Button>
          </div>
        </div>
      )}

      <TableShell variant="standard" className="border border-white/20">
        <thead>
          <tr className={standardTable.headerRow}>
            <th className={standardTable.headerCell}>Sprint</th>
            <th className={standardTable.headerCell}>Duration</th>
            <th className={standardTable.actionHeaderCell}>Actions</th>
          </tr>
        </thead>
        <tbody className={standardTable.body}>
          {sprints.map(sprint => (
            <tr key={sprint.id} className={standardTable.row}>
              <td className={standardTable.cell}><span className="text-sm font-bold text-on-surface">{sprint.name}</span></td>
              <td className={standardTable.cell}><span className="text-xs font-medium text-slate-500">{formatTableDate(sprint.startDate)} - {formatTableDate(sprint.endDate)}</span></td>
              <td className={standardTable.actionCell}>
                <div className="flex items-center justify-end gap-1">
                  <button onClick={() => setEditingSprint(sprint)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all" title="Edit Sprint"><Edit2 size={16} /></button>
                  <button onClick={() => onDeleteConfirm('sprint', sprint.id)} className="p-2 text-slate-400 hover:text-error hover:bg-error/5 rounded-xl transition-all" title="Delete Sprint"><Trash2 size={16} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </TableShell>
    </div>
  );
}
