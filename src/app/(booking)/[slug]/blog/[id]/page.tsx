import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'

type Props = { params: Promise<{ slug: string; id: string }> }

export default async function BlogPostPage({ params }: Props) {
  const { slug, id } = await params
  const tenant = await prisma.tenant.findUnique({ where: { slug } })
  if (!tenant) notFound()

  const post = await prisma.blogPost.findFirst({
    where: { id, tenantId: tenant.id, isPublished: true },
  })
  if (!post) notFound()

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white border-b"><div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href={`/${slug}/blog`} className="text-slate-500 text-sm">← ブログ一覧</Link>
        <Link href={`/${slug}/book`}><button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium">予約する</button></Link>
      </div></header>

      <article className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center gap-2 mb-4">
          {post.category && <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">{post.category}</span>}
          {post.publishedAt && <span className="text-sm text-slate-400">{new Date(post.publishedAt).toLocaleDateString('ja-JP')}</span>}
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-8">{post.title}</h1>
        <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
        <div className="mt-12 text-center">
          <Link href={`/${slug}/book`}><button className="px-8 py-3 rounded-lg bg-blue-600 text-white font-semibold">予約はこちら</button></Link>
        </div>
      </article>
    </div>
  )
}
