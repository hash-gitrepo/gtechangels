"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole, requireSession } from "@/lib/auth/session";
import { sendIntroductionEmail } from "@/lib/email/send";

// FR-26: either party requests an intro with a short context note.
export async function requestIntroduction(formData: FormData) {
  const session = await requireSession();
  const startupId = String(formData.get("startupId"));
  const memberId = String(formData.get("memberId"));
  const contextNote = String(formData.get("contextNote") ?? "");

  const requestedBy = session.user.role === "ANGEL" ? "ANGEL" : "STARTUP";

  const intro = await prisma.introduction.create({
    data: { startupId, memberId, contextNote, requestedBy },
    include: { member: true, startup: true },
  });

  const [memberUser, startupUser] = await Promise.all([
    prisma.user.findUnique({ where: { id: (await prisma.member.findUniqueOrThrow({ where: { id: memberId } })).userId } }),
    prisma.user.findUnique({ where: { id: (await prisma.startup.findUniqueOrThrow({ where: { id: startupId } })).userId } }),
  ]);

  const recipient = requestedBy === "ANGEL" ? startupUser : memberUser;
  const requesterName = requestedBy === "ANGEL" ? intro.member.name : intro.startup.name;
  if (recipient?.email) {
    await sendIntroductionEmail(recipient.email, {
      recipientName: recipient.name ?? "",
      counterpartName: requesterName,
      contextNote,
      dashboardUrl: `${process.env.NEXTAUTH_URL ?? ""}/${requestedBy === "ANGEL" ? "startup" : "angel"}`,
      status: "requested",
    });
  }

  revalidatePath("/angel");
  revalidatePath("/startup");
}

// FR-27: introduction state transitions, updatable by either party or admin.
export async function updateIntroductionState(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id"));
  const state = String(formData.get("state")) as
    | "ACCEPTED"
    | "DECLINED"
    | "MEETING_HELD"
    | "PROGRESSING"
    | "CLOSED";

  const timestampField =
    state === "MEETING_HELD"
      ? { meetingHeldAt: new Date() }
      : state === "CLOSED"
        ? { closedAt: new Date() }
        : state === "ACCEPTED" || state === "DECLINED"
          ? { respondedAt: new Date() }
          : {};

  await prisma.introduction.update({
    where: { id },
    data: { state, ...timestampField },
  });

  revalidatePath("/angel");
  revalidatePath("/startup");
  revalidatePath("/admin/introductions");
}

// Admin: pin a curated match suggestion — FR-28 (facilitates the intro directly).
export async function facilitateIntroduction(formData: FormData) {
  const session = await requireRole("ADMIN");
  const startupId = String(formData.get("startupId"));
  const memberId = String(formData.get("memberId"));
  const contextNote = String(formData.get("contextNote") ?? "");

  await prisma.introduction.create({
    data: {
      startupId,
      memberId,
      contextNote,
      requestedBy: "ADMIN",
      facilitatedByAdmin: true,
      facilitatedById: session.user.id,
    },
  });

  revalidatePath("/admin/introductions");
}
