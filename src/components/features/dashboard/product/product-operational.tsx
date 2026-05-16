import type { DateRange } from '../../../../types/dashboard-product';
import { ProductOnlineTimeTable } from './product-online-time-table';
import { ProductTouchpointTable } from './product-touchpoint-table';
import { ProductTopFeaturesTable } from './product-top-features-table';
import { ProductStuckList } from './product-stuck-list';

interface Props {
  range: DateRange;
}

export function ProductOperational({ range }: Props) {
  return (
    <div className="space-y-4">
      <ProductOnlineTimeTable range={range} />
      <ProductTouchpointTable range={range} />
      <ProductTopFeaturesTable range={range} />
      <ProductStuckList range={range} />
    </div>
  );
}
