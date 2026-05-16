/**
 * DISC 24-question test. Each item: pick 1 Most-like + 1 Least-like word.
 * Single-page scrollable; auto-validates most ≠ least.
 */

import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button, Card, useToast } from '../../../ui';
import type { DiscType } from '../../../../lib/personnel/personnel-types';
import { useDiscQuestionsQuery, useSubmitDiscMutation } from '../../../../hooks/use-personality-results';

interface Props {
  personnelId: string;
  onSubmitted?: () => void;
}

interface ItemAnswer {
  most?: DiscType;
  least?: DiscType;
}

export function DiscTestForm({ personnelId, onSubmitted }: Props) {
  const { data, isLoading } = useDiscQuestionsQuery(true);
  const submit = useSubmitDiscMutation(personnelId);
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<number, ItemAnswer>>({});

  if (isLoading || !data) {
    return <div className="h-64 animate-pulse rounded-card bg-surface-2" />;
  }

  function setMost(itemId: number, type: DiscType) {
    setAnswers((prev) => {
      const cur = prev[itemId] ?? {};
      const least = cur.least === type ? undefined : cur.least;
      return { ...prev, [itemId]: { ...cur, most: type, least } };
    });
  }

  function setLeast(itemId: number, type: DiscType) {
    setAnswers((prev) => {
      const cur = prev[itemId] ?? {};
      const most = cur.most === type ? undefined : cur.most;
      return { ...prev, [itemId]: { ...cur, least: type, most } };
    });
  }

  const total = data.items.length;
  const complete = data.items.filter((it) => answers[it.id]?.most && answers[it.id]?.least).length;
  const allComplete = complete === total;

  function handleSubmit() {
    if (!allComplete) return;
    const payload = data.items.map((it) => ({
      itemId: it.id,
      most: answers[it.id].most!,
      least: answers[it.id].least!,
    }));
    submit.mutate(payload, {
      onSuccess: () => {
        toast({ tone: 'success', title: 'Đã lưu DISC', description: 'Bạn có thể xem kết quả ở Zone B.' });
        onSubmitted?.();
      },
      onError: (e: Error) => toast({ tone: 'error', title: 'Lưu thất bại', description: e.message }),
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Card padding="md">
        <div className="flex items-center justify-between">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-text-muted">DISC — 24 câu</p>
          <p className="text-xs text-text-2">Tiến độ {complete}/{total}</p>
        </div>
        <p className="mt-2 text-xs text-text-2">Ở mỗi câu, chọn 1 từ <strong>giống bạn nhất</strong> và 1 từ <strong>ít giống bạn nhất</strong>.</p>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${(complete / total) * 100}%` }} />
        </div>
      </Card>

      <div className="flex flex-col gap-2">
        {data.items.map((it) => {
          const ans = answers[it.id] ?? {};
          return (
            <div key={it.id} className="rounded-card border border-border bg-surface p-3">
              <p className="mb-3 text-xs font-medium text-text-2">Câu {it.id}</p>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
                {it.words.map((w) => {
                  const isMost = ans.most === w.type;
                  const isLeast = ans.least === w.type;
                  return (
                    <div
                      key={w.type}
                      className={[
                        'flex items-center justify-between gap-2 rounded-input border px-3 py-2 text-sm transition',
                        isMost
                          ? 'border-accent bg-surface-2 text-text-1'
                          : isLeast
                          ? 'border-error/40 bg-surface-2 text-text-1'
                          : 'border-border bg-surface text-text-2',
                      ].join(' ')}
                    >
                      <span className="font-medium">{w.text}</span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setMost(it.id, w.type)}
                          aria-pressed={isMost}
                          title="Giống nhất"
                          className={[
                            'inline-flex size-7 items-center justify-center rounded-button text-[10px] font-black transition',
                            isMost ? 'bg-accent text-white' : 'border border-border text-text-2 hover:text-text-1',
                          ].join(' ')}
                        >
                          M
                        </button>
                        <button
                          type="button"
                          onClick={() => setLeast(it.id, w.type)}
                          aria-pressed={isLeast}
                          title="Ít giống nhất"
                          className={[
                            'inline-flex size-7 items-center justify-center rounded-button text-[10px] font-black transition',
                            isLeast ? 'bg-error text-white' : 'border border-border text-text-2 hover:text-text-1',
                          ].join(' ')}
                        >
                          L
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button
          variant="primary"
          iconLeft={<Check />}
          disabled={!allComplete || submit.isPending}
          onClick={handleSubmit}
        >
          {submit.isPending ? 'Đang lưu...' : `Gửi kết quả (${complete}/${total})`}
        </Button>
      </div>
    </div>
  );
}
