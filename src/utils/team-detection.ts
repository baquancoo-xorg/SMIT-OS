import { TeamType } from '../types/daily-report-metrics';

// Map department names to team types
const DEPARTMENT_TEAM_MAP: Record<string, TeamType> = {
  'Tech': 'tech',
  'Tech & Product': 'tech',
  'Product': 'tech',
  'Marketing': 'marketing',
  'MKT': 'marketing',
  'Media': 'media',
  'Content': 'media',
  'Sale': 'sale',
  'Sales': 'sale',
  'CS': 'sale',
};

/**
 * Detect team type from user's departments array
 * Returns first matching team or 'tech' as default
 */
export function detectTeam(departments: string[]): TeamType {
  for (const dept of departments) {
    const mapped = DEPARTMENT_TEAM_MAP[dept];
    if (mapped) return mapped;
  }
  return 'tech'; // default fallback
}

/**
 * Get display name for team type
 */
export function getTeamDisplayName(teamType: TeamType): string {
  const names: Record<TeamType, string> = {
    tech: 'Tech & Product',
    marketing: 'Marketing',
    media: 'Media',
    sale: 'Sale',
  };
  return names[teamType];
}

/**
 * Get team color classes
 */
export function getTeamColors(teamType: TeamType) {
  const colors: Record<TeamType, { bg: string; text: string; border: string; accent: string }> = {
    tech: {
      bg: 'bg-indigo-600',
      text: 'text-indigo-600',
      border: 'border-indigo-500',
      accent: 'bg-indigo-50',
    },
    marketing: {
      bg: 'bg-orange-600',
      text: 'text-orange-600',
      border: 'border-orange-500',
      accent: 'bg-orange-50',
    },
    media: {
      bg: 'bg-pink-600',
      text: 'text-pink-600',
      border: 'border-pink-500',
      accent: 'bg-pink-50',
    },
    sale: {
      bg: 'bg-emerald-600',
      text: 'text-emerald-600',
      border: 'border-emerald-500',
      accent: 'bg-emerald-50',
    },
  };
  return colors[teamType];
}
