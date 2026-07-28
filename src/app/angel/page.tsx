import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard-shell";

// FR-24: angel directory view of approved startups with filters.
export default async function AngelDashboard({
  searchParams,
}: {
  searchParams: { sector?: string; stage?: string; region?: string };
}) {
  const session = await requireRole("ANGEL");

  const member = await prisma.member.findUnique({ where: { userId: session.user.id } });

  const startups = await prisma.startup.findMany({
    where: {
      isVisibleToAngels: true,
      sector: searchParams.sector || undefined,
      stage: (searchParams.stage as never) || undefined,
      region: (searchParams.region as never) || undefined,
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <DashboardShell role="ANGEL" name={session.user.name}>
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        <section className="rounded-lg border border-black/10 p-5">
          <h2 className="font-semibold mb-2">Your profile</h2>
          {member ? (
            <div className="text-sm text-black/70 flex flex-wrap gap-x-8 gap-y-1">
              <span>Status: {member.status}</span>
              <span>Region: {member.region}</span>
              <span>Completeness: {member.profileCompleteness}%</span>
            </div>
          ) : (
            <p className="text-sm text-black/60">Profile not found.</p>
          )}
        </section>

        <section>
          <h2 className="font-semibold mb-4">Approved startups</h2>
          <form className="flex gap-3 mb-4 text-sm" action="/angel">
            <input
              name="sector"
              placeholder="Sector"
              defaultValue={searchParams.sector}
              className="rounded-md border border-black/15 px-3 py-1.5"
            />
            <select
              name="stage"
              defaultValue={searchParams.stage ?? ""}
              className="rounded-md border border-black/15 px-3 py-1.5"
            >
              <option value="">Any stage</option>
              <option value="IDEA">Idea</option>
              <option value="MVP">MVP</option>
              <option value="EARLY_REVENUE">Early Revenue</option>
              <option value="GROWTH">Growth</option>
            </select>
            <select
              name="region"
              defaultValue={searchParams.region ?? ""}
              className="rounded-md border border-black/15 px-3 py-1.5"
            >
              <option value="">Any region</option>
              <option value="TRIVANDRUM">Trivandrum</option>
              <option value="KOCHI">Kochi</option>
              <option value="CALICUT">Calicut</option>
              <option value="OTHER">Other</option>
            </select>
            <button className="rounded-md bg-brand px-4 py-1.5 text-white">Filter</button>
          </form>

          <div className="grid gap-3">
            {startups.map((s) => (
              <Link
                key={s.id}
                href={`/angel/startups/${s.id}`}
                className="rounded-lg border border-black/10 p-4 hover:border-brand transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{s.name}</span>
                  <span className="text-xs text-black/50">{s.stage.replace("_", " ")}</span>
                </div>
                <p className="text-sm text-black/60 mt-1">
                  {s.sector} &middot; {s.region}
                </p>
                {s.helpDetails && (
                  <p className="text-sm text-black/60 mt-1 line-clamp-2">{s.helpDetails}</p>
                )}
              </Link>
            ))}
            {startups.length === 0 && (
              <p className="text-sm text-black/50">No startups match those filters yet.</p>
            )}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
