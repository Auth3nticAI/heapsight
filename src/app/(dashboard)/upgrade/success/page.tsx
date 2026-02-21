"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M5 16l.75 2.25L8 19l-2.25.75L5 22l-.75-2.25L2 19l2.25-.75L5 16z" />
    </svg>
  );
}

const PRO_FEATURES = [
  { icon: "AI Tutor", desc: "Instant error explanations" },
  { icon: "100 Lessons/Path", desc: "400 total lessons" },
  { icon: "Both Paths", desc: "Game + Crawler" },
  { icon: "Export", desc: "Download your projects" },
  { icon: "Certificate", desc: "Proof of completion" },
  { icon: "Support", desc: "Priority assistance" },
];

export default function UpgradeSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("checkout_id") || searchParams.get("session_id");
  const [isVerifying, setIsVerifying] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const verify = async () => {
      // Give webhook time to process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const supabase = createClient();
      const { data: profile } = await supabase
        .from("profiles")
        .select("tier")
        .single();

      setVerified(profile?.tier === "pro");
      setIsVerifying(false);
    };

    verify();
  }, []);

  if (isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-3 border-[#a855f7] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-sm font-mono text-[#888] animate-pulse">
            Verifying your upgrade...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4 sm:px-6">
      <div className="max-w-lg w-full">
        <div className="p-[1px] rounded-xl bg-gradient-to-b from-primary/40 to-[#a855f7]/20">
          <div className="bg-[#12121a] rounded-xl p-8 sm:p-10 text-center">
            {/* Success icon */}
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-5">
              <CheckIcon className="h-8 w-8 text-primary" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Welcome to Pro!
            </h1>
            <p className="text-sm font-mono text-[#888] mb-6">
              {verified
                ? "Your account has been upgraded. All Pro features are now unlocked."
                : "Payment received. Your account will be upgraded momentarily."}
            </p>

            {/* Features grid */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              {PRO_FEATURES.map((f) => (
                <div
                  key={f.icon}
                  className="flex items-center gap-2 bg-[#0a0a0f] border border-[#1a1a2e] rounded-lg p-3"
                >
                  <SparklesIcon className="h-4 w-4 text-[#a855f7] shrink-0" />
                  <div className="text-left min-w-0">
                    <p className="text-[10px] font-semibold text-white truncate">{f.icon}</p>
                    <p className="text-[8px] font-mono text-[#666] truncate">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={() => router.push("/learn")}
              className="w-full py-3.5 bg-primary hover:bg-primary/90 text-black font-bold rounded-lg transition-colors text-sm"
            >
              Start Learning &rarr;
            </button>

            {sessionId && (
              <p className="text-[9px] font-mono text-[#333] mt-4">
                Session: {sessionId.slice(0, 20)}...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
