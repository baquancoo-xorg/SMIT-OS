import type { ReactNode } from 'react';
import { getTableContract, type TableVariant } from './table-contract';

interface TableShellProps {
  variant: TableVariant;
  children: ReactNode;
  className?: string;
  scrollClassName?: string;
  tableClassName?: string;
}

export function TableShell({
  variant,
  children,
  className = '',
  scrollClassName = '',
  tableClassName = '',
}: TableShellProps) {
  const contract = getTableContract(variant);

  return (
    <div className={`${contract.shell} ${className}`.trim()}>
      <div className={`${contract.scroll} ${scrollClassName}`.trim()}>
        <table className={`${contract.table} ${tableClassName}`.trim()}>{children}</table>
      </div>
    </div>
  );
}
