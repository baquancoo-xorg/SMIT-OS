import DatePicker from '../ui/date-picker';
import { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { OkrCycle } from '../../types';
import { Input, Button } from '../ui';
import { TableShell } from '../ui/table-shell';
import { getTableContract } from '../ui/table-contract';
import { formatTableDate } from '../ui/table-date-format';
import { TableRowActions } from '../ui/table-row-actions';

interface OkrCyclesTabProps {
  onDeleteConfirm: (type: 'cycle', id: string) => void;
  isAddingCycle: boolean;
  setIsAddingCycle: (v: boolean) => void;
}

export function OkrCyclesTab({ onDeleteConfirm, isAddingCycle, setIsAddingCycle }: OkrCyclesTabProps) {
  const [okrCycles, setOkrCycles] = useState<OkrCycle[]>([]);
  const [editingCycle, setEditingCycle] = useState<OkrCycle | null>(null);
  const [newCycle, setNewCycle] = useState({ name: '', startDate: '', endDate: '' });
  const standardTable = getTableContract('standard');

  const fetchOkrCycles = async () => {
    try {
      const res = await fetch('/api/okr-cycles', { credentials: 'include' });
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
        credentials: 'include',
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
        credentials: 'include',
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
      {isAddingCycle && (
        <div className="bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white/20 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <Input label="Cycle Name" placeholder="e.g., Q2/2026" value={newCycle.name} onChange={e => setNewCycle({ ...newCycle, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Date</label>
              <DatePicker value={newCycle.startDate} onChange={(v) => setNewCycle({ ...newCycle, startDate: v })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End Date</label>
              <DatePicker value={newCycle.endDate} onChange={(v) => setNewCycle({ ...newCycle, endDate: v })} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddCycle} className="flex-1">Create Cycle</Button>
            <Button onClick={() => { setIsAddingCycle(false); setNewCycle({ name: '', startDate: '', endDate: '' }); }} variant="ghost">Cancel</Button>
          </div>
        </div>
      )}

      {editingCycle && (
        <div className="bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white/20 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-on-surface">Edit Cycle</h4>
            <button onClick={() => setEditingCycle(null)} className="text-slate-400 hover:text-on-surface"><X size={18} /></button>
          </div>
          <Input label="Cycle Name" value={editingCycle.name} onChange={e => setEditingCycle({ ...editingCycle, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Date</label>
              <DatePicker className="w-full" value={editingCycle.startDate.split('T')[0]} onChange={(v) => setEditingCycle({ ...editingCycle, startDate: v })} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End Date</label>
              <DatePicker className="w-full" value={editingCycle.endDate.split('T')[0]} onChange={(v) => setEditingCycle({ ...editingCycle, endDate: v })} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handleUpdateCycle(editingCycle)} className="flex-1 gap-2"><Save size={14} />Save</Button>
            <Button onClick={() => setEditingCycle(null)} variant="ghost">Cancel</Button>
          </div>
        </div>
      )}

      <TableShell variant="standard" className="border border-white/20">
        <thead>
          <tr className={standardTable.headerRow}>
            <th className={standardTable.headerCell}>Cycle</th>
            <th className={standardTable.headerCell}>Duration</th>
            <th className={standardTable.headerCell}>Status</th>
            <th className={standardTable.actionHeaderCell}>Actions</th>
          </tr>
        </thead>
        <tbody className={standardTable.body}>
          {okrCycles.map(cycle => (
            <tr key={cycle.id} className={standardTable.row}>
              <td className={standardTable.cell}><span className="text-sm font-bold text-on-surface">{cycle.name}</span></td>
              <td className={standardTable.cell}><span className="text-xs font-medium text-slate-500">{formatTableDate(cycle.startDate)} - {formatTableDate(cycle.endDate)}</span></td>
              <td className={standardTable.cell}>
                {cycle.isActive ? (
                  <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold">Active</span>
                ) : (
                  <button onClick={() => handleSetActiveCycle(cycle.id)} className="px-2 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold hover:bg-primary/10 hover:text-primary transition-colors">Set Active</button>
                )}
              </td>
              <td className={standardTable.actionCell}>
                <TableRowActions
                  onEdit={() => setEditingCycle(cycle)}
                  onDelete={() => onDeleteConfirm('cycle', cycle.id)}
                  size={16}
                  variant="standard"
                />
              </td>
            </tr>
          ))}
          {okrCycles.length === 0 && (
            <tr>
              <td colSpan={4} className={standardTable.emptyState}>No OKR cycles created yet. Create one to start tracking quarterly objectives.</td>
            </tr>
          )}
        </tbody>
      </TableShell>
    </div>
  );
}
