import { z } from 'zod'

export const createMenuSchema = z.object({
  name: z.string().min(1, 'メニュー名は必須です').max(200),
  description: z.string().optional(),
  categoryId: z.string().uuid().optional().nullable(),
  durationMinutes: z.number().int().min(5, '5分以上で設定してください'),
  bufferMinutes: z.number().int().min(0).default(0),
  basePrice: z.number().int().min(0, '0円以上で設定してください'),
  imageUrl: z.string().url().optional().nullable(),
  isActive: z.boolean().default(true),
})

export const updateMenuSchema = createMenuSchema.partial()

export const createPricingRuleSchema = z.object({
  ruleType: z.enum(['day_of_week', 'time_slot', 'day_and_time']),
  dayOfWeek: z.array(z.number().int().min(0).max(6)).default([]),
  timeFrom: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  timeTo: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  price: z.number().int().min(0),
  label: z.string().max(50).optional().nullable(),
  priority: z.number().int().default(0),
})

export const createMenuOptionSchema = z.object({
  name: z.string().min(1, 'オプション名は必須です').max(200),
  price: z.number().int().min(0),
  durationMinutes: z.number().int().min(0).default(0),
  isRequired: z.boolean().default(false),
  maxSelections: z.number().int().min(0).default(1),
  isActive: z.boolean().default(true),
})
