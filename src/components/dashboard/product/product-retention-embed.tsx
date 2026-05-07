import DashboardPanel from '../ui/dashboard-panel';
import DashboardSectionTitle from '../ui/dashboard-section-title';
import DashboardEmptyState from '../ui/dashboard-empty-state';

const RETENTION_URL = import.meta.env.VITE_POSTHOG_RETENTION_INSIGHT_URL;

export function ProductRetentionEmbed() {
  if (!RETENTION_URL) {
    return (
      <DashboardPanel className="p-6">
        <DashboardSectionTitle>Retention Cohort</DashboardSectionTitle>
        <DashboardEmptyState description="Retention insight chưa được cấu hình" />
      </DashboardPanel>
    );
  }

  return (
    <DashboardPanel className="p-6">
      <DashboardSectionTitle>Retention Cohort</DashboardSectionTitle>
      <iframe
        src={RETENTION_URL}
        sandbox="allow-scripts allow-same-origin"
        className="w-full h-[400px] rounded-lg border border-gray-200 mt-4"
        loading="lazy"
        title="PostHog Retention"
      />
    </DashboardPanel>
  );
}
