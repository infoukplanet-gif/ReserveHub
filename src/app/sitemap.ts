import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://reserve-app-mu.vercel.app'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ]

  // Dynamic tenant pages (ReserveHub利用院のHP)
  const tenants = await prisma.tenant.findMany({ select: { slug: true, updatedAt: true } })

  const tenantPages: MetadataRoute.Sitemap = tenants.flatMap((tenant) => [
    { url: `${baseUrl}/${tenant.slug}`, lastModified: tenant.updatedAt, changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${baseUrl}/${tenant.slug}/menu`, lastModified: tenant.updatedAt, changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${baseUrl}/${tenant.slug}/staff`, lastModified: tenant.updatedAt, changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${baseUrl}/${tenant.slug}/blog`, lastModified: tenant.updatedAt, changeFrequency: 'weekly' as const, priority: 0.6 },
  ])

  // ミナオスなび — 院詳細ページ (プラットフォーム掲載院)
  const listedTenants = await prisma.tenant.findMany({
    where: { isListedOnPlatform: true },
    select: { slug: true, updatedAt: true },
  })

  const platformPages: MetadataRoute.Sitemap = listedTenants.flatMap((t) => [
    { url: `${baseUrl}/clinics/${t.slug}`, lastModified: t.updatedAt, changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${baseUrl}/clinics/${t.slug}/reviews`, lastModified: t.updatedAt, changeFrequency: 'weekly' as const, priority: 0.6 },
  ])

  // 症状別検索ページ
  const symptomPages: MetadataRoute.Sitemap = [
    '肩こり', '腰痛', '頭痛', '膝痛', '冷え性', '自律神経', '産後ケア', 'スポーツ障害',
  ].map((s) => ({
    url: `${baseUrl}/search?symptom=${encodeURIComponent(s)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // エリア別検索ページ
  const areaPages: MetadataRoute.Sitemap = [
    '東京', '大阪', '名古屋', '福岡', '札幌', '横浜', '神戸', '京都',
  ].map((a) => ({
    url: `${baseUrl}/search?area=${encodeURIComponent(a)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Blog posts
  const blogs = await prisma.blogPost.findMany({
    where: { isPublished: true },
    select: { id: true, updatedAt: true, tenant: { select: { slug: true } } },
  })

  const blogPages: MetadataRoute.Sitemap = blogs.map((blog) => ({
    url: `${baseUrl}/${blog.tenant.slug}/blog/${blog.id}`,
    lastModified: blog.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  return [...staticPages, ...platformPages, ...symptomPages, ...areaPages, ...tenantPages, ...blogPages]
}
