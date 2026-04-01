import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createMenuSchema } from '@/lib/validators/menu'
import { ApiError, handleApiError } from '@/lib/api-error'

// TODO: 認証+テナントID取得を共通化する
async function getTenantId(): Promise<string> {
  // 暫定: 最初のテナントを返す（認証実装後に置き換え）
  const tenant = await prisma.tenant.findFirst()
  if (!tenant) throw new ApiError(401, 'NO_TENANT', 'テナントが見つかりません')
  return tenant.id
}

export async function GET(req: NextRequest) {
  try {
    const tenantId = await getTenantId()
    const { searchParams } = new URL(req.url)
    const categoryId = searchParams.get('categoryId')

    const menus = await prisma.menu.findMany({
      where: {
        tenantId,
        ...(categoryId ? { categoryId } : {}),
      },
      include: {
        category: true,
        pricingRules: { orderBy: { priority: 'asc' } },
        menuOptions: { where: { isActive: true }, orderBy: { displayOrder: 'asc' } },
        _count: { select: { staffMenus: true } },
      },
      orderBy: { displayOrder: 'asc' },
    })

    return NextResponse.json({ data: menus })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenantId = await getTenantId()
    const body = await req.json()
    const parsed = createMenuSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'バリデーションエラー', code: 'VALIDATION_ERROR', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const menu = await prisma.menu.create({
      data: {
        tenantId,
        ...parsed.data,
      },
      include: {
        category: true,
        pricingRules: true,
        menuOptions: true,
      },
    })

    return NextResponse.json({ data: menu }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
