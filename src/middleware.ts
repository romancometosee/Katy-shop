import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, adminPassword, tokenFor } from "./lib/auth";

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/admin/login")) return NextResponse.next();
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (token && token === (await tokenFor(adminPassword()))) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/admin/:path*"] };
