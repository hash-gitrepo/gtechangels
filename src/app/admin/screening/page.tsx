import { requireRole } from "@/lib/auth/session";
import { DashboardShell } from "@/components/dashboard-shell";
import { ScreeningQueue } from "@/components/screening-queue";

export default async function AdminScreeningPage() {
  const session = await requireRole("ADMIN", "SCREENER");

  return (
    <DashboardShell role="ADMIN" name={session.user.name}>
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <h1 className="text-xl font-bold">Screening pipeline</h1>
        <ScreeningQueue />
      </div>
    </DashboardShell>
  );
}
