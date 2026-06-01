import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  // Проксируем токен в заголовок Authorization для всех запросов к Java бэкенду
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const token = request.cookies.get('token')?.value;
    
    if (token) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('Authorization', `Bearer ${token}`);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
}
