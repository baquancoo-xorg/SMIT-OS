/**
 * SMIT-OS Design System v4 — barrel export.
 *
 * Import tokens.css separately from your route entry:
 *   import './design/v4/tokens.css';
 *
 * v4 styles activate under `data-ui="v4"` (set by `<AppShell>` or manually).
 */

// Utility
export { cn } from './lib/cn.js';
export type { ClassValue } from './lib/cn.js';

// Hooks
export { useEscapeKey } from './primitives/use-escape-key.js';
export { useClickOutside } from './primitives/use-click-outside.js';
export { useFocusTrap } from './primitives/use-focus-trap.js';
export { useKeyboardListNav } from './primitives/use-keyboard-list-nav.js';

// ===== Batch 1 — 8 core primitives =====
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

// ===== Batch 2 — 22 primitives =====

// Feedback
export { Spinner } from './components/spinner.js';
export type { SpinnerProps, SpinnerSize } from './components/spinner.js';
export { Skeleton } from './components/skeleton.js';
export type { SkeletonProps, SkeletonShape } from './components/skeleton.js';
export { StatusDot } from './components/status-dot.js';
export type { StatusDotProps, StatusDotIntent } from './components/status-dot.js';
export { EmptyState } from './components/empty-state.js';
export type { EmptyStateProps } from './components/empty-state.js';
export { ErrorBoundary } from './components/error-boundary.js';

// Controls + compositions
export { TabPill } from './components/tab-pill.js';
export type { TabPillProps, TabPillItem } from './components/tab-pill.js';
export { FilterChip } from './components/filter-chip.js';
export type { FilterChipProps } from './components/filter-chip.js';
export { KpiCard } from './components/kpi-card.js';
export type { KpiCardProps, KpiTrend } from './components/kpi-card.js';
export { TableRowActions } from './components/table-row-actions.js';
export type { TableRowActionsProps } from './components/table-row-actions.js';

// Forms
export { Select } from './components/select.js';
export type { SelectProps, SelectOption, SelectSize } from './components/select.js';
export { CustomSelect } from './components/custom-select.js';
export type { CustomSelectProps, CustomSelectOption } from './components/custom-select.js';
export { DatePicker } from './components/date-picker.js';
export type { DatePickerProps } from './components/date-picker.js';
export { DateRangePicker } from './components/date-range-picker.js';
export type { DateRangePickerProps, DateRange } from './components/date-range-picker.js';
export { DateRangeButton } from './components/date-range-button.js';
export type { DateRangeButtonProps } from './components/date-range-button.js';

// Dialogs
export { FormDialog } from './components/form-dialog.js';
export type { FormDialogProps } from './components/form-dialog.js';
export { ConfirmDialog } from './components/confirm-dialog.js';
export type { ConfirmDialogProps } from './components/confirm-dialog.js';

// Notifications
export { NotificationToast } from './components/notification-toast.js';
export type { ToastProps } from './components/notification-toast.js';
export { NotificationProvider, useNotifications } from './components/notification-center.js';
export type { NotificationProviderProps, ToastInput } from './components/notification-center.js';

// Misc
export { NotFoundPage } from './components/not-found-page.js';
export type { NotFoundPageProps } from './components/not-found-page.js';
export { OkrCycleCountdown } from './components/okr-cycle-countdown.js';
export type { OkrCycleCountdownProps } from './components/okr-cycle-countdown.js';

// Layout
export { Header } from './components/header.js';
export type { HeaderProps } from './components/header.js';
export { Sidebar } from './components/sidebar.js';
export type { SidebarProps, SidebarSection, SidebarItem } from './components/sidebar.js';
export { AppShell } from './components/app-shell.js';
export type { AppShellProps } from './components/app-shell.js';
