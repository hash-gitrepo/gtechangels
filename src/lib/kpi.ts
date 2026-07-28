import { prisma } from "@/lib/prisma";

// FR-32: KPI dashboard — investments count & value, partnerships count,
// signups and committed capital pool by region, introduction funnel conversion.
export async function getKpiSummary() {
  const [
    investmentAgg,
    partnershipCount,
    membersByRegion,
    introStates,
    startupCount,
    memberCount,
  ] = await Promise.all([
    prisma.investment.aggregate({ _count: true, _sum: { amount: true } }),
    prisma.partnership.count(),
    prisma.member.groupBy({
      by: ["region"],
      _count: true,
      _sum: { committedAmount: true },
      where: { status: "ACTIVE" },
    }),
    prisma.introduction.groupBy({ by: ["state"], _count: true }),
    prisma.startup.count({ where: { isVisibleToAngels: true } }),
    prisma.member.count({ where: { status: "ACTIVE" } }),
  ]);

  const introFunnel = Object.fromEntries(
    introStates.map((s) => [s.state, s._count])
  ) as Record<string, number>;
  const totalIntros = introStates.reduce((sum, s) => sum + s._count, 0);

  return {
    investments: {
      count: investmentAgg._count,
      totalAmount: investmentAgg._sum.amount ? Number(investmentAgg._sum.amount) : 0,
    },
    partnershipsCount: partnershipCount,
    activeAngels: memberCount,
    approvedStartups: startupCount,
    committedCapitalByRegion: membersByRegion.map((r) => ({
      region: r.region,
      angelCount: r._count,
      committedAmount: r._sum.committedAmount ? Number(r._sum.committedAmount) : 0,
    })),
    introductionFunnel: {
      totalRequested: totalIntros,
      byState: introFunnel,
    },
  };
}
