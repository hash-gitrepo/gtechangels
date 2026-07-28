"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const REGIONS = ["TRIVANDRUM", "KOCHI", "CALICUT", "OTHER"] as const;

export default function AngelSignupPage() {
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
      companyName: form.get("companyName"),
      designation: form.get("designation"),
      linkedIn: form.get("linkedIn"),
      region: form.get("region"),
      referredBy: form.get("referredBy"),
      technologyDomains: form.get("technologyDomains"),
      industryDomains: form.get("industryDomains"),
      marketGeographies: form.get("marketGeographies"),
      expertiseNotes: form.get("expertiseNotes"),
      committedAmount: form.get("committedAmount") || undefined,
      ticketSizeMin: form.get("ticketSizeMin") || undefined,
      ticketSizeMax: form.get("ticketSizeMax") || undefined,
      clientSegments: form.get("clientSegments"),
      consentAccepted: form.get("consentAccepted") === "on" ? true : false,
    };

    const res = await fetch("/api/signup/angel", {
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
        <h1 className="text-2xl font-bold mb-1">Join as an Angel</h1>
        <p className="text-sm text-black/60 mb-8">
          Tell us who you are and what you can offer — capital, market access, or both.
          We&apos;ll verify you against the GTECH member register.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Email" name="email" type="email" required />
          <Field label="Full name" name="name" required />
          <Field label="Company" name="companyName" required />
          <Field label="Designation" name="designation" />
          <Field label="LinkedIn URL" name="linkedIn" />

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

          <Field label="Referred by (outreach owner / partner)" name="referredBy" />

          <Field
            label="Technology domains (comma-separated)"
            name="technologyDomains"
            placeholder="Fintech, AI/ML, SaaS"
          />
          <Field
            label="Industry domains (comma-separated)"
            name="industryDomains"
            placeholder="BFSI, Healthcare"
          />
          <Field
            label="Market / geography expertise (comma-separated)"
            name="marketGeographies"
            placeholder="GCC, India, SEA"
          />
          <TextArea label="Expertise notes" name="expertiseNotes" />

          <div className="grid grid-cols-3 gap-3">
            <Field label="Committed amount (₹)" name="committedAmount" type="number" />
            <Field label="Ticket size min (₹)" name="ticketSizeMin" type="number" />
            <Field label="Ticket size max (₹)" name="ticketSizeMax" type="number" />
          </div>

          <Field
            label="Client segments you can open (comma-separated)"
            name="clientSegments"
            placeholder="Mid-market BFSI, Enterprise retail"
          />

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
            {loading ? "Submitting…" : "Create angel profile"}
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
