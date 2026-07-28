import type { getKpiSummary } from "@/lib/kpi";

export function KpiGrid({ kpi }: { kpi: Awaited<ReturnType<typeof getKpiSummary>> }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <Stat label="Investments" value={kpi.investments.count} />
      <Stat label="Capital deployed" value={`₹${kpi.investments.totalAmount.toLocaleString("en-IN")}`} />
      <Stat label="Partnerships" value={kpi.partnershipsCount} />
      <Stat label="Active angels" value={kpi.activeAngels} />
      <Stat label="Approved startups" value={kpi.approvedStartups} />
      <Stat label="Introductions requested" value={kpi.introductionFunnel.totalRequested} />
      <Stat label="Meetings held" value={kpi.introductionFunnel.byState.MEETING_HELD ?? 0} />
      <Stat label="Closed" value={kpi.introductionFunnel.byState.CLOSED ?? 0} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-black/10 p-4">
      <p className="text-xs text-black/50 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
