import { Button } from './Button';

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <span className="material-symbols-outlined text-5xl text-on-surface/20 mb-4">
        {icon}
      </span>
      <h3 className="text-sm font-semibold text-on-surface/60 mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-on-surface/40 max-w-xs mb-4">{description}</p>
      )}
      {action && (
        <Button variant="outline" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
