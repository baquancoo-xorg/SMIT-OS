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
  shell: 'bg-white rounded-3xl shadow-xl shadow-slate-200/20 overflow-hidden',
  scroll: 'overflow-x-auto',
  table: 'w-full text-left border-collapse',
  headerRow: 'bg-slate-50/50 border-b border-outline-variant/10',
  headerCell: 'px-8 py-6 text-xs font-black uppercase tracking-[0.2em] text-slate-400',
  body: 'divide-y divide-slate-100/50',
  row: 'hover:bg-primary/[0.02] transition-colors group',
  rowSelected: 'bg-primary/[0.02]',
  cell: 'px-8 py-5',
  actionHeaderCell: 'px-8 py-6 text-xs font-black uppercase tracking-[0.2em] text-slate-400 text-right w-[120px]',
  actionCell: 'px-8 py-5 text-right relative',
  emptyState: 'p-12 text-center',
};

const DENSE_CONTRACT: TableVariantContract = {
  shell: 'rounded-2xl border border-slate-200 bg-white overflow-hidden',
  scroll: 'overflow-x-auto',
  table: 'w-full text-sm table-fixed',
  headerRow: 'bg-slate-100 border-b border-slate-200',
  headerCell: 'px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 bg-slate-100 whitespace-nowrap',
  body: '',
  row: 'border-b border-slate-100 hover:bg-primary/5 transition-colors group',
  rowSelected: 'bg-primary/[0.04]',
  cell: 'px-3 py-2 text-xs whitespace-nowrap',
  actionHeaderCell: 'px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 text-right bg-slate-100 w-[96px]',
  actionCell: 'px-3 py-2 text-xs text-right whitespace-nowrap',
  emptyState: 'p-8 text-center',
};

const TABLE_CONTRACT_MAP: Record<TableVariant, TableVariantContract> = {
  standard: STANDARD_CONTRACT,
  dense: DENSE_CONTRACT,
};

export function getTableContract(variant: TableVariant): TableVariantContract {
  return TABLE_CONTRACT_MAP[variant];
}
