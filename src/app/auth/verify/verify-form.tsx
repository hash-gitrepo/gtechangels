"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { ROLE_HOME } from "@/lib/rbac";

export function VerifyForm() {
  const params = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [code, setCode] = useState(params.get("code") ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function verify(emailValue: string, codeValue: string) {
    setLoading(true);
    setError(null);

    const res = await signIn("otp", {
      email: emailValue,
      code: codeValue,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("That code didn't work. Check it and try again.");
      return;
    }

    const session = await getSession();
    const role = session?.user?.role as keyof typeof ROLE_HOME | undefined;
    router.push(role ? ROLE_HOME[role] : "/");
    router.refresh();
  }

  // Auto-submit when the link from the email carries both params.
  useEffect(() => {
    const initialEmail = params.get("email");
    const initialCode = params.get("code");
    if (initialEmail && initialCode) {
      verify(initialEmail, initialCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        verify(email, code);
      }}
      className="flex flex-col gap-4"
    >
      <label className="flex flex-col gap-1.5 text-sm">
        Email
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-md border border-black/15 px-3 py-2 text-sm"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        6-digit code
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          className="rounded-md border border-black/15 px-3 py-2 text-sm tracking-[0.3em] text-center text-lg"
          placeholder="000000"
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-brand px-4 py-2.5 text-white text-sm font-medium hover:bg-brand-dark disabled:opacity-60"
      >
        {loading ? "Verifying…" : "Verify & sign in"}
      </button>
    </form>
  );
}
