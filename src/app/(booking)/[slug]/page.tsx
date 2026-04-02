import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'

type Props = { params: Promise<{ slug: string }> }

export default async function PublicHomePage({ params }: Props) {
  const { slug } = await params

  const tenant = await prisma.tenant.findUnique({ where: { slug } })
  if (!tenant) notFound()

  const [hpSettings, menus, staff, businessHours] = await Promise.all([
    prisma.hpSetting.findUnique({ where: { tenantId: tenant.id } }),
    prisma.menu.findMany({
      where: { tenantId: tenant.id, isActive: true },
      include: { pricingRules: true },
      orderBy: { displayOrder: 'asc' },
      take: 4,
    }),
    prisma.staff.findMany({
      where: { tenantId: tenant.id, isActive: true },
      orderBy: { displayOrder: 'asc' },
    }),
    prisma.businessHour.findMany({
      where: { tenantId: tenant.id },
      orderBy: { dayOfWeek: 'asc' },
    }),
  ])

  const primaryColor = hpSettings?.primaryColor || '#2563EB'
  const DAYS = ['日', '月', '火', '水', '木', '金', '土']

  function getPriceRange(basePrice: number, rules: { price: number }[]) {
    const prices = [basePrice, ...rules.map(r => r.price)]
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    return min === max ? `¥${min.toLocaleString()}` : `¥${min.toLocaleString()}〜¥${max.toLocaleString()}`
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-slate-900">{tenant.name}</span>
          <Link href={`/${slug}/book`}>
            <button className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: primaryColor }}>
              予約する
            </button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-slate-800 text-white">
        <div className="max-w-5xl mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">
            {hpSettings?.heroTitle || tenant.name}
          </h1>
          {hpSettings?.heroSubtitle && (
            <p className="mt-4 text-white/70 text-base">{hpSettings.heroSubtitle}</p>
          )}
          <Link href={`/${slug}/book`}>
            <button className="mt-8 px-8 py-3 bg-white rounded-lg font-semibold text-base" style={{ color: primaryColor }}>
              今すぐ予約する
            </button>
          </Link>
        </div>
      </section>

      {/* Menu */}
      {menus.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">メニュー・料金</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {menus.map(menu => (
              <div key={menu.id} className="border rounded-xl p-5">
                <h3 className="text-base font-semibold text-slate-900">{menu.name}</h3>
                {menu.description && <p className="text-sm text-slate-500 mt-1">{menu.description}</p>}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-slate-400">{menu.durationMinutes}分</span>
                  <span className="text-lg font-bold text-slate-900">{getPriceRange(menu.basePrice, menu.pricingRules)}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link href={`/${slug}/book`} className="text-sm font-medium" style={{ color: primaryColor }}>
              メニューをすべて見る →
            </Link>
          </div>
        </section>
      )}

      {/* Staff */}
      {staff.length > 0 && (
        <section className="bg-slate-50 py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">スタッフ紹介</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {staff.map(s => (
                <div key={s.id} className="text-center">
                  <div className="w-20 h-20 mx-auto rounded-full bg-blue-50 flex items-center justify-center text-2xl font-bold text-blue-600">
                    {s.name[0]}
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-900">{s.name}</p>
                  {s.bio && <p className="mt-1 text-xs text-slate-500">{s.bio}</p>}
                  {s.nominationFee > 0 && <p className="mt-1 text-xs text-slate-400">指名料 ¥{s.nominationFee.toLocaleString()}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Access */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">アクセス</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            {tenant.address && (
              <div><p className="text-xs text-slate-400 font-medium">住所</p><p className="text-sm text-slate-900 mt-1">{tenant.postalCode && `〒${tenant.postalCode} `}{tenant.address}</p></div>
            )}
            {tenant.phone && (
              <div><p className="text-xs text-slate-400 font-medium">電話番号</p><p className="text-sm text-slate-900 mt-1">{tenant.phone}</p></div>
            )}
            <div>
              <p className="text-xs text-slate-400 font-medium">営業時間</p>
              <div className="mt-1 space-y-0.5">
                {businessHours.map(bh => (
                  <div key={bh.dayOfWeek} className="flex items-center gap-3 text-sm">
                    <span className="text-slate-500 w-8">{DAYS[bh.dayOfWeek]}</span>
                    {bh.isClosed ? (
                      <span className="text-slate-400">定休日</span>
                    ) : (
                      <span className="text-slate-900">{bh.openTime}〜{bh.closeTime}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-slate-100 rounded-xl h-64 flex items-center justify-center">
            <span className="text-sm text-slate-400">Google Map</span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 text-center" style={{ backgroundColor: primaryColor }}>
        <p className="text-white text-lg font-semibold">ご予約はこちら</p>
        <Link href={`/${slug}/book`}>
          <button className="mt-4 px-8 py-3 bg-white rounded-lg font-semibold" style={{ color: primaryColor }}>
            今すぐ予約する
          </button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm text-slate-500">{tenant.name}</p>
          {tenant.address && <p className="text-xs text-slate-400 mt-1">{tenant.address}</p>}
          <p className="text-xs text-slate-300 mt-4">Powered by ReserveHub</p>
        </div>
      </footer>

      {/* Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t p-3 lg:hidden">
        <Link href={`/${slug}/book`} className="block">
          <button className="w-full py-3 rounded-lg text-white font-semibold" style={{ backgroundColor: primaryColor }}>
            予約する
          </button>
        </Link>
      </div>
    </div>
  )
}
