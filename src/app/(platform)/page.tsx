import Link from 'next/link'

const POPULAR_SYMPTOMS = [
  { label: '肩こり', icon: '🦴' },
  { label: '腰痛', icon: '💪' },
  { label: '頭痛', icon: '🧠' },
  { label: '膝痛', icon: '🦵' },
  { label: '冷え性', icon: '❄️' },
  { label: '自律神経', icon: '🌿' },
  { label: '産後ケア', icon: '👶' },
  { label: 'スポーツ障害', icon: '⚡' },
]

const POPULAR_AREAS = ['東京', '大阪', '名古屋', '福岡', '札幌', '横浜', '神戸', '京都']

const FEATURES = [
  { title: '口コミで選べる', desc: '実際に通った方のリアルな声で院を比較', icon: 'reviews' },
  { title: '症状で検索', desc: 'あなたの症状に対応できる院を瞬時に発見', icon: 'search' },
  { title: 'そのまま予約', desc: '気に入った院をそのままオンライン予約', icon: 'calendar_month' },
]

export default function PlatformTopPage() {
  return (
    <div>
      {/* ヒーロー */}
      <section className="hero-mesh relative overflow-hidden py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 mb-6">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
            <span className="text-xs font-medium text-emerald-700">全国の整体・鍼灸院を掲載中</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            あなたに合った<br className="sm:hidden" />
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">整体・鍼灸院</span>
            を見つけよう
          </h1>
          <p className="mt-4 text-slate-500 text-base sm:text-lg max-w-xl mx-auto">
            症状やエリアから、口コミで評判の院を検索。そのまま予約もできます。
          </p>

          {/* 検索フォーム */}
          <form action="/search" method="GET" className="mt-8 relative">
            <div className="flex gap-0 bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/60 overflow-hidden max-w-2xl mx-auto">
              <div className="flex-1 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-slate-400">location_on</span>
                <input
                  name="area"
                  type="text"
                  placeholder="エリア（例: 渋谷、大阪市）"
                  className="search-input w-full pl-11 pr-4 py-4 text-sm border-0 outline-none bg-transparent"
                />
              </div>
              <div className="w-px bg-slate-100 my-3" />
              <div className="flex-1 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-slate-400">healing</span>
                <input
                  name="symptom"
                  type="text"
                  placeholder="症状（例: 腰痛、肩こり）"
                  className="search-input w-full pl-11 pr-4 py-4 text-sm border-0 outline-none bg-transparent"
                />
              </div>
              <button type="submit" className="px-6 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-2 font-medium text-sm shrink-0">
                <span className="material-symbols-outlined text-[20px]">search</span>
                <span className="hidden sm:inline">検索</span>
              </button>
            </div>
          </form>
        </div>

        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </section>

      {/* 使い方 */}
      <section className="py-16 border-b border-slate-100">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid sm:grid-cols-3 gap-6 stagger-children">
            {FEATURES.map(f => (
              <div key={f.title} className="text-center p-6 rounded-2xl bg-white border border-slate-100 hover:border-emerald-100 hover:shadow-sm transition-all">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 mb-4">
                  <span className="material-symbols-outlined text-[24px] text-emerald-600">{f.icon}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{f.title}</h3>
                <p className="text-xs text-slate-500 mt-1.5">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 症状から探す */}
      <section className="py-16 border-b border-slate-100">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-lg font-bold text-slate-900 mb-1">症状から探す</h2>
          <p className="text-xs text-slate-400 mb-6">気になる症状をタップして、対応できる院を検索</p>
          <div className="flex flex-wrap gap-2.5 stagger-children">
            {POPULAR_SYMPTOMS.map(s => (
              <Link
                key={s.label}
                href={`/search?symptom=${encodeURIComponent(s.label)}`}
                className="symptom-pill flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-colors shadow-sm"
              >
                <span className="text-base">{s.icon}</span>
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* エリアから探す */}
      <section className="py-16 border-b border-slate-100">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-lg font-bold text-slate-900 mb-1">エリアから探す</h2>
          <p className="text-xs text-slate-400 mb-6">主要都市から人気の院を検索</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 stagger-children">
            {POPULAR_AREAS.map(a => (
              <Link
                key={a}
                href={`/search?area=${encodeURIComponent(a)}`}
                className="group rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center hover:border-emerald-200 hover:shadow-sm transition-all"
              >
                <span className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">{a}</span>
                <span className="block text-[10px] text-slate-400 mt-0.5 group-hover:text-emerald-500">の整体・鍼灸院</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 院の方向けCTA */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-xl font-bold text-slate-900">院を経営されている方へ</h2>
          <p className="text-sm text-slate-500 mt-2">ミナオスなびに掲載して、新規患者を獲得しませんか？</p>
          <div className="grid sm:grid-cols-2 gap-4 mt-8 max-w-xl mx-auto">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 text-left">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 rounded-full px-2 py-0.5">無料</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">ReserveHub利用者</h3>
              <p className="text-xs text-slate-500 mt-1">ReserveHubをご利用中の院は、自動で掲載されます。追加費用は一切かかりません。</p>
              <Link href="/register" className="inline-flex items-center text-xs font-medium text-emerald-600 mt-3 hover:underline">
                ReserveHubに登録する →
              </Link>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-left">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-slate-600 bg-slate-100 rounded-full px-2 py-0.5">有料掲載</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">他システムご利用中の院</h3>
              <p className="text-xs text-slate-500 mt-1">月額2,980円〜でミナオスなびに掲載可能。予約システムの変更は不要です。</p>
              <Link href="/pricing" className="inline-flex items-center text-xs font-medium text-slate-600 mt-3 hover:underline">
                掲載プランを見る →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
