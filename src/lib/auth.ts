import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { ApiError } from '@/lib/api-error'

/**
 * 認証済みユーザーのテナントIDを取得する
 * 未認証の場合はApiErrorをthrow
 */
export async function getAuthenticatedTenantId(): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new ApiError(401, 'UNAUTHORIZED', 'ログインが必要です')

  // ユーザーのメールアドレスでテナントを検索
  const staff = await prisma.staff.findFirst({
    where: { email: user.email },
    select: { tenantId: true },
  })

  if (staff) return staff.tenantId

  // スタッフに見つからない場合、テナントのメールで検索
  const tenant = await prisma.tenant.findFirst({
    where: { email: user.email },
  })

  if (tenant) return tenant.id

  throw new ApiError(401, 'UNAUTHORIZED', 'テナントが見つかりません。新規登録してください。')
}
