"use client";

import { useMemo } from "react";
import type { LessonPart } from "@/types/lesson";
import { useLessonStore } from "@/store/lesson-store";

interface LessonInstructionsProps {
  part: LessonPart;
  concepts: string[];
}

// Simple markdown-to-HTML for lesson instructions
function renderMarkdown(md: string): string {
  const html = md
    // Code blocks
    .replace(/```(\w+)?\n([\s\S]*?)```/g, (_m, _lang, code) => {
      return `<pre class="bg-[#040B10] border border-white/[0.08] rounded-lg p-3 my-3 overflow-x-auto"><code class="text-xs font-mono text-[#e0e0e0]">${escapeHtml(code.trim())}</code></pre>`;
    })
    // Inline code (escaped to prevent XSS)
    .replace(/`([^`]+)`/g, (_m, code) => {
      return `<code class="bg-[#ffffff10] text-[#246BFD] px-1.5 py-0.5 rounded text-xs font-mono">${escapeHtml(code)}</code>`;
    })
    // Headers
    .replace(
      /^### (.+)$/gm,
      '<h3 class="text-sm font-semibold text-[#E8E6EA] mt-5 mb-1.5">$1</h3>'
    )
    .replace(
      /^## (.+)$/gm,
      '<h2 class="text-base font-semibold text-[#E8E6EA] mt-5 mb-2">$1</h2>'
    )
    .replace(
      /^# (.+)$/gm,
      '<h1 class="text-lg font-bold text-[#E8E6EA] mb-3">$1</h1>'
    )
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-[#E8E6EA]">$1</strong>')
    // List items
    .replace(
      /^- (.+)$/gm,
      '<li class="text-sm text-[#AFBCD5]/80 ml-4 list-disc mb-1">$1</li>'
    )
    // Paragraphs (lines that aren't already HTML)
    .replace(
      /^(?!<[hlupod])([\w"].+)$/gm,
      '<p class="text-sm text-[#AFBCD5]/80 mb-[1.5em]">$1</p>'
    );

  return html;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export default function LessonInstructions({
  part,
  concepts,
}: LessonInstructionsProps) {
  const activeHint = useLessonStore((s) => s.activeHint);
  const showNextHint = useLessonStore((s) => s.showNextHint);

  const instructionsHtml = useMemo(
    () => renderMarkdown(part.instructions),
    [part.instructions]
  );

  const hasMoreHints = activeHint < part.hints.length - 1;

  return (
    <div className="h-full flex flex-col rounded-2xl border border-white/[0.08] bg-[#071528] overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#040B10] border-b border-white/[0.05]">
        <span className="text-[10px] font-mono text-[#AFBCD5]/50 uppercase tracking-wider">
          {part.type === "game_builder" ? "Game Builder" : "Instructions"}
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-[60%] scrollbar-none">
          {concepts.map((c) => (
            <span
              key={c}
              className="text-[9px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded whitespace-nowrap shrink-0"
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto p-4 prose-invert leading-[1.6]"
        dangerouslySetInnerHTML={{ __html: instructionsHtml }}
      />

      {/* Hints */}
      <div className="border-t border-white/[0.05] p-3">
        {activeHint >= 0 && (
          <div className="space-y-2 mb-2">
            {part.hints.slice(0, activeHint + 1).map((hint, i) => (
              <div
                key={i}
                className="text-xs font-mono text-warning bg-warning/10 border border-warning/20 rounded p-2"
              >
                Hint {i + 1}: {hint}
              </div>
            ))}
          </div>
        )}
        {hasMoreHints && (
          <button
            onClick={showNextHint}
            className="text-xs font-mono text-[#AFBCD5]/50 hover:text-warning transition-colors min-h-[44px] py-2"
          >
            {activeHint < 0 ? "Need a hint?" : "Show another hint"}
          </button>
        )}
      </div>
    </div>
  );
}
