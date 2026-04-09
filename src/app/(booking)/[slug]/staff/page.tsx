import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'

type Props = { params: Promise<{ slug: string }> }

export default async function StaffPage({ params }: Props) {
  const { slug } = await params
  const tenant = await prisma.tenant.findUnique({ where: { slug } })
  if (!tenant) notFound()

  const staff = await prisma.staff.findMany({
    where: { tenantId: tenant.id, isActive: true },
    orderBy: { displayOrder: 'asc' },
  })

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white border-b"><div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href={`/${slug}`} className="text-slate-500 text-sm">← {tenant.name}</Link>
        <Link href={`/${slug}/book`}><button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium">来院予約する</button></Link>
      </div></header>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-slate-900 text-center mb-8">施術者紹介</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {staff.map(s => (
            <div key={s.id} className="text-center">
              <div className="w-24 h-24 mx-auto rounded-full bg-blue-50 flex items-center justify-center text-2xl font-bold text-blue-600">
                {s.avatarUrl ? <img src={s.avatarUrl} alt={s.name} className="w-full h-full rounded-full object-cover" /> : s.name[0]}
              </div>
              <p className="mt-3 text-base font-semibold text-slate-900">{s.name}</p>
              {s.bio && <p className="mt-1 text-sm text-slate-500">{s.bio}</p>}
              {s.nominationFee > 0 && <p className="mt-1 text-xs text-slate-400">指名料 ¥{s.nominationFee.toLocaleString()}</p>}
              <Link href={`/${slug}/book`}><button className="mt-3 px-4 py-1.5 rounded-lg border border-blue-600 text-blue-600 text-xs font-medium hover:bg-blue-50">この施術者で来院予約</button></Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
