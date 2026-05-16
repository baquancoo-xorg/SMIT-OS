import { useEffect, useState } from 'react';
import { Pencil, Trash2, MoreHorizontal, UserCog, Users as UsersIcon } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import type { User } from '../../../types';
import type { Personnel, PersonnelPosition } from '../../../lib/personnel/personnel-types';
import { POSITION_LABEL } from '../../../lib/personnel/personnel-types';
import {
  DataTable,
  Badge,
  Button,
  Input,
  FormDialog,
  EmptyState,
  DropdownMenu,
} from '../../ui';
import type { DataTableColumn, BadgeVariant } from '../../ui';

const ALL_DEPARTMENTS = ['BOD', 'Tech', 'Marketing', 'Media', 'Sale'];
const ROLE_BADGE: Record<string, BadgeVariant> = {
  Admin: 'info',
  Member: 'neutral',
};

interface UserFormState {
  fullName: string;
  username: string;
  password: string;
  departments: string[];
  role: string;
  scope: string;
  isAdmin: boolean;
}

const EMPTY_FORM: UserFormState = {
  fullName: '',
  username: '',
  password: '',
  departments: ['Tech'],
  role: 'Member',
  scope: '',
  isAdmin: false,
};

interface PersonnelFormState {
  hasPersonnel: boolean;
  position: PersonnelPosition | '';
  startDate: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
}

const EMPTY_PERSONNEL_FORM: PersonnelFormState = {
  hasPersonnel: false,
  position: '',
  startDate: '',
  birthDate: '',
  birthTime: '',
  birthPlace: '',
};

const POSITIONS: PersonnelPosition[] = ['MARKETING', 'MEDIA', 'ACCOUNT'];

function toDateInput(iso: string | null): string {
  return iso ? iso.slice(0, 10) : '';
}

interface UserManagementTabProps {
  onDeleteConfirm: (type: 'user', id: string) => void;
  isAddingUser: boolean;
  setIsAddingUser: (v: boolean) => void;
}

/**
 * UserManagementTab v2 — DataTable + FormDialog visual layer.
 *
 * Logic + API identical to v1 (POST/PUT /api/users). Edit + add use a single
 * shared FormDialog (mode switched by `editingUser` state).
 * Department multi-select uses chip toggle pattern (kept from v1).
 */
