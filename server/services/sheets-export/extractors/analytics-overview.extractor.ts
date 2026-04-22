import { ExtractorContext, Extractor } from './types';
import { SheetData } from '../../../types/sheets-export.types';
import { getKpiMetrics } from '../../dashboard/overview-kpi.service';
import { getCohortKpiMetrics } from '../../dashboard/overview-cohort.service';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN').format(Math.round(value));
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

export const analyticsOverviewRealtime: Extractor = async (ctx): Promise<SheetData> => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const today = new Date();

  const kpiData = await getKpiMetrics(thirtyDaysAgo, today);

  const headers = [
    'Date',
    'Ad Spend',
    'Sessions',
    'CPSe',
    'Signups',
    'CPSi',
    'Opps',
    'CPOpp',
    'Orders',
    'CPOr',
    'MQL',
    'MQL Bronze',
    'MQL Silver',
    'MQL Gold',
    'Pre-PQL',
    'PQL',
    'Pre-SQL',
    'SQL',
    'Revenue',
    'ROAS',
    'ME/RE'
  ];

  const rows: (string | number | boolean | null)[][] = kpiData.data.map(row => {
    const meRe = row.adSpend > 0 ? ((row.revenue / row.adSpend - 1) * 100) : 0;
    return [
      row.date,
      formatCurrency(row.adSpend),
      row.sessions,
      formatCurrency(row.costPerSession),
      row.signups,
      formatCurrency(row.costPerSignup),
      row.opportunities,
      formatCurrency(row.costPerOpportunity),
      row.orders,
      formatCurrency(row.costPerOrder),
      row.mql,
      row.mqlBronze,
      row.mqlSilver,
      row.mqlGold,
      row.prePql,
      row.pql,
      row.preSql,
      row.sql,
      formatCurrency(row.revenue),
      `${row.roas.toFixed(2)}x`,
      formatPercent(meRe)
    ];
  });

  // Add totals row
  const totals = kpiData.totals;
  const totalMeRe = totals.adSpend > 0 ? ((totals.revenue / totals.adSpend - 1) * 100) : 0;
  rows.push([
    'TOTAL',
    formatCurrency(totals.adSpend),
    totals.sessions,
    formatCurrency(totals.costPerSession),
    totals.signups,
    formatCurrency(totals.costPerSignup),
    totals.opportunities,
    formatCurrency(totals.costPerOpportunity),
    totals.orders,
    formatCurrency(totals.costPerOrder),
    totals.mql,
    totals.mqlBronze,
    totals.mqlSilver,
    totals.mqlGold,
    totals.prePql,
    totals.pql,
    totals.preSql,
    totals.sql,
    formatCurrency(totals.revenue),
    `${totals.roas.toFixed(2)}x`,
    formatPercent(totalMeRe)
  ]);

  return { sheetName: 'Analytics-Realtime', headers, rows };
};

export const analyticsOverviewCohort: Extractor = async (ctx): Promise<SheetData> => {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const today = new Date();

  const kpiData = await getCohortKpiMetrics(ninetyDaysAgo, today);

  const headers = [
    'Date',
    'Ad Spend',
    'Sessions',
    'CPSe',
    'Signups',
    'CPSi',
    'Opps',
    'CPOpp',
    'Orders',
    'CPOr',
    'MQL',
    'MQL Bronze',
    'MQL Silver',
    'MQL Gold',
    'Pre-PQL',
    'PQL',
    'Pre-SQL',
    'SQL',
    'Revenue',
    'ROAS',
    'ME/RE'
  ];

  const rows: (string | number | boolean | null)[][] = kpiData.data.map(row => {
    const meRe = row.adSpend > 0 ? ((row.revenue / row.adSpend - 1) * 100) : 0;
    return [
      row.date,
      formatCurrency(row.adSpend),
      row.sessions,
      formatCurrency(row.costPerSession),
      row.signups,
      formatCurrency(row.costPerSignup),
      row.opportunities,
      formatCurrency(row.costPerOpportunity),
      row.orders,
      formatCurrency(row.costPerOrder),
      row.mql,
      row.mqlBronze,
      row.mqlSilver,
      row.mqlGold,
      row.prePql,
      row.pql,
      row.preSql,
      row.sql,
      formatCurrency(row.revenue),
      `${row.roas.toFixed(2)}x`,
      formatPercent(meRe)
    ];
  });

  // Add totals row
  const totals = kpiData.totals;
  const totalMeRe = totals.adSpend > 0 ? ((totals.revenue / totals.adSpend - 1) * 100) : 0;
  rows.push([
    'TOTAL',
    formatCurrency(totals.adSpend),
    totals.sessions,
    formatCurrency(totals.costPerSession),
    totals.signups,
    formatCurrency(totals.costPerSignup),
    totals.opportunities,
    formatCurrency(totals.costPerOpportunity),
    totals.orders,
    formatCurrency(totals.costPerOrder),
    totals.mql,
    totals.mqlBronze,
    totals.mqlSilver,
    totals.mqlGold,
    totals.prePql,
    totals.pql,
    totals.preSql,
    totals.sql,
    formatCurrency(totals.revenue),
    `${totals.roas.toFixed(2)}x`,
    formatPercent(totalMeRe)
  ]);

  return { sheetName: 'Analytics-Cohort', headers, rows };
};
