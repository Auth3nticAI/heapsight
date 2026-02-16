"use client";

import { useState, FormEvent } from "react";

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg("Please enter a valid email address.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (data.success) {
        setStatus("success");
      } else {
        setErrorMsg(data.message || "Something went wrong.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative z-10 bg-surface border border-[#1a1a2e] rounded-xl p-8 max-w-md w-full mx-4 animate-modal_in"
        onClick={(e) => e.stopPropagation()}
      >
        {status === "success" ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-4">&#10003;</div>
            <h2 className="text-xl font-semibold text-primary mb-2">
              You&apos;re in!
            </h2>
            <p className="text-[#888] text-sm mb-6">
              Check your email. We&apos;ll let you know when HeapSight is ready.
            </p>
            <button
              onClick={onClose}
              className="text-sm text-[#666] hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-white mb-2">
              You Just Prevented an Entire Class of Crashes
            </h2>
            <p className="text-sm text-[#888] mb-6">
              We&apos;re building HeapSight — a tool that does this automatically
              for your real projects. Join 1,200+ developers who are crushing
              C++ memory bugs.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                className="w-full px-4 py-3 bg-[#0d0d1a] border border-[#2a2a3e] rounded-lg text-white text-sm font-mono placeholder:text-[#444] focus:outline-none focus:border-primary/50 transition-colors"
                autoFocus
              />

              {status === "error" && (
                <p className="text-danger text-xs font-mono">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full py-3 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {status === "loading" ? "Joining..." : "Join Waitlist"}
              </button>
            </form>

            <button
              onClick={onClose}
              className="w-full mt-3 text-center text-sm text-[#555] hover:text-[#888] transition-colors"
            >
              No thanks, maybe later
            </button>
          </>
        )}
      </div>
    </div>
  );
}
