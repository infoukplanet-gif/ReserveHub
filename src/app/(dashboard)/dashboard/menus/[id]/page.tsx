'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

const DAYS = [
  { value: 0, label: '日' },
  { value: 1, label: '月' },
  { value: 2, label: '火' },
  { value: 3, label: '水' },
  { value: 4, label: '木' },
  { value: 5, label: '金' },
  { value: 6, label: '土' },
]

type PricingRule = {
  id: string
  ruleType: string
  dayOfWeek: number[]
  timeFrom: string | null
  timeTo: string | null
  price: number
  label: string | null
  priority: number
}

type MenuOption = {
  id: string
  name: string
  price: number
  durationMinutes: number
  isActive: boolean
}

type MenuData = {
  id: string
  name: string
  description: string | null
  durationMinutes: number
  bufferMinutes: number
  basePrice: number
  isActive: boolean
  pricingRules: PricingRule[]
  menuOptions: MenuOption[]
}

function formatPrice(price: number) {
  return `¥${price.toLocaleString()}`
}

// 料金プレビューマトリクスを生成
function generatePriceMatrix(basePrice: number, rules: PricingRule[]) {
  const weekday = [1, 2, 3, 4, 5]
  const weekend = [0, 6]
  const timeSlots = [
    { label: '終日', from: null, to: null },
    ...Array.from(
      new Set(
        rules
          .filter((r) => r.timeFrom && r.timeTo)
          .map((r) => JSON.stringify({ from: r.timeFrom, to: r.timeTo }))
      )
    ).map((s) => {
      const parsed = JSON.parse(s)
      return { label: `${parsed.from}〜${parsed.to}`, from: parsed.from, to: parsed.to }
    }),
  ]

  if (timeSlots.length === 1) {
    // 時間帯ルールなし: 曜日のみ
    const weekdayPrice = findPrice(basePrice, rules, weekday, null, null)
    const weekendPrice = findPrice(basePrice, rules, weekend, null, null)
    return { timeSlots: [{ label: '終日' }], weekdayPrices: [weekdayPrice], weekendPrices: [weekendPrice] }
  }

  const weekdayPrices = timeSlots.slice(1).map((ts) => findPrice(basePrice, rules, weekday, ts.from, ts.to))
  const weekendPrices = timeSlots.slice(1).map((ts) => findPrice(basePrice, rules, weekend, ts.from, ts.to))

  return { timeSlots: timeSlots.slice(1), weekdayPrices, weekendPrices }
}

function findPrice(basePrice: number, rules: PricingRule[], days: number[], timeFrom: string | null, timeTo: string | null) {
  const sorted = [...rules].sort((a, b) => b.priority - a.priority)
  for (const rule of sorted) {
    const dayMatch = rule.dayOfWeek.length === 0 || rule.dayOfWeek.some((d) => days.includes(d))
    const timeMatch = !rule.timeFrom || !rule.timeTo || !timeFrom || !timeTo ||
      (rule.timeFrom === timeFrom && rule.timeTo === timeTo)
    if (dayMatch && timeMatch) return rule.price
  }
  return basePrice
}

