import { describe, it, expect } from 'vitest'
import { calculatePrice, getPriceRange, calculateDuration } from '@/lib/pricing'

const baseInput = {
  basePrice: 8000,
  pricingRules: [],
  selectedOptions: [],
  nominationFee: 0,
  bookingDate: new Date('2026-04-06T10:00:00'), // 月曜日
}

describe('calculatePrice', () => {
  it('ベース料金のみ（ルールなし）', () => {
    const result = calculatePrice(baseInput)
    expect(result.menuPrice).toBe(8000)
    expect(result.totalPrice).toBe(8000)
    expect(result.menuPriceLabel).toBeNull()
  })

  it('曜日ルール適用 — 平日', () => {
    const result = calculatePrice({
      ...baseInput,
      pricingRules: [
        {
          id: '1',
          ruleType: 'day_of_week',
          dayOfWeek: [1, 2, 3, 4, 5], // 月〜金
          timeFrom: null,
          timeTo: null,
          price: 7500,
          label: '平日料金',
          priority: 1,
        },
      ],
      bookingDate: new Date('2026-04-06T10:00:00'), // 月曜
    })
    expect(result.menuPrice).toBe(7500)
    expect(result.menuPriceLabel).toBe('平日料金')
  })

  it('曜日ルール適用 — 休日', () => {
    const result = calculatePrice({
      ...baseInput,
      pricingRules: [
        {
          id: '1',
          ruleType: 'day_of_week',
          dayOfWeek: [0, 6], // 日・土
          timeFrom: null,
          timeTo: null,
          price: 10000,
          label: '休日料金',
          priority: 1,
        },
      ],
      bookingDate: new Date('2026-04-05T10:00:00'), // 日曜
    })
    expect(result.menuPrice).toBe(10000)
    expect(result.menuPriceLabel).toBe('休日料金')
  })

  it('曜日ルールに該当しない場合はベース料金', () => {
    const result = calculatePrice({
      ...baseInput,
      pricingRules: [
        {
          id: '1',
          ruleType: 'day_of_week',
          dayOfWeek: [0, 6], // 日・土のみ
          timeFrom: null,
          timeTo: null,
          price: 10000,
          label: '休日料金',
          priority: 1,
        },
      ],
      bookingDate: new Date('2026-04-06T10:00:00'), // 月曜 → 該当しない
    })
    expect(result.menuPrice).toBe(8000) // ベース料金
  })

  it('時間帯ルール適用', () => {
    const result = calculatePrice({
      ...baseInput,
      pricingRules: [
        {
          id: '1',
          ruleType: 'time_slot',
          dayOfWeek: [],
          timeFrom: '18:00',
          timeTo: '21:00',
          price: 7000,
          label: 'ナイト割',
          priority: 1,
        },
      ],
      bookingDate: new Date('2026-04-06T19:00:00'), // 月曜19時
    })
    expect(result.menuPrice).toBe(7000)
    expect(result.menuPriceLabel).toBe('ナイト割')
  })

  it('時間帯ルールに該当しない場合はベース料金', () => {
    const result = calculatePrice({
      ...baseInput,
      pricingRules: [
        {
          id: '1',
          ruleType: 'time_slot',
          dayOfWeek: [],
          timeFrom: '18:00',
          timeTo: '21:00',
          price: 7000,
          label: 'ナイト割',
          priority: 1,
        },
      ],
      bookingDate: new Date('2026-04-06T10:00:00'), // 月曜10時 → 該当しない
    })
    expect(result.menuPrice).toBe(8000)
  })

  it('曜日×時間帯ルールが最優先（priority高）', () => {
    const result = calculatePrice({
      ...baseInput,
      pricingRules: [
        {
          id: '1',
          ruleType: 'day_of_week',
          dayOfWeek: [1, 2, 3, 4, 5],
          timeFrom: null,
          timeTo: null,
          price: 8000,
          label: '平日料金',
          priority: 1,
        },
        {
          id: '2',
          ruleType: 'time_slot',
          dayOfWeek: [],
          timeFrom: '18:00',
          timeTo: '21:00',
          price: 7000,
          label: 'ナイト割',
          priority: 2,
        },
        {
          id: '3',
          ruleType: 'day_and_time',
          dayOfWeek: [1, 2, 3, 4, 5],
          timeFrom: '18:00',
          timeTo: '21:00',
          price: 6500,
          label: '平日ナイト割',
          priority: 3, // 最高優先
        },
      ],
      bookingDate: new Date('2026-04-06T19:00:00'), // 月曜19時
    })
    expect(result.menuPrice).toBe(6500)
    expect(result.menuPriceLabel).toBe('平日ナイト割')
  })

  it('オプション1つ追加', () => {
    const result = calculatePrice({
      ...baseInput,
      selectedOptions: [
        { id: '1', name: 'ヘッドスパ追加', price: 1500, durationMinutes: 15 },
      ],
    })
    expect(result.menuPrice).toBe(8000)
    expect(result.optionPrice).toBe(1500)
    expect(result.totalPrice).toBe(9500)
  })

  it('オプション複数追加', () => {
    const result = calculatePrice({
      ...baseInput,
      selectedOptions: [
        { id: '1', name: 'ヘッドスパ追加', price: 1500, durationMinutes: 15 },
        { id: '2', name: 'アロマ変更', price: 500, durationMinutes: 0 },
      ],
    })
    expect(result.optionPrice).toBe(2000)
    expect(result.totalPrice).toBe(10000)
    expect(result.optionDetails).toHaveLength(2)
  })

  it('指名料加算', () => {
    const result = calculatePrice({
      ...baseInput,
      nominationFee: 500,
    })
    expect(result.nominationFee).toBe(500)
    expect(result.totalPrice).toBe(8500)
  })

  it('全部乗せ（曜日×時間帯 + オプション複数 + 指名料）', () => {
    const result = calculatePrice({
      ...baseInput,
      pricingRules: [
        {
          id: '1',
          ruleType: 'day_and_time',
          dayOfWeek: [0, 6],
          timeFrom: '10:00',
          timeTo: '18:00',
          price: 10000,
          label: '休日デイ料金',
          priority: 3,
        },
      ],
      selectedOptions: [
        { id: '1', name: 'ヘッドスパ追加', price: 1500, durationMinutes: 15 },
        { id: '2', name: 'アロマ変更', price: 500, durationMinutes: 0 },
        { id: '3', name: '延長15分', price: 2000, durationMinutes: 15 },
      ],
      nominationFee: 500,
      bookingDate: new Date('2026-04-05T14:00:00'), // 日曜14時
    })
    expect(result.menuPrice).toBe(10000)
    expect(result.optionPrice).toBe(4000)
    expect(result.nominationFee).toBe(500)
    expect(result.totalPrice).toBe(14500)
    expect(result.menuPriceLabel).toBe('休日デイ料金')
  })
})

describe('getPriceRange', () => {
  it('ルールなし → ベース料金のみ', () => {
    const result = getPriceRange(8000, [])
    expect(result.min).toBe(8000)
    expect(result.max).toBe(8000)
  })

  it('複数ルール → 最安〜最高', () => {
    const result = getPriceRange(8000, [
      { id: '1', ruleType: 'day_of_week', dayOfWeek: [0, 6], timeFrom: null, timeTo: null, price: 10000, label: null, priority: 1 },
      { id: '2', ruleType: 'time_slot', dayOfWeek: [], timeFrom: '18:00', timeTo: '21:00', price: 7000, label: null, priority: 2 },
    ])
    expect(result.min).toBe(7000)
    expect(result.max).toBe(10000)
  })
})

describe('calculateDuration', () => {
  it('メニューのみ（オプションなし）', () => {
    expect(calculateDuration(60, 15, [])).toBe(75)
  })

  it('オプション追加時の時間計算', () => {
    expect(
      calculateDuration(60, 15, [
        { durationMinutes: 15 },
        { durationMinutes: 0 },
        { durationMinutes: 15 },
      ])
    ).toBe(105) // 60 + 15 + 0 + 15 + 15(buffer)
  })
})
