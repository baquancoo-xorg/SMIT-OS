import { formatDistanceToNow } from 'date-fns';
import { Badge } from '../ui';

type LeadSyncStatus = {
  id: string;
  startedAt: string;
  finishedAt: string | null;
  status: string;
};

interface LastSyncIndicatorProps {
  status: LeadSyncStatus | null | undefined;
}

/**
 * Inline status indicator showing last CRM sync time + state.
 *
 * Phase 8 follow-up (2026-05-10): migrated to v2 Badge variants (in-place, API identical).
 *  - failed → error variant
 *  - running → warning variant
 *  - other → success variant
 */
export default function LastSyncIndicator({ status }: LastSyncIndicatorProps) {
  if (!status) {
    return <Badge variant="neutral">No sync yet</Badge>;
  }

  const when = status.finishedAt ?? status.startedAt;
  const distance = formatDistanceToNow(new Date(when), { addSuffix: true });

  const variant: 'error' | 'warning' | 'success' =
    status.status === 'failed' ? 'error' : status.status === 'running' ? 'warning' : 'success';

  return <Badge variant={variant}>Last sync: {distance}</Badge>;
}
