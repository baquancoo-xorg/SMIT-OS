import type { MediaPlatform } from '../../types';

const PLATFORM_STYLE: Record<
  MediaPlatform,
  { label: string; bg: string; text: string; border: string; icon: string }
> = {
  FACEBOOK: { label: 'Facebook', bg: 'bg-info-container/40', text: 'text-info', border: 'border-info-container/60', icon: 'thumb_up' },
  INSTAGRAM: { label: 'Instagram', bg: 'bg-secondary-container/40', text: 'text-secondary', border: 'border-secondary-container/60', icon: 'photo_camera' },
  YOUTUBE: { label: 'YouTube', bg: 'bg-error-container/40', text: 'text-error', border: 'border-error-container/60', icon: 'smart_display' },
  BLOG: { label: 'Blog', bg: 'bg-info-container/40', text: 'text-info', border: 'border-info-container/60', icon: 'edit_note' },
  PR: { label: 'PR', bg: 'bg-primary-container/40', text: 'text-primary', border: 'border-primary-container/60', icon: 'newspaper' },
  OTHER: { label: 'Other', bg: 'bg-surface-container', text: 'text-on-surface-variant', border: 'border-outline-variant', icon: 'more_horiz' },
};

export default function PlatformBadge({ platform }: { platform: MediaPlatform }) {
  const s = PLATFORM_STYLE[platform];
  return (
    <span
      className={`inline-flex h-5 items-center gap-1 rounded-chip border px-2 text-[length:var(--text-caption)] font-medium tracking-[var(--tracking-wide)] whitespace-nowrap ${s.bg} ${s.text} ${s.border}`}
    >
      <span className="material-symbols-outlined text-[12px]">{s.icon}</span>
      {s.label}
    </span>
  );
}
