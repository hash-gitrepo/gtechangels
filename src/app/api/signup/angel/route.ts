import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requestOtp } from "@/lib/auth/otp";
import { isVerifiedGtechMember } from "@/lib/memberRegister";

const csv = () =>
  z
    .string()
    .optional()
    .transform((v) => (v ? v.split(",").map((s) => s.trim()).filter(Boolean) : []));

const bodySchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  companyName: z.string().min(1),
  designation: z.string().optional(),
  linkedIn: z.string().optional(),
  region: z.enum(["TRIVANDRUM", "KOCHI", "CALICUT", "OTHER"]),
  referredBy: z.string().optional(),
  technologyDomains: csv(),
  industryDomains: csv(),
  marketGeographies: csv(),
  expertiseNotes: z.string().optional(),
  committedAmount: z.coerce.number().optional(),
  ticketSizeMin: z.coerce.number().optional(),
  ticketSizeMax: z.coerce.number().optional(),
  clientSegments: csv(),
  consentAccepted: z.literal(true),
});

// FR-01/02/04/05/06-09: angel signup — verify against the member register,
// create the (unverified) account + profile, then send the OTP that both
// confirms the email and activates the account.
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

  const verifiedMember = await isVerifiedGtechMember(email, data.companyName);
  if (!verifiedMember) {
    return NextResponse.json(
      {
        error:
          "We couldn't match you to the GTECH member register. Please contact the GTECH Secretariat to be added.",
      },
      { status: 403 }
    );
  }

  await prisma.user.create({
    data: {
      email,
      name: data.name,
      role: "ANGEL",
      member: {
        create: {
          name: data.name,
          companyName: data.companyName,
          designation: data.designation,
          linkedIn: data.linkedIn,
          region: data.region,
          referredBy: data.referredBy,
          technologyDomains: data.technologyDomains,
          industryDomains: data.industryDomains,
          marketGeographies: data.marketGeographies,
          expertiseNotes: data.expertiseNotes,
          committedAmount: data.committedAmount,
          ticketSizeMin: data.ticketSizeMin,
          ticketSizeMax: data.ticketSizeMax,
          clientSegments: data.clientSegments,
          consentAcceptedAt: new Date(),
          status: "PENDING_VERIFICATION",
        },
      },
    },
  });

  try {
    await requestOtp(email);
  } catch (err) {
    // The account row above already exists at this point — that's fine, the
    // user can request a fresh code from /auth/signin once email sending is
    // fixed. What we must not do is let this throw all the way up: an
    // uncaught error here renders Next's generic HTML error page instead of
    // JSON, which the client can't parse into a useful message.
    console.error(`[signup/angel] OTP send failed for ${email}:`, err);
    return NextResponse.json(
      { error: "Your profile was created, but we couldn't send the verification email. Try signing in again in a moment." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
