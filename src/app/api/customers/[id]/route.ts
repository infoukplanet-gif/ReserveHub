export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiError, handleApiError } from '@/lib/api-error'

async function getTenantId(): Promise<string> {
  const tenant = await prisma.tenant.findFirst()
  if (!tenant) throw new ApiError(401, 'NO_TENANT', 'テナントが見つかりません')
  return tenant.id
}

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const tenantId = await getTenantId()
    const { id } = await params

    const customer = await prisma.customer.findFirst({
      where: { id, tenantId },
      include: {
        tagAssignments: { include: { tag: true } },
        reservations: {
          include: { menu: true, staff: true },
          orderBy: { startsAt: 'desc' },
          take: 20,
        },
        carteRecords: {
          include: { template: true, staff: true },
          orderBy: { recordedAt: 'desc' },
        },
        purchasedTickets: {
          include: { ticketTemplate: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!customer) throw new ApiError(404, 'NOT_FOUND', '顧客が見つかりません')
    return NextResponse.json({ data: customer })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const tenantId = await getTenantId()
    const { id } = await params
    const body = await req.json()

    const existing = await prisma.customer.findFirst({ where: { id, tenantId } })
    if (!existing) throw new ApiError(404, 'NOT_FOUND', '顧客が見つかりません')

    const customer = await prisma.customer.update({
      where: { id },
      data: { memo: body.memo, name: body.name, nameKana: body.nameKana, email: body.email, phone: body.phone },
    })

    return NextResponse.json({ data: customer })
  } catch (error) {
    return handleApiError(error)
  }
}
