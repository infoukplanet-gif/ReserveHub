import crypto from 'crypto'

export function verifyLineSignature(body: string, signature: string, channelSecret: string): boolean {
  const hash = crypto.createHmac('sha256', channelSecret).update(body).digest('base64')
  return hash === signature
}

export async function sendLineMessage(accessToken: string, to: string, messages: LineMessage[]): Promise<void> {
  const res = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ to, messages }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`LINE API error: ${res.status} ${err}`)
  }
}

export async function replyLineMessage(accessToken: string, replyToken: string, messages: LineMessage[]): Promise<void> {
  const res = await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ replyToken, messages }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`LINE API reply error: ${res.status} ${err}`)
  }
}

export async function getLineProfile(accessToken: string, userId: string): Promise<{ displayName: string; pictureUrl?: string }> {
  const res = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error(`LINE API profile error: ${res.status}`)
  return res.json()
}

type LineMessage = {
  type: 'text'
  text: string
} | {
  type: 'image'
  originalContentUrl: string
  previewImageUrl: string
}
