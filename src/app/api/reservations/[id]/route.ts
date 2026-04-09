export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedTenantId } from '@/lib/auth'
import { updateReservationSchema } from '@/lib/validators/reservation'
import { ApiError, handleApiError } from '@/lib/api-error'


type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const tenantId = await getAuthenticatedTenantId()
    const { id } = await params

    const reservation = await prisma.reservation.findFirst({
      where: { id, tenantId },
      include: {
        customer: true,
        staff: true,
        menu: true,
        options: { include: { menuOption: true } },
        ticketUsages: { include: { purchasedTicket: true } },
        carteRecords: true,
      },
    })

    if (!reservation) throw new ApiError(404, 'NOT_FOUND', '来院予約が見つかりません')

    return NextResponse.json({ data: reservation })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const tenantId = await getAuthenticatedTenantId()
    const { id } = await params
    const body = await req.json()
    const parsed = updateReservationSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'バリデーションエラー', code: 'VALIDATION_ERROR', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const existing = await prisma.reservation.findFirst({ where: { id, tenantId } })
    if (!existing) throw new ApiError(404, 'NOT_FOUND', '来院予約が見つかりません')

    const reservation = await prisma.reservation.update({
      where: { id },
      data: parsed.data,
      include: {
        customer: true,
        staff: true,
        menu: true,
        options: { include: { menuOption: true } },
      },
    })

    return NextResponse.json({ data: reservation })
  } catch (error) {
    return handleApiError(error)
  }
}
