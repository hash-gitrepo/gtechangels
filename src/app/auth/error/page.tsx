import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 text-center">
      <div>
        <h1 className="text-2xl font-bold mb-2">Sign-in error</h1>
        <p className="text-sm text-black/60 mb-6">
          Something went wrong signing you in. Please try again.
        </p>
        <Link href="/auth/signin" className="text-brand hover:underline text-sm">
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
