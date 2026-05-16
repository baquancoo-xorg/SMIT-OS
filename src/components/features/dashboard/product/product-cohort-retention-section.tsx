import type { DateRange } from '../../../../types/dashboard-product';
import { ProductCohortRetention } from './product-cohort-retention';
import { ProductCohortActivationCurve } from './product-cohort-activation-curve';

interface Props {
  range: DateRange;
}

export function ProductCohortRetentionSection({ range }: Props) {
  return (
    <div className="space-y-4">
      <ProductCohortRetention range={range} />
      <ProductCohortActivationCurve range={range} />
    </div>
  );
}
