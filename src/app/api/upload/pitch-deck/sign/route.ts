import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { issueTicket } from "@/lib/signedTicket";

// Step 1 of 3 for FR-18: runs on the Node runtime (it needs Prisma) to check
// the caller owns a startup profile, then hands back a short-lived ticket
// authorizing an upload to that exact blob key. See ../blob/route.ts for why
// the actual file transfer happens on a separate Edge route.
export async function POST() {
  const session = await getSession();
  if (!session || session.user.role !== "STARTUP") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startup = await prisma.startup.findUnique({ where: { userId: session.user.id } });
  if (!startup) {
    return NextResponse.json({ error: "Startup profile not found" }, { status: 404 });
  }

  const key = `${startup.id}.pdf`;
  const ticket = await issueTicket("upload-deck", key, 300);

  return NextResponse.json({ ticket, key });
}
