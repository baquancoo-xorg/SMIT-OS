import type { MediaPlatform } from '../../types';

const PLATFORM_STYLE: Record<MediaPlatform, { label: string; bg: string; text: string; border: string; icon: string }> = {
  FACEBOOK: { label: 'Facebook', bg: 'bg-[#0866FF]/10', text: 'text-[#0866FF]', border: 'border-[#0866FF]/20', icon: 'thumb_up' },
  INSTAGRAM: { label: 'Instagram', bg: 'bg-[#E4405F]/10', text: 'text-[#E4405F]', border: 'border-[#E4405F]/20', icon: 'photo_camera' },
  YOUTUBE: { label: 'YouTube', bg: 'bg-[#FF0000]/10', text: 'text-[#FF0000]', border: 'border-[#FF0000]/20', icon: 'smart_display' },
  BLOG: { label: 'Blog', bg: 'bg-[#0059B6]/10', text: 'text-[#0059B6]', border: 'border-[#0059B6]/20', icon: 'edit_note' },
  PR: { label: 'PR', bg: 'bg-[#F54A00]/10', text: 'text-[#F54A00]', border: 'border-[#F54A00]/20', icon: 'newspaper' },
  OTHER: { label: 'Other', bg: 'bg-slate-200', text: 'text-slate-500', border: 'border-slate-300', icon: 'more_horiz' },
};

export default function PlatformBadge({ platform }: { platform: MediaPlatform }) {
  const s = PLATFORM_STYLE[platform];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${s.bg} ${s.text} ${s.border}`}
    >
      <span className="material-symbols-outlined text-[12px]">{s.icon}</span>
      {s.label}
    </span>
  );
}
