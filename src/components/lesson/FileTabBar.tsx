"use client";

import { useLessonStore } from "@/store/lesson-store";

export default function FileTabBar() {
  const currentPart = useLessonStore((s) => s.currentPart);
  const part1Files = useLessonStore((s) => s.part1Files);
  const part2Files = useLessonStore((s) => s.part2Files);
  const activeFilePath = useLessonStore((s) => s.activeFilePath);
  const setActiveFile = useLessonStore((s) => s.setActiveFile);

  const files = currentPart === 1 ? part1Files : part2Files;
  const fileNames = Object.keys(files);

  // Single file — show static label instead of tabs
  if (fileNames.length <= 1) return null;

  return (
    <div className="flex shrink-0 bg-[#040B10] border-b border-white/[0.05] px-1 overflow-x-auto">
      {fileNames.map((name) => (
        <button
          key={name}
          onClick={() => setActiveFile(name)}
          className={`px-3 py-1.5 text-[10px] font-mono transition-colors border-b-2 -mb-px whitespace-nowrap ${
            activeFilePath === name
              ? "text-white border-[#246BFD] bg-white/[0.04]"
              : "text-[#AFBCD5]/50 border-transparent hover:text-[#AFBCD5]/70"
          }`}
        >
          {name}
        </button>
      ))}
    </div>
  );
}
