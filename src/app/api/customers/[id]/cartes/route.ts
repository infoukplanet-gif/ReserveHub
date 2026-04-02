export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedTenantId } from '@/lib/auth'
import { ApiError, handleApiError } from '@/lib/api-error'

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const tenantId = await getAuthenticatedTenantId()
    const { id: customerId } = await params
    const body = await req.json()

    const customer = await prisma.customer.findFirst({ where: { id: customerId, tenantId } })
    if (!customer) throw new ApiError(404, 'NOT_FOUND', '顧客が見つかりません')

    const record = await prisma.carteRecord.create({
      data: {
        customerId,
        templateId: body.templateId,
        staffId: body.staffId || null,
        reservationId: body.reservationId || null,
        data: body.data || {},
        memo: body.memo || null,
      },
    })

    return NextResponse.json({ data: record }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
