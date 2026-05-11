import { Target } from 'lucide-react';
import {
  Badge,
  Button,
  EmptyState,
  KpiCard,
  OkrCycleCountdown,
  PageHeader,
  Spinner,
  SurfaceCard,
} from '../design/v4/index.js';
import { useActiveOkrCycle } from '../hooks/use-active-okr-cycle';

export default function OkrsManagementV4() {
  const cycle = useActiveOkrCycle();

  return (
    <div className="flex flex-col gap-comfy">
      <PageHeader
        title="OKR Management"
        subtitle="Objectives, key results, and cycle progress"
        actions={<Button variant="primary" leftIcon={<Target size={16} />}>New Objective</Button>}
      />

      {cycle.isLoading ? (
        <div className="flex items-center justify-center py-vast"><Spinner size="lg" accent /></div>
      ) : cycle.isError ? (
        <SurfaceCard padding="md"><Badge intent="error">Failed to load OKR cycle</Badge></SurfaceCard>
      ) : !cycle.cycle ? (
        <SurfaceCard padding="md">
          <EmptyState
            title="No active OKR cycle"
            description="Start a new cycle to begin tracking objectives and key results."
            action={<Button variant="primary" leftIcon={<Target size={16} />}>Start Cycle</Button>}
          />
        </SurfaceCard>
      ) : (
        <>
          <SurfaceCard padding="md" className="flex flex-wrap items-center justify-between gap-comfy">
            <div>
              <p className="text-caption text-fg-subtle uppercase tracking-widest">Active cycle</p>
              <h3 className="text-h5 font-semibold text-fg tracking-tight">{cycle.cycle.name}</h3>
              <p className="text-body-sm text-fg-muted mt-tight">{cycle.cycle.startDate} → {cycle.cycle.endDate}</p>
            </div>
            <OkrCycleCountdown endDate={cycle.cycle.endDate} />
          </SurfaceCard>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-comfy">
            <KpiCard label="Objectives" value="—" meta="connect objectives endpoint" />
            <KpiCard label="Key Results" value="—" meta="connect key-results endpoint" />
            <KpiCard label="Avg Progress" value="—" meta="connect progress endpoint" />
          </div>

          <SurfaceCard padding="md">
            <EmptyState
              title="Objective list — coming soon"
              description="The v4 OKR list/board UI is scheduled for a follow-up sprint. v3 OKR functionality remains available at /okrs."
            />
          </SurfaceCard>
        </>
      )}
    </div>
  );
}
