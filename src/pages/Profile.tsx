import { useState } from 'react';
import { Camera, Save } from 'lucide-react';
import {
  PageHeader,
  GlassCard,
  Input,
  Button,
  useToast,
} from '../components/ui/v2';

/**
 * Profile v2 — token-driven redesign of personal info edit page.
 *
 * Migrated from v1 (`src/pages/Profile.tsx`). Keeps the same local-state
 * stub (no API yet — wire when backend ready). Uses v2 PageHeader +
 * GlassCard + Input + Button + toast for save feedback.
 */
export default function ProfileV2() {
  const { toast } = useToast();
  const [name, setName] = useState('Hoàng Nguyễn');
  const [role, setRole] = useState('Agency PM');
  const [email, setEmail] = useState('hoang.nguyen@example.com');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Stub — wire to API when backend ready.
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    toast({ tone: 'success', title: 'Profile saved', description: 'Your changes are live.' });
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Edit "
        accent="Profile"
        description="Update your personal information. Changes save immediately."
      />

      <GlassCard variant="raised" padding="lg" className="max-w-2xl">
        <div className="flex items-center gap-5 pb-6 border-b border-outline-variant/40">
          <img
            src="https://picsum.photos/seed/pm/96/96"
            alt={`${name} avatar`}
            className="size-20 rounded-card object-cover ring-4 ring-white shadow-md"
            referrerPolicy="no-referrer"
          />
          <div className="flex flex-col gap-1.5">
            <p className="text-[length:var(--text-body-sm)] text-on-surface-variant">Profile photo</p>
            <Button variant="secondary" size="sm" iconLeft={<Camera />}>
              Change avatar
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-6">
          <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Role" value={role} onChange={(e) => setRole(e.target.value)} />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            helperText="Used for login + notifications."
            required
          />

          <div className="flex justify-end pt-3">
            <Button variant="primary" iconLeft={<Save />} isLoading={saving} onClick={handleSave}>
              Save changes
            </Button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
