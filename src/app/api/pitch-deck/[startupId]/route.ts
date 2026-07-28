import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { issueTicket } from "@/lib/signedTicket";

// Step 1 of 2 for viewing a pitch deck (confidentiality NFR: decks are
// accessible only to approved angels, the owning startup, and reviewers).
// Runs on Node (needs Prisma for the authorization check), then redirects to
// the Edge route that actually streams the file — see ./stream/route.ts.
export async function GET(req: Request, { params }: { params: { startupId: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const startup = await prisma.startup.findUnique({ where: { id: params.startupId } });
  if (!startup || !startup.pitchDeckKey) {
    return NextResponse.json({ error: "No pitch deck on file" }, { status: 404 });
  }

  const isOwner = session.user.role === "STARTUP" && startup.userId === session.user.id;
  const isReviewer = session.user.role === "ADMIN" || session.user.role === "SCREENER";
  const isApprovedAngel = session.user.role === "ANGEL" && startup.isVisibleToAngels;

  if (!isOwner && !isReviewer && !isApprovedAngel) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ticket = await issueTicket("view-deck", startup.pitchDeckKey, 60);
  const streamUrl = new URL(`/api/pitch-deck/${startup.id}/stream`, req.url);
  streamUrl.searchParams.set("ticket", ticket);

  return NextResponse.redirect(streamUrl, { status: 307 });
}
