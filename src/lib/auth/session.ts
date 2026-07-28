import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { authOptions } from "@/lib/auth/options";

export function getSession() {
  return getServerSession(authOptions);
}

export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/auth/signin");
  return session;
}

export async function requireRole(...roles: Role[]) {
  const session = await requireSession();
  if (!roles.includes(session.user.role)) redirect("/");
  return session;
}
