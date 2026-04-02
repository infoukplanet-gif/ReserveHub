export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiError, handleApiError } from '@/lib/api-error'

async function getTenantId(): Promise<string> {
  const tenant = await prisma.tenant.findFirst()
  if (!tenant) throw new ApiError(401, 'NO_TENANT', 'テナントが見つかりません')
  return tenant.id
}

export async function GET(req: NextRequest) {
  try {
    const tenantId = await getTenantId()
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
