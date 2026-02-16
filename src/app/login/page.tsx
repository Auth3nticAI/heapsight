"use client";

import { Suspense, useState, FormEvent } from "react";
import { createClient } from "@/lib/supabase-browser";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/learn";

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">HeapSight</h1>
          <p className="text-sm text-[#666] mt-1">
            Sign in to continue learning C++
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="bg-surface border border-[#1a1a2e] rounded-xl p-6 space-y-4"
        >
          <div>
            <label className="block text-xs font-mono text-[#888] mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#0d0d1a] border border-[#2a2a3e] rounded-lg text-white text-sm font-mono placeholder:text-[#444] focus:outline-none focus:border-primary/50 transition-colors"
              placeholder="you@company.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[#888] mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#0d0d1a] border border-[#2a2a3e] rounded-lg text-white text-sm font-mono placeholder:text-[#444] focus:outline-none focus:border-primary/50 transition-colors"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {error && (
            <p className="text-danger text-xs font-mono">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-[#555] mt-4">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-primary hover:text-primary/80 transition-colors"
          >
            Sign up
          </Link>
        </p>

        <p className="text-center mt-6">
          <Link
            href="/"
            className="text-xs text-[#444] hover:text-[#666] transition-colors"
          >
            Back to demo
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-sm font-mono text-[#555]">Loading...</p>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
