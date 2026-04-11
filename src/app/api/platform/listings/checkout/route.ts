export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { handleApiError, ApiError } from '@/lib/api-error'
import { getStripe } from '@/lib/stripe'

const LISTING_PRICES: Record<string, number> = {
  basic: 5000,
  premium: 15000,
}

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe()
    if (!stripe) throw new ApiError(500, 'CONFIG_ERROR', 'Stripe未設定')

    const body = await req.json()
    const { plan, name, email, phone, address, description, symptoms } = body

    if (!name?.trim()) throw new ApiError(400, 'INVALID_INPUT', '院名を入力してください')
    if (!email?.trim()) throw new ApiError(400, 'INVALID_INPUT', 'メールアドレスを入力してください')
    if (!plan || !LISTING_PRICES[plan]) throw new ApiError(400, 'INVALID_INPUT', '無効なプランです')

    const slug = name.toLowerCase().replace(/[^a-z0-9\u3040-\u9fff]/g, '-').replace(/-+/g, '-').slice(0, 50)

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: email,
      line_items: [{
        price_data: {
          currency: 'jpy',
          product_data: { name: `ミナオスなび ${plan === 'premium' ? 'プレミアム' : 'ベーシック'}掲載` },
          unit_amount: LISTING_PRICES[plan],
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }],
      success_url: `${req.nextUrl.origin}/list-your-clinic?success=true`,
      cancel_url: `${req.nextUrl.origin}/list-your-clinic?canceled=true`,
      metadata: {
        type: 'paid_listing',
        listingPlan: plan,
        slug,
        name,
        email,
        phone: phone || '',
        address: address || '',
        description: description || '',
        symptoms: JSON.stringify(symptoms || []),
      },
    })

    return NextResponse.json({ data: { url: session.url } })
  } catch (error) {
    return handleApiError(error)
  }
}
