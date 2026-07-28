import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard-shell";
import { recordInvestment, recordPartnership } from "@/lib/actions/outcomes";

// FR-30/31: outcome logging — investments and partnerships, the two KPI sources of truth.
export default async function AdminOutcomesPage() {
  const session = await requireRole("ADMIN");

  const [startups, angels, investments, partnerships] = await Promise.all([
    prisma.startup.findMany({ orderBy: { name: "asc" } }),
    prisma.member.findMany({ where: { status: "ACTIVE" }, orderBy: { companyName: "asc" } }),
    prisma.investment.findMany({
      include: { startup: true, participants: { include: { member: true } } },
      orderBy: { date: "desc" },
      take: 20,
    }),
    prisma.partnership.findMany({
      include: { startup: true, member: true },
      orderBy: { date: "desc" },
      take: 20,
    }),
  ]);

  return (
    <DashboardShell role="ADMIN" name={session.user.name}>
      <div className="max-w-4xl mx-auto flex flex-col gap-10">
        <section>
          <h1 className="text-xl font-bold mb-4">Record an investment</h1>
          <form action={recordInvestment} className="grid grid-cols-2 gap-3 text-sm">
            <SelectField name="startupId" label="Startup" options={startups.map((s) => [s.id, s.name])} />
            <label className="flex flex-col gap-1">
              Angel(s) (comma-separated member IDs)
              <input name="memberIds" className="rounded-md border border-black/15 px-2 py-1.5" />
            </label>
            <label className="flex flex-col gap-1">
              Amount (₹)
              <input name="amount" type="number" required className="rounded-md border border-black/15 px-2 py-1.5" />
            </label>
            <label className="flex flex-col gap-1">
              Date
              <input name="date" type="date" required className="rounded-md border border-black/15 px-2 py-1.5" />
            </label>
            <label className="flex flex-col gap-1">
              Stage
              <select name="stage" required className="rounded-md border border-black/15 px-2 py-1.5">
                <option value="IDEA">Idea</option>
                <option value="MVP">MVP</option>
                <option value="EARLY_REVENUE">Early Revenue</option>
                <option value="GROWTH">Growth</option>
              </select>
            </label>
            <button className="col-span-2 self-start rounded-md bg-brand text-white px-4 py-2 hover:bg-brand-dark">
              Save investment
            </button>
          </form>

          <div className="mt-4 grid gap-2 text-sm">
            {investments.map((inv) => (
              <div key={inv.id} className="rounded-lg border border-black/10 p-3">
                {inv.startup.name} &middot; ₹{Number(inv.amount).toLocaleString("en-IN")} &middot;{" "}
                {inv.date.toDateString()} &middot;{" "}
                {inv.participants.map((p) => p.member.companyName).join(", ")}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Record a partnership</h2>
          <form action={recordPartnership} className="grid grid-cols-2 gap-3 text-sm">
            <SelectField name="startupId" label="Startup" options={startups.map((s) => [s.id, s.name])} />
            <SelectField name="memberId" label="Member company" options={angels.map((a) => [a.id, a.companyName])} />
            <label className="flex flex-col gap-1">
              Type
              <select name="type" required className="rounded-md border border-black/15 px-2 py-1.5">
                <option value="CUSTOMER_INTRO_CONVERTED">Customer intro converted</option>
                <option value="CHANNEL">Channel</option>
                <option value="PILOT">Pilot</option>
                <option value="OTHER">Other</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              Date
              <input name="date" type="date" required className="rounded-md border border-black/15 px-2 py-1.5" />
            </label>
            <label className="col-span-2 flex flex-col gap-1">
              Description
              <textarea name="description" rows={2} className="rounded-md border border-black/15 px-2 py-1.5" />
            </label>
            <button className="col-span-2 self-start rounded-md bg-brand text-white px-4 py-2 hover:bg-brand-dark">
              Save partnership
            </button>
          </form>

          <div className="mt-4 grid gap-2 text-sm">
            {partnerships.map((p) => (
              <div key={p.id} className="rounded-lg border border-black/10 p-3">
                {p.startup.name} &middot; {p.member.companyName} &middot; {p.type.replace(/_/g, " ")} &middot;{" "}
                {p.date.toDateString()}
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}

function SelectField({ name, label, options }: { name: string; label: string; options: [string, string][] }) {
  return (
    <label className="flex flex-col gap-1">
      {label}
      <select name={name} required className="rounded-md border border-black/15 px-2 py-1.5">
        {options.map(([id, display]) => (
          <option key={id} value={id}>
            {display}
          </option>
        ))}
      </select>
    </label>
  );
}
