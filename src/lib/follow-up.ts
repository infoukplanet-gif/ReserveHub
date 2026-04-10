import { prisma } from '@/lib/prisma'
import { sendFollowUp } from '@/lib/email'
import { sendLineMessage } from '@/lib/line'

type SendResult = { sent: number; failed: number; skipped: number }

export async function processFollowUpRules(): Promise<SendResult> {
  const result: SendResult = { sent: 0, failed: 0, skipped: 0 }
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  // 全テナントのアクティブルールを取得
  const rules = await prisma.followUpRule.findMany({
    where: { isActive: true },
    include: { tenant: true },
  })

  for (const rule of rules) {
    try {
      const targets = await findTargets(rule, today)

      for (const target of targets) {
        // 既に送信済みかチェック（同じルール×同じ顧客×同日）
        const alreadySent = await prisma.followUpLog.findFirst({
          where: {
            ruleId: rule.id,
            customerId: target.customerId,
            sentAt: { gte: today },
          },
        })
        if (alreadySent) { result.skipped++; continue }

        try {
          // メッセージテンプレートを展開
          const body = expandTemplate(rule.bodyTemplate, {
            customerName: target.customerName,
            tenantName: rule.tenant.name,
            lastVisitDate: target.lastVisitDate ? formatDate(target.lastVisitDate) : '',
            daysSinceVisit: target.daysSinceVisit?.toString() || '',
          })

          if (rule.channel === 'email' && target.email) {
            await sendFollowUp({
              customerEmail: target.email,
              customerName: target.customerName,
              tenantName: rule.tenant.name,
              subject: rule.subject,
              body,
            })
          } else if (rule.channel === 'line' && target.lineUserId) {
            const lineConfig = await prisma.lineConfig.findUnique({ where: { tenantId: rule.tenantId } })
            if (lineConfig?.isActive) {
              await sendLineMessage(lineConfig.channelAccessToken, target.lineUserId, [
                { type: 'text', text: `${rule.subject}\n\n${body}` },
              ])
            }
          }

          await prisma.followUpLog.create({
            data: {
              ruleId: rule.id,
              customerId: target.customerId,
              channel: rule.channel,
              status: 'sent',
            },
          })
          result.sent++
        } catch (e) {
          await prisma.followUpLog.create({
            data: {
              ruleId: rule.id,
              customerId: target.customerId,
              channel: rule.channel,
              status: 'failed',
              errorDetail: e instanceof Error ? e.message : String(e),
            },
          })
          result.failed++
        }
      }
    } catch (e) {
      console.error(`Follow-up rule ${rule.id} processing error:`, e)
    }
  }

  return result
}

type FollowUpTarget = {
  customerId: string
  customerName: string
  email: string | null
  lineUserId: string | null
  lastVisitDate: Date | null
  daysSinceVisit: number | null
}

async function findTargets(rule: {
  id: string; tenantId: string; triggerType: string
  intervalDays: number | null; symptomKeyword: string | null
  seasonMonth: number | null; seasonDay: number | null
  daysBeforeExpiry: number | null
}, today: Date): Promise<FollowUpTarget[]> {
  switch (rule.triggerType) {
    case 'interval': {
      if (!rule.intervalDays) return []
      const targetDate = new Date(today)
      targetDate.setDate(targetDate.getDate() - rule.intervalDays)
      const nextDay = new Date(targetDate)
      nextDay.setDate(nextDay.getDate() + 1)

      const customers = await prisma.customer.findMany({
        where: {
          tenantId: rule.tenantId,
          lastVisitAt: { gte: targetDate, lt: nextDay },
        },
      })
      return customers.map(c => ({
        customerId: c.id,
        customerName: c.name,
        email: c.email,
        lineUserId: c.lineUserId,
        lastVisitDate: c.lastVisitAt,
        daysSinceVisit: rule.intervalDays,
      }))
    }

    case 'symptom': {
      if (!rule.symptomKeyword) return []
      // 直近のカルテに症状キーワードを含む患者を検索
      const records = await prisma.carteRecord.findMany({
        where: {
          customer: { tenantId: rule.tenantId },
        },
        include: { customer: true },
        orderBy: { recordedAt: 'desc' },
      })

      const seen = new Set<string>()
      const targets: FollowUpTarget[] = []
      for (const record of records) {
        if (seen.has(record.customerId)) continue
        const dataStr = JSON.stringify(record.data).toLowerCase()
        if (dataStr.includes(rule.symptomKeyword.toLowerCase())) {
          seen.add(record.customerId)
          targets.push({
            customerId: record.customerId,
            customerName: record.customer.name,
            email: record.customer.email,
            lineUserId: record.customer.lineUserId,
            lastVisitDate: record.customer.lastVisitAt,
            daysSinceVisit: record.customer.lastVisitAt
              ? Math.floor((today.getTime() - record.customer.lastVisitAt.getTime()) / (1000 * 60 * 60 * 24))
              : null,
          })
        }
      }
      return targets
    }

    case 'season': {
      if (rule.seasonMonth === null || rule.seasonDay === null) return []
      const month = today.getMonth() + 1
      const day = today.getDate()
      if (month !== rule.seasonMonth || day !== rule.seasonDay) return []

      // 過去1年以内に来院した患者全員
      const oneYearAgo = new Date(today)
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
      const customers = await prisma.customer.findMany({
        where: { tenantId: rule.tenantId, lastVisitAt: { gte: oneYearAgo } },
      })
      return customers.map(c => ({
        customerId: c.id,
        customerName: c.name,
        email: c.email,
        lineUserId: c.lineUserId,
        lastVisitDate: c.lastVisitAt,
        daysSinceVisit: c.lastVisitAt ? Math.floor((today.getTime() - c.lastVisitAt.getTime()) / (1000 * 60 * 60 * 24)) : null,
      }))
    }

    case 'ticket_expiry': {
      const daysBeforeExpiry = rule.daysBeforeExpiry || 7
      const targetDate = new Date(today)
      targetDate.setDate(targetDate.getDate() + daysBeforeExpiry)
      const nextDay = new Date(targetDate)
      nextDay.setDate(nextDay.getDate() + 1)

      const tickets = await prisma.purchasedTicket.findMany({
        where: {
          tenantId: rule.tenantId,
          status: 'active',
          expiresAt: { gte: targetDate, lt: nextDay },
          remainingCount: { gt: 0 },
        },
        include: { customer: true },
      })
      return tickets.map(t => ({
        customerId: t.customerId,
        customerName: t.customer.name,
        email: t.customer.email,
        lineUserId: t.customer.lineUserId,
        lastVisitDate: t.customer.lastVisitAt,
        daysSinceVisit: null,
      }))
    }

    default:
      return []
  }
}

function expandTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || '')
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
}
