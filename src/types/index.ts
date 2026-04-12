export type Department = 'BOD' | 'Tech' | 'Marketing' | 'Media' | 'Sale';

export interface User {
  id: string;
  fullName: string;
  department: Department;
  role: string;
  avatar?: string;
}

export interface SubKeyResult {
  id: string;
  title: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  dueDate?: string;
  lastNote?: string;
}

export interface KeyResult {
  id: string;
  title: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  dueDate?: string;
  subKeyResults?: SubKeyResult[];
  lastNote?: string;
}

export interface Objective {
  id: string;
  level: 'L1' | 'L2';
  title: string;
  ownerId: string;
  department?: Department;
  parentObjectiveId?: string;
  quarter: string;
  progressPercentage: number;
  keyResults: KeyResult[];
}

export type WorkItemType = 'Epic' | 'UserStory' | 'TechTask' | 'Campaign' | 'MediaTask' | 'MktTask' | 'Deal' | 'SaleTask';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface WorkItem {
  id: string;
  type: WorkItemType;
  title: string;
  description?: string;
  priority?: Priority;
  estimatedTime?: string;
  subtasks?: SubTask[];
  linkedKrId?: string;
  assigneeId: string;
  status: string;
  sprintId?: string;
  storyPoint?: number;
  customerName?: string;
  dealValue?: number;
  dueDate?: string;
}
