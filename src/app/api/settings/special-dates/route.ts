export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedTenantId } from '@/lib/auth'
import { handleApiError } from '@/lib/api-error'

export async function POST(req: NextRequest) {
  try {
    const tenantId = await getAuthenticatedTenantId()
    const body = await req.json()

    const specialDate = await prisma.specialDate.create({
      data: {
        tenantId,
        date: new Date(body.date),
        isClosed: body.isClosed ?? true,
        openTime: body.isClosed ? null : body.openTime,
        closeTime: body.isClosed ? null : body.closeTime,
        label: body.label || null,
      },
    })

    return NextResponse.json({ data: specialDate }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const tenantId = await getAuthenticatedTenantId()
    const id = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

    await prisma.specialDate.deleteMany({ where: { id, tenantId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
