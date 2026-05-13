export const TYPE_COLORS: Record<string, string> = {
  Epic: 'bg-secondary-container/40 text-secondary border-secondary-container/60',
  UserStory: 'bg-info-container/40 text-info border-info-container/60',
  TechTask: 'bg-surface-variant/60 text-on-surface border-outline-variant/40',
  Campaign: 'bg-primary-container/40 text-primary border-primary-container/60',
  MktTask: 'bg-warning-container/40 text-warning border-warning-container/60',
  MediaTask: 'bg-secondary-container/40 text-secondary border-secondary-container/60',
  SaleTask: 'bg-success-container/40 text-success border-success-container/60',
  Deal: 'bg-success-container/40 text-success border-success-container/60',
  DealLost: 'bg-error-container/40 text-error border-error-container/60',
};

export const PRIORITY_COLORS: Record<string, string> = {
  Low: 'bg-surface-variant/60 text-on-surface-variant',
  Medium: 'bg-primary/10 text-primary',
  High: 'bg-secondary/10 text-secondary',
  Urgent: 'bg-error/10 text-error',
};

export const STATUS_COLORS: Record<string, string> = {
  Backlog: 'bg-surface-variant/30 text-on-surface-variant border-outline-variant/40',
  Todo: 'bg-surface-variant/30 text-on-surface-variant border-outline-variant/40',
  Active: 'bg-primary/5 text-primary border-primary/10',
  Doing: 'bg-primary/5 text-primary border-primary/10',
  Review: 'bg-secondary-container/40 text-secondary border-secondary-container/60',
  Done: 'bg-success-container/40 text-success border-success-container/60',
  Won: 'bg-success-container/40 text-success border-success-container/60',
  Void: 'bg-warning-container/30 text-warning border-warning-container/40',
};

export const TEAM_COLORS: Record<string, string> = {
  tech: 'border-indigo-500',
  marketing: 'border-orange-500',
  media: 'border-pink-500',
  sale: 'border-success',
};
