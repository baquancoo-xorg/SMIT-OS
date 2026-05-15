/**
 * social-channel-form.tsx — Add/Edit SocialChannel dialog.
 * Controlled inputs + Zod validation. Token field is write-only.
 */
import { useState } from 'react';
import { Eye, EyeOff, Link } from 'lucide-react';
import { z } from 'zod';
import type { SocialChannel } from '@/hooks/use-social-channels';
import { useSocialChannelCreate, useSocialChannelUpdate } from '@/hooks/use-social-channels';
import { FormDialog } from '@/components/ui/form-dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/notification-toast';

type Mode = 'create' | 'edit';
interface Props { open: boolean; mode: Mode; channel?: SocialChannel; onClose: () => void; }

const PLATFORMS = [
  { value: 'FACEBOOK_PAGE', label: 'Facebook Page', enabled: true },
  { value: 'FACEBOOK_GROUP', label: 'Facebook Group', enabled: false },
  { value: 'INSTAGRAM', label: 'Instagram', enabled: false },
  { value: 'TIKTOK', label: 'TikTok', enabled: false },
  { value: 'YOUTUBE', label: 'YouTube', enabled: false },
  { value: 'THREADS', label: 'Threads', enabled: false },
] as const;

const createSchema = z.object({
  platform: z.string().min(1),
  externalId: z.string().min(1, 'Page ID is required'),
  name: z.string().min(1, 'Name is required'),
  accessToken: z.string().min(10, 'Access token must be at least 10 characters'),
  tokenExpiresAt: z.string().optional(),
});
const editSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  accessToken: z.string().min(10).optional().or(z.literal('')),
  tokenExpiresAt: z.string().optional(),
});

function toIso(d: string) { return new Date(d).toISOString(); }
function collectErrors(issues: z.ZodIssue[]) {
  const errs: Record<string, string> = {};
  issues.forEach(i => { errs[i.path[0] as string] = i.message; });
  return errs;
}

function TokenInput({ value, onChange, showToken, onToggle, error, mode }: {
  value: string; onChange: (v: string) => void;
  showToken: boolean; onToggle: () => void; error?: string; mode: Mode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[length:var(--text-label)] font-medium text-on-surface-variant">
        Access token{mode === 'edit' && <span className="ml-1 text-on-surface-variant/60">(leave blank to keep current)</span>}
      </label>
      <div className="relative">
        <input type={showToken ? 'text' : 'password'} autoComplete="new-password"
          placeholder={mode === 'edit' ? 'Leave blank to keep current token' : 'Paste access token'}
          value={value} onChange={e => onChange(e.target.value)}
          className={['h-10 w-full rounded-input border bg-surface-container-lowest px-3 pr-10 text-[length:var(--text-body)] text-on-surface',
            'placeholder:text-on-surface-variant/60 transition-colors focus-visible:border-primary focus-visible:outline-none',
            error ? 'border-error' : 'border-outline-variant hover:border-outline'].join(' ')} />
        <button type="button" onClick={onToggle} aria-label={showToken ? 'Hide token' : 'Show token'}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface">
          {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <span role="alert" className="text-[length:var(--text-caption)] text-error">{error}</span>}
    </div>
  );
}

export function SocialChannelForm({ open, mode, channel, onClose }: Props) {
  const { toast } = useToast();
  const createMut = useSocialChannelCreate();
  const updateMut = useSocialChannelUpdate();
  const [platform, setPlatform] = useState('FACEBOOK_PAGE');
  const [externalId, setExternalId] = useState(channel?.externalId ?? '');
  const [name, setName] = useState(channel?.name ?? '');
  const [accessToken, setAccessToken] = useState('');
  const [tokenExpiresAt, setTokenExpiresAt] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isSubmitting = createMut.isPending || updateMut.isPending;

  function resetAndClose() {
    setExternalId(channel?.externalId ?? ''); setName(channel?.name ?? '');
    setAccessToken(''); setTokenExpiresAt(''); setErrors({}); setShowToken(false);
    onClose();
  }

  async function handleSubmit() {
    setErrors({});
    if (mode === 'create') {
      const r = createSchema.safeParse({ platform, externalId, name, accessToken, tokenExpiresAt: tokenExpiresAt || undefined });
      if (!r.success) { setErrors(collectErrors(r.error.issues)); return; }
      try {
        await createMut.mutateAsync({ platform: r.data.platform as SocialChannel['platform'],
          externalId: r.data.externalId, name: r.data.name, accessToken: r.data.accessToken,
          tokenExpiresAt: r.data.tokenExpiresAt ? toIso(r.data.tokenExpiresAt) : undefined });
        toast({ tone: 'success', title: 'Channel added' }); resetAndClose();
      } catch (err) { toast({ tone: 'error', title: 'Failed to add channel', description: (err as Error).message }); }
    } else {
      const r = editSchema.safeParse({ name, accessToken: accessToken || undefined, tokenExpiresAt: tokenExpiresAt || undefined });
      if (!r.success) { setErrors(collectErrors(r.error.issues)); return; }
      try {
        await updateMut.mutateAsync({ id: channel!.id, name: r.data.name,
          accessToken: r.data.accessToken || undefined,
          tokenExpiresAt: r.data.tokenExpiresAt ? toIso(r.data.tokenExpiresAt) : undefined });
        toast({ tone: 'success', title: 'Channel updated' }); resetAndClose();
      } catch (err) { toast({ tone: 'error', title: 'Failed to update channel', description: (err as Error).message }); }
    }
  }

  return (
    <FormDialog open={open} onClose={resetAndClose}
      onSubmit={(e) => { e.preventDefault(); void handleSubmit(); }}
      title={mode === 'create' ? 'Add channel' : 'Edit channel'}
      icon={<Link />} iconAccent="primary"
      submitLabel={mode === 'create' ? 'Add channel' : 'Save changes'}
      isSubmitting={isSubmitting}>
      {mode === 'create' && (
        <div className="flex flex-col gap-1.5">
          <label className="text-[length:var(--text-label)] font-medium text-on-surface-variant">Platform</label>
          <select value={platform} onChange={e => setPlatform(e.target.value)}
            className="h-10 w-full rounded-input border border-outline-variant bg-surface-container-lowest px-3 text-[length:var(--text-body)] text-on-surface focus-visible:border-primary focus-visible:outline-none">
            {PLATFORMS.map(p => (
              <option key={p.value} value={p.value} disabled={!p.enabled}>
                {p.label}{!p.enabled ? ' (coming soon)' : ''}
              </option>
            ))}
          </select>
        </div>
      )}
      {mode === 'create' && (
        <Input label="Page ID (externalId)" placeholder="e.g. 123456789"
          value={externalId} onChange={e => setExternalId(e.target.value)} error={errors.externalId} />
      )}
      <Input label="Channel name" placeholder="e.g. SMIT Fanpage"
        value={name} onChange={e => setName(e.target.value)} error={errors.name} />
      <TokenInput value={accessToken} onChange={setAccessToken}
        showToken={showToken} onToggle={() => setShowToken(v => !v)}
        error={errors.accessToken} mode={mode} />
      <Input label="Token expires at (optional)" type="date"
        value={tokenExpiresAt} onChange={e => setTokenExpiresAt(e.target.value)} error={errors.tokenExpiresAt} />
    </FormDialog>
  );
}
