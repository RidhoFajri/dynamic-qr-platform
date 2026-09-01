import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth")
  const isApiRoute = nextUrl.pathname.startsWith("/api")
  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard")
  const isAuthRoute = nextUrl.pathname.startsWith("/login")
  const isRedirectRoute = nextUrl.pathname.startsWith("/r/")

  // Allow next-auth API routes
  if (isApiAuthRoute) return;

  // Let the QR redirect route and other public routes pass
  if (isRedirectRoute) return;

  // Protect dashboard routes
  if (isDashboardRoute && !isLoggedIn) {
    let callbackUrl = nextUrl.pathname
    if (nextUrl.search) {
      callbackUrl += nextUrl.search
    }
    const encodedCallbackUrl = encodeURIComponent(callbackUrl)
    return NextResponse.redirect(new URL(`/login?callbackUrl=${encodedCallbackUrl}`, nextUrl))
  }

  // Redirect away from login if already logged in
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl))
  }

  return;
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
