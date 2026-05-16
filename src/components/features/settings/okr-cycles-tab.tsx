import { useState, useEffect } from 'react';
import { Pencil, Trash2, MoreHorizontal, Calendar } from 'lucide-react';
import type { OkrCycle } from '../../../types';
import {
  DataTable,
  Badge,
  Button,
  Input,
  FormDialog,
  EmptyState,
  DropdownMenu,
} from '../../ui';
import type { DataTableColumn } from '../../ui';

interface OkrCyclesTabProps {
  onDeleteConfirm: (type: 'cycle', id: string) => void;
  isAddingCycle: boolean;
  setIsAddingCycle: (v: boolean) => void;
}

interface CycleFormState {
  name: string;
  startDate: string;
  endDate: string;
}

const EMPTY_FORM: CycleFormState = { name: '', startDate: '', endDate: '' };

function formatDate(d: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN');
}

/**
 * OkrCyclesTab v2 — DataTable + FormDialog visual layer.
 *
 * Logic + API identical to v1: GET/POST/PUT /api/okr-cycles.
 * Inline form panels replaced with FormDialog (one for add, one for edit).
 * Status pill replaced with Badge v2; row actions via DropdownMenu.
 */
export function OkrCyclesTab({ onDeleteConfirm, isAddingCycle, setIsAddingCycle }: OkrCyclesTabProps) {
  const [okrCycles, setOkrCycles] = useState<OkrCycle[]>([]);
  const [editingCycle, setEditingCycle] = useState<OkrCycle | null>(null);
  const [newCycle, setNewCycle] = useState<CycleFormState>(EMPTY_FORM);
  const [editForm, setEditForm] = useState<CycleFormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

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
    setSubmitting(true);
    try {
      const res = await fetch('/api/okr-cycles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newCycle),
      });
      if (res.ok) {
        await fetchOkrCycles();
        setIsAddingCycle(false);
        setNewCycle(EMPTY_FORM);
      }
    } catch (error) {
      console.error('Failed to add OKR cycle:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (cycle: OkrCycle) => {
    setEditingCycle(cycle);
    setEditForm({
      name: cycle.name,
      startDate: cycle.startDate.split('T')[0],
      endDate: cycle.endDate.split('T')[0],
    });
  };

  const handleUpdateCycle = async () => {
    if (!editingCycle) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/okr-cycles/${editingCycle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...editingCycle, ...editForm }),
      });
      if (res.ok) {
        await fetchOkrCycles();
        setEditingCycle(null);
      }
    } catch (error) {
      console.error('Failed to update OKR cycle:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetActiveCycle = async (id: string) => {
    try {
      const res = await fetch(`/api/okr-cycles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: true }),
      });
      if (res.ok) await fetchOkrCycles();
    } catch (error) {
      console.error('Failed to set active cycle:', error);
    }
  };

  const columns: DataTableColumn<OkrCycle>[] = [
    {
      key: 'name',
      label: 'Cycle',
      sortable: true,
      sort: (a, b) => a.name.localeCompare(b.name),
      render: (c) => <span className="font-semibold text-on-surface">{c.name}</span>,
    },
    {
      key: 'duration',
      label: 'Duration',
      hideBelow: 'md',
      render: (c) => (
        <span className="text-on-surface-variant">
          {formatDate(c.startDate)} – {formatDate(c.endDate)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (c) =>
        c.isActive ? (
          <Badge variant="success">Active</Badge>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => handleSetActiveCycle(c.id)}>
            Set active
          </Button>
        ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      width: 'w-12',
      render: (c) => (
        <DropdownMenu
          label={`Actions for ${c.name}`}
          trigger={
            <button
              type="button"
              aria-label={`Actions for ${c.name}`}
              className="inline-flex size-8 items-center justify-center rounded-button text-on-surface-variant hover:bg-surface-container focus-visible:outline-none"
            >
              <MoreHorizontal className="size-4" aria-hidden="true" />
            </button>
          }
          items={[
            { key: 'edit', label: 'Edit cycle', icon: <Pencil />, onClick: () => openEdit(c) },
            {
              key: 'delete',
              label: 'Delete',
              icon: <Trash2 />,
              destructive: true,
              onClick: () => onDeleteConfirm('cycle', c.id),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {okrCycles.length > 0 ? (
        <DataTable<OkrCycle>
          label="OKR cycles"
          data={okrCycles}
          rowKey={(c) => c.id}
          columns={columns}
        />
      ) : (
        <EmptyState
          icon={<Calendar />}
          title="No OKR cycles yet"
          description="Create a cycle to start tracking quarterly objectives."
          actions={
            <Button variant="primary" onClick={() => setIsAddingCycle(true)}>
              Create cycle
            </Button>
          }
          decorative
        />
      )}

      {/* Add dialog */}
      <FormDialog
        open={isAddingCycle}
        onClose={() => {
          setIsAddingCycle(false);
          setNewCycle(EMPTY_FORM);
        }}
        onSubmit={handleAddCycle}
        title="New OKR cycle"
        description="Set the name and date range for the cycle."
        submitLabel="Create cycle"
        isSubmitting={submitting}
      >
        <Input
          label="Cycle name"
          placeholder="e.g., Q2/2026"
          value={newCycle.name}
          onChange={(e) => setNewCycle({ ...newCycle, name: e.target.value })}
          required
          autoFocus
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Start date"
            type="date"
            value={newCycle.startDate}
            onChange={(e) => setNewCycle({ ...newCycle, startDate: e.target.value })}
            required
          />
          <Input
            label="End date"
            type="date"
            value={newCycle.endDate}
            min={newCycle.startDate}
            onChange={(e) => setNewCycle({ ...newCycle, endDate: e.target.value })}
            required
          />
        </div>
      </FormDialog>

      {/* Edit dialog */}
      <FormDialog
        open={!!editingCycle}
        onClose={() => setEditingCycle(null)}
        onSubmit={handleUpdateCycle}
        title="Edit OKR cycle"
        submitLabel="Save changes"
        isSubmitting={submitting}
      >
        <Input
          label="Cycle name"
          value={editForm.name}
          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Start date"
            type="date"
            value={editForm.startDate}
            onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
          />
          <Input
            label="End date"
            type="date"
            value={editForm.endDate}
            min={editForm.startDate}
            onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
          />
        </div>
      </FormDialog>
    </div>
  );
}
