export const THEME_STORAGE_KEY = 'smit-theme';
export const DENSITY_STORAGE_KEY = 'smit-density';

export const brandTokens = {
  brand300: '#ffb27c',
  brand400: '#ff8f50',
  brand500: '#ff6d29',
  brand600: '#d95716',
  warm950: '#0d0d0d',
  warm900: '#161316',
  warm800: '#211c19',
  warm700: '#453027',
} as const;

export const themeTokens = {
  dark: {
    background: '#0d0d0d',
    surface: '#161316',
    surface2: '#211c19',
    text1: '#fffaf5',
    text2: '#c9beb5',
    accent: '#ff6d29',
    accentText: '#ff8f50',
  },
  light: {
    background: '#f7f1ea',
    surface: '#fffaf5',
    surface2: '#f0e7dc',
    text1: '#171412',
    text2: '#51463f',
    accent: '#d95716',
    accentText: '#a13d0f',
  },
} as const;

export const v5DensityTokens = {
  comfortable: {
    space: '1rem',
    rowMin: '48px',
  },
  compact: {
    space: '0.75rem',
    rowMin: '40px',
  },
} as const;
