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

// 特定の院への開示設定を取得
export async function GET(req: NextRequest) {
  try {
    const pu = await requirePlatformUser()
    const tenantId = req.nextUrl.searchParams.get('tenantId')

    if (tenantId) {
      const disclosure = await prisma.platformDisclosure.findUnique({
        where: { platformUserId_tenantId: { platformUserId: pu.id, tenantId } },
      })
      return NextResponse.json({ data: disclosure })
    }

    // 全院の開示設定一覧
    const disclosures = await prisma.platformDisclosure.findMany({
      where: { platformUserId: pu.id },
    })

    // テナント名を付与
    const tenantIds = disclosures.map(d => d.tenantId)
    const tenants = await prisma.tenant.findMany({
      where: { id: { in: tenantIds } },
      select: { id: true, name: true, slug: true },
    })
    const tenantMap = new Map(tenants.map(t => [t.id, t]))

    const data = disclosures.map(d => ({
      ...d,
      tenant: tenantMap.get(d.tenantId) || null,
    }))

    return NextResponse.json({ data })
  } catch (error) {
    return handleApiError(error)
  }
}

// 開示設定を更新（upsert）
export async function PATCH(req: NextRequest) {
  try {
    const pu = await requirePlatformUser()
    const body = await req.json()
    const { tenantId, ...settings } = body

    if (!tenantId) throw new ApiError(400, 'INVALID_INPUT', 'tenantIdが必要です')

    const disclosure = await prisma.platformDisclosure.upsert({
      where: { platformUserId_tenantId: { platformUserId: pu.id, tenantId } },
      update: {
        discloseName: settings.discloseName,
        discloseBirthDate: settings.discloseBirthDate,
        disclosePhone: settings.disclosePhone,
        discloseGender: settings.discloseGender,
        discloseCarteData: settings.discloseCarteData,
        discloseVisitHistory: settings.discloseVisitHistory,
      },
      create: {
        platformUserId: pu.id,
        tenantId,
        discloseName: settings.discloseName ?? false,
        discloseBirthDate: settings.discloseBirthDate ?? false,
        disclosePhone: settings.disclosePhone ?? false,
        discloseGender: settings.discloseGender ?? false,
        discloseCarteData: settings.discloseCarteData ?? false,
        discloseVisitHistory: settings.discloseVisitHistory ?? false,
      },
    })

    return NextResponse.json({ data: disclosure })
  } catch (error) {
    return handleApiError(error)
  }
}
