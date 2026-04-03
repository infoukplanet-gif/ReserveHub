export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedTenantId } from '@/lib/auth'
import { ApiError, handleApiError } from '@/lib/api-error'

type Params = { params: Promise<{ id: string }> }

// タグを追加
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const tenantId = await getAuthenticatedTenantId()
    const { id: customerId } = await params
    const body = await req.json()

    const customer = await prisma.customer.findFirst({ where: { id: customerId, tenantId } })
    if (!customer) throw new ApiError(404, 'NOT_FOUND', '顧客が見つかりません')

    // タグを取得 or 作成
    let tag = await prisma.customerTag.findFirst({ where: { tenantId, name: body.tagName } })
    if (!tag) {
      tag = await prisma.customerTag.create({ data: { tenantId, name: body.tagName, color: body.color || '#3B82F6' } })
    }

    // 紐付け（既に存在する場合はスキップ）
    await prisma.customerTagAssignment.upsert({
      where: { customerId_tagId: { customerId, tagId: tag.id } },
      create: { customerId, tagId: tag.id },
      update: {},
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}

// タグを削除
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const tenantId = await getAuthenticatedTenantId()
    const { id: customerId } = await params
    const { searchParams } = new URL(req.url)
    const tagName = searchParams.get('tagName')
    if (!tagName) throw new ApiError(400, 'VALIDATION_ERROR', 'tagNameは必須です')

    const tag = await prisma.customerTag.findFirst({ where: { tenantId, name: tagName } })
    if (tag) {
      await prisma.customerTagAssignment.deleteMany({ where: { customerId, tagId: tag.id } })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
