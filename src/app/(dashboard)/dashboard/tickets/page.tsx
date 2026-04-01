'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

function formatPrice(price: number) {
  return `¥${price.toLocaleString()}`
}

const MOCK_TEMPLATES = [
  { id: '1', name: '60分コース10回券', targetMenu: 'ボディケア60分', count: 10, price: 70000, validMonths: 6, isOnSale: true, unitPrice: 7000, normalPrice: 8000 },
  { id: '2', name: '45分フェイシャル5回券', targetMenu: 'フェイシャル45分', count: 5, price: 27500, validMonths: 3, isOnSale: true, unitPrice: 5500, normalPrice: 6000 },
  { id: '3', name: '90分コース10回券', targetMenu: 'ボディケア90分', count: 10, price: 100000, validMonths: 6, isOnSale: false, unitPrice: 10000, normalPrice: 11000 },
]

const MOCK_PURCHASED = [
  { id: '1', customer: '山田 太郎', template: '60分コース10回券', remaining: 5, total: 10, expires: '2026/7/15', status: 'active' },
  { id: '2', customer: '佐藤 花子', template: '60分コース10回券', remaining: 2, total: 10, expires: '2026/4/15', status: 'warning' },
  { id: '3', customer: '田中 一郎', template: '45分フェイシャル5回券', remaining: 0, total: 5, expires: '2026/3/20', status: 'used_up' },
  { id: '4', customer: '高橋 遼', template: '60分コース10回券', remaining: 8, total: 10, expires: '2026/2/28', status: 'expired' },
]

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: '有効', className: 'bg-green-50 text-green-700' },
  warning: { label: '期限間近', className: 'bg-amber-50 text-amber-700' },
  used_up: { label: '使い切り', className: 'bg-slate-100 text-slate-500' },
  expired: { label: '期限切れ', className: 'bg-red-50 text-red-700' },
}

export default function TicketsPage() {
  const [editingTemplate, setEditingTemplate] = useState<typeof MOCK_TEMPLATES[0] | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">回数券管理</h1>
        </div>
        <Button onClick={() => setEditingTemplate({ id: `new-${Date.now()}`, name: '', targetMenu: '', count: 10, price: 0, validMonths: 6, isOnSale: true, unitPrice: 0, normalPrice: 0 })}>+ 回数券を作成</Button>
      </div>

      <Tabs defaultValue="templates">
        <TabsList>
          <TabsTrigger value="templates">テンプレート</TabsTrigger>
          <TabsTrigger value="purchased">購入済み一覧</TabsTrigger>
        </TabsList>

        {/* Templates */}
        <TabsContent value="templates" className="mt-4 space-y-3">
          {MOCK_TEMPLATES.map((t) => (
            <Card key={t.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setEditingTemplate(t)}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base">🎫</span>
                      <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                      <Badge variant="secondary" className={t.isOnSale ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}>
                        {t.isOnSale ? '販売中' : '販売停止'}
                      </Badge>
                    </div>
                    <div className="mt-2.5 space-y-1 text-xs text-slate-500">
                      <p>対象: {t.targetMenu}</p>
                      <p>回数: {t.count}回 · 有効期限: 購入から{t.validMonths}ヶ月</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-slate-900">{formatPrice(t.price)}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      1回 {formatPrice(t.unitPrice)}
                      <span className="text-green-600 ml-1">
                        ({Math.round((1 - t.unitPrice / t.normalPrice) * 100)}%OFF)
                      </span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Purchased */}
        <TabsContent value="purchased" className="mt-4">
          <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
            {['すべて', '有効', '期限間近', '使い切り', '期限切れ'].map((label) => (
              <button key={label} className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                {label}
              </button>
            ))}
          </div>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {MOCK_PURCHASED.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-600 shrink-0">
                      {p.customer[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{p.customer}</p>
                      <p className="text-[11px] text-slate-400">{p.template}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="w-16">
                        <Progress value={(p.remaining / p.total) * 100} className="h-1.5" />
                        <p className="text-[10px] text-slate-400 mt-0.5 text-center">{p.remaining}/{p.total}回</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-slate-400">{p.expires}</p>
                        <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium ${statusConfig[p.status].className}`}>
                          {statusConfig[p.status].label}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Sheet */}
      <Sheet open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
        <SheetContent className="w-full sm:w-[480px] overflow-y-auto">
          {editingTemplate && (
            <>
              <SheetHeader>
                <SheetTitle>回数券テンプレート</SheetTitle>
              </SheetHeader>
              <div className="space-y-5 mt-6">
                <div className="space-y-2">
                  <Label>回数券名</Label>
                  <Input defaultValue={editingTemplate.name} />
                </div>
                <div className="space-y-2">
                  <Label>対象メニュー</Label>
                  <Input defaultValue={editingTemplate.targetMenu} disabled />
                  <p className="text-xs text-slate-400">メニュー管理から変更できます</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>回数</Label>
                    <Input type="number" defaultValue={editingTemplate.count} />
                  </div>
                  <div className="space-y-2">
                    <Label>販売価格</Label>
                    <Input type="number" defaultValue={editingTemplate.price} />
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 text-sm">
                  <p className="text-slate-500">1回あたり <span className="font-semibold text-slate-900">{formatPrice(editingTemplate.unitPrice)}</span></p>
                  <p className="text-slate-500">通常料金 {formatPrice(editingTemplate.normalPrice)} → <span className="text-green-600 font-semibold">{Math.round((1 - editingTemplate.unitPrice / editingTemplate.normalPrice) * 100)}%OFF</span></p>
                </div>
                <div className="space-y-2">
                  <Label>有効期間</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue={editingTemplate.validMonths} className="w-24" />
                    <span className="text-sm text-slate-500">ヶ月</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch defaultChecked={editingTemplate.isOnSale} />
                  <Label>販売中</Label>
                </div>

                <Separator />

                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <p className="text-xs text-amber-700">回数券はメニュー本体のみ消化されます。オプション・指名料は別途精算となります。</p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setEditingTemplate(null)}>キャンセル</Button>
                  <Button className="flex-1" onClick={() => { toast.success('保存しました'); setEditingTemplate(null) }}>保存する</Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
