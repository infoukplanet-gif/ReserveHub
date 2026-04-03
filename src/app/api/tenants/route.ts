export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { ApiError, handleApiError } from '@/lib/api-error'

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
}

async function ensureUniqueSlug(base: string): Promise<string> {
  let slug = base
  let attempt = 0
  while (await prisma.tenant.findUnique({ where: { slug } })) {
    attempt++
    const suffix = Math.random().toString(36).slice(2, 6)
    slug = `${base}-${suffix}`.slice(0, 50)
    if (attempt > 10) break
  }
  return slug
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
      throw new ApiError(401, 'UNAUTHORIZED', 'ログインが必要です')
    }

    // 既にテナントを持っている場合はそれを返す
    const existingStaff = await prisma.staff.findFirst({
      where: { email: user.email },
      include: { tenant: true },
    })

    if (existingStaff) {
      return NextResponse.json({ data: existingStaff.tenant }, { status: 200 })
    }

    const body = await req.json() as { name?: string }
    const meta = user.user_metadata as Record<string, string> | undefined
    const tenantName = body.name || meta?.shop_name || meta?.full_name || user.email.split('@')[0]
    const slugBase = slugify(user.email.split('@')[0])
    const slug = await ensureUniqueSlug(slugBase)

    const tenant = await prisma.tenant.create({
      data: {
        name: tenantName,
        slug,
        email: user.email,
      },
    })

    await prisma.staff.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        name: meta?.full_name || user.email.split('@')[0],
        email: user.email,
        role: 'owner',
      },
    })

    return NextResponse.json({ data: tenant }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
