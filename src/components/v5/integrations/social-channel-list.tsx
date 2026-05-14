/**
 * social-channel-list.tsx — Renders SocialChannel rows with actions.
 */
import { useState } from 'react';
import { Facebook, Globe, Loader2 } from 'lucide-react';
import type { SocialChannel } from '../../../hooks/use-social-channels';
import { useSocialChannelTest, useSocialChannelDeactivate } from '../../../hooks/use-social-channels';
import { SocialChannelExpiryBadge } from './social-channel-expiry-badge';
import { Button } from '../ui/button';
import { useToast } from '../ui/notification-toast';

interface Props {
  channels: SocialChannel[];
  onEdit: (channel: SocialChannel) => void;
  onAdd: () => void;
}

function PlatformIcon({ platform }: { platform: string }) {
  if (platform === 'FACEBOOK_PAGE' || platform === 'FACEBOOK_GROUP') {
    return <Facebook size={18} className="shrink-0 text-[#1877F2]" />;
  }
  return <Globe size={18} className="shrink-0 text-on-surface-variant" />;
}

function PlatformLabel({ platform }: { platform: string }) {
  const map: Record<string, string> = {
    FACEBOOK_PAGE: 'Facebook Page',
    FACEBOOK_GROUP: 'Facebook Group',
    INSTAGRAM: 'Instagram',
    TIKTOK: 'TikTok',
    YOUTUBE: 'YouTube',
    THREADS: 'Threads',
  };
  return <>{map[platform] ?? platform}</>;
}

function ChannelRow({ channel, onEdit }: { channel: SocialChannel; onEdit: (c: SocialChannel) => void }) {
  const { toast } = useToast();
  const testMutation = useSocialChannelTest();
  const deactivateMutation = useSocialChannelDeactivate();
  const [confirming, setConfirming] = useState(false);

  async function handleTest() {
    try {
      const result = await testMutation.mutateAsync(channel.id);
      if (result.ok) {
        toast({ tone: 'success', title: 'Connection OK', description: result.pageName ? `Page: ${result.pageName}` : undefined });
      } else {
        toast({ tone: 'error', title: 'Test failed', description: result.error });
      }
    } catch (err) {
      toast({ tone: 'error', title: 'Test failed', description: (err as Error).message });
    }
  }

  async function handleDeactivate() {
    if (!confirming) { setConfirming(true); return; }
    try {
      await deactivateMutation.mutateAsync(channel.id);
      toast({ tone: 'info', title: 'Channel deactivated' });
    } catch (err) {
      toast({ tone: 'error', title: 'Deactivate failed', description: (err as Error).message });
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-card border border-border bg-surface-2 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <PlatformIcon platform={channel.platform} />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-text-1">{channel.name}</p>
          <p className="text-xs text-text-muted">
            <PlatformLabel platform={channel.platform} /> · ID: {channel.externalId}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <SocialChannelExpiryBadge tokenExpiresAt={channel.tokenExpiresAt} />
        <Button size="sm" variant="ghost" onClick={handleTest} disabled={testMutation.isPending}>
          {testMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : 'Test'}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onEdit(channel)}>Edit</Button>
        <Button
          size="sm"
          variant={confirming ? 'destructive' : 'ghost'}
          onClick={handleDeactivate}
          disabled={deactivateMutation.isPending}
        >
          {confirming ? 'Confirm?' : 'Deactivate'}
        </Button>
      </div>
    </div>
  );
}

export function SocialChannelList({ channels, onEdit, onAdd }: Props) {
  if (channels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-card border border-dashed border-border bg-surface py-16 text-center">
        <Facebook size={32} className="text-text-muted opacity-40" />
        <div>
          <p className="text-sm font-semibold text-text-1">No channels yet</p>
          <p className="mt-1 text-xs text-text-muted">Add your first FB Fanpage to start tracking media.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={onAdd}>Add channel</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {channels.map(ch => (
        <ChannelRow key={ch.id} channel={ch} onEdit={onEdit} />
      ))}
    </div>
  );
}
