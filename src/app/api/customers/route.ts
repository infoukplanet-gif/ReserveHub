export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedTenantId } from '@/lib/auth'
import { ApiError, handleApiError } from '@/lib/api-error'


export async function GET(req: NextRequest) {
  try {
    const tenantId = await getAuthenticatedTenantId()
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const tag = searchParams.get('tag')

    const customers = await prisma.customer.findMany({
      where: {
        tenantId,
        ...(search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { phone: { contains: search } },
          ],
        } : {}),
        ...(tag ? { tagAssignments: { some: { tag: { name: tag } } } } : {}),
      },
      include: {
        tagAssignments: { include: { tag: true } },
        _count: { select: { reservations: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: customers })
  } catch (error) {
    return handleApiError(error)
  }
}
