import { Inbox } from 'lucide-react';
import { EmptyState } from '../../v5/ui';

/**
 * Dashboard empty state — shown trong tab placeholder hoặc data-not-ready state.
 *
 * Phase 8 follow-up batch 10 (2026-05-11): migrated to v2 EmptyState (decorative
 * blob signature). API identical.
 */

interface DashboardEmptyStateProps {
  title?: string;
  description?: string;
}

export default function DashboardEmptyState({
  title = 'Coming soon',
  description = 'Nội dung cho tab này sẽ được cập nhật trong giai đoạn tiếp theo.',
}: DashboardEmptyStateProps) {
  return <EmptyState icon={<Inbox />} title={title} description={description} variant="card" decorative />;
}
