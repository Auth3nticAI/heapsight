"use client";

import { useCallback, useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { useLessonStore } from "@/store/lesson-store";

interface LessonEditorProps {
  readOnly?: boolean;
}

export default function LessonEditor({ readOnly = false }: LessonEditorProps) {
  const currentPart = useLessonStore((s) => s.currentPart);
  const part1Code = useLessonStore((s) => s.part1Code);
  const part2Code = useLessonStore((s) => s.part2Code);
  const setPart1Code = useLessonStore((s) => s.setPart1Code);
  const setPart2Code = useLessonStore((s) => s.setPart2Code);

  const code = currentPart === 1 ? part1Code : part2Code;
  const setCode = currentPart === 1 ? setPart1Code : setPart2Code;

  // Larger font on mobile (14px) to prevent iOS zoom and improve readability
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handleChange = useCallback(
    (value: string | undefined) => {
      if (value !== undefined) setCode(value);
    },
    [setCode]
  );

  return (
    <div className="h-full w-full min-h-[300px] rounded-lg overflow-hidden border border-[#1a1a2e]">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#0d0d1a] border-b border-[#1a1a2e]">
        <span className="text-[10px] font-mono text-[#555] uppercase tracking-wider">
          {currentPart === 2 ? "game.cpp" : "main.cpp"}
        </span>
        <span className="text-[10px] font-mono text-[#444]">C++</span>
      </div>
      <Editor
        height="100%"
        defaultLanguage="cpp"
        theme="vs-dark"
        value={code}
        onChange={handleChange}
        options={{
          fontSize: isMobile ? 14 : 13,
          fontFamily: "'JetBrains Mono', monospace",
          minimap: { enabled: false },
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          wordWrap: "on",
          padding: { top: 8 },
          readOnly,
          automaticLayout: true,
          tabSize: 4,
          renderLineHighlight: "line",
          bracketPairColorization: { enabled: true },
          suggest: { showKeywords: true },
        }}
      />
    </div>
  );
}