export function UserManagementTab({ onDeleteConfirm, isAddingUser, setIsAddingUser }: UserManagementTabProps) {
  const { users, refreshUsers, currentUser } = useAuth();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormState>(EMPTY_FORM);
  const [personnelForm, setPersonnelForm] = useState<PersonnelFormState>(EMPTY_PERSONNEL_FORM);
  const [submitting, setSubmitting] = useState(false);

  // Load existing Personnel record when editing
  useEffect(() => {
    if (!editingUser) {
      setPersonnelForm(EMPTY_PERSONNEL_FORM);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/personnel?_=${editingUser.id}`, { credentials: 'include' });
        if (!res.ok) return;
        const list = (await res.json()) as Personnel[];
        const match = list.find((p) => p.userId === editingUser.id);
        if (cancelled) return;
        if (match) {
          setPersonnelForm({
            hasPersonnel: true,
            position: match.position,
            startDate: toDateInput(match.startDate),
            birthDate: toDateInput(match.birthDate),
            birthTime: match.birthTime ?? '',
            birthPlace: match.birthPlace ?? '',
          });
        } else {
          setPersonnelForm({ ...EMPTY_PERSONNEL_FORM, position: '' });
        }
      } catch {
        // network errors silenced — form keeps EMPTY_PERSONNEL_FORM, admin can still save
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [editingUser]);

  const isEditing = editingUser !== null;
  const dialogOpen = isAddingUser || isEditing;

  const toggleDepartment = (dept: string) => {
    setFormData((prev) => ({
      ...prev,
      departments: prev.departments.includes(dept)
        ? prev.departments.filter((d) => d !== dept)
        : [...prev.departments, dept],
    }));
  };

  const openAdd = () => {
    setEditingUser(null);
    setFormData(EMPTY_FORM);
    setIsAddingUser(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName,
      username: user.username,
      password: '',
      departments: user.departments || [],
      role: user.role,
      scope: user.scope || '',
      isAdmin: user.isAdmin,
    });
  };

  const closeDialog = () => {
    setIsAddingUser(false);
    setEditingUser(null);
    setFormData(EMPTY_FORM);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (isEditing && editingUser) {
        const data: Record<string, unknown> = {
          fullName: formData.fullName,
          username: formData.username,
          departments: formData.departments,
          role: formData.role,
          scope: formData.scope,
          isAdmin: formData.isAdmin,
        };
        if (formData.password.trim()) data.password = formData.password;

        const res = await fetch(`/api/users/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          setSubmitting(false);
          return;
        }

        // Sync Personnel if position selected
        if (personnelForm.position) {
          const pData: Record<string, unknown> = {
            position: personnelForm.position,
            birthDate: personnelForm.birthDate || null,
            birthTime: personnelForm.birthTime || null,
            birthPlace: personnelForm.birthPlace || null,
          };
          if (personnelForm.startDate) pData.startDate = personnelForm.startDate;
          await fetch(`/api/personnel/by-user/${editingUser.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(pData),
          });
        }

        await refreshUsers();
        closeDialog();
      } else {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          await refreshUsers();
          closeDialog();
        }
      }
    } catch (error) {
      console.error('Failed to save user:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const columns: DataTableColumn<User>[] = [
    {
      key: 'user',
      label: 'User',
      sortable: true,
      sort: (a, b) => a.fullName.localeCompare(b.fullName),
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-card bg-primary-container text-on-primary-container font-bold">
            {u.fullName[0]}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-on-surface">{u.fullName}</p>
            <p className="truncate text-[length:var(--text-caption)] text-on-surface-variant">@{u.username}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      sort: (a, b) => a.role.localeCompare(b.role),
      render: (u) => <Badge variant={ROLE_BADGE[u.role] ?? 'neutral'}>{u.role}</Badge>,
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      width: 'w-12',
      render: (u) => (
        <DropdownMenu
          label={`Actions for ${u.fullName}`}
          trigger={
            <button
              type="button"
              aria-label={`Actions for ${u.fullName}`}
              className="inline-flex size-8 items-center justify-center rounded-button text-on-surface-variant hover:bg-surface-container focus-visible:outline-none"
            >
              <MoreHorizontal className="size-4" aria-hidden="true" />
            </button>
          }
          items={[
            { key: 'edit', label: 'Edit user', icon: <Pencil />, onClick: () => openEdit(u) },
            ...(u.id !== currentUser?.id
              ? [{ key: 'delete', label: 'Delete', icon: <Trash2 />, destructive: true, onClick: () => onDeleteConfirm('user', u.id) }]
              : []),
          ]}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {users.length > 0 ? (
        <DataTable<User>
          label="Team members"
          data={users}
          rowKey={(u) => u.id}
          columns={columns}
        />
      ) : (
        <EmptyState
          icon={<UsersIcon />}
          title="No team members yet"
          description="Invite the first member to start collaborating."
          actions={
            <Button variant="primary" onClick={openAdd}>
              Add user
            </Button>
          }
          decorative
        />
      )}

      <FormDialog
        open={dialogOpen}
        onClose={closeDialog}
        onSubmit={handleSubmit}
        title={isEditing ? 'Edit user' : 'New user'}
        description={isEditing ? `Editing ${editingUser?.fullName}.` : 'Create a workspace member.'}
        icon={<UserCog />}
        size="lg"
        submitLabel={isEditing ? 'Save changes' : 'Save user'}
        isSubmitting={submitting}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Full name"
            placeholder="Nguyen Van A"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />
          <Input
            label="Username"
            placeholder="nva_smit"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
          />
        </div>
        <Input
          label={isEditing ? 'New password (optional)' : 'Password'}
          type="password"
          placeholder={isEditing ? '••••••••' : ''}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required={!isEditing}
          helperText={isEditing ? 'Leave blank to keep current password.' : undefined}
        />

        <div className="flex flex-col gap-2">
          <label className="text-[length:var(--text-label)] font-medium text-on-surface-variant">
            Departments
          </label>
          <div className="flex flex-wrap gap-2">
            {ALL_DEPARTMENTS.map((dept) => {
              const active = formData.departments.includes(dept);
              return (
                <button
                  key={dept}
                  type="button"
                  onClick={() => toggleDepartment(dept)}
                  className={[
                    'inline-flex h-8 items-center rounded-chip px-3 text-[length:var(--text-body-sm)] font-semibold',
                    'transition-colors motion-fast ease-standard focus-visible:outline-none',
                    active
                      ? 'bg-surface-container border border-accent text-on-surface'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container border border-transparent',
                  ].join(' ')}
                >
                  {dept}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="user-role" className="text-[length:var(--text-label)] font-medium text-on-surface-variant">
              Role
            </label>
            <select
              id="user-role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="h-10 rounded-input border border-outline-variant bg-surface-container-lowest px-3 text-[length:var(--text-body)] text-on-surface focus-visible:outline-none focus-visible:border-primary"
            >
              <option value="Admin">Admin</option>
              <option value="Member">Member</option>
            </select>
          </div>
          <Input
            label="Scope (position)"
            placeholder="e.g., Backend Developer"
            value={formData.scope}
            onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
          />
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-on-surface">
          <input
            type="checkbox"
            checked={formData.isAdmin}
            onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
            className="size-4 rounded accent-primary"
          />
          <span>Grant admin access</span>
        </label>

        {isEditing && (
          <div className="mt-2 flex flex-col gap-3 rounded-card border border-outline-variant bg-surface-container-low p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-on-surface-variant">Personnel profile</p>
              {personnelForm.hasPersonnel ? (
                <Badge variant="primary" size="sm">Đã có hồ sơ</Badge>
              ) : (
                <Badge variant="neutral" size="sm">Chưa khởi tạo</Badge>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="personnel-position" className="text-[length:var(--text-label)] font-medium text-on-surface-variant">
                  Position
                </label>
                <select
                  id="personnel-position"
                  value={personnelForm.position}
                  onChange={(e) => setPersonnelForm({ ...personnelForm, position: e.target.value as PersonnelPosition | '' })}
                  className="h-10 rounded-input border border-outline-variant bg-surface-container-lowest px-3 text-[length:var(--text-body)] text-on-surface focus-visible:outline-none focus-visible:border-primary"
                >
                  <option value="">— Không có Personnel —</option>
                  {POSITIONS.map((p) => (
                    <option key={p} value={p}>{POSITION_LABEL[p]}</option>
                  ))}
                </select>
              </div>
              <Input
                label="Start date"
                type="date"
                value={personnelForm.startDate}
                onChange={(e) => setPersonnelForm({ ...personnelForm, startDate: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Ngày sinh"
                type="date"
                value={personnelForm.birthDate}
                onChange={(e) => setPersonnelForm({ ...personnelForm, birthDate: e.target.value })}
                helperText="Cần thiết để tính numerology + bát tự."
              />
              <Input
                label="Giờ sinh (tuỳ chọn)"
                type="time"
                value={personnelForm.birthTime}
                onChange={(e) => setPersonnelForm({ ...personnelForm, birthTime: e.target.value })}
              />
            </div>

            <Input
              label="Nơi sinh (tuỳ chọn)"
              placeholder="VD: Hà Nội"
              value={personnelForm.birthPlace}
              onChange={(e) => setPersonnelForm({ ...personnelForm, birthPlace: e.target.value })}
            />
          </div>
        )}
      </FormDialog>
    </div>
  );
}
