/**
 * IntegrationsManagement.tsx — Admin page for SocialChannel CRUD.
 * Route: /integrations (admin-only)
 */
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocialChannelsList } from '../../hooks/use-social-channels';
import type { SocialChannel } from '../../hooks/use-social-channels';
import { SocialChannelList } from '../../components/v5/integrations/social-channel-list';
import { SocialChannelForm } from '../../components/v5/integrations/social-channel-form';
import { Button } from '../../components/v5/ui/button';
import { Skeleton } from '../../components/v5/ui/skeleton';

export default function IntegrationsManagement() {
  const { currentUser } = useAuth();

  if (!currentUser?.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <IntegrationsContent />;
}

function IntegrationsContent() {
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
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-text-1">Integrations</h1>
          <p className="mt-1 text-sm text-text-muted">Manage social channel connections for media tracking.</p>
        </div>
        <Button variant="primary" size="md" iconLeft={<Plus />} onClick={openAdd}>
          Add channel
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20 w-full rounded-card" />
          <Skeleton className="h-20 w-full rounded-card" />
        </div>
      ) : error ? (
        <div className="rounded-card border border-error/30 bg-error-container p-4 text-sm text-on-error-container">
          Failed to load channels: {(error as Error).message}
        </div>
      ) : (
        <SocialChannelList
          channels={channels ?? []}
          onEdit={openEdit}
          onAdd={openAdd}
        />
      )}

      {/* Add / Edit dialog */}
      <SocialChannelForm
        open={formOpen}
        mode={editTarget ? 'edit' : 'create'}
        channel={editTarget}
        onClose={closeForm}
      />
    </div>
  );
}
