function layout(title: string, bodyHtml: string) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f8f9;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
      <tr>
        <td align="center">
          <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e2e8ea;">
            <tr>
              <td style="background:#028090;padding:20px 32px;">
                <span style="color:#ffffff;font-size:18px;font-weight:bold;">GTECH Angels</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="font-size:18px;margin:0 0 16px;">${title}</h1>
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px;background:#f4f8f9;color:#6b7780;font-size:12px;">
                GTECH Angels &middot; Startup Engagement Focus Group
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function otpEmail(params: { code: string; verifyUrl: string; expiresInMinutes: number }) {
  const { code, verifyUrl, expiresInMinutes } = params;
  return {
    subject: `${code} is your GTECH Angels login code`,
    html: layout(
      "Your login code",
      `<p style="font-size:15px;line-height:1.5;">Use this one-time code to sign in. It expires in ${expiresInMinutes} minutes.</p>
       <p style="font-size:32px;font-weight:bold;letter-spacing:6px;text-align:center;margin:24px 0;background:#f4f8f9;padding:16px;border-radius:6px;">${code}</p>
       <p style="font-size:14px;line-height:1.5;">Or click the button below — it signs you in automatically with the code already filled in.</p>
       <p style="text-align:center;margin:24px 0;">
         <a href="${verifyUrl}" style="background:#028090;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;display:inline-block;">Sign in to GTECH Angels</a>
       </p>
       <p style="font-size:12px;color:#6b7780;">If you didn't request this, you can safely ignore this email.</p>`
    ),
  };
}

export function signupApprovedEmail(params: { name: string; dashboardUrl: string; roleLabel: string }) {
  const { name, dashboardUrl, roleLabel } = params;
  return {
    subject: "Your GTECH Angels account is approved",
    html: layout(
      "You're approved",
      `<p style="font-size:15px;line-height:1.5;">Hi ${name}, your ${roleLabel} account on GTECH Angels has been approved. You can now sign in and complete your profile.</p>
       <p style="text-align:center;margin:24px 0;"><a href="${dashboardUrl}" style="background:#028090;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;display:inline-block;">Go to dashboard</a></p>`
    ),
  };
}

export function screeningOutcomeEmail(params: {
  startupName: string;
  approved: boolean;
  dashboardUrl: string;
}) {
  const { startupName, approved, dashboardUrl } = params;
  return approved
    ? {
        subject: "Your startup profile is now live on GTECH Angels",
        html: layout(
          "Approved for the angel directory",
          `<p style="font-size:15px;line-height:1.5;">Congratulations — ${startupName} has been approved by the screening team and is now visible to GTECH Angels members.</p>
           <p style="text-align:center;margin:24px 0;"><a href="${dashboardUrl}" style="background:#028090;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;display:inline-block;">View your profile</a></p>`
        ),
      }
    : {
        subject: "Update on your GTECH Angels application",
        html: layout(
          "Thanks for applying",
          `<p style="font-size:15px;line-height:1.5;">Thank you for submitting ${startupName} to GTECH Angels. After review, we're not able to move forward at this time. We encourage you to strengthen your traction and reapply in the future.</p>
           <p style="text-align:center;margin:24px 0;"><a href="${dashboardUrl}" style="background:#028090;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;display:inline-block;">View your dashboard</a></p>`
        ),
      };
}

export function introductionEmail(params: {
  recipientName: string;
  counterpartName: string;
  contextNote?: string | null;
  dashboardUrl: string;
  status: "requested" | "accepted" | "declined" | "updated";
}) {
  const { recipientName, counterpartName, contextNote, dashboardUrl, status } = params;
  const verb: Record<typeof status, string> = {
    requested: "requested an introduction to",
    accepted: "accepted the introduction with",
    declined: "declined the introduction with",
    updated: "updated the introduction with",
  };
  return {
    subject: `Introduction ${status}: ${counterpartName}`,
    html: layout(
      "Introduction update",
      `<p style="font-size:15px;line-height:1.5;">Hi ${recipientName}, ${counterpartName} ${verb[status]} you on GTECH Angels.</p>
       ${contextNote ? `<p style="font-size:14px;line-height:1.5;background:#f4f8f9;padding:12px;border-radius:6px;">"${contextNote}"</p>` : ""}
       <p style="text-align:center;margin:24px 0;"><a href="${dashboardUrl}" style="background:#028090;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;display:inline-block;">View introduction</a></p>`
    ),
  };
}

export function eventInvitationEmail(params: {
  name: string;
  eventTitle: string;
  date: string;
  venue: string;
  rsvpUrl: string;
}) {
  const { name, eventTitle, date, venue, rsvpUrl } = params;
  return {
    subject: `You're invited: ${eventTitle}`,
    html: layout(
      eventTitle,
      `<p style="font-size:15px;line-height:1.5;">Hi ${name}, you're invited to ${eventTitle} on ${date} at ${venue}.</p>
       <p style="text-align:center;margin:24px 0;"><a href="${rsvpUrl}" style="background:#028090;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;display:inline-block;">RSVP now</a></p>`
    ),
  };
}
