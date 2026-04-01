'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { toast } from 'sonner'

type BlogPost = {
  id: string
  title: string
  category: string
  isPublished: boolean
  publishedAt: string | null
  content: string
}

const MOCK_POSTS: BlogPost[] = [
  { id: '1', title: 'GW期間の営業時間について', category: 'お知らせ', isPublished: true, publishedAt: '2026/04/01', content: 'いつもBLOOMをご利用いただきありがとうございます。GW期間の営業時間をお知らせします...' },
  { id: '2', title: '春のキャンペーン情報', category: 'キャンペーン', isPublished: false, publishedAt: null, content: '春限定のキャンペーンを実施します...' },
  { id: '3', title: '新メニュー追加のお知らせ', category: 'お知らせ', isPublished: true, publishedAt: '2026/03/15', content: '新しいメニュー「プレミアム全身120分コース」を追加しました...' },
]

const CATEGORIES = ['お知らせ', 'キャンペーン', 'コラム']

export default function BlogPage() {
  const [posts] = useState(MOCK_POSTS)
  const [editing, setEditing] = useState<BlogPost | null>(null)

  const openNew = () => {
    setEditing({ id: `new-${Date.now()}`, title: '', category: 'お知らせ', isPublished: false, publishedAt: null, content: '' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">ブログ管理</h1>
          <p className="text-xs text-slate-400 mt-0.5">{posts.length}件の記事</p>
        </div>
        <Button onClick={openNew}>+ 記事を作成</Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {posts.map((post) => (
              <button key={post.id} onClick={() => setEditing(post)} className="flex items-center gap-3 px-4 py-3 w-full text-left hover:bg-slate-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{post.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-[10px]">{post.category}</Badge>
                    <span className="text-[11px] text-slate-400">{post.publishedAt || '未公開'}</span>
                  </div>
                </div>
                <Badge variant="secondary" className={`text-[10px] ${post.isPublished ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  {post.isPublished ? '公開中' : '下書き'}
                </Badge>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Sheet */}
      <Sheet open={!!editing} onOpenChange={() => setEditing(null)}>
        <SheetContent className="w-full sm:w-[560px] overflow-y-auto">
          {editing && (
            <>
              <SheetHeader>
                <SheetTitle>{editing.id.startsWith('new') ? '記事を作成' : '記事を編集'}</SheetTitle>
              </SheetHeader>
              <div className="space-y-5 mt-6">
                <div className="space-y-2">
                  <Label className="text-xs">タイトル *</Label>
                  <Input value={editing.title} onChange={(e) => setEditing(p => p ? { ...p, title: e.target.value } : null)} placeholder="記事タイトル" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">カテゴリ</Label>
                  <div className="flex gap-1.5">
                    {CATEGORIES.map((cat) => (
                      <button key={cat} onClick={() => setEditing(p => p ? { ...p, category: cat } : null)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${editing.category === cat ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">サムネイル画像</Label>
                  <div className="flex items-center justify-center h-24 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100">
                    <span className="text-xs text-slate-400">画像をアップロード</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">本文</Label>
                  <Textarea value={editing.content} onChange={(e) => setEditing(p => p ? { ...p, content: e.target.value } : null)} rows={10} placeholder="記事の本文..." />
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Switch checked={editing.isPublished} onCheckedChange={(v) => setEditing(p => p ? { ...p, isPublished: v } : null)} />
                  <Label className="text-xs">公開する</Label>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setEditing(null)}>キャンセル</Button>
                  <Button className="flex-1" onClick={() => { toast.success('保存しました'); setEditing(null) }}>保存する</Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
