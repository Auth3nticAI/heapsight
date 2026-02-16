"use client";

import { useState, FormEvent } from "react";
import { createClient } from "@/lib/supabase-browser";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/learn`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/learn");
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">HeapSight</h1>
          <p className="text-sm text-[#666] mt-1">
            Start learning C++ — for free
          </p>
        </div>

        <form
          onSubmit={handleSignup}
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

          <div>
            <label className="block text-xs font-mono text-[#888] mb-1.5">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <p className="text-[10px] text-[#444] text-center font-mono">
            5 free lessons included. No credit card required.
          </p>
        </form>

        <p className="text-center text-sm text-[#555] mt-4">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary hover:text-primary/80 transition-colors"
          >
            Sign in
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
