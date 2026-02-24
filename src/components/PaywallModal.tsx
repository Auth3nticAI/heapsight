"use client";

import { useState } from "react";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function PaywallEmailCapture() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "paywall" }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="flex items-center gap-2 mt-4 p-3 rounded-lg bg-[#9CD323]/10 border border-[#9CD323]/20">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CD323" strokeWidth="2.5">
          <path d="M5 13l4 4L19 7" />
        </svg>
        <span className="text-[#9CD323] text-xs font-mono">Got it — watch your inbox for C++ tips!</span>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-white/[0.05]">
      <p className="text-[11px] font-mono text-[#AFBCD5]/50 text-center mb-2">
        Not ready to upgrade? Get tips on mastering C++ →
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 px-3 py-2 bg-[#040B10] border border-white/[0.08] rounded-lg text-white text-xs font-mono placeholder:text-[#AFBCD5]/30 focus:outline-none focus:border-[#246BFD]/50 transition-colors min-w-0"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-3 py-2 bg-[#071528] border border-white/[0.08] hover:border-white/[0.15] text-[#AFBCD5]/70 hover:text-white text-xs font-mono rounded-lg transition-colors whitespace-nowrap disabled:opacity-50"
        >
          {status === "loading" ? "..." : "Subscribe"}
        </button>
      </form>
    </div>
  );
}

export default function PaywallModal({ isOpen, onClose }: PaywallModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = () => {
    setLoading(true);
    window.location.href = "/api/polar/checkout?billing=yearly";
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative z-10 bg-surface border border-primary/30 rounded-xl p-5 sm:p-8 max-w-md w-full mx-4 animate-modal_in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">&#10003;</div>
          <h2 className="text-xl font-bold text-white">
            You Completed the Free Lessons!
          </h2>
          <p className="text-sm text-[#AFBCD5]/70 mt-2">
            Unlock the full experience: 100 lessons per path, AI tutor,
            export projects, and more.
          </p>
        </div>

        <div className="bg-[#a855f7]/5 border border-[#a855f7]/20 rounded-lg p-5 mb-6">
          <div className="text-xl font-bold text-[#a855f7] mb-3 text-center">
            Pro &mdash; from $17/mo
          </div>
          <ul className="text-sm text-[#ccc] space-y-2 font-mono">
            <li className="flex items-center gap-2">
              <span className="text-[#a855f7]">&#10003;</span> 100 lessons per path, 400+ total
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#a855f7]">&#10003;</span> Build &amp; export real games
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#a855f7]">&#10003;</span> AI Tutor &mdash; instant error help
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#a855f7]">&#10003;</span> All paths unlocked
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#a855f7]">&#10003;</span> Cancel anytime
            </li>
          </ul>
        </div>

        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-[#a855f7] to-[#6366f1] hover:from-[#9333ea] hover:to-[#4f46e5] text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm min-h-[44px] touch-manipulation shadow-lg shadow-[#a855f7]/20"
        >
          {loading ? "Redirecting to checkout..." : "Upgrade to Pro"}
        </button>

        <button
          onClick={onClose}
          className="w-full mt-3 text-center text-sm text-[#AFBCD5]/50 hover:text-[#AFBCD5]/70 transition-colors min-h-[44px] touch-manipulation"
        >
          Maybe later
        </button>

        <PaywallEmailCapture />
      </div>
    </div>
  );
}
