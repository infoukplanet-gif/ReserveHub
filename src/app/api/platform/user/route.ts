export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, ApiError } from '@/lib/api-error'
import { createClient } from '@/lib/supabase/server'

async function getPlatformUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new ApiError(401, 'UNAUTHORIZED', 'ログインが必要です')

  const platformUser = await prisma.platformUser.findUnique({
    where: { userId: user.id },
  })
  return { user, platformUser }
}

export async function GET() {
  try {
    const { platformUser } = await getPlatformUser()
    if (!platformUser) return NextResponse.json({ data: null })

    const data = await prisma.platformUser.findUnique({
      where: { id: platformUser.id },
      include: {
        favorites: true,
        disclosureRules: true,
      },
    })

    return NextResponse.json({ data })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { user, platformUser } = await getPlatformUser()
    const body = await req.json()

    if (platformUser) {
      const updated = await prisma.platformUser.update({
        where: { id: platformUser.id },
        data: {
          name: body.name,
          birthDate: body.birthDate ? new Date(body.birthDate) : undefined,
          phone: body.phone,
          gender: body.gender,
        },
      })
      return NextResponse.json({ data: updated })
    }

    // 新規作成
    const created = await prisma.platformUser.create({
      data: {
        userId: user.id,
        name: body.name || user.email?.split('@')[0] || 'ユーザー',
        email: user.email!,
        birthDate: body.birthDate ? new Date(body.birthDate) : null,
        phone: body.phone || null,
        gender: body.gender || null,
      },
    })
    return NextResponse.json({ data: created }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
