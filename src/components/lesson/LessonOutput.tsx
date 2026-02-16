"use client";

import { useLessonStore } from "@/store/lesson-store";

export default function LessonOutput() {
  const output = useLessonStore((s) => s.output);
  const errors = useLessonStore((s) => s.errors);
  const testResults = useLessonStore((s) => s.testResults);
  const isRunning = useLessonStore((s) => s.isRunning);

  return (
    <div className="h-full flex flex-col rounded-lg border border-[#1a1a2e] bg-surface overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0d0d1a] border-b border-[#1a1a2e]">
        <span className="text-[10px] font-mono text-[#555] uppercase tracking-wider">
          Output
        </span>
        {isRunning && (
          <span className="text-[10px] font-mono text-primary animate-pulse">
            Running...
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Console Output */}
        {(output || isRunning) && (
          <div>
            <div className="text-[9px] font-mono text-[#555] uppercase mb-1">
              Console
            </div>
            <pre className="text-xs font-mono text-[#e0e0e0] bg-[#0d0d1a] border border-[#1a1a2e] rounded p-2.5 whitespace-pre-wrap">
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
                className="text-xs font-mono text-danger bg-danger/10 border border-danger/20 rounded p-2.5 mb-1"
              >
                {err}
              </div>
            ))}
          </div>
        )}

        {/* Test Results */}
        {testResults.length > 0 && (
          <div>
            <div className="text-[9px] font-mono text-[#555] uppercase mb-1">
              Tests
            </div>
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
                  <div className="flex-1">
                    <div>{result.description}</div>
                    {!result.passed && (
                      <div className="mt-1 text-[10px] text-[#888]">
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
          </div>
        )}

        {/* Empty state */}
        {!output && errors.length === 0 && testResults.length === 0 && !isRunning && (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs font-mono text-[#444]">
              Click &quot;Run Code&quot; to see output
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
