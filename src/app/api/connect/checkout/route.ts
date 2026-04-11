export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, ApiError } from '@/lib/api-error'
import { createConnectCheckoutSession } from '@/lib/stripe-connect'

export async function POST(req: NextRequest) {
  try {
    const { reservationId } = await req.json()
    if (!reservationId) throw new ApiError(400, 'INVALID_INPUT', '予約IDが必要です')

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        tenant: { select: { id: true, stripeConnectAccountId: true, stripeConnectEnabled: true } },
        customer: { select: { email: true, name: true } },
        menu: { select: { name: true } },
      },
    })

    if (!reservation) throw new ApiError(404, 'NOT_FOUND', '予約が見つかりません')
    if (!reservation.tenant.stripeConnectAccountId || !reservation.tenant.stripeConnectEnabled) {
      throw new ApiError(400, 'NOT_AVAILABLE', 'この院ではオンライン決済に対応していません')
    }
    if (!reservation.customer.email) {
      throw new ApiError(400, 'INVALID_INPUT', '顧客のメールアドレスが登録されていません')
    }

    const session = await createConnectCheckoutSession({
      amount: reservation.totalPrice,
      tenantId: reservation.tenant.id,
      connectedAccountId: reservation.tenant.stripeConnectAccountId,
      reservationId: reservation.id,
      origin: req.nextUrl.origin,
      customerEmail: reservation.customer.email,
      menuName: reservation.menu.name,
    })

    return NextResponse.json({ data: { url: session.url } })
  } catch (error) {
    return handleApiError(error)
  }
}
