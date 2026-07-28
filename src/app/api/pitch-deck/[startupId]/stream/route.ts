import { getStore } from "@netlify/blobs";
import { verifyTicket } from "@/lib/signedTicket";

// Step 2 of 2 for viewing a pitch deck. Edge runtime for the same reason as
// the upload path: Netlify's Node Functions cap response bodies well under
// 20MB, and Prisma can't run here anyway — the ticket from ../route.ts is
// the only authorization this route needs.
export const runtime = "edge";

export async function GET(req: Request, { params }: { params: { startupId: string } }) {
  const ticket = new URL(req.url).searchParams.get("ticket");
  const key = `${params.startupId}.pdf`;

  if (!ticket || !(await verifyTicket(ticket, "view-deck", key))) {
    return new Response("Forbidden", { status: 403 });
  }

  const store = getStore("pitch-decks");
  const blob = await store.get(key, { type: "arrayBuffer" });
  if (!blob) return new Response("Not found", { status: 404 });

  return new Response(blob, {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `inline; filename="${key}"`,
      "cache-control": "private, max-age=0, no-store",
    },
  });
}
