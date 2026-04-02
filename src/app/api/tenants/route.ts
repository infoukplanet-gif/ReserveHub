export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/api-error'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const tenant = await prisma.tenant.create({
      data: { name: body.name, slug: body.slug, email: body.email },
    })
    return NextResponse.json({ data: tenant }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
