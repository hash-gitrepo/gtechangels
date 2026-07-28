import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requestOtp } from "@/lib/auth/otp";

const csv = () =>
  z
    .string()
    .optional()
    .transform((v) => (v ? v.split(",").map((s) => s.trim()).filter(Boolean) : []));

const bodySchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  founders: csv(),
  region: z.enum(["TRIVANDRUM", "KOCHI", "CALICUT", "OTHER"]),
  website: z.string().optional(),
  linkedIn: z.string().optional(),
  referredBy: z.string().optional(),
  stage: z.enum(["IDEA", "MVP", "EARLY_REVENUE", "GROWTH"]),
  sector: z.string().min(1),
  icpSegment: z.string().optional(),
  icpGeography: z.string().optional(),
  fundingAskAmount: z.coerce.number().optional(),
  helpSought: z.enum(["CAPITAL", "MARKET_ACCESS", "BOTH"]).optional(),
  helpDetails: z.string().optional(),
  consentAccepted: z.literal(true),
});

// FR-01/03/04/05/12-17: startup signup — profile is created immediately but
// stays invisible to angels until it clears screening (FR-03).
export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const data = parsed.data;
  const email = data.email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account already exists for that email. Sign in instead." }, { status: 409 });
  }

  await prisma.user.create({
    data: {
      email,
      name: data.name,
      role: "STARTUP",
      startup: {
        create: {
          name: data.name,
          founders: data.founders,
          region: data.region,
          website: data.website,
          linkedIn: data.linkedIn,
          referredBy: data.referredBy,
          stage: data.stage,
          sector: data.sector,
          icpSegment: data.icpSegment,
          icpGeography: data.icpGeography,
          fundingAskAmount: data.fundingAskAmount,
          helpSought: data.helpSought,
          helpDetails: data.helpDetails,
          consentAcceptedAt: new Date(),
          currentScreeningState: "APPLIED",
          screeningRecords: { create: { state: "APPLIED" } },
        },
      },
    },
  });

  try {
    await requestOtp(email);
  } catch (err) {
    console.error(`[signup/startup] OTP send failed for ${email}:`, err);
    return NextResponse.json(
      { error: "Your profile was created, but we couldn't send the verification email. Try signing in again in a moment." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
