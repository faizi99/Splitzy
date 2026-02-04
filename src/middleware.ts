import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next()
  }

  // Check if user has session cookie
  const sessionToken = request.cookies.get("authjs.session-token") ||
                       request.cookies.get("__Secure-authjs.session-token")

  const isLoggedIn = !!sessionToken
  const isAuthPage = pathname.startsWith("/auth")

  // Redirect logged-in users away from auth pages to home
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Redirect non-logged-in users to sign-in page
  if (!isAuthPage && !isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/signin", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
