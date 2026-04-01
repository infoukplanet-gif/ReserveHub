'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'

const MOCK_CUSTOMERS = [
  { id: '1', name: '山田 太郎', kana: 'ヤマダ タロウ', email: 'yamada@example.com', phone: '090-1234-5678', visits: 24, revenue: 192000, lastVisit: '2026/3/28', tags: ['VIP', '回数券保有'], cartes: [
    { date: '2026/3/28', staff: '山田 花子', chief: '肩こりがひどい', parts: ['肩', '首'], painLevel: 7, content: '肩甲骨周りを重点的に施術', next: '腰も重点的に' },
    { date: '2026/3/14', staff: '佐藤 健太', chief: '定期メンテナンス', parts: ['肩', '背中'], painLevel: 4, content: '全体的にほぐし', next: '' },
  ], tickets: [{ name: '60分コース10回券', remaining: 5, total: 10, expires: '2026/7/15' }] },
  { id: '2', name: '佐藤 花子', kana: 'サトウ ハナコ', email: 'sato@example.com', phone: '080-2345-6789', visits: 12, revenue: 96000, lastVisit: '2026/3/25', tags: ['回数券保有'], cartes: [], tickets: [{ name: '60分コース10回券', remaining: 2, total: 10, expires: '2026/4/15' }] },
  { id: '3', name: '田中 一郎', kana: 'タナカ イチロウ', email: 'tanaka@example.com', phone: '070-3456-7890', visits: 3, revenue: 24000, lastVisit: '2026/3/20', tags: ['新規'], cartes: [], tickets: [] },
  { id: '4', name: '鈴木 美咲', kana: 'スズキ ミサキ', email: 'suzuki@example.com', phone: '090-4567-8901', visits: 8, revenue: 52000, lastVisit: '2026/2/14', tags: ['離脱リスク'], cartes: [], tickets: [] },
]

const tagColors: Record<string, string> = {
  'VIP': 'bg-violet-50 text-violet-700',
  '回数券保有': 'bg-blue-50 text-blue-700',
  '新規': 'bg-green-50 text-green-700',
  '離脱リスク': 'bg-amber-50 text-amber-700',
}

function formatPrice(price: number) {
  return `¥${price.toLocaleString()}`
}

