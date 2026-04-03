import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://reserve-app-mu.vercel.app'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
  ]

  // Dynamic tenant pages
  const tenants = await prisma.tenant.findMany({ select: { slug: true, updatedAt: true } })

  const tenantPages: MetadataRoute.Sitemap = tenants.flatMap((tenant) => [
    { url: `${baseUrl}/${tenant.slug}`, lastModified: tenant.updatedAt, changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${baseUrl}/${tenant.slug}/menu`, lastModified: tenant.updatedAt, changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${baseUrl}/${tenant.slug}/staff`, lastModified: tenant.updatedAt, changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${baseUrl}/${tenant.slug}/blog`, lastModified: tenant.updatedAt, changeFrequency: 'weekly' as const, priority: 0.6 },
  ])

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

  return [...staticPages, ...tenantPages, ...blogPages]
}
