import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || ''
  const path = request.nextUrl.pathname
  
  // Immediate crawler bypass to prevent any auth/session logic from interfering with social crawlers
  const isCrawler = /facebookexternalhit|Facebot|WhatsApp|Twitterbot|LinkedInBot|TelegramBot|Slackbot|Discord|Googlebot|bingbot|Pinterestbot|redditbot|applebot/i.test(userAgent)
  
  if (isCrawler) {
    console.log(`[proxy] CRAWLER DETECTED: ${userAgent} for ${path}`);
    return NextResponse.next()
  }

  console.log(`[proxy] NORMAL USER: ${userAgent} for ${path}`);
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (svg, png, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
