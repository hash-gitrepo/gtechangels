import { requireRole } from "@/lib/auth/session";
import { DashboardShell } from "@/components/dashboard-shell";
import { ScreeningQueue } from "@/components/screening-queue";

// FR-20/21/23: the Screener's own view of the pipeline (subset of Admin rights).
export default async function ScreenerDashboard() {
  const session = await requireRole("SCREENER", "ADMIN");

  return (
    <DashboardShell role="SCREENER" name={session.user.name}>
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <h1 className="text-xl font-bold">Screening queue</h1>
        <ScreeningQueue />
      </div>
    </DashboardShell>
  );
}
