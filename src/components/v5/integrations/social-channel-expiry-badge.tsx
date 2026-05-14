/**
 * social-channel-expiry-badge.tsx — Token expiry status badge for SocialChannel rows.
 */

interface ExpiryBadgeProps {
  tokenExpiresAt: string | null;
}

function getDaysUntil(iso: string): number {
  return Math.floor((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function SocialChannelExpiryBadge({ tokenExpiresAt }: ExpiryBadgeProps) {
  if (!tokenExpiresAt) {
    return (
      <span className="inline-flex items-center rounded-full border border-outline-variant bg-surface-container px-2 py-0.5 text-[length:var(--text-caption)] font-semibold text-on-surface-variant">
        No expiry
      </span>
    );
  }

  const days = getDaysUntil(tokenExpiresAt);

  if (days < 0) {
    return (
      <span className="inline-flex items-center rounded-full border border-error/30 bg-error-container px-2 py-0.5 text-[length:var(--text-caption)] font-semibold text-on-error-container">
        Expired {Math.abs(days)}d ago
      </span>
    );
  }

  if (days < 7) {
    return (
      <span className="inline-flex items-center rounded-full border border-error/30 bg-error-container px-2 py-0.5 text-[length:var(--text-caption)] font-semibold text-on-error-container">
        Expires in {days}d
      </span>
    );
  }

  if (days <= 30) {
    return (
      <span className="inline-flex items-center rounded-full border border-warning/30 bg-warning-container px-2 py-0.5 text-[length:var(--text-caption)] font-semibold text-on-warning-container">
        Expires in {days}d
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full border border-success/30 bg-success-container px-2 py-0.5 text-[length:var(--text-caption)] font-semibold text-on-success-container">
      Valid
    </span>
  );
}
