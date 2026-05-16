import type { DateRange } from '../../../../types/dashboard-product';
import { ProductKpiCards } from './product-kpi-cards';
import { ProductPrePqlTrend } from './product-pre-pql-trend';
import { ProductActivationHeatmap } from './product-activation-heatmap';

interface Props {
  range: DateRange;
}

export function ProductExecutiveOverview({ range }: Props) {
  return (
    <div className="space-y-4">
      <ProductKpiCards range={range} />
      <ProductPrePqlTrend range={range} />
      <ProductActivationHeatmap range={range} />
    </div>
  );
}
