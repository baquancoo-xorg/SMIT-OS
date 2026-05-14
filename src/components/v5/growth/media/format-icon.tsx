import type { FC } from 'react';
import { MessageSquare, Image, Video, Clapperboard, Layers, Link2, CalendarDays, FileText } from 'lucide-react';

export type MediaFormat = 'STATUS' | 'PHOTO' | 'VIDEO' | 'REEL' | 'ALBUM' | 'LINK' | 'EVENT';

interface FormatIconProps {
  format: MediaFormat | string;
  className?: string;
}

const FORMAT_MAP: Record<MediaFormat, { icon: FC<{ className?: string }>; color: string; label: string }> = {
  STATUS:  { icon: MessageSquare, color: 'text-on-surface-variant', label: 'Status' },
  PHOTO:   { icon: Image,         color: 'text-info',               label: 'Photo' },
  VIDEO:   { icon: Video,         color: 'text-success',            label: 'Video' },
  REEL:    { icon: Clapperboard,  color: 'text-warning',            label: 'Reel' },
  ALBUM:   { icon: Layers,        color: 'text-info',               label: 'Album' },
  LINK:    { icon: Link2,         color: 'text-on-surface-variant', label: 'Link' },
  EVENT:   { icon: CalendarDays,  color: 'text-primary',            label: 'Event' },
};

export function FormatIcon({ format, className = '' }: FormatIconProps) {
  const entry = FORMAT_MAP[format as MediaFormat];
  if (!entry) {
    return <FileText className={`size-4 text-on-surface-variant ${className}`} aria-label={format} />;
  }
  const { icon: Icon, color, label } = entry;
  return <Icon className={`size-4 ${color} ${className}`} aria-label={label} />;
}

export function formatLabel(format: MediaFormat | string): string {
  return FORMAT_MAP[format as MediaFormat]?.label ?? format;
}
