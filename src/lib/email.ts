import { Resend } from 'resend'

let _resend: Resend | null = null
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}
const FROM = process.env.RESEND_FROM_EMAIL || 'ReserveHub <noreply@resend.dev>'

type ReservationEmail = {
  customerName: string
  customerEmail: string
  tenantName: string
  menuName: string
  staffName: string | null
  startsAt: Date
  totalPrice: number
  options: string[]
}

function formatDate(d: Date) {
  return d.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })
}

function formatTime(d: Date) {
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

function formatPrice(p: number) {
  return `¥${p.toLocaleString()}`
}

/** 来院予約確認メール */
export async function sendBookingConfirmation(data: ReservationEmail) {
  const { customerName, customerEmail, tenantName, menuName, staffName, startsAt, totalPrice, options } = data

  await getResend()?.emails.send({
    from: FROM,
    to: customerEmail,
    subject: `【${tenantName}】ご来院予約の確認`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; color: #0F172A;">
        <h1 style="font-size: 20px; font-weight: 700; margin: 0 0 8px;">ご来院予約が確定しました</h1>
        <p style="font-size: 14px; color: #64748B; margin: 0 0 24px;">${tenantName}をご利用いただきありがとうございます。</p>

        <div style="background: #F8FAFC; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 6px 0; color: #64748B; width: 80px;">日時</td><td style="padding: 6px 0; font-weight: 600;">${formatDate(startsAt)} ${formatTime(startsAt)}〜</td></tr>
            <tr><td style="padding: 6px 0; color: #64748B;">施術</td><td style="padding: 6px 0;">${menuName}</td></tr>
            ${options.length > 0 ? `<tr><td style="padding: 6px 0; color: #64748B;">オプション</td><td style="padding: 6px 0;">${options.join('、')}</td></tr>` : ''}
            ${staffName ? `<tr><td style="padding: 6px 0; color: #64748B;">担当施術者</td><td style="padding: 6px 0;">${staffName}</td></tr>` : ''}
            <tr><td style="padding: 10px 0 6px; color: #64748B; border-top: 1px solid #E2E8F0;">合計</td><td style="padding: 10px 0 6px; font-size: 18px; font-weight: 700; border-top: 1px solid #E2E8F0;">${formatPrice(totalPrice)}</td></tr>
          </table>
        </div>

        <p style="font-size: 13px; color: #64748B;">キャンセル・変更は前日18:00までにご連絡ください。</p>
        <p style="font-size: 12px; color: #94A3B8; margin-top: 24px;">このメールは${tenantName}の予約システム（ReserveHub）から自動送信されています。</p>
      </div>
    `,
  })
}

/** リマインドメール */
export async function sendReminder(data: ReservationEmail) {
  const { customerName, customerEmail, tenantName, menuName, staffName, startsAt } = data

  await getResend()?.emails.send({
    from: FROM,
    to: customerEmail,
    subject: `【${tenantName}】明日のご来院リマインド`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; color: #0F172A;">
        <h1 style="font-size: 20px; font-weight: 700; margin: 0 0 8px;">${customerName}様、明日のご来院リマインドです</h1>
        <p style="font-size: 14px; color: #64748B; margin: 0 0 24px;">${tenantName}へのご来院をお待ちしております。</p>

        <div style="background: #F8FAFC; border-radius: 12px; padding: 20px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 6px 0; color: #64748B; width: 80px;">日時</td><td style="padding: 6px 0; font-weight: 600;">${formatDate(startsAt)} ${formatTime(startsAt)}〜</td></tr>
            <tr><td style="padding: 6px 0; color: #64748B;">施術</td><td style="padding: 6px 0;">${menuName}</td></tr>
            ${staffName ? `<tr><td style="padding: 6px 0; color: #64748B;">担当施術者</td><td style="padding: 6px 0;">${staffName}</td></tr>` : ''}
          </table>
        </div>

        <p style="font-size: 13px; color: #64748B; margin-top: 16px;">変更・キャンセルの場合は本日18:00までにご連絡ください。</p>
      </div>
    `,
  })
}

/** キャンセル通知メール */
export async function sendCancellationNotice(data: Pick<ReservationEmail, 'customerEmail' | 'customerName' | 'tenantName' | 'menuName' | 'startsAt'>) {
  await getResend()?.emails.send({
    from: FROM,
    to: data.customerEmail,
    subject: `【${data.tenantName}】ご来院予約のキャンセル`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; color: #0F172A;">
        <h1 style="font-size: 20px; font-weight: 700; margin: 0 0 8px;">ご来院予約がキャンセルされました</h1>
        <div style="background: #FEF2F2; border-radius: 12px; padding: 20px; margin: 16px 0;">
          <p style="font-size: 14px; margin: 0;"><strong>${formatDate(data.startsAt)} ${formatTime(data.startsAt)}</strong> ${data.menuName}</p>
        </div>
        <p style="font-size: 14px; color: #64748B;">またのご来院をお待ちしております。</p>
      </div>
    `,
  })
}

/** 施術者への新規来院予約通知 */
export async function sendStaffNotification(staffEmail: string, data: ReservationEmail) {
  await getResend()?.emails.send({
    from: FROM,
    to: staffEmail,
    subject: `【新規来院】${data.customerName}様 ${formatDate(data.startsAt)} ${formatTime(data.startsAt)}`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; color: #0F172A;">
        <h1 style="font-size: 20px; font-weight: 700; margin: 0 0 16px;">新規来院予約が入りました</h1>
        <div style="background: #F0F9FF; border-radius: 12px; padding: 20px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 6px 0; color: #64748B; width: 80px;">患者名</td><td style="padding: 6px 0; font-weight: 600;">${data.customerName}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748B;">日時</td><td style="padding: 6px 0;">${formatDate(data.startsAt)} ${formatTime(data.startsAt)}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748B;">施術</td><td style="padding: 6px 0;">${data.menuName}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748B;">合計</td><td style="padding: 6px 0; font-weight: 600;">${formatPrice(data.totalPrice)}</td></tr>
          </table>
        </div>
      </div>
    `,
  })
}
