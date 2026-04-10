import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://reserve-app-mu.vercel.app'

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/search', '/clinics/'],
        disallow: ['/api/', '/dashboard/', '/mypage', '/login', '/register', '/forgot-password'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
