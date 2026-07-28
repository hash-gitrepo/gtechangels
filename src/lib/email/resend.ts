import { Resend } from "resend";

const globalForResend = globalThis as unknown as { resend: Resend | undefined };

// Resend's constructor throws on a falsy key, which would break the build
// (and any dev server boot) before env vars are configured. deliver() in
// ./send.ts already no-ops when RESEND_API_KEY is unset, so a placeholder
// here is never actually used to send anything.
export const resend =
  globalForResend.resend ?? new Resend(process.env.RESEND_API_KEY || "re_build_placeholder");

if (process.env.NODE_ENV !== "production") globalForResend.resend = resend;

export const EMAIL_FROM =
  process.env.EMAIL_FROM ?? "GTECH Angels <noreply@gtechangels.org>";
