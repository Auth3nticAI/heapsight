"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PaywallModal({ isOpen, onClose }: PaywallModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

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
          <p className="text-sm text-[#888] mt-2">
            Unlock the full experience: 25 lessons, complete game projects,
            export to GitHub, lifetime access.
          </p>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-5 mb-6">
          <div className="text-xl font-bold text-primary mb-3 text-center">
            Project Saver &mdash; $67
          </div>
          <ul className="text-sm text-[#ccc] space-y-2 font-mono">
            <li className="flex items-center gap-2">
              <span className="text-primary">&#10003;</span> All 25 lessons &amp; challenges
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">&#10003;</span> Build &amp; export real 2D games
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">&#10003;</span> Full memory visualization
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">&#10003;</span> Lifetime access, no subscription
            </li>
            <li className="flex items-center gap-2">
              <span className="text-warning">&#9733;</span>
              <span className="text-warning">Early bird: first 300 at $49</span>
            </li>
          </ul>
        </div>

        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full py-3.5 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm min-h-[44px] touch-manipulation"
        >
          {loading ? "Redirecting to Stripe..." : "Unlock Everything \u2014 $67"}
        </button>

        <button
          onClick={onClose}
          className="w-full mt-3 text-center text-sm text-[#555] hover:text-[#888] transition-colors min-h-[44px] touch-manipulation"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
