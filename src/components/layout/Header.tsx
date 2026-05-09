import { Menu } from 'lucide-react';
import NotificationCenter from './NotificationCenter';

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-40 bg-surface/80 backdrop-blur-md border-b border-outline-variant/5">
      <div className="w-full h-full px-[var(--content-px-mobile)] md:px-[var(--content-px-tablet)] xl:pl-64 xl:pr-[var(--content-px-desktop)] flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={onMenuClick}
            className="xl:hidden w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-50 rounded-xl transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label="Open navigation menu"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Widgets - hidden on mobile */}
        <div className="hidden md:flex items-center gap-2">
          <NotificationCenter />
        </div>
      </div>
    </header>
  );
}
