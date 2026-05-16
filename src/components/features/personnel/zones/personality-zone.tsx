/**
 * Zone B — Personality + Innate profile.
 * 4 cards 2x2: DISC | Big Five | Numerology | Bát tự.
 * Click "Bắt đầu test" opens inline test panel.
 */

import { Suspense, useState } from 'react';
import { X } from 'lucide-react';
import type { Personnel, PersonalityResult } from '../../../../lib/personnel/personnel-types';
import { usePersonalityResultsQuery } from '../../../../hooks/use-personality-results';
import { DiscCard } from './cards/disc-card';
import { BigFiveCard } from './cards/bigfive-card';
import { NumerologyCard } from './cards/numerology-card';
import { BaziCard } from './cards/bazi-card';
import { BigFiveTestForm } from '../forms/bigfive-test-form';
import { DiscTestForm } from '../forms/disc-test-form';

interface Props {
  personnel: Personnel;
  isSelf: boolean;
}

type ActiveTest = 'big-five' | 'disc' | null;

export function PersonalityZone({ personnel, isSelf }: Props) {
  const [activeTest, setActiveTest] = useState<ActiveTest>(null);
  const { data: results, isLoading } = usePersonalityResultsQuery(personnel.id);
  const year = new Date().getFullYear();

  const findResult = (testType: 'BIG_FIVE' | 'DISC'): PersonalityResult | null => {
    if (!results) return null;
    return results.find((r) => r.testType === testType && r.year === year) ?? null;
  };

  if (isLoading) {
    return <div className="h-72 animate-pulse rounded-card bg-surface-2" />;
  }

  if (activeTest === 'big-five') {
    return (
      <TestWrapper title="Big Five — Test năm hiện tại" onClose={() => setActiveTest(null)}>
        <Suspense fallback={<div className="h-64 animate-pulse rounded-card bg-surface-2" />}>
          <BigFiveTestForm personnelId={personnel.id} onSubmitted={() => setActiveTest(null)} />
        </Suspense>
      </TestWrapper>
    );
  }

  if (activeTest === 'disc') {
    return (
      <TestWrapper title="DISC — Test năm hiện tại" onClose={() => setActiveTest(null)}>
        <Suspense fallback={<div className="h-64 animate-pulse rounded-card bg-surface-2" />}>
          <DiscTestForm personnelId={personnel.id} onSubmitted={() => setActiveTest(null)} />
        </Suspense>
      </TestWrapper>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <DiscCard
        result={findResult('DISC')}
        onStart={isSelf ? () => setActiveTest('disc') : undefined}
      />
      <BigFiveCard
        result={findResult('BIG_FIVE')}
        onStart={isSelf ? () => setActiveTest('big-five') : undefined}
      />
      <NumerologyCard data={personnel.numerologyData} />
      <BaziCard data={personnel.baziData} />
    </div>
  );
}

function TestWrapper({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-headline text-base font-black text-text-1">{title}</h3>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1 rounded-pill border border-border bg-surface px-3 py-1 text-xs text-text-2 hover:text-text-1"
        >
          <X className="size-3.5" /> Đóng
        </button>
      </div>
      {children}
    </div>
  );
}
