import { NextResponse } from "next/server";

const CACHEABLE_METHODS = new Set(["GET", "HEAD"]);

export function middleware(request) {
  if (!CACHEABLE_METHODS.has(request.method)) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  response.headers.set(
    "Cache-Control",
    "public, s-maxage=60, stale-while-revalidate=300"
  );
  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};