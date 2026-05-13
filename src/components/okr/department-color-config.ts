export interface DeptColorSet {
  bg: string;
  text: string;
  border: string;
  icon: string;
  onIcon: string;
  badge: string;
}

const DEPT_COLORS: Record<string, DeptColorSet> = {
  BOD: {
    bg: 'bg-primary/5',
    text: 'text-primary',
    border: 'border-primary/10',
    icon: 'bg-primary',
    onIcon: 'text-on-primary',
    badge: 'bg-primary-container/40 text-primary border-primary-container/60',
  },
  Sale: {
    bg: 'bg-success-container/40',
    text: 'text-success',
    border: 'border-success-container/60',
    icon: 'bg-success',
    onIcon: 'text-on-success',
    badge: 'bg-success-container/40 text-success border-success-container/60',
  },
  Tech: {
    bg: 'bg-info-container/40',
    text: 'text-info',
    border: 'border-info-container/60',
    icon: 'bg-info',
    onIcon: 'text-on-info',
    badge: 'bg-info-container/40 text-info border-info-container/60',
  },
  Marketing: {
    bg: 'bg-primary-container/40',
    text: 'text-primary',
    border: 'border-primary-container/60',
    icon: 'bg-primary',
    onIcon: 'text-on-primary',
    badge: 'bg-primary-container/40 text-primary border-primary-container/60',
  },
  Media: {
    bg: 'bg-secondary-container/40',
    text: 'text-secondary',
    border: 'border-secondary-container/60',
    icon: 'bg-secondary',
    onIcon: 'text-on-secondary',
    badge: 'bg-secondary-container/40 text-secondary border-secondary-container/60',
  },
};

export function getDeptColor(department: string): DeptColorSet {
  return DEPT_COLORS[department] || DEPT_COLORS.BOD;
}

/** Status threshold helpers — match v1 logic exactly. */
export function getOkrStatus(progress: number): 'Off Track' | 'At Risk' | 'On Track' {
  if (progress < 30) return 'Off Track';
  if (progress < 70) return 'At Risk';
  return 'On Track';
}

export interface CriticalPathHealth {
  status: string;
  color: string;
  bgColor: string;
  message: string;
}

export function getCriticalPathHealth(objectives: { progressPercentage: number }[]): CriticalPathHealth {
  if (objectives.length === 0) {
    return { status: 'No Data', color: 'text-on-surface-variant', bgColor: 'bg-on-surface-variant', message: 'No objectives' };
  }

  const offTrack = objectives.filter((obj) => obj.progressPercentage < 30).length;
  const atRisk = objectives.filter((obj) => obj.progressPercentage >= 30 && obj.progressPercentage < 70).length;
  const onTrack = objectives.filter((obj) => obj.progressPercentage >= 70).length;

  const offTrackPct = (offTrack / objectives.length) * 100;
  const atRiskPct = (atRisk / objectives.length) * 100;

  if (offTrackPct > 30) {
    return { status: 'Critical', color: 'text-error', bgColor: 'bg-error', message: `${offTrack} objectives off track` };
  }
  if (offTrackPct > 10 || atRiskPct > 50) {
    return { status: 'At Risk', color: 'text-warning', bgColor: 'bg-warning', message: `${atRisk} objectives at risk` };
  }
  if (onTrack === objectives.length) {
    return { status: 'Excellent', color: 'text-success', bgColor: 'bg-success', message: 'All on track' };
  }
  return { status: 'Stable', color: 'text-tertiary', bgColor: 'bg-tertiary', message: 'System normal' };
}

/** Q2 deadline countdown — match v1 logic. */
export function getQ2Deadline(): { daysLeft: number; deadline: Date } {
  const now = new Date();
  const year = now.getMonth() > 5 ? now.getFullYear() + 1 : now.getFullYear();
  const q2End = new Date(year, 5, 30); // June 30
  const diffTime = q2End.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return { daysLeft: Math.max(0, diffDays), deadline: q2End };
}
