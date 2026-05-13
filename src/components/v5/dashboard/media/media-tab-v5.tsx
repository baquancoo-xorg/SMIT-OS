import MediaTab from '../../../dashboard/media/media-tab';
import { Card } from '../../ui';

interface MediaTabV5Props {
  from: string;
  to: string;
}

export function MediaTabV5({ from, to }: MediaTabV5Props) {
  return (
    <Card padding="md" glow className="space-y-4">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-accent-text">Media</p>
        <h2 className="mt-1 font-headline text-2xl font-black tracking-tight text-text-1">Content Operations</h2>
      </div>
      <MediaTab from={from} to={to} />
    </Card>
  );
}
