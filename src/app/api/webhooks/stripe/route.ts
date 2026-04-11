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

    case 'account.updated': {
      // Stripe Connect: アカウントの charges_enabled 同期
      const account = event.data.object as Stripe.Account
      if (account.id) {
        const tenant = await prisma.tenant.findFirst({
          where: { stripeConnectAccountId: account.id },
        })
        if (tenant) {
          await prisma.tenant.update({
            where: { id: tenant.id },
            data: { stripeConnectEnabled: account.charges_enabled ?? false },
          })
        }
      }
      break
    }
  }

  // 有料掲載申込の処理（checkout.session.completed 内でメタデータ分岐）
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    if (session.metadata?.type === 'paid_listing') {
      const { slug, name, email, phone, address, description, symptoms, listingPlan } = session.metadata
      const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id
      const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id
      await prisma.paidListing.create({
        data: {
          slug: slug || name?.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 50) || 'clinic',
          name: name || '',
          email: email || '',
          phone: phone || null,
          address: address || null,
          description: description || null,
          symptoms: symptoms ? JSON.parse(symptoms) : [],
          listingPlan: listingPlan || 'basic',
          stripeCustomerId: customerId || null,
          isActive: true,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      })
    }
  }

  return NextResponse.json({ received: true })
}
