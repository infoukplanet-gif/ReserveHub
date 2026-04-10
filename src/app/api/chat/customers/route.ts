export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedTenantId } from '@/lib/auth'
import { handleApiError } from '@/lib/api-error'

export async function GET() {
  try {
    const tenantId = await getAuthenticatedTenantId()

    // チャット履歴がある顧客を最新メッセージ順で取得
    const customers = await prisma.customer.findMany({
      where: {
        tenantId,
        lineUserId: { not: null },
      },
      select: {
        id: true,
        name: true,
        lineUserId: true,
      },
      orderBy: { updatedAt: 'desc' },
    })

    // 各顧客の最新メッセージを取得
    const data = await Promise.all(
      customers.map(async (c) => {
        const lastMessage = await prisma.chatMessage.findFirst({
          where: { tenantId, customerId: c.id },
          orderBy: { sentAt: 'desc' },
          select: { content: true, sentAt: true, direction: true },
        })
        const unreadCount = await prisma.chatMessage.count({
          where: { tenantId, customerId: c.id, direction: 'inbound' },
        })
        return { ...c, lastMessage, unreadCount }
      }),
    )

    // 最新メッセージで並び替え
    data.sort((a, b) => {
      const aTime = a.lastMessage?.sentAt ? new Date(a.lastMessage.sentAt).getTime() : 0
      const bTime = b.lastMessage?.sentAt ? new Date(b.lastMessage.sentAt).getTime() : 0
      return bTime - aTime
    })

    return NextResponse.json({ data })
  } catch (error) {
    return handleApiError(error)
  }
}
