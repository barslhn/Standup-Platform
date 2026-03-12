import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getTokenRole } from "@/lib/jwt";

const PUBLIC_PATHS = ["/login", "/register", "/forgot-password", "/reset-password"];
const MANAGER_ONLY_PATHS = ["/manager"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = req.cookies.get("auth-token")?.value;

  if (!token) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  const role = getTokenRole(token);

  if (!role) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete("auth-token");
    return res;
  }

  if (MANAGER_ONLY_PATHS.some((p) => pathname.startsWith(p)) && role !== "MANAGER") {
    const dashboardUrl = req.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};