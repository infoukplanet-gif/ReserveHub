'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

type DashboardData = {
  todayBookings: number
  monthlyRevenue: number
  monthlyBookings: number
  newCustomers: number
  repeatRate: number
  upcomingReservations: {
    id: string
    startsAt: string
    customer: { name: string }
    staff: { name: string } | null
    menu: { name: string; durationMinutes: number }
    status: string
  }[]
  expiringTickets: {
    id: string
    customer: { name: string }
    ticketTemplate: { name: string }
    remainingCount: number
    expiresAt: string
  }[]
}

const quickActions = [
  { label: '施術者', icon: 'group', href: '/dashboard/staff' },
  { label: '売上', icon: 'bar_chart', href: '/dashboard/sales' },
  { label: 'お知らせ', icon: 'campaign', href: '/dashboard/blog' },
  { label: '設定', icon: 'settings', href: '/dashboard/settings' },
]

function formatPrice(price: number) {
  if (price >= 1000000) return `¥${(price / 1000000).toFixed(1)}M`
  if (price >= 1000) return `¥${(price / 1000).toFixed(0)}K`
  return `¥${price.toLocaleString()}`
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(r => { setData(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const stats = data ? [
    { label: '本日の来院', value: `${data.todayBookings}`, icon: 'calendar_today' },
    { label: '今月の売上', value: formatPrice(data.monthlyRevenue), icon: 'payments' },
    { label: '新規患者', value: `${data.newCustomers}`, icon: 'person_add' },
    { label: 'リピート率', value: `${data.repeatRate}%`, icon: 'replay' },
  ] : []

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">ダッシュボード</h1>
          <p className="text-xs text-slate-400 mt-0.5">ReserveHub · 院のパフォーマンスを管理</p>
        </div>
        <div className="hidden sm:flex items-center gap-1">
          {quickActions.map((action) => (
            <Link key={action.label} href={action.href}>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[18px] text-slate-400">{action.icon}</span>
                <span className="text-xs text-slate-500 font-medium">{action.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto sm:hidden -mx-4 px-4 pb-1">
        {quickActions.map((action) => (
          <Link key={action.label} href={action.href}>
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 whitespace-nowrap">
              <span className="material-symbols-outlined text-[16px] text-slate-400">{action.icon}</span>
              <span className="text-xs text-slate-600 font-medium">{action.label}</span>
            </div>
          </Link>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="border-0 shadow-sm"><CardContent className="p-4">
              <div className="h-4 w-20 bg-slate-100 rounded animate-pulse mb-2" />
              <div className="h-7 w-16 bg-slate-100 rounded animate-pulse" />
            </CardContent></Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat) => (
              <Card key={stat.label} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="material-symbols-outlined text-[18px] text-slate-400">{stat.icon}</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 uppercase tracking-wider">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-900">本日の来院予約</h2>
              <Link href="/dashboard/reservations" className="text-xs text-blue-600 font-medium hover:underline">カレンダーを見る</Link>
            </div>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {data?.upcomingReservations.length === 0 && (
                    <div className="px-4 py-8 text-center text-sm text-slate-400">本日の来院予約はありません</div>
                  )}
                  {data?.upcomingReservations.map((r) => (
                    <div key={r.id} className="flex items-center gap-3 px-4 py-3">
                      <span className="text-xs font-mono text-slate-400 w-10 shrink-0">{formatTime(r.startsAt)}</span>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-600 shrink-0">
                        {r.customer.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 leading-tight">{r.customer.name}</p>
                        <p className="text-[11px] text-slate-400">{r.menu.name} · {r.menu.durationMinutes}分</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {data && data.expiringTickets.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-900 mb-3">期限切れ間近の回数券</h2>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100">
                    {data.expiringTickets.map((t) => (
                      <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">{t.customer.name}</p>
                          <p className="text-[11px] text-slate-400">{t.ticketTemplate.name} · 残{t.remainingCount}回</p>
                        </div>
                        <span className="text-xs text-amber-600 font-medium">{new Date(t.expiresAt).toLocaleDateString('ja-JP')}まで</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex items-center justify-around py-2 lg:hidden">
        {[
          { icon: 'dashboard', label: 'ホーム', href: '/dashboard', active: true },
          { icon: 'calendar_month', label: '来院予約', href: '/dashboard/reservations', active: false },
          { icon: 'spa', label: '施術', href: '/dashboard/menus', active: false },
          { icon: 'person', label: '患者', href: '/dashboard/customers', active: false },
        ].map((item) => (
          <Link key={item.label} href={item.href}>
            <div className="flex flex-col items-center gap-0.5">
              <span className={`material-symbols-outlined text-[22px] ${item.active ? 'text-blue-600' : 'text-slate-400'}`}>{item.icon}</span>
              <span className={`text-[10px] font-medium ${item.active ? 'text-blue-600' : 'text-slate-400'}`}>{item.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
