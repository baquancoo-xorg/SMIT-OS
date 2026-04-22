import { z } from 'zod';

// All valid work item types
export const WorkItemTypeEnum = z.enum([
  'Epic',
  'UserStory',
  'TechTask',
  'Campaign',
  'MktTask',
  'MediaTask',
  'SaleTask',
  'Deal',
]);

export const createWorkItemSchema = z.object({
  title: z.string().min(1, 'Title required').max(200),
  description: z.string().max(2000).optional().nullable(),
  type: WorkItemTypeEnum.default('TechTask'),
  status: z.enum(['Backlog', 'Todo', 'In Progress', 'Active', 'Doing', 'Review', 'Done', 'Void']).default('Backlog'),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).default('Medium'),
  assigneeId: z.string().uuid().nullable().optional(),
  sprintId: z.string().uuid().nullable().optional(),
  parentId: z.string().uuid().nullable().optional(),
  dueDate: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
});

export const updateWorkItemSchema = createWorkItemSchema.partial();

export const workItemKrLinkSchema = z.object({
  keyResultId: z.string().uuid(),
});

export const workItemDependencySchema = z.object({
  fromId: z.string().uuid(),
  toId:   z.string().uuid(),
});

export type CreateWorkItemInput = z.infer<typeof createWorkItemSchema>;
export type UpdateWorkItemInput = z.infer<typeof updateWorkItemSchema>;
