"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import Link from "next/link";

const FEATURES = [
  { label: "Lessons", free: "5", pro: "25" },
  { label: "Game Path", free: true, pro: true },
  { label: "Robot Path", free: true, pro: true },
  { label: "Both Paths", free: false, pro: true },
  { label: "Export Projects", free: false, pro: true },
  { label: "Certificate", free: false, pro: true },
  { label: "Priority Support", free: false, pro: true },
];

export default function UpgradePage() {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const res = await fetch("/api/checkout/onetime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id || "",
          email: user?.email || "",
          isEarlyBird: true,
        }),
      });

      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-[#1a1a2e] px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link
            href="/learn"
            className="text-[#555] hover:text-white transition-colors text-sm"
          >
            &larr; Back
          </Link>
          <div className="w-px h-4 bg-[#2a2a3e]" />
          <h1 className="text-lg font-semibold text-white">Upgrade to Pro</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-3">
            Unlock Everything
          </h2>
          <p className="text-sm text-[#888] max-w-md mx-auto">
            Get all 25 lessons across both game and robotics paths.
            One-time payment, yours forever.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="rounded-xl border border-[#1a1a2e] bg-surface overflow-hidden mb-10">
          <div className="grid grid-cols-3 border-b border-[#1a1a2e] px-5 py-3">
            <div className="text-xs font-mono text-[#666]">Feature</div>
            <div className="text-xs font-mono text-[#888] text-center">Free</div>
            <div className="text-xs font-mono text-[#a855f7] text-center">Pro</div>
          </div>
          {FEATURES.map((f) => (
            <div
              key={f.label}
              className="grid grid-cols-3 border-b border-[#1a1a2e]/50 px-5 py-3 last:border-b-0"
            >
              <div className="text-sm text-[#ccc]">{f.label}</div>
              <div className="text-sm text-center">
                {typeof f.free === "string" ? (
                  <span className="text-[#888] font-mono">{f.free}</span>
                ) : f.free ? (
                  <span className="text-primary">{"\u2713"}</span>
                ) : (
                  <span className="text-[#444]">{"\u2717"}</span>
                )}
              </div>
              <div className="text-sm text-center">
                {typeof f.pro === "string" ? (
                  <span className="text-[#a855f7] font-mono font-semibold">{f.pro}</span>
                ) : f.pro ? (
                  <span className="text-primary">{"\u2713"}</span>
                ) : (
                  <span className="text-[#444]">{"\u2717"}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Card */}
        <div className="max-w-md mx-auto p-5 sm:p-8 rounded-xl border border-[#a855f7]/30 bg-[#2a1a3e]/20 text-center mb-10">
          <div className="text-4xl font-bold text-white mb-1">$67</div>
          <p className="text-xs font-mono text-[#888] mb-6">
            One-time payment &middot; No subscription &middot; Lifetime access
          </p>
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full py-3.5 bg-[#a855f7] text-white font-bold rounded-lg hover:bg-[#a855f7]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm mb-3"
          >
            {loading ? "Redirecting to Stripe..." : "Upgrade Now"}
          </button>
          <p className="text-[10px] font-mono text-[#555]">
            30-day money-back guarantee
          </p>
        </div>

        {/* FAQ */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white mb-3">FAQ</h3>
          {[
            {
              q: "Is this a subscription?",
              a: "No. One-time payment, lifetime access. No recurring charges.",
            },
            {
              q: "Can I switch between game and robot paths?",
              a: "Pro unlocks both paths. You can switch at any time from your account.",
            },
            {
              q: "What if I want a refund?",
              a: "Full refund within 30 days, no questions asked.",
            },
          ].map((faq) => (
            <div
              key={faq.q}
              className="p-4 rounded-lg border border-[#1a1a2e] bg-surface"
            >
              <h4 className="text-sm font-semibold text-white mb-1">{faq.q}</h4>
              <p className="text-xs text-[#888]">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
