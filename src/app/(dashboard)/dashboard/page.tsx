'use client'

import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

const stats = [
  { label: '本日の予約', value: '8', icon: 'calendar_today', change: '+2' },
  { label: '今月の売上', value: '¥1.1M', icon: 'payments', change: '+12%' },
  { label: '新規顧客', value: '18', icon: 'person_add', change: '+5' },
  { label: 'リピート率', value: '72%', icon: 'replay', change: '+3%' },
]

const appointments = [
  { time: '10:00', name: '山田 太郎', menu: 'カット&カラー', duration: '60分', status: 'confirmed' },
  { time: '11:30', name: '佐藤 花子', menu: 'パーマ&スパ', duration: '120分', status: 'confirmed' },
  { time: '12:30', name: null, menu: null, duration: null, status: 'available' },
  { time: '13:00', name: '田中 一郎', menu: 'レギュラーカット', duration: '45分', status: 'confirmed' },
  { time: '14:30', name: '鈴木 美咲', menu: '60分コース', duration: '60分', status: 'confirmed' },
  { time: '16:00', name: null, menu: null, duration: null, status: 'available' },
]

const quickActions = [
  { label: 'スタッフ', icon: 'group', href: '/dashboard/staff' },
  { label: '売上', icon: 'bar_chart', href: '/dashboard' },
  { label: 'お知らせ', icon: 'campaign', href: '/dashboard/blog' },
  { label: '設定', icon: 'settings', href: '/dashboard/settings' },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Header + Quick Actions Row */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">ダッシュボード</h1>
          <p className="text-xs text-slate-400 mt-0.5">ReserveHub · サロンのパフォーマンスを管理</p>
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

      {/* Mobile Quick Actions — horizontal scroll */}
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

      {/* Stats Grid — 2x2 compact */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="material-symbols-outlined text-[18px] text-slate-400">{stat.icon}</span>
                <span className="text-xs text-green-600 font-medium">{stat.change}</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 uppercase tracking-wider">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Today's Appointments */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-900">本日の予約</h2>
          <Link href="/dashboard/reservations" className="text-xs text-blue-600 font-medium hover:underline">
            カレンダーを見る
          </Link>
        </div>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {appointments.map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-xs font-mono text-slate-400 w-10 shrink-0">{item.time}</span>
                  {item.name ? (
                    <>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-600 shrink-0">
                        {item.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 leading-tight">{item.name}</p>
                        <p className="text-[11px] text-slate-400">{item.menu} · {item.duration}</p>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 flex-1">
                      <div className="h-8 w-8 rounded-full border-2 border-dashed border-slate-200 shrink-0" />
                      <span className="text-xs text-slate-300 font-medium">空き枠</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Nav — Mobile Only */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex items-center justify-around py-2 lg:hidden">
        {[
          { icon: 'dashboard', label: 'ホーム', href: '/dashboard', active: true },
          { icon: 'calendar_month', label: '予約', href: '/dashboard/reservations', active: false },
          { icon: 'restaurant_menu', label: 'メニュー', href: '/dashboard/menus', active: false },
          { icon: 'person', label: '顧客', href: '/dashboard/customers', active: false },
        ].map((item) => (
          <Link key={item.label} href={item.href}>
            <div className="flex flex-col items-center gap-0.5">
              <span className={`material-symbols-outlined text-[22px] ${item.active ? 'text-blue-600' : 'text-slate-400'}`}>
                {item.icon}
              </span>
              <span className={`text-[10px] font-medium ${item.active ? 'text-blue-600' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
