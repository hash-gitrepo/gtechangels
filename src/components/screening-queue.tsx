import { prisma } from "@/lib/prisma";
import { decideScreening } from "@/lib/actions/screening";

const SLA_DAYS = 14; // FR-23

export async function ScreeningQueue() {
  const startups = await prisma.startup.findMany({
    where: { currentScreeningState: { in: ["APPLIED", "IN_SCREENING", "ON_HOLD"] } },
    orderBy: { createdAt: "asc" },
    include: { screeningRecords: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  return (
    <div className="grid gap-4">
      {startups.map((s) => {
        const daysWaiting = Math.floor((Date.now() - s.createdAt.getTime()) / 86_400_000);
        const overdue = daysWaiting > SLA_DAYS;
        return (
          <div key={s.id} className="rounded-lg border border-black/10 p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="font-medium">{s.name}</span>
                <span className="text-black/50 text-sm ml-2">
                  {s.sector} &middot; {s.stage.replace("_", " ")} &middot; {s.region}
                </span>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  overdue ? "bg-red-100 text-red-700" : "bg-black/5 text-black/60"
                }`}
              >
                {daysWaiting}d waiting {overdue && "· SLA breached"}
              </span>
            </div>

            <form action={decideScreening} className="flex flex-wrap items-end gap-3 text-sm mt-3">
              <input type="hidden" name="startupId" value={s.id} />
              <label className="flex flex-col gap-1">
                Score
                <input name="totalScore" type="number" step="0.1" className="rounded-md border border-black/15 px-2 py-1 w-24" />
              </label>
              <label className="flex flex-col gap-1 flex-1 min-w-[200px]">
                Notes (internal only)
                <input name="notes" className="rounded-md border border-black/15 px-2 py-1" />
              </label>
              <button name="state" value="IN_SCREENING" className="rounded-md border border-black/15 px-3 py-1.5 hover:border-brand">
                In screening
              </button>
              <button name="state" value="ON_HOLD" className="rounded-md border border-black/15 px-3 py-1.5 hover:border-brand">
                On hold
              </button>
              <button name="state" value="REJECTED" className="rounded-md border border-red-200 text-red-700 px-3 py-1.5 hover:bg-red-50">
                Reject
              </button>
              <button name="state" value="APPROVED" className="rounded-md bg-brand text-white px-3 py-1.5 hover:bg-brand-dark">
                Approve
              </button>
            </form>
          </div>
        );
      })}
      {startups.length === 0 && <p className="text-sm text-black/50">Queue is empty.</p>}
    </div>
  );
}
