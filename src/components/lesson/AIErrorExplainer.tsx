"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

interface AIErrorExplainerProps {
  lessonId: string;
  userId: string;
  userTier: "free" | "pro";
  errorMessage: string;
  userCode: string;
}

export default function AIErrorExplainer({
  lessonId,
  userId,
  userTier,
  errorMessage,
  userCode,
}: AIErrorExplainerProps) {
  const router = useRouter();
  const [explanation, setExplanation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [responseTime, setResponseTime] = useState(0);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<"helpful" | "not_helpful" | null>(null);

  const getAIExplanation = async () => {
    if (userTier === "free") {
      setShowUpgrade(true);
      return;
    }

    setIsLoading(true);
    setFeedbackGiven(null);
    const startTime = Date.now();

    try {
      const response = await fetch("/api/ai-tutor/explain-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error_message: errorMessage,
          user_code: userCode,
          lesson_id: lessonId,
        }),
      });

      const data = await response.json();

      if (response.status === 429) {
        setExplanation(
          "You've used all 50 AI explanations for today. The hint system can still help! Your limit resets at midnight UTC."
        );
        setRemaining(0);
        return;
      }

      if (response.status === 403) {
        setShowUpgrade(true);
        return;
      }

      if (data.explanation) {
        setResponseTime(Date.now() - startTime);
        setExplanation(data.explanation);
        if (data.remaining !== undefined) setRemaining(data.remaining);
      }
    } catch (error) {
      console.error("AI explanation failed:", error);
      setExplanation(
        "Sorry, I couldn't analyze this error right now. Try the hint system for step-by-step guidance."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (helpful: boolean) => {
    if (feedbackGiven) return;

    const supabase = createClient();

    // Two-step: find the latest session, then update by ID
    const { data: sessions } = await supabase
      .from("ai_tutor_sessions")
      .select("id")
      .eq("user_id", userId)
      .eq("lesson_id", lessonId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (sessions && sessions.length > 0) {
      await supabase
        .from("ai_tutor_sessions")
        .update({ was_helpful: helpful })
        .eq("id", sessions[0].id);
    }

    setFeedbackGiven(helpful ? "helpful" : "not_helpful");
  };

  // Free user: upgrade prompt
  if (userTier === "free" || showUpgrade) {
    return (
      <div className="border border-[#2a1a3e] bg-[#1a1028]/50 rounded-lg p-3">
        <div className="flex items-start gap-3">
          <div className="shrink-0">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#a855f7"
              strokeWidth="2"
            >
              <path d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 01-1 1H9a1 1 0 01-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z" />
              <path d="M9 21h6" />
              <path d="M10 17v4" />
              <path d="M14 17v4" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-[#a855f7]">
                AI Tutor
              </span>
              <span className="text-[8px] font-mono bg-[#a855f7]/20 text-[#a855f7] px-1.5 py-0.5 rounded border border-[#a855f7]/30">
                PRO
              </span>
            </div>
            <p className="text-[10px] font-mono text-[#888] mb-2">
              Get instant, beginner-friendly explanations of every C++ error
              with specific fixes.
            </p>
            <button
              onClick={() => router.push("/upgrade")}
              className="text-xs font-mono bg-[#a855f7]/20 hover:bg-[#a855f7]/30 text-[#a855f7] border border-[#a855f7]/30 px-3 py-1.5 rounded transition-colors"
            >
              Upgrade to Pro &rarr;
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pro user
  return (
    <div className="border border-[#2a1a3e] bg-[#1a1028]/30 rounded-lg p-3 space-y-2">
      <div className="flex items-center gap-2">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#a855f7"
          strokeWidth="2"
        >
          <path d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 01-1 1H9a1 1 0 01-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z" />
          <path d="M9 21h6" />
        </svg>
        <span className="text-xs font-mono text-[#a855f7]">AI Tutor</span>
        <span className="text-[8px] font-mono bg-[#a855f7]/20 text-[#a855f7] px-1.5 py-0.5 rounded border border-[#a855f7]/30">
          PRO
        </span>
        {responseTime > 0 && (
          <span className="text-[9px] font-mono text-[#555]">
            {(responseTime / 1000).toFixed(1)}s
          </span>
        )}
        {remaining !== null && (
          <span className="text-[9px] font-mono text-[#555] ml-auto">
            {remaining} left today
          </span>
        )}
      </div>

      {!explanation && !isLoading && (
        <button
          onClick={getAIExplanation}
          className="text-xs font-mono bg-[#a855f7]/10 hover:bg-[#a855f7]/20 text-[#a855f7] border border-[#a855f7]/20 rounded px-3 py-1.5 transition-colors"
        >
          Explain this error in simple terms
        </button>
      )}

      {isLoading && (
        <div className="flex items-center gap-2 text-[#a855f7]">
          <div className="animate-spin h-3.5 w-3.5 border-2 border-[#a855f7] border-t-transparent rounded-full" />
          <span className="text-xs font-mono">Analyzing your code...</span>
        </div>
      )}

      {explanation && (
        <>
          <div className="text-xs font-mono text-[#ccc] leading-relaxed bg-[#0d0d1a] border border-[#1a1a2e] rounded p-2.5 whitespace-pre-wrap">
            {explanation}
          </div>

          <div className="flex items-center gap-3 pt-1">
            {feedbackGiven ? (
              <span className="text-[9px] font-mono text-primary">
                {feedbackGiven === "helpful" ? "Thanks for the feedback!" : "Sorry it wasn't helpful. We'll improve!"}
              </span>
            ) : (
              <>
                <span className="text-[9px] font-mono text-[#555]">
                  Was this helpful?
                </span>
                <button
                  onClick={() => handleFeedback(true)}
                  className="text-sm hover:scale-110 transition-transform"
                  aria-label="Helpful"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#00ff88"
                    strokeWidth="2"
                  >
                    <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />
                    <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
                  </svg>
                </button>
                <button
                  onClick={() => handleFeedback(false)}
                  className="text-sm hover:scale-110 transition-transform"
                  aria-label="Not helpful"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ff4444"
                    strokeWidth="2"
                  >
                    <path d="M10 15V19a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z" />
                    <path d="M17 2h3a2 2 0 012 2v7a2 2 0 01-2 2h-3" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
