import type { MediaPlatform } from '../../types';

/**
 * Platform-specific badge với brand colors (Facebook blue, Instagram pink, YouTube red, etc.).
 *
 * Phase 8 follow-up (2026-05-10): switched to v2 design tokens (rounded-chip,
 * text-label var, tracking-wide) trong khi giữ brand-specific colors. Brand
 * colors KHÔNG map sang v2 Badge semantic variants.
 */
const PLATFORM_STYLE: Record<
  MediaPlatform,
  { label: string; bg: string; text: string; border: string; icon: string }
> = {
  FACEBOOK: { label: 'Facebook', bg: 'bg-[#0866FF]/10', text: 'text-[#0866FF]', border: 'border-[#0866FF]/20', icon: 'thumb_up' },
  INSTAGRAM: { label: 'Instagram', bg: 'bg-[#E4405F]/10', text: 'text-[#E4405F]', border: 'border-[#E4405F]/20', icon: 'photo_camera' },
  YOUTUBE: { label: 'YouTube', bg: 'bg-[#FF0000]/10', text: 'text-[#FF0000]', border: 'border-[#FF0000]/20', icon: 'smart_display' },
  BLOG: { label: 'Blog', bg: 'bg-[#0059B6]/10', text: 'text-[#0059B6]', border: 'border-[#0059B6]/20', icon: 'edit_note' },
  PR: { label: 'PR', bg: 'bg-[#F54A00]/10', text: 'text-[#F54A00]', border: 'border-[#F54A00]/20', icon: 'newspaper' },
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
