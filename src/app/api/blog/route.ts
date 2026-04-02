export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiError, handleApiError } from '@/lib/api-error'

async function getTenantId(): Promise<string> {
  const tenant = await prisma.tenant.findFirst()
  if (!tenant) throw new ApiError(401, 'NO_TENANT', 'テナントが見つかりません')
  return tenant.id
}

export async function GET() {
  try {
    const tenantId = await getTenantId()
    const posts = await prisma.blogPost.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ data: posts })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenantId = await getTenantId()
    const body = await req.json()

    const slug = body.title
      .toLowerCase()
      .replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 200) || `post-${Date.now()}`

    const post = await prisma.blogPost.create({
      data: {
        tenantId,
        title: body.title,
        slug,
        content: body.content || '',
        category: body.category,
        isPublished: body.isPublished ?? false,
        publishedAt: body.isPublished ? new Date() : null,
      },
    })

    return NextResponse.json({ data: post }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
