'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import type { ThemeId } from '@/lib/themes'
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

type SpecialDateItem = { id?: string; date: string; isClosed: boolean; openTime: string; closeTime: string; label: string }

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="h-64 bg-slate-100 rounded-xl animate-pulse" />}>
      <SettingsContent />
    </Suspense>
  )
}

function SettingsContent() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'hours')

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab) setActiveTab(tab)
  }, [searchParams])

  const [hours, setHours] = useState(DEFAULT_HOURS)
  const [specialDates, setSpecialDates] = useState<SpecialDateItem[]>([])
  const [showAddSpecial, setShowAddSpecial] = useState(false)
  const [newSpecial, setNewSpecial] = useState<SpecialDateItem>({ date: '', isClosed: true, openTime: '10:00', closeTime: '18:00', label: '' })
  const [shopName, setShopName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [postal, setPostal] = useState('')
  const [address, setAddress] = useState('')
  const [bookingDeadline, setBookingDeadline] = useState(1)
  const [cancelDeadline, setCancelDeadline] = useState(24)
  const [maxFutureDays, setMaxFutureDays] = useState(60)

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(r => {
      const d = r.data
      if (d?.tenant) {
        setShopName(d.tenant.name || '')
        setPhone(d.tenant.phone || '')
        setEmail(d.tenant.email || '')
        setPostal(d.tenant.postalCode || '')
        setAddress(d.tenant.address || '')
        setBookingDeadline(d.tenant.bookingDeadlineHours || 1)
        setCancelDeadline(d.tenant.cancelDeadlineHours || 24)
        setMaxFutureDays(d.tenant.maxFutureDays || 60)
      }
      if (d?.businessHours?.length > 0) {
        setHours(d.businessHours.map((bh: { dayOfWeek: number; openTime: string; closeTime: string; isClosed: boolean }) => ({
          day: bh.dayOfWeek, open: bh.openTime, close: bh.closeTime, closed: bh.isClosed,
        })))
      }
      if (d?.specialDates) {
        setSpecialDates(d.specialDates.map((sd: { id: string; date: string; isClosed: boolean; openTime: string | null; closeTime: string | null; label: string | null }) => ({
          id: sd.id, date: sd.date.split('T')[0], isClosed: sd.isClosed, openTime: sd.openTime || '10:00', closeTime: sd.closeTime || '18:00', label: sd.label || '',
        })))
      }
    })
  }, [])

  const toggleClosed = (day: number) => {
    setHours(prev => prev.map(h => h.day === day ? { ...h, closed: !h.closed } : h))
  }

  return (
    <div className="space-y-6 pb-6">
      <h1 className="text-xl font-bold text-slate-900">設定</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="hours">営業時間</TabsTrigger>
          <TabsTrigger value="general">院情報</TabsTrigger>
          <TabsTrigger value="booking">来院予約設定</TabsTrigger>
          <TabsTrigger value="carte">カルテ設定</TabsTrigger>
          <TabsTrigger value="theme">テーマ</TabsTrigger>
          <TabsTrigger value="line">LINE連携</TabsTrigger>
          <TabsTrigger value="connect">オンライン決済</TabsTrigger>
          <TabsTrigger value="services">サービス依頼</TabsTrigger>
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
                <Button variant="outline" size="sm" onClick={() => setShowAddSpecial(true)}>+ 特別日を追加</Button>
              </div>
              <div className="space-y-2">
                {specialDates.map((sd) => (
                  <div key={sd.id || sd.date} className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-slate-500">{sd.date}</span>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${sd.isClosed ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                        {sd.isClosed ? '休業' : `特別営業 ${sd.openTime}〜${sd.closeTime}`}
                      </span>
                      <span className="text-xs text-slate-600">{sd.label}</span>
                    </div>
                    <button className="text-slate-400 hover:text-red-500" onClick={async () => {
                      if (!sd.id) return
                      await fetch(`/api/settings/special-dates?id=${sd.id}`, { method: 'DELETE' })
                      setSpecialDates(prev => prev.filter(s => s.id !== sd.id))
                      toast.success('削除しました')
                    }}>
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                ))}
                {specialDates.length === 0 && <p className="text-xs text-slate-400 py-2">特別日が設定されていません</p>}
              </div>
              {showAddSpecial && (
                <div className="border rounded-xl p-4 border-dashed space-y-3">
                  <h4 className="text-sm font-medium text-slate-700">特別日を追加</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2"><Label className="text-xs">日付 *</Label><Input type="date" value={newSpecial.date} onChange={e => setNewSpecial(p => ({ ...p, date: e.target.value }))} /></div>
                    <div className="space-y-2"><Label className="text-xs">ラベル</Label><Input value={newSpecial.label} onChange={e => setNewSpecial(p => ({ ...p, label: e.target.value }))} placeholder="例: GW休業" /></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch checked={newSpecial.isClosed} onCheckedChange={v => setNewSpecial(p => ({ ...p, isClosed: v }))} />
                    <Label className="text-xs">{newSpecial.isClosed ? '休業' : '特別営業'}</Label>
                  </div>
                  {!newSpecial.isClosed && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2"><Label className="text-xs">開店</Label><Input type="time" value={newSpecial.openTime} onChange={e => setNewSpecial(p => ({ ...p, openTime: e.target.value }))} /></div>
                      <div className="space-y-2"><Label className="text-xs">閉店</Label><Input type="time" value={newSpecial.closeTime} onChange={e => setNewSpecial(p => ({ ...p, closeTime: e.target.value }))} /></div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowAddSpecial(false)}>キャンセル</Button>
                    <Button size="sm" onClick={async () => {
                      if (!newSpecial.date) { toast.error('日付を入力してください'); return }
                      const res = await fetch('/api/settings/special-dates', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newSpecial),
                      })
                      if (res.ok) {
                        const data = await res.json()
                        setSpecialDates(prev => [...prev, { ...newSpecial, id: data.data.id }])
                        setNewSpecial({ date: '', isClosed: true, openTime: '10:00', closeTime: '18:00', label: '' })
                        setShowAddSpecial(false)
                        toast.success('特別日を追加しました')
                      } else toast.error('追加に失敗しました')
                    }}>追加する</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Button onClick={async () => {
            await fetch('/api/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
              businessHours: hours.map(h => ({ dayOfWeek: h.day, openTime: h.open, closeTime: h.close, isClosed: h.closed }))
            })})
            toast.success('営業時間を保存しました')
          }}>保存する</Button>
        </TabsContent>

        {/* 院情報 */}
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

              <h2 className="text-sm font-semibold text-slate-900">Google Maps連携</h2>
              <div className="space-y-2">
                <Label className="text-xs">Google Place ID</Label>
                <Input id="googlePlaceId" placeholder="ChIJ..." />
                <p className="text-[10px] text-slate-400">Google Mapsで院を検索 → URLの「place_id:」以降のIDを入力。ミナオスなびに地図と口コミ導線が表示されます。</p>
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
          <Button onClick={async () => {
            await fetch('/api/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
              tenant: { name: shopName, phone, email, postalCode: postal, address, googlePlaceId: (document.getElementById('googlePlaceId') as HTMLInputElement)?.value || undefined }
            })})
            toast.success('院情報を保存しました')
          }}>保存する</Button>
        </TabsContent>

        {/* 来院予約設定 */}
        <TabsContent value="booking" className="mt-4 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 space-y-5">
              <h2 className="text-sm font-semibold text-slate-900">来院予約受付</h2>
              <div className="space-y-2">
                <Label className="text-xs">来院来院予約受付締切</Label>
                <div className="flex items-center gap-2">
                  <Input type="number" value={bookingDeadline} onChange={(e) => setBookingDeadline(parseInt(e.target.value) || 0)} className="w-20" />
                  <span className="text-sm text-slate-500">時間前まで</span>
                </div>
                <p className="text-[10px] text-slate-400">来院予約開始時刻のX時間前まで受付</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">キャンセル締切</Label>
                <div className="flex items-center gap-2">
                  <Input type="number" value={cancelDeadline} onChange={(e) => setCancelDeadline(parseInt(e.target.value) || 0)} className="w-20" />
                  <span className="text-sm text-slate-500">時間前まで</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">来院予約可能期間</Label>
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
                  <span className="text-sm text-slate-700">新規来院予約通知（施術者宛）</span>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
          <Button onClick={async () => {
            await fetch('/api/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
              tenant: { bookingDeadlineHours: bookingDeadline, cancelDeadlineHours: cancelDeadline, maxFutureDays }
            })})
            toast.success('来院来院予約設定を保存しました')
          }}>保存する</Button>
        </TabsContent>

        {/* カルテ設定 */}
        <TabsContent value="carte" className="mt-4 space-y-6">
          <CarteSettings />
        </TabsContent>

        {/* LINE連携 */}
        <TabsContent value="line" className="mt-4 space-y-6">
          <LineSettings />
        </TabsContent>

        {/* テーマ設定 */}
        <TabsContent value="theme" className="mt-4 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">管理画面テーマ</h2>
                <p className="text-xs text-slate-400 mt-0.5">管理画面のデザインテーマを選択</p>
              </div>
              <ThemeProvider>
                <ThemeSwitcher onSelect={async (theme) => {
                  await fetch('/api/settings', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tenant: { dashboardTheme: theme } }),
                  })
                  toast.success('テーマを保存しました')
                }} />
              </ThemeProvider>
            </CardContent>
          </Card>
        </TabsContent>

        {/* オンライン決済（Stripe Connect） */}
        <TabsContent value="connect" className="mt-4 space-y-6">
          <ConnectSettings />
        </TabsContent>

        {/* サービス依頼 */}
        <TabsContent value="services" className="mt-4 space-y-6">
          <ServiceRequestSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// --- カルテ設定コンポーネント ---

