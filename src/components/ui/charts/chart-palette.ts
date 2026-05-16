// ui-canon-ok: Chart palette bridges design tokens to Recharts (hex required)
// Recharts requires hex/rgb values, not CSS vars, so we bridge tokens here

import { brandTokens, themeTokens } from '../../../design/tokens';

export const chartColors = {
  // Sequential brand palette (8 colors for multi-series)
  series: [
    brandTokens.brand500, // Primary orange
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Amber
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#84cc16', // Lime
  ],

  // Semantic colors
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Theme-aware colors (call with current theme)
  getThemeColors: (theme: 'dark' | 'light') => ({
    text: theme === 'dark' ? themeTokens.dark.text2 : themeTokens.light.text2,
    grid: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    axis: theme === 'dark' ? themeTokens.dark.text2 : themeTokens.light.text2,
    tooltip: {
      bg: theme === 'dark' ? themeTokens.dark.surface2 : themeTokens.light.surface,
      border: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      text: theme === 'dark' ? themeTokens.dark.text1 : themeTokens.light.text1,
    },
  }),
} as const;

// Colorblind-safe patterns for line charts
export const linePatterns = {
  solid: undefined,
  dashed: '5 5',
  dotted: '2 2',
  dashDot: '5 2 2 2',
} as const;

// Colorblind-safe bar patterns (CSS-based, for bar fill)
export const barPatternIds = [
  'chart-pattern-solid',
  'chart-pattern-diagonal',
  'chart-pattern-dots',
  'chart-pattern-cross',
] as const;

export type ChartColorIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
