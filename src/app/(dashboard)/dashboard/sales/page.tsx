'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'

const MONTHLY_DATA = [
  { month: '2026/04', revenue: 320000, bookings: 42, newCustomers: 8 },
  { month: '2026/03', revenue: 1100000, bookings: 142, newCustomers: 18 },
  { month: '2026/02', revenue: 980000, bookings: 128, newCustomers: 15 },
  { month: '2026/01', revenue: 850000, bookings: 110, newCustomers: 12 },
]

const MENU_RANKING = [
  { name: 'ボディケア60分', count: 68, revenue: 544000 },
  { name: 'ボディケア90分', count: 32, revenue: 352000 },
  { name: 'フェイシャル45分', count: 25, revenue: 150000 },
  { name: 'プレミアム120分', count: 17, revenue: 255000 },
]

const STAFF_RANKING = [
  { name: '山田 花子', bookings: 52, revenue: 468000, rate: '78%' },
  { name: '佐藤 健太', bookings: 48, revenue: 384000, rate: '72%' },
  { name: '鈴木 美咲', bookings: 42, revenue: 294000, rate: '68%' },
]

function formatPrice(price: number) {
  return `¥${price.toLocaleString()}`
}

export default function SalesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">売上レポート</h1>
        <p className="text-xs text-slate-400 mt-0.5">売上推移とランキング</p>
      </div>

      <Tabs defaultValue="month">
        <TabsList>
          <TabsTrigger value="month">月別</TabsTrigger>
          <TabsTrigger value="menu">メニュー別</TabsTrigger>
          <TabsTrigger value="staff">スタッフ別</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Monthly Summary */}
      <div className="space-y-3">
        {MONTHLY_DATA.map((d) => (
          <Card key={d.month} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">{d.month}</span>
                <span className="text-lg font-bold text-slate-900">{formatPrice(d.revenue)}</span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                <span>予約 {d.bookings}件</span>
                <span>新規 {d.newCustomers}名</span>
                <span>客単価 {formatPrice(Math.round(d.revenue / d.bookings))}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      {/* Menu Ranking */}
      <div>
        <h2 className="text-sm font-semibold text-slate-900 mb-3">メニュー別ランキング（今月）</h2>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {MENU_RANKING.map((m, i) => (
                <div key={m.name} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-sm font-bold text-slate-300 w-6">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{m.name}</p>
                    <p className="text-[11px] text-slate-400">{m.count}件</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{formatPrice(m.revenue)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff Ranking */}
      <div>
        <h2 className="text-sm font-semibold text-slate-900 mb-3">スタッフ別（今月）</h2>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {STAFF_RANKING.map((s) => (
                <div key={s.name} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-600 shrink-0">
                    {s.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{s.name}</p>
                    <p className="text-[11px] text-slate-400">{s.bookings}件 · 稼働率 {s.rate}</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{formatPrice(s.revenue)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
