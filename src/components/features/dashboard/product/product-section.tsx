import { useMemo } from 'react';
import type { DateRange } from '../../../../types/dashboard-product';
import { SectionCard } from '../../../ui';
import { ProductExecutiveOverview } from './product-executive-overview';
import { ProductConversionFunnel } from './product-conversion-funnel';
import { ProductOperational } from './product-operational';

interface ProductSectionProps {
  from: string;
  to: string;
}

function buildIsoRange(from: string, to: string): DateRange {
  const fromIso = new Date(`${from}T00:00:00Z`).toISOString();
  const toIso = new Date(`${to}T23:59:59Z`).toISOString();
  return { from: fromIso, to: toIso };
}

export function ProductSection({ from, to }: ProductSectionProps) {
  const range = useMemo(() => buildIsoRange(from, to), [from, to]);

  return (
    <SectionCard eyebrow="Product" title="Activation & Retention">
      <div className="space-y-8">
        <ProductExecutiveOverview range={range} />
        <ProductConversionFunnel range={range} />
        <ProductOperational range={range} />
      </div>
    </SectionCard>
  );
}
