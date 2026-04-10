import Link from 'next/link'
import './platform.css'

export const metadata = {
  title: 'ミナオスなび — 整体・鍼灸院を探す',
  description: 'あなたの街の整体院・鍼灸院を症状やエリアから検索。口コミ・評価で安心の院選び。',
}

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#fafbfc]">
      {/* ヘッダー */}
      <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-4 h-14">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-sm font-bold shadow-sm shadow-emerald-200 group-hover:shadow-md group-hover:shadow-emerald-200 transition-shadow">
              M
            </div>
            <span className="font-bold text-slate-900 tracking-tight">ミナオスなび</span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link href="/search" className="px-3 py-1.5 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">院を探す</Link>
            <Link href="/pricing" className="px-3 py-1.5 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">掲載について</Link>
            <Link href="/login" className="ml-2 px-4 py-1.5 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm">ログイン</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* フッター */}
      <footer className="border-t border-slate-200/60 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="grid sm:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-[10px] font-bold">M</div>
                <span className="text-sm font-bold text-slate-900">ミナオスなび</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">あなたに合った整体・鍼灸院を見つけるプラットフォーム</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900 mb-2">患者さまへ</p>
              <div className="space-y-1.5">
                <Link href="/search" className="block text-xs text-slate-500 hover:text-emerald-600">院を探す</Link>
                <Link href="/search?symptom=腰痛" className="block text-xs text-slate-500 hover:text-emerald-600">症状から探す</Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900 mb-2">院の方へ</p>
              <div className="space-y-1.5">
                <Link href="/pricing" className="block text-xs text-slate-500 hover:text-emerald-600">掲載プラン</Link>
                <Link href="/register" className="block text-xs text-slate-500 hover:text-emerald-600">ReserveHubに登録（無料掲載）</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-100 mt-8 pt-6 text-center">
            <p className="text-[10px] text-slate-400">Powered by ReserveHub</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
