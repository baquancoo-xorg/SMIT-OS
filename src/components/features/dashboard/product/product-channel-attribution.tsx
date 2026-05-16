import type { DateRange } from '../../../../types/dashboard-product';
import { ProductChannelBreakdown } from './product-channel-breakdown';
import { ProductPrePqlBySource } from './product-prepql-by-source';
import { ProductChannelPostHogSecondary } from './product-channel-posthog-secondary';

interface Props {
  range: DateRange;
}

export function ProductChannelAttribution({ range }: Props) {
  return (
    <div className="space-y-4">
      <ProductChannelBreakdown range={range} />
      <ProductPrePqlBySource range={range} />
      <ProductChannelPostHogSecondary range={range} />
    </div>
  );
}
