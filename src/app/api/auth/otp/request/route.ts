import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requestOtp, OtpRateLimitError } from "@/lib/auth/otp";

const bodySchema = z.object({ email: z.string().email() });

// Login-only: issues an OTP for an email that already has an account.
// New signups go through /api/signup/angel or /api/signup/startup, which
// create the account first and call requestOtp() directly.
export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json(
      { error: "No GTECH Angels account found for that email. Sign up first." },
      { status: 404 }
    );
  }

  try {
    await requestOtp(email);
  } catch (err) {
    if (err instanceof OtpRateLimitError) {
      return NextResponse.json({ error: err.message }, { status: 429 });
    }
    console.error(`[auth/otp/request] OTP send failed for ${email}:`, err);
    return NextResponse.json(
      { error: "We couldn't send the login code. Try again in a moment." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
