import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: { name: true, description: true, hpSetting: { select: { ogImageUrl: true, metaDescription: true } } },
  })
  if (!tenant) return { title: '院が見つかりません' }
  return {
    title: `${tenant.name} — ミナオスなび`,
    description: tenant.hpSetting?.metaDescription || tenant.description || `${tenant.name}の詳細情報・口コミ`,
    openGraph: { images: tenant.hpSetting?.ogImageUrl ? [tenant.hpSetting.ogImageUrl] : undefined },
  }
}

const DAYS = ['日', '月', '火', '水', '木', '金', '土']

export default async function ClinicDetailPage({ params }: Props) {
  const { slug } = await params

  const clinic = await prisma.tenant.findUnique({
    where: { slug },
    select: {
      id: true, name: true, slug: true, phone: true, address: true, description: true,
      latitude: true, longitude: true, logoUrl: true, symptoms: true,
      hpSetting: { select: { heroImageUrl: true, primaryColor: true } },
      menus: { where: { isActive: true }, select: { id: true, name: true, basePrice: true, durationMinutes: true }, orderBy: { displayOrder: 'asc' }, take: 8 },
      staff: { where: { isActive: true }, select: { id: true, name: true, bio: true, avatarUrl: true }, orderBy: { displayOrder: 'asc' } },
      businessHours: { orderBy: { dayOfWeek: 'asc' } },
    },
  })

  if (!clinic) notFound()

  const [reviewStats, recentReviews] = await Promise.all([
    prisma.review.aggregate({ where: { tenantId: clinic.id, isPublished: true }, _avg: { rating: true }, _count: true }),
    prisma.review.findMany({ where: { tenantId: clinic.id, isPublished: true }, orderBy: { createdAt: 'desc' }, take: 5 }),
  ])

  const avgRating = reviewStats._avg.rating || 0
  const reviewCount = reviewStats._count

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: clinic.name,
    description: clinic.description,
    address: clinic.address ? { '@type': 'PostalAddress', streetAddress: clinic.address } : undefined,
    telephone: clinic.phone,
    aggregateRating: reviewCount > 0 ? { '@type': 'AggregateRating', ratingValue: avgRating.toFixed(1), reviewCount } : undefined,
    geo: clinic.latitude && clinic.longitude ? { '@type': 'GeoCoordinates', latitude: Number(clinic.latitude), longitude: Number(clinic.longitude) } : undefined,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
        {/* ヘッダー */}
        <div className="flex gap-4">
          <div className="w-20 h-20 rounded-xl bg-slate-100 shrink-0 overflow-hidden">
            {clinic.hpSetting?.heroImageUrl ? (
              <img src={clinic.hpSetting.heroImageUrl} alt={clinic.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-slate-300">{clinic.name[0]}</div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{clinic.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex">{[1,2,3,4,5].map(s => <span key={s} className={`text-sm ${s <= Math.round(avgRating) ? 'text-amber-400' : 'text-slate-200'}`}>★</span>)}</div>
              <span className="text-sm text-slate-500">{avgRating.toFixed(1)} ({reviewCount}件)</span>
            </div>
            {clinic.address && <p className="text-sm text-slate-500 mt-1">{clinic.address}</p>}
            {clinic.phone && <p className="text-sm text-slate-500">{clinic.phone}</p>}
          </div>
        </div>

        {/* 症状 */}
        {clinic.symptoms.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {clinic.symptoms.map(s => (
              <span key={s} className="rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs text-green-700">{s}</span>
            ))}
          </div>
        )}

        {/* 説明 */}
        {clinic.description && (
          <div className="rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-2">院について</h2>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{clinic.description}</p>
          </div>
        )}

        {/* 施術メニュー */}
        {clinic.menus.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-slate-900 mb-3">施術メニュー</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {clinic.menus.map(m => (
                <div key={m.id} className="rounded-xl border border-slate-200 p-4">
                  <p className="text-sm font-medium text-slate-900">{m.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm font-bold text-slate-900">¥{m.basePrice.toLocaleString()}</span>
                    <span className="text-xs text-slate-400">{m.durationMinutes}分</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 施術者 */}
        {clinic.staff.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-slate-900 mb-3">施術者</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {clinic.staff.map(s => (
                <div key={s.id} className="flex gap-3 rounded-xl border border-slate-200 p-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 shrink-0 flex items-center justify-center text-sm font-bold text-blue-600 overflow-hidden">
                    {s.avatarUrl ? <img src={s.avatarUrl} alt={s.name} className="w-full h-full object-cover" /> : s.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{s.name}</p>
                    {s.bio && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{s.bio}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 営業時間 */}
        {clinic.businessHours.length > 0 && (
          <div className="rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">営業時間</h2>
            <div className="space-y-1.5">
              {clinic.businessHours.map(bh => (
                <div key={bh.dayOfWeek} className="flex items-center gap-4 text-sm">
                  <span className="w-8 text-slate-500">{DAYS[bh.dayOfWeek]}</span>
                  {bh.isClosed ? (
                    <span className="text-slate-400">定休日</span>
                  ) : (
                    <span className="text-slate-700">{bh.openTime} 〜 {bh.closeTime}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 口コミ */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900">口コミ ({reviewCount}件)</h2>
            <Link href={`/clinics/${clinic.slug}/reviews`} className="text-xs text-green-600 hover:underline">すべて見る</Link>
          </div>
          {recentReviews.length === 0 ? (
            <p className="text-sm text-slate-400 py-4">まだ口コミがありません</p>
          ) : (
            <div className="space-y-3">
              {recentReviews.map(r => (
                <div key={r.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex">{[1,2,3,4,5].map(s => <span key={s} className={`text-xs ${s <= r.rating ? 'text-amber-400' : 'text-slate-200'}`}>★</span>)}</div>
                      <span className="text-xs font-medium text-slate-700">{r.authorName}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{new Date(r.createdAt).toLocaleDateString('ja-JP')}</span>
                  </div>
                  {r.title && <p className="text-sm font-medium text-slate-900 mt-2">{r.title}</p>}
                  <p className="text-sm text-slate-600 mt-1">{r.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="text-center py-4">
          <Link href={`/${clinic.slug}/book`} className="inline-flex items-center rounded-xl bg-green-600 px-8 py-3 text-sm font-medium text-white hover:bg-green-700 transition-colors">
            来院予約する
          </Link>
        </div>
      </div>
    </>
  )
}
