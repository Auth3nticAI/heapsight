"use client";

import { useMemo } from "react";
import type { Lesson } from "@/types/lesson";
import { useLessonStore } from "@/store/lesson-store";

interface LessonInstructionsProps {
  lesson: Lesson;
}

// Simple markdown-to-HTML for lesson instructions
function renderMarkdown(md: string): string {
  const html = md
    // Code blocks
    .replace(/```(\w+)?\n([\s\S]*?)```/g, (_m, _lang, code) => {
      return `<pre class="bg-[#0d0d1a] border border-[#1a1a2e] rounded-lg p-3 my-2 overflow-x-auto"><code class="text-xs font-mono text-[#e0e0e0]">${escapeHtml(code.trim())}</code></pre>`;
    })
    // Inline code
    .replace(
      /`([^`]+)`/g,
      '<code class="bg-[#1a1a2e] text-primary px-1.5 py-0.5 rounded text-xs font-mono">$1</code>'
    )
    // Headers
    .replace(
      /^### (.+)$/gm,
      '<h3 class="text-sm font-semibold text-white mt-4 mb-1">$1</h3>'
    )
    .replace(
      /^## (.+)$/gm,
      '<h2 class="text-base font-semibold text-white mt-4 mb-2">$1</h2>'
    )
    .replace(
      /^# (.+)$/gm,
      '<h1 class="text-lg font-bold text-white mb-2">$1</h1>'
    )
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
    // List items
    .replace(
      /^- (.+)$/gm,
      '<li class="text-sm text-[#aaa] ml-4 list-disc">$1</li>'
    )
    // Paragraphs (lines that aren't already HTML)
    .replace(
      /^(?!<[hlupod])([\w"].+)$/gm,
      '<p class="text-sm text-[#aaa] my-1">$1</p>'
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
  lesson,
}: LessonInstructionsProps) {
  const activeHint = useLessonStore((s) => s.activeHint);
  const showNextHint = useLessonStore((s) => s.showNextHint);

  const instructionsHtml = useMemo(
    () => renderMarkdown(lesson.instructions),
    [lesson.instructions]
  );

  const hasMoreHints = activeHint < lesson.hints.length - 1;

  return (
    <div className="h-full flex flex-col rounded-lg border border-[#1a1a2e] bg-surface overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#0d0d1a] border-b border-[#1a1a2e]">
        <span className="text-[10px] font-mono text-[#555] uppercase tracking-wider">
          Instructions
        </span>
        <div className="flex items-center gap-2">
          {lesson.concepts.map((c) => (
            <span
              key={c}
              className="text-[9px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded"
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto p-4 prose-invert"
        dangerouslySetInnerHTML={{ __html: instructionsHtml }}
      />

      {/* Hints */}
      <div className="border-t border-[#1a1a2e] p-3">
        {activeHint >= 0 && (
          <div className="space-y-2 mb-2">
            {lesson.hints.slice(0, activeHint + 1).map((hint, i) => (
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
            className="text-xs font-mono text-[#555] hover:text-warning transition-colors"
          >
            {activeHint < 0 ? "Need a hint?" : "Show another hint"}
          </button>
        )}
      </div>
    </div>
  );
}
