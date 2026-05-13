import { Monitor, Moon, Rows3, Sun } from 'lucide-react';
import { useDensity, type Density } from '../../../contexts/density-context';
import { useTheme, type Theme } from '../../../contexts/theme-context';
import { Card, TabPill } from '../ui';
import type { TabPillItem } from '../ui';

const themeItems: TabPillItem<Theme>[] = [
  { value: 'dark', label: 'Dark', icon: <Moon /> },
  { value: 'light', label: 'Light', icon: <Sun /> },
  { value: 'system', label: 'System', icon: <Monitor /> },
];

const densityItems: TabPillItem<Density>[] = [
  { value: 'comfortable', label: 'Comfortable', icon: <Rows3 /> },
  { value: 'compact', label: 'Compact', icon: <Rows3 /> },
];

export function SettingsAppearanceTab() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { density, setDensity } = useDensity();

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card padding="lg" glow>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-text-muted">Theme</p>
        <h2 className="mt-2 font-headline text-2xl font-black text-text-1">Visual mode</h2>
        <p className="mt-2 text-sm font-medium text-text-2">Resolved hiện tại: {resolvedTheme}</p>
        <div className="mt-5 overflow-x-auto pb-1">
          <TabPill<Theme> label="Theme mode" value={theme} onChange={setTheme} items={themeItems} />
        </div>
      </Card>

      <Card padding="lg" glow>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-text-muted">Density</p>
        <h2 className="mt-2 font-headline text-2xl font-black text-text-1">Workspace spacing</h2>
        <p className="mt-2 text-sm font-medium text-text-2">Điều chỉnh độ dày UI cho dashboard vận hành.</p>
        <div className="mt-5 overflow-x-auto pb-1">
          <TabPill<Density> label="Density mode" value={density} onChange={setDensity} items={densityItems} />
        </div>
      </Card>
    </div>
  );
}
