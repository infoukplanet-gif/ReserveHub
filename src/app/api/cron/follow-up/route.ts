export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { processFollowUpRules } from '@/lib/follow-up'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await processFollowUpRules()
  return NextResponse.json(result)
}
