export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedTenantId } from '@/lib/auth'
import { handleApiError } from '@/lib/api-error'

export async function GET(req: NextRequest) {
  try {
    const tenantId = await getAuthenticatedTenantId()
    const { searchParams } = req.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 50

    const [logs, total] = await Promise.all([
      prisma.followUpLog.findMany({
        where: { rule: { tenantId } },
        include: {
          rule: { select: { name: true } },
        },
        orderBy: { sentAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.followUpLog.count({ where: { rule: { tenantId } } }),
    ])

    // customerIdから名前を引く
    const customerIds = [...new Set(logs.map(l => l.customerId))]
    const customers = await prisma.customer.findMany({
      where: { id: { in: customerIds } },
      select: { id: true, name: true },
    })
    const customerMap = new Map(customers.map(c => [c.id, c.name]))

    const data = logs.map(l => ({
      ...l,
      customerName: customerMap.get(l.customerId) || '不明',
    }))

    return NextResponse.json({ data, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    return handleApiError(error)
  }
}
