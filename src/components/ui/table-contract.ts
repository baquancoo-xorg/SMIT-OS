export type TableVariant = 'standard' | 'dense';

export interface TableVariantContract {
  shell: string;
  scroll: string;
  table: string;
  headerRow: string;
  headerCell: string;
  body: string;
  row: string;
  rowSelected: string;
  cell: string;
  actionHeaderCell: string;
  actionCell: string;
  emptyState: string;
}

const STANDARD_CONTRACT: TableVariantContract = {
  shell: 'overflow-hidden rounded-card bg-surface shadow-xl shadow-on-surface/[0.04]',
  scroll: 'overflow-x-auto',
  table: 'w-full border-collapse text-left',
  headerRow: 'border-b border-outline-variant/40 bg-surface-variant/30',
  headerCell: 'px-4 py-2.5 text-[length:var(--text-caption)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant',
  body: 'divide-y divide-outline-variant/30',
  row: 'group transition-colors hover:bg-primary/[0.02]',
  rowSelected: 'bg-primary/[0.04]',
  cell: 'px-4 py-2.5 text-[length:var(--text-body-sm)]',
  actionHeaderCell: 'w-[88px] px-3 py-2.5 text-right text-[length:var(--text-caption)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant',
  actionCell: 'relative px-3 py-2 text-right',
  emptyState: 'p-8 text-center',
};

const DENSE_CONTRACT: TableVariantContract = {
  shell: 'overflow-hidden rounded-card border border-outline-variant/40 bg-surface',
  scroll: 'overflow-x-auto',
  table: 'w-full table-fixed text-[length:var(--text-body-sm)]',
  headerRow: 'border-b border-outline-variant/40 bg-surface-variant/60',
  headerCell: 'whitespace-nowrap bg-surface-variant/60 px-3 py-2.5 text-[length:var(--text-caption)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant',
  body: '',
  row: 'group border-b border-outline-variant/30 transition-colors hover:bg-primary/5',
  rowSelected: 'bg-primary/[0.04]',
  cell: 'whitespace-nowrap px-3 py-2 text-[length:var(--text-body-sm)]',
  actionHeaderCell: 'w-[96px] bg-surface-variant/60 px-3 py-2.5 text-right text-[length:var(--text-caption)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant',
  actionCell: 'whitespace-nowrap px-3 py-2 text-right text-[length:var(--text-body-sm)]',
  emptyState: 'p-8 text-center',
};

const TABLE_CONTRACT_MAP: Record<TableVariant, TableVariantContract> = {
  standard: STANDARD_CONTRACT,
  dense: DENSE_CONTRACT,
};

export function getTableContract(variant: TableVariant): TableVariantContract {
  return TABLE_CONTRACT_MAP[variant];
}
