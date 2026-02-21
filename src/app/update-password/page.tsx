"use client";

import { useState, FormEvent, useMemo } from "react";
import { createClient } from "@/lib/supabase-browser";
import Link from "next/link";
import { useRouter } from "next/navigation";

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { score: 1, label: "Weak", color: "bg-danger" };
  if (score <= 2) return { score: 2, label: "Fair", color: "bg-warning" };
  if (score <= 3) return { score: 3, label: "Good", color: "bg-warning" };
  return { score: 4, label: "Strong", color: "bg-primary" };
}

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError("Failed to update password. The reset link may have expired.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    // Redirect to dashboard after 2 seconds
    setTimeout(() => {
      router.push("/learn");
      router.refresh();
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-white hover:text-primary transition-colors">
            HeapSight
          </Link>
          <h2 className="text-lg font-semibold text-white mt-3">Create New Password</h2>
          <p className="text-sm text-[#AFBCD5]/50 mt-1">
            Choose a strong password for your account
          </p>
        </div>

        {success ? (
          <div className="bg-surface border border-primary/20 rounded-xl p-6 text-center">
            <div className="text-3xl mb-3">&#x2713;</div>
            <h3 className="text-sm font-semibold text-primary mb-2">Password Updated</h3>
            <p className="text-xs text-[#AFBCD5]/70">
              Redirecting to your dashboard...
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleUpdate}
            className="bg-surface border border-white/[0.05] rounded-xl p-6 space-y-4"
          >
            <div>
              <label className="block text-xs font-mono text-[#AFBCD5]/70 mb-1.5">
                New password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 pr-10 bg-[#040B10] border border-white/[0.08] rounded-lg text-white text-sm font-mono placeholder:text-[#AFBCD5]/30 focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="••••••••"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AFBCD5]/50 hover:text-[#AFBCD5]/70 transition-colors text-xs font-mono"
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>
              {/* Strength meter */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          level <= strength.score ? strength.color : "bg-white/[0.08]"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] font-mono text-[#AFBCD5]/50">{strength.label}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-mono text-[#AFBCD5]/70 mb-1.5">
                Confirm new password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#040B10] border border-white/[0.08] rounded-lg text-white text-sm font-mono placeholder:text-[#AFBCD5]/30 focus:outline-none focus:border-primary/50 transition-colors"
                placeholder="••••••••"
                required
                minLength={8}
                autoComplete="new-password"
              />
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <p className="text-[10px] font-mono text-danger mt-1">Passwords don&apos;t match</p>
              )}
            </div>

            {error && (
              <p className="text-danger text-xs font-mono bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-[#246BFD] to-[#0040C3] text-white font-semibold rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}

        <p className="text-center mt-6">
          <Link
            href="/login"
            className="text-xs text-[#AFBCD5]/50 hover:text-[#AFBCD5]/70 transition-colors"
          >
            &larr; Back to Sign In
          </Link>
        </p>
      </div>
    </main>
  );
}
