import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const roleForPrefix: Record<string, string[]> = {
  "/angel": ["ANGEL"],
  "/startup": ["STARTUP"],
  "/admin": ["ADMIN"],
  "/screener": ["SCREENER", "ADMIN"],
  "/leadership": ["LEADERSHIP", "ADMIN"],
};

export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    pages: { signIn: "/auth/signin" },
    callbacks: {
      authorized: ({ token, req }) => {
        if (!token) return false;
        const prefix = Object.keys(roleForPrefix).find((p) =>
          req.nextUrl.pathname.startsWith(p)
        );
        if (!prefix) return true;
        return roleForPrefix[prefix].includes(token.role as string);
      },
    },
  }
);

export const config = {
  matcher: ["/angel/:path*", "/startup/:path*", "/admin/:path*", "/screener/:path*", "/leadership/:path*"],
};