type CarteField = {
  id: string
  name: string
  fieldType: string
  options: string[]
  isRequired: boolean
}

const FIELD_TYPES = [
  { value: 'text', label: 'テキスト' },
  { value: 'number', label: '数値' },
  { value: 'select', label: '選択（単一）' },
  { value: 'multi_select', label: '選択（複数）' },
  { value: 'image', label: '画像' },
  { value: 'date', label: '日付' },
]

const DEFAULT_FIELDS: CarteField[] = [
  { id: '1', name: '主訴', fieldType: 'text', options: [], isRequired: true },
  { id: '2', name: '痛みの部位', fieldType: 'multi_select', options: ['首', '肩', '背中', '腰', '膝', '足'], isRequired: true },
  { id: '3', name: '痛みレベル', fieldType: 'number', options: [], isRequired: true },
  { id: '4', name: '施術内容', fieldType: 'text', options: [], isRequired: false },
  { id: '5', name: '施術写真', fieldType: 'image', options: [], isRequired: false },
]

function CarteSettings() {
  const [fields, setFields] = useState<CarteField[]>(DEFAULT_FIELDS)
  const [editingField, setEditingField] = useState<CarteField | null>(null)
  const [newOptionText, setNewOptionText] = useState('')

  const addField = () => {
    const newField: CarteField = {
      id: `new-${Date.now()}`,
      name: '',
      fieldType: 'text',
      options: [],
      isRequired: false,
    }
    setEditingField(newField)
  }

  const saveField = () => {
    if (!editingField || !editingField.name) {
      toast.error('項目名を入力してください')
      return
    }
    setFields(prev => {
      const exists = prev.find(f => f.id === editingField.id)
      if (exists) {
        return prev.map(f => f.id === editingField.id ? editingField : f)
      }
      return [...prev, editingField]
    })
    setEditingField(null)
    toast.success('項目を保存しました')
  }

  const deleteField = (id: string) => {
    setFields(prev => prev.filter(f => f.id !== id))
    toast.success('項目を削除しました')
  }

  const addOption = () => {
    if (!newOptionText || !editingField) return
    setEditingField(prev => prev ? { ...prev, options: [...prev.options, newOptionText] } : null)
    setNewOptionText('')
  }

  const removeOption = (idx: number) => {
    setEditingField(prev => prev ? { ...prev, options: prev.options.filter((_, i) => i !== idx) } : null)
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">カルテ項目</h2>
              <p className="text-xs text-slate-400 mt-0.5">項目を追加・編集して、カルテをカスタマイズ</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={async () => {
                const res = await fetch('/api/carte-templates/seed', {
                  method: 'POST', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ types: ['seitai', 'shinkyu'] }),
                })
                if (res.ok) {
                  const data = await res.json()
                  if (data.data.created.length > 0) {
                    toast.success(`${data.data.created.join('、')}を作成しました`)
                  } else {
                    toast.info('テンプレートは既に存在します')
                  }
                } else toast.error('作成に失敗しました')
              }}>整体・鍼灸テンプレを追加</Button>
              <Button variant="outline" size="sm" onClick={addField}>+ 項目を追加</Button>
            </div>
          </div>

          <div className="space-y-2">
            {fields.map((field, idx) => (
              <div key={field.id} className="flex items-center justify-between py-3 px-4 rounded-xl bg-slate-50">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[16px] text-slate-300 cursor-grab">drag_indicator</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-400">❷</span>
                      <span className="text-sm font-medium text-slate-900">{field.name}</span>
                      {field.isRequired && <span className="text-[10px] text-red-400">必須</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-slate-400">
                        {FIELD_TYPES.find(t => t.value === field.fieldType)?.label}
                      </span>
                      {field.options.length > 0 && (
                        <span className="text-[11px] text-slate-400">
                          · {field.options.length}個の選択肢
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setEditingField(field)} className="p-1 rounded hover:bg-slate-200 transition-colors">
                    <span className="material-symbols-outlined text-[16px] text-slate-400">edit</span>
                  </button>
                  <button onClick={() => deleteField(field.id)} className="p-1 rounded hover:bg-red-50 transition-colors">
                    <span className="material-symbols-outlined text-[16px] text-slate-400 hover:text-red-500">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Field Dialog */}
      {editingField && (
        <Card className="border-2 border-blue-200 shadow-sm">
          <CardContent className="p-5 space-y-5">
            <h3 className="text-sm font-semibold text-slate-900">
              {fields.find(f => f.id === editingField.id) ? '項目を編集' : '項目を追加'}
            </h3>

            <div className="space-y-2">
              <Label className="text-xs">項目名 *</Label>
              <Input
                value={editingField.name}
                onChange={(e) => setEditingField(prev => prev ? { ...prev, name: e.target.value } : null)}
                placeholder="例: 主訴、痛みの部位"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">種類</Label>
              <Select
                value={editingField.fieldType}
                onValueChange={(v) => { if (v) setEditingField(prev => prev ? { ...prev, fieldType: v } : null) }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(editingField.fieldType === 'select' || editingField.fieldType === 'multi_select') && (
              <div className="space-y-2">
                <Label className="text-xs">選択肢</Label>
                <div className="flex flex-wrap gap-1.5">
                  {editingField.options.map((opt, i) => (
                    <span key={i} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
                      {opt}
                      <button onClick={() => removeOption(i)} className="text-slate-400 hover:text-red-500">×</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newOptionText}
                    onChange={(e) => setNewOptionText(e.target.value)}
                    placeholder="選択肢を入力"
                    className="flex-1"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addOption() } }}
                  />
                  <Button variant="outline" size="sm" onClick={addOption}>追加</Button>
                </div>
              </div>
            )}

            {editingField.fieldType === 'number' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">最小値</Label>
                  <Input type="number" defaultValue={1} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">最大値</Label>
                  <Input type="number" defaultValue={10} />
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Switch
                checked={editingField.isRequired}
                onCheckedChange={(v) => setEditingField(prev => prev ? { ...prev, isRequired: v } : null)}
              />
              <Label className="text-xs">必須項目</Label>
            </div>

            <Separator />

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setEditingField(null)}>キャンセル</Button>
              <Button className="flex-1" onClick={saveField}>保存する</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Button onClick={() => toast.success('カルテ設定を保存しました')}>保存する</Button>
    </div>
  )
}

// --- Stripe Connect設定コンポーネント ---

function ConnectSettings() {
  const [status, setStatus] = useState<{ connected: boolean; chargesEnabled: boolean; dashboardUrl?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [onboarding, setOnboarding] = useState(false)

  useEffect(() => {
    fetch('/api/connect/status').then(r => r.json()).then(r => {
      setStatus(r.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const handleOnboard = async () => {
    setOnboarding(true)
    const res = await fetch('/api/connect/onboard', { method: 'POST' })
    const data = await res.json()
    if (data.data?.url) {
      window.location.href = data.data.url
    } else {
      toast.error('エラーが発生しました')
      setOnboarding(false)
    }
  }

  if (loading) return <div className="h-32 bg-slate-100 rounded-xl animate-pulse" />

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardContent className="p-5 space-y-5">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">オンライン決済（Stripe Connect）</h2>
            <p className="text-xs text-slate-400 mt-0.5">患者がオンラインで施術料金を支払えるようにします</p>
          </div>

          {status?.chargesEnabled ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50">
                <span className="material-symbols-outlined text-[24px] text-green-600">check_circle</span>
                <div>
                  <p className="text-sm font-medium text-green-800">オンライン決済が有効です</p>
                  <p className="text-xs text-green-600 mt-0.5">患者は来院予約時にオンライン決済が利用できます</p>
                </div>
              </div>
              {status.dashboardUrl && (
                <Button variant="outline" onClick={() => window.open(status.dashboardUrl, '_blank')}>
                  Stripeダッシュボードを開く
                </Button>
              )}
            </div>
          ) : status?.connected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-yellow-50">
                <span className="material-symbols-outlined text-[24px] text-yellow-600">pending</span>
                <div>
                  <p className="text-sm font-medium text-yellow-800">セットアップを完了してください</p>
                  <p className="text-xs text-yellow-600 mt-0.5">Stripeの審査が完了するとオンライン決済が有効になります</p>
                </div>
              </div>
              <Button onClick={handleOnboard} disabled={onboarding}>
                {onboarding ? 'リダイレクト中...' : 'セットアップを続ける'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl bg-slate-50 p-4 space-y-3">
                <p className="text-sm text-slate-700">オンライン決済を導入すると：</p>
                <ul className="space-y-1.5">
                  <li className="flex items-start gap-2 text-xs text-slate-600"><span className="material-symbols-outlined text-[14px] text-blue-500 mt-0.5">check</span>患者が来院予約時にクレジットカード決済</li>
                  <li className="flex items-start gap-2 text-xs text-slate-600"><span className="material-symbols-outlined text-[14px] text-blue-500 mt-0.5">check</span>売上は直接あなたの銀行口座に入金</li>
                  <li className="flex items-start gap-2 text-xs text-slate-600"><span className="material-symbols-outlined text-[14px] text-blue-500 mt-0.5">check</span>手数料: 決済額の3.6% + プラットフォーム手数料10%</li>
                </ul>
              </div>
              <Button onClick={handleOnboard} disabled={onboarding}>
                {onboarding ? 'リダイレクト中...' : 'Stripeアカウントを作成して始める'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// --- サービス依頼コンポーネント ---

type ServiceReq = { id: string; type: string; status: string; formData: Record<string, unknown>; createdAt: string }

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pending: { label: '受付済み', className: 'bg-yellow-50 text-yellow-700' },
  in_progress: { label: '対応中', className: 'bg-blue-50 text-blue-700' },
  completed: { label: '完了', className: 'bg-green-50 text-green-700' },
  cancelled: { label: 'キャンセル', className: 'bg-slate-100 text-slate-500' },
}

function ServiceRequestSettings() {
  const [requests, setRequests] = useState<ServiceReq[]>([])
  const [activeForm, setActiveForm] = useState<'line_setup' | 'richmenu_design' | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // LINE設定代行フォーム
  const [lineContact, setLineContact] = useState('')
  const [linePreferredDate, setLinePreferredDate] = useState('')
  const [lineNote, setLineNote] = useState('')

  // Rich Menuフォーム
  const [rmSplit, setRmSplit] = useState('6')
  const [rmButtons, setRmButtons] = useState('')
  const [rmStyle, setRmStyle] = useState('')
  const [rmRefUrl, setRmRefUrl] = useState('')
  const [rmColor, setRmColor] = useState('#2563EB')
  const [rmNote, setRmNote] = useState('')

  useEffect(() => {
    fetch('/api/service-requests').then(r => r.json()).then(r => {
      if (r.data) setRequests(r.data)
    }).catch(() => {})
  }, [])

  const submitRequest = async (type: string, formData: Record<string, unknown>) => {
    setSubmitting(true)
    const res = await fetch('/api/service-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, formData }),
    })
    if (res.ok) {
      const data = await res.json()
      setRequests(prev => [data.data, ...prev])
      setActiveForm(null)
      toast.success('依頼を送信しました。担当者からご連絡いたします。')
    } else {
      toast.error('送信に失敗しました')
    }
    setSubmitting(false)
  }

  return (
    <div className="space-y-6">
      {/* LINE設定代行カード */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">LINE設定代行</h2>
              <p className="text-xs text-slate-400 mt-0.5">LINE公式アカウントの開設からMessaging APIの設定まで代行いたします</p>
            </div>
            <span className="text-sm font-bold text-slate-900">¥5,000<span className="text-[10px] font-normal text-slate-400">（税込）</span></span>
          </div>

          {activeForm === 'line_setup' ? (
            <div className="space-y-4 border-t pt-4">
              <div className="space-y-2"><Label className="text-xs">ご担当者名 *</Label><Input value={lineContact} onChange={e => setLineContact(e.target.value)} /></div>
              <div className="space-y-2"><Label className="text-xs">ご希望の設定日時</Label><Input value={linePreferredDate} onChange={e => setLinePreferredDate(e.target.value)} placeholder="例: 平日10-17時希望" /></div>
              <div className="space-y-2"><Label className="text-xs">備考</Label><textarea className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none resize-none" rows={2} value={lineNote} onChange={e => setLineNote(e.target.value)} /></div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setActiveForm(null)}>キャンセル</Button>
                <Button disabled={submitting || !lineContact} onClick={() => submitRequest('line_setup', { 担当者名: lineContact, 希望日時: linePreferredDate, 備考: lineNote })}>
                  {submitting ? '送信中...' : '依頼する'}
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setActiveForm('line_setup')}>依頼フォームを開く</Button>
          )}
        </CardContent>
      </Card>

      {/* Rich Menu制作依頼カード */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Rich Menu制作依頼</h2>
              <p className="text-xs text-slate-400 mt-0.5">あなたの院に合ったLINEリッチメニューをデザイン・制作いたします</p>
            </div>
            <span className="text-sm font-bold text-slate-900">¥10,000〜<span className="text-[10px] font-normal text-slate-400">（税込）</span></span>
          </div>

          {activeForm === 'richmenu_design' ? (
            <div className="space-y-4 border-t pt-4">
              <div className="space-y-2">
                <Label className="text-xs">メニューの分割数</Label>
                <Select value={rmSplit} onValueChange={(v) => { if (v) setRmSplit(v) }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2分割</SelectItem>
                    <SelectItem value="3">3分割</SelectItem>
                    <SelectItem value="4">4分割</SelectItem>
                    <SelectItem value="6">6分割</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label className="text-xs">各ボタンに入れたい内容 *</Label><textarea className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none resize-none" rows={3} value={rmButtons} onChange={e => setRmButtons(e.target.value)} placeholder="例: 予約する、メニュー、アクセス、LINE問合せ、スタッフ紹介、お知らせ" /></div>
              <div className="space-y-2"><Label className="text-xs">希望するデザインの雰囲気</Label><textarea className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none resize-none" rows={2} value={rmStyle} onChange={e => setRmStyle(e.target.value)} placeholder="例: シンプル、高級感、ナチュラル、可愛い..." /></div>
              <div className="space-y-2"><Label className="text-xs">参考画像URL（任意）</Label><Input value={rmRefUrl} onChange={e => setRmRefUrl(e.target.value)} placeholder="https://..." /></div>
              <div className="space-y-2">
                <Label className="text-xs">ブランドカラー</Label>
                <div className="flex items-center gap-3">
                  <input type="color" value={rmColor} onChange={e => setRmColor(e.target.value)} className="w-10 h-10 rounded border border-slate-200 cursor-pointer" />
                  <Input value={rmColor} onChange={e => setRmColor(e.target.value)} className="w-28" />
                </div>
              </div>
              <div className="space-y-2"><Label className="text-xs">その他要望</Label><textarea className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none resize-none" rows={2} value={rmNote} onChange={e => setRmNote(e.target.value)} /></div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setActiveForm(null)}>キャンセル</Button>
                <Button disabled={submitting || !rmButtons} onClick={() => submitRequest('richmenu_design', { 分割数: `${rmSplit}分割`, ボタン内容: rmButtons, デザイン雰囲気: rmStyle, 参考画像: rmRefUrl, ブランドカラー: rmColor, その他: rmNote })}>
                  {submitting ? '送信中...' : '依頼する'}
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setActiveForm('richmenu_design')}>ヒアリングフォームを開く</Button>
          )}
        </CardContent>
      </Card>

      {/* 既存の依頼一覧 */}
      {requests.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">依頼履歴</h2>
            <div className="space-y-2">
              {requests.map(req => (
                <div key={req.id} className="flex items-center justify-between py-3 px-4 rounded-xl bg-slate-50">
                  <div>
                    <span className="text-sm font-medium text-slate-900">
                      {req.type === 'line_setup' ? 'LINE設定代行' : 'Rich Menu制作'}
                    </span>
                    <span className="text-xs text-slate-400 ml-2">
                      {new Date(req.createdAt).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${STATUS_LABELS[req.status]?.className || 'bg-slate-100 text-slate-500'}`}>
                    {STATUS_LABELS[req.status]?.label || req.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// --- LINE設定コンポーネント ---

function LineSettings() {
  const [channelId, setChannelId] = useState('')
  const [channelSecret, setChannelSecret] = useState('')
  const [channelAccessToken, setChannelAccessToken] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/settings/line').then(r => r.json()).then(r => {
      if (r.data) {
        setChannelId(r.data.channelId || '')
        setChannelSecret(r.data.channelSecret || '')
        setChannelAccessToken(r.data.channelAccessToken || '')
        setIsActive(r.data.isActive ?? true)
      }
      setLoaded(true)
    })
  }, [])

  if (!loaded) return <div className="h-32 bg-slate-100 rounded-xl animate-pulse" />

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardContent className="p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">LINE Messaging API</h2>
              <p className="text-xs text-slate-400 mt-0.5">LINE公式アカウントと連携��て患者とチャット</p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <div className="space-y-2"><Label className="text-xs">Channel ID</Label><Input value={channelId} onChange={e => setChannelId(e.target.value)} placeholder="1234567890" /></div>
          <div className="space-y-2"><Label className="text-xs">Channel Secret</Label><Input value={channelSecret} onChange={e => setChannelSecret(e.target.value)} type="password" /></div>
          <div className="space-y-2"><Label className="text-xs">Channel Access Token</Label><Input value={channelAccessToken} onChange={e => setChannelAccessToken(e.target.value)} type="password" /></div>

          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-600">Webhook URL</p>
            <p className="text-xs text-slate-400 mt-1 font-mono break-all">{typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/line` : '/api/webhooks/line'}</p>
            <p className="text-[10px] text-slate-400 mt-1">LINE Developersコンソールで上記URLをWebhook URLに設定してください</p>
          </div>
        </CardContent>
      </Card>
      <Button onClick={async () => {
        const res = await fetch('/api/settings/line', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channelId, channelSecret, channelAccessToken, isActive }),
        })
        if (res.ok) toast.success('LINE設定を保存しました')
        else toast.error('保存に失敗しました')
      }}>保存する</Button>
    </div>
  )
}
