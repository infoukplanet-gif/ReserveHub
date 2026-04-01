import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createMenuOptionSchema } from '@/lib/validators/menu'
import { ApiError, handleApiError } from '@/lib/api-error'

async function getTenantId(): Promise<string> {
  const tenant = await prisma.tenant.findFirst()
  if (!tenant) throw new ApiError(401, 'NO_TENANT', 'テナントが見つかりません')
  return tenant.id
}

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const tenantId = await getTenantId()
    const { id: menuId } = await params
    const body = await req.json()
    const parsed = createMenuOptionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'バリデーションエラー', code: 'VALIDATION_ERROR', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const menu = await prisma.menu.findFirst({ where: { id: menuId, tenantId } })
    if (!menu) throw new ApiError(404, 'NOT_FOUND', 'メニューが見つかりません')

    const option = await prisma.menuOption.create({
      data: {
        menuId,
        ...parsed.data,
      },
    })

    return NextResponse.json({ data: option }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
