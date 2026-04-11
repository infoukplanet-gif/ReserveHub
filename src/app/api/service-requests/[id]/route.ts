export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedTenantId } from '@/lib/auth'
import { handleApiError, ApiError } from '@/lib/api-error'

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const tenantId = await getAuthenticatedTenantId()
    const { id } = await params

    const serviceRequest = await prisma.serviceRequest.findFirst({
      where: { id, tenantId },
    })
    if (!serviceRequest) throw new ApiError(404, 'NOT_FOUND', 'サービス依頼が見つかりません')

    return NextResponse.json({ data: serviceRequest })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const tenantId = await getAuthenticatedTenantId()
    const { id } = await params
    const body = await req.json()

    const existing = await prisma.serviceRequest.findFirst({ where: { id, tenantId } })
    if (!existing) throw new ApiError(404, 'NOT_FOUND', 'サービス依頼が見つかりません')

    const updated = await prisma.serviceRequest.update({
      where: { id },
      data: {
        status: body.status || undefined,
        note: body.note !== undefined ? body.note : undefined,
      },
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    return handleApiError(error)
  }
}
