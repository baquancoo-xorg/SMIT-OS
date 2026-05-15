import { useState } from 'react';
import { Pencil, Trash2, MoreHorizontal, UserCog, Users as UsersIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { User } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/ui/empty-state';
import { FormDialog } from '@/components/ui/form-dialog';
import { Input } from '@/components/ui/input';
import type { BadgeVariant } from '@/components/ui/badge';
import type { DataTableColumn } from '@/components/ui/data-table';

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
export function UserManagementTabV2({ onDeleteConfirm, isAddingUser, setIsAddingUser }: UserManagementTabProps) {
  const { users, refreshUsers, currentUser } = useAuth();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

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
        if (res.ok) {
          await refreshUsers();
          closeDialog();
        }
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
      key: 'departments',
      label: 'Dept',
      hideBelow: 'md',
      render: (u) => (
        <div className="flex flex-wrap gap-1">
          {(u.departments ?? []).map((d) => (
            <Badge key={d} variant="primary" size="sm">
              {d}
            </Badge>
          ))}
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
      key: 'scope',
      label: 'Scope',
      hideBelow: 'lg',
      render: (u) => <span className="text-on-surface-variant">{u.scope || '—'}</span>,
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
      </FormDialog>
    </div>
  );
}
