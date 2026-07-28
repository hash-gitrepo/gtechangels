"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const REGIONS = ["TRIVANDRUM", "KOCHI", "CALICUT", "OTHER"] as const;
const STAGES = ["IDEA", "MVP", "EARLY_REVENUE", "GROWTH"] as const;
const HELP = ["CAPITAL", "MARKET_ACCESS", "BOTH"] as const;

export default function StartupSignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      email: form.get("email"),
      name: form.get("name"),
      founders: form.get("founders"),
      region: form.get("region"),
      website: form.get("website"),
      linkedIn: form.get("linkedIn"),
      referredBy: form.get("referredBy"),
      stage: form.get("stage"),
      sector: form.get("sector"),
      icpSegment: form.get("icpSegment"),
      icpGeography: form.get("icpGeography"),
      fundingAskAmount: form.get("fundingAskAmount") || undefined,
      helpSought: form.get("helpSought") || undefined,
      helpDetails: form.get("helpDetails"),
      consentAccepted: form.get("consentAccepted") === "on" ? true : false,
    };

    const res = await fetch("/api/signup/startup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Something went wrong. Try again.");
      return;
    }

    router.push(`/auth/verify?email=${encodeURIComponent(String(payload.email))}`);
  }

  return (
    <main className="min-h-screen px-6 py-16 flex justify-center">
      <div className="w-full max-w-xl">
        <h1 className="text-2xl font-bold mb-1">Apply as a Startup</h1>
        <p className="text-sm text-black/60 mb-8">
          Your profile stays private until it clears screening — then it becomes
          visible to GTECH angels.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Email" name="email" type="email" required />
          <Field label="Startup name" name="name" required />
          <Field label="Founders (comma-separated)" name="founders" />

          <label className="flex flex-col gap-1.5 text-sm">
            Region
            <select name="region" required className="rounded-md border border-black/15 px-3 py-2 text-sm">
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r[0] + r.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </label>

          <Field label="Website" name="website" />
          <Field label="LinkedIn URL" name="linkedIn" />
          <Field label="Referred by (outreach owner / partner)" name="referredBy" />

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5 text-sm">
              Stage
              <select name="stage" required className="rounded-md border border-black/15 px-3 py-2 text-sm">
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace("_", " ")}
                  </option>
                ))}
              </select>
            </label>
            <Field label="Sector" name="sector" required placeholder="Fintech" />
          </div>

          <Field label="ICP segment" name="icpSegment" placeholder="Mid-market BFSI" />
          <Field label="ICP geography" name="icpGeography" placeholder="GCC, India" />

          <Field label="Funding ask (₹)" name="fundingAskAmount" type="number" />

          <label className="flex flex-col gap-1.5 text-sm">
            Help sought
            <select name="helpSought" className="rounded-md border border-black/15 px-3 py-2 text-sm">
              {HELP.map((h) => (
                <option key={h} value={h}>
                  {h.replace("_", " ")}
                </option>
              ))}
            </select>
          </label>
          <TextArea label="Help details" name="helpDetails" />

          <label className="flex items-start gap-2 text-sm mt-2">
            <input type="checkbox" name="consentAccepted" required className="mt-1" />
            <span>
              I agree to the Terms of Use and Privacy Policy and consent to GTECH Angels
              processing my data under the DPDP Act, 2023.
            </span>
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-brand px-4 py-2.5 text-white text-sm font-medium hover:bg-brand-dark disabled:opacity-60 mt-2"
          >
            {loading ? "Submitting…" : "Submit application"}
          </button>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      {label}
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="rounded-md border border-black/15 px-3 py-2 text-sm"
      />
    </label>
  );
}

function TextArea({ label, name }: { label: string; name: string }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      {label}
      <textarea name={name} rows={3} className="rounded-md border border-black/15 px-3 py-2 text-sm" />
    </label>
  );
}