export default function CustomersPage() {
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [tagFilter, setTagFilter] = useState('all')

  const allTags = Array.from(new Set(MOCK_CUSTOMERS.flatMap((c) => c.tags)))
  const filtered = MOCK_CUSTOMERS.filter((c) => {
    const matchSearch = !search || c.name.includes(search) || c.phone.includes(search) || c.email.includes(search)
    const matchTag = tagFilter === 'all' || c.tags.includes(tagFilter)
    return matchSearch && matchTag
  })
  const selected = MOCK_CUSTOMERS.find((c) => c.id === selectedId)

  if (selected) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => setSelectedId(null)}>← 顧客一覧</Button>

        {/* Customer Header */}
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-xl font-bold text-blue-600">
            {selected.name[0]}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{selected.name}</h1>
            <p className="text-xs text-slate-400">{selected.kana}</p>
            <div className="flex gap-1.5 mt-1">
              {selected.tags.map((tag) => (
                <span key={tag} className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${tagColors[tag] || 'bg-slate-100 text-slate-600'}`}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Contact */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 space-y-2 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <span className="material-symbols-outlined text-[16px] text-slate-400">mail</span>
              {selected.email}
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <span className="material-symbols-outlined text-[16px] text-slate-400">phone</span>
              {selected.phone}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-0 shadow-sm"><CardContent className="p-4 text-center">
            <p className="text-xl font-bold text-slate-900">{selected.visits}回</p>
            <p className="text-[11px] text-slate-400">来店回数</p>
          </CardContent></Card>
          <Card className="border-0 shadow-sm"><CardContent className="p-4 text-center">
            <p className="text-xl font-bold text-slate-900">{formatPrice(selected.revenue)}</p>
            <p className="text-[11px] text-slate-400">累計売上</p>
          </CardContent></Card>
          <Card className="border-0 shadow-sm"><CardContent className="p-4 text-center">
            <p className="text-xl font-bold text-slate-900">{selected.lastVisit}</p>
            <p className="text-[11px] text-slate-400">最終来店</p>
          </CardContent></Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="carte">
          <TabsList>
            <TabsTrigger value="history">来店履歴</TabsTrigger>
            <TabsTrigger value="carte">カルテ</TabsTrigger>
            <TabsTrigger value="tickets">回数券</TabsTrigger>
          </TabsList>

          <TabsContent value="carte" className="mt-4 space-y-3">
            {selected.cartes.length === 0 ? (
              <Card className="border-0 shadow-sm"><CardContent className="py-8 text-center">
                <span className="material-symbols-outlined text-4xl text-slate-300">medical_information</span>
                <p className="text-sm text-slate-400 mt-2">カルテがまだありません</p>
              </CardContent></Card>
            ) : (
              selected.cartes.map((carte, i) => (
                <Card key={i} className="border-0 shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-900">{carte.date}</p>
                      <p className="text-xs text-slate-400">担当: {carte.staff}</p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-xs text-slate-400">主訴:</span>
                        <span className="ml-2 text-slate-900">{carte.chief}</span>
                      </div>
                      <div className="flex gap-1.5">
                        {carte.parts.map((p) => (
                          <Badge key={p} variant="secondary" className="text-[10px]">{p}</Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">痛み:</span>
                        <Progress value={carte.painLevel * 10} className="flex-1 h-2" />
                        <span className="text-xs font-medium text-slate-600">{carte.painLevel}/10</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400">施術:</span>
                        <span className="ml-2 text-slate-700">{carte.content}</span>
                      </div>
                      {carte.next && (
                        <div>
                          <span className="text-xs text-slate-400">次回:</span>
                          <span className="ml-2 text-slate-700">{carte.next}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
            <Button variant="outline" className="w-full">+ カルテを記録する</Button>
          </TabsContent>

          <TabsContent value="tickets" className="mt-4 space-y-3">
            {selected.tickets.length === 0 ? (
              <Card className="border-0 shadow-sm"><CardContent className="py-8 text-center">
                <span className="material-symbols-outlined text-4xl text-slate-300">confirmation_number</span>
                <p className="text-sm text-slate-400 mt-2">回数券がありません</p>
              </CardContent></Card>
            ) : (
              selected.tickets.map((ticket, i) => (
                <Card key={i} className="border-0 shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    <p className="text-sm font-semibold text-slate-900">🎫 {ticket.name}</p>
                    <div className="flex items-center gap-2">
                      <Progress value={(ticket.remaining / ticket.total) * 100} className="flex-1 h-2" />
                      <span className="text-xs font-medium text-slate-600">{ticket.remaining}/{ticket.total}回</span>
                    </div>
                    <p className="text-xs text-slate-400">有効期限: {ticket.expires}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <Card className="border-0 shadow-sm"><CardContent className="py-8 text-center">
              <p className="text-sm text-slate-400">来店履歴はAPI接続後に表示されます</p>
            </CardContent></Card>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">顧客管理</h1>
          <p className="text-xs text-slate-400 mt-0.5">{MOCK_CUSTOMERS.length}名</p>
        </div>
        <Button variant="outline" size="sm">CSVエクスポート</Button>
      </div>

      {/* Search */}
      <Input
        placeholder="名前、メール、電話で検索..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Tag Filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <button onClick={() => setTagFilter('all')} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${tagFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
          すべて
        </button>
        {allTags.map((tag) => (
          <button key={tag} onClick={() => setTagFilter(tag)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${tagFilter === tag ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {tag}
          </button>
        ))}
      </div>

      {/* Customer List */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {filtered.map((c) => (
              <button key={c.id} onClick={() => setSelectedId(c.id)} className="flex items-center gap-3 px-4 py-3 w-full text-left hover:bg-slate-50 transition-colors">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-600 shrink-0">
                  {c.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{c.name}</p>
                  <p className="text-[11px] text-slate-400">{c.phone} · 来店{c.visits}回 · {formatPrice(c.revenue)}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <p className="text-[11px] text-slate-400">{c.lastVisit}</p>
                  <div className="flex gap-1">
                    {c.tags.map((tag) => (
                      <span key={tag} className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium ${tagColors[tag] || 'bg-slate-100 text-slate-600'}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
