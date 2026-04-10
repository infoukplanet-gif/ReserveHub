export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, ApiError } from '@/lib/api-error'
import { createClient } from '@/lib/supabase/server'

async function requirePlatformUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new ApiError(401, 'UNAUTHORIZED', 'ログインが必要です')
  const pu = await prisma.platformUser.findUnique({ where: { userId: user.id } })
  if (!pu) throw new ApiError(404, 'NOT_FOUND', 'プロフィールを作成してください')
  return pu
}

export async function GET() {
  try {
    const pu = await requirePlatformUser()
    const favorites = await prisma.platformFavorite.findMany({
      where: { platformUserId: pu.id },
      orderBy: { createdAt: 'desc' },
    })

    // tenantの情報を付与
    const tenantIds = favorites.map(f => f.tenantId).filter(Boolean) as string[]
    const tenants = await prisma.tenant.findMany({
      where: { id: { in: tenantIds } },
      select: { id: true, name: true, slug: true, address: true, logoUrl: true, hpSetting: { select: { heroImageUrl: true } } },
    })
    const tenantMap = new Map(tenants.map(t => [t.id, t]))

    const data = favorites.map(f => ({
      ...f,
      clinic: f.tenantId ? tenantMap.get(f.tenantId) || null : null,
    }))

    return NextResponse.json({ data })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const pu = await requirePlatformUser()
    const { tenantId, paidListingId } = await req.json()

    const fav = await prisma.platformFavorite.create({
      data: {
        platformUserId: pu.id,
        tenantId: tenantId || null,
        paidListingId: paidListingId || null,
      },
    })
    return NextResponse.json({ data: fav }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const pu = await requirePlatformUser()
    const { searchParams } = req.nextUrl
    const tenantId = searchParams.get('tenantId')

    if (tenantId) {
      await prisma.platformFavorite.deleteMany({
        where: { platformUserId: pu.id, tenantId },
      })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
