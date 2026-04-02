export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedTenantId } from '@/lib/auth'
import { ApiError, handleApiError } from '@/lib/api-error'


// テンプレート一覧
export async function GET() {
  try {
    const tenantId = await getAuthenticatedTenantId()
    const templates = await prisma.ticketTemplate.findMany({
      where: { tenantId },
      include: { targetMenus: { include: { menu: true } } },
      orderBy: { createdAt: 'desc' },
    })

    const purchased = await prisma.purchasedTicket.findMany({
      where: { tenantId },
      include: { customer: true, ticketTemplate: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: { templates, purchased } })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenantId = await getAuthenticatedTenantId()
    const body = await req.json()

    const template = await prisma.ticketTemplate.create({
      data: {
        tenantId,
        name: body.name,
        totalCount: body.totalCount,
        price: body.price,
        validMonths: body.validMonths,
        isOnSale: body.isOnSale ?? true,
        ...(body.menuIds ? { targetMenus: { create: body.menuIds.map((id: string) => ({ menuId: id })) } } : {}),
      },
      include: { targetMenus: { include: { menu: true } } },
    })

    return NextResponse.json({ data: template }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
