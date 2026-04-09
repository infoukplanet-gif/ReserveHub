import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'

type Props = { params: Promise<{ slug: string }> }

export default async function BlogListPage({ params }: Props) {
  const { slug } = await params
  const tenant = await prisma.tenant.findUnique({ where: { slug } })
  if (!tenant) notFound()

  const posts = await prisma.blogPost.findMany({
    where: { tenantId: tenant.id, isPublished: true },
    orderBy: { publishedAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white border-b"><div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href={`/${slug}`} className="text-slate-500 text-sm">← {tenant.name}</Link>
        <Link href={`/${slug}/book`}><button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium">来院予約する</button></Link>
      </div></header>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-slate-900 text-center mb-8">お知らせ・ブログ</h1>
        {posts.length === 0 ? (
          <p className="text-center text-sm text-slate-400">記事がまだありません</p>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <Link key={post.id} href={`/${slug}/blog/${post.id}`}>
                <div className="border rounded-xl p-5 hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    {post.category && <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">{post.category}</span>}
                    {post.publishedAt && <span className="text-xs text-slate-400">{new Date(post.publishedAt).toLocaleDateString('ja-JP')}</span>}
                  </div>
                  <h2 className="text-base font-semibold text-slate-900">{post.title}</h2>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
