import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getStripe } from '@/lib/stripe'
import type Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const stripe = getStripe()
  if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })

  const body = await req.text()
  const signature = req.headers.get('stripe-signature')
  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const tenantId = session.metadata?.tenantId
      const planId = session.metadata?.planId
      if (tenantId && planId) {
        const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id
        await prisma.tenant.update({
          where: { id: tenantId },
          data: {
            plan: planId,
            stripeSubscriptionId: subscriptionId || undefined,
            trialEndsAt: session.subscription ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) : undefined,
          },
        })
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const tenantId = sub.metadata?.tenantId
      if (tenantId) {
        const status = sub.status
        if (status === 'active' || status === 'trialing') {
          // プラン更新
          const priceId = sub.items.data[0]?.price?.id
          const planMap: Record<string, string> = {
            [process.env.STRIPE_PRICE_LIGHT || '']: 'light',
            [process.env.STRIPE_PRICE_STANDARD || '']: 'standard',
            [process.env.STRIPE_PRICE_PRO || '']: 'pro',
          }
          const plan = planMap[priceId || ''] || 'free'
          await prisma.tenant.update({
            where: { id: tenantId },
            data: {
              plan,
              stripeSubscriptionId: sub.id,
              planExpiresAt: (sub as unknown as { current_period_end?: number }).current_period_end
                ? new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000)
                : null,
            },
          })
        }
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const tenantId = sub.metadata?.tenantId
      if (tenantId) {
        await prisma.tenant.update({
          where: { id: tenantId },
          data: { plan: 'free', stripeSubscriptionId: null, planExpiresAt: null },
        })
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id
      if (customerId) {
        console.error(`Payment failed for Stripe customer: ${customerId}`)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
