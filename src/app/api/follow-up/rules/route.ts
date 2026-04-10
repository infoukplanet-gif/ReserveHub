export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedTenantId } from '@/lib/auth'
import { handleApiError } from '@/lib/api-error'

export async function GET() {
  try {
    const tenantId = await getAuthenticatedTenantId()
    const rules = await prisma.followUpRule.findMany({
      where: { tenantId },
      include: { _count: { select: { logs: true } } },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json({ data: rules })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenantId = await getAuthenticatedTenantId()
    const body = await req.json()

    const rule = await prisma.followUpRule.create({
      data: {
        tenantId,
        name: body.name,
        triggerType: body.triggerType,
        intervalDays: body.intervalDays || null,
        symptomKeyword: body.symptomKeyword || null,
        seasonMonth: body.seasonMonth ?? null,
        seasonDay: body.seasonDay ?? null,
        daysBeforeExpiry: body.daysBeforeExpiry || null,
        subject: body.subject,
        bodyTemplate: body.bodyTemplate,
        channel: body.channel || 'email',
        isActive: body.isActive ?? true,
        isPreset: body.isPreset ?? false,
      },
    })

    return NextResponse.json({ data: rule }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
