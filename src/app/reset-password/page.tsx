"use client";

import { useState, FormEvent } from "react";
import { createClient } from "@/lib/supabase-browser";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo: `${window.location.origin}/update-password` }
    );

    if (resetError) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-white hover:text-primary transition-colors">
            HeapSight
          </Link>
          <h2 className="text-lg font-semibold text-white mt-3">Reset Your Password</h2>
          <p className="text-sm text-[#666] mt-1">
            We&apos;ll send you a link to reset it
          </p>
        </div>

        {sent ? (
          <div className="bg-surface border border-primary/20 rounded-xl p-6 text-center">
            <div className="text-3xl mb-3">&#x2709;</div>
            <h3 className="text-sm font-semibold text-white mb-2">Check your email</h3>
            <p className="text-xs text-[#888] mb-4">
              We sent a password reset link to{" "}
              <span className="text-white font-mono">{email}</span>
            </p>
            <p className="text-[10px] text-[#555]">
              Didn&apos;t receive it? Check your spam folder or{" "}
              <button
                onClick={() => setSent(false)}
                className="text-primary hover:text-primary/80 transition-colors"
              >
                try again
              </button>
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleReset}
            className="bg-surface border border-[#1a1a2e] rounded-xl p-6 space-y-4"
          >
            <div>
              <label className="block text-xs font-mono text-[#888] mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#0d0d1a] border border-[#2a2a3e] rounded-lg text-white text-base sm:text-sm font-mono placeholder:text-[#444] focus:outline-none focus:border-primary/50 transition-colors"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            {error && (
              <p className="text-danger text-xs font-mono bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2 min-h-[44px] touch-manipulation"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {loading ? "Sending email..." : "Send Reset Link"}
            </button>
          </form>
        )}

        <p className="text-center mt-6">
          <Link
            href="/login"
            className="text-xs text-[#555] hover:text-[#888] transition-colors"
          >
            &larr; Back to Sign In
          </Link>
        </p>
      </div>
    </main>
  );
}
