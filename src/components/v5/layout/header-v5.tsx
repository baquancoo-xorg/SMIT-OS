import { Menu, Moon, Rows3, Sun } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useDensity } from '../../../contexts/density-context';
import { useTheme } from '../../../contexts/theme-context';
import NotificationCenter from '../../layout/NotificationCenter';
import { findNavGroup, findNavItem } from './workspace-nav-items';

interface HeaderV5Props {
  onMenuClick: () => void;
}

function resolveBreadcrumb(pathname: string) {
  const item = findNavItem(pathname);
  if (!item) return { workspace: 'Workspace', page: 'Command Center' };
  const group = findNavGroup(item.workspace);
  return { workspace: group?.label ?? 'Workspace', page: item.label };
}

export default function HeaderV5({ onMenuClick }: HeaderV5Props) {
  const location = useLocation();
  const { resolvedTheme, setTheme } = useTheme();
  const { density, setDensity } = useDensity();
  const breadcrumb = resolveBreadcrumb(location.pathname);

  return (
    <header className="sticky top-0 z-header h-[var(--header-h)] border-b border-border bg-bg/82 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between gap-4 px-4 md:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="touch-target flex items-center justify-center rounded-full border border-border bg-surface text-text-2 transition hover:text-accent-text xl:hidden"
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 truncate text-xs font-bold uppercase tracking-[0.18em] text-text-muted">
              <span className="truncate">{breadcrumb.workspace}</span>
              <span className="text-accent">/</span>
            </div>
            <h1 className="truncate text-lg font-black tracking-tight text-text-1 md:text-xl">{breadcrumb.page}</h1>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setDensity(density === 'comfortable' ? 'compact' : 'comfortable')}
            className="hidden h-10 items-center gap-2 rounded-full border border-border bg-surface px-3 text-xs font-bold text-text-2 transition hover:text-accent-text md:flex"
            aria-label="Toggle density"
          >
            <Rows3 size={16} />
            <span>{density === 'comfortable' ? 'Comfort' : 'Compact'}</span>
          </button>
          <button
            type="button"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="touch-target flex items-center justify-center rounded-full border border-border bg-surface px-3 text-text-2 transition hover:text-accent-text"
            aria-label="Toggle theme"
          >
            {resolvedTheme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <NotificationCenter />
        </div>
      </div>
    </header>
  );
}
