import { requireRole } from "@/lib/auth/session";
import { DashboardShell } from "@/components/dashboard-shell";
import { KpiGrid } from "@/components/kpi-grid";
import { getKpiSummary } from "@/lib/kpi";

// FR-32: view-only KPI dashboard for GTECH Chairman, Secretary, EC — no edit rights.
export default async function LeadershipDashboard() {
  const session = await requireRole("LEADERSHIP", "ADMIN");
  const kpi = await getKpiSummary();

  return (
    <DashboardShell role="LEADERSHIP" name={session.user.name}>
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        <h1 className="text-xl font-bold">Programme KPIs</h1>
        <KpiGrid kpi={kpi} />

        <section>
          <h2 className="font-semibold mb-3">Committed capital by region</h2>
          <div className="grid gap-2 text-sm">
            {kpi.committedCapitalByRegion.map((r) => (
              <div key={r.region} className="rounded-lg border border-black/10 p-3 flex justify-between">
                <span>{r.region}</span>
                <span>
                  {r.angelCount} angels &middot; ₹{r.committedAmount.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
