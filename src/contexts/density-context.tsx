import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { DENSITY_STORAGE_KEY } from '../design';

export type Density = 'comfortable' | 'compact';

interface DensityContextValue {
  density: Density;
  setDensity: (density: Density) => void;
}

const DensityContext = createContext<DensityContextValue | null>(null);

function getInitialDensity(defaultDensity: Density): Density {
  if (typeof window === 'undefined') return defaultDensity;
  const storedDensity = window.localStorage.getItem(DENSITY_STORAGE_KEY);
  return storedDensity === 'comfortable' || storedDensity === 'compact'
    ? storedDensity
    : defaultDensity;
}

interface DensityProviderProps {
  children: ReactNode;
  defaultDensity?: Density;
}

export function DensityProvider({ children, defaultDensity = 'comfortable' }: DensityProviderProps) {
  const [density, setDensityState] = useState<Density>(() => getInitialDensity(defaultDensity));

  useEffect(() => {
    document.documentElement.dataset.density = density;
  }, [density]);

  const setDensity = useCallback((nextDensity: Density) => {
    window.localStorage.setItem(DENSITY_STORAGE_KEY, nextDensity);
    setDensityState(nextDensity);
  }, []);

  const value = useMemo(() => ({ density, setDensity }), [density, setDensity]);

  return <DensityContext.Provider value={value}>{children}</DensityContext.Provider>;
}

export function useDensity() {
  const context = useContext(DensityContext);
  if (!context) {
    throw new Error('useDensity must be used within DensityProvider');
  }
  return context;
}
