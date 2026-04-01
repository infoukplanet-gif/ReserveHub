import { Card, CardContent } from '@/components/ui/card'

const stats = [
  { label: '本日の予約', value: '8件', change: '+2件', color: 'blue' },
  { label: '今月売上', value: '¥1,100,000', change: '+12%', color: 'green' },
  { label: '新規顧客', value: '18名', change: '+5名', color: 'violet' },
  { label: 'リピート率', value: '72%', change: '+3%', color: 'amber' },
]

const colorMap: Record<string, string> = {
  blue: 'bg-blue-600',
  green: 'bg-green-600',
  violet: 'bg-violet-600',
  amber: 'bg-amber-500',
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">ダッシュボード</h1>
        <p className="text-sm text-slate-500 mt-1">サロンのパフォーマンスを確認</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className={`h-0.5 w-12 ${colorMap[stat.color]} rounded-full mb-3`} />
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
              <p className="text-sm text-green-600 mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Today's Appointments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">本日の予約</h2>
          <a href="/dashboard/reservations" className="text-sm text-blue-600 hover:underline">
            全て見る →
          </a>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {[
                { time: '10:00', name: '山田太郎', menu: '60分コース', status: '確定' },
                { time: '11:30', name: '佐藤花子', menu: '90分コース', status: '確定' },
                { time: '13:00', name: '田中一郎', menu: '60分コース', status: '確定' },
                { time: '14:30', name: null, menu: null, status: '空き' },
                { time: '16:00', name: '鈴木美咲', menu: '45分コース', status: '確定' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3">
                  <span className="text-sm font-medium text-slate-500 w-12">{item.time}</span>
                  {item.name ? (
                    <>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-medium text-slate-600">
                        {item.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.menu}</p>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                        {item.status}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-slate-400">— 空き —</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
