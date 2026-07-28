import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard-shell";
import { facilitateIntroduction, updateIntroductionState } from "@/lib/actions/introductions";

// FR-27/28: admin view of the introduction queue, plus curated match suggestions.
export default async function AdminIntroductionsPage() {
  const session = await requireRole("ADMIN");

  const [introductions, angels, startups] = await Promise.all([
    prisma.introduction.findMany({
      include: { member: true, startup: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.member.findMany({ where: { status: "ACTIVE" }, orderBy: { companyName: "asc" } }),
    prisma.startup.findMany({ where: { isVisibleToAngels: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <DashboardShell role="ADMIN" name={session.user.name}>
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        <section>
          <h1 className="text-xl font-bold mb-4">Curate a match</h1>
          <form action={facilitateIntroduction} className="flex flex-wrap items-end gap-3 text-sm">
            <label className="flex flex-col gap-1">
              Angel
              <select name="memberId" required className="rounded-md border border-black/15 px-2 py-1.5">
                {angels.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.companyName}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              Startup
              <select name="startupId" required className="rounded-md border border-black/15 px-2 py-1.5">
                {startups.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 flex-1 min-w-[200px]">
              Context note
              <input name="contextNote" className="rounded-md border border-black/15 px-2 py-1.5" />
            </label>
            <button className="rounded-md bg-brand text-white px-4 py-1.5 hover:bg-brand-dark">
              Facilitate
            </button>
          </form>
        </section>

        <section>
          <h2 className="font-semibold mb-4">All introductions</h2>
          <div className="grid gap-3">
            {introductions.map((i) => (
              <div key={i.id} className="rounded-lg border border-black/10 p-4 text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">
                    {i.member.companyName} &harr; {i.startup.name}
                  </span>
                  <span className="text-black/50">{i.state}</span>
                </div>
                {i.contextNote && <p className="text-black/60 mb-2">{i.contextNote}</p>}
                <form action={updateIntroductionState} className="flex gap-2">
                  <input type="hidden" name="id" value={i.id} />
                  {(["ACCEPTED", "DECLINED", "MEETING_HELD", "PROGRESSING", "CLOSED"] as const).map((s) => (
                    <button
                      key={s}
                      name="state"
                      value={s}
                      className="rounded-md border border-black/15 px-2 py-1 text-xs hover:border-brand"
                    >
                      {s.replace("_", " ")}
                    </button>
                  ))}
                </form>
              </div>
            ))}
            {introductions.length === 0 && <p className="text-sm text-black/50">No introductions yet.</p>}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
