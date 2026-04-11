'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'

type PlatformUser = {
  id: string
  name: string
  email: string
  birthDate: string | null
  phone: string | null
  gender: string | null
  favorites: { id: string; tenantId: string | null; clinic?: { name: string; slug: string; address: string | null } | null }[]
  disclosureRules: DisclosureRule[]
}

type DisclosureRule = {
  id: string
  tenantId: string
  discloseName: boolean
  discloseBirthDate: boolean
  disclosePhone: boolean
  discloseGender: boolean
  discloseCarteData: boolean
  discloseVisitHistory: boolean
  tenant?: { name: string; slug: string } | null
}

const DISCLOSURE_ITEMS = [
  { key: 'discloseName', label: '氏名', desc: 'あなたのお名前' },
  { key: 'discloseBirthDate', label: '生年月日', desc: '年齢の把握に利用' },
  { key: 'disclosePhone', label: '電話番号', desc: '連絡先' },
  { key: 'discloseGender', label: '性別', desc: '施術の参考に利用' },
  { key: 'discloseCarteData', label: 'カルテ情報', desc: '主訴・施術部位・施術内容（院名は含まれません）' },
  { key: 'discloseVisitHistory', label: '施術履歴', desc: '過去にどの部位を診たか・問診情報（院名は開示されません）' },
] as const

export default function MyPage() {
  const [user, setUser] = useState<PlatformUser | null>(null)
  const [disclosures, setDisclosures] = useState<(DisclosureRule & { tenant?: { name: string; slug: string } | null })[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'favorites' | 'disclosure' | 'profile'>('favorites')

  useEffect(() => {
    Promise.all([
      fetch('/api/platform/user').then(r => r.json()),
      fetch('/api/platform/user/disclosure').then(r => r.json()),
    ]).then(([userData, discData]) => {
      setUser(userData.data)
      setDisclosures(discData.data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const toggleDisclosure = async (tenantId: string, key: string, value: boolean) => {
    const res = await fetch('/api/platform/user/disclosure', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, [key]: value }),
    })
    if (res.ok) {
      setDisclosures(prev => prev.map(d =>
        d.tenantId === tenantId ? { ...d, [key]: value } : d
      ))
      toast.success('開示設定を更新しました')
    }
  }

  const removeFavorite = async (tenantId: string) => {
    await fetch(`/api/platform/user/favorites?tenantId=${tenantId}`, { method: 'DELETE' })
    setUser(prev => prev ? { ...prev, favorites: prev.favorites.filter(f => f.tenantId !== tenantId) } : null)
    toast.success('お気に入りを解除しました')
  }

  if (loading) return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
    </div>
  )

  if (!user) return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
        <span className="material-symbols-outlined text-[32px] text-slate-300">person</span>
      </div>
      <p className="text-sm text-slate-500">ログインが必要です</p>
      <Link href="/platform-login" className="inline-flex items-center mt-4 px-6 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700">ログイン</Link>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
    </div>
  )

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      {/* ヘッダー */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center text-xl font-bold text-emerald-600">
          {user.name[0]}
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">{user.name}</h1>
          <p className="text-xs text-slate-400">{user.email}</p>
        </div>
      </div>

      {/* タブ */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
        {[
          { id: 'favorites' as const, label: 'お気に入り', icon: 'favorite' },
          { id: 'disclosure' as const, label: '情報開示設定', icon: 'shield_person' },
          { id: 'profile' as const, label: 'プロフィール', icon: 'person' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* お気に入り */}
      {activeTab === 'favorites' && (
        <div className="space-y-3 animate-fade-in">
          {user.favorites.length === 0 ? (
            <div className="py-12 text-center rounded-2xl bg-white border border-slate-100">
              <span className="material-symbols-outlined text-[40px] text-slate-200">favorite_border</span>
              <p className="text-sm text-slate-400 mt-2">お気に入りの院がありません</p>
              <Link href="/search" className="inline-flex items-center mt-3 text-xs text-emerald-600 hover:underline">院を探す →</Link>
            </div>
          ) : (
            user.favorites.map(fav => fav.clinic && (
              <div key={fav.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 clinic-card">
                <div className="flex-1">
                  <Link href={`/clinics/${fav.clinic.slug}`} className="text-sm font-semibold text-slate-900 hover:text-emerald-700">{fav.clinic.name}</Link>
                  {fav.clinic.address && <p className="text-xs text-slate-400 mt-0.5">{fav.clinic.address}</p>}
                </div>
                <button onClick={() => fav.tenantId && removeFavorite(fav.tenantId)} className="p-2 rounded-lg hover:bg-red-50 transition-colors">
                  <span className="material-symbols-outlined text-[20px] text-red-400">favorite</span>
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* 情報開示設定 */}
      {activeTab === 'disclosure' && (
        <div className="space-y-6 animate-fade-in">
          <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
            <p className="text-xs font-medium text-emerald-800">情報開示について</p>
            <p className="text-[11px] text-emerald-600 mt-1 leading-relaxed">
              院を変更する際、過去のカルテ情報や来院履歴を新しい院に引き継ぐことができます。
              どの情報を開示するかは、院ごとに細かく設定できます。いつでもオフに戻せます。
            </p>
          </div>

          {disclosures.length === 0 ? (
            <div className="py-12 text-center rounded-2xl bg-white border border-slate-100">
              <span className="material-symbols-outlined text-[40px] text-slate-200">shield_person</span>
              <p className="text-sm text-slate-400 mt-2">開示設定はまだありません</p>
              <p className="text-xs text-slate-400 mt-1">院を来院すると自動で設定画面が表示されます</p>
            </div>
          ) : (
            disclosures.map(disc => (
              <div key={disc.id} className="rounded-2xl bg-white border border-slate-100 overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
                  <p className="text-sm font-semibold text-slate-900">{disc.tenant?.name || '不明な院'}</p>
                </div>
                <div className="p-5 space-y-3">
                  {DISCLOSURE_ITEMS.map(item => {
                    const checked = disc[item.key as keyof typeof disc] as boolean
                    return (
                      <label key={item.key} className="flex items-center justify-between py-1 cursor-pointer group">
                        <div>
                          <p className="text-sm text-slate-700 group-hover:text-slate-900">{item.label}</p>
                          <p className="text-[10px] text-slate-400">{item.desc}</p>
                        </div>
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={e => toggleDisclosure(disc.tenantId, item.key, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-6 bg-slate-200 rounded-full peer-checked:bg-emerald-500 transition-colors" />
                          <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm peer-checked:translate-x-4 transition-transform" />
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* プロフィール */}
      {activeTab === 'profile' && (
        <div className="animate-fade-in">
          <div className="rounded-2xl bg-white border border-slate-100 p-5 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600">お名前</label>
              <input defaultValue={user.name} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600">メールアドレス</label>
              <input value={user.email} disabled className="w-full rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-400" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600">生年月日</label>
                <input type="date" defaultValue={user.birthDate?.split('T')[0] || ''} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600">性別</label>
                <select defaultValue={user.gender || ''} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none">
                  <option value="">未選択</option>
                  <option value="male">男性</option>
                  <option value="female">女性</option>
                  <option value="other">その他</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-600">電話番号</label>
              <input type="tel" defaultValue={user.phone || ''} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none" />
            </div>
            <button className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors">
              保存する
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
