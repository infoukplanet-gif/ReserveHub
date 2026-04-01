'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

export default function RegisterPage() {
  const [form, setForm] = useState({ shopName: '', name: '', email: '', password: '' })
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // TODO: Supabase Auth
    setTimeout(() => setLoading(false), 1000)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-[400px] border-0 shadow-sm">
        <CardContent className="p-8 space-y-6">
          <div className="text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-lg mx-auto">
              R
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-4">アカウントを作成</h1>
            <p className="text-xs text-slate-400 mt-1">無料で始められます</p>
          </div>

          <Button variant="outline" className="w-full" type="button">
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Googleで登録
          </Button>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-slate-400">または</span>
            <Separator className="flex-1" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>店舗名 *</Label>
              <Input value={form.shopName} onChange={(e) => setForm(p => ({ ...p, shopName: e.target.value }))} placeholder="例: リラクゼーションサロン BLOOM" />
            </div>
            <div className="space-y-2">
              <Label>お名前 *</Label>
              <Input value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} placeholder="大野 勇樹" />
            </div>
            <div className="space-y-2">
              <Label>メールアドレス *</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} placeholder="mail@example.com" />
            </div>
            <div className="space-y-2">
              <Label>パスワード *</Label>
              <Input type="password" value={form.password} onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))} />
              <p className="text-xs text-slate-400">8文字以上</p>
            </div>
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 rounded border-slate-300" />
              <span className="text-xs text-slate-500">
                <a href="#" className="text-blue-600 hover:underline">利用規約</a>に同意する
              </span>
            </label>
            <Button type="submit" className="w-full" disabled={loading || !agreed}>
              {loading ? '作成中...' : 'アカウントを作成'}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500">
            既にアカウントをお持ちの方{' '}
            <Link href="/login" className="text-blue-600 font-medium hover:underline">ログイン</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
