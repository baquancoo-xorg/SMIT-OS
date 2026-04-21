import React from 'react';

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  iconColor?: string;
  iconBg?: string;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  icon,
  title,
  subtitle,
  iconColor = 'text-primary',
  iconBg = 'bg-primary/10',
  action,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl ${iconBg}`}>
          <span className={iconColor}>{icon}</span>
        </div>
        <div>
          <h3 className="font-semibold text-on-surface">{title}</h3>
          {subtitle && <p className="text-sm text-on-surface-variant">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};
