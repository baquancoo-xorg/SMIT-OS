// Team types
export type TeamType = 'tech' | 'marketing' | 'media' | 'sale';

// Ad-hoc task (công việc phát sinh ngoài OKRs)
export interface AdHocTask {
  id: number;
  name: string;
  requester: string;
  impact: 'low' | 'medium' | 'high';
  status: 'done' | 'in-progress';
  hoursSpent: number;
}

export type AdHocTaskImpact = AdHocTask['impact'];
export type AdHocTaskStatus = AdHocTask['status'];

// Tech team metrics
export interface TechMetrics {
  prLink?: string;
  testStatus?: 'local' | 'staging' | 'prod';
  taskType?: 'feature' | 'bug';
  blockedBy?: 'design' | 'qa' | 'devops' | 'external';
  isP0?: boolean;
}

// Marketing team metrics
export interface MarketingMetrics {
  spend?: number;
  mqls?: number;
  cpa?: number;
  adsTested?: number;
  channel?: 'fb' | 'google' | 'tiktok';
  campStatus?: 'normal' | 'testing' | 'waiting_media' | 'expensive' | 'banned';
  isKeyCamp?: boolean;
  link?: string;
}

// Media team metrics
export interface MediaMetrics {
  link?: string;
  version?: 'demo' | 'final' | 'published';
  publicationsCount?: number;
  views?: string;
  engagement?: string;
  followers?: number;
  revisionCount?: 'v1' | 'v2' | 'v3+';
  prodStatus?: 'editing' | 'rendering' | 'feedback';
  contentType?: 'video_long' | 'video_short' | 'image' | 'banner';
  isHotSLA?: boolean;
}

// Sale team metrics
export interface SaleMetrics {
  leadsReceived?: number;
  leadsAttempted?: number;
  leadsQualified?: number;
  demosBooked?: number;
  leadsUnqualified?: number;
  oppValue?: number;
  revenue?: number;
  ticketsResolved?: number;
  ticketType?: 'bug' | 'guide' | 'feature';
  followupStatus?: 'following' | 'waiting_customer' | 'waiting_internal';
  isHotDeal?: boolean;
  note?: string;
}

// Union type for all team metrics
export type TeamMetrics = TechMetrics | MarketingMetrics | MediaMetrics | SaleMetrics;

// Task entry for yesterday tasks
export interface TaskEntry {
  taskId: string;
  status: 'done' | 'doing';
  progress?: number;
  metrics?: TeamMetrics;
}

// Blocker entry
export interface BlockerEntry {
  id: string;
  taskId?: string;
  taskTitle?: string;
  description: string;
  impact: 'none' | 'low' | 'high';
  tags?: string[];
}

// Today plan entry
export interface TodayPlanEntry {
  id: string;
  taskId?: string;
  taskTitle?: string;
  output: string;
  progress: number;
  isPriority?: boolean; // P0, Key Camp, Hot SLA, Hot Deal
}

// Extended tasks data structure
export interface ExtendedTasksData {
  yesterdayTasks: TaskEntry[];
  blockers: BlockerEntry[];
  todayPlans: TodayPlanEntry[];
}

// Team color themes
export const TEAM_THEMES: Record<TeamType, { primary: string; accent: string; flag: string; bg: string; bgLight: string; border: string; text: string }> = {
  tech: { primary: 'indigo', accent: 'indigo-100', flag: 'red', bg: 'bg-indigo-600', bgLight: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-600' },
  marketing: { primary: 'orange', accent: 'orange-100', flag: 'orange', bg: 'bg-orange-600', bgLight: 'bg-orange-50', border: 'border-orange-100', text: 'text-orange-600' },
  media: { primary: 'pink', accent: 'pink-100', flag: 'red', bg: 'bg-pink-600', bgLight: 'bg-pink-50', border: 'border-pink-100', text: 'text-pink-600' },
  sale: { primary: 'success', accent: 'success-container', flag: 'red', bg: 'bg-success', bgLight: 'bg-success-container/40', border: 'border-success-container/60', text: 'text-success' },
};

// Blocker tags per team
export const BLOCKER_TAGS: Record<TeamType, string[]> = {
  tech: ['[Chờ API từ BE]', '[Chờ Design UI]', '[Lỗi Môi trường/Server]'],
  marketing: ['[Chờ Video]', '[Chờ Tech (Web)]', '[TKQC chết/Khóa page]'],
  media: ['[Chờ Brief từ MKT]', '[Chờ PM/BOD duyệt]', '[Thiếu Source quay/VJ]'],
  sale: ['[Khách chê giá cao]', '[Chờ Tech fix lỗi/ticket]', '[Lead rác/Sai số]'],
};
