import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { signPitchDeckUpload } from "@/lib/cloudinary";

// Step 1 of the direct-to-Cloudinary upload: returns a short-lived signature
// scoped to this startup's folder/public_id. The browser then PUTs the PDF
// straight to Cloudinary (see step 2 in ../route.ts) — the file itself never
// passes through a Netlify function, which is capped well under 20MB.
export async function POST() {
  const session = await getSession();
  if (!session || session.user.role !== "STARTUP") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startup = await prisma.startup.findUnique({ where: { userId: session.user.id } });
  if (!startup) {
    return NextResponse.json({ error: "Startup profile not found" }, { status: 404 });
  }

  return NextResponse.json(signPitchDeckUpload(startup.id));
}
