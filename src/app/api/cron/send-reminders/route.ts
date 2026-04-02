export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendReminder } from '@/lib/email'

export async function POST(req: NextRequest) {
  // Vercel Cronからの呼び出しを検証
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)

  const tomorrowEnd = new Date(tomorrow)
  tomorrowEnd.setHours(23, 59, 59, 999)

  const reservations = await prisma.reservation.findMany({
    where: {
      status: 'confirmed',
      startsAt: { gte: tomorrow, lte: tomorrowEnd },
    },
    include: {
      customer: true,
      staff: true,
      menu: true,
      tenant: true,
    },
  })

  let sent = 0
  for (const r of reservations) {
    if (!r.customer.email) continue
    try {
      await sendReminder({
        customerName: r.customer.name,
        customerEmail: r.customer.email,
        tenantName: r.tenant.name,
        menuName: r.menu.name,
        staffName: r.staff?.name || null,
        startsAt: r.startsAt,
        totalPrice: r.totalPrice,
        options: [],
      })
      sent++
    } catch (e) {
      console.error(`Reminder failed for reservation ${r.id}:`, e)
    }
  }

  return NextResponse.json({ sent, total: reservations.length })
}
