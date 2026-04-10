export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/api-error'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const area = searchParams.get('area') || ''
    const symptom = searchParams.get('symptom') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 20

    // --- ReserveHub利用者（無料掲載） ---
    const tenantWhere: Record<string, unknown> = { isListedOnPlatform: true }
    if (area) {
      tenantWhere.OR = [
        { address: { contains: area, mode: 'insensitive' } },
        { postalCode: { startsWith: area } },
      ]
    }
    if (symptom) {
      tenantWhere.symptoms = { has: symptom }
    }

    const tenants = await prisma.tenant.findMany({
      where: tenantWhere,
      select: {
        id: true, name: true, slug: true, address: true, phone: true,
        logoUrl: true, description: true, symptoms: true,
        hpSetting: { select: { heroImageUrl: true, primaryColor: true } },
        _count: { select: { reviews: { where: { isPublished: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const tenantData = await Promise.all(
      tenants.map(async (c) => {
        const avg = await prisma.review.aggregate({
          where: { tenantId: c.id, isPublished: true },
          _avg: { rating: true },
        })
        return {
          id: c.id, name: c.name, slug: c.slug, address: c.address,
          description: c.description, logoUrl: c.logoUrl, symptoms: c.symptoms,
          avgRating: avg._avg.rating || 0, reviewCount: c._count.reviews,
          hpSetting: c.hpSetting,
          source: 'reservehub' as const,
          bookable: true,
        }
      }),
    )

    // --- 有料掲載院 ---
    const paidWhere: Record<string, unknown> = { isActive: true }
    if (area) {
      paidWhere.OR = [
        { address: { contains: area, mode: 'insensitive' } },
        { postalCode: { startsWith: area } },
      ]
    }
    if (symptom) {
      paidWhere.symptoms = { has: symptom }
    }
    // 期限チェック
    paidWhere.OR_expiry = undefined // handled below

    const paidListings = await prisma.paidListing.findMany({
      where: {
        ...paidWhere,
        OR: paidWhere.OR as undefined,
        isActive: true,
        expiresAt: { gte: new Date() },
        ...(area ? {
          OR: [
            { address: { contains: area, mode: 'insensitive' } },
            { postalCode: { startsWith: area } },
          ],
        } : {}),
        ...(symptom ? { symptoms: { has: symptom } } : {}),
      },
    })

    const paidData = paidListings.map(p => ({
      id: p.id, name: p.name, slug: p.slug, address: p.address,
      description: p.description, logoUrl: p.logoUrl, symptoms: p.symptoms,
      avgRating: 0, reviewCount: 0,
      hpSetting: p.coverImageUrl ? { heroImageUrl: p.coverImageUrl, primaryColor: '#10b981' } : null,
      source: 'paid' as const,
      bookable: false,
      website: p.website,
      listingPlan: p.listingPlan,
    }))

    // premium掲載を上位に、その後ReserveHub利用者
    const allData = [
      ...paidData.filter(p => p.listingPlan === 'premium'),
      ...tenantData,
      ...paidData.filter(p => p.listingPlan === 'basic'),
    ]

    const total = allData.length
    const paginated = allData.slice((page - 1) * limit, page * limit)

    return NextResponse.json({ data: paginated, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    return handleApiError(error)
  }
}
