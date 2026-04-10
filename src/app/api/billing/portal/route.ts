export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedTenantId } from '@/lib/auth'
import { handleApiError, ApiError } from '@/lib/api-error'
import { getStripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const tenantId = await getAuthenticatedTenantId()
    const stripe = getStripe()
    if (!stripe) throw new ApiError(500, 'CONFIG_ERROR', 'Stripe未設定')

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } })
    if (!tenant?.stripeCustomerId) throw new ApiError(400, 'NO_SUBSCRIPTION', 'サブスクリプション情報がありません')

    const session = await stripe.billingPortal.sessions.create({
      customer: tenant.stripeCustomerId,
      return_url: `${req.nextUrl.origin}/dashboard/billing`,
    })

    return NextResponse.json({ data: { url: session.url } })
  } catch (error) {
    return handleApiError(error)
  }
}
