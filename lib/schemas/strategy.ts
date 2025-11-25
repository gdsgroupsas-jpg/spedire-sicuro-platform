// Zod validation schemas for Strategic Planning
import { z } from 'zod';

// ============================================
// SWOT ANALYSIS SCHEMAS
// ============================================

export const swotCategorySchema = z.enum([
  'strengths',
  'weaknesses',
  'opportunities',
  'threats',
]);

export const actionItemSchema = z.object({
  id: z.string().uuid(),
  text: z.string().min(1, 'Action text is required'),
  completed: z.boolean().default(false),
  due_date: z.string().optional(),
});

export const createSwotItemSchema = z.object({
  category: swotCategorySchema,
  title: z.string().min(3, 'Title must be at least 3 characters').max(255),
  description: z.string().optional(),
  impact_score: z.number().int().min(1).max(5).optional(),
  probability_score: z.number().int().min(1).max(5).optional(),
  priority: z.number().int().default(0),
  action_items: z.array(actionItemSchema).default([]),
});

export const updateSwotItemSchema = createSwotItemSchema.partial().extend({
  id: z.string().uuid(),
});

// ============================================
// COMPANY STRATEGY SCHEMAS
// ============================================

export const createCompanyStrategySchema = z.object({
  mission: z.string().optional(),
  vision: z.string().optional(),
  values: z.array(z.string()).default([]),
  elevator_pitch: z.string().optional(),
  tagline: z.string().max(100, 'Tagline must be under 100 characters').optional(),
});

export const updateCompanyStrategySchema = createCompanyStrategySchema.partial().extend({
  id: z.string().uuid(),
});

// ============================================
// BUSINESS CANVAS SCHEMAS
// ============================================

export const canvasSegmentSchema = z.enum([
  'key_partners',
  'key_activities',
  'key_resources',
  'value_propositions',
  'customer_relationships',
  'channels',
  'customer_segments',
  'cost_structure',
  'revenue_streams',
]);

export const createCanvasItemSchema = z.object({
  segment: canvasSegmentSchema,
  title: z.string().min(3, 'Title must be at least 3 characters').max(255),
  description: z.string().optional(),
  details: z.record(z.any()).default({}),
  priority: z.number().int().default(0),
});

export const updateCanvasItemSchema = createCanvasItemSchema.partial().extend({
  id: z.string().uuid(),
});

// ============================================
// MEDIA BUDGET SCHEMAS
// ============================================

export const expenseCategorySchema = z.enum([
  'advertising',
  'social_media',
  'content',
  'tools',
  'events',
  'other',
]);

export const mediaBudgetExpenseSchema = z.object({
  id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  description: z.string().min(1, 'Description is required'),
  amount: z.number().min(0, 'Amount must be positive'),
  category: expenseCategorySchema,
});

export const createMediaBudgetSchema = z.object({
  year: z.number().int().min(2020).max(2100),
  month: z.number().int().min(1).max(12),
  planned_budget: z.number().default(0),
  actual_spent: z.number().default(0),
  expenses: z.array(mediaBudgetExpenseSchema).default([]),
  notes: z.string().optional(),
  alert_threshold: z.number().default(100),
});

export const updateMediaBudgetSchema = createMediaBudgetSchema.partial().extend({
  id: z.string().uuid(),
});

export const addExpenseSchema = z.object({
  media_budget_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  description: z.string().min(1, 'Description is required'),
  amount: z.number().positive('Amount must be positive'),
  category: expenseCategorySchema,
});

// ============================================
// QUERY SCHEMAS
// ============================================

export const swotFilterSchema = z.object({
  category: swotCategorySchema.optional(),
  min_impact: z.number().int().min(1).max(5).optional(),
  min_probability: z.number().int().min(1).max(5).optional(),
});

export const canvasFilterSchema = z.object({
  segment: canvasSegmentSchema.optional(),
});

export const budgetFilterSchema = z.object({
  year: z.number().int().optional(),
  month: z.number().int().min(1).max(12).optional(),
});

// ============================================
// EXPORT SCHEMAS
// ============================================

export const exportStrategySchema = z.object({
  include_mission_vision: z.boolean().default(true),
  include_swot: z.boolean().default(true),
  include_canvas: z.boolean().default(true),
  include_budget: z.boolean().default(true),
  format: z.enum(['pdf', 'json', 'csv']).default('pdf'),
});

// Type exports for TypeScript
export type SwotCategory = z.infer<typeof swotCategorySchema>;
export type ActionItem = z.infer<typeof actionItemSchema>;
export type CreateSwotItemDto = z.infer<typeof createSwotItemSchema>;
export type UpdateSwotItemDto = z.infer<typeof updateSwotItemSchema>;

export type CreateCompanyStrategyDto = z.infer<typeof createCompanyStrategySchema>;
export type UpdateCompanyStrategyDto = z.infer<typeof updateCompanyStrategySchema>;

export type CanvasSegment = z.infer<typeof canvasSegmentSchema>;
export type CreateCanvasItemDto = z.infer<typeof createCanvasItemSchema>;
export type UpdateCanvasItemDto = z.infer<typeof updateCanvasItemSchema>;

export type ExpenseCategory = z.infer<typeof expenseCategorySchema>;
export type MediaBudgetExpense = z.infer<typeof mediaBudgetExpenseSchema>;
export type CreateMediaBudgetDto = z.infer<typeof createMediaBudgetSchema>;
export type UpdateMediaBudgetDto = z.infer<typeof updateMediaBudgetSchema>;
export type AddExpenseDto = z.infer<typeof addExpenseSchema>;

export type ExportStrategyDto = z.infer<typeof exportStrategySchema>;
