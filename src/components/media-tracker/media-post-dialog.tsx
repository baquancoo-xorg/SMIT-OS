import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import type { MediaPlatform, MediaPost, MediaPostType } from '../../types';

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
  // Free-form metadata fields, surfaced as plain text columns
  const [metaName, setMetaName] = useState(''); // KOL/KOC name OR PR outlet
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

  if (!open) return null;

  const isKolKoc = type === 'KOL' || type === 'KOC';
  const isPR = type === 'PR';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Media Tracker</p>
            <h3 className="text-2xl font-black font-headline text-on-surface">
              {initial ? 'Edit' : 'Add'} <span className="text-primary italic">post</span>
            </h3>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Type">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as MediaPostType)}
              className="input-field"
            >
              {TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Platform">
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as MediaPlatform)}
              className="input-field"
            >
              {PLATFORM_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Title" full>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title or headline"
              className="input-field"
            />
          </Field>

          <Field label="URL" full>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="input-field"
            />
          </Field>

          <Field label="Published date">
            <input
              type="date"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
              required
              className="input-field"
            />
          </Field>
          <Field label="utm_campaign">
            <input
              type="text"
              value={utmCampaign}
              onChange={(e) => setUtmCampaign(e.target.value.trim())}
              placeholder="summer_sale_2026"
              className="input-field font-mono"
            />
          </Field>

          <Field label="Reach">
            <input
              type="number"
              min={0}
              value={reach}
              onChange={(e) => setReach(e.target.value)}
              className="input-field"
            />
          </Field>
          <Field label="Engagement">
            <input
              type="number"
              min={0}
              value={engagement}
              onChange={(e) => setEngagement(e.target.value)}
              className="input-field"
            />
          </Field>

          {(isKolKoc || isPR) && (
            <>
              <Field label={isPR ? 'Outlet name' : `${type} name`} full>
                <input
                  type="text"
                  value={metaName}
                  onChange={(e) => setMetaName(e.target.value)}
                  placeholder={isPR ? 'e.g. VnExpress' : 'e.g. Influencer Demo'}
                  className="input-field"
                />
              </Field>
              <Field label="Cost (VND)">
                <input
                  type="number"
                  min={0}
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="input-field"
                />
              </Field>
              {isPR && (
                <Field label="Sentiment">
                  <select
                    value={metaSentiment}
                    onChange={(e) => setMetaSentiment(e.target.value as any)}
                    className="input-field"
                  >
                    <option value="positive">Positive</option>
                    <option value="neutral">Neutral</option>
                    <option value="negative">Negative</option>
                  </select>
                </Field>
              )}
            </>
          )}
        </div>

        {error && (
          <div className="px-6 pb-2 text-error text-xs font-bold">{error}</div>
        )}

        <div className="flex justify-end gap-3 p-6 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center gap-2 h-10 px-5 rounded-full bg-surface-container-high text-slate-600 hover:bg-slate-200 font-black text-[10px] uppercase tracking-widest transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 h-10 bg-primary text-white px-5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-95 transition-all disabled:opacity-50 min-w-[130px]"
          >
            {submitting ? 'Saving…' : initial ? 'Update' : 'Add post'}
          </button>
        </div>
      </form>
      <style>{`
        .input-field {
          width: 100%;
          height: 40px;
          padding: 0 16px;
          border-radius: 12px;
          border: 1px solid rgb(226 232 240);
          background: white;
          font-size: 14px;
          transition: border-color 0.15s;
        }
        .input-field:focus {
          outline: none;
          border-color: rgb(99 102 241);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
      `}</style>
    </div>
  );
}

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={full ? 'md:col-span-2' : ''}>
      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
