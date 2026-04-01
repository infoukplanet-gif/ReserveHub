'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// 仮データ（API接続後に置き換え）
const STAFF = [
  { id: 'all', name: '全員' },
  { id: 'staff-1', name: '山田 花子' },
  { id: 'staff-2', name: '佐藤 健太' },
  { id: 'staff-3', name: '鈴木 美咲' },
]

const HOURS = Array.from({ length: 22 }, (_, i) => {
  const h = Math.floor(i / 2) + 9
  const m = i % 2 === 0 ? '00' : '30'
  return `${h}:${m}`
})

type Reservation = {
  id: string
  time: string
  endTime: string
  customerName: string
  menu: string
  duration: string
  staffId: string
  staffName: string
  price: number
  status: 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  phone: string
  email: string
  options: string[]
  nominationFee: number
  memo: string
}

const MOCK_RESERVATIONS: Reservation[] = [
  { id: '1', time: '10:00', endTime: '11:15', customerName: '山田 太郎', menu: 'ボディケア60分', duration: '75分', staffId: 'staff-1', staffName: '山田 花子', price: 12000, status: 'confirmed', phone: '090-1234-5678', email: 'yamada@example.com', options: ['ヘッドスパ追加'], nominationFee: 500, memo: '' },
  { id: '2', time: '11:30', endTime: '13:00', customerName: '佐藤 花子', menu: 'ボディケア90分', duration: '105分', staffId: 'staff-2', staffName: '佐藤 健太', price: 11000, status: 'confirmed', phone: '080-2345-6789', email: 'sato@example.com', options: [], nominationFee: 0, memo: '' },
  { id: '3', time: '11:00', endTime: '11:45', customerName: '高橋 遼', menu: 'フェイシャル45分', duration: '55分', staffId: 'staff-3', staffName: '鈴木 美咲', price: 6000, status: 'confirmed', phone: '070-3456-7890', email: 'takahashi@example.com', options: [], nominationFee: 500, memo: '' },
  { id: '4', time: '13:00', endTime: '14:15', customerName: '田中 一郎', menu: 'ボディケア60分', duration: '75分', staffId: 'staff-1', staffName: '山田 花子', price: 8000, status: 'confirmed', phone: '090-4567-8901', email: 'tanaka@example.com', options: [], nominationFee: 0, memo: '肩こりが慢性的' },
  { id: '5', time: '16:00', endTime: '17:15', customerName: '鈴木 美咲', menu: 'ボディケア60分', duration: '75分', staffId: 'staff-2', staffName: '佐藤 健太', price: 9500, status: 'completed', phone: '090-5678-9012', email: 'suzuki@example.com', options: ['アロマ変更'], nominationFee: 0, memo: '' },
]

const statusConfig: Record<string, { label: string; className: string }> = {
  confirmed: { label: '確定', className: 'bg-blue-50 text-blue-700' },
  completed: { label: '完了', className: 'bg-green-50 text-green-700' },
  cancelled: { label: 'キャンセル', className: 'bg-red-50 text-red-700' },
  no_show: { label: 'ノーショー', className: 'bg-slate-100 text-slate-500' },
}

function formatPrice(price: number) {
  return `¥${price.toLocaleString()}`
}

