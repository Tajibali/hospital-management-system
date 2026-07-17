import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    const roleForPath = path.startsWith("/admin")
      ? "ADMIN"
      : path.startsWith("/doctor")
      ? "DOCTOR"
      : path.startsWith("/staff")
      ? "STAFF"
      : null;

    if (roleForPath && token?.role !== roleForPath) {
      const loginPath =
        roleForPath === "ADMIN"
          ? "/admin/login"
          : roleForPath === "DOCTOR"
          ? "/doctor/login"
          : "/staff/login";
      return NextResponse.redirect(new URL(loginPath, req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/admin/dashboard/:path*",
    "/admin/patients/:path*",
    "/admin/doctors/:path*",
    "/admin/staff/:path*",
    "/admin/appointments/:path*",
    "/admin/leave/:path*",
    "/admin/qr-scanner/:path*",
    "/admin/analytics/:path*",
    "/doctor/dashboard/:path*",
    "/doctor/appointments/:path*",
    "/doctor/leave/:path*",
    "/staff/dashboard/:path*",
    "/staff/appointments/:path*",
    "/staff/leave/:path*",
  ],
};
