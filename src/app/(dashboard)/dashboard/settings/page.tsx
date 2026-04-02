'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
    })
  }, [])

  const toggleClosed = (day: number) => {
    setHours(prev => prev.map(h => h.day === day ? { ...h, closed: !h.closed } : h))
  }

  return (
    <div className="space-y-6 pb-6">
      <h1 className="text-xl font-bold text-slate-900">設定</h1>

      <Tabs defaultValue={typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('tab') || 'hours' : 'hours'}>
        <TabsList>
          <TabsTrigger value="hours">営業時間</TabsTrigger>
          <TabsTrigger value="general">基本情報</TabsTrigger>
          <TabsTrigger value="booking">予約設定</TabsTrigger>
          <TabsTrigger value="carte">カルテ設定</TabsTrigger>
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

          <Button onClick={async () => {
            await fetch('/api/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
              businessHours: hours.map(h => ({ dayOfWeek: h.day, openTime: h.open, closeTime: h.close, isClosed: h.closed }))
            })})
            toast.success('営業時間を保存しました')
          }}>保存する</Button>
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
          <Button onClick={async () => {
            await fetch('/api/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
              tenant: { name: shopName, phone, email, postalCode: postal, address }
            })})
            toast.success('基本情報を保存しました')
          }}>保存する</Button>
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
          <Button onClick={async () => {
            await fetch('/api/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
              tenant: { bookingDeadlineHours: bookingDeadline, cancelDeadlineHours: cancelDeadline, maxFutureDays }
            })})
            toast.success('予約設定を保存しました')
          }}>保存する</Button>
        </TabsContent>

        {/* カルテ設定 */}
        <TabsContent value="carte" className="mt-4 space-y-6">
          <CarteSettings />
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
            <Button variant="outline" size="sm" onClick={addField}>+ 項目を追加</Button>
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
