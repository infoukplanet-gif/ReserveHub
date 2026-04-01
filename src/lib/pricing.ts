/**
 * 料金計算ロジック — ReserveHubの差別化の核心
 *
 * 優先順位: 曜日×時間帯 > 時間帯 > 曜日 > ベース料金
 * priority値が高いルールが優先される
 */

type PricingRule = {
  id: string
  ruleType: string // 'day_of_week' | 'time_slot' | 'day_and_time'
  dayOfWeek: number[] // [0=日, 1=月, ..., 6=土]
  timeFrom: string | null // "HH:mm"
  timeTo: string | null // "HH:mm"
  price: number
  label: string | null
  priority: number
}

type MenuOption = {
  id: string
  name: string
  price: number
  durationMinutes: number
}

type PriceCalculationInput = {
  basePrice: number
  pricingRules: PricingRule[]
  selectedOptions: MenuOption[]
  nominationFee: number
  bookingDate: Date // 予約日時
}

type PriceBreakdown = {
  menuPrice: number
  menuPriceLabel: string | null
  optionPrice: number
  optionDetails: { name: string; price: number }[]
  nominationFee: number
  totalPrice: number
}

/**
 * 予約日時に適用される料金ルールを決定する
 */
function findApplicableRule(
  rules: PricingRule[],
  date: Date
): PricingRule | null {
  const dayOfWeek = date.getDay() // 0=日, 1=月, ..., 6=土
  const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`

  // priorityが高い順にソート
  const sorted = [...rules].sort((a, b) => b.priority - a.priority)

  for (const rule of sorted) {
    const dayMatch =
      rule.dayOfWeek.length === 0 || rule.dayOfWeek.includes(dayOfWeek)

    const timeMatch =
      rule.timeFrom === null ||
      rule.timeTo === null ||
      (timeStr >= rule.timeFrom && timeStr < rule.timeTo)

    if (dayMatch && timeMatch) {
      return rule
    }
  }

  return null
}

/**
 * 料金を計算する
 */
export function calculatePrice(input: PriceCalculationInput): PriceBreakdown {
  const { basePrice, pricingRules, selectedOptions, nominationFee, bookingDate } = input

  // 1. メニュー料金を決定
  const applicableRule = findApplicableRule(pricingRules, bookingDate)
  const menuPrice = applicableRule ? applicableRule.price : basePrice
  const menuPriceLabel = applicableRule ? applicableRule.label : null

  // 2. オプション料金を合算
  const optionDetails = selectedOptions.map((opt) => ({
    name: opt.name,
    price: opt.price,
  }))
  const optionPrice = selectedOptions.reduce((sum, opt) => sum + opt.price, 0)

  // 3. 合計
  const totalPrice = menuPrice + optionPrice + nominationFee

  return {
    menuPrice,
    menuPriceLabel,
    optionPrice,
    optionDetails,
    nominationFee,
    totalPrice,
  }
}

/**
 * メニューの料金範囲を取得する（一覧表示用）
 */
export function getPriceRange(
  basePrice: number,
  pricingRules: PricingRule[]
): { min: number; max: number } {
  const allPrices = [basePrice, ...pricingRules.map((r) => r.price)]
  return {
    min: Math.min(...allPrices),
    max: Math.max(...allPrices),
  }
}

/**
 * 所要時間を計算する（メニュー + オプション + バッファ）
 */
export function calculateDuration(
  menuDurationMinutes: number,
  bufferMinutes: number,
  selectedOptions: Pick<MenuOption, 'durationMinutes'>[]
): number {
  const optionDuration = selectedOptions.reduce(
    (sum, opt) => sum + opt.durationMinutes,
    0
  )
  return menuDurationMinutes + optionDuration + bufferMinutes
}
