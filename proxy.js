import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/admin/login", "/register", "/forgot-password", "/reset-password"];

export async function proxy(req) {
  const { pathname } = req.nextUrl;

  if (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "noori-travels-dev-secret-change-me" });

  const isAdminArea = pathname.startsWith("/admin");

  if (!token) {
    const loginUrl = isAdminArea ? "/admin/login" : "/login";
    return NextResponse.redirect(new URL(loginUrl, req.url));
  }

  if (isAdminArea && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (!isAdminArea && token.role === "ADMIN" && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
