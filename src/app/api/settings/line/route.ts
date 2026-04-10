export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedTenantId } from '@/lib/auth'
import { handleApiError } from '@/lib/api-error'

export async function GET() {
  try {
    const tenantId = await getAuthenticatedTenantId()
    const config = await prisma.lineConfig.findUnique({ where: { tenantId } })
    return NextResponse.json({ data: config })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const tenantId = await getAuthenticatedTenantId()
    const body = await req.json()

    const config = await prisma.lineConfig.upsert({
      where: { tenantId },
      update: {
        channelId: body.channelId,
        channelSecret: body.channelSecret,
        channelAccessToken: body.channelAccessToken,
        isActive: body.isActive ?? true,
      },
      create: {
        tenantId,
        channelId: body.channelId,
        channelSecret: body.channelSecret,
        channelAccessToken: body.channelAccessToken,
        isActive: body.isActive ?? true,
      },
    })

    return NextResponse.json({ data: config })
  } catch (error) {
    return handleApiError(error)
  }
}
