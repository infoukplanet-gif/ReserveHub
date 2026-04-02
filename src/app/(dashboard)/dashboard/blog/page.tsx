'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import BlockEditor from '@/components/shared/BlockEditor'
import { toast } from 'sonner'

type BlogPost = {
  id: string
  title: string
  category: string
  isPublished: boolean
  publishedAt: string | null
  content: string
}

const CATEGORIES = ['お知らせ', 'キャンペーン', 'コラム']

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<BlogPost | null>(null)

  const loadPosts = () => {
    fetch('/api/blog').then(r => r.json()).then(r => { setPosts(r.data || []); setLoading(false) }).catch(() => setLoading(false))
  }

  useEffect(() => { loadPosts() }, [])

  const saveDraft = async () => {
    if (!editing) return
    const isNew = editing.id.startsWith('new')
    const url = isNew ? '/api/blog' : `/api/blog/${editing.id}`
    const method = isNew ? 'POST' : 'PATCH'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) })
    if (res.ok) { toast.success('保存しました'); setEditing(null); loadPosts() }
    else toast.error('保存に失敗しました')
  }

  const publish = async () => {
    if (!editing) return
    const isNew = editing.id.startsWith('new')
    const url = isNew ? '/api/blog' : `/api/blog/${editing.id}`
    const method = isNew ? 'POST' : 'PATCH'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...editing, isPublished: true }) })
    if (res.ok) { toast.success('公開しました'); setEditing(null); loadPosts() }
    else toast.error('公開に失敗しました')
  }

  const openNew = () => {
    setEditing({ id: `new-${Date.now()}`, title: '', category: 'お知らせ', isPublished: false, publishedAt: null, content: '' })
  }

  // List View
  if (!editing) {
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
      </div>
    )
  }

  // Editor View — note風のフルページエディタ
  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => setEditing(null)} className="text-sm text-slate-500 hover:text-slate-900">
          ← 閉じる
        </button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={saveDraft}>
            下書き保存
          </Button>
          <Button size="sm" onClick={publish}>
            公開に進む
          </Button>
        </div>
      </div>

      {/* Thumbnail */}
      <div className="flex items-center justify-center h-28 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
        <div className="text-center">
          <span className="material-symbols-outlined text-2xl text-slate-300">add_photo_alternate</span>
          <p className="text-xs text-slate-400 mt-1">カバー画像</p>
        </div>
      </div>

      {/* Title */}
      <input
        type="text"
        value={editing.title}
        onChange={(e) => setEditing(p => p ? { ...p, title: e.target.value } : null)}
        placeholder="記事タイトル"
        className="w-full text-2xl font-bold text-slate-900 bg-transparent border-0 outline-none placeholder:text-slate-300"
      />

      {/* Category + Settings */}
      <div className="flex items-center gap-3 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => setEditing(p => p ? { ...p, category: cat } : null)} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${editing.category === cat ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {cat}
          </button>
        ))}
        <div className="w-px h-5 bg-slate-200" />
        <div className="flex items-center gap-2">
          <Switch checked={editing.isPublished} onCheckedChange={(v) => setEditing(p => p ? { ...p, isPublished: v } : null)} />
          <span className="text-xs text-slate-500">{editing.isPublished ? '公開' : '下書き'}</span>
        </div>
      </div>

      <Separator />

      {/* Block Editor */}
      <BlockEditor
        content={editing.content}
        onChange={(html) => setEditing(p => p ? { ...p, content: html } : null)}
      />
    </div>
  )
}
