import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard-shell";
import { PitchDeckUpload } from "@/components/pitch-deck-upload";
import { formatCommittedAmount } from "@/lib/visibility";

// FR-25 (Open Q2 default: startups see the angel directory), FR-18, FR-27.
export default async function StartupDashboard() {
  const session = await requireRole("STARTUP");
  const startup = await prisma.startup.findUniqueOrThrow({ where: { userId: session.user.id } });

  const [angels, introductions] = await Promise.all([
    prisma.member.findMany({ where: { status: "ACTIVE" }, orderBy: { updatedAt: "desc" }, take: 50 }),
    prisma.introduction.findMany({
      where: { startupId: startup.id },
      include: { member: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <DashboardShell role="STARTUP" name={session.user.name}>
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        <section className="rounded-lg border border-black/10 p-5">
          <h2 className="font-semibold mb-2">{startup.name}</h2>
          <div className="text-sm text-black/70 flex flex-wrap gap-x-8 gap-y-1 mb-4">
            <span>Screening: {startup.currentScreeningState}</span>
            <span>Visible to angels: {startup.isVisibleToAngels ? "Yes" : "Not yet"}</span>
            <span>{startup.sector} &middot; {startup.stage.replace("_", " ")}</span>
          </div>
          <PitchDeckUpload currentUrl={startup.pitchDeckUrl} />
        </section>

        <section>
          <h2 className="font-semibold mb-4">Introductions</h2>
          <div className="grid gap-3">
            {introductions.map((i) => (
              <div key={i.id} className="rounded-lg border border-black/10 p-4 text-sm flex items-center justify-between">
                <div>
                  <span className="font-medium">{i.member.companyName}</span>
                  <span className="text-black/50 ml-2">{i.state}</span>
                </div>
              </div>
            ))}
            {introductions.length === 0 && (
              <p className="text-sm text-black/50">No introductions yet.</p>
            )}
          </div>
        </section>

        {startup.isVisibleToAngels && (
          <section>
            <h2 className="font-semibold mb-4">Angel directory</h2>
            <div className="grid gap-3">
              {angels.map((a) => {
                const amountLabel = formatCommittedAmount(a);
                return (
                  <div key={a.id} className="rounded-lg border border-black/10 p-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{a.companyName}</span>
                      <span className="text-black/50">{a.region}</span>
                    </div>
                    <p className="text-black/60 mt-1">
                      {a.technologyDomains.join(", ") || "—"}
                    </p>
                    {amountLabel && <p className="text-black/60 mt-1">Committed: {amountLabel}</p>}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </DashboardShell>
  );
}
