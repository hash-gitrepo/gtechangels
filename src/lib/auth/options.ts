import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifyOtp, OtpInvalidError } from "@/lib/auth/otp";

// NextAuth v4 + Credentials provider: no passwords are ever stored — the
// "credential" is a one-time code emailed via Resend (see lib/auth/otp.ts).
// PrismaAdapter still manages User/Account rows; sessions are JWTs because
// the Credentials provider is incompatible with the database session strategy.
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify",
    error: "/auth/error",
  },
  providers: [
    CredentialsProvider({
      id: "otp",
      name: "Email code",
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.code) return null;

        try {
          await verifyOtp(credentials.email, credentials.code);
        } catch (err) {
          if (err instanceof OtpInvalidError) return null;
          throw err;
        }

        const email = credentials.email.trim().toLowerCase();
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        if (!user.emailVerified) {
          await prisma.user.update({
            where: { id: user.id },
            data: { emailVerified: new Date() },
          });
          if (user.role === "ANGEL") {
            await prisma.member.updateMany({
              where: { userId: user.id, status: "PENDING_VERIFICATION" },
              data: { status: "ACTIVE" },
            });
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: Role }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};
