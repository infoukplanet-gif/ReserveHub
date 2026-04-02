export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedTenantId } from '@/lib/auth'
import { ApiError, handleApiError } from '@/lib/api-error'


type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const tenantId = await getAuthenticatedTenantId()
    const { id } = await params
    const body = await req.json()

    const existing = await prisma.blogPost.findFirst({ where: { id, tenantId } })
    if (!existing) throw new ApiError(404, 'NOT_FOUND', '記事が見つかりません')

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.content !== undefined ? { content: body.content } : {}),
        ...(body.category !== undefined ? { category: body.category } : {}),
        ...(body.isPublished !== undefined ? {
          isPublished: body.isPublished,
          publishedAt: body.isPublished ? new Date() : null,
        } : {}),
      },
    })

    return NextResponse.json({ data: post })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const tenantId = await getAuthenticatedTenantId()
    const { id } = await params

    const existing = await prisma.blogPost.findFirst({ where: { id, tenantId } })
    if (!existing) throw new ApiError(404, 'NOT_FOUND', '記事が見つかりません')

    await prisma.blogPost.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
