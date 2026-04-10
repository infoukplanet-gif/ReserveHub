'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

type Review = {
  id: string
  authorName: string
  rating: number
  title: string | null
  content: string
  createdAt: string
}

export default function ClinicReviewsPage() {
  const params = useParams()
  const slug = params.slug as string
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ authorName: '', rating: 5, title: '', content: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch(`/api/platform/clinics/${slug}/reviews`)
      .then(r => r.json())
      .then(r => { setReviews(r.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [slug])

  const handleSubmit = async () => {
    if (!form.authorName.trim() || !form.content.trim()) {
      toast.error('お名前と口コミ内容は必須です')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`/api/platform/clinics/${slug}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        toast.success('口コミを投稿しました（承認後に公開されます）')
        setShowForm(false)
        setForm({ authorName: '', rating: 5, title: '', content: '' })
      } else {
        const err = await res.json()
        toast.error(err.message || '投稿に失敗しました')
      }
    } catch {
      toast.error('投稿に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href={`/clinics/${slug}`} className="text-xs text-green-600 hover:underline">← 院の詳細に戻る</Link>
          <h1 className="text-xl font-bold text-slate-900 mt-1">口コミ一覧</h1>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
          口コミを書く
        </button>
      </div>

      {/* 投稿フォーム */}
      {showForm && (
        <div className="rounded-xl border-2 border-green-200 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">口コミを投稿</h3>
          <div className="space-y-2">
            <label className="text-xs text-slate-600">お名前 *</label>
            <input value={form.authorName} onChange={e => setForm(p => ({ ...p, authorName: e.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none" placeholder="表示名" />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-slate-600">評価 *</label>
            <div className="flex gap-1">{[1,2,3,4,5].map(s => (
              <button key={s} onClick={() => setForm(p => ({ ...p, rating: s }))} className={`text-xl ${s <= form.rating ? 'text-amber-400' : 'text-slate-200'}`}>★</button>
            ))}</div>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-slate-600">タイトル</label>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-slate-600">口コミ内容 *</label>
            <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={4} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none resize-none" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50">キャンセル</button>
            <button onClick={handleSubmit} disabled={submitting} className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50">
              {submitting ? '投稿中...' : '投稿する'}
            </button>
          </div>
        </div>
      )}

      {/* 口コミ一覧 */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />)}</div>
      ) : reviews.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-slate-400">まだ口コミがありません</p>
          <p className="text-xs text-slate-400 mt-1">最初の口コミを投稿しましょう</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map(r => (
            <div key={r.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex">{[1,2,3,4,5].map(s => <span key={s} className={`text-xs ${s <= r.rating ? 'text-amber-400' : 'text-slate-200'}`}>★</span>)}</div>
                  <span className="text-xs font-medium text-slate-700">{r.authorName}</span>
                </div>
                <span className="text-[10px] text-slate-400">{new Date(r.createdAt).toLocaleDateString('ja-JP')}</span>
              </div>
              {r.title && <p className="text-sm font-medium text-slate-900 mt-2">{r.title}</p>}
              <p className="text-sm text-slate-600 mt-1">{r.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
