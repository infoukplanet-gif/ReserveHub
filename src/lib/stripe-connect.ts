import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { ApiError } from '@/lib/api-error'

/**
 * Connect Express アカウント作成
 */
export async function createConnectAccount(tenantId: string, email: string) {
  const stripe = getStripe()
  if (!stripe) throw new ApiError(500, 'CONFIG_ERROR', 'Stripe未設定')

  const account = await stripe.accounts.create({
    type: 'express',
    country: 'JP',
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    metadata: { tenantId },
  })

  await prisma.tenant.update({
    where: { id: tenantId },
    data: { stripeConnectAccountId: account.id },
  })

  return account
}

/**
 * オンボーディングリンク生成
 */
export async function createAccountLink(accountId: string, origin: string) {
  const stripe = getStripe()
  if (!stripe) throw new ApiError(500, 'CONFIG_ERROR', 'Stripe未設定')

  return stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${origin}/dashboard/settings?tab=connect`,
    return_url: `${origin}/dashboard/settings?tab=connect&success=true`,
    type: 'account_onboarding',
  })
}

/**
 * 患者支払い用 PaymentIntent（予約時決済）
 */
export async function createConnectCheckoutSession(params: {
  amount: number
  tenantId: string
  connectedAccountId: string
  reservationId: string
  origin: string
  customerEmail: string
  menuName: string
}) {
  const stripe = getStripe()
  if (!stripe) throw new ApiError(500, 'CONFIG_ERROR', 'Stripe未設定')

  const applicationFee = Math.round(params.amount * 0.1) // 10% プラットフォーム手数料

  return stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'jpy',
        product_data: { name: params.menuName },
        unit_amount: params.amount,
      },
      quantity: 1,
    }],
    payment_intent_data: {
      application_fee_amount: applicationFee,
      transfer_data: { destination: params.connectedAccountId },
    },
    customer_email: params.customerEmail,
    success_url: `${params.origin}/booking-complete?reservation=${params.reservationId}`,
    cancel_url: `${params.origin}/booking-cancel?reservation=${params.reservationId}`,
    metadata: {
      type: 'connect_payment',
      tenantId: params.tenantId,
      reservationId: params.reservationId,
    },
  })
}
