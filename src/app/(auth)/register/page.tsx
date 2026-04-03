'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function RegisterPage() {
  const [form, setForm] = useState({ shopName: '', name: '', email: '', password: '' })
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreed) { toast.error('利用規約に同意してください'); return }
    if (form.password.length < 8) { toast.error('パスワードは8文字以上です'); return }
    setLoading(true)

    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.name, shop_name: form.shopName } },
    })

    if (signUpError) { toast.error(signUpError.message); setLoading(false); return }

    // メール確認不要の場合（開発環境など）、そのままサインインしてテナント作成
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (signInError) {
      // サインイン失敗 = メール確認が必要
      toast.success('アカウントを作成しました。メールを確認してください。')
      setLoading(false)
      router.push('/login')
      return
    }

    // サインイン成功 → テナント作成APIを呼ぶ
    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.shopName }),
      })
      if (!res.ok) {
        const body = await res.json() as { error?: string }
        throw new Error(body.error || 'テナント作成に失敗しました')
      }
      toast.success('アカウントを作成しました')
      router.push('/dashboard')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'テナント作成に失敗しました'
      toast.error(message)
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) toast.error(error.message)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-[400px] border-0 shadow-sm">
        <CardContent className="p-8 space-y-6">
          <div className="text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-lg mx-auto">R</div>
            <h1 className="text-xl font-bold text-slate-900 mt-4">アカウントを作成</h1>
            <p className="text-xs text-slate-400 mt-1">無料で始められます</p>
          </div>
          <Button variant="outline" className="w-full" type="button" onClick={handleGoogleLogin}>Googleで登録</Button>
          <div className="flex items-center gap-3">
            <Separator className="flex-1" /><span className="text-xs text-slate-400">または</span><Separator className="flex-1" />
          </div>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2"><Label>店舗名 *</Label><Input value={form.shopName} onChange={(e) => setForm(p => ({ ...p, shopName: e.target.value }))} placeholder="例: リラクゼーションサロン BLOOM" required /></div>
            <div className="space-y-2"><Label>お名前 *</Label><Input value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} placeholder="大野 勇樹" required /></div>
            <div className="space-y-2"><Label>メールアドレス *</Label><Input type="email" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} placeholder="mail@example.com" required /></div>
            <div className="space-y-2"><Label>パスワード *</Label><Input type="password" value={form.password} onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))} required /><p className="text-xs text-slate-400">8文字以上</p></div>
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 rounded border-slate-300" />
              <span className="text-xs text-slate-500"><a href="#" className="text-blue-600 hover:underline">利用規約</a>に同意する</span>
            </label>
            <Button type="submit" className="w-full" disabled={loading || !agreed}>{loading ? '作成中...' : 'アカウントを作成'}</Button>
          </form>
          <p className="text-center text-sm text-slate-500">既にアカウントをお持ちの方 <Link href="/login" className="text-blue-600 font-medium hover:underline">ログイン</Link></p>
        </CardContent>
      </Card>
    </div>
  )
}
