import { z } from 'zod'

export const createReservationSchema = z.object({
  menuId: z.string().uuid(),
  staffId: z.string().uuid().optional().nullable(),
  startsAt: z.string().datetime(),
  optionIds: z.array(z.string().uuid()).default([]),
  customer: z.object({
    name: z.string().min(1, 'お名前は必須です'),
    nameKana: z.string().optional(),
    email: z.string().email('メールアドレスの形式が正しくありません'),
    phone: z.string().min(1, '電話番号は必須です'),
  }),
  useTicketId: z.string().uuid().optional().nullable(),
  memo: z.string().optional(),
})

export const updateReservationSchema = z.object({
  status: z.enum(['confirmed', 'completed', 'cancelled', 'no_show']).optional(),
  staffId: z.string().uuid().optional().nullable(),
  startsAt: z.string().datetime().optional(),
  memo: z.string().optional(),
  cancelReason: z.string().optional(),
})
