import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/email/send";

const OTP_LENGTH = 6;
const OTP_TTL_MINUTES = 10;
const MAX_VERIFY_ATTEMPTS = 5;
const REQUEST_WINDOW_MINUTES = 60;
const MAX_REQUESTS_PER_WINDOW = 5; // OTP rate-limiting — NFR: Security

export class OtpRateLimitError extends Error {}
export class OtpInvalidError extends Error {}

function generateCode(): string {
  const max = 10 ** OTP_LENGTH;
  const n = crypto.randomInt(0, max);
  return n.toString().padStart(OTP_LENGTH, "0");
}

function hashCode(email: string, code: string): string {
  return crypto
    .createHash("sha256")
    .update(`${email.toLowerCase()}:${code}`)
    .digest("hex");
}

function baseUrl(): string {
  return process.env.NEXTAUTH_URL ?? "http://localhost:3000";
}

/**
 * Issues a fresh OTP for the given email, emails it via Resend, and returns
 * nothing sensitive — the caller only needs to know it succeeded.
 */
export async function requestOtp(emailRaw: string) {
  const email = emailRaw.trim().toLowerCase();

  const windowStart = new Date(Date.now() - REQUEST_WINDOW_MINUTES * 60_000);
  const recentRequests = await prisma.verificationToken.count({
    where: { identifier: email, createdAt: { gte: windowStart } },
  });
  if (recentRequests >= MAX_REQUESTS_PER_WINDOW) {
    throw new OtpRateLimitError(
      `Too many login attempts for ${email}. Try again later.`
    );
  }

  const code = generateCode();
  const token = hashCode(email, code);
  const expires = new Date(Date.now() + OTP_TTL_MINUTES * 60_000);

  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  });

  const verifyUrl = `${baseUrl()}/auth/verify?email=${encodeURIComponent(
    email
  )}&code=${code}`;

  await sendOtpEmail(email, { code, verifyUrl, expiresInMinutes: OTP_TTL_MINUTES });
}

/**
 * Verifies a submitted OTP. Throws OtpInvalidError on any failure (wrong code,
 * expired, too many attempts) — callers should show a single generic error to
 * avoid leaking which case occurred.
 */
export async function verifyOtp(emailRaw: string, code: string): Promise<void> {
  const email = emailRaw.trim().toLowerCase();
  const token = hashCode(email, code);

  const record = await prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier: email, token } },
  });

  if (!record) {
    // Increment attempts on the most recent outstanding token for this email
    // so repeated wrong guesses eventually lock the whole login attempt out.
    const latest = await prisma.verificationToken.findFirst({
      where: { identifier: email, expires: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });
    if (latest) {
      if (latest.attempts + 1 >= MAX_VERIFY_ATTEMPTS) {
        await prisma.verificationToken.delete({ where: { id: latest.id } });
      } else {
        await prisma.verificationToken.update({
          where: { id: latest.id },
          data: { attempts: { increment: 1 } },
        });
      }
    }
    throw new OtpInvalidError("Invalid or expired code.");
  }

  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { id: record.id } });
    throw new OtpInvalidError("Invalid or expired code.");
  }

  // Success — consume the token and any other outstanding tokens for this email.
  await prisma.verificationToken.deleteMany({ where: { identifier: email } });
}
