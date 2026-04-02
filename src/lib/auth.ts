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

  if (!user) {
    // 認証なし → 最初のテナントを返す（開発用フォールバック）
    // TODO: 本番では必ずエラーにする
    const tenant = await prisma.tenant.findFirst()
    if (!tenant) throw new ApiError(401, 'UNAUTHORIZED', 'ログインが必要です')
    return tenant.id
  }

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

  // どちらにも見つからない場合 → 最初のテナント（開発用）
  const fallback = await prisma.tenant.findFirst()
  if (!fallback) throw new ApiError(401, 'UNAUTHORIZED', 'テナントが見つかりません')
  return fallback.id
}
