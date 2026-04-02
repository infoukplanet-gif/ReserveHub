export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiError, handleApiError } from '@/lib/api-error'

async function getTenantId(): Promise<string> {
  const tenant = await prisma.tenant.findFirst()
  if (!tenant) throw new ApiError(401, 'NO_TENANT', 'テナントが見つかりません')
  return tenant.id
}

// テンプレート一覧
export async function GET() {
  try {
    const tenantId = await getTenantId()
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
    const tenantId = await getTenantId()
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
