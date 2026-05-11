import type { ReactNode } from 'react';
import { Menu } from 'lucide-react';

export interface HeaderProps {
  /** Logo / brand mark slot. Hidden on lg+ if Sidebar already shows it. Use `showLogoLg` to override. */
  logo?: ReactNode;
  showLogoLg?: boolean;
  /** Breadcrumb slot (typically a `<nav>` with crumbs). Center area. */
  breadcrumb?: ReactNode;
  /** Right-side slot — usually NotificationCenter.Trigger + DropdownMenu (user). */
  rightSlot?: ReactNode;
  /** Center-right slot for cycle countdown widget. */
  countdown?: ReactNode;
  /** Mobile hamburger trigger handler. Hidden on lg+. */
  onMobileMenuClick?: () => void;
  className?: string;
}

/**
 * Header v2 — top app bar.
 *
 * Mobile: hamburger + logo + right slot.
 * Desktop: logo (optional) + breadcrumb + countdown + right slot.
 *
 * Wraps in `<header>` with `z-header` token. Height fixed via `--header-h` token (4rem).
 *
 * @example
 * <Header
 *   logo={<Logo />}
 *   breadcrumb={<PageHeader breadcrumb={[...]} title="OKRs" />}
 *   countdown={<OkrCycleCountdown deadline={...} cycleLabel="Q2 2026" />}
 *   rightSlot={
 *     <>
 *       <NotificationCenter.Trigger count={3} onClick={openNotifications} />
 *       <DropdownMenu trigger={<UserAvatar />} items={...} />
 *     </>
 *   }
 *   onMobileMenuClick={openMobileSidebar}
 * />
 */
export function Header({
  logo,
  showLogoLg = false,
  breadcrumb,
  rightSlot,
  countdown,
  onMobileMenuClick,
  className = '',
}: HeaderProps) {
  return (
    <header
      role="banner"
      style={{ height: 'var(--header-h)' }}
      className={[
        'flex shrink-0 items-center gap-3 border-b border-outline-variant/40',
        'bg-white/80 backdrop-blur-md z-header sticky top-0',
        'px-3 sm:px-5',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {onMobileMenuClick && (
        <button
          type="button"
          aria-label="Open navigation"
          onClick={onMobileMenuClick}
          className="lg:hidden inline-flex size-9 items-center justify-center rounded-button text-on-surface-variant hover:bg-surface-container hover:text-on-surface focus-visible:outline-none"
        >
          <Menu className="size-4" aria-hidden="true" />
        </button>
      )}

      {logo && (
        <div className={[showLogoLg ? '' : 'lg:hidden', 'shrink-0'].join(' ')}>{logo}</div>
      )}

      {breadcrumb && <div className="min-w-0 flex-1 truncate">{breadcrumb}</div>}
      {!breadcrumb && <div className="min-w-0 flex-1" />}

      {countdown && <div className="hidden md:block">{countdown}</div>}

      {rightSlot && <div className="flex shrink-0 items-center gap-1.5">{rightSlot}</div>}
    </header>
  );
}

Header.displayName = 'Header';
