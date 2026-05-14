import { format } from 'date-fns';
import { RotateCcw, X } from 'lucide-react';
import { Button } from '../ui/button';

interface DraftRestoredBannerProps {
  savedAt: string;
  onClear: () => void;
}

export function DraftRestoredBanner({ savedAt, onClear }: DraftRestoredBannerProps) {
  const time = format(new Date(savedAt), 'HH:mm');

  return (
    <div className="flex items-center justify-between gap-3 rounded-card border-l-4 border-l-accent bg-surface-container-low px-4 py-3">
      <div className="flex items-center gap-2 text-[length:var(--text-body-sm)] text-on-surface-variant">
        <RotateCcw className="size-4 text-accent" aria-hidden />
        <span>Đã khôi phục bản nháp lúc {time}</span>
      </div>
      <Button variant="ghost" size="sm" onClick={onClear} iconLeft={<X />}>
        Xóa nháp
      </Button>
    </div>
  );
}

DraftRestoredBanner.displayName = 'DraftRestoredBanner';
