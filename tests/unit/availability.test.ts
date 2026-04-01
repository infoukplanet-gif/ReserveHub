import { describe, it, expect, vi, beforeEach } from 'vitest'
import { calculateAvailability } from '@/lib/availability'

const defaultBusinessHours = [
  { dayOfWeek: 0, openTime: '10:00', closeTime: '18:00', isClosed: false }, // 日
  { dayOfWeek: 1, openTime: '10:00', closeTime: '20:00', isClosed: false }, // 月
  { dayOfWeek: 2, openTime: '10:00', closeTime: '20:00', isClosed: false }, // 火
  { dayOfWeek: 3, openTime: '10:00', closeTime: '20:00', isClosed: true },  // 水（定休）
  { dayOfWeek: 4, openTime: '10:00', closeTime: '20:00', isClosed: false }, // 木
  { dayOfWeek: 5, openTime: '10:00', closeTime: '20:00', isClosed: false }, // 金
  { dayOfWeek: 6, openTime: '10:00', closeTime: '18:00', isClosed: false }, // 土
]

const staff = [
  { id: 'staff-1', name: '山田花子', nominationFee: 500 },
  { id: 'staff-2', name: '佐藤健太', nominationFee: 0 },
]

const baseInput = {
  date: new Date('2026-04-06'), // 月曜
  durationMinutes: 75, // 60分メニュー + 15分バッファ
  businessHours: defaultBusinessHours,
  specialDates: [],
  existingReservations: [],
  staff,
  bookingDeadlineHours: 1,
}

beforeEach(() => {
  // 現在時刻を2026-04-06 00:00に固定
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-04-06T00:00:00'))
})

describe('calculateAvailability', () => {
  it('通常の空き枠を返す（月曜、10:00-20:00）', () => {
    const slots = calculateAvailability(baseInput)
    // 10:00から30分間隔、75分枠が20:00に収まるまで
    // 最終枠: 18:30開始 → 19:45終了（20:00以内）
    expect(slots.length).toBeGreaterThan(0)
    expect(slots[0].startsAt.getHours()).toBe(10)
    expect(slots[0].startsAt.getMinutes()).toBe(0)
    // 全枠に2名のスタッフがいる
    expect(slots[0].availableStaff).toHaveLength(2)
  })

  it('定休日は空き枠ゼロ', () => {
    const slots = calculateAvailability({
      ...baseInput,
      date: new Date('2026-04-08'), // 水曜（定休日）
    })
    expect(slots).toHaveLength(0)
  })

  it('臨時休業日は空き枠ゼロ', () => {
    const slots = calculateAvailability({
      ...baseInput,
      specialDates: [{ date: '2026-04-06', isClosed: true, openTime: null, closeTime: null }],
    })
    expect(slots).toHaveLength(0)
  })

  it('特別営業日は特別営業時間を使う', () => {
    const slots = calculateAvailability({
      ...baseInput,
      date: new Date('2026-04-08'), // 水曜（通常定休）
      specialDates: [{ date: '2026-04-08', isClosed: false, openTime: '10:00', closeTime: '16:00' }],
    })
    expect(slots.length).toBeGreaterThan(0)
    // 最終枠が16:00以内に収まること
    const lastSlot = slots[slots.length - 1]
    expect(lastSlot.endsAt.getHours()).toBeLessThanOrEqual(16)
  })

  it('既存予約と重複する枠はスタッフが除外される', () => {
    const slots = calculateAvailability({
      ...baseInput,
      existingReservations: [
        {
          staffId: 'staff-1',
          startsAt: new Date('2026-04-06T10:00:00'),
          endsAt: new Date('2026-04-06T11:15:00'),
        },
      ],
    })
    // 10:00枠ではstaff-1が除外される
    const tenOClock = slots.find((s) => s.startsAt.getHours() === 10 && s.startsAt.getMinutes() === 0)
    expect(tenOClock).toBeDefined()
    expect(tenOClock!.availableStaff).toHaveLength(1)
    expect(tenOClock!.availableStaff[0].id).toBe('staff-2')
  })

  it('全スタッフが埋まっている枠は返さない', () => {
    const slots = calculateAvailability({
      ...baseInput,
      existingReservations: [
        {
          staffId: 'staff-1',
          startsAt: new Date('2026-04-06T10:00:00'),
          endsAt: new Date('2026-04-06T11:15:00'),
        },
        {
          staffId: 'staff-2',
          startsAt: new Date('2026-04-06T10:00:00'),
          endsAt: new Date('2026-04-06T11:15:00'),
        },
      ],
    })
    const tenOClock = slots.find((s) => s.startsAt.getHours() === 10 && s.startsAt.getMinutes() === 0)
    expect(tenOClock).toBeUndefined()
  })

  it('指名スタッフのみの空き枠を返す', () => {
    const slots = calculateAvailability({
      ...baseInput,
      targetStaffId: 'staff-1',
    })
    // 全枠でstaff-1のみ
    slots.forEach((s) => {
      expect(s.availableStaff).toHaveLength(1)
      expect(s.availableStaff[0].id).toBe('staff-1')
    })
  })

  it('30分間隔で枠が生成される（デフォルト）', () => {
    const slots = calculateAvailability(baseInput)
    if (slots.length >= 2) {
      const diff = slots[1].startsAt.getTime() - slots[0].startsAt.getTime()
      expect(diff).toBe(30 * 60 * 1000)
    }
  })
})
