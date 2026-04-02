export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createStaffSchema } from '@/lib/validators/staff'
import { ApiError, handleApiError } from '@/lib/api-error'

async function getTenantId(): Promise<string> {
  const tenant = await prisma.tenant.findFirst()
  if (!tenant) throw new ApiError(401, 'NO_TENANT', 'テナントが見つかりません')
  return tenant.id
}

export async function GET() {
  try {
    const tenantId = await getTenantId()

    const staffList = await prisma.staff.findMany({
      where: { tenantId },
      include: {
        staffMenus: { include: { menu: true } },
        _count: { select: { reservations: true } },
      },
      orderBy: { displayOrder: 'asc' },
    })

    return NextResponse.json({ data: staffList })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenantId = await getTenantId()
    const body = await req.json()
    const parsed = createStaffSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'バリデーションエラー', code: 'VALIDATION_ERROR', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { menuIds, ...staffData } = parsed.data

    const staff = await prisma.staff.create({
      data: {
        tenantId,
        ...staffData,
        ...(menuIds && {
          staffMenus: {
            create: menuIds.map((menuId) => ({ menuId })),
          },
        }),
      },
      include: {
        staffMenus: { include: { menu: true } },
      },
    })

    return NextResponse.json({ data: staff }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
