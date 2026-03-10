"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import WasmGameCanvas from "./WasmGameCanvas";
import GameStartOverlay from "./GameStartOverlay";

type LearningPath = "rpg" | "platformer" | "shooter" | "crawler" | "roguelike" | "aisandbox";

interface CompileResult {
  js?: string;
  wasm?: string;
  data?: string | null;
}

interface GameCanvasWrapperProps {
  compiled: CompileResult | null;
  path: LearningPath;
  onConsoleOutput?: (lines: string[]) => void;
  onError?: (error: string) => void;
  autoStart?: boolean;
}

const CANVAS_SIZES: Record<LearningPath, { width: number; height: number }> = {
  rpg: { width: 640, height: 640 },
  platformer: { width: 800, height: 450 },
  shooter: { width: 800, height: 450 },
  crawler: { width: 800, height: 600 },
  roguelike: { width: 800, height: 600 },
  aisandbox: { width: 800, height: 600 },
};

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function check() {
      setIsMobile(window.innerWidth < 768);
    }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return isMobile;
}

export default function GameCanvasWrapper({
  compiled,
  path,
  onConsoleOutput: externalOnConsoleOutput,
  onError: externalOnError,
  autoStart = false,
}: GameCanvasWrapperProps) {
  const [consoleLines, setConsoleLines] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showConsole, setShowConsole] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const isMobile = useIsMobile();

  const { width, height } = CANVAS_SIZES[path];
  const canvasAreaRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    const el = canvasAreaRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
        setContainerHeight(entry.contentRect.height);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Fit canvas to available space, maintaining aspect ratio, never upscaling
  const scaleX = containerWidth > 0 ? containerWidth / width : 1;
  const scaleY = containerHeight > 0 ? containerHeight / height : 1;
  const scale = Math.min(scaleX, scaleY, 1);
  const displayWidth = Math.round(width * scale);
  const displayHeight = Math.round(height * scale);

  const handleConsoleOutput = useCallback((lines: string[]) => {
    setConsoleLines(lines);
    externalOnConsoleOutput?.(lines);
  }, [externalOnConsoleOutput]);

  const handleError = useCallback((err: string) => {
    setError(err);
    externalOnError?.(err);
  }, [externalOnError]);

  const handleReady = useCallback(() => {
    setError(null);
  }, []);

  // No compiled output yet — show compiling state
  if (!compiled?.js || !compiled?.wasm) {
    return (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div
          ref={canvasAreaRef}
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#000",
            border: "1px solid #333",
            borderRadius: 8,
          }}
        >
          <span style={{ color: "#a3a3a3", fontFamily: "monospace", fontSize: 14 }}>
            Compiling...
          </span>
        </div>
      </div>
    );
  }

  const consoleContent = (
    <div
      style={{
        padding: "8px 12px",
        background: "#0a0a0a",
        border: "1px solid #333",
        borderRadius: 6,
        fontFamily: "monospace",
        fontSize: 13,
        color: "#22c55e",
        maxHeight: 150,
        overflowY: "auto",
        whiteSpace: "pre-wrap",
        wordBreak: "break-all",
      }}
    >
      {consoleLines.length === 0 ? (
        <span style={{ color: "#555" }}>Console output will appear here</span>
      ) : (
        consoleLines.map((line, i) => (
          <div
            key={i}
            style={
              line.startsWith("[stderr]") ? { color: "#ef4444" } : undefined
            }
          >
            {line}
          </div>
        ))
      )}
    </div>
  );

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", touchAction: isMobile ? "pan-y" : undefined }}>
      {/* Canvas area — flex-1 takes all available space */}
      <div
        ref={canvasAreaRef}
        style={{
          flex: 1,
          minHeight: 0,
          width: "100%",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {!audioUnlocked && !autoStart ? (
          <GameStartOverlay
            onStart={() => setAudioUnlocked(true)}
            width={displayWidth}
            height={displayHeight}
          />
        ) : (
          <WasmGameCanvas
            js={compiled.js}
            wasm={compiled.wasm}
            data={compiled.data || undefined}
            width={width}
            height={height}
            displayWidth={displayWidth}
            displayHeight={displayHeight}
            onConsoleOutput={handleConsoleOutput}
            onError={handleError}
            onReady={handleReady}
          />
        )}
      </div>

      {/* Bottom section — pinned, never pushes canvas */}
      <div style={{ flexShrink: 0, marginTop: 4 }}>
        {error && (
          <div
            style={{
              marginBottom: 4,
              padding: "8px 12px",
              background: "#1a0000",
              border: "1px solid #7f1d1d",
              borderRadius: 6,
              color: "#ef4444",
              fontFamily: "monospace",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        {/* Mobile banner */}
        {isMobile && (
          <div
            style={{
              marginBottom: 4,
              padding: "10px 14px",
              background: "#451a03",
              border: "1px solid #92400e",
              borderRadius: 8,
              color: "#fbbf24",
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            <span style={{ marginRight: 6 }}>💻</span>
            Switch to a computer for the full coding experience. Use keyboard
            controls to interact with your game.
          </div>
        )}

        {/* Console output — togglable on mobile, always visible on desktop */}
        {isMobile ? (
          <div>
            <button
              onClick={() => setShowConsole((v) => !v)}
              style={{
                width: "100%",
                padding: "8px 12px",
                background: "#1a1a1a",
                border: "1px solid #333",
                borderRadius: 6,
                color: "#a3a3a3",
                fontFamily: "monospace",
                fontSize: 13,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              {showConsole ? "▼ Hide Console" : "▶ Show Console"}
              {consoleLines.length > 0 && (
                <span
                  style={{
                    marginLeft: 8,
                    color: "#22c55e",
                    fontSize: 12,
                  }}
                >
                  ({consoleLines.length} line{consoleLines.length !== 1 ? "s" : ""}
                  )
                </span>
              )}
            </button>
            {showConsole && consoleContent}
          </div>
        ) : (
          consoleContent
        )}
      </div>
    </div>
  );
}
