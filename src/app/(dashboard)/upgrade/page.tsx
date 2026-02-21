"use client";

import { useState } from "react";
import Link from "next/link";

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M5 16l.75 2.25L8 19l-2.25.75L5 22l-.75-2.25L2 19l2.25-.75L5 16z" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

const FEATURES: { label: string; free: string | boolean; pro: string | boolean; isNew?: boolean; description?: string }[] = [
  { label: "Lessons", free: "5", pro: "100 per path" },
  { label: "Game Path", free: true, pro: true },
  { label: "Crawler Path", free: true, pro: true },
  { label: "Both Paths", free: false, pro: true },
  { label: "AI Tutor", free: false, pro: true, isNew: true, description: "Instant error explanations" },
  { label: "Export Projects", free: false, pro: true },
  { label: "Certificate", free: false, pro: true },
  { label: "Priority Support", free: false, pro: true },
];

const FAQ = [
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel with one click from your account settings. You'll keep access until the end of your billing period.",
  },
  {
    q: "What's the AI Tutor?",
    a: "When your code has an error, click \"Explain this error\" and get an instant, beginner-friendly explanation with a specific fix. Pro users get 50 AI explanations per day.",
  },
  {
    q: "Can I switch between monthly and yearly?",
    a: "Yes. Switch plans anytime from your account settings. If upgrading to yearly, you'll be credited for unused time on your monthly plan.",
  },
  {
    q: "Can I switch between game and crawler paths?",
    a: "Pro unlocks both paths. You can switch at any time from your account.",
  },
];

