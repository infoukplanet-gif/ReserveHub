import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'

type Props = { params: Promise<{ slug: string }> }

export default async function MenuPage({ params }: Props) {
  const { slug } = await params
  const tenant = await prisma.tenant.findUnique({ where: { slug } })
  if (!tenant) notFound()

  const [menus, categories] = await Promise.all([
    prisma.menu.findMany({
      where: { tenantId: tenant.id, isActive: true },
      include: { pricingRules: true, menuOptions: { where: { isActive: true } }, category: true },
      orderBy: { displayOrder: 'asc' },
    }),
    prisma.menuCategory.findMany({ where: { tenantId: tenant.id }, orderBy: { displayOrder: 'asc' } }),
  ])

  function getPriceRange(base: number, rules: { price: number }[]) {
    const prices = [base, ...rules.map(r => r.price)]
    const min = Math.min(...prices), max = Math.max(...prices)
    return min === max ? `¥${min.toLocaleString()}` : `¥${min.toLocaleString()}〜¥${max.toLocaleString()}`
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white border-b"><div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href={`/${slug}`} className="text-slate-500 text-sm">← {tenant.name}</Link>
        <Link href={`/${slug}/book`}><button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium">予約する</button></Link>
      </div></header>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-slate-900 text-center mb-8">メニュー・料金</h1>

        {categories.map(cat => {
          const catMenus = menus.filter(m => m.categoryId === cat.id)
          if (catMenus.length === 0) return null
          return (
            <div key={cat.id} className="mb-10">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">{cat.name}</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {catMenus.map(menu => (
                  <div key={menu.id} className="border rounded-xl p-5">
                    <h3 className="text-base font-semibold text-slate-900">{menu.name}</h3>
                    {menu.description && <p className="text-sm text-slate-500 mt-1">{menu.description}</p>}
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-slate-400">{menu.durationMinutes}分{menu.bufferMinutes > 0 ? ` (+${menu.bufferMinutes}分)` : ''}</span>
                      <span className="text-lg font-bold text-slate-900">{getPriceRange(menu.basePrice, menu.pricingRules)}</span>
                    </div>
                    {menu.menuOptions.length > 0 && (
                      <div className="mt-3 pt-3 border-t space-y-1">
                        <p className="text-xs text-slate-400">オプション:</p>
                        {menu.menuOptions.map(o => (
                          <div key={o.id} className="flex justify-between text-xs">
                            <span className="text-slate-600">{o.name}</span>
                            <span className="text-slate-500">+¥{o.price.toLocaleString()}{o.durationMinutes > 0 ? ` (+${o.durationMinutes}分)` : ''}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <Link href={`/${slug}/book`}><button className="mt-4 w-full py-2 rounded-lg border border-blue-600 text-blue-600 text-sm font-medium hover:bg-blue-50">このメニューで予約</button></Link>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        <p className="text-xs text-slate-400 text-center mt-8">※料金は曜日・時間帯により異なります。詳細は予約画面でご確認ください。</p>
      </div>
    </div>
  )
}
