// PostHog event taxonomy for Product dashboard funnel
// Updated based on audit 2026-05-07 - using Vietnamese event names (active)

export const FUNNEL_EVENTS = [
  'Bắt đầu trang onboarding',
  'Vào trang tạo doanh nghiệp',
  'Tạo doanh nghiệp thành công',
  'Hoàn thành tất cả nhiệm vụ',
] as const;

export type FunnelEventName = (typeof FUNNEL_EVENTS)[number];

// Event display names for UI
export const EVENT_DISPLAY_NAMES: Record<FunnelEventName, string> = {
  'Bắt đầu trang onboarding': 'Start Onboarding',
  'Vào trang tạo doanh nghiệp': 'Enter Create Business',
  'Tạo doanh nghiệp thành công': 'Business Created',
  'Hoàn thành tất cả nhiệm vụ': 'Onboarding Completed',
};
