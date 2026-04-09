'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

type SalesData = {
  monthly: { month: string; revenue: number; bookings: number; newCustomers: number }[]
  menuRanking: { name: string; count: number; revenue: number }[]
  staffRanking: { name: string; bookings: number; revenue: number }[]
}

function formatPrice(p: number) { return `¥${p.toLocaleString()}` }

export default function SalesPage() {
  const [data, setData] = useState<SalesData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/sales').then(r => r.json()).then(r => { setData(r.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="space-y-4"><div className="h-8 w-48 bg-slate-100 rounded animate-pulse" />{[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />)}</div>

  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-bold text-slate-900">売上レポート</h1><p className="text-xs text-slate-400 mt-0.5">売上推移とランキング</p></div>

      {/* Monthly */}
      <div className="space-y-3">
        {data?.monthly.map(d => (
          <Card key={d.month} className="border-0 shadow-sm"><CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">{d.month}</span>
              <span className="text-lg font-bold text-slate-900">{formatPrice(d.revenue)}</span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
              <span>来院 {d.bookings}件</span>
              <span>新規 {d.newCustomers}名</span>
              {d.bookings > 0 && <span>客単価 {formatPrice(Math.round(d.revenue / d.bookings))}</span>}
            </div>
          </CardContent></Card>
        ))}
      </div>

      <Separator />

      {/* Menu Ranking */}
      {data && data.menuRanking.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-900 mb-3">施術メニュー別ランキング（今月）</h2>
          <Card className="border-0 shadow-sm"><CardContent className="p-0"><div className="divide-y divide-slate-100">
            {data.menuRanking.map((m, i) => (
              <div key={m.name} className="flex items-center gap-3 px-4 py-3">
                <span className="text-sm font-bold text-slate-300 w-6">{i + 1}</span>
                <div className="flex-1 min-w-0"><p className="text-sm font-medium text-slate-900">{m.name}</p><p className="text-[11px] text-slate-400">{m.count}件</p></div>
                <span className="text-sm font-semibold text-slate-900">{formatPrice(m.revenue)}</span>
              </div>
            ))}
          </div></CardContent></Card>
        </div>
      )}

      {/* Staff Ranking */}
      {data && data.staffRanking.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-900 mb-3">施術者別（今月）</h2>
          <Card className="border-0 shadow-sm"><CardContent className="p-0"><div className="divide-y divide-slate-100">
            {data.staffRanking.map(s => (
              <div key={s.name} className="flex items-center gap-3 px-4 py-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-600 shrink-0">{s.name[0]}</div>
                <div className="flex-1 min-w-0"><p className="text-sm font-medium text-slate-900">{s.name}</p><p className="text-[11px] text-slate-400">{s.bookings}件</p></div>
                <span className="text-sm font-semibold text-slate-900">{formatPrice(s.revenue)}</span>
              </div>
            ))}
          </div></CardContent></Card>
        </div>
      )}

      {(!data || (data.monthly.every(m => m.revenue === 0) && data.menuRanking.length === 0)) && (
        <Card className="border-0 shadow-sm"><CardContent className="py-12 text-center">
          <span className="material-symbols-outlined text-4xl text-slate-300">bar_chart</span>
          <p className="text-sm text-slate-400 mt-2">売上データがまだありません</p>
        </CardContent></Card>
      )}
    </div>
  )
}
