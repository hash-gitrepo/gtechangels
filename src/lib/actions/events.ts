"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";

// FR-35: event page per pitch day — date, venue, presenting cohort, RSVP for angels.
export async function createEvent(formData: FormData) {
  await requireRole("ADMIN");

  const title = String(formData.get("title"));
  const description = String(formData.get("description") ?? "");
  const date = new Date(String(formData.get("date")));
  const venue = String(formData.get("venue"));
  const region = (formData.get("region") as string) || undefined;
  const presentingStartupIds = String(formData.get("presentingStartupIds") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  await prisma.event.create({
    data: { title, description, date, venue, region: region as never, presentingStartupIds },
  });

  revalidatePath("/admin/events");
}

export async function rsvpToEvent(formData: FormData) {
  const session = await requireRole("ANGEL", "STARTUP");
  const eventId = String(formData.get("eventId"));
  const status = String(formData.get("status")) as "GOING" | "NOT_GOING" | "MAYBE";

  if (session.user.role === "ANGEL") {
    const member = await prisma.member.findUniqueOrThrow({ where: { userId: session.user.id } });
    await prisma.eventRSVP.upsert({
      where: { eventId_memberId: { eventId, memberId: member.id } },
      create: { eventId, memberId: member.id, status },
      update: { status, respondedAt: new Date() },
    });
  } else {
    const startup = await prisma.startup.findUniqueOrThrow({ where: { userId: session.user.id } });
    await prisma.eventRSVP.upsert({
      where: { eventId_startupId: { eventId, startupId: startup.id } },
      create: { eventId, startupId: startup.id, status },
      update: { status, respondedAt: new Date() },
    });
  }

  revalidatePath("/admin/events");
}
