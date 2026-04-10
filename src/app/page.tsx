import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ReserveHub | 整体院・鍼灸院の予約管理 × カルテ × リピート促進',
  description: '整体院・鍼灸院・接骨院に特化した予約管理アプリ。来院予約、カルテ、自動フォローアップ、LINE連携、ホームページ作成が月額1,980円から。',
}

const features = [
  {
    title: '柔軟な料金設定',
    description: '平日/休日、時間帯、曜日×時間帯の組み合わせで自動的に料金を切り替え。オプション・指名料も1施術メニューで管理。',
    icon: '💰',
  },
  {
    title: '自動フォローアップ',
    description: '来院サイクルを学習し、最適なタイミングで自動リマインド。季節や症状に応じたメッセージで再来院を促進。',
    icon: '🔄',
  },
  {
    title: 'カルテ管理',
    description: '主訴、施術履歴、経過観察をデジタル管理。施術者ごとのテンプレートで記録を効率化。回数券の販売・消化も自動追跡。',
    icon: '📋',
  },
  {
    title: 'かんたん来院予約',
    description: '患者様はスマホから24時間予約可能。ダブルブッキング防止、リマインドメール自動送信で無断キャンセルを削減。',
    icon: '📅',
  },
  {
    title: 'ホームページ作成',
    description: 'テンプレ感ゼロのHP。ナビ・ヒーロー・セクション・フッターを自由にカスタマイズ。SEO・OGP対応で集患力UP。',
    icon: '🌐',
  },
  {
    title: '回数券・チケット',
    description: '回数券テンプレートを作成して販売。残回数・有効期限を自動管理。リピート率向上に貢献。',
    icon: '🎫',
  },
]

const plans = [
  {
    name: 'ライト',
    price: '¥1,980',
    period: '/月',
    description: 'まずは予約管理を効率化したい院に',
    features: ['来院予約管理', 'カルテ（50件まで）', '施術メニュー管理', '回数券管理', 'メール通知'],
    cta: '14日間無料トライアル',
    highlighted: false,
  },
  {
    name: 'スタンダード',
    price: '¥4,980',
    period: '/月',
    description: 'リピート率を上げたい院に',
    features: ['ライトの全機能', 'カルテ（無制限）', '自動フォローアップ', 'LINE連携チャット', 'メール配信', '施術者管理（5名まで）'],
    cta: '14日間無料トライアル',
    highlighted: true,
  },
  {
    name: 'プロ',
    price: '¥9,800',
    period: '/月',
    description: '集患もHPもまるごと任せたい院に',
    features: ['スタンダードの全機能', '施術者管理（無制限）', 'HP/ブログ機能', 'デザインテーマ5種', '分析ダッシュボード', '優先サポート'],
    cta: '14日間無料トライアル',
    highlighted: false,
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-slate-900">ReserveHub</Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-600">
            <a href="#features">機能</a>
            <a href="#pricing">料金</a>
            <Link href="/terms">利用規約</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900">ログイン</Link>
            <Link href="/register" className="text-sm bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">無料ではじめる</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
            予約、カルテ、リピート促進。<br />
            <span className="text-blue-600">整体院の経営を、これ1つで。</span>
          </h1>
          <p className="mt-6 text-lg text-slate-500 max-w-2xl mx-auto">
            施術中に電話が鳴る。リピート促進が手動。回数券の管理が煩雑。
            そんな整体院・鍼灸院の悩みを解決する、業界特化の予約管理アプリ。
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3.5 rounded-lg text-base font-medium hover:bg-blue-700 transition-colors">
              無料ではじめる
            </Link>
            <a href="#features" className="w-full sm:w-auto border border-slate-200 text-slate-700 px-8 py-3.5 rounded-lg text-base font-medium hover:bg-slate-50 transition-colors">
              機能を見る
            </a>
          </div>
          <p className="mt-4 text-xs text-slate-400">クレジットカード不要 / 1分で登録完了</p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">必要なものが、すべて揃う</h2>
            <p className="mt-3 text-slate-500">整体院・鍼灸院の経営に必要な機能をワンストップで提供</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-slate-100">
                <span className="text-3xl">{f.icon}</span>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">シンプルな料金プラン</h2>
            <p className="mt-3 text-slate-500">事業規模に合わせて選べる3プラン</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan.name} className={`rounded-2xl p-8 border ${plan.highlighted ? 'border-blue-600 ring-1 ring-blue-600 bg-blue-50/30' : 'border-slate-200 bg-white'}`}>
                <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{plan.description}</p>
                <div className="mt-6">
                  <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                  <span className="text-slate-500">{plan.period}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="text-green-500 mt-0.5">&#10003;</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className={`mt-8 block w-full text-center py-3 rounded-lg text-sm font-medium transition-colors ${plan.highlighted ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-slate-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white">今すぐ、はじめよう</h2>
          <p className="mt-4 text-slate-400">1分で登録完了。まずは無料プランからお試しください。</p>
          <Link href="/register" className="mt-8 inline-block bg-white text-slate-900 px-8 py-3.5 rounded-lg text-base font-medium hover:bg-slate-100 transition-colors">
            無料ではじめる
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-sm text-slate-400">&copy; 2026 ReserveHub. All rights reserved.</div>
          <nav className="flex items-center gap-6 text-sm text-slate-500">
            <Link href="/terms" className="hover:text-slate-900">利用規約</Link>
            <Link href="/privacy" className="hover:text-slate-900">プライバシーポリシー</Link>
            <Link href="/pricing" className="hover:text-slate-900">料金プラン</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
