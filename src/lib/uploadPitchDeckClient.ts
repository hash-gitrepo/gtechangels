const MAX_BYTES = 20 * 1024 * 1024;

export async function uploadPitchDeckFromBrowser(file: File): Promise<string> {
  if (file.type !== "application/pdf") {
    throw new Error("Pitch deck must be a PDF");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Pitch deck must be 20MB or smaller");
  }

  const signRes = await fetch("/api/upload/pitch-deck/sign", { method: "POST" });
  if (!signRes.ok) throw new Error("Could not start upload");
  const sign = await signRes.json();

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sign.apiKey);
  form.append("timestamp", String(sign.timestamp));
  form.append("signature", sign.signature);
  form.append("folder", sign.folder);
  form.append("public_id", sign.publicId);
  form.append("type", "authenticated");

  const cloudinaryRes = await fetch(
    `https://api.cloudinary.com/v1_1/${sign.cloudName}/raw/upload`,
    { method: "POST", body: form }
  );
  if (!cloudinaryRes.ok) throw new Error("Upload to Cloudinary failed");
  const uploaded = await cloudinaryRes.json();

  const persistRes = await fetch("/api/upload/pitch-deck", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: uploaded.secure_url, publicId: uploaded.public_id }),
  });
  if (!persistRes.ok) throw new Error("Could not save pitch deck");

  const saved = await persistRes.json();
  return saved.pitchDeckUrl as string;
}
