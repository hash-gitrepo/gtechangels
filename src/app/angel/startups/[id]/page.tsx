import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard-shell";
import { requestIntroduction } from "@/lib/actions/introductions";

// FR-25/26: startup detail visible to angels post-approval, with an
// introduction-request workflow.
export default async function StartupDetailPage({ params }: { params: { id: string } }) {
  const session = await requireRole("ANGEL");
  const member = await prisma.member.findUniqueOrThrow({ where: { userId: session.user.id } });

  const startup = await prisma.startup.findUnique({ where: { id: params.id } });
  if (!startup || !startup.isVisibleToAngels) notFound();

  const existingIntro = await prisma.introduction.findFirst({
    where: { startupId: startup.id, memberId: member.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardShell role="ANGEL" name={session.user.name}>
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold">{startup.name}</h1>
          <p className="text-sm text-black/60">
            {startup.sector} &middot; {startup.stage.replace("_", " ")} &middot; {startup.region}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-4 text-sm">
          <Item label="ICP segment" value={startup.icpSegment} />
          <Item label="ICP geography" value={startup.icpGeography} />
          <Item label="Traction (ARR/MRR band)" value={startup.arrMrrBand} />
          <Item label="Funding ask" value={startup.fundingAskAmount ? `₹${startup.fundingAskAmount}` : undefined} />
          <Item label="Help sought" value={startup.helpSought ?? undefined} />
          <Item label="Website" value={startup.website} />
        </dl>

        {startup.helpDetails && (
          <p className="text-sm bg-black/[.03] rounded-md p-3">{startup.helpDetails}</p>
        )}

        {startup.pitchDeckUrl && (
          <a href={startup.pitchDeckUrl} target="_blank" rel="noreferrer" className="text-brand hover:underline text-sm">
            View pitch deck (PDF)
          </a>
        )}

        <section className="rounded-lg border border-black/10 p-5">
          <h2 className="font-semibold mb-3">Introduction</h2>
          {existingIntro ? (
            <p className="text-sm text-black/70">
              Status: <span className="font-medium">{existingIntro.state}</span>
            </p>
          ) : (
            <form action={requestIntroduction} className="flex flex-col gap-3">
              <input type="hidden" name="startupId" value={startup.id} />
              <input type="hidden" name="memberId" value={member.id} />
              <textarea
                name="contextNote"
                rows={3}
                placeholder="Short context for the introduction…"
                className="rounded-md border border-black/15 px-3 py-2 text-sm"
              />
              <button className="self-start rounded-md bg-brand px-4 py-2 text-white text-sm font-medium hover:bg-brand-dark">
                Request introduction
              </button>
            </form>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}

function Item({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-black/50">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
