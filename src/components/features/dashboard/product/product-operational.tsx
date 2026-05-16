import type { DateRange } from '../../../../types/dashboard-product';
import { ProductTopFeaturesTable } from './product-top-features-table';

interface Props {
  range: DateRange;
}

export function ProductOperational({ range }: Props) {
  return (
    <div className="space-y-4">
      <ProductTopFeaturesTable range={range} />
    </div>
  );
}
