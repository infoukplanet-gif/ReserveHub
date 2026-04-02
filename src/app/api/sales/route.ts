export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedTenantId } from '@/lib/auth'
import { ApiError, handleApiError } from '@/lib/api-error'


export async function GET() {
  try {
    const tenantId = await getAuthenticatedTenantId()
    const now = new Date()

    // 過去4ヶ月の月別売上
    const monthly = []
    for (let i = 0; i < 4; i++) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)
      const [stats, newCust] = await Promise.all([
        prisma.reservation.aggregate({
          where: { tenantId, startsAt: { gte: start, lte: end }, status: { in: ['confirmed', 'completed'] } },
          _sum: { totalPrice: true }, _count: true,
        }),
        prisma.customer.count({ where: { tenantId, createdAt: { gte: start, lte: end } } }),
      ])
      monthly.push({
        month: `${start.getFullYear()}/${String(start.getMonth() + 1).padStart(2, '0')}`,
        revenue: stats._sum.totalPrice || 0,
        bookings: stats._count,
        newCustomers: newCust,
      })
    }

    // メニュー別ランキング（今月）
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const menuReservations = await prisma.reservation.findMany({
      where: { tenantId, startsAt: { gte: monthStart }, status: { in: ['confirmed', 'completed'] } },
      include: { menu: true },
    })

    const menuMap = new Map<string, { name: string; count: number; revenue: number }>()
    for (const r of menuReservations) {
      const key = r.menuId
      const existing = menuMap.get(key) || { name: r.menu.name, count: 0, revenue: 0 }
      existing.count++
      existing.revenue += r.totalPrice
      menuMap.set(key, existing)
    }
    const menuRanking = Array.from(menuMap.values()).sort((a, b) => b.count - a.count).slice(0, 5)

    // スタッフ別ランキング
    const staffReservations = await prisma.reservation.findMany({
      where: { tenantId, startsAt: { gte: monthStart }, status: { in: ['confirmed', 'completed'] }, staffId: { not: null } },
      include: { staff: true },
    })

    const staffMap = new Map<string, { name: string; bookings: number; revenue: number }>()
    for (const r of staffReservations) {
      if (!r.staff) continue
      const key = r.staffId!
      const existing = staffMap.get(key) || { name: r.staff.name, bookings: 0, revenue: 0 }
      existing.bookings++
      existing.revenue += r.totalPrice
      staffMap.set(key, existing)
    }
    const staffRanking = Array.from(staffMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5)

    return NextResponse.json({ data: { monthly, menuRanking, staffRanking } })
  } catch (error) {
    return handleApiError(error)
  }
}
