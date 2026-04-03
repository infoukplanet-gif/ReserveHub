import Link from 'next/link'

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-slate-900">ReserveHub</Link>
          <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900">ログイン</Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-12">
        {children}
      </main>
      <footer className="py-8 px-6 border-t border-slate-100">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-sm text-slate-400">
          <span>&copy; 2026 ReserveHub</span>
          <nav className="flex gap-6">
            <Link href="/terms" className="hover:text-slate-600">利用規約</Link>
            <Link href="/privacy" className="hover:text-slate-600">プライバシーポリシー</Link>
            <Link href="/pricing" className="hover:text-slate-600">料金</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
