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

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)

    // ユーザー情報を取得し、テナントがなければ自動作成
    const { data: { user } } = await supabase.auth.getUser()

    if (user?.email) {
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
          // テナントはあるがスタッフがない場合、スタッフを作成
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
