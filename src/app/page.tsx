import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { ROLE_HOME } from "@/lib/rbac";

export default async function Home() {
  const session = await getSession();

  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-black/10 px-6 py-4 flex items-center justify-between">
        <span className="font-semibold text-brand-dark text-lg">GTECH Angels</span>
        {session ? (
          <Link
            href={ROLE_HOME[session.user.role]}
            className="text-sm font-medium text-brand hover:underline"
          >
            Go to dashboard
          </Link>
        ) : (
          <Link
            href="/auth/signin"
            className="text-sm font-medium text-brand hover:underline"
          >
            Sign in
          </Link>
        )}
      </header>

      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 gap-6">
        <h1 className="text-3xl sm:text-4xl font-bold max-w-2xl">
          Connecting GTECH angel investors with Kerala&apos;s startups
        </h1>
        <p className="max-w-xl text-black/60">
          A single trusted place for GTECH member companies to declare capital and
          market-access commitments, and for screened Kerala startups to be
          discovered, introduced, and backed.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mt-4">
          <Link
            href="/signup/angel"
            className="rounded-md bg-brand px-5 py-2.5 text-white text-sm font-medium hover:bg-brand-dark"
          >
            Join as an Angel
          </Link>
          <Link
            href="/signup/startup"
            className="rounded-md border border-brand px-5 py-2.5 text-brand text-sm font-medium hover:bg-brand-light"
          >
            Apply as a Startup
          </Link>
        </div>
      </section>

      <footer className="px-6 py-6 text-center text-xs text-black/40 border-t border-black/10">
        GTECH Angels &middot; Startup Engagement Focus Group
      </footer>
    </main>
  );
}
