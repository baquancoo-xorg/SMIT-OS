export type Department = 'BOD' | 'Tech' | 'Marketing' | 'Media' | 'Sale';

export interface User {
  id: string;
  fullName: string;
  username: string;
  password?: string;
  department: string;
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

export interface WorkItem {
  id: string;
  type: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  assigneeId?: string;
  sprintId?: string;
  linkedKrId?: string;
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
  createdAt: string;
}
