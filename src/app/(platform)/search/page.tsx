'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

type Clinic = {
  id: string
  name: string
  slug: string
  address: string | null
  description: string | null
  logoUrl: string | null
  symptoms: string[]
  avgRating: number
  reviewCount: number
  hpSetting: { heroImageUrl: string | null; primaryColor: string } | null
}

const QUICK_SYMPTOMS = ['肩こり', '腰痛', '頭痛', '膝痛', '冷え性', '自律神経', '産後ケア', 'スポーツ障害']

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-8"><div className="h-64 bg-slate-100 rounded-xl animate-pulse" /></div>}>
      <SearchContent />
    </Suspense>
  )
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [area, setArea] = useState(searchParams.get('area') || '')
  const [symptom, setSymptom] = useState(searchParams.get('symptom') || '')

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (searchParams.get('area')) params.set('area', searchParams.get('area')!)
    if (searchParams.get('symptom')) params.set('symptom', searchParams.get('symptom')!)
    fetch(`/api/platform/search?${params}`)
      .then(r => r.json())
      .then(r => { setClinics(r.data || []); setTotal(r.total || 0); setLoading(false) })
      .catch(() => setLoading(false))
  }, [searchParams])

  const doSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (area) params.set('area', area)
    if (symptom) params.set('symptom', symptom)
    router.push(`/search?${params}`)
  }

  const quickSearch = (s: string) => {
    setSymptom(s)
    router.push(`/search?${area ? `area=${encodeURIComponent(area)}&` : ''}symptom=${encodeURIComponent(s)}`)
  }

  const activeArea = searchParams.get('area') || ''
  const activeSymptom = searchParams.get('symptom') || ''

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* 検索バー */}
      <form onSubmit={doSearch} className="mb-6">
        <div className="flex gap-0 bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-slate-400">location_on</span>
            <input value={area} onChange={e => setArea(e.target.value)} type="text" placeholder="エリア" className="search-input w-full pl-10 pr-3 py-3 text-sm border-0 outline-none bg-transparent" />
          </div>
          <div className="w-px bg-slate-100 my-2.5" />
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-slate-400">healing</span>
            <input value={symptom} onChange={e => setSymptom(e.target.value)} type="text" placeholder="症状" className="search-input w-full pl-10 pr-3 py-3 text-sm border-0 outline-none bg-transparent" />
          </div>
          <button type="submit" className="px-5 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-sm font-medium">検索</button>
        </div>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </form>

      {/* クイック症状フィルター */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-4 -mx-4 px-4">
        {QUICK_SYMPTOMS.map(s => (
          <button
            key={s}
            onClick={() => quickSearch(s)}
            className={`symptom-pill shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors ${
              activeSymptom === s
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-200 hover:text-emerald-700'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* 結果ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900">
            {activeArea || activeSymptom
              ? `「${[activeArea, activeSymptom].filter(Boolean).join(' × ')}」の整体・鍼灸院`
              : 'すべての院'}
          </h1>
          <p className="text-[11px] text-slate-400">{total}件</p>
        </div>
      </div>

      {/* 結果リスト */}
      {loading ? (
        <div className="space-y-4 stagger-children">{[1,2,3,4].map(i => (
          <div key={i} className="h-32 bg-white rounded-2xl border border-slate-100 animate-pulse" />
        ))}</div>
      ) : clinics.length === 0 ? (
        <div className="py-20 text-center animate-fade-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
            <span className="material-symbols-outlined text-[32px] text-slate-300">search_off</span>
          </div>
          <p className="text-sm text-slate-500">該当する院が見つかりませんでした</p>
          <p className="text-xs text-slate-400 mt-1">検索条件を変更してみてください</p>
        </div>
      ) : (
        <div className="space-y-3 stagger-children">
          {clinics.map(c => (
            <Link
              key={c.id}
              href={`/clinics/${c.slug}`}
              className="clinic-card flex gap-4 p-4 rounded-2xl bg-white border border-slate-100 group"
            >
              <div className="w-24 h-24 rounded-xl bg-slate-50 shrink-0 overflow-hidden">
                {c.hpSetting?.heroImageUrl ? (
                  <img src={c.hpSetting.heroImageUrl} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-slate-200">{c.name[0]}</div>
                )}
              </div>
              <div className="flex-1 min-w-0 py-0.5">
                <h2 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{c.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className={`text-xs ${s <= Math.round(c.avgRating) ? 'star-filled' : 'star-empty'}`}>★</span>
                    ))}
                  </div>
                  <span className="text-xs text-slate-400">{c.avgRating.toFixed(1)}</span>
                  <span className="text-[10px] text-slate-300">|</span>
                  <span className="text-xs text-slate-400">{c.reviewCount}件の口コミ</span>
                </div>
                {c.address && <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">location_on</span>{c.address}</p>}
                {c.symptoms.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {c.symptoms.slice(0, 4).map(s => (
                      <span key={s} className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">{s}</span>
                    ))}
                    {c.symptoms.length > 4 && <span className="text-[10px] text-slate-400">+{c.symptoms.length - 4}</span>}
                  </div>
                )}
              </div>
              <div className="flex items-center shrink-0">
                <span className="material-symbols-outlined text-[20px] text-slate-300 group-hover:text-emerald-500 transition-colors">chevron_right</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
