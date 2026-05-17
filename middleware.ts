import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session-token";

export default async function middleware(request: NextRequest) {
  const userId = await verifySessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  if (userId) return NextResponse.next();
  const signInUrl = new URL("/auth/sign-in", request.url);
  if (request.nextUrl.pathname.startsWith("/app")) {
    signInUrl.searchParams.set("callbackUrl", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  }
  return NextResponse.redirect(signInUrl);
}

export const config = {
  matcher: ["/app/:path*", "/api/billing/:path*"]
};
