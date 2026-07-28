/**
 * Short-lived HMAC tickets that let an Edge Function trust work already done
 * by a Node route, without either side needing the other's runtime.
 *
 * Why this exists: Netlify's Node Functions (AWS Lambda) cap request/response
 * bodies well under our 20MB pitch-deck limit, but Prisma (plain TCP to
 * Railway Postgres) can't run on the Edge runtime that doesn't have that cap.
 * So authorization (needs Prisma → Node) and the large file transfer (needs
 * no size cap → Edge) happen in different routes. A ticket is how the Node
 * route hands the Edge route a signed, scoped, time-boxed "yes, this request
 * is authorized" without the Edge route touching the database.
 *
 * Uses the Web Crypto API (`crypto.subtle`), which is a global in both the
 * Node.js runtime (stable since Node 20 — see package.json's "engines") and
 * Netlify Edge Functions (Deno). No Buffer, no `node:crypto` import, so this
 * module works unchanged in either runtime.
 */

async function sign(payload: string): Promise<string> {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET is not set");

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return bufToHex(signature);
}

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

export async function issueTicket(
  purpose: string,
  subject: string,
  ttlSeconds: number
): Promise<string> {
  const expires = Date.now() + ttlSeconds * 1000;
  const payload = `${purpose}.${subject}.${expires}`;
  const signature = await sign(payload);
  return `${payload}.${signature}`;
}

export async function verifyTicket(
  ticket: string,
  purpose: string,
  subject: string
): Promise<boolean> {
  const parts = ticket.split(".");
  if (parts.length !== 4) return false;
  const [ticketPurpose, ticketSubject, expiresStr, signature] = parts;
  if (ticketPurpose !== purpose || ticketSubject !== subject) return false;

  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || Date.now() > expires) return false;

  const expected = await sign(`${ticketPurpose}.${ticketSubject}.${expiresStr}`);
  return timingSafeEqual(expected, signature);
}
