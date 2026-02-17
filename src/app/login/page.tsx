"use client";

import { Suspense, useState, FormEvent } from "react";
import { createClient } from "@/lib/supabase-browser";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

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
      if (
        authError.message.includes("Invalid login") ||
        authError.message.includes("invalid_credentials")
      ) {
        setError("Invalid email or password.");
      } else if (authError.message.includes("Email not confirmed")) {
        setError("Please verify your email before signing in. Check your inbox.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      setLoading(false);
      return;
    }

    // Check if user has selected a game template
    if (redirect && redirect.startsWith("/") && !redirect.includes("://")) {
      router.push(redirect);
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("selected_game_template")
          .eq("id", user.id)
          .single();

        if (profile?.selected_game_template) {
          router.push("/learn");
        } else {
          router.push("/onboarding");
        }
      } else {
        router.push("/learn");
      }
    }
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-white hover:text-primary transition-colors">
            HeapSight
          </Link>
          <h2 className="text-lg font-semibold text-white mt-3">Welcome Back</h2>
          <p className="text-sm text-[#666] mt-1">
            Pick up right where you left off
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
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-mono text-[#888]">
                Password
              </label>
              <Link
                href="/reset-password"
                className="text-[10px] font-mono text-[#555] hover:text-primary transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 pr-10 bg-[#0d0d1a] border border-[#2a2a3e] rounded-lg text-white text-sm font-mono placeholder:text-[#444] focus:outline-none focus:border-primary/50 transition-colors"
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#888] transition-colors text-xs font-mono"
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-danger text-xs font-mono bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-[#555] mt-4">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-primary hover:text-primary/80 transition-colors"
          >
            Sign up free
          </Link>
        </p>

        <p className="text-center mt-6">
          <Link
            href="/"
            className="text-xs text-[#444] hover:text-[#666] transition-colors"
          >
            &larr; Back to demo
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
          <p className="text-sm font-mono text-[#555] animate-pulse">Loading...</p>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
