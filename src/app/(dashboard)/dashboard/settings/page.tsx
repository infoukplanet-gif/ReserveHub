'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { toast } from 'sonner'

const DAYS = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日']

const DEFAULT_HOURS = [
  { day: 0, open: '10:00', close: '18:00', closed: false },
  { day: 1, open: '10:00', close: '20:00', closed: false },
  { day: 2, open: '10:00', close: '20:00', closed: false },
  { day: 3, open: '10:00', close: '20:00', closed: true },
  { day: 4, open: '10:00', close: '20:00', closed: false },
  { day: 5, open: '10:00', close: '20:00', closed: false },
  { day: 6, open: '10:00', close: '18:00', closed: false },
]

const SPECIAL_DATES = [
  { date: '2026-04-29', type: 'closed', label: 'GW休業' },
  { date: '2026-04-30', type: 'closed', label: 'GW休業' },
  { date: '2026-05-05', type: 'special', open: '10:00', close: '16:00', label: 'GW特別営業' },
]

export default function SettingsPage() {
  const [hours, setHours] = useState(DEFAULT_HOURS)
  const [shopName, setShopName] = useState('リラクゼーションサロン BLOOM')
  const [phone, setPhone] = useState('03-1234-5678')
  const [email, setEmail] = useState('info@bloom-salon.com')
  const [postal, setPostal] = useState('150-0001')
  const [address, setAddress] = useState('東京都渋谷区神宮前1-2-3 ABCビル 3F')
  const [bookingDeadline, setBookingDeadline] = useState(1)
  const [cancelDeadline, setCancelDeadline] = useState(24)
  const [maxFutureDays, setMaxFutureDays] = useState(60)

  const toggleClosed = (day: number) => {
    setHours(prev => prev.map(h => h.day === day ? { ...h, closed: !h.closed } : h))
  }

  return (
    <div className="space-y-6 pb-6">
      <h1 className="text-xl font-bold text-slate-900">設定</h1>

      <Tabs defaultValue="hours">
        <TabsList>
          <TabsTrigger value="hours">営業時間</TabsTrigger>
          <TabsTrigger value="general">基本情報</TabsTrigger>
          <TabsTrigger value="booking">予約設定</TabsTrigger>
        </TabsList>

        {/* 営業時間 */}
        <TabsContent value="hours" className="mt-4 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 space-y-4">
              <h2 className="text-sm font-semibold text-slate-900">通常の営業時間</h2>
              <div className="space-y-2">
                {hours.map((h) => (
                  <div key={h.day} className="flex items-center gap-3 py-2">
                    <span className="text-sm text-slate-700 w-16">{DAYS[h.day]}</span>
                    <Switch checked={!h.closed} onCheckedChange={() => toggleClosed(h.day)} />
                    {h.closed ? (
                      <span className="text-xs text-slate-400">定休日</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Input type="time" value={h.open} onChange={(e) => setHours(prev => prev.map(x => x.day === h.day ? { ...x, open: e.target.value } : x))} className="w-28 text-xs" />
                        <span className="text-slate-400">〜</span>
                        <Input type="time" value={h.close} onChange={(e) => setHours(prev => prev.map(x => x.day === h.day ? { ...x, close: e.target.value } : x))} className="w-28 text-xs" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">特別日設定</h2>
                <Button variant="outline" size="sm">+ 特別日を追加</Button>
              </div>
              <div className="space-y-2">
                {SPECIAL_DATES.map((sd, i) => (
                  <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-slate-500">{sd.date}</span>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${sd.type === 'closed' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                        {sd.type === 'closed' ? '休業' : '特別営業'}
                      </span>
                      <span className="text-xs text-slate-600">{sd.label}</span>
                    </div>
                    <button className="text-slate-400 hover:text-red-500">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button onClick={() => toast.success('保存しました')}>保存する</Button>
        </TabsContent>

        {/* 基本情報 */}
        <TabsContent value="general" className="mt-4 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 space-y-5">
              <h2 className="text-sm font-semibold text-slate-900">店舗情報</h2>
              <div className="space-y-2">
                <Label className="text-xs">店舗名</Label>
                <Input value={shopName} onChange={(e) => setShopName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">電話番号</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">メールアドレス</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <Separator />

              <h2 className="text-sm font-semibold text-slate-900">住所</h2>
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <div className="space-y-2">
                  <Label className="text-xs">郵便番号</Label>
                  <Input value={postal} onChange={(e) => setPostal(e.target.value)} />
                </div>
                <div className="flex items-end">
                  <Button variant="outline" size="sm">住所検索</Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">住所</Label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>

              <Separator />

              <h2 className="text-sm font-semibold text-slate-900">説明文</h2>
              <div className="space-y-2">
                <textarea
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none resize-none"
                  rows={3}
                  defaultValue="原宿駅徒歩3分の完全個室リラクゼーションサロン。国家資格保有のスタッフが丁寧に施術いたします。"
                />
              </div>
            </CardContent>
          </Card>
          <Button onClick={() => toast.success('保存しました')}>保存する</Button>
        </TabsContent>

        {/* 予約設定 */}
        <TabsContent value="booking" className="mt-4 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 space-y-5">
              <h2 className="text-sm font-semibold text-slate-900">予約受付</h2>
              <div className="space-y-2">
                <Label className="text-xs">予約受付締切</Label>
                <div className="flex items-center gap-2">
                  <Input type="number" value={bookingDeadline} onChange={(e) => setBookingDeadline(parseInt(e.target.value) || 0)} className="w-20" />
                  <span className="text-sm text-slate-500">時間前まで</span>
                </div>
                <p className="text-[10px] text-slate-400">予約開始時刻のX時間前まで受付</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">キャンセル締切</Label>
                <div className="flex items-center gap-2">
                  <Input type="number" value={cancelDeadline} onChange={(e) => setCancelDeadline(parseInt(e.target.value) || 0)} className="w-20" />
                  <span className="text-sm text-slate-500">時間前まで</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">予約可能期間</Label>
                <div className="flex items-center gap-2">
                  <Input type="number" value={maxFutureDays} onChange={(e) => setMaxFutureDays(parseInt(e.target.value) || 0)} className="w-20" />
                  <span className="text-sm text-slate-500">日先まで</span>
                </div>
              </div>

              <Separator />

              <h2 className="text-sm font-semibold text-slate-900">通知設定</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">リマインドメール（前日）</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">リマインドメール（当日）</span>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">新規予約通知（スタッフ宛）</span>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
          <Button onClick={() => toast.success('保存しました')}>保存する</Button>
        </TabsContent>
      </Tabs>
    </div>
  )
}
