export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const tenant = await prisma.tenant.findUnique({ where: { slug } })
  if (!tenant) return {}
  const hp = await prisma.hpSetting.findUnique({ where: { tenantId: tenant.id } })
  return {
    title: hp?.metaTitle || tenant.name,
    description: hp?.metaDescription || `${tenant.name}の公式サイト`,
    openGraph: {
      title: hp?.metaTitle || tenant.name,
      description: hp?.metaDescription || '',
      images: hp?.ogImageUrl ? [hp.ogImageUrl] : [],
    },
  }
}

export default async function PublicHomePage({ params }: Props) {
  const { slug } = await params
  const tenant = await prisma.tenant.findUnique({ where: { slug } })
  if (!tenant) notFound()

  const [hp, menus, staff, businessHours, blogs] = await Promise.all([
    prisma.hpSetting.findUnique({ where: { tenantId: tenant.id } }),
    prisma.menu.findMany({ where: { tenantId: tenant.id, isActive: true }, include: { pricingRules: true }, orderBy: { displayOrder: 'asc' }, take: 6 }),
    prisma.staff.findMany({ where: { tenantId: tenant.id, isActive: true }, orderBy: { displayOrder: 'asc' } }),
    prisma.businessHour.findMany({ where: { tenantId: tenant.id }, orderBy: { dayOfWeek: 'asc' } }),
    prisma.blogPost.findMany({ where: { tenantId: tenant.id, isPublished: true }, orderBy: { publishedAt: 'desc' }, take: 3 }),
  ])

  const color = hp?.primaryColor || '#2563EB'
  const navType = hp?.navType || 'header'
  const heroType = hp?.heroType || 'image'
  const heroAlign = hp?.heroTextAlign || 'center'
  const overlayOpacity = Number(hp?.heroOverlayOpacity ?? 0.5)
  const animLevel = hp?.animationLevel || 'subtle'
  const mapStyle = hp?.mapStyle || 'default'
  const mapZoom = hp?.mapZoom || 15
  const footerLayout = hp?.footerLayout || '1col'
  const footerSns = (hp?.footerSns as { type: string; url: string }[] | null) || []
  const showPoweredBy = hp?.showPoweredBy ?? true
  const sectionConfig = (hp?.sectionConfig as Record<string, Record<string, unknown>> | null) || {}
  const heroImages = (hp?.heroImages as string[] | null) || []
  const DAYS = ['日', '月', '火', '水', '木', '金', '土']

  const animClass = animLevel === 'none' ? '' : animLevel === 'subtle' ? 'animate-fade-in' : 'animate-slide-up'

  function getPriceRange(base: number, rules: { price: number }[]) {
    const prices = [base, ...rules.map(r => r.price)]
    const min = Math.min(...prices), max = Math.max(...prices)
    return min === max ? `¥${min.toLocaleString()}` : `¥${min.toLocaleString()}〜¥${max.toLocaleString()}`
  }

  // 構造化データ（JSON-LD）— AIO対応
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: tenant.name,
    description: hp?.metaDescription || '',
    address: tenant.address ? { '@type': 'PostalAddress', streetAddress: tenant.address, postalCode: tenant.postalCode, addressCountry: 'JP' } : undefined,
    telephone: tenant.phone || undefined,
    url: `https://reserve-app-mu.vercel.app/${slug}`,
    openingHoursSpecification: businessHours.filter(bh => !bh.isClosed).map(bh => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][bh.dayOfWeek],
      opens: bh.openTime,
      closes: bh.closeTime,
    })),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'メニュー',
      itemListElement: menus.map(m => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: m.name, description: m.description || '' },
        price: m.basePrice,
        priceCurrency: 'JPY',
      })),
    },
  }

  // Google Map embed URL
  const mapQuery = encodeURIComponent(tenant.address || tenant.name)
  const mapColorParam = mapStyle === 'mono' ? '&maptype=roadmap' : mapStyle === 'dark' ? '&maptype=roadmap' : ''
  const mapEmbedUrl = `https://www.google.com/maps?q=${mapQuery}&z=${mapZoom}&output=embed${mapColorParam}`

  return (
    <div className="min-h-screen bg-white">
      {/* 構造化データ */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      {/* Custom Head HTML */}
      {hp?.customHeadHtml && <div dangerouslySetInnerHTML={{ __html: hp.customHeadHtml }} />}

      {/* Custom CSS */}
      {hp?.customCss && <style dangerouslySetInnerHTML={{ __html: hp.customCss }} />}

      {/* Navigation */}
      {navType === 'header' && (
        <header className="sticky top-0 z-50 bg-white border-b">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <span className="font-bold text-slate-900">{tenant.name}</span>
            <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
              <Link href={`/${slug}/menu`} className="hover:text-slate-900">施術メニュー</Link>
              <Link href={`/${slug}/staff`} className="hover:text-slate-900">施術者紹介</Link>
              <Link href={`/${slug}/blog`} className="hover:text-slate-900">ブログ</Link>
            </nav>
            <Link href={`/${slug}/book`}><button className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: color }}>来院予約する</button></Link>
          </div>
        </header>
      )}

      {navType === 'hamburger' && (
        <header className="sticky top-0 z-50 bg-white border-b">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <span className="font-bold text-slate-900">{tenant.name}</span>
            <Link href={`/${slug}/book`}><button className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: color }}>来院予約する</button></Link>
          </div>
        </header>
      )}

      {/* Hero */}
      {heroType !== 'text' ? (
        <section className="relative text-white" style={{ minHeight: 400 }}>
          {heroType === 'image' && hp?.heroImageUrl && <img src={hp.heroImageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />}
          {heroType === 'slideshow' && heroImages.length > 0 && <img src={heroImages[0]} alt="" className="absolute inset-0 w-full h-full object-cover" />}
          {!hp?.heroImageUrl && heroImages.length === 0 && <div className="absolute inset-0 bg-slate-800" />}
          <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }} />
          <div className={`relative max-w-5xl mx-auto px-4 py-24 ${heroAlign === 'left' ? 'text-left' : heroAlign === 'right' ? 'text-right' : 'text-center'}`}>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">{hp?.heroTitle || tenant.name}</h1>
            {hp?.heroSubtitle && <p className="mt-4 text-white/70 text-base">{hp.heroSubtitle}</p>}
            <Link href={`/${slug}/book`}><button className="mt-8 px-8 py-3 bg-white rounded-lg font-semibold text-base" style={{ color }}>今すぐ来院予約する</button></Link>
          </div>
        </section>
      ) : (
        <section className="max-w-5xl mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">{hp?.heroTitle || tenant.name}</h1>
          {hp?.heroSubtitle && <p className="mt-4 text-slate-500">{hp.heroSubtitle}</p>}
          <Link href={`/${slug}/book`}><button className="mt-8 px-8 py-3 rounded-lg text-white font-semibold" style={{ backgroundColor: color }}>今すぐ来院予約する</button></Link>
        </section>
      )}

      {/* Menus */}
      {menus.length > 0 && (
        <section className={`max-w-5xl mx-auto px-4 py-16 ${animClass}`} style={{ backgroundColor: sectionConfig.menus?.bgColor as string || undefined }}>
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">施術メニュー・料金</h2>
          <div className={`grid ${sectionConfig.menus?.style === 'list' ? 'grid-cols-1' : 'md:grid-cols-2'} gap-4`}>
            {menus.slice(0, (sectionConfig.menus?.count as number) || 4).map(menu => (
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
          <div className="text-center mt-6"><Link href={`/${slug}/menu`} className="text-sm font-medium" style={{ color }}>施術メニューをすべて見る →</Link></div>
        </section>
      )}

      {/* Staff */}
      {staff.length > 0 && (
        <section className={`py-16 ${animClass}`} style={{ backgroundColor: sectionConfig.staff?.bgColor as string || '#F8FAFC' }}>
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">施術者紹介</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {staff.map(s => (
                <div key={s.id} className="text-center">
                  <div className={`w-20 h-20 mx-auto ${sectionConfig.staff?.photoShape === 'square' ? 'rounded-xl' : 'rounded-full'} bg-blue-50 flex items-center justify-center text-2xl font-bold text-blue-600 overflow-hidden`}>
                    {s.avatarUrl ? <img src={s.avatarUrl} alt={s.name} className="w-full h-full object-cover" /> : (s.name?.[0] || '?')}
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-900">{s.name}</p>
                  {(sectionConfig.staff?.showBio !== false) && s.bio && <p className="mt-1 text-xs text-slate-500">{s.bio}</p>}
                  {(sectionConfig.staff?.showFee !== false) && s.nominationFee > 0 && <p className="mt-1 text-xs text-slate-400">指名料 ¥{s.nominationFee.toLocaleString()}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Blog */}
      {blogs.length > 0 && (
        <section className={`max-w-5xl mx-auto px-4 py-16 ${animClass}`}>
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">ブログ</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {blogs.map(post => (
              <Link key={post.id} href={`/${slug}/blog/${post.id}`} className="group">
                <div className="rounded-xl border overflow-hidden hover:shadow-md transition-shadow">
                  {post.thumbnailUrl && <img src={post.thumbnailUrl} alt="" className="w-full h-36 object-cover" />}
                  <div className="p-4">
                    <p className="text-xs text-slate-400">{post.category}</p>
                    <h3 className="text-sm font-semibold text-slate-900 mt-1 group-hover:text-blue-600">{post.title}</h3>
                    <p className="text-xs text-slate-400 mt-2">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('ja-JP') : ''}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-6"><Link href={`/${slug}/blog`} className="text-sm font-medium" style={{ color }}>ブログをすべて見る →</Link></div>
        </section>
      )}

      {/* Access + Map */}
      <section className={`max-w-5xl mx-auto px-4 py-16 ${animClass}`}>
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">アクセス</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            {tenant.address && <div><p className="text-xs text-slate-400 font-medium">住所</p><p className="text-sm text-slate-900 mt-1">{tenant.postalCode && `〒${tenant.postalCode} `}{tenant.address}</p></div>}
            {tenant.phone && <div><p className="text-xs text-slate-400 font-medium">電話番号</p><p className="text-sm text-slate-900 mt-1">{tenant.phone}</p></div>}
            <div>
              <p className="text-xs text-slate-400 font-medium">営業時間</p>
              <div className="mt-1 space-y-0.5">{businessHours.map(bh => (
                <div key={bh.dayOfWeek} className="flex items-center gap-3 text-sm">
                  <span className="text-slate-500 w-8">{DAYS[bh.dayOfWeek]}</span>
                  {bh.isClosed ? <span className="text-slate-400">定休日</span> : <span className="text-slate-900">{bh.openTime}〜{bh.closeTime}</span>}
                </div>
              ))}</div>
            </div>
          </div>
          <div className={`rounded-xl overflow-hidden h-64 ${mapStyle === 'dark' ? 'grayscale invert' : mapStyle === 'mono' ? 'grayscale' : ''}`}>
            <iframe src={mapEmbedUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 text-center" style={{ backgroundColor: color }}>
        <p className="text-white text-lg font-semibold">ご予約はこちら</p>
        <Link href={`/${slug}/book`}><button className="mt-4 px-8 py-3 bg-white rounded-lg font-semibold" style={{ color }}>今すぐ来院予約する</button></Link>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className={`max-w-5xl mx-auto px-4 ${footerLayout === '1col' ? 'text-center' : footerLayout === '2col' ? 'grid grid-cols-2 gap-8' : 'grid grid-cols-3 gap-8'}`}>
          <div>
            <p className="text-sm font-semibold text-slate-900">{tenant.name}</p>
            {tenant.address && <p className="text-xs text-slate-400 mt-1">{tenant.address}</p>}
            {tenant.phone && <p className="text-xs text-slate-400 mt-1">{tenant.phone}</p>}
          </div>
          {footerLayout !== '1col' && (
            <div className="flex flex-col gap-1">
              <Link href={`/${slug}/menu`} className="text-xs text-slate-500 hover:text-slate-900">施術メニュー</Link>
              <Link href={`/${slug}/staff`} className="text-xs text-slate-500 hover:text-slate-900">施術者紹介</Link>
              <Link href={`/${slug}/blog`} className="text-xs text-slate-500 hover:text-slate-900">ブログ</Link>
              <Link href={`/${slug}/book`} className="text-xs text-slate-500 hover:text-slate-900">来院予約する</Link>
            </div>
          )}
          {footerSns.length > 0 && (
            <div className="flex gap-3 justify-center mt-3">
              {footerSns.filter(s => s.url).map((sns, i) => (
                <a key={i} href={sns.url} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 hover:text-slate-600 capitalize">{sns.type}</a>
              ))}
            </div>
          )}
          {showPoweredBy && <p className="text-xs text-slate-300 mt-4">Powered by ReserveHub</p>}
        </div>
      </footer>

      {/* Mobile CTA — footer nav type */}
      {navType === 'footer' ? (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex items-center justify-around py-2 lg:hidden">
          <Link href={`/${slug}`} className="flex flex-col items-center gap-0.5"><span className="material-symbols-outlined text-[20px] text-blue-600">home</span><span className="text-[10px] text-blue-600">ホーム</span></Link>
          <Link href={`/${slug}/menu`} className="flex flex-col items-center gap-0.5"><span className="material-symbols-outlined text-[20px] text-slate-400">spa</span><span className="text-[10px] text-slate-400">施術</span></Link>
          <Link href={`/${slug}/book`} className="flex flex-col items-center gap-0.5"><span className="material-symbols-outlined text-[20px] text-slate-400">calendar_month</span><span className="text-[10px] text-slate-400">来院予約</span></Link>
          <Link href={`/${slug}/staff`} className="flex flex-col items-center gap-0.5"><span className="material-symbols-outlined text-[20px] text-slate-400">group</span><span className="text-[10px] text-slate-400">施術者</span></Link>
        </div>
      ) : (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t p-3 lg:hidden">
          <Link href={`/${slug}/book`} className="block"><button className="w-full py-3 rounded-lg text-white font-semibold" style={{ backgroundColor: color }}>来院予約する</button></Link>
        </div>
      )}
    </div>
  )
}
