export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiError, handleApiError } from '@/lib/api-error'

async function getTenantId(): Promise<string> {
  const tenant = await prisma.tenant.findFirst()
  if (!tenant) throw new ApiError(401, 'NO_TENANT', 'テナントが見つかりません')
  return tenant.id
}

export async function GET() {
  try {
    const tenantId = await getTenantId()
    const settings = await prisma.hpSetting.findUnique({ where: { tenantId } })
    return NextResponse.json({ data: settings })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const tenantId = await getTenantId()
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
