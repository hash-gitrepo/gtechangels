import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({ key: z.string().min(1) });

// Step 3 of 3 for FR-18: the browser has already PUT the PDF to Netlify
// Blobs via ../blob/route.ts using the ticket from ../sign/route.ts; this
// just records the resulting key against the startup's profile. Small JSON
// body, so back on the Node runtime where Prisma lives.
export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.user.role !== "STARTUP") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startup = await prisma.startup.findUnique({ where: { userId: session.user.id } });
  if (!startup) {
    return NextResponse.json({ error: "Startup profile not found" }, { status: 404 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid upload payload" }, { status: 400 });
  }
  const { key } = parsed.data;

  if (key !== `${startup.id}.pdf`) {
    return NextResponse.json({ error: "Upload does not belong to this profile" }, { status: 403 });
  }

  const updated = await prisma.startup.update({
    where: { id: startup.id },
    data: { pitchDeckKey: key, pitchDeckUploadedAt: new Date() },
  });

  return NextResponse.json({ pitchDeckUploadedAt: updated.pitchDeckUploadedAt });
}
