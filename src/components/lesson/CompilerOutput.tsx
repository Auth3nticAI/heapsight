"use client";

import { useState } from "react";
import { useLessonStore } from "@/store/lesson-store";

export default function CompilerOutput() {
  const errors = useLessonStore((s) => s.errors);
  const warnings = useLessonStore((s) => s.warnings);
  const compileTimeMs = useLessonStore((s) => s.compileTimeMs);
  const isRunning = useLessonStore((s) => s.isRunning);

  const [warningsExpanded, setWarningsExpanded] = useState(false);

  // Nothing to show yet
  if (!isRunning && compileTimeMs === null && errors.length === 0) return null;

  // Compiling state
  if (isRunning) {
    return (
      <div className="shrink-0 px-3 py-2 bg-[#040B10] border-t border-white/[0.05] flex items-center gap-2">
        <svg className="h-3.5 w-3.5 animate-spin text-[#AFBCD5]/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="15" />
        </svg>
        <span className="text-[10px] font-mono text-[#AFBCD5]/50">Compiling...</span>
      </div>
    );
  }

  // Error state
  if (errors.length > 0) {
    return (
      <div className="shrink-0 border-t border-red-500/20 bg-red-500/[0.03] max-h-[200px] overflow-y-auto">
        <div className="px-3 py-2 flex items-center gap-2">
          <span className="text-red-400 text-xs">&#10007;</span>
          <span className="text-[10px] font-mono text-red-400">
            {errors.length} error{errors.length !== 1 ? "s" : ""}
            {compileTimeMs !== null && <span className="text-[#AFBCD5]/30 ml-2">({compileTimeMs}ms)</span>}
          </span>
        </div>
        <div className="px-3 pb-2 space-y-1">
          {errors.map((err, i) => (
            <pre key={i} className="text-[11px] font-mono text-red-300/80 whitespace-pre-wrap break-words leading-relaxed">
              {err}
            </pre>
          ))}
        </div>
      </div>
    );
  }

  // Success state (collapsed)
  return (
    <div className="shrink-0 border-t border-white/[0.05] bg-[#040B10]">
      <div className="px-3 py-1.5 flex items-center gap-2">
        <span className="text-emerald-400 text-xs">&#10003;</span>
        <span className="text-[10px] font-mono text-emerald-400/70">
          Compiled in {compileTimeMs}ms
        </span>
        {warnings.length > 0 && (
          <button
            onClick={() => setWarningsExpanded(!warningsExpanded)}
            className="text-[10px] font-mono text-amber-400/70 hover:text-amber-400 transition-colors ml-2"
          >
            {warningsExpanded ? "\u25BC" : "\u25B6"} {warnings.length} warning{warnings.length !== 1 ? "s" : ""}
          </button>
        )}
      </div>
      {warningsExpanded && warnings.length > 0 && (
        <div className="px-3 pb-2 space-y-1">
          {warnings.map((w, i) => (
            <pre key={i} className="text-[11px] font-mono text-amber-300/60 whitespace-pre-wrap break-words leading-relaxed">
              {w}
            </pre>
          ))}
        </div>
      )}
    </div>
  );
}
