export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedTenantId } from '@/lib/auth'
import { handleApiError } from '@/lib/api-error'
import { getPlanLimits } from '@/lib/plan-gate'
import { PLAN_NAMES } from '@/lib/stripe'

export async function GET() {
  try {
    const tenantId = await getAuthenticatedTenantId()
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { plan: true, planExpiresAt: true, trialEndsAt: true, stripeSubscriptionId: true },
    })

    if (!tenant) return NextResponse.json({ data: null })

    const isTrial = tenant.trialEndsAt && new Date(tenant.trialEndsAt) > new Date()
    const trialDaysLeft = isTrial
      ? Math.ceil((new Date(tenant.trialEndsAt!).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 0

    return NextResponse.json({
      data: {
        plan: tenant.plan,
        planName: PLAN_NAMES[tenant.plan] || tenant.plan,
        limits: getPlanLimits(tenant.plan),
        isTrial,
        trialDaysLeft,
        hasSubscription: !!tenant.stripeSubscriptionId,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
