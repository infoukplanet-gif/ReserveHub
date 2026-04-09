export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedTenantId } from '@/lib/auth'
import { ApiError, handleApiError } from '@/lib/api-error'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const tenantId = await getAuthenticatedTenantId()
    const { id } = await params
    const body = await req.json()

    const existing = await prisma.staff.findFirst({ where: { id, tenantId } })
    if (!existing) throw new ApiError(404, 'NOT_FOUND', '施術者が見つかりません')

    const staff = await prisma.staff.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.email !== undefined ? { email: body.email } : {}),
        ...(body.phone !== undefined ? { phone: body.phone } : {}),
        ...(body.bio !== undefined ? { bio: body.bio } : {}),
        ...(body.nominationFee !== undefined ? { nominationFee: body.nominationFee } : {}),
        ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
      },
    })

    return NextResponse.json({ data: staff })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const tenantId = await getAuthenticatedTenantId()
    const { id } = await params

    const existing = await prisma.staff.findFirst({ where: { id, tenantId } })
    if (!existing) throw new ApiError(404, 'NOT_FOUND', '施術者が見つかりません')

    await prisma.staff.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
