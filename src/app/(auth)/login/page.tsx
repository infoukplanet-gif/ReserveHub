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

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message === 'Invalid login credentials'
        ? 'メールアドレスまたはパスワードが正しくありません'
        : error.message)
      setLoading(false)
      return
    }
    toast.success('ログインしました')
    router.push('/dashboard')
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
            <h1 className="text-xl font-bold text-slate-900 mt-4">事業者アカウントにログイン</h1>
          </div>
          <Button variant="outline" className="w-full" type="button" onClick={handleGoogleLogin}>
            Googleでログイン
          </Button>
          <div className="flex items-center gap-3">
            <Separator className="flex-1" /><span className="text-xs text-slate-400">または</span><Separator className="flex-1" />
          </div>
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label>メールアドレス</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="mail@example.com" required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>パスワード</Label>
                <Link href="/forgot-password" className="text-xs text-blue-600 hover:underline">パスワードを忘れた方</Link>
              </div>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'ログイン中...' : 'ログイン'}</Button>
          </form>
          <p className="text-center text-sm text-slate-500">アカウントをお持ちでない方 <Link href="/register" className="text-blue-600 font-medium hover:underline">新規登録</Link></p>
        </CardContent>
      </Card>
    </div>
  )
}