export default function MenuEditPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const isNew = id === 'new'

  const [menu, setMenu] = useState<MenuData>({
    id: '',
    name: '',
    description: '',
    durationMinutes: 60,
    bufferMinutes: 15,
    basePrice: 8000,
    isActive: true,
    pricingRules: [],
    menuOptions: [],
  })
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)

  // 新しい料金ルールのフォーム
  const [newRule, setNewRule] = useState<Omit<PricingRule, 'id'>>({
    ruleType: 'day_of_week',
    dayOfWeek: [],
    timeFrom: null,
    timeTo: null,
    price: 0,
    label: '',
    priority: 0,
  })

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/menus/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.data) setMenu(data.data)
          setLoading(false)
        })
    }
  }, [id, isNew])

  const handleSave = async () => {
    setSaving(true)
    try {
      const url = isNew ? '/api/menus' : `/api/menus/${id}`
      const method = isNew ? 'POST' : 'PATCH'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: menu.name,
          description: menu.description,
          durationMinutes: menu.durationMinutes,
          bufferMinutes: menu.bufferMinutes,
          basePrice: menu.basePrice,
          isActive: menu.isActive,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'エラーが発生しました')
        return
      }
      toast.success(isNew ? '施術メニューを作成しました' : '保存しました')
      if (isNew) router.push(`/dashboard/menus/${data.data.id}`)
    } finally {
      setSaving(false)
    }
  }

  const handleAddRule = async () => {
    if (isNew) {
      toast.error('先に施術メニューを保存してください')
      return
    }
    const res = await fetch(`/api/menus/${id}/pricing-rules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newRule,
        priority: menu.pricingRules.length + 1,
      }),
    })
    const data = await res.json()
    if (res.ok) {
      setMenu((prev) => ({
        ...prev,
        pricingRules: [...prev.pricingRules, data.data],
      }))
      setNewRule({ ruleType: 'day_of_week', dayOfWeek: [], timeFrom: null, timeTo: null, price: 0, label: '', priority: 0 })
      toast.success('料金ルールを追加しました')
    }
  }

  const handleDeleteRule = async (ruleId: string) => {
    await fetch(`/api/menus/${id}/pricing-rules?ruleId=${ruleId}`, { method: 'DELETE' })
    setMenu((prev) => ({
      ...prev,
      pricingRules: prev.pricingRules.filter((r) => r.id !== ruleId),
    }))
    toast.success('料金ルールを削除しました')
  }

  const toggleDay = (day: number) => {
    setNewRule((prev) => ({
      ...prev,
      dayOfWeek: prev.dayOfWeek.includes(day)
        ? prev.dayOfWeek.filter((d) => d !== day)
        : [...prev.dayOfWeek, day],
    }))
  }

  if (loading) {
    return <div className="space-y-4">
      <div className="h-8 w-64 bg-slate-100 rounded animate-pulse" />
      <div className="h-64 bg-slate-100 rounded animate-pulse" />
    </div>
  }

  const matrix = generatePriceMatrix(menu.basePrice, menu.pricingRules)

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/menus')}>
          ← 施術メニュー
        </Button>
      </div>

      <h1 className="text-2xl font-bold text-slate-900">
        {isNew ? '施術メニューを追加' : menu.name}
      </h1>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>施術メニュー名 *</Label>
            <Input
              value={menu.name}
              onChange={(e) => setMenu((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="例: ボディケア60分コース"
            />
          </div>
          <div className="space-y-2">
            <Label>説明</Label>
            <Textarea
              value={menu.description || ''}
              onChange={(e) => setMenu((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="施術メニューの説明"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>所要時間（分） *</Label>
              <Input
                type="number"
                value={menu.durationMinutes}
                onChange={(e) => setMenu((prev) => ({ ...prev, durationMinutes: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label>バッファ時間（分）</Label>
              <Input
                type="number"
                value={menu.bufferMinutes}
                onChange={(e) => setMenu((prev) => ({ ...prev, bufferMinutes: parseInt(e.target.value) || 0 }))}
              />
              <p className="text-xs text-slate-400 mt-1">前後の準備時間</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={menu.isActive}
              onCheckedChange={(checked) => setMenu((prev) => ({ ...prev, isActive: checked }))}
            />
            <Label>公開</Label>
          </div>
        </CardContent>
      </Card>

      {/* Pricing — 差別化の核心 */}
      <Card>
        <CardHeader>
          <CardTitle>料金設定</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>ベース料金 *</Label>
            <Input
              type="number"
              value={menu.basePrice}
              onChange={(e) => setMenu((prev) => ({ ...prev, basePrice: parseInt(e.target.value) || 0 }))}
            />
            <p className="text-xs text-slate-400">他のルールに該当しない場合この料金が適用されます</p>
          </div>

          <Separator />

          {/* Existing Rules */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">料金ルール</h3>
            <div className="space-y-3">
              {menu.pricingRules.map((rule, idx) => (
                <div key={rule.id} className="border rounded-xl p-4 bg-slate-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        ❷ {rule.label || `ルール${idx + 1}`}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {DAYS.map((d) => (
                          <span
                            key={d.value}
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium ${
                              rule.dayOfWeek.includes(d.value)
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-200 text-slate-400'
                            }`}
                          >
                            {d.label}
                          </span>
                        ))}
                      </div>
                      {rule.timeFrom && rule.timeTo && (
                        <p className="text-xs text-slate-500 mt-2">
                          時間帯: {rule.timeFrom}〜{rule.timeTo}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-slate-900">{formatPrice(rule.price)}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 mt-1"
                        onClick={() => handleDeleteRule(rule.id)}
                      >
                        削除
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Add New Rule */}
          {!isNew && (
            <div className="border rounded-xl p-4 border-dashed">
              <h4 className="text-sm font-medium text-slate-700 mb-3">+ ルールを追加</h4>
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label>ラベル</Label>
                  <Input
                    value={newRule.label || ''}
                    onChange={(e) => setNewRule((prev) => ({ ...prev, label: e.target.value }))}
                    placeholder="例: 休日料金、平日ナイト割"
                  />
                </div>
                <div className="space-y-2">
                  <Label>曜日</Label>
                  <div className="flex gap-1.5">
                    {DAYS.map((d) => (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => toggleDay(d.value)}
                        className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-medium transition-colors ${
                          newRule.dayOfWeek.includes(d.value)
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>開始時刻（空欄=終日）</Label>
                    <Input
                      type="time"
                      value={newRule.timeFrom || ''}
                      onChange={(e) => setNewRule((prev) => ({ ...prev, timeFrom: e.target.value || null }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>終了時刻</Label>
                    <Input
                      type="time"
                      value={newRule.timeTo || ''}
                      onChange={(e) => setNewRule((prev) => ({ ...prev, timeTo: e.target.value || null }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>料金</Label>
                  <Input
                    type="number"
                    value={newRule.price}
                    onChange={(e) => setNewRule((prev) => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <Button variant="outline" onClick={handleAddRule}>追加する</Button>
              </div>
            </div>
          )}

          <Separator />

          {/* Price Preview Matrix */}
          {menu.pricingRules.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">料金プレビュー</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-4 py-2 text-left text-slate-500 font-medium" />
                      <th className="px-4 py-2 text-center text-slate-500 font-medium">月〜金</th>
                      <th className="px-4 py-2 text-center text-slate-500 font-medium">土日祝</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matrix.timeSlots.map((ts, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-4 py-2 text-slate-600">{ts.label}</td>
                        <td className="px-4 py-2 text-center font-medium">{formatPrice(matrix.weekdayPrices[i])}</td>
                        <td className="px-4 py-2 text-center font-medium">{formatPrice(matrix.weekendPrices[i])}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                複数ルールが該当する場合、後に追加されたルールが優先されます
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Options */}
      <Card>
        <CardHeader>
          <CardTitle>オプション</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {menu.menuOptions.length > 0 && (
            <div className="space-y-2">
              {menu.menuOptions.map((opt) => (
                <div key={opt.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{opt.name}</p>
                    <p className="text-xs text-slate-500">+{opt.durationMinutes}分</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">+{formatPrice(opt.price)}</p>
                </div>
              ))}
            </div>
          )}
          {!isNew && (
            <div className="border rounded-xl p-4 border-dashed space-y-3">
              <h4 className="text-sm font-medium text-slate-700">+ オプションを追加</h4>
              <div className="space-y-2"><Label>オプション名</Label><Input id="opt-name" placeholder="例: ヘッドスパ追加" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>追加料金</Label><Input id="opt-price" type="number" placeholder="1500" /></div>
                <div className="space-y-2"><Label>追加時間（分）</Label><Input id="opt-duration" type="number" placeholder="15" /></div>
              </div>
              <Button variant="outline" onClick={async () => {
                const name = (document.getElementById('opt-name') as HTMLInputElement).value
                const price = parseInt((document.getElementById('opt-price') as HTMLInputElement).value) || 0
                const dur = parseInt((document.getElementById('opt-duration') as HTMLInputElement).value) || 0
                if (!name) { toast.error('オプション名を入力してください'); return }
                const res = await fetch(`/api/menus/${id}/options`, {
                  method: 'POST', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name, price, durationMinutes: dur }),
                })
                if (res.ok) {
                  const data = await res.json()
                  setMenu(prev => ({ ...prev, menuOptions: [...prev.menuOptions, data.data] }))
                  ;(document.getElementById('opt-name') as HTMLInputElement).value = ''
                  ;(document.getElementById('opt-price') as HTMLInputElement).value = ''
                  ;(document.getElementById('opt-duration') as HTMLInputElement).value = ''
                  toast.success('オプションを追加しました')
                }
              }}>追加する</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-end gap-3 lg:left-60">
        <Button variant="outline" onClick={() => router.push('/dashboard/menus')}>
          キャンセル
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? '保存中...' : '保存する'}
        </Button>
      </div>
    </div>
  )
}
