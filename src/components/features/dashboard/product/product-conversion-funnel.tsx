import type { DateRange } from '../../../../types/dashboard-product';
import { ProductFunnelWithTime } from './product-funnel-with-time';

interface Props {
  range: DateRange;
}

export function ProductConversionFunnel({ range }: Props) {
  return (
    <div className="space-y-4">
      <ProductFunnelWithTime range={range} />
    </div>
  );
}
