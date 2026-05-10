import { useEffect, useState } from 'react';
import { Newspaper } from 'lucide-react';
import { format } from 'date-fns';
import type { MediaPlatform, MediaPost, MediaPostType } from '../../types';
import { FormDialog, Input } from '../ui/v2';

/**
 * Add/Edit media post dialog — supports ORGANIC / KOL / KOC / PR types.
 *
 * Phase 8 follow-up batch 6 (2026-05-10): migrated to v2 FormDialog + Input
 * primitives (in-place, API identical). Removed inline `<style>` block (replaced
 * bằng v2 Input + native select với token-driven styling).
 *
 * Type-aware fields:
 *  - KOL/KOC → metaName (KOL/KOC name) + cost
 *  - PR → metaName (outlet) + cost + sentiment
 */

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void> | void;
  initial?: MediaPost | null;
  /** Pre-set type (used when opening from a specific tab). */
  defaultType?: MediaPostType;
}

const PLATFORM_OPTIONS: MediaPlatform[] = ['FACEBOOK', 'INSTAGRAM', 'YOUTUBE', 'BLOG', 'PR', 'OTHER'];
const TYPE_OPTIONS: MediaPostType[] = ['ORGANIC', 'KOL', 'KOC', 'PR'];

const SELECT_CLS =
  'h-10 w-full rounded-input border border-outline-variant bg-surface-container-lowest px-3 text-[length:var(--text-body)] text-on-surface focus-visible:outline-none focus-visible:border-primary';

function FieldLabel({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${full ? 'md:col-span-2' : ''}`}>
      <span className="text-[length:var(--text-label)] font-medium text-on-surface-variant">{label}</span>
      {children}
    </div>
  );
}

export default function MediaPostDialog({ open, onClose, onSubmit, initial, defaultType }: Props) {
  const [platform, setPlatform] = useState<MediaPlatform>('FACEBOOK');
  const [type, setType] = useState<MediaPostType>('ORGANIC');
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [publishedAt, setPublishedAt] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [reach, setReach] = useState('');
  const [engagement, setEngagement] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');
  const [cost, setCost] = useState('');
  const [metaName, setMetaName] = useState('');
  const [metaSentiment, setMetaSentiment] = useState<'positive' | 'neutral' | 'negative'>('neutral');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setPlatform(initial.platform);
      setType(initial.type);
      setUrl(initial.url ?? '');
      setTitle(initial.title ?? '');
      setPublishedAt(initial.publishedAt.slice(0, 10));
      setReach(String(initial.reach ?? ''));
      setEngagement(String(initial.engagement ?? ''));
      setUtmCampaign(initial.utmCampaign ?? '');
      setCost(initial.cost != null ? String(initial.cost) : '');
      const meta = (initial.meta ?? {}) as Record<string, unknown>;
      setMetaName(String(meta.kolName ?? meta.kocName ?? meta.outlet ?? ''));
      const sentiment = String(meta.sentiment ?? 'neutral') as 'positive' | 'neutral' | 'negative';
      setMetaSentiment(['positive', 'neutral', 'negative'].includes(sentiment) ? sentiment : 'neutral');
    } else {
      setPlatform(defaultType === 'PR' ? 'PR' : 'FACEBOOK');
      setType(defaultType ?? 'ORGANIC');
      setUrl('');
      setTitle('');
      setPublishedAt(format(new Date(), 'yyyy-MM-dd'));
      setReach('');
      setEngagement('');
      setUtmCampaign('');
      setCost('');
      setMetaName('');
      setMetaSentiment('neutral');
    }
    setError(null);
  }, [open, initial, defaultType]);

  const isKolKoc = type === 'KOL' || type === 'KOC';
  const isPR = type === 'PR';

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const meta: Record<string, unknown> = {};
      if (isKolKoc && metaName) meta[type === 'KOL' ? 'kolName' : 'kocName'] = metaName;
      if (isPR) {
        if (metaName) meta.outlet = metaName;
        meta.sentiment = metaSentiment;
      }
      await onSubmit({
        platform,
        type,
        url: url || null,
        title: title || null,
        publishedAt: new Date(publishedAt).toISOString(),
        reach: reach ? Number(reach) : 0,
        engagement: engagement ? Number(engagement) : 0,
        utmCampaign: utmCampaign || null,
        cost: cost ? Number(cost) : null,
        meta: Object.keys(meta).length > 0 ? meta : undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message ?? 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={initial ? 'Edit post' : 'Add post'}
      description="Media tracker — track owned, KOL/KOC, PR posts với reach, engagement, spend."
      icon={<Newspaper />}
      size="xl"
      submitLabel={submitting ? 'Saving…' : initial ? 'Update' : 'Add post'}
      isSubmitting={submitting}
      footerLeft={error ? <span className="text-error font-medium">{error}</span> : undefined}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FieldLabel label="Type">
          <select value={type} onChange={(e) => setType(e.target.value as MediaPostType)} className={SELECT_CLS}>
            {TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </FieldLabel>

        <FieldLabel label="Platform">
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as MediaPlatform)}
            className={SELECT_CLS}
          >
            {PLATFORM_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </FieldLabel>

        <Input
          label="Title"
          containerClassName="md:col-span-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title or headline"
        />

        <Input
          label="URL"
          containerClassName="md:col-span-2"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
        />

        <FieldLabel label="Published date">
          <input
            type="date"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
            required
            className={SELECT_CLS}
          />
        </FieldLabel>

        <Input
          label="utm_campaign"
          value={utmCampaign}
          onChange={(e) => setUtmCampaign(e.target.value.trim())}
          placeholder="summer_sale_2026"
          className="font-mono"
        />

        <Input
          label="Reach"
          type="number"
          min={0}
          value={reach}
          onChange={(e) => setReach(e.target.value)}
        />

        <Input
          label="Engagement"
          type="number"
          min={0}
          value={engagement}
          onChange={(e) => setEngagement(e.target.value)}
        />

        {(isKolKoc || isPR) && (
          <>
            <Input
              label={isPR ? 'Outlet name' : `${type} name`}
              containerClassName="md:col-span-2"
              value={metaName}
              onChange={(e) => setMetaName(e.target.value)}
              placeholder={isPR ? 'e.g. VnExpress' : 'e.g. Influencer Demo'}
            />

            <Input
              label="Cost (VND)"
              type="number"
              min={0}
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />

            {isPR && (
              <FieldLabel label="Sentiment">
                <select
                  value={metaSentiment}
                  onChange={(e) => setMetaSentiment(e.target.value as 'positive' | 'neutral' | 'negative')}
                  className={SELECT_CLS}
                >
                  <option value="positive">Positive</option>
                  <option value="neutral">Neutral</option>
                  <option value="negative">Negative</option>
                </select>
              </FieldLabel>
            )}
          </>
        )}
      </div>
    </FormDialog>
  );
}
