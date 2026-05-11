/**
 * SMIT-OS Design System v4 — barrel export.
 *
 * Import tokens.css separately from your route entry:
 *   import './design/v4/tokens.css';
 *
 * Tokens are scoped under [data-ui="v4"] — set on <html> for v4 routes only.
 */

// Utility
export { cn } from './lib/cn.js';
export type { ClassValue } from './lib/cn.js';

// Hooks
export { useEscapeKey } from './primitives/use-escape-key.js';
export { useClickOutside } from './primitives/use-click-outside.js';
export { useFocusTrap } from './primitives/use-focus-trap.js';
export { useKeyboardListNav } from './primitives/use-keyboard-list-nav.js';

// Components — batch 1 (8)
export { Button } from './components/button.js';
export type { ButtonProps, ButtonVariant, ButtonSize } from './components/button.js';

export { Badge } from './components/badge.js';
export type { BadgeProps, BadgeIntent, TaskStatus, FeedbackIntent } from './components/badge.js';

export { SurfaceCard } from './components/surface-card.js';
export type { SurfaceCardProps, CardElevation, CardPadding, CardRadius } from './components/surface-card.js';

export { Input } from './components/input.js';
export type { InputProps, InputSize } from './components/input.js';

export { PageHeader } from './components/page-header.js';
export type { PageHeaderProps, BreadcrumbItem } from './components/page-header.js';

export { Modal } from './components/modal.js';
export type { ModalProps, ModalSize } from './components/modal.js';

export { DropdownMenu } from './components/dropdown-menu.js';
export type { DropdownMenuProps, DropdownMenuItem } from './components/dropdown-menu.js';

export { DataTable } from './components/data-table.js';
export type { DataTableProps, DataTableColumn, SortDirection } from './components/data-table.js';
