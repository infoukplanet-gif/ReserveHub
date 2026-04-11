'use client'

import { useState } from 'react'
import Link from 'next/link'

const SYMPTOM_OPTIONS = ['肩こり', '腰痛', '頭痛', '骨盤矯正', '猫背矯正', '自律神経', '美容鍼', 'スポーツ障害', '冷え性', '不眠', 'むくみ', '産後ケア']

const PLANS = [
  { id: 'basic', name: 'ベーシック', price: 5000, features: ['ミナオスなびに院情報掲載', '基本情報・症状・営業時間', '口コミ受付', 'Google Maps連携'] },
  { id: 'premium', name: 'プレミアム', price: 15000, features: ['ベーシックの全機能', '検索結果で上位表示', 'カバー画像設定', '詳細な説明文', '優先サポート'] },
]

export default function ListYourClinicPage() {
  const [plan, setPlan] = useState('basic')
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', description: '' })
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const toggleSymptom = (s: string) => {
    setSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/platform/listings/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, symptoms, plan }),
    })

    const data = await res.json()
    if (data.data?.url) {
      window.location.href = data.data.url
    } else {
      alert('エラーが発生しました')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <div className="mx-auto max-w-3xl px-4 py-12 space-y-10">
        {/* ヘッダー */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold text-slate-900">ミナオスなびに院を掲載する</h1>
          <p className="text-slate-500">ReserveHubをご利用でない院でも、ミナオスなびに掲載できます</p>
        </div>

        {/* プラン選択 */}
        <div className="grid md:grid-cols-2 gap-4">
          {PLANS.map(p => (
            <button
              key={p.id}
              onClick={() => setPlan(p.id)}
              className={`text-left rounded-2xl border-2 p-6 transition-all ${
                plan === p.id ? 'border-emerald-500 bg-emerald-50/50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold text-slate-900">{p.name}</span>
                <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${plan === p.id ? 'border-emerald-500' : 'border-slate-300'}`}>
                  {plan === p.id && <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900 mb-4">
                ¥{p.price.toLocaleString()}<span className="text-sm font-normal text-slate-400">/月</span>
              </p>
              <ul className="space-y-2">
                {p.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="material-symbols-outlined text-[16px] text-emerald-500 mt-0.5">check_circle</span>
                    {f}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        {/* 申込フォーム */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
          <h2 className="text-lg font-bold text-slate-900">院情報</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600">院名 *</label>
              <input type="text" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600">メールアドレス *</label>
              <input type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600">電話番号</label>
              <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600">住所 *</label>
              <input type="text" required value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600">院の紹介文</label>
            <textarea rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 resize-none" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600">対応症状</label>
            <div className="flex flex-wrap gap-2">
              {SYMPTOM_OPTIONS.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSymptom(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    symptoms.includes(s) ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-slate-100 text-slate-600 border border-transparent hover:bg-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors">
            {loading ? '処理中...' : `${PLANS.find(p => p.id === plan)?.name}プランで申し込む（¥${PLANS.find(p => p.id === plan)?.price.toLocaleString()}/月）`}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          ReserveHubをご利用の院は<Link href="/pricing" className="text-emerald-600 hover:underline">自動で無料掲載</Link>されます
        </p>
      </div>
    </div>
  )
}
