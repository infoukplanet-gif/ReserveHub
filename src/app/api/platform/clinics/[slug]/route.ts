export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiError, handleApiError } from '@/lib/api-error'

type Params = { params: Promise<{ slug: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params

    const clinic = await prisma.tenant.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        email: true,
        phone: true,
        postalCode: true,
        address: true,
        latitude: true,
        longitude: true,
        logoUrl: true,
        description: true,
        symptoms: true,
        hpSetting: true,
        menus: {
          where: { isActive: true },
          select: { id: true, name: true, description: true, basePrice: true, durationMinutes: true, imageUrl: true },
          orderBy: { displayOrder: 'asc' },
          take: 10,
        },
        staff: {
          where: { isActive: true },
          select: { id: true, name: true, bio: true, avatarUrl: true },
          orderBy: { displayOrder: 'asc' },
        },
        businessHours: { orderBy: { dayOfWeek: 'asc' } },
      },
    })

    if (!clinic || !clinic.hpSetting) {
      throw new ApiError(404, 'NOT_FOUND', '院が見つかりません')
    }

    // 平均評価と件数
    const [reviewStats, recentReviews] = await Promise.all([
      prisma.review.aggregate({
        where: { tenantId: clinic.id, isPublished: true },
        _avg: { rating: true },
        _count: true,
      }),
      prisma.review.findMany({
        where: { tenantId: clinic.id, isPublished: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ])

    return NextResponse.json({
      data: {
        ...clinic,
        avgRating: reviewStats._avg.rating || 0,
        reviewCount: reviewStats._count,
        recentReviews,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
