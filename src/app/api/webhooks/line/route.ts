import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyLineSignature, getLineProfile } from '@/lib/line'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('x-line-signature')
  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })

  // パースしてdestination（Bot UserId）からテナントを特定
  let parsed: { destination?: string; events: LineEvent[] }
  try {
    parsed = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // 全テナントのLineConfigを検索してsignatureを検証
  const configs = await prisma.lineConfig.findMany({ where: { isActive: true } })
  let matchedConfig: typeof configs[number] | null = null

  for (const config of configs) {
    if (verifyLineSignature(body, signature, config.channelSecret)) {
      matchedConfig = config
      break
    }
  }

  if (!matchedConfig) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  for (const event of parsed.events) {
    try {
      if (event.type === 'message' && event.message.type === 'text') {
        // テキストメッセージ受信
        const lineUserId = event.source.userId
        if (!lineUserId) continue

        // 顧客をlineUserIdで検索、なければ作成
        let customer = await prisma.customer.findFirst({
          where: { tenantId: matchedConfig.tenantId, lineUserId },
        })

        if (!customer) {
          // LINEプロフィールから名前取得
          const profile = await getLineProfile(matchedConfig.channelAccessToken, lineUserId)
          customer = await prisma.customer.create({
            data: {
              tenantId: matchedConfig.tenantId,
              name: profile.displayName,
              lineUserId,
            },
          })
        }

        // メッセージ保存
        await prisma.chatMessage.create({
          data: {
            tenantId: matchedConfig.tenantId,
            customerId: customer.id,
            direction: 'inbound',
            messageType: 'text',
            content: event.message.text,
            lineMessageId: event.message.id,
          },
        })
      }

      if (event.type === 'follow') {
        // 友だち追加
        const lineUserId = event.source.userId
        if (!lineUserId) continue

        const existing = await prisma.customer.findFirst({
          where: { tenantId: matchedConfig.tenantId, lineUserId },
        })
        if (!existing) {
          const profile = await getLineProfile(matchedConfig.channelAccessToken, lineUserId)
          await prisma.customer.create({
            data: {
              tenantId: matchedConfig.tenantId,
              name: profile.displayName,
              lineUserId,
            },
          })
        }
      }
    } catch (e) {
      console.error('LINE webhook event processing error:', e)
    }
  }

  return NextResponse.json({ ok: true })
}

type LineEvent = {
  type: string
  replyToken?: string
  source: { type: string; userId?: string }
  message: { id: string; type: string; text: string }
}
