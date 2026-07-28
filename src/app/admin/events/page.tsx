import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard-shell";
import { createEvent } from "@/lib/actions/events";

export default async function AdminEventsPage() {
  const session = await requireRole("ADMIN");
  const events = await prisma.event.findMany({
    include: { rsvps: true },
    orderBy: { date: "desc" },
  });

  return (
    <DashboardShell role="ADMIN" name={session.user.name}>
      <div className="max-w-3xl mx-auto flex flex-col gap-8">
        <section>
          <h1 className="text-xl font-bold mb-4">Create event</h1>
          <form action={createEvent} className="grid grid-cols-2 gap-3 text-sm">
            <label className="flex flex-col gap-1 col-span-2">
              Title
              <input name="title" required className="rounded-md border border-black/15 px-2 py-1.5" />
            </label>
            <label className="flex flex-col gap-1">
              Date
              <input name="date" type="date" required className="rounded-md border border-black/15 px-2 py-1.5" />
            </label>
            <label className="flex flex-col gap-1">
              Venue
              <input name="venue" required className="rounded-md border border-black/15 px-2 py-1.5" />
            </label>
            <label className="flex flex-col gap-1 col-span-2">
              Description
              <textarea name="description" rows={2} className="rounded-md border border-black/15 px-2 py-1.5" />
            </label>
            <button className="col-span-2 self-start rounded-md bg-brand text-white px-4 py-2 hover:bg-brand-dark">
              Create event
            </button>
          </form>
        </section>

        <section>
          <h2 className="font-semibold mb-4">Upcoming & past events</h2>
          <div className="grid gap-3">
            {events.map((e) => (
              <div key={e.id} className="rounded-lg border border-black/10 p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{e.title}</span>
                  <span className="text-black/50">{e.date.toDateString()}</span>
                </div>
                <p className="text-black/60 mt-1">{e.venue}</p>
                <p className="text-black/50 mt-2 text-xs">{e.rsvps.length} RSVPs</p>
              </div>
            ))}
            {events.length === 0 && <p className="text-sm text-black/50">No events yet.</p>}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
