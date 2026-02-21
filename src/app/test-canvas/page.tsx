"use client";

import { useState, useEffect } from "react";
import GameCanvasWrapper from "@/components/GameCanvasWrapper";

const DEFAULT_CODE = `#include "raylib.h"
#include <iostream>

int main() {
    InitWindow(640, 640, "HeapSight Test");
    SetTargetFPS(60);

    std::cout << "Game started!" << std::endl;

    int x = 300, y = 300;
    const int speed = 4;

    while (!WindowShouldClose()) {
        if (IsKeyDown(KEY_RIGHT)) x += speed;
        if (IsKeyDown(KEY_LEFT))  x -= speed;
        if (IsKeyDown(KEY_DOWN))  y += speed;
        if (IsKeyDown(KEY_UP))    y -= speed;

        BeginDrawing();
        ClearBackground(BLACK);
        DrawRectangle(x, y, 40, 40, GREEN);
        DrawText("Arrow keys to move", 10, 10, 20, GRAY);
        DrawText("HeapSight Canvas Test", 10, 610, 20, DARKGRAY);
        EndDrawing();
    }

    CloseWindow();
    return 0;
}`;

type LearningPath = "rpg" | "platformer" | "shooter" | "crawler";

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

export default function TestCanvasPage() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [path, setPath] = useState<LearningPath>("rpg");
  const [compiled, setCompiled] = useState<{
    js?: string;
    wasm?: string;
  } | null>(null);
  const [compiling, setCompiling] = useState(false);
  const [compileError, setCompileError] = useState<string | null>(null);
  const [compileTimeMs, setCompileTimeMs] = useState<number | null>(null);
  const isMobile = useIsMobile();

  async function handleCompile() {
    setCompiling(true);
    setCompileError(null);
    setCompileTimeMs(null);
    setCompiled(null);

    try {
      const res = await fetch("/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, path, lesson: 1 }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCompileError(data.error || `HTTP ${res.status}`);
        return;
      }

      if (data.compileTimeMs) {
        setCompileTimeMs(data.compileTimeMs);
      }

      if (!data.success) {
        setCompileError(
          data.errors?.join("\n") || "Compilation failed"
        );
        return;
      }

      setCompiled({ js: data.js, wasm: data.wasm });
    } catch (err) {
      setCompileError(
        err instanceof Error ? err.message : "Network error"
      );
    } finally {
      setCompiling(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "#e5e5e5",
        padding: isMobile ? 12 : 24,
      }}
    >
      <h1
        style={{
          fontSize: isMobile ? 20 : 24,
          fontWeight: 700,
          marginBottom: 16,
          fontFamily: "monospace",
        }}
      >
        HeapSight Canvas Test
      </h1>

      {/* Path selector */}
      <div style={{ marginBottom: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {(["rpg", "platformer", "shooter", "crawler"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPath(p)}
            style={{
              padding: "6px 14px",
              borderRadius: 6,
              border: "1px solid",
              borderColor: path === p ? "#3b82f6" : "#333",
              background: path === p ? "#1e3a5f" : "#1a1a1a",
              color: path === p ? "#93c5fd" : "#a3a3a3",
              fontFamily: "monospace",
              fontSize: 13,
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Main layout — stacked on mobile, side-by-side on desktop */}
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: 16,
          alignItems: "flex-start",
        }}
      >
        {/* Canvas side */}
        <div style={{ flex: isMobile ? undefined : "0 0 auto", width: isMobile ? "100%" : undefined }}>
          {compiling ? (
            <GameCanvasWrapper compiled={null} path={path} />
          ) : compiled ? (
            <GameCanvasWrapper compiled={compiled} path={path} />
          ) : (
            <div
              style={{
                width: isMobile ? "100%" : undefined,
                maxWidth: "100%",
              }}
            >
              <div
                style={{
                  width: isMobile ? "100%" : 640,
                  aspectRatio: isMobile ? "1" : undefined,
                  height: isMobile ? undefined : 640,
                  maxWidth: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#000",
                  border: "1px solid #333",
                  borderRadius: 8,
                  color: "#555",
                  fontFamily: "monospace",
                  fontSize: 14,
                  textAlign: "center",
                  padding: 24,
                }}
              >
                Write code and click Compile &amp; Run
              </div>
            </div>
          )}
        </div>

        {/* Code editor side */}
        <div style={{ flex: 1, minWidth: 0, width: isMobile ? "100%" : undefined }}>
          {/* Editor header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 13,
                color: "#a3a3a3",
              }}
            >
              student.cpp
              {isMobile && (
                <span style={{ marginLeft: 8, color: "#777", fontSize: 12 }}>
                  🔒 Read-only on mobile
                </span>
              )}
            </span>

            {compileTimeMs != null && (
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 12,
                  color: "#22c55e",
                }}
              >
                {compileTimeMs}ms
              </span>
            )}
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            readOnly={isMobile}
            spellCheck={false}
            style={{
              width: "100%",
              height: isMobile ? 200 : 500,
              padding: 12,
              background: isMobile ? "#111" : "#0d0d0d",
              border: "1px solid #333",
              borderRadius: 8,
              color: isMobile ? "#888" : "#e5e5e5",
              fontFamily: "monospace",
              fontSize: 13,
              lineHeight: 1.6,
              resize: isMobile ? "none" : "vertical",
              outline: "none",
              tabSize: 4,
            }}
          />

          {/* Compile button */}
          <button
            onClick={handleCompile}
            disabled={compiling || !code.trim()}
            style={{
              marginTop: 8,
              width: "100%",
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              background: compiling ? "#333" : "#2563eb",
              color: compiling ? "#888" : "#fff",
              fontFamily: "monospace",
              fontSize: 14,
              fontWeight: 600,
              cursor: compiling ? "not-allowed" : "pointer",
            }}
          >
            {compiling ? "Compiling..." : "Compile & Run"}
          </button>

          {/* Compile errors */}
          {compileError && (
            <div
              style={{
                marginTop: 8,
                padding: "10px 12px",
                background: "#1a0000",
                border: "1px solid #7f1d1d",
                borderRadius: 6,
                color: "#ef4444",
                fontFamily: "monospace",
                fontSize: 13,
                whiteSpace: "pre-wrap",
              }}
            >
              {compileError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
