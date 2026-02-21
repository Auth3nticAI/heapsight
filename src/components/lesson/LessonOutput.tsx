"use client";

import { useState } from "react";
import { useLessonStore } from "@/store/lesson-store";
import AIErrorExplainer from "@/components/lesson/AIErrorExplainer";

interface LessonOutputProps {
  lessonId?: string;
  userId?: string;
  userTier?: "free" | "pro";
  userCode?: string;
}

export default function LessonOutput({ lessonId, userId, userTier, userCode }: LessonOutputProps) {
  const output = useLessonStore((s) => s.output);
  const errors = useLessonStore((s) => s.errors);
  const testResults = useLessonStore((s) => s.testResults);
  const isRunning = useLessonStore((s) => s.isRunning);
  const [testsExpanded, setTestsExpanded] = useState(true);

  const passedCount = testResults.filter((t) => t.passed).length;
  const allPassed = testResults.length > 0 && passedCount === testResults.length;

  return (
    <div className="h-full flex flex-col rounded-2xl border border-white/[0.08] bg-[#071528] overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#040B10] border-b border-white/[0.05]">
        <span className="text-[10px] font-mono text-[#AFBCD5]/50 uppercase tracking-wider">
          Output
        </span>
        {isRunning && (
          <span className="text-[10px] font-mono text-primary animate-pulse">
            Compiling...
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Console Output */}
        {(output || isRunning) && (
          <div>
            <div className="text-[9px] font-mono text-[#AFBCD5]/50 uppercase mb-1">
              Console
            </div>
            <pre className="text-xs font-mono text-[#e0e0e0] bg-[#040B10] border border-white/[0.08] rounded-lg p-2.5 whitespace-pre-wrap break-words">
              {output || (isRunning ? "..." : "")}
            </pre>
          </div>
        )}

        {/* Errors */}
        {errors.length > 0 && (
          <div>
            <div className="text-[9px] font-mono text-danger uppercase mb-1">
              Errors
            </div>
            {errors.map((err, i) => (
              <div
                key={i}
                className="text-xs font-mono text-danger bg-danger/10 border border-danger/20 rounded p-2.5 mb-1 break-words"
              >
                {err}
              </div>
            ))}

            {/* AI Error Explainer (Pro feature) */}
            {lessonId && userId && userTier && userCode && (
              <div className="mt-2">
                <AIErrorExplainer
                  lessonId={lessonId}
                  userId={userId}
                  userTier={userTier}
                  errorMessage={errors.join("\n")}
                  userCode={userCode}
                />
              </div>
            )}
          </div>
        )}

        {/* Test Results — collapsible accordion */}
        {testResults.length > 0 && (
          <div>
            <button
              onClick={() => setTestsExpanded(!testsExpanded)}
              className="w-full flex items-center justify-between py-1 min-h-[44px]"
            >
              <span className="text-[9px] font-mono text-[#AFBCD5]/50 uppercase">
                Tests
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono font-bold ${allPassed ? "text-primary" : "text-danger"}`}>
                  {passedCount}/{testResults.length} passed
                </span>
                <svg
                  className={`w-3.5 h-3.5 text-[#AFBCD5]/50 transition-transform ${testsExpanded ? "rotate-180" : ""}`}
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </button>
            {testsExpanded && (
              <div className="space-y-1.5">
                {testResults.map((result) => (
                  <div
                    key={result.testId}
                    className={`flex items-start gap-2 text-xs font-mono p-2 rounded border ${
                      result.passed
                        ? "bg-primary/10 border-primary/20 text-primary"
                        : "bg-danger/10 border-danger/20 text-danger"
                    }`}
                  >
                    <span className="text-sm mt-[-1px]">
                      {result.passed ? "\u2713" : "\u2717"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="break-words">{result.description}</div>
                      {!result.passed && (
                        <div className="mt-1 text-[10px] text-[#AFBCD5]/70 break-words">
                          <div>
                            Expected:{" "}
                            <span className="text-primary">
                              {JSON.stringify(result.expected)}
                            </span>
                          </div>
                          <div>
                            Got:{" "}
                            <span className="text-danger">
                              {JSON.stringify(result.actual)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!output && errors.length === 0 && testResults.length === 0 && !isRunning && (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs font-mono text-[#AFBCD5]/40">
              Click &quot;Run Code&quot; to see output
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
