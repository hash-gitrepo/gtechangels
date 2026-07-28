import { resend, EMAIL_FROM } from "./resend";
import {
  otpEmail,
  signupApprovedEmail,
  screeningOutcomeEmail,
  introductionEmail,
  eventInvitationEmail,
} from "./templates";

async function deliver(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn(`[email] RESEND_API_KEY not set — skipping send to ${to}: ${subject}`);
    return;
  }
  await resend.emails.send({ from: EMAIL_FROM, to, subject, html });
}

export async function sendOtpEmail(to: string, args: Parameters<typeof otpEmail>[0]) {
  const { subject, html } = otpEmail(args);
  await deliver(to, subject, html);
}

export async function sendSignupApprovedEmail(
  to: string,
  args: Parameters<typeof signupApprovedEmail>[0]
) {
  const { subject, html } = signupApprovedEmail(args);
  await deliver(to, subject, html);
}

export async function sendScreeningOutcomeEmail(
  to: string,
  args: Parameters<typeof screeningOutcomeEmail>[0]
) {
  const { subject, html } = screeningOutcomeEmail(args);
  await deliver(to, subject, html);
}

export async function sendIntroductionEmail(
  to: string,
  args: Parameters<typeof introductionEmail>[0]
) {
  const { subject, html } = introductionEmail(args);
  await deliver(to, subject, html);
}

export async function sendEventInvitationEmail(
  to: string,
  args: Parameters<typeof eventInvitationEmail>[0]
) {
  const { subject, html } = eventInvitationEmail(args);
  await deliver(to, subject, html);
}
