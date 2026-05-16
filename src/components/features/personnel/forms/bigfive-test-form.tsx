/**
 * Big Five 50-question test. Likert 1-5, split into 3 pages (17/17/16).
 */

import { useMemo, useState } from 'react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, Card, useToast } from '../../../ui';
import { useBigFiveQuestionsQuery, useSubmitBigFiveMutation } from '../../../../hooks/use-personality-results';

interface Props {
  personnelId: string;
  onSubmitted?: () => void;
}

const PAGE_SIZE = 17;

export function BigFiveTestForm({ personnelId, onSubmitted }: Props) {
  const { data, isLoading } = useBigFiveQuestionsQuery(true);
  const submit = useSubmitBigFiveMutation(personnelId);
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [page, setPage] = useState(0);

  const pages = useMemo(() => {
    if (!data) return [];
    const out: Array<typeof data.items> = [];
    for (let i = 0; i < data.items.length; i += PAGE_SIZE) {
      out.push(data.items.slice(i, i + PAGE_SIZE));
    }
    return out;
  }, [data]);

  if (isLoading || !data) {
    return <div className="h-64 animate-pulse rounded-card bg-surface-2" />;
  }

  const totalPages = pages.length;
  const pageItems = pages[page] ?? [];
  const answered = Object.keys(answers).length;
  const total = data.items.length;
  const pageComplete = pageItems.every((it) => answers[it.id] !== undefined);
  const allComplete = answered === total;
  const isLast = page === totalPages - 1;

  function setAnswer(id: number, v: number) {
    setAnswers((prev) => ({ ...prev, [id]: v }));
  }

  function handleSubmit() {
    if (!allComplete) return;
    const payload = data.items.map((it) => ({ itemId: it.id, value: answers[it.id] }));
    submit.mutate(payload, {
      onSuccess: () => {
        toast({ tone: 'success', title: 'Đã lưu Big Five', description: 'Bạn có thể xem kết quả ở Zone B.' });
        onSubmitted?.();
      },
      onError: (e: Error) => toast({ tone: 'error', title: 'Lưu thất bại', description: e.message }),
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Card padding="md">
        <div className="flex items-center justify-between">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-text-muted">Big Five — Trang {page + 1}/{totalPages}</p>
          <p className="text-xs text-text-2">Tiến độ {answered}/{total}</p>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${(answered / total) * 100}%` }} />
        </div>
      </Card>

      <div className="flex flex-col gap-2">
        {pageItems.map((it) => (
          <div key={it.id} className="rounded-card border border-border bg-surface p-3">
            <p className="text-sm text-text-1">{it.id}. {it.text}</p>
            <div className="mt-3 grid grid-cols-5 gap-2">
              {data.scale.map((opt) => {
                const active = answers[it.id] === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAnswer(it.id, opt.value)}
                    className={[
                      'rounded-input border px-2 py-1.5 text-xs font-medium transition',
                      active
                        ? 'border-accent bg-surface-2 text-text-1 shadow-[0_0_0_1px_var(--brand-500)/40]'
                        : 'border-border bg-surface text-text-2 hover:border-border-strong hover:text-text-1',
                    ].join(' ')}
                  >
                    <span className="block text-sm font-semibold">{opt.value}</span>
                    <span className="block text-[10px] leading-tight">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button
          variant="secondary"
          iconLeft={<ChevronLeft />}
          disabled={page === 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
        >
          Trang trước
        </Button>

        {!isLast ? (
          <Button
            variant="primary"
            iconLeft={<ChevronRight />}
            disabled={!pageComplete}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          >
            Trang tiếp
          </Button>
        ) : (
          <Button
            variant="primary"
            iconLeft={<Check />}
            disabled={!allComplete || submit.isPending}
            onClick={handleSubmit}
          >
            {submit.isPending ? 'Đang lưu...' : 'Gửi kết quả'}
          </Button>
        )}
      </div>
    </div>
  );
}
