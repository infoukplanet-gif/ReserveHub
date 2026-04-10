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
      latitude: true, longitude: true, logoUrl: true, symptoms: true, googlePlaceId: true,
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

        {/* Google Maps */}
        {clinic.latitude && clinic.longitude && (
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">アクセス</h2>
              {clinic.googlePlaceId && (
                <a
                  href={`https://www.google.com/maps/place/?q=place_id:${clinic.googlePlaceId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-600 hover:underline flex items-center gap-1"
                >
                  Google Mapsで開く
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </a>
              )}
            </div>
            <iframe
              src={`https://maps.google.com/maps?q=${clinic.latitude},${clinic.longitude}&z=16&output=embed`}
              width="100%"
              height="280"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            {clinic.address && (
              <div className="px-5 py-3 bg-slate-50 text-xs text-slate-500 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">location_on</span>
                {clinic.address}
              </div>
            )}
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

        {/* Google Maps口コミCTA */}
        {clinic.googlePlaceId && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center">
            <p className="text-sm font-medium text-slate-700">この院を利用したことがありますか？</p>
            <p className="text-xs text-slate-400 mt-1">Google Mapsでも口コミを投稿すると、他の方の院選びの参考になります</p>
            <a
              href={`https://search.google.com/local/writereview?placeid=${clinic.googlePlaceId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-3 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google Mapsで口コミを書く
            </a>
          </div>
        )}

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
