/**
 * IntegrationsTab — admin-only Settings sub-tab for SocialChannel CRUD.
 * Pulled from former /integrations route page.
 */
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useSocialChannelsList } from '../../../hooks/use-social-channels';
import type { SocialChannel } from '../../../hooks/use-social-channels';
import { SocialChannelList } from '../integrations/social-channel-list';
import { SocialChannelForm } from '../integrations/social-channel-form';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';

export function IntegrationsTab() {
  const { data: channels, isLoading, error } = useSocialChannelsList();
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<SocialChannel | undefined>();

  function openAdd() {
    setEditTarget(undefined);
    setFormOpen(true);
  }

  function openEdit(channel: SocialChannel) {
    setEditTarget(channel);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditTarget(undefined);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline text-2xl font-extrabold tracking-tight text-text-1">Integrations</h2>
          <p className="mt-1 text-sm text-text-muted">Manage social channel connections for media tracking.</p>
        </div>
        <Button variant="primary" size="md" iconLeft={<Plus />} onClick={openAdd} splitLabel={{ action: 'Add', object: 'Channel' }} />
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20 w-full rounded-card" />
          <Skeleton className="h-20 w-full rounded-card" />
        </div>
      ) : error ? (
        <div className="rounded-card border border-error/30 bg-error-container p-4 text-sm text-on-error-container" role="alert">
          Failed to load channels: {(error as Error).message}
        </div>
      ) : (
        <SocialChannelList channels={channels ?? []} onEdit={openEdit} onAdd={openAdd} />
      )}

      <SocialChannelForm
        open={formOpen}
        mode={editTarget ? 'edit' : 'create'}
        channel={editTarget}
        onClose={closeForm}
      />
    </div>
  );
}
