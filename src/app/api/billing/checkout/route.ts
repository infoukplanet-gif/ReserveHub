export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedTenantId } from '@/lib/auth'
import { handleApiError, ApiError } from '@/lib/api-error'
import { getStripe, PLAN_PRICES } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const tenantId = await getAuthenticatedTenantId()
    const stripe = getStripe()
    if (!stripe) throw new ApiError(500, 'CONFIG_ERROR', 'Stripe未設定')

    const { planId } = await req.json()
    const priceId = PLAN_PRICES[planId]
    if (!priceId) throw new ApiError(400, 'INVALID_PLAN', '無効なプランです')

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } })
    if (!tenant) throw new ApiError(404, 'NOT_FOUND', 'テナントが見つかりません')

    // 既存のStripe Customerがなければ作成
    let customerId = tenant.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: tenant.email,
        name: tenant.name,
        metadata: { tenantId },
      })
      customerId = customer.id
      await prisma.tenant.update({ where: { id: tenantId }, data: { stripeCustomerId: customerId } })
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${req.nextUrl.origin}/dashboard/billing?success=true`,
      cancel_url: `${req.nextUrl.origin}/dashboard/billing?canceled=true`,
      subscription_data: {
        trial_period_days: tenant.plan === 'free' ? 14 : undefined,
        metadata: { tenantId },
      },
      metadata: { tenantId, planId },
    })

    return NextResponse.json({ data: { url: session.url } })
  } catch (error) {
    return handleApiError(error)
  }
}
