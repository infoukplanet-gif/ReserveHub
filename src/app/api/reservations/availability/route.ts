import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateAvailability } from '@/lib/availability'
import { calculateDuration } from '@/lib/pricing'
import { ApiError, handleApiError } from '@/lib/api-error'
import type { MenuOption, BusinessHour, SpecialDate, StaffMenu, Staff } from '@/generated/prisma/client'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const tenantSlug = searchParams.get('tenantSlug')
    const menuId = searchParams.get('menuId')
    const staffId = searchParams.get('staffId')
    const date = searchParams.get('date') // YYYY-MM-DD
    const optionIdsParam = searchParams.get('optionIds') // comma-separated

    if (!tenantSlug || !menuId || !date) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'tenantSlug, menuId, date は必須です')
    }

    // テナント取得
    const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } })
    if (!tenant) throw new ApiError(404, 'NOT_FOUND', '店舗が見つかりません')

    // メニュー取得
    const menu = await prisma.menu.findFirst({
      where: { id: menuId, tenantId: tenant.id },
      include: { menuOptions: true, pricingRules: true },
    })
    if (!menu) throw new ApiError(404, 'NOT_FOUND', 'メニューが見つかりません')

    // オプション取得
    const optionIds = optionIdsParam ? optionIdsParam.split(',') : []
    const selectedOptions = (menu.menuOptions as MenuOption[]).filter((o: MenuOption) => optionIds.includes(o.id))

    // 所要時間計算
    const durationMinutes = calculateDuration(
      menu.durationMinutes,
      menu.bufferMinutes,
      selectedOptions
    )

    // 営業時間取得
    const businessHours = await prisma.businessHour.findMany({
      where: { tenantId: tenant.id },
    })

    // 特別日取得
    const specialDates = await prisma.specialDate.findMany({
      where: { tenantId: tenant.id },
    })

    // スタッフ取得（メニュー対応者のみ）
    const staffMenus: (StaffMenu & { staff: Staff })[] = await prisma.staffMenu.findMany({
      where: { menuId },
      include: { staff: true },
    })
    const availableStaff = staffMenus
      .filter((sm: StaffMenu & { staff: Staff }) => sm.staff.isActive)
      .map((sm: StaffMenu & { staff: Staff }) => ({
        id: sm.staff.id,
        name: sm.staff.name,
        nominationFee: sm.staff.nominationFee,
      }))

    // 対象日の既存予約取得
    const targetDate = new Date(date)
    const nextDate = new Date(targetDate)
    nextDate.setDate(nextDate.getDate() + 1)

    const existingReservations = await prisma.reservation.findMany({
      where: {
        tenantId: tenant.id,
        status: 'confirmed',
        startsAt: { gte: targetDate, lt: nextDate },
      },
      select: { staffId: true, startsAt: true, endsAt: true },
    })

    // 空き枠計算
    const slots = calculateAvailability({
      date: targetDate,
      durationMinutes,
      businessHours: (businessHours as BusinessHour[]).map((bh: BusinessHour) => ({
        dayOfWeek: bh.dayOfWeek,
        openTime: bh.openTime,
        closeTime: bh.closeTime,
        isClosed: bh.isClosed,
      })),
      specialDates: (specialDates as SpecialDate[]).map((sd: SpecialDate) => ({
        date: sd.date.toISOString().split('T')[0],
        isClosed: sd.isClosed,
        openTime: sd.openTime,
        closeTime: sd.closeTime,
      })),
      existingReservations,
      staff: availableStaff,
      targetStaffId: staffId || undefined,
      bookingDeadlineHours: tenant.bookingDeadlineHours,
    })

    return NextResponse.json({
      date,
      dayOfWeek: targetDate.getDay(),
      slots: slots.map((s) => ({
        startsAt: s.startsAt.toISOString(),
        endsAt: s.endsAt.toISOString(),
        availableStaff: s.availableStaff,
      })),
    })
  } catch (error) {
    return handleApiError(error)
  }
}
