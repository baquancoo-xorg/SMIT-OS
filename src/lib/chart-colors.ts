// Chart colors using CSS variables for theme consistency
export const chartColors = {
  primary: 'var(--color-primary)',
  secondary: 'var(--color-secondary)',
  tertiary: 'var(--color-tertiary)',
  error: 'var(--color-error)',
  surface: 'var(--color-surface)',
  surfaceContainer: 'var(--color-surface-container)',
  onSurface: 'var(--color-on-surface)',
  outline: 'var(--color-outline)',
};

// Fallback hex values for libraries that don't support CSS variables
export const chartColorsHex = {
  primary: '#0059b6',
  secondary: '#a03a0f',
  tertiary: '#006b1f',
  error: '#b31b25',
  surface: '#f7f5ff',
  surfaceContainer: '#e4e7ff',
  onSurface: '#222d51',
  outline: '#4a5580',
};
