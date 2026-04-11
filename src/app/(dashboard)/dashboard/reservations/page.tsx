'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import DatePicker from '@/components/shared/DatePicker'

type Reservation = {
  id: string
  startsAt: string
  endsAt: string
  customer: { id: string; name: string; phone: string | null; email: string | null }
  staff: { id: string; name: string } | null
  menu: { name: string; durationMinutes: number }
  options: { menuOption: { name: string }; price: number }[]
  menuPrice: number
  optionPrice: number
  nominationFee: number
  totalPrice: number
  status: string
  memo: string | null
}

const statusConfig: Record<string, { label: string; className: string }> = {
  confirmed: { label: '確定', className: 'bg-blue-50 text-blue-700' },
  completed: { label: '完了', className: 'bg-green-50 text-green-700' },
  cancelled: { label: 'キャンセル', className: 'bg-red-50 text-red-700' },
  no_show: { label: 'ノーショー', className: 'bg-slate-100 text-slate-500' },
}

function formatPrice(p: number) { return `¥${p.toLocaleString()}` }
function formatTime(iso: string) {
  const d = new Date(iso)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

type MenuListItem = { id: string; name: string; durationMinutes: number; basePrice: number }
type StaffListItem = { id: string; name: string }

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'day' | 'list'>('list')
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [showManualBooking, setShowManualBooking] = useState(false)
  const [menuList, setMenuList] = useState<MenuListItem[]>([])
  const [staffListData, setStaffListData] = useState<StaffListItem[]>([])
  const [mbMenuId, setMbMenuId] = useState('')
  const [mbStaffId, setMbStaffId] = useState('')
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date(); d.setHours(0,0,0,0); return d
  })

  useEffect(() => {
    Promise.all([
      fetch('/api/menus').then(r => r.json()),
      fetch('/api/staff').then(r => r.json()),
    ]).then(([menusRes, staffRes]) => {
      setMenuList(menusRes.data || [])
      setStaffListData(staffRes.data || [])
    })
  }, [])

  const dateStr = currentDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })

  useEffect(() => {
    const from = new Date(currentDate); from.setHours(0,0,0,0)
    const to = new Date(currentDate); to.setHours(23,59,59,999)
    fetch(`/api/reservations?from=${from.toISOString()}&to=${to.toISOString()}`)
      .then(r => r.json())
      .then(r => { setReservations(r.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [currentDate])

  const prevDay = () => { const d = new Date(currentDate); d.setDate(d.getDate() - 1); setCurrentDate(d); setLoading(true) }
  const nextDay = () => { const d = new Date(currentDate); d.setDate(d.getDate() + 1); setCurrentDate(d); setLoading(true) }

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/reservations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    if (selectedReservation?.id === id) setSelectedReservation(prev => prev ? { ...prev, status } : null)
    toast.success('ステータスを更新しました')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">来院予約</h1>
        <Button onClick={() => setShowManualBooking(true)}>+ 手動登録</Button>
      </div>

      {/* 統計カード */}
      {!loading && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-blue-50 p-3">
            <p className="text-[11px] text-blue-500 font-medium">本日の来院予約</p>
            <p className="text-xl font-bold text-blue-700">{reservations.length}<span className="text-sm font-normal ml-0.5">件</span></p>
          </div>
          <div className="rounded-xl bg-green-50 p-3">
            <p className="text-[11px] text-green-500 font-medium">確定</p>
            <p className="text-xl font-bold text-green-700">{reservations.filter(r => r.status === 'confirmed').length}<span className="text-sm font-normal ml-0.5">件</span></p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-[11px] text-slate-400 font-medium">売上見込み</p>
            <p className="text-xl font-bold text-slate-700">¥{reservations.reduce((s, r) => s + r.totalPrice, 0).toLocaleString()}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={prevDay}>
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </Button>
          <span className="text-sm font-semibold text-slate-900 min-w-[180px] text-center">{dateStr}</span>
          <Button variant="ghost" size="sm" onClick={nextDay}>
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </Button>
        </div>
        <div className="ml-auto">
          <Tabs value={view} onValueChange={(v) => setView(v as 'day' | 'list')}>
            <TabsList>
              <TabsTrigger value="list" className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">list</span>リスト
              </TabsTrigger>
              <TabsTrigger value="day" className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">schedule</span>タイムライン
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 bg-slate-100 rounded-lg animate-pulse" />)}</div>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {reservations.length === 0 ? (
                <div className="py-12 text-center"><span className="material-symbols-outlined text-4xl text-slate-300">event_busy</span><p className="text-sm text-slate-400 mt-2">この日の来院予約はありません</p></div>
              ) : reservations.map(r => (
                <button key={r.id} onClick={() => setSelectedReservation(r)} className="flex items-center gap-3 px-4 py-3 w-full text-left hover:bg-slate-50 transition-colors">
                  <span className="text-xs font-mono text-slate-400 w-10 shrink-0">{formatTime(r.startsAt)}</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-600 shrink-0">{r.customer.name[0]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{r.customer.name}</p>
                    <p className="text-[11px] text-slate-400">{r.menu.name} · {r.staff?.name || '指名なし'} · {r.menu.durationMinutes}分</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-slate-900">{formatPrice(r.totalPrice)}</p>
                    <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium ${statusConfig[r.status]?.className || ''}`}>{statusConfig[r.status]?.label || r.status}</span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detail Sheet */}
      <Sheet open={!!selectedReservation} onOpenChange={() => setSelectedReservation(null)}>
        <SheetContent className="w-full sm:w-[480px] overflow-y-auto">
          {selectedReservation && (
            <>
              <SheetHeader><SheetTitle>来院予約詳細</SheetTitle></SheetHeader>
              <div className="space-y-5 mt-6">
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-medium">ステータス</label>
                  <Select value={selectedReservation.status} onValueChange={(v) => { if (v) updateStatus(selectedReservation.id, v) }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confirmed">確定</SelectItem>
                      <SelectItem value="completed">完了</SelectItem>
                      <SelectItem value="cancelled">キャンセル</SelectItem>
                      <SelectItem value="no_show">ノーショー</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="space-y-1"><label className="text-xs text-slate-400">日時</label><p className="text-sm">{new Date(selectedReservation.startsAt).toLocaleString('ja-JP')}〜{formatTime(selectedReservation.endsAt)}</p></div>
                <div className="space-y-1"><label className="text-xs text-slate-400">患者</label><p className="text-sm font-medium">{selectedReservation.customer.name}</p>{selectedReservation.customer.phone && <p className="text-xs text-slate-500">{selectedReservation.customer.phone}</p>}</div>
                <div className="space-y-1"><label className="text-xs text-slate-400">施術メニュー</label><p className="text-sm">{selectedReservation.menu.name}</p></div>
                {selectedReservation.staff && <div className="space-y-1"><label className="text-xs text-slate-400">担当</label><p className="text-sm">{selectedReservation.staff.name}</p></div>}
                <Separator />
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">施術料</span><span>{formatPrice(selectedReservation.menuPrice)}</span></div>
                  {selectedReservation.optionPrice > 0 && <div className="flex justify-between"><span className="text-slate-500">オプション</span><span>{formatPrice(selectedReservation.optionPrice)}</span></div>}
                  {selectedReservation.nominationFee > 0 && <div className="flex justify-between"><span className="text-slate-500">指名料</span><span>{formatPrice(selectedReservation.nominationFee)}</span></div>}
                  <Separator />
                  <div className="flex justify-between font-semibold"><span>合計</span><span className="text-lg">{formatPrice(selectedReservation.totalPrice)}</span></div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Manual Booking Sheet */}
      <Sheet open={showManualBooking} onOpenChange={setShowManualBooking}>
        <SheetContent className="w-full sm:w-[480px] overflow-y-auto px-6">
          <SheetHeader><SheetTitle>手動登録</SheetTitle></SheetHeader>
          <div className="space-y-5 mt-6">
            <div className="space-y-2"><label className="text-xs text-slate-400">患者名 *</label><Input id="mb-name" placeholder="山田 太郎" /></div>
            <div className="space-y-2"><label className="text-xs text-slate-400">電話番号 *</label><Input id="mb-phone" placeholder="090-1234-5678" /></div>
            <div className="space-y-2"><label className="text-xs text-slate-400">メールアドレス *</label><Input id="mb-email" placeholder="yamada@example.com" /></div>
            <Separator />
            <div className="space-y-2"><label className="text-xs text-slate-400">施術メニュー *</label>
              <Select value={mbMenuId} onValueChange={(v) => { if (v) setMbMenuId(v) }}><SelectTrigger><SelectValue placeholder="施術メニューを選択" /></SelectTrigger><SelectContent>
                {menuList.map(m => <SelectItem key={m.id} value={m.id}>{m.name}（{m.durationMinutes}分・¥{m.basePrice.toLocaleString()}）</SelectItem>)}
              </SelectContent></Select>
            </div>
            <div className="space-y-2"><label className="text-xs text-slate-400">担当施術者</label>
              <Select value={mbStaffId} onValueChange={(v) => { if (v) setMbStaffId(v) }}><SelectTrigger><SelectValue placeholder="指名なし" /></SelectTrigger><SelectContent>
                <SelectItem value="none">指名なし</SelectItem>
                {staffListData.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent></Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><label className="text-xs text-slate-400">日付 *</label><DatePicker value={currentDate.toISOString().split('T')[0]} onChange={(d) => { (document.getElementById('mb-date-hidden') as HTMLInputElement).value = d }} /><input type="hidden" id="mb-date-hidden" defaultValue={currentDate.toISOString().split('T')[0]} /></div>
              <div className="space-y-2"><label className="text-xs text-slate-400">時間 *</label><Input id="mb-time" type="time" defaultValue="10:00" /></div>
            </div>
            <div className="space-y-2"><label className="text-xs text-slate-400">メモ</label><Input id="mb-memo" placeholder="電話予約" /></div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowManualBooking(false)}>キャンセル</Button>
              <Button className="flex-1" onClick={async () => {
                const name = (document.getElementById('mb-name') as HTMLInputElement).value
                const phone = (document.getElementById('mb-phone') as HTMLInputElement).value
                const email = (document.getElementById('mb-email') as HTMLInputElement).value
                const date = (document.getElementById('mb-date') as HTMLInputElement).value
                const time = (document.getElementById('mb-time') as HTMLInputElement).value
                const memo = (document.getElementById('mb-memo') as HTMLInputElement).value
                if (!name || !phone || !email || !date || !time || !mbMenuId) { toast.error('必須項目を入力してください'); return }
                const startsAt = new Date(`${date}T${time}:00`).toISOString()
                const res = await fetch('/api/reservations', {
                  method: 'POST', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ menuId: mbMenuId, staffId: mbStaffId && mbStaffId !== 'none' ? mbStaffId : undefined, startsAt, optionIds: [], customer: { name, phone, email }, memo, source: 'manual' }),
                })
                if (res.ok) { toast.success('来院予約を登録しました'); setShowManualBooking(false); setLoading(true); setCurrentDate(new Date(date)) }
                else { const d = await res.json(); toast.error(d.error || '作成に失敗しました') }
              }}>登録する</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
