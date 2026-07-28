"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadPitchDeckFromBrowser } from "@/lib/uploadPitchDeckClient";

export function PitchDeckUpload({ currentUrl }: { currentUrl?: string | null }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      await uploadPitchDeckFromBrowser(file);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 text-sm">
      {currentUrl && (
        <a href={currentUrl} target="_blank" rel="noreferrer" className="text-brand hover:underline">
          View current pitch deck
        </a>
      )}
      <label className="inline-flex w-fit items-center gap-2 rounded-md border border-black/15 px-3 py-2 cursor-pointer hover:border-brand">
        <span>{uploading ? "Uploading…" : currentUrl ? "Replace pitch deck (PDF, max 20MB)" : "Upload pitch deck (PDF, max 20MB)"}</span>
        <input type="file" accept="application/pdf" className="hidden" onChange={handleChange} disabled={uploading} />
      </label>
      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
}
