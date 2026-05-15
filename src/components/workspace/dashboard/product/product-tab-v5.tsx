import { ProductSection } from '@/components/workspace/dashboard/product';
import { Card } from '@/components/ui/card';

interface ProductTabV5Props {
  from: string;
  to: string;
}

export function ProductTabV5({ from, to }: ProductTabV5Props) {
  return (
    <Card padding="md" glow className="space-y-4">
      {/* ui-canon-ok: section header font-black for KPI headline */}
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-accent-text">Product</p>
        <h2 className="mt-1 font-headline text-2xl font-black tracking-tight text-text-1">Activation & Retention</h2>
      </div>
      <ProductSection from={from} to={to} />
    </Card>
  );
}
