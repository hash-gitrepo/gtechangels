import { getStore } from "@netlify/blobs";
import { verifyTicket } from "@/lib/signedTicket";

// Step 2 of 3 for FR-18: runs on the Edge runtime specifically because Edge
// Functions don't carry the ~6MB request-body cap that Netlify's Node
// Functions (AWS Lambda under the hood) enforce — needed to accept a 20MB
// PDF. No Prisma here (Edge can't reach it); the ticket from ../sign/route.ts
// stands in for the authorization check that already happened there.
export const runtime = "edge";

const MAX_BYTES = 20 * 1024 * 1024;

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export async function POST(req: Request) {
  const key = req.headers.get("x-upload-key");
  const ticket = req.headers.get("x-upload-ticket");
  const contentType = req.headers.get("content-type");

  if (!key || !ticket) return json({ error: "Missing upload credentials" }, 400);
  if (contentType !== "application/pdf") return json({ error: "Pitch deck must be a PDF" }, 400);

  const valid = await verifyTicket(ticket, "upload-deck", key);
  if (!valid) return json({ error: "Upload ticket invalid or expired — try again" }, 403);

  const body = await req.arrayBuffer();
  if (body.byteLength === 0) return json({ error: "Empty file" }, 400);
  if (body.byteLength > MAX_BYTES) return json({ error: "Pitch deck must be 20MB or smaller" }, 400);

  const store = getStore("pitch-decks");
  await store.set(key, body);

  return json({ ok: true }, 200);
}
