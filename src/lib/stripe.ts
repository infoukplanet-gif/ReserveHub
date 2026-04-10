import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  return _stripe
}

export const PLAN_PRICES: Record<string, string> = {
  light: process.env.STRIPE_PRICE_LIGHT || '',
  standard: process.env.STRIPE_PRICE_STANDARD || '',
  pro: process.env.STRIPE_PRICE_PRO || '',
}

export const PLAN_NAMES: Record<string, string> = {
  free: 'フリー',
  light: 'ライト',
  standard: 'スタンダード',
  pro: 'プロ',
}
