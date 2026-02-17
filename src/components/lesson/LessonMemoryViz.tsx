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

const TYPE_COLORS: Record<MemorySlot["type"], { bg: string; border: string }> = {
  empty: { bg: "#1a1a2e", border: "#2a2a3e" },
  stack: { bg: "#00ff88", border: "#00cc6a" },
  heap: { bg: "#ffaa00", border: "#cc8800" },
  pointer: { bg: "#6366f1", border: "#4f46e5" },
};

export default function LessonMemoryViz() {
  const code = useLessonStore((s) => s.currentPart === 1 ? s.part1Code : s.part2Code);

  const slots = useMemo(() => extractMemoryFromCode(code), [code]);

  return (
    <div className="h-full flex flex-col rounded-lg border border-[#1a1a2e] bg-surface overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0d0d1a] border-b border-[#1a1a2e]">
        <span className="text-[10px] font-mono text-[#555] uppercase tracking-wider">
          Memory
        </span>
        <span className="text-[10px] font-mono text-[#444]">
          Stack View
        </span>
      </div>

      <div className="flex-1 p-3 overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-1.5">
          {slots.map((slot, i) => {
            const colors = TYPE_COLORS[slot.type];
            return (
              <div
                key={i}
                className="aspect-square rounded-md flex flex-col items-center justify-center border transition-all duration-300"
                style={{
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                }}
              >
                <span
                  className="text-[10px] sm:text-[8px] font-mono leading-tight text-center break-all px-0.5"
                  style={{
                    color: slot.type === "empty" ? "#444" : "#000",
                  }}
                >
                  {slot.label}
                </span>
                {slot.type !== "empty" && (
                  <span
                    className="text-[9px] sm:text-[7px] font-mono mt-0.5"
                    style={{ color: "#000" }}
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
            { color: "#1a1a2e", label: "Free" },
            { color: "#00ff88", label: "Stack" },
            { color: "#6366f1", label: "Pointer" },
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
