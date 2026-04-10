export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedTenantId } from '@/lib/auth'
import { ApiError, handleApiError } from '@/lib/api-error'
import { sendLineMessage } from '@/lib/line'

type Params = { params: Promise<{ customerId: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const tenantId = await getAuthenticatedTenantId()
    const { customerId } = await params

    const messages = await prisma.chatMessage.findMany({
      where: { tenantId, customerId },
      orderBy: { sentAt: 'asc' },
      take: 100,
    })

    return NextResponse.json({ data: messages })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const tenantId = await getAuthenticatedTenantId()
    const { customerId } = await params
    const { content } = await req.json()

    if (!content?.trim()) throw new ApiError(400, 'INVALID_INPUT', 'メッセージを入力してください')

    // 顧客とLINE設定を取得
    const [customer, lineConfig] = await Promise.all([
      prisma.customer.findFirst({ where: { id: customerId, tenantId } }),
      prisma.lineConfig.findUnique({ where: { tenantId } }),
    ])

    if (!customer) throw new ApiError(404, 'NOT_FOUND', '患者が見つかりません')
    if (!customer.lineUserId) throw new ApiError(400, 'NO_LINE', 'この患者はLINE連携されていません')
    if (!lineConfig?.isActive) throw new ApiError(400, 'LINE_INACTIVE', 'LINE連携が無効です')

    // LINE送信
    await sendLineMessage(lineConfig.channelAccessToken, customer.lineUserId, [
      { type: 'text', text: content },
    ])

    // メッセージ保存
    const message = await prisma.chatMessage.create({
      data: {
        tenantId,
        customerId,
        direction: 'outbound',
        messageType: 'text',
        content,
      },
    })

    return NextResponse.json({ data: message }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
