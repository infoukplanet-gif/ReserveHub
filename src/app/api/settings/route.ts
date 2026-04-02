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

    const [tenant, businessHours, specialDates, carteTemplates] = await Promise.all([
      prisma.tenant.findFirst({ where: { id: tenantId } }),
      prisma.businessHour.findMany({ where: { tenantId }, orderBy: { dayOfWeek: 'asc' } }),
      prisma.specialDate.findMany({ where: { tenantId }, orderBy: { date: 'asc' } }),
      prisma.carteTemplate.findMany({ where: { tenantId }, include: { fields: { orderBy: { displayOrder: 'asc' } } } }),
    ])

    return NextResponse.json({ data: { tenant, businessHours, specialDates, carteTemplates } })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const tenantId = await getTenantId()
    const body = await req.json()

    if (body.tenant) {
      await prisma.tenant.update({ where: { id: tenantId }, data: body.tenant })
    }

    if (body.businessHours) {
      for (const bh of body.businessHours) {
        await prisma.businessHour.upsert({
          where: { tenantId_dayOfWeek: { tenantId, dayOfWeek: bh.dayOfWeek } },
          update: { openTime: bh.openTime, closeTime: bh.closeTime, isClosed: bh.isClosed },
          create: { tenantId, dayOfWeek: bh.dayOfWeek, openTime: bh.openTime, closeTime: bh.closeTime, isClosed: bh.isClosed },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
