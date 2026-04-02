export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateMenuSchema } from '@/lib/validators/menu'
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

    const menu = await prisma.menu.findFirst({
      where: { id, tenantId },
      include: {
        category: true,
        pricingRules: { orderBy: { priority: 'asc' } },
        menuOptions: { orderBy: { displayOrder: 'asc' } },
        staffMenus: { include: { staff: true } },
      },
    })

    if (!menu) throw new ApiError(404, 'NOT_FOUND', 'メニューが見つかりません')

    return NextResponse.json({ data: menu })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const tenantId = await getTenantId()
    const { id } = await params
    const body = await req.json()
    const parsed = updateMenuSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'バリデーションエラー', code: 'VALIDATION_ERROR', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    // テナント分離チェック
    const existing = await prisma.menu.findFirst({ where: { id, tenantId } })
    if (!existing) throw new ApiError(404, 'NOT_FOUND', 'メニューが見つかりません')

    const menu = await prisma.menu.update({
      where: { id },
      data: parsed.data,
      include: {
        category: true,
        pricingRules: { orderBy: { priority: 'asc' } },
        menuOptions: { orderBy: { displayOrder: 'asc' } },
      },
    })

    return NextResponse.json({ data: menu })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const tenantId = await getTenantId()
    const { id } = await params

    const existing = await prisma.menu.findFirst({ where: { id, tenantId } })
    if (!existing) throw new ApiError(404, 'NOT_FOUND', 'メニューが見つかりません')

    await prisma.menu.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
