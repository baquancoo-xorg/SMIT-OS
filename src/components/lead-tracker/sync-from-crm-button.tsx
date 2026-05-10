import { RefreshCcw } from 'lucide-react';
import { Button } from '../ui/v2';

interface SyncFromCrmButtonProps {
  canSync: boolean;
  isSyncing: boolean;
  isRunning: boolean;
  onSync: () => void;
}

/**
 * "Sync from CRM" trigger button (admin only).
 *
 * Phase 8 follow-up (2026-05-10): migrated to v2 Button (in-place, API identical).
 */
export default function SyncFromCrmButton({ canSync, isSyncing, isRunning, onSync }: SyncFromCrmButtonProps) {
  if (!canSync) return null;

  const busy = isSyncing || isRunning;

  return (
    <Button
      variant="secondary"
      size="md"
      iconLeft={<RefreshCcw className={busy ? 'animate-spin' : undefined} />}
      onClick={onSync}
      disabled={busy}
      title="Sync leads from CRM"
    >
      {busy ? 'Syncing...' : 'Sync from CRM'}
    </Button>
  );
}
