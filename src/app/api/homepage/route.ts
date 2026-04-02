export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedTenantId } from '@/lib/auth'
import { ApiError, handleApiError } from '@/lib/api-error'


export async function GET() {
  try {
    const tenantId = await getAuthenticatedTenantId()
    const settings = await prisma.hpSetting.findUnique({ where: { tenantId } })
    return NextResponse.json({ data: settings })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const tenantId = await getAuthenticatedTenantId()
    const body = await req.json()

    const settings = await prisma.hpSetting.upsert({
      where: { tenantId },
      update: body,
      create: { tenantId, ...body },
    })

    return NextResponse.json({ data: settings })
  } catch (error) {
    return handleApiError(error)
  }
}
