"use client";

import { useMemo } from "react";
import {
  getBlocksAtTime,
  getFixedBlocks,
  BlockState,
} from "@/lib/memory-sim";

export type MemoryPhase = "idle" | "running" | "crash" | "diagnosed" | "fixed";

interface MemoryArenaProps {
  phase: MemoryPhase;
  elapsedTime: number;
  showPointers: boolean;
}

const STATE_COLORS: Record<BlockState, string> = {
  free: "#1a1a2e",
  allocated: "#00ff88",
  freed: "#ffaa00",
  dangling: "#ff0040",
  corrupted: "#444444",
};

const STATE_BORDER: Record<BlockState, string> = {
  free: "#2a2a3e",
  allocated: "#00cc6a",
  freed: "#cc8800",
  dangling: "#cc0033",
  corrupted: "#333333",
};

export default function MemoryArena({
  phase,
  elapsedTime,
  showPointers,
}: MemoryArenaProps) {
  const blocks = useMemo(() => {
    if (phase === "fixed") return getFixedBlocks();
    if (phase === "idle") return getBlocksAtTime(0);
    return getBlocksAtTime(elapsedTime);
  }, [phase, elapsedTime]);

  const danglingIndex = phase === "crash" || phase === "diagnosed" ? 14 : null;
  const pointerSourceIndex = 11; // targetLock block

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-mono text-[#666] uppercase tracking-wider">
          Heap Memory
        </h3>
        {phase === "crash" && (
          <span className="text-xs font-mono text-danger animate-pulse">
            CORRUPTION DETECTED
          </span>
        )}
        {phase === "fixed" && (
          <span className="text-xs font-mono text-primary">
            ALL BLOCKS HEALTHY
          </span>
        )}
      </div>

      <div className="grid grid-cols-8 gap-1.5 relative">
        {blocks.map((block, i) => {
          const isDangling = i === danglingIndex;
          const isPointerSource =
            i === pointerSourceIndex && showPointers;

          return (
            <div
              key={block.id}
              className={`
                relative aspect-square rounded-md flex flex-col items-center justify-center
                transition-all duration-300 border
                ${isDangling ? "animate-pulse_red" : ""}
                ${isPointerSource ? "ring-2 ring-warning" : ""}
              `}
              style={{
                backgroundColor: STATE_COLORS[block.state],
                borderColor: STATE_BORDER[block.state],
              }}
            >
              <span
                className="text-[7px] font-mono leading-tight text-center break-all px-0.5"
                style={{
                  color:
                    block.state === "free"
                      ? "#444"
                      : block.state === "corrupted"
                      ? "#888"
                      : "#000",
                }}
              >
                {block.label}
              </span>

              {/* Diagnosed labels */}
              {phase === "diagnosed" && i === danglingIndex && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="text-[9px] font-mono bg-danger text-white px-1 rounded">
                    DANGLING PTR
                  </span>
                </div>
              )}
              {phase === "diagnosed" && block.state === "freed" && (
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="text-[9px] font-mono bg-warning text-black px-1 rounded">
                    FREED
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {/* Pointer arrow overlay */}
        {showPointers && (phase === "crash" || phase === "diagnosed") && (
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{ width: "100%", height: "100%" }}
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="6"
                refX="8"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#ff0040" />
              </marker>
            </defs>
            {/* Arrow from targetLock (block 11) to Enemy_6 (block 14) */}
            <line
              x1={`${((pointerSourceIndex % 8) + 0.5) * 12.5}%`}
              y1={`${(Math.floor(pointerSourceIndex / 8) + 0.5) * 25}%`}
              x2={`${((14 % 8) + 0.5) * 12.5}%`}
              y2={`${(Math.floor(14 / 8) + 0.5) * 25}%`}
              stroke="#ff0040"
              strokeWidth="2"
              strokeDasharray="4 2"
              markerEnd="url(#arrowhead)"
            />
          </svg>
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-3 flex-wrap">
        {[
          { color: "#1a1a2e", label: "Free" },
          { color: "#00ff88", label: "Allocated" },
          { color: "#ffaa00", label: "Freed" },
          { color: "#ff0040", label: "Dangling" },
          { color: "#444", label: "Corrupted" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: color }}
            />
            <span className="text-[10px] font-mono text-[#666]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
