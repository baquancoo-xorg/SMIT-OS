import { useState } from 'react';
import { useProductTopFeatures } from '../../../hooks/use-product-dashboard';
import type { DateRange, TopFeature } from '../../../types/dashboard-product';
import DashboardPanel from '../ui/dashboard-panel';
import DashboardSectionTitle from '../ui/dashboard-section-title';
import DashboardEmptyState from '../ui/dashboard-empty-state';
import { Skeleton } from '../../ui/v2';

interface ProductTopFeaturesTableProps {
  range: DateRange;
}

type SortKey = 'feature' | 'users' | 'totalUses';

export function ProductTopFeaturesTable({ range }: ProductTopFeaturesTableProps) {
  const { data, isLoading, error } = useProductTopFeatures(range);
  const [sortBy, setSortBy] = useState<SortKey>('totalUses');
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(key);
      setSortAsc(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardPanel className="p-6">
        <DashboardSectionTitle>Top Features</DashboardSectionTitle>
        <div className="mt-4 space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} variant="rect" className="h-10 rounded-card" />
          ))}
        </div>
      </DashboardPanel>
    );
  }

  if (error || !data) {
    return (
      <DashboardPanel className="p-6">
        <DashboardSectionTitle>Top Features</DashboardSectionTitle>
        <DashboardEmptyState description="Không thể tải top features" />
      </DashboardPanel>
    );
  }

  const items = data.items;
  if (!items.length) {
    return (
      <DashboardPanel className="p-6">
        <DashboardSectionTitle>Top Features</DashboardSectionTitle>
        <DashboardEmptyState description="Chưa có dữ liệu feature usage" />
      </DashboardPanel>
    );
  }

  const sorted = [...items].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortAsc ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
  });

  const SortHeader = ({ label, sortKey }: { label: string; sortKey: SortKey }) => (
    <th
      className="cursor-pointer px-4 py-2 text-left text-[length:var(--text-caption)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant transition-colors hover:text-on-surface"
      onClick={() => handleSort(sortKey)}
    >
      {label} {sortBy === sortKey && (sortAsc ? '↑' : '↓')}
    </th>
  );

  return (
    <DashboardPanel className="p-6">
      <DashboardSectionTitle>Top Features</DashboardSectionTitle>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-outline-variant/40">
              <SortHeader label="Feature" sortKey="feature" />
              <SortHeader label="Users" sortKey="users" />
              <SortHeader label="Total Uses" sortKey="totalUses" />
              <th className="px-4 py-2 text-left text-[length:var(--text-caption)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant">Last Used</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((item) => (
              <tr key={item.feature} className="border-b border-outline-variant/40 transition-colors hover:bg-surface-variant/40">
                <td className="px-4 py-3 text-[length:var(--text-body-sm)] text-on-surface">{item.feature}</td>
                <td className="px-4 py-3 text-[length:var(--text-body-sm)] tabular-nums text-on-surface">{item.users.toLocaleString()}</td>
                <td className="px-4 py-3 text-[length:var(--text-body-sm)] tabular-nums text-on-surface">{item.totalUses.toLocaleString()}</td>
                <td className="px-4 py-3 text-[length:var(--text-body-sm)] text-on-surface-variant">
                  {item.lastUsed ? new Date(item.lastUsed).toLocaleDateString('vi-VN') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardPanel>
  );
}
