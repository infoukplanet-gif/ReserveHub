export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedTenantId } from '@/lib/auth'
import { ApiError, handleApiError } from '@/lib/api-error'

export async function POST(req: NextRequest) {
  try {
    const tenantId = await getAuthenticatedTenantId()
    const body = await req.json()

    const template = await prisma.ticketTemplate.findFirst({
      where: { id: body.ticketTemplateId, tenantId },
    })
    if (!template) throw new ApiError(404, 'NOT_FOUND', '回数券テンプレートが見つかりません')

    const customer = await prisma.customer.findFirst({
      where: { id: body.customerId, tenantId },
    })
    if (!customer) throw new ApiError(404, 'NOT_FOUND', '顧客が見つかりません')

    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + template.validMonths)

    const ticket = await prisma.purchasedTicket.create({
      data: {
        tenantId,
        customerId: body.customerId,
        ticketTemplateId: body.ticketTemplateId,
        remainingCount: template.totalCount,
        expiresAt,
      },
      include: { customer: true, ticketTemplate: true },
    })

    return NextResponse.json({ data: ticket }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
