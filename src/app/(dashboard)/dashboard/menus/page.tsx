'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

type Menu = {
  id: string
  name: string
  description: string | null
  durationMinutes: number
  bufferMinutes: number
  basePrice: number
  isActive: boolean
  category: { id: string; name: string } | null
  pricingRules: { id: string; price: number }[]
  menuOptions: { id: string; name: string; price: number }[]
  _count: { staffMenus: number }
}

function formatPrice(price: number) {
  return `¥${price.toLocaleString()}`
}

function getPriceRange(basePrice: number, rules: { price: number }[]) {
  const prices = [basePrice, ...rules.map((r) => r.price)]
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  return min === max ? formatPrice(min) : `${formatPrice(min)} - ${formatPrice(max)}`
}

export default function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(true)

  const loadMenus = () => {
    fetch('/api/menus').then(r => r.json()).then(d => { setMenus(d.data || []); setLoading(false) }).catch(() => setLoading(false))
  }

  const deleteMenu = async (id: string) => {
    const res = await fetch(`/api/menus/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('メニューを削除しました'); loadMenus() }
    else toast.error('削除に失敗しました')
  }
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => { loadMenus()
  }, [])

  const categories = Array.from(new Set(menus.map((m) => m.category?.name).filter(Boolean)))
  const filteredMenus =
    activeTab === 'all' ? menus : menus.filter((m) => m.category?.name === activeTab)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">メニュー管理</h1>
          <p className="text-sm text-slate-500 mt-1">サービスメニューの管理</p>
        </div>
        <Link href="/dashboard/menus/new">
          <Button>+ メニューを追加</Button>
        </Link>
      </div>

      {/* Category Tabs */}
      {categories.length > 0 && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">すべて</TabsTrigger>
            {categories.map((cat) => (
              <TabsTrigger key={cat} value={cat!}>
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {/* Menu List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="h-5 w-48 bg-slate-100 rounded animate-pulse" />
                <div className="h-4 w-32 bg-slate-100 rounded animate-pulse mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredMenus.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <span className="material-symbols-outlined text-5xl text-slate-300">restaurant_menu</span>
            <p className="text-slate-500 mt-3">メニューがまだありません</p>
            <Link href="/dashboard/menus/new">
              <Button variant="outline" className="mt-4">+ メニューを追加</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredMenus.map((menu) => (
            <Link key={menu.id} href={`/dashboard/menus/${menu.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-slate-900">{menu.name}</h3>
                        <Badge variant={menu.isActive ? 'default' : 'secondary'}>
                          {menu.isActive ? '公開中' : '非公開'}
                        </Badge>
                      </div>
                      {menu.description && (
                        <p className="text-sm text-slate-500 mt-1 truncate">{menu.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                        <span>{menu.durationMinutes}分{menu.bufferMinutes > 0 ? ` (+${menu.bufferMinutes}分)` : ''}</span>
                        <span>オプション: {menu.menuOptions.length}個</span>
                        <span>スタッフ: {menu._count.staffMenus}名</span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-lg font-semibold text-slate-900">
                        {getPriceRange(menu.basePrice, menu.pricingRules)}
                      </p>
                      {menu.pricingRules.length > 0 && (
                        <p className="text-xs text-slate-400">
                          {menu.pricingRules.length}件の料金ルール
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex justify-end">
                    <AlertDialog>
                      <AlertDialogTrigger>
                        <span onClick={e => e.preventDefault()} className="text-xs text-slate-400 hover:text-red-500 cursor-pointer">削除</span>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>メニューを削除しますか？</AlertDialogTitle><AlertDialogDescription>「{menu.name}」を削除します。この操作は取り消せません。</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>キャンセル</AlertDialogCancel><AlertDialogAction onClick={() => deleteMenu(menu.id)} className="bg-red-600 hover:bg-red-700">削除する</AlertDialogAction></AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
