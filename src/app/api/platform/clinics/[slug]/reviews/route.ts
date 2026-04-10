export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiError, handleApiError } from '@/lib/api-error'

type Params = { params: Promise<{ slug: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params
    const { searchParams } = req.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 20

    const tenant = await prisma.tenant.findUnique({ where: { slug }, select: { id: true } })
    if (!tenant) throw new ApiError(404, 'NOT_FOUND', '院が見つかりません')

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { tenantId: tenant.id, isPublished: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where: { tenantId: tenant.id, isPublished: true } }),
    ])

    return NextResponse.json({ data: reviews, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params
    const body = await req.json()

    const tenant = await prisma.tenant.findUnique({ where: { slug }, select: { id: true } })
    if (!tenant) throw new ApiError(404, 'NOT_FOUND', '院が見つかりません')

    if (!body.authorName?.trim()) throw new ApiError(400, 'INVALID_INPUT', 'お名前を入力してください')
    if (!body.content?.trim()) throw new ApiError(400, 'INVALID_INPUT', '口コミ内容を入力してください')
    if (!body.rating || body.rating < 1 || body.rating > 5) throw new ApiError(400, 'INVALID_INPUT', '評価は1〜5で入力してください')

    const review = await prisma.review.create({
      data: {
        tenantId: tenant.id,
        authorName: body.authorName,
        rating: body.rating,
        title: body.title || null,
        content: body.content,
        isApproved: false,
        isPublished: false,
      },
    })

    return NextResponse.json({ data: review }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
