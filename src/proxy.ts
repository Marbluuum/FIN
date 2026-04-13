import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/session";

const publicRoutes = ["/login"];
const publicApiRoutes = ["/api/auth/login", "/api/setup-db", "/api/stripe/webhook"];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Allow public API routes without auth
  if (publicApiRoutes.some((r) => path.startsWith(r))) {
    return NextResponse.next();
  }

  const isPublicRoute = publicRoutes.includes(path);
  const cookie = req.cookies.get("session")?.value;
  const session = await decrypt(cookie);

  if (!isPublicRoute && !session?.userId) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isPublicRoute && session?.userId) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
