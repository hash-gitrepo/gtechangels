"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/otp/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Something went wrong. Try again.");
      return;
    }

    router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-1">Sign in</h1>
        <p className="text-sm text-black/60 mb-6">
          No passwords — we&apos;ll email you a one-time code.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border border-black/15 px-3 py-2 text-sm"
              placeholder="you@company.com"
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-brand px-4 py-2.5 text-white text-sm font-medium hover:bg-brand-dark disabled:opacity-60"
          >
            {loading ? "Sending code…" : "Send login code"}
          </button>
        </form>

        <p className="text-sm text-black/60 mt-6">
          New here?{" "}
          <a href="/signup/angel" className="text-brand hover:underline">
            Join as an angel
          </a>{" "}
          or{" "}
          <a href="/signup/startup" className="text-brand hover:underline">
            apply as a startup
          </a>
          .
        </p>
      </div>
    </main>
  );
}