export default function UpgradePage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("yearly");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const price = billingPeriod === "monthly" ? 29 : 199;
  const monthlyEquivalent = billingPeriod === "yearly" ? Math.round(199 / 12) : 29;

  const handleUpgrade = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billingPeriod }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: unknown) {
      console.error("Upgrade error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Header */}
      <header className="border-b border-[#1a1a2e] px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link
            href="/learn"
            className="text-[#555] hover:text-white transition-colors text-sm font-mono"
          >
            &larr; Back
          </Link>
          <div className="w-px h-4 bg-[#2a2a3e]" />
          <h1 className="text-lg font-semibold text-white">Upgrade to Pro</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#a855f7]/10 border border-[#a855f7]/20 rounded-full px-4 py-1.5 mb-4">
            <SparklesIcon className="h-4 w-4 text-[#a855f7]" />
            <span className="text-xs font-mono text-[#a855f7]">PRO</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Unlock Everything
          </h2>
          <p className="text-sm text-[#888] max-w-md mx-auto font-mono">
            100 lessons per path, 400 total across all tracks, AI error explanations, and more.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <button
            onClick={() => setBillingPeriod("monthly")}
            className={`text-xs font-mono px-5 py-2.5 rounded-lg border transition-colors ${
              billingPeriod === "monthly"
                ? "bg-[#a855f7]/20 border-[#a855f7]/40 text-[#a855f7]"
                : "bg-transparent border-[#2a2a3e] text-[#666] hover:text-[#888]"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod("yearly")}
            className={`text-xs font-mono px-5 py-2.5 rounded-lg border transition-colors relative ${
              billingPeriod === "yearly"
                ? "bg-[#a855f7]/20 border-[#a855f7]/40 text-[#a855f7]"
                : "bg-transparent border-[#2a2a3e] text-[#666] hover:text-[#888]"
            }`}
          >
            Yearly
            <span className="absolute -top-2.5 -right-3 text-[8px] font-mono bg-primary text-black px-1.5 py-0.5 rounded-full font-bold">
              -43%
            </span>
          </button>
        </div>

        {/* Pricing Card */}
        <div className="max-w-md mx-auto mb-10">
          <div className="p-[1px] rounded-xl bg-gradient-to-b from-[#a855f7]/40 to-[#6366f1]/20">
            <div className="bg-[#12121a] rounded-xl p-6 sm:p-8 text-center">
              <div className="flex items-baseline justify-center gap-1 mb-1">
                <span className="text-5xl font-bold text-white">${price}</span>
                <span className="text-sm font-mono text-[#888]">
                  /{billingPeriod === "monthly" ? "mo" : "yr"}
                </span>
              </div>
              {billingPeriod === "yearly" && (
                <p className="text-[11px] font-mono text-primary mb-5">
                  ~${monthlyEquivalent}/mo &middot; Save $149/year vs monthly
                </p>
              )}
              {billingPeriod === "monthly" && (
                <p className="text-[11px] font-mono text-[#888] mb-5">
                  Cancel anytime
                </p>
              )}

              {/* Error */}
              {error && (
                <div className="bg-danger/10 border border-danger/20 rounded-lg p-3 mb-4">
                  <p className="text-xs font-mono text-danger">{error}</p>
                </div>
              )}

              <button
                onClick={handleUpgrade}
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-[#a855f7] to-[#6366f1] hover:from-[#9333ea] hover:to-[#4f46e5] text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-lg shadow-[#a855f7]/20"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Redirecting to checkout...
                  </span>
                ) : (
                  `Start Pro ${billingPeriod === "yearly" ? "Yearly" : "Monthly"}`
                )}
              </button>
              <p className="text-[10px] font-mono text-[#555] mt-3">
                7-day free trial &middot; Cancel anytime &middot; 30-day money-back guarantee
              </p>
            </div>
          </div>
        </div>

        {/* Feature Comparison */}
        <div className="rounded-xl border border-[#1a1a2e] bg-surface overflow-hidden mb-10">
          <div className="grid grid-cols-3 border-b border-[#1a1a2e] px-5 py-3">
            <div className="text-xs font-mono text-[#666]">Feature</div>
            <div className="text-xs font-mono text-[#888] text-center">Free</div>
            <div className="text-xs font-mono text-[#a855f7] text-center font-bold">Pro</div>
          </div>
          {FEATURES.map((f) => (
            <div
              key={f.label}
              className={`grid grid-cols-3 border-b border-[#1a1a2e]/50 px-5 py-3.5 last:border-b-0 ${
                f.isNew ? "bg-[#a855f7]/[0.03]" : ""
              }`}
            >
              <div className="text-sm text-[#ccc] flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  {f.label}
                  {f.isNew && (
                    <span className="text-[8px] font-mono bg-[#a855f7]/20 text-[#a855f7] px-1.5 py-0.5 rounded border border-[#a855f7]/30">
                      NEW
                    </span>
                  )}
                </div>
                {f.description && (
                  <span className="text-[10px] font-mono text-[#555]">{f.description}</span>
                )}
              </div>
              <div className="text-sm text-center flex items-center justify-center">
                {typeof f.free === "string" ? (
                  <span className="text-[#888] font-mono">{f.free}</span>
                ) : f.free ? (
                  <CheckCircleIcon className="h-4 w-4 text-primary" />
                ) : (
                  <XCircleIcon className="h-4 w-4 text-[#444]" />
                )}
              </div>
              <div className="text-sm text-center flex items-center justify-center">
                {typeof f.pro === "string" ? (
                  <span className="text-[#a855f7] font-mono font-semibold">{f.pro}</span>
                ) : f.pro ? (
                  <CheckCircleIcon className="h-4 w-4 text-primary" />
                ) : (
                  <XCircleIcon className="h-4 w-4 text-[#444]" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h3 className="text-sm font-semibold text-white mb-4">Frequently Asked Questions</h3>
          <div className="space-y-3">
            {FAQ.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-lg border border-[#1a1a2e] bg-surface overflow-hidden"
              >
                <summary className="px-5 py-4 text-sm font-semibold text-white cursor-pointer hover:bg-[#111118] transition-colors list-none flex items-center justify-between">
                  {faq.q}
                  <svg
                    className="h-4 w-4 text-[#555] transition-transform group-open:rotate-180 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </summary>
                <div className="px-5 pb-4">
                  <p className="text-xs text-[#888] font-mono leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
