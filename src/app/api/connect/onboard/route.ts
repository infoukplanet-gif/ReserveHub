export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedTenantId } from '@/lib/auth'
import { handleApiError } from '@/lib/api-error'
import { createConnectAccount, createAccountLink } from '@/lib/stripe-connect'

export async function POST(req: NextRequest) {
  try {
    const tenantId = await getAuthenticatedTenantId()
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } })
    if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })

    let accountId = tenant.stripeConnectAccountId

    // アカウント未作成なら新規作成
    if (!accountId) {
      const account = await createConnectAccount(tenantId, tenant.email)
      accountId = account.id
    }

    // オンボーディングリンク生成
    const origin = req.nextUrl.origin
    const accountLink = await createAccountLink(accountId, origin)

    return NextResponse.json({ data: { url: accountLink.url } })
  } catch (error) {
    return handleApiError(error)
  }
}
