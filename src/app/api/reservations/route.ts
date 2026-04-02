export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedTenantId } from '@/lib/auth'
import { createReservationSchema } from '@/lib/validators/reservation'
import { ApiError, handleApiError } from '@/lib/api-error'
import { calculatePrice, calculateDuration } from '@/lib/pricing'
import type { PricingRule, MenuOption } from '@/generated/prisma/client'


export async function GET(req: NextRequest) {
  try {
    const tenantId = await getAuthenticatedTenantId()
    const { searchParams } = new URL(req.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const staffId = searchParams.get('staffId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('perPage') || '50')

    const where = {
      tenantId,
      ...(from && to ? { startsAt: { gte: new Date(from), lte: new Date(to) } } : {}),
      ...(staffId ? { staffId } : {}),
      ...(status ? { status } : {}),
    }

    const [reservations, total] = await Promise.all([
      prisma.reservation.findMany({
        where,
        include: {
          customer: true,
          staff: true,
          menu: true,
          options: { include: { menuOption: true } },
        },
        orderBy: { startsAt: 'asc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.reservation.count({ where }),
    ])

    return NextResponse.json({ data: reservations, total, page, perPage })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenantId = await getAuthenticatedTenantId()
    const body = await req.json()
    const parsed = createReservationSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'バリデーションエラー', code: 'VALIDATION_ERROR', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { menuId, staffId, startsAt, optionIds, customer, useTicketId, memo } = parsed.data

    // 1. メニュー取得
    const menu = await prisma.menu.findFirst({
      where: { id: menuId, tenantId },
      include: {
        pricingRules: true,
        menuOptions: true,
      },
    })
    if (!menu) throw new ApiError(404, 'NOT_FOUND', 'メニューが見つかりません')

    // 2. 選択オプション取得
    const selectedOptions = (menu.menuOptions as MenuOption[]).filter((o: MenuOption) => optionIds.includes(o.id))

    // 3. スタッフの指名料取得
    let nominationFee = 0
    if (staffId) {
      const staff = await prisma.staff.findFirst({ where: { id: staffId, tenantId } })
      if (!staff) throw new ApiError(404, 'NOT_FOUND', 'スタッフが見つかりません')
      nominationFee = staff.nominationFee
    }

    // 4. 料金計算
    const bookingDate = new Date(startsAt)
    const priceBreakdown = calculatePrice({
      basePrice: menu.basePrice,
      pricingRules: (menu.pricingRules as PricingRule[]).map((r: PricingRule) => ({
        id: r.id,
        ruleType: r.ruleType,
        dayOfWeek: r.dayOfWeek,
        timeFrom: r.timeFrom,
        timeTo: r.timeTo,
        price: r.price,
        label: r.label,
        priority: r.priority,
      })),
      selectedOptions: selectedOptions.map((o: MenuOption) => ({
        id: o.id,
        name: o.name,
        price: o.price,
        durationMinutes: o.durationMinutes,
      })),
      nominationFee,
      bookingDate,
    })

    // 5. 所要時間計算 → 終了時刻
    const duration = calculateDuration(
      menu.durationMinutes,
      menu.bufferMinutes,
      selectedOptions
    )
    const endsAt = new Date(bookingDate.getTime() + duration * 60000)

    // 6. ダブルブッキングチェック
    if (staffId) {
      const conflict = await prisma.reservation.findFirst({
        where: {
          tenantId,
          staffId,
          status: { in: ['confirmed'] },
          startsAt: { lt: endsAt },
          endsAt: { gt: bookingDate },
        },
      })
      if (conflict) {
        throw new ApiError(409, 'CONFLICT', 'この時間帯は既に予約が入っています')
      }
    }

    // 7. 顧客の取得 or 作成
    let customerId: string
    const existingCustomer = await prisma.customer.findFirst({
      where: { tenantId, email: customer.email },
    })
    if (existingCustomer) {
      customerId = existingCustomer.id
    } else {
      const newCustomer = await prisma.customer.create({
        data: {
          tenantId,
          name: customer.name,
          nameKana: customer.nameKana,
          email: customer.email,
          phone: customer.phone,
        },
      })
      customerId = newCustomer.id
    }

    // 8. 予約作成（トランザクション）
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reservation = await prisma.$transaction(async (tx: any) => {
      const res = await tx.reservation.create({
        data: {
          tenantId,
          customerId,
          staffId: staffId || null,
          menuId,
          startsAt: bookingDate,
          endsAt,
          menuPrice: priceBreakdown.menuPrice,
          optionPrice: priceBreakdown.optionPrice,
          nominationFee: priceBreakdown.nominationFee,
          totalPrice: priceBreakdown.totalPrice,
          memo,
          source: 'web',
          options: {
            create: selectedOptions.map((o: MenuOption) => ({
              menuOptionId: o.id,
              price: o.price,
            })),
          },
        },
        include: {
          customer: true,
          staff: true,
          menu: true,
          options: { include: { menuOption: true } },
        },
      })

      // 回数券消化
      if (useTicketId) {
        const ticket = await tx.purchasedTicket.findFirst({
          where: { id: useTicketId, customerId, status: 'active' },
        })
        if (!ticket || ticket.remainingCount <= 0) {
          throw new ApiError(422, 'BUSINESS_RULE_ERROR', '回数券の残回数がありません')
        }
        await tx.purchasedTicket.update({
          where: { id: useTicketId },
          data: {
            remainingCount: { decrement: 1 },
            ...(ticket.remainingCount === 1 ? { status: 'used_up' } : {}),
          },
        })
        await tx.reservationTicketUsage.create({
          data: { reservationId: res.id, purchasedTicketId: useTicketId },
        })
      }

      // 顧客統計更新
      await tx.customer.update({
        where: { id: customerId },
        data: {
          totalVisits: { increment: 1 },
          totalRevenue: { increment: priceBreakdown.totalPrice },
          lastVisitAt: bookingDate,
        },
      })

      return res
    })

    return NextResponse.json({ data: reservation }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
