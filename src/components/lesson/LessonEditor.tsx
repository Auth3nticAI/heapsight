"use client";

import { useCallback, useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { useLessonStore } from "@/store/lesson-store";
import FileTabBar from "@/components/lesson/FileTabBar";
import CompilerOutput from "@/components/lesson/CompilerOutput";

interface LessonEditorProps {
  readOnly?: boolean;
}

export default function LessonEditor({ readOnly = false }: LessonEditorProps) {
  const currentPart = useLessonStore((s) => s.currentPart);
  const part1Code = useLessonStore((s) => s.part1Code);
  const part2Code = useLessonStore((s) => s.part2Code);
  const setPart1Code = useLessonStore((s) => s.setPart1Code);
  const setPart2Code = useLessonStore((s) => s.setPart2Code);
  const activeFilePath = useLessonStore((s) => s.activeFilePath);
  const part1Files = useLessonStore((s) => s.part1Files);
  const part2Files = useLessonStore((s) => s.part2Files);

  const code = currentPart === 1 ? part1Code : part2Code;
  const setCode = currentPart === 1 ? setPart1Code : setPart2Code;
  const files = currentPart === 1 ? part1Files : part2Files;
  const isMultiFile = Object.keys(files).length > 1;

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
    <div className="h-full w-full rounded-2xl overflow-hidden border border-white/[0.08] flex flex-col">
      {/* Single-file: static label. Multi-file: tab bar rendered below this header. */}
      {!isMultiFile && (
        <div className="shrink-0 flex items-center justify-between px-3 py-1.5 bg-[#040B10] border-b border-white/[0.05]">
          <span className="text-[10px] font-mono text-[#AFBCD5]/50 uppercase tracking-wider">
            {activeFilePath}
          </span>
          <span className="text-[10px] font-mono text-[#AFBCD5]/40">C++</span>
        </div>
      )}
      {isMultiFile && <FileTabBar />}
      <div className="flex-1 min-h-0">
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
      <CompilerOutput />
    </div>
  );
}
