/**
 * Department-specific color configuration cho OKR cards.
 *
 * Tech: #0059B6 / Marketing: #F54A00 / Media: #E60076 / Sale: #009966 / BOD: primary
 *
 * Trích từ v1 OKRsManagement.tsx (line 21-31). Giữ hex hardcoded để đồng bộ
 * với accordion cards reused từ v1. Phase 8 polish có thể chuyển sang semantic
 * tokens.
 */
export interface DeptColorSet {
  bg: string;
  text: string;
  border: string;
  icon: string;
  badge: string;
}

const DEPT_COLORS: Record<string, DeptColorSet> = {
  BOD: {
    bg: 'bg-primary/5',
    text: 'text-primary',
    border: 'border-primary/10',
    icon: 'bg-primary',
    badge: 'bg-primary-fixed text-on-primary-fixed border-primary/10',
  },
  Sale: {
    bg: 'bg-[#009966]/10',
    text: 'text-[#009966]',
    border: 'border-[#009966]/20',
    icon: 'bg-[#009966]',
    badge: 'bg-[#009966]/10 text-[#009966] border-[#009966]/20',
  },
  Tech: {
    bg: 'bg-[#0059B6]/10',
    text: 'text-[#0059B6]',
    border: 'border-[#0059B6]/20',
    icon: 'bg-[#0059B6]',
    badge: 'bg-[#0059B6]/10 text-[#0059B6] border-[#0059B6]/20',
  },
  Marketing: {
    bg: 'bg-[#F54A00]/10',
    text: 'text-[#F54A00]',
    border: 'border-[#F54A00]/20',
    icon: 'bg-[#F54A00]',
    badge: 'bg-[#F54A00]/10 text-[#F54A00] border-[#F54A00]/20',
  },
  Media: {
    bg: 'bg-[#E60076]/10',
    text: 'text-[#E60076]',
    border: 'border-[#E60076]/20',
    icon: 'bg-[#E60076]',
    badge: 'bg-[#E60076]/10 text-[#E60076] border-[#E60076]/20',
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
