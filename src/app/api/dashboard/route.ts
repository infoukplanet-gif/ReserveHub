export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiError, handleApiError } from '@/lib/api-error'

async function getTenantId(): Promise<string> {
  const tenant = await prisma.tenant.findFirst()
  if (!tenant) throw new ApiError(401, 'NO_TENANT', 'テナントが見つかりません')
  return tenant.id
}

export async function GET() {
  try {
    const tenantId = await getTenantId()
    const now = new Date()

    // 今日の開始・終了
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date(now)
    todayEnd.setHours(23, 59, 59, 999)

    // 今月の開始
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // 並列クエリ
    const [todayReservations, monthStats, newCustomers, totalCustomers, upcomingReservations, expiringTickets] = await Promise.all([
      // 本日の予約数
      prisma.reservation.count({
        where: { tenantId, startsAt: { gte: todayStart, lte: todayEnd }, status: { in: ['confirmed', 'completed'] } },
      }),
      // 今月の売上
      prisma.reservation.aggregate({
        where: { tenantId, startsAt: { gte: monthStart }, status: { in: ['confirmed', 'completed'] } },
        _sum: { totalPrice: true },
        _count: true,
      }),
      // 今月の新規顧客
      prisma.customer.count({
        where: { tenantId, createdAt: { gte: monthStart } },
      }),
      // 全顧客数
      prisma.customer.count({ where: { tenantId } }),
      // 本日の予約詳細
      prisma.reservation.findMany({
        where: { tenantId, startsAt: { gte: todayStart, lte: todayEnd } },
        include: { customer: true, staff: true, menu: true },
        orderBy: { startsAt: 'asc' },
      }),
      // 期限切れ間近の回数券
      prisma.purchasedTicket.findMany({
        where: {
          tenantId,
          status: 'active',
          expiresAt: { lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) },
        },
        include: { customer: true, ticketTemplate: true },
        orderBy: { expiresAt: 'asc' },
        take: 5,
      }),
    ])

    // リピート率（2回以上来店の顧客 / 全顧客）
    const repeatCustomers = await prisma.customer.count({
      where: { tenantId, totalVisits: { gte: 2 } },
    })
    const repeatRate = totalCustomers > 0 ? Math.round((repeatCustomers / totalCustomers) * 100) : 0

    return NextResponse.json({
      data: {
        todayBookings: todayReservations,
        monthlyRevenue: monthStats._sum.totalPrice || 0,
        monthlyBookings: monthStats._count,
        newCustomers,
        repeatRate,
        upcomingReservations,
        expiringTickets,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
