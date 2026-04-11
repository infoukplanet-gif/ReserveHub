'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

type BillingStatus = {
  plan: string
  planName: string
  limits: { maxCartes: number | null; followUp: boolean; lineIntegration: boolean; themes: boolean; customCss: boolean }
  isTrial: boolean
  trialDaysLeft: number
  hasSubscription: boolean
}

const PLANS = [
  {
    id: 'light',
    name: 'ライト',
    price: 1980,
    features: ['カルテ50件', '来院予約管理', '施術メニュー管理', '患者管理', 'HP作成', 'テーマ切替'],
    notIncluded: ['フォローアップ', 'LINE連携', 'カスタムCSS'],
  },
  {
    id: 'standard',
    name: 'スタンダード',
    price: 4980,
    popular: true,
    features: ['カルテ無制限', '来院予約管理', '施術メニュー管理', '患者管理', 'HP作成', 'テーマ切替', '自動フォローアップ', 'LINE連携'],
    notIncluded: ['カスタムCSS'],
  },
  {
    id: 'pro',
    name: 'プロ',
    price: 9800,
    features: ['カルテ無制限', '来院予約管理', '施術メニュー管理', '患者管理', 'HP作成', 'テーマ切替', '自動フォローアップ', 'LINE連携', 'カスタムCSS', 'カスタムドメイン', '優先サポート'],
    notIncluded: [],
  },
]

export default function BillingPage() {
  const [status, setStatus] = useState<BillingStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/billing/status')
      .then(r => r.json())
      .then(r => { setStatus(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleCheckout = async (planId: string) => {
    setCheckoutLoading(planId)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })
      const data = await res.json()
      if (data.data?.url) {
        window.location.href = data.data.url
      } else {
        toast.error(data.message || 'エラーが発生しました')
      }
    } catch {
      toast.error('エラーが発生しました')
    } finally {
      setCheckoutLoading(null)
    }
  }

  const handlePortal = async () => {
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const data = await res.json()
      if (data.data?.url) {
        window.location.href = data.data.url
      } else {
        toast.error(data.message || 'エラーが発生しました')
      }
    } catch {
      toast.error('エラーが発生しました')
    }
  }

  if (loading) {
    return <div className="space-y-4"><div className="h-8 bg-slate-100 rounded animate-pulse w-40" /><div className="h-64 bg-slate-100 rounded-xl animate-pulse" /></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">課金プラン</h1>
        <p className="text-xs text-slate-400 mt-0.5">プランを選択して機能をアンロック</p>
      </div>

      {/* 現在のプラン */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm text-slate-500">現在のプラン</p>
                <p className="text-lg font-bold text-slate-900">{status?.planName || 'フリー'}</p>
              </div>
              {status?.isTrial && (
                <Badge className="bg-green-50 text-green-700">トライアル残り{status.trialDaysLeft}日</Badge>
              )}
            </div>
            {status?.hasSubscription && (
              <Button variant="outline" size="sm" onClick={handlePortal}>支払い管理</Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* プラン一覧 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PLANS.map(plan => {
          const isCurrent = status?.plan === plan.id
          return (
            <Card key={plan.id} className={`border-0 shadow-sm relative overflow-hidden ${plan.popular ? 'ring-2 ring-blue-600' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white">人気</Badge>
                </div>
              )}
              <CardContent className="p-5 flex flex-col h-full">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{plan.name}</h3>
                  <div className="mt-1">
                    <span className="text-2xl font-bold text-slate-900">¥{plan.price.toLocaleString()}</span>
                    <span className="text-xs text-slate-400">/月</span>
                  </div>
                </div>

                <div className="mt-4 space-y-2 flex-1">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-center gap-2 text-xs text-slate-700">
                      <span className="material-symbols-outlined text-[14px] text-green-500">check_circle</span>
                      {f}
                    </div>
                  ))}
                  {plan.notIncluded.map(f => (
                    <div key={f} className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="material-symbols-outlined text-[14px]">cancel</span>
                      {f}
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  {isCurrent ? (
                    <Button variant="outline" className="w-full" disabled>現在のプラン</Button>
                  ) : (
                    <Button
                      className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                      onClick={() => handleCheckout(plan.id)}
                      disabled={!!checkoutLoading}
                    >
                      {checkoutLoading === plan.id ? '処理中...' : 'このプランにする'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
