"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";

// FR-30: investment record — entered by admin, confirmed by both parties later.
export async function recordInvestment(formData: FormData) {
  const session = await requireRole("ADMIN");

  const startupId = String(formData.get("startupId"));
  const memberIds = String(formData.get("memberIds"))
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const amount = Number(formData.get("amount"));
  const date = new Date(String(formData.get("date")));
  const stage = String(formData.get("stage")) as "IDEA" | "MVP" | "EARLY_REVENUE" | "GROWTH";
  const sourceIntroductionId = (formData.get("sourceIntroductionId") as string) || undefined;

  await prisma.investment.create({
    data: {
      startupId,
      amount,
      date,
      stage,
      sourceIntroductionId,
      enteredByAdminId: session.user.id,
      participants: {
        create: memberIds.map((memberId) => ({ memberId })),
      },
    },
  });

  revalidatePath("/admin/outcomes");
  revalidatePath("/admin");
  revalidatePath("/leadership");
}

// FR-31: partnership record.
export async function recordPartnership(formData: FormData) {
  const session = await requireRole("ADMIN");

  const startupId = String(formData.get("startupId"));
  const memberId = String(formData.get("memberId"));
  const type = String(formData.get("type")) as
    | "CUSTOMER_INTRO_CONVERTED"
    | "CHANNEL"
    | "PILOT"
    | "OTHER";
  const date = new Date(String(formData.get("date")));
  const description = String(formData.get("description") ?? "");
  const sourceIntroductionId = (formData.get("sourceIntroductionId") as string) || undefined;

  await prisma.partnership.create({
    data: {
      startupId,
      memberId,
      type,
      date,
      description,
      sourceIntroductionId,
      enteredByAdminId: session.user.id,
    },
  });

  revalidatePath("/admin/outcomes");
  revalidatePath("/admin");
  revalidatePath("/leadership");
}
