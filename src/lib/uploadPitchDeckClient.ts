const MAX_BYTES = 20 * 1024 * 1024;

async function extractError(res: Response, fallback: string): Promise<string> {
  const body = await res.json().catch(() => null);
  return body?.error ?? fallback;
}

export async function uploadPitchDeckFromBrowser(file: File): Promise<void> {
  if (file.type !== "application/pdf") {
    throw new Error("Pitch deck must be a PDF");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Pitch deck must be 20MB or smaller");
  }

  const signRes = await fetch("/api/upload/pitch-deck/sign", { method: "POST" });
  if (!signRes.ok) throw new Error(await extractError(signRes, "Could not start upload"));
  const { ticket, key } = await signRes.json();

  const blobRes = await fetch("/api/upload/pitch-deck/blob", {
    method: "POST",
    headers: {
      "content-type": "application/pdf",
      "x-upload-key": key,
      "x-upload-ticket": ticket,
    },
    body: file,
  });
  if (!blobRes.ok) throw new Error(await extractError(blobRes, "Upload failed"));

  const persistRes = await fetch("/api/upload/pitch-deck", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key }),
  });
  if (!persistRes.ok) throw new Error(await extractError(persistRes, "Could not save pitch deck"));
}
