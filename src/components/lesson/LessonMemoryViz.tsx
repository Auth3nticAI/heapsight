"use client";

import { useMemo } from "react";
import { useLessonStore } from "@/store/lesson-store";

interface MemorySlot {
  label: string;
  value: string;
  type: "empty" | "stack" | "heap" | "pointer";
}

// Parse simple variable declarations from C++ output/code for visualization
function extractMemoryFromCode(code: string): MemorySlot[] {
  const slots: MemorySlot[] = [];

  // Match variable declarations: type name = value;
  const varPattern =
    /\b(int|float|double|bool|string|char)\s+(\w+)\s*=\s*([^;]+);/g;
  let match;
  while ((match = varPattern.exec(code)) !== null) {
    slots.push({
      label: match[2],
      value: match[3].trim().replace(/"/g, ""),
      type: "stack",
    });
  }

  // Match pointer declarations: type* name = &var;
  const ptrPattern = /\b(int|float|char)\*\s+(\w+)\s*=\s*&(\w+);/g;
  while ((match = ptrPattern.exec(code)) !== null) {
    slots.push({
      label: match[2],
      value: `→ ${match[3]}`,
      type: "pointer",
    });
  }

  // Fill empty slots up to 8
  while (slots.length < 8) {
    slots.push({
      label: `0x${(0x7fff0000 + slots.length * 4).toString(16)}`,
      value: "---",
      type: "empty",
    });
  }

  return slots.slice(0, 8);
}

const TYPE_COLORS: Record<MemorySlot["type"], { bg: string; border: string; label: string; value: string }> = {
  empty: { bg: "#22223a", border: "#2e2e42", label: "#555", value: "#555" },
  stack: { bg: "#1a3a2a", border: "#2d6b4f", label: "#E8E6EA", value: "#4ade80" },
  heap: { bg: "#3a2a1a", border: "#6b4f2d", label: "#E8E6EA", value: "#fbbf24" },
  pointer: { bg: "#2a2a4a", border: "#4f46e5", label: "#E8E6EA", value: "#818cf8" },
};

export default function LessonMemoryViz() {
  const code = useLessonStore((s) => s.currentPart === 1 ? s.part1Code : s.part2Code);

  const slots = useMemo(() => extractMemoryFromCode(code), [code]);

  return (
    <div className="h-full flex flex-col rounded-2xl border border-[#ffffff10] bg-[#09091a] overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#060610] border-b border-[#ffffff08]">
        <span className="text-[10px] font-mono text-[#555] uppercase tracking-wider">
          Memory
        </span>
        <span className="text-[10px] font-mono text-[#444]">
          Stack View
        </span>
      </div>

      <div className="flex-1 p-3 overflow-y-auto">
        <div className="flex flex-wrap gap-2">
          {slots.map((slot, i) => {
            const colors = TYPE_COLORS[slot.type];
            return (
              <div
                key={i}
                className="rounded-md flex flex-col items-center justify-center border transition-all duration-300 p-3 min-w-[140px]"
                style={{
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                }}
              >
                <span
                  className="text-sm font-mono leading-tight text-center"
                  style={{ color: colors.label }}
                >
                  {slot.label}
                </span>
                {slot.type !== "empty" && (
                  <span
                    className="text-xs font-mono mt-1 font-semibold"
                    style={{ color: colors.value }}
                  >
                    {slot.value}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-3 mt-3 flex-wrap">
          {[
            { color: "#22223a", label: "Free" },
            { color: "#2d6b4f", label: "Stack" },
            { color: "#4f46e5", label: "Pointer" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1">
              <div
                className="w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: color }}
              />
              <span className="text-[10px] font-mono text-[#666]">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
