import type { DateRange } from '../../../../types/dashboard-product';
import { ProductKpiCards } from './product-kpi-cards';
import { ProductPrePqlTrend } from './product-pre-pql-trend';
import { ProductActivationHeatmap } from './product-activation-heatmap';

interface Props {
  range: DateRange;
  action?: React.ReactNode;
}

export function ProductExecutiveOverview({ range, action }: Props) {
  return (
    <div className="space-y-4">
      {action && <div className="flex justify-end">{action}</div>}
      <ProductKpiCards range={range} />
      <ProductPrePqlTrend range={range} />
      <ProductActivationHeatmap range={range} />
    </div>
  );
}
