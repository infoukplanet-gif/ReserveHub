export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedTenantId } from '@/lib/auth'
import { handleApiError, ApiError } from '@/lib/api-error'
import { Resend } from 'resend'

let _resend: Resend | null = null
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}

const TYPE_LABELS: Record<string, string> = {
  line_setup: 'LINE設定代行',
  richmenu_design: 'Rich Menu制作依頼',
}

export async function GET() {
  try {
    const tenantId = await getAuthenticatedTenantId()
    const requests = await prisma.serviceRequest.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ data: requests })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenantId = await getAuthenticatedTenantId()
    const body = await req.json()

    const { type, formData } = body
    if (!type || !['line_setup', 'richmenu_design'].includes(type)) {
      throw new ApiError(400, 'INVALID_INPUT', '無効なサービスタイプです')
    }
    if (!formData || typeof formData !== 'object') {
      throw new ApiError(400, 'INVALID_INPUT', 'フォームデータが必要です')
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true, email: true },
    })

    const serviceRequest = await prisma.serviceRequest.create({
      data: { tenantId, type, formData },
    })

    // 管理者に通知メール送信
    const resend = getResend()
    if (resend && tenant) {
      const formEntries = Object.entries(formData as Record<string, unknown>)
        .map(([k, v]) => `<tr><td style="padding:6px 12px;color:#64748B;font-size:13px;">${k}</td><td style="padding:6px 12px;font-size:13px;">${String(v)}</td></tr>`)
        .join('')

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'ReserveHub <noreply@resend.dev>',
        to: 'matchingplanet@gmail.com',
        subject: `【ReserveHub】新しいサービス依頼: ${TYPE_LABELS[type] || type}`,
        html: `
          <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;color:#0F172A;">
            <h1 style="font-size:20px;font-weight:700;margin:0 0 16px;">新しいサービス依頼</h1>
            <div style="background:#F8FAFC;border-radius:12px;padding:20px;margin-bottom:16px;">
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:6px 12px;color:#64748B;font-size:13px;">種別</td><td style="padding:6px 12px;font-size:13px;font-weight:600;">${TYPE_LABELS[type]}</td></tr>
                <tr><td style="padding:6px 12px;color:#64748B;font-size:13px;">院名</td><td style="padding:6px 12px;font-size:13px;">${tenant.name}</td></tr>
                <tr><td style="padding:6px 12px;color:#64748B;font-size:13px;">メール</td><td style="padding:6px 12px;font-size:13px;">${tenant.email}</td></tr>
              </table>
            </div>
            <h2 style="font-size:16px;font-weight:600;margin:0 0 8px;">ヒアリング内容</h2>
            <div style="background:#F8FAFC;border-radius:12px;padding:20px;">
              <table style="width:100%;border-collapse:collapse;">${formEntries}</table>
            </div>
          </div>
        `,
      }).catch(console.error)
    }

    return NextResponse.json({ data: serviceRequest }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
