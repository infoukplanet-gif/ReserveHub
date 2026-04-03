import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ReserveHub | 予約管理 × ホームページ × 顧客管理',
  description: '中小事業者向けの予約管理Webアプリ。柔軟な料金設定、顧客管理、ホームページ作成が月額無料から。',
}

const features = [
  {
    title: '柔軟な料金設定',
    description: '平日/休日、時間帯、曜日×時間帯の組み合わせで自動的に料金を切り替え。オプション・指名料も1メニューで管理。',
    icon: '💰',
  },
  {
    title: 'ホームページ作成',
    description: 'テンプレ感ゼロのHP。ナビ・ヒーロー・セクション・フッターを自由にカスタマイズ。SEO・OGP対応。',
    icon: '🌐',
  },
  {
    title: '顧客管理・カルテ',
    description: '来店履歴、カルテ記録、タグ管理で顧客を深く理解。回数券の販売・消化も自動追跡。',
    icon: '👥',
  },
  {
    title: 'かんたん予約受付',
    description: '顧客はスマホから24時間予約可能。ダブルブッキング防止、リマインドメール自動送信。',
    icon: '📅',
  },
  {
    title: 'ブログ機能',
    description: 'noteのようなブロックエディタでお知らせやコラムを発信。SEO効果でHPへの流入を増加。',
    icon: '✍️',
  },
  {
    title: '回数券・チケット',
    description: '回数券テンプレートを作成して販売。残回数・有効期限を自動管理。リピート率向上に貢献。',
    icon: '🎫',
  },
]

const plans = [
  {
    name: 'Free',
    price: '¥0',
    period: '/月',
    description: 'まずは試してみたい方に',
    features: ['予約管理（月30件まで）', 'HP作成（基本テンプレート）', '顧客管理（100名まで）', 'メール通知'],
    cta: '無料ではじめる',
    highlighted: false,
  },
  {
    name: 'Standard',
    price: '¥2,980',
    period: '/月',
    description: '本格運用したい事業者に',
    features: ['予約管理（無制限）', 'HP作成（全テンプレート）', '顧客管理（無制限）', 'カルテ・回数券', 'ブログ機能', 'スタッフ管理（5名まで）'],
    cta: '14日間無料トライアル',
    highlighted: true,
  },
  {
    name: 'Pro',
    price: '¥5,980',
    period: '/月',
    description: '複数スタッフの事業者に',
    features: ['Standardの全機能', 'スタッフ管理（無制限）', 'カスタムHTML/CSS', 'Google Tag Manager', '独自ドメイン対応', '優先サポート'],
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
            予約も、HPも、顧客管理も。<br />
            <span className="text-blue-600">これ1つで。</span>
          </h1>
          <p className="mt-6 text-lg text-slate-500 max-w-2xl mx-auto">
            平日/休日で料金を変えたい。オプションや指名料を柔軟に設定したい。
            そんな事業者の声から生まれた、新しい予約管理アプリ。
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
            <p className="mt-3 text-slate-500">予約管理に必要な機能をワンストップで提供</p>
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
