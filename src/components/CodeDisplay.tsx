"use client";

import { useEffect, useState, useCallback } from "react";
import {
  BUGGY_CODE,
  FIXED_CODE,
  BUGGY_HIGHLIGHT_LINES,
  FIXED_HIGHLIGHT_LINES,
} from "@/data/code-snippets";

interface CodeDisplayProps {
  variant: "buggy" | "fixed";
}

// Simple C++ keyword-based highlighter (avoids Prism SSR issues)
function highlightCpp(line: string): string {
  const keywords =
    /\b(class|public|private|protected|void|int|auto|if|else|for|return|delete|nullptr|const|static|bool|char|float|double|struct|enum|namespace|using|template|typename|virtual|override|new)\b/g;
  const types = /\b(Enemy|Vector2|string|vector|list|map|set|size_t)\b/g;
  const comments = /(\/\/.*$)/gm;
  const strings = /("(?:[^"\\]|\\.)*")/g;
  const preprocessor = /(#\w+)/g;

  let result = line
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Comments first (they override everything)
  result = result.replace(comments, '<span style="color:#6a737d">$1</span>');

  // Strings
  result = result.replace(strings, '<span style="color:#c3e88d">$1</span>');

  // Keywords
  result = result.replace(
    keywords,
    '<span style="color:#c792ea">$1</span>'
  );

  // Types
  result = result.replace(types, '<span style="color:#ffcb6b">$1</span>');

  // Preprocessor
  result = result.replace(
    preprocessor,
    '<span style="color:#89ddff">$1</span>'
  );

  return result;
}

export default function CodeDisplay({ variant }: CodeDisplayProps) {
  const code = variant === "buggy" ? BUGGY_CODE : FIXED_CODE;
  const highlights =
    variant === "buggy" ? BUGGY_HIGHLIGHT_LINES : FIXED_HIGHLIGHT_LINES;
  const highlightClass =
    variant === "buggy" ? "line-highlight-red" : "line-highlight-green";

  const [highlightedLines, setHighlightedLines] = useState<string[]>([]);

  const doHighlight = useCallback(() => {
    setHighlightedLines(code.split("\n").map((line) => highlightCpp(line)));
  }, [code]);

  useEffect(() => {
    doHighlight();
  }, [doHighlight]);

  const lines = code.split("\n");

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-mono text-[#AFBCD5]/50 uppercase tracking-wider">
            game.cpp
          </h3>
          {variant === "buggy" ? (
            <span className="text-[10px] font-mono bg-danger/20 text-danger px-1.5 py-0.5 rounded">
              BUGGY
            </span>
          ) : (
            <span className="text-[10px] font-mono bg-primary/20 text-primary px-1.5 py-0.5 rounded">
              FIXED
            </span>
          )}
        </div>
        <span className="text-[10px] font-mono text-[#AFBCD5]/40">read-only</span>
      </div>

      <div className="bg-[#040B10] rounded-lg border border-white/[0.05] overflow-auto flex-1 p-4">
        <pre className="!bg-transparent !p-0 !m-0 font-mono text-[13px] leading-[1.6]">
          <code>
            {lines.map((line, i) => {
              const lineNum = i + 1;
              const isHighlighted = highlights.includes(lineNum);
              const html = highlightedLines[i] || line;

              return (
                <div
                  key={`${variant}-${i}`}
                  className={`flex ${isHighlighted ? highlightClass : ""}`}
                  style={{ minHeight: "1.6em" }}
                >
                  <span className="select-none text-[#AFBCD5]/20 w-8 text-right pr-3 flex-shrink-0 text-[12px]">
                    {lineNum}
                  </span>
                  <span
                    className="flex-1 whitespace-pre"
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                </div>
              );
            })}
          </code>
        </pre>
      </div>
    </div>
  );
}
