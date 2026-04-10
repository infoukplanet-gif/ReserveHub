'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useState, useEffect } from 'react'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import type { ThemeId } from '@/lib/themes'

const navItems = [
  { href: '/dashboard', label: 'ダッシュボード', icon: 'dashboard' },
  { href: '/dashboard/reservations', label: '来院予約', icon: 'calendar_month' },
  { href: '/dashboard/menus', label: '施術メニュー', icon: 'spa' },
  { href: '/dashboard/staff', label: '施術者管理', icon: 'group' },
  { href: '/dashboard/customers', label: '患者管理', icon: 'person' },
  { href: '/dashboard/tickets', label: '回数券管理', icon: 'confirmation_number' },
  { href: '/dashboard/follow-up', label: 'フォローアップ', icon: 'send' },
  { href: '/dashboard/chat', label: 'チャット', icon: 'chat' },
  { href: '/dashboard/reviews', label: '口コミ管理', icon: 'reviews' },
  { href: '/dashboard/sales', label: '売上レポート', icon: 'bar_chart' },
  { href: '/dashboard/homepage', label: 'ホームページ', icon: 'language' },
  { href: '/dashboard/blog', label: 'ブログ', icon: 'edit_note' },
  { href: '/dashboard/billing', label: '課金プラン', icon: 'credit_card' },
]

const settingsItems = [
  { href: '/dashboard/settings?tab=hours', label: '営業時間', icon: 'schedule' },
  { href: '/dashboard/settings?tab=general', label: '院情報', icon: 'info' },
  { href: '/dashboard/settings?tab=booking', label: '予約設定', icon: 'tune' },
  { href: '/dashboard/settings?tab=carte', label: 'カルテ設定', icon: 'medical_information' },
]

function SidebarContent({ pathname }: { pathname: string }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white text-sm font-bold">
            R
          </div>
          <span className="font-semibold text-slate-900">ReserveHub</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
              pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                ? 'bg-blue-50 text-blue-600 font-semibold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            )}
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            {item.label}
          </Link>
        ))}

        <div className="my-3 border-t" />

        <p className="px-3 py-1 text-xs font-medium text-slate-400 uppercase tracking-wider">設定</p>
        {settingsItems.map((item) => {
          const isActive = pathname.startsWith('/dashboard/settings') && item.href.includes(pathname === '/dashboard/settings' ? (item.href.includes('hours') ? 'hours' : '') : '')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-medium text-slate-600">
            大
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">大野 勇樹</p>
            <p className="text-xs text-slate-500">オーナー</p>
          </div>
          <button
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' })
              window.location.href = '/login'
            }}
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            ログアウト
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [dashboardTheme, setDashboardTheme] = useState<ThemeId>('flat')

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(r => {
      const theme = r.data?.tenant?.dashboardTheme
      if (theme) setDashboardTheme(theme as ThemeId)
    }).catch(() => {})
  }, [])

  return (
    <ThemeProvider initialTheme={dashboardTheme}>
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />
      <div className="flex h-screen bg-slate-50">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:border-r lg:bg-white">
          <SidebarContent pathname={pathname} />
        </aside>

        {/* Mobile Header + Sheet */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-14 items-center gap-3 border-b bg-white px-4 lg:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger>
                <span className="material-symbols-outlined text-slate-600">menu</span>
              </SheetTrigger>
              <SheetContent side="left" className="w-60 p-0">
                <SidebarContent pathname={pathname} />
              </SheetContent>
            </Sheet>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white text-sm font-bold">
              R
            </div>
            <span className="font-semibold text-slate-900">ReserveHub</span>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-[1200px] p-4 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
    </ThemeProvider>
  )
}
