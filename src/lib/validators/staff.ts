import { z } from 'zod'

export const createStaffSchema = z.object({
  name: z.string().min(1, '名前は必須です').max(100),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  role: z.enum(['owner', 'admin', 'staff']).default('staff'),
  avatarUrl: z.string().url().optional().nullable(),
  bio: z.string().optional().nullable(),
  nominationFee: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  menuIds: z.array(z.string().uuid()).optional(),
})

export const updateStaffSchema = createStaffSchema.partial()
