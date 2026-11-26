import { NextResponse, type NextRequest } from "next/server";

// Быстрая проверка: без cookie входа сразу на страницу пароля.
// Настоящая проверка cookie — в разметке админки и в каждом действии (там есть доступ к секретному ключу).
export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/admin/login")) return NextResponse.next();
  if (req.cookies.get("katy_admin")?.value) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/admin/:path*"] };
