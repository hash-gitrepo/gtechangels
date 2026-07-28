import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import { DashboardShell } from "@/components/dashboard-shell";
import { KpiGrid } from "@/components/kpi-grid";
import { getKpiSummary } from "@/lib/kpi";

// FR-32/33/37: admin KPI dashboard and console entry points.
export default async function AdminDashboard() {
  const session = await requireRole("ADMIN");
  const kpi = await getKpiSummary();

  return (
    <DashboardShell role="ADMIN" name={session.user.name}>
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        <KpiGrid kpi={kpi} />

        <nav className="grid sm:grid-cols-2 gap-3">
          <AdminLink href="/admin/screening" title="Screening pipeline" desc="Review and decide startup applications" />
          <AdminLink href="/admin/introductions" title="Introductions" desc="Facilitate and track introduction requests" />
          <AdminLink href="/admin/outcomes" title="Outcomes" desc="Record investments and partnerships" />
          <AdminLink href="/admin/events" title="Events" desc="Manage pitch day events" />
        </nav>
      </div>
    </DashboardShell>
  );
}

function AdminLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} className="rounded-lg border border-black/10 p-5 hover:border-brand transition-colors">
      <p className="font-medium">{title}</p>
      <p className="text-sm text-black/60 mt-1">{desc}</p>
    </Link>
  );
}
