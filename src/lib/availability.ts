/**
 * 空き枠計算ロジック
 * 営業時間 × スタッフ × 既存予約 × バッファ から空き時間を算出
 */

type BusinessHour = {
  dayOfWeek: number
  openTime: string // "HH:mm"
  closeTime: string // "HH:mm"
  isClosed: boolean
}

type SpecialDate = {
  date: string // "YYYY-MM-DD"
  isClosed: boolean
  openTime: string | null
  closeTime: string | null
}

type ExistingReservation = {
  staffId: string | null
  startsAt: Date
  endsAt: Date
}

type StaffInfo = {
  id: string
  name: string
  nominationFee: number
}

type AvailabilityInput = {
  date: Date // 対象日
  durationMinutes: number // メニュー + オプション + バッファの合計所要時間
  slotIntervalMinutes?: number // 枠の間隔（デフォルト30分）
  businessHours: BusinessHour[]
  specialDates: SpecialDate[]
  existingReservations: ExistingReservation[]
  staff: StaffInfo[]
  targetStaffId?: string | null // 指名スタッフ（null=全員）
  bookingDeadlineHours: number // 予約締切（何時間前まで）
}

type TimeSlot = {
  startsAt: Date
  endsAt: Date
  availableStaff: StaffInfo[]
}

/**
 * 時刻文字列をその日のDateオブジェクトに変換
 */
function timeToDate(date: Date, time: string): Date {
  const [hours, minutes] = time.split(':').map(Number)
  const d = new Date(date)
  d.setHours(hours, minutes, 0, 0)
  return d
}

/**
 * 日付を "YYYY-MM-DD" 形式に
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * 2つの時間範囲が重複するか
 */
function isOverlapping(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return start1 < end2 && start2 < end1
}

/**
 * 指定日の営業時間を取得（特別日を優先）
 */
function getOperatingHours(
  date: Date,
  businessHours: BusinessHour[],
  specialDates: SpecialDate[]
): { openTime: string; closeTime: string } | null {
  const dateStr = formatDate(date)

  // 特別日チェック
  const special = specialDates.find((s) => s.date === dateStr)
  if (special) {
    if (special.isClosed) return null
    if (special.openTime && special.closeTime) {
      return { openTime: special.openTime, closeTime: special.closeTime }
    }
  }

  // 通常営業時間
  const dayOfWeek = date.getDay()
  const bh = businessHours.find((h) => h.dayOfWeek === dayOfWeek)
  if (!bh || bh.isClosed) return null

  return { openTime: bh.openTime, closeTime: bh.closeTime }
}

/**
 * 空き枠を計算する
 */
export function calculateAvailability(input: AvailabilityInput): TimeSlot[] {
  const {
    date,
    durationMinutes,
    slotIntervalMinutes = 30,
    businessHours,
    specialDates,
    existingReservations,
    staff,
    targetStaffId,
    bookingDeadlineHours,
  } = input

  // 1. 営業時間を取得
  const hours = getOperatingHours(date, businessHours, specialDates)
  if (!hours) return [] // 休業日

  const openTime = timeToDate(date, hours.openTime)
  const closeTime = timeToDate(date, hours.closeTime)

  // 2. 予約締切チェック
  const now = new Date()
  const deadlineThreshold = new Date(
    now.getTime() + bookingDeadlineHours * 60 * 60 * 1000
  )

  // 3. 対象スタッフを絞る
  const targetStaff = targetStaffId
    ? staff.filter((s) => s.id === targetStaffId)
    : staff

  if (targetStaff.length === 0) return []

  // 4. 時間枠を生成
  const slots: TimeSlot[] = []
  let slotStart = new Date(openTime)

  while (slotStart.getTime() + durationMinutes * 60000 <= closeTime.getTime()) {
    const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000)

    // 予約締切チェック
    if (slotStart > deadlineThreshold) {
      // このスタートが締切より後なら予約可能
      const availableStaff = targetStaff.filter((s) => {
        // このスタッフの既存予約と重複しないか
        const hasConflict = existingReservations.some(
          (r) =>
            (r.staffId === s.id || r.staffId === null) &&
            isOverlapping(slotStart, slotEnd, r.startsAt, r.endsAt)
        )
        return !hasConflict
      })

      if (availableStaff.length > 0) {
        slots.push({
          startsAt: new Date(slotStart),
          endsAt: new Date(slotEnd),
          availableStaff,
        })
      }
    }

    // 次の枠へ
    slotStart = new Date(slotStart.getTime() + slotIntervalMinutes * 60000)
  }

  return slots
}
