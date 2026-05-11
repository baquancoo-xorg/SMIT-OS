export type Department = 'BOD' | 'Tech' | 'Marketing' | 'Media' | 'Sale';

export interface User {
  id: string;
  fullName: string;
  username: string;
  password?: string;
  departments: string[];  // Multiple departments supported
  role: string; // Admin, Member
  scope?: string; // Vị trí công việc
  avatar: string;
  isAdmin: boolean;
  totpEnabled?: boolean;
}

export interface OkrCycle {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface KeyResult {
  id: string;
  title: string;
  progressPercentage: number;
  objectiveId: string;
  ownerId?: string | null;
  owner?: { id: string; fullName: string; avatar?: string } | null;
  currentValue?: number;
  targetValue?: number;
  unit?: string;
  dueDate?: string;
  lastNote?: string;
  parentKrId?: string; // For L2 KRs, references parent L1 KR for alignment
}

export interface Objective {
  id: string;
  title: string;
  department: string;
  progressPercentage: number;
  level?: string; // 'L1' or 'L2'
  parentId?: string; // For L2 objectives, references parent L1 objective
  ownerId?: string;
  owner?: User;
  keyResults: KeyResult[];
  children?: Objective[]; // For L1 objectives with child L2 objectives
}

// Wodtke 5-block weekly check-in payload (stringified JSON in DB columns).
export interface KrCheckin {
  krId: string;
  currentValue: number;
  confidence0to10: number;
  note?: string;
}

export interface WeeklyPriority {
  text: string;
  done: boolean;
}

export interface WeeklyReport {
  id: string;
  userId: string;
  user?: User;
  weekEnding: string;
  // Stored as JSON strings in DB; parsed on read.
  krProgress: string; // JSON: KrCheckin[]
  progress: string;   // JSON: {priorities: WeeklyPriority[]}
  plans: string;      // JSON: {topThree: string[]}
  blockers: string;   // JSON: {risks: string, helpNeeded: string}
  status: 'Review' | 'Approved';
  approvedBy?: string;
  approver?: { id: string; fullName: string };
  approvedAt?: string;
  approvalComment?: string;
  rawData?: Record<string, unknown> | null;
  createdAt: string;
}

export interface DailyReport {
  id: string;
  userId: string;
  user?: User;
  reportDate: string;
  status: 'Review' | 'Approved';
  // 4 plain text fields.
  completedYesterday: string;
  doingYesterday: string;
  blockers: string;
  planToday: string;
  rawData?: Record<string, unknown> | null;
  approvedBy?: string;
  approver?: { id: string; fullName: string };
  approvedAt?: string;
  approvalComment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  customerName: string;
  ae: string;
  receivedDate: string;
  resolvedDate?: string | null;
  status: string;
  leadType?: string | null;
  unqualifiedType?: string | null;
  notes?: string | null;
  source?: string | null;
  crmSubscriberId?: string | null;
  syncedFromCrm?: boolean;
  lastSyncedAt?: string | null;
  deleteRequestedBy?: string | null;
  deleteRequestedAt?: string | null;
  deleteReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadAuditLog {
  id: string;
  leadId: string;
  changes: Record<string, { from: string | null; to: string | null }>;
  createdAt: string;
}

export interface LeadDailyStat {
  date: string;
  ae: string;
  added: number;
  processed: number;
  remaining: number;
  dailyRate: number | null;
  totalRate: number | null;
}

// Acquisition trackers (Phase 3+4 — plan 260510-0237)
export type AdPlatform = 'META';
export type MediaPlatform = 'FACEBOOK' | 'INSTAGRAM' | 'YOUTUBE' | 'BLOG' | 'PR' | 'OTHER';
export type MediaPostType = 'ORGANIC' | 'KOL' | 'KOC' | 'PR';

export interface AdsCampaignSummary {
  id: string;
  platform: AdPlatform;
  externalId: string;
  name: string;
  status: string;
  utmCampaign: string | null;
  startedAt: string | null;
  endedAt: string | null;
  spendTotal: number;
  impressions: number;
  clicks: number;
  conversions: number;
  currency: string;
  ctr: number;
}

export interface AdsCampaignDetail {
  id: string;
  platform: AdPlatform;
  externalId: string;
  name: string;
  status: string;
  utmCampaign: string | null;
  startedAt: string | null;
  endedAt: string | null;
  meta: Record<string, unknown> | null;
}

export interface AdsDailySpendPoint {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  currency: string;
}

export interface AdsAttribution {
  campaignId: string;
  campaignName: string;
  utmCampaign: string | null;
  spendTotal: number;
  currency: string;
  leadCount: number;
  qualifiedCount: number;
  cpl: number | null;
  leadIds: string[];
}

export interface MediaPost {
  id: string;
  platform: MediaPlatform;
  externalId: string | null;
  url: string | null;
  title: string | null;
  publishedAt: string;
  reach: number;
  engagement: number;
  utmCampaign: string | null;
  type: MediaPostType;
  cost: number | null;
  createdById: string | null;
  meta: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface AcquisitionJourneyStage {
  label: string;
  steps: Array<{
    name: string;
    value: number;
    conversionFromPrev: number | null; // 0..1
  }>;
}

export interface AcquisitionJourney {
  range: { from: string; to: string };
  stages: {
    pre: AcquisitionJourneyStage;
    in: AcquisitionJourneyStage;
    post: AcquisitionJourneyStage;
  };
  totals: {
    reach: number;
    clicks: number;
    visits: number;
    leads: number;
    trials: number;
    activeUsers: number;
    paidCustomers: number;
    revenue: number;
  };
}
