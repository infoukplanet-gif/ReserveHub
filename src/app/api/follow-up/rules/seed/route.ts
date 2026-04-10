export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedTenantId } from '@/lib/auth'
import { handleApiError } from '@/lib/api-error'

const PRESETS = [
  {
    name: '来院リマインド（7日後）',
    triggerType: 'interval',
    intervalDays: 7,
    subject: '前回の施術から1週間が経ちました',
    bodyTemplate: '{{customerName}}様\n\n前回の施術から1週間が経ちました。お体の調子はいかがですか？\n気になる症状があれば、お気軽にご相談ください。\n\n{{tenantName}}',
  },
  {
    name: '来院リマインド（14日後）',
    triggerType: 'interval',
    intervalDays: 14,
    subject: 'そろそろメンテナンスの時期です',
    bodyTemplate: '{{customerName}}様\n\n前回のご来院から2週間が経ちました。\nそろそろメンテナンスの時期です。定期的なケアで症状の悪化を防ぎましょう。\n\nご予約をお待ちしております。\n\n{{tenantName}}',
  },
  {
    name: '来院リマインド（30日後）',
    triggerType: 'interval',
    intervalDays: 30,
    subject: '1ヶ月お体のケアをされていませんが、お変わりありませんか？',
    bodyTemplate: '{{customerName}}様\n\n最後のご来院から1ヶ月が経ちました。\nお体の調子はいかがですか？お変わりなければ幸いです。\n\nメンテナンスをご希望の際はお気軽にご予約ください。\n\n{{tenantName}}',
  },
  {
    name: '回数券期限リマインド',
    triggerType: 'ticket_expiry',
    daysBeforeExpiry: 7,
    subject: '回数券の有効期限が近づいています',
    bodyTemplate: '{{customerName}}様\n\nご購入いただいた回数券の有効期限が残り7日となりました。\n期限内にぜひご利用ください。\n\n{{tenantName}}',
  },
  {
    name: '梅雨時期リマインド（6月1日）',
    triggerType: 'season',
    seasonMonth: 6,
    seasonDay: 1,
    subject: '梅雨時期の関節ケアのご案内',
    bodyTemplate: '{{customerName}}様\n\n梅雨の季節になりました。湿気の多い時期は関節痛や古傷が出やすくなります。\n早めのケアで快適にお過ごしください。\n\n{{tenantName}}',
  },
  {
    name: '冬の冷え対策リマインド（11月1日）',
    triggerType: 'season',
    seasonMonth: 11,
    seasonDay: 1,
    subject: '冬に向けた冷え性対策のご案内',
    bodyTemplate: '{{customerName}}様\n\n寒さが本格化する季節です。冷え性対策には早めのケアが効果的です。\n温灸コースや全身調整で冬を乗り越えましょう。\n\n{{tenantName}}',
  },
]

export async function POST() {
  try {
    const tenantId = await getAuthenticatedTenantId()

    const existing = await prisma.followUpRule.findMany({
      where: { tenantId, isPreset: true },
      select: { name: true },
    })
    const existingNames = new Set(existing.map(r => r.name))

    const created: string[] = []
    for (const preset of PRESETS) {
      if (existingNames.has(preset.name)) continue
      await prisma.followUpRule.create({
        data: { tenantId, ...preset, channel: 'email', isPreset: true },
      })
      created.push(preset.name)
    }

    return NextResponse.json({ data: { created } }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
