export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

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

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type') // 'platform' for patient registration

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)

    const { data: { user } } = await supabase.auth.getUser()

    if (user?.email) {
      // プラットフォームユーザー（患者側）の場合
      if (type === 'platform') {
        const existingPlatformUser = await prisma.platformUser.findUnique({
          where: { email: user.email },
        })
        if (!existingPlatformUser) {
          const meta = user.user_metadata as Record<string, string> | undefined
          await prisma.platformUser.create({
            data: {
              userId: user.id,
              name: meta?.full_name || user.email.split('@')[0],
              email: user.email,
            },
          })
        } else if (!existingPlatformUser.userId) {
          await prisma.platformUser.update({
            where: { id: existingPlatformUser.id },
            data: { userId: user.id },
          })
        }
        return NextResponse.redirect(`${origin}/mypage`)
      }

      // テナント（事業者側）の場合
      const existingStaff = await prisma.staff.findFirst({
        where: { email: user.email },
      })

      if (!existingStaff) {
        const existingTenant = await prisma.tenant.findFirst({
          where: { email: user.email },
        })

        if (!existingTenant) {
          const meta = user.user_metadata as Record<string, string> | undefined
          const tenantName = meta?.shop_name || meta?.full_name || user.email.split('@')[0]
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
        } else {
          const meta = user.user_metadata as Record<string, string> | undefined
          await prisma.staff.create({
            data: {
              tenantId: existingTenant.id,
              userId: user.id,
              name: meta?.full_name || user.email.split('@')[0],
              email: user.email,
              role: 'owner',
            },
          })
        }
      }
    }
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}
