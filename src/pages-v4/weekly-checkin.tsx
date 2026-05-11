import { ClipboardList } from 'lucide-react';
import {
  Button,
  EmptyState,
  PageHeader,
  SurfaceCard,
} from '../design/v4/index.js';

export default function WeeklyCheckinV4() {
  return (
    <div className="flex flex-col gap-comfy">
      <PageHeader
        title="Weekly Checkin"
        subtitle="Submit and review weekly check-ins"
        actions={<Button variant="primary" leftIcon={<ClipboardList size={16} />}>New Checkin</Button>}
      />
      <SurfaceCard padding="md">
        <EmptyState
          title="Weekly Checkin v4 — coming soon"
          description="The v4 redesign for weekly check-ins is scheduled for a follow-up sprint. v3 functionality remains available at /checkin."
          action={
            <Button variant="ghost" onClick={() => window.location.assign('/checkin')}>
              Open v3 Weekly Checkin
            </Button>
          }
        />
      </SurfaceCard>
    </div>
  );
}
