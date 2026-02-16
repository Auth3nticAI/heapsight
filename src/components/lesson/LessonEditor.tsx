"use client";

import { useCallback } from "react";
import Editor from "@monaco-editor/react";
import { useLessonStore } from "@/store/lesson-store";

interface LessonEditorProps {
  readOnly?: boolean;
}

export default function LessonEditor({ readOnly = false }: LessonEditorProps) {
  const code = useLessonStore((s) => s.currentCode);
  const setCode = useLessonStore((s) => s.setCode);

  const handleChange = useCallback(
    (value: string | undefined) => {
      if (value !== undefined) setCode(value);
    },
    [setCode]
  );

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-[#1a1a2e]">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#0d0d1a] border-b border-[#1a1a2e]">
        <span className="text-[10px] font-mono text-[#555] uppercase tracking-wider">
          main.cpp
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
          fontSize: 13,
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
