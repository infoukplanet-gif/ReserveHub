import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '料金プラン | ReserveHub',
  description: 'ReserveHubの料金プラン。無料プランから始められます。',
}

const plans = [
  {
    name: 'Free',
    price: '¥0',
    period: '/月',
    description: 'まずは試してみたい方に',
    features: [
      { text: '予約管理', detail: '月30件まで' },
      { text: 'HP作成', detail: '基本テンプレート' },
      { text: '顧客管理', detail: '100名まで' },
      { text: 'メール通知', detail: '予約確認・リマインド' },
      { text: 'スタッフ管理', detail: '1名（オーナーのみ）' },
    ],
    limitations: ['カルテ機能なし', 'ブログ機能なし', '回数券機能なし', 'カスタムHTML/CSS不可'],
    highlighted: false,
  },
  {
    name: 'Standard',
    price: '¥2,980',
    period: '/月（税込）',
    description: '本格運用したい事業者に',
    features: [
      { text: '予約管理', detail: '無制限' },
      { text: 'HP作成', detail: '全テンプレート・セクション編集' },
      { text: '顧客管理', detail: '無制限' },
      { text: 'カルテ機能', detail: 'カスタムフィールド対応' },
      { text: '回数券', detail: '作成・販売・自動消化' },
      { text: 'ブログ機能', detail: 'ブロックエディタ' },
      { text: 'スタッフ管理', detail: '5名まで' },
      { text: 'メール通知', detail: '全種類' },
    ],
    limitations: ['カスタムHTML/CSS不可', '独自ドメイン不可'],
    highlighted: true,
  },
  {
    name: 'Pro',
    price: '¥5,980',
    period: '/月（税込）',
    description: '複数スタッフの事業者に',
    features: [
      { text: 'Standardの全機能', detail: '' },
      { text: 'スタッフ管理', detail: '無制限' },
      { text: 'カスタムHTML/CSS', detail: 'head挿入・CSS上書き' },
      { text: 'Google Tag Manager', detail: 'コンバージョン計測' },
      { text: 'Facebook Pixel', detail: '広告最適化' },
      { text: '独自ドメイン対応', detail: 'お好きなドメインで運営' },
      { text: '「Powered by」非表示', detail: '' },
      { text: '優先サポート', detail: '24時間以内に返信' },
    ],
    limitations: [],
    highlighted: false,
  },
]

const faqs = [
  { q: '無料プランに期限はありますか？', a: 'ありません。無料プランは機能制限はありますが、期間制限なくご利用いただけます。' },
  { q: '途中でプラン変更はできますか？', a: 'はい、いつでもアップグレード・ダウングレードが可能です。アップグレード時は日割り計算、ダウングレードは次の請求期間から適用されます。' },
  { q: '解約は簡単にできますか？', a: 'はい、設定画面からいつでも解約できます。解約後も請求期間の終了まではご利用いただけます。' },
  { q: '支払い方法は何がありますか？', a: 'クレジットカード（Visa, Mastercard, JCB, American Express）に対応しています。' },
  { q: 'データの移行はサポートされますか？', a: '他サービスからのデータ移行についてはお問い合わせください。CSV形式でのインポートに対応しています。' },
]

export default function PricingPage() {
  return (
    <div className="space-y-16">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">料金プラン</h1>
        <p className="mt-3 text-slate-500">事業規模に合わせて選べる3プラン。すべて14日間無料でお試しいただけます。</p>
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.name} className={`rounded-2xl p-8 border ${plan.highlighted ? 'border-blue-600 ring-1 ring-blue-600 relative' : 'border-slate-200'}`}>
            {plan.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">人気</span>
            )}
            <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
            <p className="text-sm text-slate-500 mt-1">{plan.description}</p>
            <div className="mt-6">
              <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
              <span className="text-slate-500 text-sm">{plan.period}</span>
            </div>

            <div className="mt-6 space-y-2.5">
              {plan.features.map((f) => (
                <div key={f.text} className="flex items-start gap-2 text-sm">
                  <span className="text-green-500 mt-0.5 shrink-0">&#10003;</span>
                  <div>
                    <span className="text-slate-900 font-medium">{f.text}</span>
                    {f.detail && <span className="text-slate-400 ml-1">({f.detail})</span>}
                  </div>
                </div>
              ))}
              {plan.limitations.map((l) => (
                <div key={l} className="flex items-start gap-2 text-sm">
                  <span className="text-slate-300 mt-0.5 shrink-0">&#10007;</span>
                  <span className="text-slate-400">{l}</span>
                </div>
              ))}
            </div>

            <Link href="/register" className={`mt-8 block w-full text-center py-3 rounded-lg text-sm font-medium transition-colors ${plan.highlighted ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
              {plan.name === 'Free' ? '無料ではじめる' : '14日間無料トライアル'}
            </Link>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">よくあるご質問</h2>
        <div className="space-y-4 max-w-2xl mx-auto">
          {faqs.map((faq) => (
            <div key={faq.q} className="border border-slate-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-slate-900">{faq.q}</h3>
              <p className="mt-2 text-sm text-slate-500">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
