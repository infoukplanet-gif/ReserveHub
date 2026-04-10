'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

type Review = {
  id: string
  authorName: string
  rating: number
  title: string | null
  content: string
  isApproved: boolean
  isPublished: boolean
  createdAt: string
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  const fetchReviews = () => {
    fetch('/api/reviews').then(r => r.json()).then(r => { setReviews(r.data || []); setLoading(false) }).catch(() => setLoading(false))
  }

  useEffect(() => { fetchReviews() }, [])

  const updateReview = async (id: string, data: Partial<Review>) => {
    const res = await fetch(`/api/reviews/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      toast.success('更新しました')
      fetchReviews()
    } else toast.error('更新に失敗しました')
  }

  const deleteReview = async (id: string) => {
    if (!confirm('この口コミを削除しますか？')) return
    const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('削除しました'); fetchReviews() }
    else toast.error('削除に失敗しました')
  }

  if (loading) return <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />

  const pending = reviews.filter(r => !r.isApproved)
  const published = reviews.filter(r => r.isPublished)
  const hidden = reviews.filter(r => r.isApproved && !r.isPublished)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">口コミ管理</h1>
        <p className="text-xs text-slate-400 mt-0.5">ミナオスなびに投稿された口コミを管理</p>
      </div>

      {/* 承認待ち */}
      {pending.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            承認待ち <Badge className="bg-amber-50 text-amber-700">{pending.length}</Badge>
          </h2>
          <div className="space-y-3">
            {pending.map(r => (
              <ReviewCard key={r.id} review={r} onApprove={() => updateReview(r.id, { isApproved: true, isPublished: true })} onReject={() => deleteReview(r.id)} />
            ))}
          </div>
        </div>
      )}

      {/* 公開中 */}
      <div>
        <h2 className="text-sm font-semibold text-slate-900 mb-3">公開中 ({published.length})</h2>
        {published.length === 0 ? (
          <Card className="border-0 shadow-sm"><CardContent className="py-8 text-center"><p className="text-sm text-slate-400">公開中の口コミはありません</p></CardContent></Card>
        ) : (
          <div className="space-y-3">
            {published.map(r => (
              <ReviewCard key={r.id} review={r} onHide={() => updateReview(r.id, { isPublished: false })} onDelete={() => deleteReview(r.id)} />
            ))}
          </div>
        )}
      </div>

      {/* 非公開 */}
      {hidden.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-900 mb-3">非公開 ({hidden.length})</h2>
          <div className="space-y-3">
            {hidden.map(r => (
              <ReviewCard key={r.id} review={r} onPublish={() => updateReview(r.id, { isPublished: true })} onDelete={() => deleteReview(r.id)} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ReviewCard({ review, onApprove, onReject, onHide, onPublish, onDelete }: {
  review: Review
  onApprove?: () => void
  onReject?: () => void
  onHide?: () => void
  onPublish?: () => void
  onDelete?: () => void
}) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="flex">{[1,2,3,4,5].map(s => <span key={s} className={`text-xs ${s <= review.rating ? 'text-amber-400' : 'text-slate-200'}`}>★</span>)}</div>
              <span className="text-xs font-medium text-slate-700">{review.authorName}</span>
              <span className="text-[10px] text-slate-400">{new Date(review.createdAt).toLocaleDateString('ja-JP')}</span>
            </div>
            {review.title && <p className="text-sm font-medium text-slate-900 mt-1">{review.title}</p>}
            <p className="text-sm text-slate-600 mt-1">{review.content}</p>
          </div>
          <div className="flex gap-1 shrink-0">
            {onApprove && <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={onApprove}>承認</Button>}
            {onReject && <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={onReject}>却下</Button>}
            {onPublish && <Button size="sm" variant="outline" onClick={onPublish}>公開する</Button>}
            {onHide && <Button size="sm" variant="outline" onClick={onHide}>非公開</Button>}
            {onDelete && (
              <button onClick={onDelete} className="p-1.5 rounded hover:bg-red-50">
                <span className="material-symbols-outlined text-[16px] text-slate-400 hover:text-red-500">delete</span>
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
