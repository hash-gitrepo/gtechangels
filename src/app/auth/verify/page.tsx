import { Suspense } from "react";
import { VerifyForm } from "./verify-form";

export default function VerifyPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-1">Check your email</h1>
        <p className="text-sm text-black/60 mb-6">
          Enter the 6-digit code we sent you, or click the button in the email.
        </p>
        <Suspense fallback={null}>
          <VerifyForm />
        </Suspense>
      </div>
    </main>
  );
}
