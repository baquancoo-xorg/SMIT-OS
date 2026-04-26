import DashboardPanel from './dashboard-panel';

interface DashboardEmptyStateProps {
  title?: string;
  description?: string;
}

export default function DashboardEmptyState({
  title = 'Coming soon',
  description = 'Nội dung cho tab này sẽ được cập nhật trong giai đoạn tiếp theo.',
}: DashboardEmptyStateProps) {
  return (
    <DashboardPanel className="p-8 md:p-10 text-center">
      <h3 className="text-lg font-bold text-on-surface">{title}</h3>
      <p className="mt-2 text-sm text-on-surface-variant">{description}</p>
    </DashboardPanel>
  );
}
