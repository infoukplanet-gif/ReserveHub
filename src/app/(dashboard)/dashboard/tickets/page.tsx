'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

function formatPrice(p: number) { return `¥${p.toLocaleString()}` }

type Template = { id: string; name: string; totalCount: number; price: number; validMonths: number; isOnSale: boolean; targetMenus: { menu: { name: string; basePrice: number } }[] }
type Purchased = { id: string; remainingCount: number; expiresAt: string; status: string; customer: { name: string }; ticketTemplate: { name: string; totalCount: number } }

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: '有効', className: 'bg-green-50 text-green-700' },
  used_up: { label: '使い切り', className: 'bg-slate-100 text-slate-500' },
  expired: { label: '期限切れ', className: 'bg-red-50 text-red-700' },
}

type CustomerItem = { id: string; name: string }

export default function TicketsPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [purchased, setPurchased] = useState<Purchased[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<Template> | null>(null)
  const [showPurchase, setShowPurchase] = useState(false)
  const [purchaseTemplateId, setPurchaseTemplateId] = useState('')
  const [purchaseCustomerId, setPurchaseCustomerId] = useState('')
  const [customers, setCustomers] = useState<CustomerItem[]>([])

  const loadData = () => {
    fetch('/api/tickets')
      .then(r => r.json())
      .then(r => { setTemplates(r.data?.templates || []); setPurchased(r.data?.purchased || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
    fetch('/api/customers').then(r => r.json()).then(r => setCustomers(r.data || []))
  }, [])

  const openNew = () => setEditing({ name: '', totalCount: 10, price: 0, validMonths: 6, isOnSale: true })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">回数券管理</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPurchase(true)}>回数券を販売</Button>
          <Button onClick={openNew}>+ 回数券を作成</Button>
        </div>
      </div>

      <Tabs defaultValue="templates">
        <TabsList><TabsTrigger value="templates">テンプレート</TabsTrigger><TabsTrigger value="purchased">購入済み一覧</TabsTrigger></TabsList>

        <TabsContent value="templates" className="mt-4 space-y-3">
          {loading ? (
            <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-20 bg-slate-100 rounded-lg animate-pulse" />)}</div>
          ) : templates.length === 0 ? (
            <Card className="border-0 shadow-sm"><CardContent className="py-12 text-center"><p className="text-sm text-slate-400">回数券テンプレートがありません</p><Button variant="outline" className="mt-3" onClick={openNew}>+ 作成する</Button></CardContent></Card>
          ) : templates.map(t => {
            const menuPrice = t.targetMenus[0]?.menu.basePrice || 0
            const unitPrice = t.totalCount > 0 ? Math.round(t.price / t.totalCount) : 0
            const discount = menuPrice > 0 ? Math.round((1 - unitPrice / menuPrice) * 100) : 0
            return (
              <Card key={t.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setEditing(t)}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span>🎫</span><p className="text-sm font-semibold text-slate-900">{t.name}</p>
                        <Badge variant="secondary" className={t.isOnSale ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}>{t.isOnSale ? '販売中' : '販売停止'}</Badge>
                      </div>
                      <div className="mt-2 space-y-0.5 text-xs text-slate-500">
                        <p>対象: {t.targetMenus.map(tm => tm.menu.name).join(', ') || '未設定'}</p>
                        <p>回数: {t.totalCount}回 · 有効期限: {t.validMonths}ヶ月</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-slate-900">{formatPrice(t.price)}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">1回 {formatPrice(unitPrice)}{discount > 0 && <span className="text-green-600 ml-1">({discount}%OFF)</span>}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>

        <TabsContent value="purchased" className="mt-4">
          <Card className="border-0 shadow-sm"><CardContent className="p-0"><div className="divide-y divide-slate-100">
            {purchased.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-400">購入済み回数券がありません</div>
            ) : purchased.map(p => {
              const isExpiringSoon = new Date(p.expiresAt).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000 && p.status === 'active'
              return (
                <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-600 shrink-0">{p.customer.name[0]}</div>
                  <div className="flex-1 min-w-0"><p className="text-sm font-medium text-slate-900">{p.customer.name}</p><p className="text-[11px] text-slate-400">{p.ticketTemplate.name}</p></div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-16"><Progress value={(p.remainingCount / p.ticketTemplate.totalCount) * 100} className="h-1.5" /><p className="text-[10px] text-slate-400 mt-0.5 text-center">{p.remainingCount}/{p.ticketTemplate.totalCount}回</p></div>
                    <div className="text-right">
                      <p className="text-[11px] text-slate-400">{new Date(p.expiresAt).toLocaleDateString('ja-JP')}</p>
                      <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium ${isExpiringSoon ? 'bg-amber-50 text-amber-700' : (statusConfig[p.status]?.className || '')}`}>{isExpiringSoon ? '期限間近' : (statusConfig[p.status]?.label || p.status)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div></CardContent></Card>
        </TabsContent>
      </Tabs>

      <Sheet open={!!editing} onOpenChange={() => setEditing(null)}>
        <SheetContent className="w-full sm:w-[480px] overflow-y-auto">
          {editing && (
            <>
              <SheetHeader><SheetTitle>回数券テンプレート</SheetTitle></SheetHeader>
              <div className="space-y-5 mt-6">
                <div className="space-y-2"><Label>回数券名</Label><Input value={editing.name || ''} onChange={e => setEditing(p => p ? { ...p, name: e.target.value } : null)} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>回数</Label><Input type="number" value={editing.totalCount || 0} onChange={e => setEditing(p => p ? { ...p, totalCount: parseInt(e.target.value) || 0 } : null)} /></div>
                  <div className="space-y-2"><Label>販売価格</Label><Input type="number" value={editing.price || 0} onChange={e => setEditing(p => p ? { ...p, price: parseInt(e.target.value) || 0 } : null)} /></div>
                </div>
                <div className="space-y-2"><Label>有効期間</Label><div className="flex items-center gap-2"><Input type="number" value={editing.validMonths || 0} onChange={e => setEditing(p => p ? { ...p, validMonths: parseInt(e.target.value) || 0 } : null)} className="w-24" /><span className="text-sm text-slate-500">ヶ月</span></div></div>
                <div className="flex items-center gap-3"><Switch checked={editing.isOnSale ?? true} onCheckedChange={v => setEditing(p => p ? { ...p, isOnSale: v } : null)} /><Label>販売中</Label></div>
                <Separator />
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3"><p className="text-xs text-amber-700">回数券はメニュー本体のみ消化されます。オプション・指名料は別途精算です。</p></div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setEditing(null)}>キャンセル</Button>
                  <Button className="flex-1" onClick={async () => {
                    const res = await fetch('/api/tickets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) })
                    if (res.ok) { toast.success('保存しました'); setEditing(null); window.location.reload() }
                    else toast.error('保存に失敗しました')
                  }}>保存する</Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Purchase Sheet */}
      <Sheet open={showPurchase} onOpenChange={setShowPurchase}>
        <SheetContent className="w-full sm:w-[480px] overflow-y-auto px-6">
          <SheetHeader><SheetTitle>回数券を販売</SheetTitle></SheetHeader>
          <div className="space-y-5 mt-6">
            <div className="space-y-2">
              <Label>回数券テンプレート *</Label>
              <Select value={purchaseTemplateId} onValueChange={(v) => { if (v) setPurchaseTemplateId(v) }}>
                <SelectTrigger><SelectValue placeholder="回数券を選択" /></SelectTrigger>
                <SelectContent>
                  {templates.filter(t => t.isOnSale).map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name}（{t.totalCount}回・{formatPrice(t.price)}）</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>顧客 *</Label>
              <Select value={purchaseCustomerId} onValueChange={(v) => { if (v) setPurchaseCustomerId(v) }}>
                <SelectTrigger><SelectValue placeholder="顧客を選択" /></SelectTrigger>
                <SelectContent>
                  {customers.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs text-amber-700">回数券はメニュー本体のみ消化されます。オプション・指名料は別途精算です。</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowPurchase(false)}>キャンセル</Button>
              <Button className="flex-1" onClick={async () => {
                if (!purchaseTemplateId || !purchaseCustomerId) { toast.error('必須項目を選択してください'); return }
                const res = await fetch('/api/tickets/purchase', {
                  method: 'POST', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ ticketTemplateId: purchaseTemplateId, customerId: purchaseCustomerId }),
                })
                if (res.ok) {
                  toast.success('回数券を販売しました')
                  setShowPurchase(false)
                  setPurchaseTemplateId('')
                  setPurchaseCustomerId('')
                  loadData()
                } else { const d = await res.json(); toast.error(d.error || '販売に失敗しました') }
              }}>販売する</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
