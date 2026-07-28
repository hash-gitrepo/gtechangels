import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { deletePitchDeck } from "@/lib/cloudinary";

const bodySchema = z.object({
  url: z.string().url(),
  publicId: z.string().min(1),
});

// Step 2 of the direct-to-Cloudinary upload: the browser has already PUT the
// PDF to Cloudinary using the signature from ./sign/route.ts; this just
// records the resulting URL against the startup's profile — FR-18.
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
  const { url, publicId } = parsed.data;

  if (!publicId.startsWith(`gtech-angels/pitch-decks/${startup.id}-`)) {
    return NextResponse.json({ error: "Upload does not belong to this profile" }, { status: 403 });
  }

  if (startup.pitchDeckPublicId && startup.pitchDeckPublicId !== publicId) {
    await deletePitchDeck(startup.pitchDeckPublicId).catch(() => undefined);
  }

  const updated = await prisma.startup.update({
    where: { id: startup.id },
    data: { pitchDeckUrl: url, pitchDeckPublicId: publicId, pitchDeckUploadedAt: new Date() },
  });

  return NextResponse.json({
    pitchDeckUrl: updated.pitchDeckUrl,
    pitchDeckUploadedAt: updated.pitchDeckUploadedAt,
  });
}
