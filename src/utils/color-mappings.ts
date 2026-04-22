export const TYPE_COLORS: Record<string, string> = {
  Epic: 'bg-purple-100 text-purple-700 border-purple-200',
  UserStory: 'bg-blue-100 text-blue-700 border-blue-200',
  TechTask: 'bg-slate-100 text-slate-700 border-slate-200',
  Campaign: 'bg-orange-100 text-orange-700 border-orange-200',
  MktTask: 'bg-amber-100 text-amber-700 border-amber-200',
  MediaTask: 'bg-pink-100 text-pink-700 border-pink-200',
  SaleTask: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Deal: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  DealLost: 'bg-rose-100 text-rose-700 border-rose-200',
};

export const PRIORITY_COLORS: Record<string, string> = {
  Low: 'bg-slate-100 text-slate-500',
  Medium: 'bg-primary/10 text-primary',
  High: 'bg-secondary/10 text-secondary',
  Urgent: 'bg-error/10 text-error',
};

export const STATUS_COLORS: Record<string, string> = {
  Backlog: 'bg-slate-50 text-slate-500 border-slate-100',
  Todo: 'bg-slate-50 text-slate-500 border-slate-100',
  Active: 'bg-primary/5 text-primary border-primary/10',
  Doing: 'bg-primary/5 text-primary border-primary/10',
  Review: 'bg-purple-50 text-purple-600 border-purple-100',
  Done: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  Won: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  Void: 'bg-yellow-50 text-yellow-600 border-yellow-100',
};

export const TEAM_COLORS: Record<string, string> = {
  tech: 'border-indigo-500',
  marketing: 'border-orange-500',
  media: 'border-pink-500',
  sale: 'border-emerald-500',
};
