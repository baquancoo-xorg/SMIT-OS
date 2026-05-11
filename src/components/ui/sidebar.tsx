import { Fragment } from 'react';
import type { ReactNode } from 'react';
import { Dialog, DialogPanel, Disclosure, DisclosureButton, DisclosurePanel, Transition, TransitionChild } from '@headlessui/react';
import { ChevronDown, X } from 'lucide-react';

export interface SidebarItem {
  key: string;
  label: string;
  icon?: ReactNode;
  href?: string;
  /** Mark as currently active. Caller compares against router state. */
  active?: boolean;
  /** Optional badge count. */
  count?: number;
  /** Optional click handler (use href OR onClick, not both). */
  onClick?: () => void;
}

export interface SidebarGroup {
  key: string;
  label?: string;
  items: SidebarItem[];
  /** Default expand state (controlled groups TBD if needed). */
  defaultOpen?: boolean;
}

export interface SidebarProps {
  /** Sidebar header (logo + product name). */
  header?: ReactNode;
  /** Footer slot — usually user info or version pill. */
  footer?: ReactNode;
  /** Top-level items (no group label). */
  items?: SidebarItem[];
  /** Grouped items (collapsible if `label` set). */
  groups?: SidebarGroup[];
  /** Mobile open state. Caller manages. */
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  className?: string;
}

const itemBaseClass =
  'group relative flex items-center gap-3 rounded-button px-3 py-2 text-[length:var(--text-body-sm)] transition-colors motion-fast ease-standard focus-visible:outline-none [&>svg]:size-4 [&>svg]:shrink-0';

function NavItem({ item }: { item: SidebarItem }) {
  const Tag = item.href ? 'a' : 'button';
  return (
    <Tag
      href={item.href}
      type={item.href ? undefined : 'button'}
      onClick={item.onClick}
      aria-current={item.active ? 'page' : undefined}
      className={[
        itemBaseClass,
        item.active
          ? 'bg-primary-container text-on-primary-container font-semibold'
          : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
      ].join(' ')}
    >
      {item.icon}
      <span className="flex-1 truncate">{item.label}</span>
      {typeof item.count === 'number' && (
        <span
          className={[
            'inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[length:var(--text-caption)] font-semibold',
            item.active ? 'bg-on-primary-container/20 text-on-primary-container' : 'bg-surface-container-high text-on-surface-variant',
          ].join(' ')}
        >
          {item.count}
        </span>
      )}
      {item.active && (
        <span aria-hidden="true" className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
      )}
    </Tag>
  );
}

function SidebarContent({ header, items, groups, footer }: Pick<SidebarProps, 'header' | 'items' | 'groups' | 'footer'>) {
  return (
    <div className="flex h-full flex-col bg-white">
      {header && <div className="flex h-16 items-center border-b border-outline-variant/40 px-4">{header}</div>}

      <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Primary">
        {items && items.length > 0 && (
          <ul className="flex flex-col gap-0.5">
            {items.map((item) => (
              <li key={item.key}>
                <NavItem item={item} />
              </li>
            ))}
          </ul>
        )}

        {groups?.map((group) => (
          <div key={group.key} className="mt-4 first:mt-0">
            {group.label ? (
              <Disclosure defaultOpen={group.defaultOpen ?? true}>
                {({ open }) => (
                  <>
                    <DisclosureButton className="flex w-full items-center justify-between rounded-button px-3 py-1.5 text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant hover:bg-surface-container-low focus-visible:outline-none">
                      <span>{group.label}</span>
                      <ChevronDown className={['size-4 transition-transform motion-fast ease-standard', open ? 'rotate-180' : ''].join(' ')} aria-hidden="true" />
                    </DisclosureButton>
                    <DisclosurePanel as="ul" className="mt-1 flex flex-col gap-0.5">
                      {group.items.map((item) => (
                        <li key={item.key}>
                          <NavItem item={item} />
                        </li>
                      ))}
                    </DisclosurePanel>
                  </>
                )}
              </Disclosure>
            ) : (
              <ul className="flex flex-col gap-0.5">
                {group.items.map((item) => (
                  <li key={item.key}>
                    <NavItem item={item} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </nav>

      {footer && <div className="border-t border-outline-variant/40 p-3">{footer}</div>}
    </div>
  );
}

/**
 * Sidebar v2 — vertical nav. Desktop = static panel, mobile = Dialog overlay slide-out.
 *
 * Items can be flat (`items`) or grouped (`groups` with optional collapsible label).
 * Active item gets accent stripe + container background + `aria-current="page"`.
 *
 * @example
 * <Sidebar
 *   header={<Logo />}
 *   items={[{ key: 'home', label: 'Dashboard', icon: <Home />, href: '/', active: true }]}
 *   groups={[{ key: 'settings', label: 'Settings', items: [...] }]}
 *   mobileOpen={open}
 *   onMobileClose={() => setOpen(false)}
 * />
 */
export function Sidebar({ header, items, groups, footer, mobileOpen = false, onMobileClose, className = '' }: SidebarProps) {
  return (
    <>
      {/* Desktop: always-visible static panel */}
      <aside
        className={[
          'hidden lg:flex h-screen w-64 shrink-0 flex-col border-r border-outline-variant/40',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <SidebarContent header={header} items={items} groups={groups} footer={footer} />
      </aside>

      {/* Mobile: Dialog overlay */}
      <Transition show={mobileOpen} as={Fragment}>
        <Dialog as="div" className="relative z-modal lg:hidden" onClose={() => onMobileClose?.()}>
          <TransitionChild
            as={Fragment}
            enter="transition-opacity motion-medium ease-standard"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity motion-fast ease-standard"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm" aria-hidden="true" />
          </TransitionChild>

          <TransitionChild
            as={Fragment}
            enter="transition-transform motion-medium ease-decelerate"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition-transform motion-fast ease-accelerate"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <DialogPanel className="fixed inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-xl">
              <div className="flex h-16 items-center justify-between border-b border-outline-variant/40 px-4">
                <div className="flex-1 truncate">{header}</div>
                <button
                  type="button"
                  aria-label="Close navigation"
                  onClick={() => onMobileClose?.()}
                  className="-mr-1 inline-flex size-8 items-center justify-center rounded-button text-on-surface-variant hover:bg-surface-container hover:text-on-surface focus-visible:outline-none"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <SidebarContent items={items} groups={groups} footer={footer} />
              </div>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
    </>
  );
}

Sidebar.displayName = 'Sidebar';
