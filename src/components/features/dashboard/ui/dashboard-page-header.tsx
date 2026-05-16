import type { ReactNode } from 'react';
import { PageHeader } from '../../../ui';

/**
 * Dashboard page header — H1 với italic accent. Breadcrumb owned by Header.tsx topbar.
 *
 * Phase 8 follow-up batch 10 (2026-05-11): wraps v2 PageHeader (no breadcrumb,
 * no description). API identical.
 */

interface DashboardPageHeaderProps {
  title: string;
  accent: string;
  rightControls?: ReactNode;
}

export default function DashboardPageHeader({
  title,
  accent,
  rightControls,
}: DashboardPageHeaderProps) {
  return <PageHeader title={`${title} `} accent={accent} actions={rightControls} className="border-0 pb-0" />;
}
