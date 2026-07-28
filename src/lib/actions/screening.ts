"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { sendScreeningOutcomeEmail } from "@/lib/email/send";

// FR-20/21/22: move a startup through the screening pipeline, capture the
// scorecard, and — on rejection — send a templated email without exposing
// internal notes verbatim.
export async function decideScreening(formData: FormData) {
  const session = await requireRole("ADMIN", "SCREENER");

  const startupId = String(formData.get("startupId"));
  const state = String(formData.get("state")) as
    | "IN_SCREENING"
    | "APPROVED"
    | "REJECTED"
    | "ON_HOLD";
  const notes = String(formData.get("notes") ?? "");
  const totalScoreRaw = formData.get("totalScore");
  const totalScore = totalScoreRaw ? Number(totalScoreRaw) : undefined;

  const startup = await prisma.startup.findUniqueOrThrow({ where: { id: startupId } });

  const latestRecord = await prisma.screeningRecord.findFirst({
    where: { startupId },
    orderBy: { createdAt: "desc" },
  });

  if (latestRecord) {
    await prisma.screeningRecord.update({
      where: { id: latestRecord.id },
      data: {
        state,
        notes,
        totalScore,
        screenerId: session.user.id,
        decidedAt: state === "APPROVED" || state === "REJECTED" ? new Date() : undefined,
      },
    });
  } else {
    await prisma.screeningRecord.create({
      data: { startupId, state, notes, totalScore, screenerId: session.user.id },
    });
  }

  await prisma.startup.update({
    where: { id: startupId },
    data: {
      currentScreeningState: state,
      isVisibleToAngels: state === "APPROVED",
    },
  });

  if (state === "APPROVED" || state === "REJECTED") {
    const user = await prisma.user.findUnique({ where: { id: startup.userId } });
    if (user?.email) {
      await sendScreeningOutcomeEmail(user.email, {
        startupName: startup.name,
        approved: state === "APPROVED",
        dashboardUrl: `${process.env.NEXTAUTH_URL ?? ""}/startup`,
      });
      if (state === "REJECTED") {
        await prisma.screeningRecord.updateMany({
          where: { startupId, state: "REJECTED" },
          data: { rejectionEmailSentAt: new Date() },
        });
      }
    }
  }

  revalidatePath("/admin/screening");
  revalidatePath("/screener");
}
