"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface WasmGameCanvasProps {
  js: string;
  wasm: string;
  width: number;
  height: number;
  displayWidth?: number;
  displayHeight?: number;
  onConsoleOutput?: (lines: string[]) => void;
  onError?: (error: string) => void;
  onReady?: () => void;
}

type LoadState = "loading" | "running" | "error";

export default function WasmGameCanvas({
  js,
  wasm,
  width,
  height,
  displayWidth,
  displayHeight,
  onConsoleOutput,
  onError,
  onReady,
}: WasmGameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const moduleRef = useRef<unknown>(null);
  const blobUrlsRef = useRef<string[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [errorMsg, setErrorMsg] = useState("");

  // Stable refs for callbacks to avoid re-triggering the load effect
  const onConsoleOutputRef = useRef(onConsoleOutput);
  const onErrorRef = useRef(onError);
  const onReadyRef = useRef(onReady);
  onConsoleOutputRef.current = onConsoleOutput;
  onErrorRef.current = onError;
  onReadyRef.current = onReady;

  const cleanup = useCallback(() => {
    moduleRef.current = null;
    for (const url of blobUrlsRef.current) {
      URL.revokeObjectURL(url);
    }
    blobUrlsRef.current = [];
  }, []);

  useEffect(() => {
    if (!js || !wasm) return;

    let cancelled = false;
    cleanup();
    setState("loading");
    setErrorMsg("");

    const consoleLines: string[] = [];
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    function flushConsole() {
      if (consoleLines.length > 0 && !cancelled) {
        onConsoleOutputRef.current?.([...consoleLines]);
      }
    }

    function onPrint(text: string) {
      consoleLines.push(text);
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(flushConsole, 500);
    }

    function onPrintErr(text: string) {
      consoleLines.push(`[stderr] ${text}`);
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(flushConsole, 500);
    }

    async function loadModule() {
      try {
        // Decode base64
        const jsString = atob(js);
        const wasmBytes = Uint8Array.from(atob(wasm), (c) => c.charCodeAt(0));

        // Create blob URLs
        const jsBlob = new Blob([jsString], {
          type: "application/javascript",
        });
        const jsBlobUrl = URL.createObjectURL(jsBlob);

        const wasmBlob = new Blob([wasmBytes], {
          type: "application/wasm",
        });
        const wasmBlobUrl = URL.createObjectURL(wasmBlob);

        blobUrlsRef.current = [jsBlobUrl, wasmBlobUrl];

        if (cancelled) return;

        // Dynamic import the ES6 module (from -sMODULARIZE=1 -sEXPORT_ES6=1)
        const moduleFactory = await import(
          /* webpackIgnore: true */ jsBlobUrl
        );
        const factory = moduleFactory.default || moduleFactory;

        if (cancelled) return;

        // Call the factory with Emscripten config
        const instance = await factory({
          canvas: canvasRef.current,
          keyboardListeningElement: canvasRef.current,
          print: onPrint,
          printErr: onPrintErr,
          locateFile: (path: string) => {
            if (path.endsWith(".wasm")) return wasmBlobUrl;
            return path;
          },
        });

        if (cancelled) return;

        moduleRef.current = instance;
        setState("running");

        // Focus canvas so keyboard input works immediately
        canvasRef.current?.focus();

        onReadyRef.current?.();
      } catch (err: unknown) {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : "Failed to load game module";
        setState("error");
        setErrorMsg(message);
        onErrorRef.current?.(message);
      }
    }

    loadModule();

    return () => {
      cancelled = true;
      if (debounceTimer) clearTimeout(debounceTimer);
      flushConsole();
      cleanup();
    };
  }, [js, wasm, cleanup]);

  const cssWidth = displayWidth || width;
  const cssHeight = displayHeight || height;

  if (state === "error") {
    return (
      <div
        style={{
          width: cssWidth,
          height: cssHeight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000",
          border: "1px solid #333",
          borderRadius: 8,
          color: "#ef4444",
          fontFamily: "monospace",
          fontSize: 14,
          padding: 24,
          textAlign: "center",
        }}
      >
        {errorMsg || "Failed to load game"}
      </div>
    );
  }

  return (
    <div
      style={{ position: "relative", width: cssWidth, height: cssHeight }}
      onClick={() => canvasRef.current?.focus()}
    >
      {state === "loading" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#000",
            border: "1px solid #333",
            borderRadius: 8,
            color: "#a3a3a3",
            fontFamily: "monospace",
            fontSize: 14,
            zIndex: 1,
          }}
        >
          Loading game...
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        tabIndex={0}
        autoFocus
        onKeyDown={(e) => {
          // Prevent arrow keys and space from scrolling the page
          if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
            e.preventDefault();
          }
        }}
        style={{
          width: cssWidth,
          height: cssHeight,
          background: "#000",
          border: "1px solid #333",
          borderRadius: 8,
          display: "block",
          margin: "auto",
          outline: "none",
        }}
      />
    </div>
  );
}
