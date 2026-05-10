export const TYPE_COLORS: Record<string, string> = {
  Epic: 'bg-purple-100 text-purple-700 border-purple-200',
  UserStory: 'bg-blue-100 text-blue-700 border-blue-200',
  TechTask: 'bg-surface-variant/60 text-on-surface border-outline-variant/40',
  Campaign: 'bg-orange-100 text-orange-700 border-orange-200',
  MktTask: 'bg-warning-container/40 text-warning border-warning-container/60',
  MediaTask: 'bg-pink-100 text-pink-700 border-pink-200',
  SaleTask: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Deal: 'bg-emerald-100 text-emerald-700 border-emerald-200',
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
  Review: 'bg-purple-50 text-purple-600 border-purple-100',
  Done: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  Won: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  Void: 'bg-warning-container/30 text-warning border-warning-container/40',
};

export const TEAM_COLORS: Record<string, string> = {
  tech: 'border-indigo-500',
  marketing: 'border-orange-500',
  media: 'border-pink-500',
  sale: 'border-emerald-500',
};
