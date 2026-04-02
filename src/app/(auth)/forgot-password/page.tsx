'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    })
    if (error) toast.error(error.message)
    else setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-[400px] border-0 shadow-sm">
        <CardContent className="p-8 space-y-6">
          <div className="text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-lg mx-auto">R</div>
            {sent ? (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mx-auto mt-6">
                  <span className="material-symbols-outlined text-green-600">check</span>
                </div>
                <h1 className="text-xl font-bold text-slate-900 mt-4">送信しました</h1>
                <p className="text-sm text-slate-500 mt-2">入力されたメールアドレスにリセットリンクを送信しました。メールをご確認ください。</p>
                <Link href="/login"><Button variant="outline" className="w-full mt-6">ログインに戻る</Button></Link>
              </>
            ) : (
              <>
                <h1 className="text-xl font-bold text-slate-900 mt-4">パスワードをリセット</h1>
                <p className="text-xs text-slate-400 mt-1">登録メールアドレスにリセットリンクを送信します</p>
              </>
            )}
          </div>

          {!sent && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>メールアドレス</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="mail@example.com" required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? '送信中...' : 'リセットリンクを送信'}</Button>
              <div className="text-center"><Link href="/login" className="text-xs text-blue-600 hover:underline">← ログインに戻る</Link></div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
