export type Department = 'BOD' | 'Tech' | 'Marketing' | 'Media' | 'Sale';

export interface User {
  id: string;
  fullName: string;
  department: string;
  role: string;
  avatar: string;
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
}

export interface Objective {
  id: string;
  title: string;
  department: string;
  progressPercentage: number;
  keyResults: KeyResult[];
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
  dueDate?: string;
  estimatedTime?: string;
  storyPoints?: number;
  storyPoint?: number; // Added for compatibility with some components
  subtasks?: any[];
  createdAt: string;
  updatedAt: string;
  
  // Specific fields
  dealValue?: number;
  leadsCount?: number;
  
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
