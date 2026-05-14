import { z } from 'zod';

export const createCommentSchema = z.object({
  body: z.string().trim().min(1, 'Nội dung không được để trống').max(2000, 'Tối đa 2000 ký tự'),
});

export const updateCommentSchema = z.object({
  body: z.string().trim().min(1, 'Nội dung không được để trống').max(2000, 'Tối đa 2000 ký tự'),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
