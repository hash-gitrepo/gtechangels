"use client";

import { signOut } from "next-auth/react";
import { ROLE_LABELS } from "@/lib/rbac";
import type { Role } from "@prisma/client";

export function DashboardShell({
  role,
  name,
  children,
}: {
  role: Role;
  name?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-black/10 px-6 py-4 flex items-center justify-between">
        <div>
          <span className="font-semibold text-brand-dark">GTECH Angels</span>
          <span className="ml-3 text-xs uppercase tracking-wide text-black/40">
            {ROLE_LABELS[role]}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          {name && <span className="text-black/60">{name}</span>}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-brand hover:underline"
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
