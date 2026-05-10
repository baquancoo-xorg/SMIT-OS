/**
 * SMIT-OS Design System v2 — Component Library
 *
 * Built on Phase 2 design tokens (docs/design-tokens-spec.md).
 * Namespace `v2` ensures zero breakage to existing pages during migration.
 *
 * Usage:
 *   import { Button, Badge, Spinner } from '@/src/components/ui/v2';
 */

// ----- Atoms -----
export { Button } from './button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './button';

export { Input } from './input';
export type { InputProps } from './input';

export { Badge } from './badge';
export type { BadgeProps, BadgeVariant, BadgeSize } from './badge';

export { StatusDot } from './status-dot';
export type { StatusDotProps, StatusDotVariant, StatusDotSize } from './status-dot';

export { Spinner } from './spinner';
export type { SpinnerProps, SpinnerSize } from './spinner';

export { Skeleton } from './skeleton';
export type { SkeletonProps, SkeletonVariant } from './skeleton';

// ----- Molecules -----
export { PageHeader } from './page-header';
export type { PageHeaderProps, BreadcrumbItem } from './page-header';

export { TabPill } from './tab-pill';
export type { TabPillProps, TabPillItem } from './tab-pill';

export { EmptyState } from './empty-state';
export type { EmptyStateProps } from './empty-state';

export { KpiCard } from './kpi-card';
export type { KpiCardProps, KpiTrend, KpiAccent } from './kpi-card';

export { DateRangePicker, DEFAULT_PRESETS } from './date-range-picker';
export type { DateRangePickerProps, DateRange, DateRangePreset } from './date-range-picker';

// ----- Organisms -----
export { GlassCard } from './glass-card';
export type { GlassCardProps, GlassCardVariant, GlassCardPadding } from './glass-card';

export { Modal } from './modal';
export type { ModalProps, ModalSize } from './modal';

export { ConfirmDialog } from './confirm-dialog';
export type { ConfirmDialogProps, ConfirmTone } from './confirm-dialog';

export { DropdownMenu, DropdownTriggerChevron } from './dropdown-menu';
export type { DropdownMenuProps, DropdownMenuItem } from './dropdown-menu';

export { FilterChip } from './filter-chip';
export type { FilterChipProps, FilterChipOption, FilterChipSize } from './filter-chip';

export { ToastProvider, useToast, NotificationToast } from './notification-toast';
export type { ToastTone, ToastOptions } from './notification-toast';

export { FormDialog } from './form-dialog';
export type { FormDialogProps } from './form-dialog';

export { DataTable } from './data-table';
export type {
  DataTableProps,
  DataTableColumn,
  SortState,
  SortDirection,
  PaginationState,
  TableDensity,
  ColumnAlign,
} from './data-table';

// ----- Layout -----
export { Sidebar } from './sidebar';
export type { SidebarProps, SidebarItem, SidebarGroup } from './sidebar';

export { Header } from './header';
export type { HeaderProps } from './header';

export { AppLayout } from './app-layout';
export type { AppLayoutProps } from './app-layout';

export { OkrCycleCountdown } from './okr-cycle-countdown';
export type { OkrCycleCountdownProps } from './okr-cycle-countdown';

export { NotificationCenter } from './notification-center';
export type {
  NotificationCenterNotification,
  NotificationCenterTriggerProps,
  NotificationCenterPanelProps,
} from './notification-center';

// ----- Misc -----
export { ErrorBoundary } from './error-boundary';
export type { ErrorBoundaryProps } from './error-boundary';

export { NotFoundPage } from './not-found-page';
export type { NotFoundPageProps } from './not-found-page';
