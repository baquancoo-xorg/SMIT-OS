export type Department = 'BOD' | 'Tech' | 'Marketing' | 'Media' | 'Sale';

export interface User {
  id: string;
  fullName: string;
  username: string;
  password?: string;
  departments: string[];  // Multiple departments supported
  role: string; // Admin, Leader, Member
  scope?: string; // Vị trí công việc
  avatar: string;
  isAdmin: boolean;
}

export interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
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

export type WorkItemType = 'Epic' | 'UserStory' | 'TechTask' | 'Campaign' | 'MediaTask' | 'MktTask' | 'Deal' | 'SaleTask' | 'Task';

export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

// Task types for Workspace boards
export const TASK_TYPES: WorkItemType[] = ['TechTask', 'MktTask', 'MediaTask', 'SaleTask', 'Deal', 'Campaign'];

// Epic/Story types for Team Backlog
export const BACKLOG_TYPES: WorkItemType[] = ['Epic', 'UserStory'];

// Type guards
export const isTaskType = (type: string): boolean => TASK_TYPES.includes(type as WorkItemType);
export const isBacklogType = (type: string): boolean => BACKLOG_TYPES.includes(type as WorkItemType);

export interface WorkItemKrLink {
  id: string;
  workItemId: string;
  keyResultId: string;
  keyResult?: KeyResult & {
    objective?: { id: string; title: string; department: string };
  };
  createdAt: string;
}

export interface WorkItem {
  id: string;
  type: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  assigneeId?: string;
  sprintId?: string;

  // Hierarchy: Epic -> Story -> Task
  parentId?: string;
  parent?: { id: string; title: string; type: string };
  children?: { id: string; title: string; type: string; status: string }[];

  // KR links via junction table
  krLinks?: WorkItemKrLink[];

  startDate?: string;
  dueDate?: string;
  estimatedTime?: string;
  storyPoints?: number;
  storyPoint?: number; // Added for compatibility with some components
  subtasks?: any[];
  createdAt: string;
  updatedAt: string;

  // Relations (optional for frontend display)
  assignee?: User;
  sprint?: Sprint;
}

export interface WeeklyReport {
  id: string;
  userId: string;
  user?: User;
  weekEnding: string;
  progress: string; // JSON string
  plans: string;    // JSON string
  blockers: string; // JSON string
  score: number;
  confidenceScore?: number;
  status: 'Review' | 'Approved';
  approvedBy?: string;
  approver?: { id: string; fullName: string };
  approvedAt?: string;
  krProgress?: string; // JSON: [{krId, currentValue, progressPct}]
  createdAt: string;
}

export interface DailyReport {
  id: string;
  userId: string;
  user?: User;
  reportDate: string;
  status: 'Review' | 'Approved';
  tasksData: string; // JSON: {completedYesterday: string[], doingYesterday: string[], doingToday: string[]}
  blockers?: string;
  impactLevel?: 'none' | 'low' | 'high';
  approvedBy?: string;
  approver?: { id: string; fullName: string };
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyReportTasksData {
  completedYesterday: string[];
  doingYesterday: string[];
  doingToday: string[];
}