export default function ReservationsPage() {
  const [view, setView] = useState<'day' | 'list'>('day')
  const [selectedStaff, setSelectedStaff] = useState('all')
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [currentDate] = useState(new Date('2026-04-05'))

  const dateStr = currentDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })

  const filtered = selectedStaff === 'all'
    ? MOCK_RESERVATIONS
    : MOCK_RESERVATIONS.filter((r) => r.staffId === selectedStaff)

  const activeStaff = STAFF.filter((s) => s.id !== 'all')

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">予約管理</h1>
        </div>
        <Button>+ 手動予約</Button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">◀</Button>
          <span className="text-sm font-semibold text-slate-900 min-w-[180px] text-center">{dateStr}</span>
          <Button variant="ghost" size="sm">▶</Button>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Tabs value={view} onValueChange={(v) => setView(v as 'day' | 'list')}>
            <TabsList>
              <TabsTrigger value="day">日</TabsTrigger>
              <TabsTrigger value="list">リスト</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Staff Filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {STAFF.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedStaff(s.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedStaff === s.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Day View */}
      {view === 'day' && (
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {/* Staff Column Headers (desktop) */}
            <div className="hidden lg:grid lg:grid-cols-[60px_1fr_1fr_1fr] border-b bg-slate-50">
              <div className="p-2" />
              {activeStaff.map((s) => (
                <div key={s.id} className="p-2 text-center text-xs font-semibold text-slate-500 border-l">
                  {s.name}
                </div>
              ))}
            </div>

            {/* Time Grid */}
            <div className="divide-y divide-slate-50">
              {HOURS.map((hour) => {
                const hourReservations = filtered.filter((r) => r.time === hour)
                const isEmpty = hourReservations.length === 0

                return (
                  <div
                    key={hour}
                    className={`flex items-stretch min-h-[44px] ${isEmpty ? '' : ''}`}
                  >
                    <div className="w-[60px] shrink-0 flex items-start justify-end pr-3 pt-2">
                      <span className="text-[11px] font-mono text-slate-300">{hour}</span>
                    </div>
                    <div className="flex-1 flex gap-1 py-1 pr-2">
                      {hourReservations.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => setSelectedReservation(r)}
                          className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors text-left"
                        >
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shrink-0">
                            {r.customerName[0]}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-900 truncate">{r.customerName}</p>
                            <p className="text-[10px] text-slate-500 truncate">{r.menu} · {r.duration}</p>
                          </div>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusConfig[r.status].className}`}>
                            {statusConfig[r.status].label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* List View */}
      {view === 'list' && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center py-12">
                  <span className="material-symbols-outlined text-4xl text-slate-300">event_busy</span>
                  <p className="text-sm text-slate-400 mt-2">予約がありません</p>
                </div>
              ) : (
                filtered.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedReservation(r)}
                    className="flex items-center gap-3 px-4 py-3 w-full text-left hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-xs font-mono text-slate-400 w-10 shrink-0">{r.time}</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-600 shrink-0">
                      {r.customerName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{r.customerName}</p>
                      <p className="text-[11px] text-slate-400">{r.menu} · {r.staffName} · {r.duration}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-slate-900">{formatPrice(r.price)}</p>
                      <Badge variant="secondary" className={`text-[10px] ${statusConfig[r.status].className}`}>
                        {statusConfig[r.status].label}
                      </Badge>
                    </div>
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reservation Detail Sheet */}
      <Sheet open={!!selectedReservation} onOpenChange={() => setSelectedReservation(null)}>
        <SheetContent className="w-full sm:w-[480px] overflow-y-auto">
          {selectedReservation && (
            <>
              <SheetHeader>
                <SheetTitle>予約詳細</SheetTitle>
              </SheetHeader>
              <div className="space-y-5 mt-6">
                {/* Status */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-medium">ステータス</label>
                  <Select defaultValue={selectedReservation.status}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confirmed">確定</SelectItem>
                      <SelectItem value="completed">完了</SelectItem>
                      <SelectItem value="cancelled">キャンセル</SelectItem>
                      <SelectItem value="no_show">ノーショー</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* DateTime */}
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">日時</label>
                  <p className="text-sm text-slate-900">{dateStr} {selectedReservation.time}〜{selectedReservation.endTime}</p>
                </div>

                {/* Customer */}
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">顧客</label>
                  <p className="text-sm font-medium text-slate-900">{selectedReservation.customerName}</p>
                  <p className="text-xs text-slate-500">{selectedReservation.phone}</p>
                  <p className="text-xs text-slate-500">{selectedReservation.email}</p>
                </div>

                {/* Menu */}
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">メニュー</label>
                  <p className="text-sm text-slate-900">{selectedReservation.menu}</p>
                </div>

                {/* Options */}
                {selectedReservation.options.length > 0 && (
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-medium">オプション</label>
                    {selectedReservation.options.map((o, i) => (
                      <p key={i} className="text-sm text-slate-900">{o}</p>
                    ))}
                  </div>
                )}

                {/* Staff */}
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">担当スタッフ</label>
                  <p className="text-sm text-slate-900">{selectedReservation.staffName}</p>
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-medium">料金</label>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">メニュー</span>
                      <span className="text-slate-900">{formatPrice(selectedReservation.price - selectedReservation.nominationFee)}</span>
                    </div>
                    {selectedReservation.nominationFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">指名料</span>
                        <span className="text-slate-900">{formatPrice(selectedReservation.nominationFee)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>合計</span>
                      <span className="text-lg">{formatPrice(selectedReservation.price)}</span>
                    </div>
                  </div>
                </div>

                {/* Memo */}
                {selectedReservation.memo && (
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-medium">メモ</label>
                    <p className="text-sm text-slate-600">{selectedReservation.memo}</p>
                  </div>
                )}

                <Separator />

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">カルテを記録</Button>
                  <Button variant="outline" className="flex-1">予約変更</Button>
                </div>
                <Button variant="ghost" className="w-full text-red-500 hover:text-red-700 hover:bg-red-50">
                  キャンセルする
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
