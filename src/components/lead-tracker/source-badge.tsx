import { Database } from 'lucide-react';
import { Badge } from '../ui/v2';

interface SourceBadgeProps {
  synced?: boolean;
  className?: string;
}

/**
 * Source provenance badge for leads.
 *
 * Phase 8 follow-up (2026-05-10): migrated to v2 Badge primitive (in-place,
 * API identical). Both v1 + v2 LeadTracker pages benefit from consistent styling.
 */
export default function SourceBadge({ synced, className }: SourceBadgeProps) {
  if (synced) {
    return (
      <Badge variant="info" iconLeft={<Database />} className={className}>
        CRM
      </Badge>
    );
  }

  return (
    <Badge variant="neutral" className={className}>
      Manual
    </Badge>
  );
}
