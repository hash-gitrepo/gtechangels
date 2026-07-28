import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const PITCH_DECK_MAX_BYTES = 20 * 1024 * 1024; // 20MB — FR-18
export const PITCH_DECK_FOLDER = "gtech-angels/pitch-decks";

/**
 * Netlify functions cap request bodies well under 20MB, so a 20MB PDF can't
 * be proxied through a Next.js API route on this host. Instead the server
 * signs the upload params and the browser uploads the file straight to
 * Cloudinary; the API route only ever sees the resulting small JSON payload.
 */
export function signPitchDeckUpload(startupId: string) {
  const timestamp = Math.floor(Date.now() / 1000);
  const publicId = `${startupId}-${timestamp}`;
  const paramsToSign = {
    timestamp,
    folder: PITCH_DECK_FOLDER,
    public_id: publicId,
    type: "authenticated",
  };
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET as string
  );

  return {
    timestamp,
    publicId,
    folder: PITCH_DECK_FOLDER,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  };
}

export function deletePitchDeck(publicId: string) {
  return cloudinary.uploader.destroy(publicId, {
    resource_type: "raw",
    type: "authenticated",
  });
}

/** Signed, time-limited URL so a deck is only ever viewable by an authenticated request. */
export function signedPitchDeckUrl(publicId: string, expiresInSeconds = 300) {
  const timestamp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  return cloudinary.utils.private_download_url(publicId, "pdf", {
    resource_type: "raw",
    type: "authenticated",
    expires_at: timestamp,
  });
}

export default cloudinary;
