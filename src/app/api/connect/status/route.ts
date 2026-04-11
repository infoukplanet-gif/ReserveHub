export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedTenantId } from '@/lib/auth'
import { handleApiError } from '@/lib/api-error'
import { getStripe } from '@/lib/stripe'

export async function GET() {
  try {
    const tenantId = await getAuthenticatedTenantId()
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { stripeConnectAccountId: true, stripeConnectEnabled: true },
    })

    if (!tenant?.stripeConnectAccountId) {
      return NextResponse.json({ data: { connected: false, chargesEnabled: false } })
    }

    const stripe = getStripe()
    if (!stripe) {
      return NextResponse.json({ data: { connected: false, chargesEnabled: false } })
    }

    const account = await stripe.accounts.retrieve(tenant.stripeConnectAccountId)
    const chargesEnabled = account.charges_enabled ?? false

    // DBと同期
    if (chargesEnabled !== tenant.stripeConnectEnabled) {
      await prisma.tenant.update({
        where: { id: tenantId },
        data: { stripeConnectEnabled: chargesEnabled },
      })
    }

    return NextResponse.json({
      data: {
        connected: true,
        chargesEnabled,
        accountId: tenant.stripeConnectAccountId,
        dashboardUrl: `https://dashboard.stripe.com/${tenant.stripeConnectAccountId}`,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
