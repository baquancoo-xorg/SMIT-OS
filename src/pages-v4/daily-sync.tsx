import { Plus } from 'lucide-react';
import {
  Button,
  EmptyState,
  PageHeader,
  SurfaceCard,
} from '../design/v4/index.js';

export default function DailySyncV4() {
  return (
    <div className="flex flex-col gap-comfy">
      <PageHeader
        actions={<Button variant="primary" leftIcon={<Plus size={16} />}>Submit Report</Button>}
      />
      <SurfaceCard padding="md">
        <EmptyState
          title="Daily Sync v4 — coming soon"
          description="The v4 redesign for daily reports is scheduled for a follow-up sprint. v3 functionality remains available at /daily-sync."
          action={
            <Button variant="ghost" onClick={() => window.location.assign('/daily-sync')}>
              Open v3 Daily Sync
            </Button>
          }
        />
      </SurfaceCard>
    </div>
  );
}
