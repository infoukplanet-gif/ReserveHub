'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

type Customer = {
  id: string
  name: string
  nameKana: string | null
  email: string | null
  phone: string | null
  totalVisits: number
  totalRevenue: number
  lastVisitAt: string | null
  memo: string | null
  tagAssignments: { tag: { name: string; color: string } }[]
  reservations?: { id: string; startsAt: string; menu: { name: string }; staff: { name: string } | null; totalPrice: number; status: string }[]
  carteRecords?: { id: string; recordedAt: string; data: Record<string, unknown>; memo: string | null; staff: { name: string } | null }[]
  purchasedTickets?: { id: string; remainingCount: number; expiresAt: string; status: string; ticketTemplate: { name: string; totalCount: number } }[]
}

const tagColors: Record<string, string> = {
  'VIP': 'bg-violet-50 text-violet-700',
  '回数券保有': 'bg-blue-50 text-blue-700',
  '新規': 'bg-green-50 text-green-700',
  '離脱リスク': 'bg-amber-50 text-amber-700',
}

function formatPrice(p: number) { return `¥${p.toLocaleString()}` }

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tagFilter, setTagFilter] = useState('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<Customer | null>(null)
  const [showCarteForm, setShowCarteForm] = useState(false)
  const [carteMemo, setCarteMemo] = useState('')

  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (tagFilter !== 'all') params.set('tag', tagFilter)
    fetch(`/api/customers?${params}`)
      .then(r => r.json())
      .then(r => { setCustomers(r.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [search, tagFilter])

  useEffect(() => {
    if (!selectedId) { setDetail(null); return }
    fetch(`/api/customers/${selectedId}`)
      .then(r => r.json())
      .then(r => setDetail(r.data))
  }, [selectedId])

  const allTags = Array.from(new Set(customers.flatMap(c => c.tagAssignments.map(ta => ta.tag.name))))

  if (detail) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => setSelectedId(null)}>← 患者一覧</Button>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-xl font-bold text-blue-600">{detail.name[0]}</div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{detail.name}</h1>
            <p className="text-xs text-slate-400">{detail.nameKana}</p>
            <div className="flex gap-1.5 mt-1 flex-wrap">
              {detail.tagAssignments.map(ta => (
                <span key={ta.tag.name} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${tagColors[ta.tag.name] || 'bg-slate-100 text-slate-600'}`}>
                  {ta.tag.name}
                  <button onClick={async () => {
                    await fetch(`/api/customers/${detail.id}/tags?tagName=${encodeURIComponent(ta.tag.name)}`, { method: 'DELETE' })
                    const r = await fetch(`/api/customers/${detail.id}`).then(r => r.json())
                    setDetail(r.data)
                    toast.success('タグを削除しました')
                  }} className="hover:text-red-500">×</button>
                </span>
              ))}
              <button onClick={async () => {
                const tagName = window.prompt('タグ名を入力')
                if (!tagName) return
                await fetch(`/api/customers/${detail.id}/tags`, {
                  method: 'POST', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ tagName }),
                })
                const r = await fetch(`/api/customers/${detail.id}`).then(r => r.json())
                setDetail(r.data)
                toast.success('タグを追加しました')
              }} className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-500 hover:bg-slate-200">+ タグ追加</button>
            </div>
          </div>
        </div>

        <Card className="border-0 shadow-sm"><CardContent className="p-4 space-y-2 text-sm">
          {detail.email && <div className="flex items-center gap-2 text-slate-600"><span className="material-symbols-outlined text-[16px] text-slate-400">mail</span>{detail.email}</div>}
          {detail.phone && <div className="flex items-center gap-2 text-slate-600"><span className="material-symbols-outlined text-[16px] text-slate-400">phone</span>{detail.phone}</div>}
        </CardContent></Card>

        <div className="grid grid-cols-3 gap-3">
          <Card className="border-0 shadow-sm"><CardContent className="p-4 text-center">
            <p className="text-xl font-bold text-slate-900">{detail.totalVisits}回</p><p className="text-[11px] text-slate-400">来院回数</p>
          </CardContent></Card>
          <Card className="border-0 shadow-sm"><CardContent className="p-4 text-center">
            <p className="text-xl font-bold text-slate-900">{formatPrice(detail.totalRevenue)}</p><p className="text-[11px] text-slate-400">累計売上</p>
          </CardContent></Card>
          <Card className="border-0 shadow-sm"><CardContent className="p-4 text-center">
            <p className="text-xl font-bold text-slate-900">{detail.lastVisitAt ? new Date(detail.lastVisitAt).toLocaleDateString('ja-JP') : '-'}</p><p className="text-[11px] text-slate-400">最終来院</p>
          </CardContent></Card>
        </div>

        <Tabs defaultValue="history">
          <TabsList><TabsTrigger value="history">来院履歴</TabsTrigger><TabsTrigger value="carte">カルテ</TabsTrigger><TabsTrigger value="tickets">回数券</TabsTrigger></TabsList>
          <TabsContent value="history" className="mt-4">
            <Card className="border-0 shadow-sm"><CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {(!detail.reservations || detail.reservations.length === 0) ? (
                  <div className="py-8 text-center text-sm text-slate-400">来院履歴がありません</div>
                ) : detail.reservations.map(r => (
                  <div key={r.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="text-xs text-slate-400 w-20">{new Date(r.startsAt).toLocaleDateString('ja-JP')}</span>
                    <div className="flex-1"><p className="text-sm text-slate-900">{r.menu.name}</p><p className="text-[11px] text-slate-400">{r.staff?.name || '指名なし'}</p></div>
                    <span className="text-sm font-semibold text-slate-900">{formatPrice(r.totalPrice)}</span>
                  </div>
                ))}
              </div>
            </CardContent></Card>
          </TabsContent>
          <TabsContent value="carte" className="mt-4 space-y-3">
            {(!detail.carteRecords || detail.carteRecords.length === 0) ? (
              <Card className="border-0 shadow-sm"><CardContent className="py-8 text-center"><p className="text-sm text-slate-400">カルテがありません</p></CardContent></Card>
            ) : detail.carteRecords.map(c => (
              <Card key={c.id} className="border-0 shadow-sm"><CardContent className="p-4">
                <div className="flex justify-between mb-2"><span className="text-xs font-semibold">{new Date(c.recordedAt).toLocaleDateString('ja-JP')}</span><span className="text-xs text-slate-400">{c.staff?.name}</span></div>
                {c.memo && <p className="text-sm text-slate-700">{c.memo}</p>}
              </CardContent></Card>
            ))}
            <Button variant="outline" className="w-full" onClick={() => setShowCarteForm(true)}>+ カルテを記録する</Button>
          </TabsContent>
          <TabsContent value="tickets" className="mt-4 space-y-3">
            {(!detail.purchasedTickets || detail.purchasedTickets.length === 0) ? (
              <Card className="border-0 shadow-sm"><CardContent className="py-8 text-center"><p className="text-sm text-slate-400">回数券がありません</p></CardContent></Card>
            ) : detail.purchasedTickets.map(t => (
              <Card key={t.id} className="border-0 shadow-sm"><CardContent className="p-4 space-y-2">
                <p className="text-sm font-semibold">🎫 {t.ticketTemplate.name}</p>
                <div className="flex items-center gap-2"><Progress value={(t.remainingCount / t.ticketTemplate.totalCount) * 100} className="flex-1 h-2" /><span className="text-xs font-medium text-slate-600">{t.remainingCount}/{t.ticketTemplate.totalCount}回</span></div>
                <p className="text-xs text-slate-400">有効期限: {new Date(t.expiresAt).toLocaleDateString('ja-JP')}</p>
              </CardContent></Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* カルテ記録Sheet */}
        <Sheet open={showCarteForm} onOpenChange={setShowCarteForm}>
          <SheetContent className="w-full sm:w-[480px] overflow-y-auto px-6">
            <SheetHeader><SheetTitle>カルテを記録</SheetTitle></SheetHeader>
            <div className="space-y-5 mt-6">
              <div className="text-sm text-slate-500">患者: {detail?.name}</div>
              <div className="space-y-2">
                <Label className="text-xs">メモ・施術内容</Label>
                <Textarea value={carteMemo} onChange={e => setCarteMemo(e.target.value)} rows={6} placeholder="主訴、施術内容、次回への申し送りなど" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowCarteForm(false)}>キャンセル</Button>
                <Button className="flex-1" onClick={async () => {
                  if (!detail) return
                  const res = await fetch(`/api/customers/${detail.id}/cartes`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ templateId: null, memo: carteMemo }),
                  })
                  if (res.ok) {
                    toast.success('カルテを記録しました')
                    setShowCarteForm(false); setCarteMemo('')
                    // リロード
                    const r = await fetch(`/api/customers/${detail.id}`).then(r => r.json())
                    setDetail(r.data)
                  } else toast.error('保存に失敗しました')
                }}>保存する</Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-slate-900">患者管理</h1><p className="text-xs text-slate-400 mt-0.5">{customers.length}名</p></div>
      </div>
      <Input placeholder="名前、メール、電話で検索..." value={search} onChange={(e) => setSearch(e.target.value)} />
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <button onClick={() => setTagFilter('all')} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${tagFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>すべて</button>
        {allTags.map(tag => (
          <button key={tag} onClick={() => setTagFilter(tag)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${tagFilter === tag ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{tag}</button>
        ))}
      </div>
      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />)}</div>
      ) : (
        <Card className="border-0 shadow-sm"><CardContent className="p-0"><div className="divide-y divide-slate-100">
          {customers.map(c => (
            <button key={c.id} onClick={() => setSelectedId(c.id)} className="flex items-center gap-3 px-4 py-3 w-full text-left hover:bg-slate-50 transition-colors">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-600 shrink-0">{c.name[0]}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900">{c.name}</p>
                <p className="text-[11px] text-slate-400">{c.phone} · 来院{c.totalVisits}回 · {formatPrice(c.totalRevenue)}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                {c.tagAssignments.map(ta => (
                  <span key={ta.tag.name} className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium ${tagColors[ta.tag.name] || 'bg-slate-100 text-slate-600'}`}>{ta.tag.name}</span>
                ))}
              </div>
            </button>
          ))}
        </div></CardContent></Card>
      )}
    </div>
  )
}
