export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedTenantId } from '@/lib/auth'
import { ApiError, handleApiError } from '@/lib/api-error'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const tenantId = await getAuthenticatedTenantId()
    const { id } = await params
    const body = await req.json()

    const existing = await prisma.followUpRule.findFirst({ where: { id, tenantId } })
    if (!existing) throw new ApiError(404, 'NOT_FOUND', 'ルールが見つかりません')

    const rule = await prisma.followUpRule.update({
      where: { id },
      data: {
        name: body.name,
        triggerType: body.triggerType,
        intervalDays: body.intervalDays,
        symptomKeyword: body.symptomKeyword,
        seasonMonth: body.seasonMonth,
        seasonDay: body.seasonDay,
        daysBeforeExpiry: body.daysBeforeExpiry,
        subject: body.subject,
        bodyTemplate: body.bodyTemplate,
        channel: body.channel,
        isActive: body.isActive,
      },
    })

    return NextResponse.json({ data: rule })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const tenantId = await getAuthenticatedTenantId()
    const { id } = await params

    const existing = await prisma.followUpRule.findFirst({ where: { id, tenantId } })
    if (!existing) throw new ApiError(404, 'NOT_FOUND', 'ルールが見つかりません')

    await prisma.followUpRule.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
