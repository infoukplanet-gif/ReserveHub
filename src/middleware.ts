import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)

  // 認証ガード: /dashboard/*, /mypage は認証必須
  const protectedPaths = ['/dashboard', '/mypage']
  const isProtected = protectedPaths.some(p => request.nextUrl.pathname.startsWith(p))
  if (isProtected) {
    const supabaseAuth = request.cookies.getAll().some(c => c.name.includes('auth-token'))
    if (!supabaseAuth) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
