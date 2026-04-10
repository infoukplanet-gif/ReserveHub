import { prisma } from '@/lib/prisma'
import { ApiError } from '@/lib/api-error'

type PlanLimits = {
  maxCartes: number | null
  followUp: boolean
  lineIntegration: boolean
  themes: boolean
  customCss: boolean
}

const PLAN_LIMITS: Record<string, PlanLimits> = {
  free:     { maxCartes: 10,   followUp: false, lineIntegration: false, themes: false, customCss: false },
  light:    { maxCartes: 50,   followUp: false, lineIntegration: false, themes: true,  customCss: false },
  standard: { maxCartes: null, followUp: true,  lineIntegration: true,  themes: true,  customCss: false },
  pro:      { maxCartes: null, followUp: true,  lineIntegration: true,  themes: true,  customCss: true  },
}

export function getPlanLimits(plan: string): PlanLimits {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free
}

export async function checkPlanAccess(tenantId: string, feature: keyof PlanLimits): Promise<boolean> {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { plan: true, trialEndsAt: true } })
  if (!tenant) return false

  // トライアル中は全機能使用可
  if (tenant.trialEndsAt && new Date(tenant.trialEndsAt) > new Date()) return true

  const limits = getPlanLimits(tenant.plan)
  return !!limits[feature]
}

export async function checkCarteLimit(tenantId: string): Promise<void> {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { plan: true, trialEndsAt: true } })
  if (!tenant) throw new ApiError(401, 'UNAUTHORIZED', 'テナントが見つかりません')

  // トライアル中は無制限
  if (tenant.trialEndsAt && new Date(tenant.trialEndsAt) > new Date()) return

  const limits = getPlanLimits(tenant.plan)
  if (limits.maxCartes === null) return

  const count = await prisma.carteRecord.count({ where: { customer: { tenantId } } })
  if (count >= limits.maxCartes) {
    throw new ApiError(403, 'PLAN_LIMIT', `カルテは${limits.maxCartes}件まで（現在のプラン: ${tenant.plan}）。プランをアップグレードしてください。`)
  }
}

export async function requirePlan(tenantId: string, feature: keyof PlanLimits, featureLabel: string): Promise<void> {
  const allowed = await checkPlanAccess(tenantId, feature)
  if (!allowed) {
    throw new ApiError(403, 'PLAN_LIMIT', `「${featureLabel}」はスタンダードプラン以上でご利用いただけます`)
  }
}
