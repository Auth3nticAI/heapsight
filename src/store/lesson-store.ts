import { create } from "zustand";
import type { TestResult } from "@/lib/cpp-runner";
import type { GameFrame } from "@/types/game";
import type { CrawlerFrame } from "@/types/crawler";

interface LessonStore {
  currentPart: 1 | 2;
  part1Completed: boolean;
  part2Completed: boolean;

  part1Code: string;
  part2Code: string;
  part1Files: Record<string, string>;
  part2Files: Record<string, string>;
  activeFilePath: string;
  gameFrame: GameFrame | null;
  crawlerFrame: CrawlerFrame | null;
  crawlerFrames: CrawlerFrame[];

  output: string;
  errors: string[];
  warnings: string[];
  testResults: TestResult[];
  isRunning: boolean;
  activeHint: number;

  wasmJs: string | null;
  wasmWasm: string | null;
  wasmData: string | null;
  compileTimeMs: number | null;

  setCurrentPart: (part: 1 | 2) => void;
  setPart1Code: (code: string) => void;
  setPart2Code: (code: string) => void;
  setActiveFile: (path: string) => void;
  setGameFrame: (frame: GameFrame | null) => void;
  setCrawlerFrame: (frame: CrawlerFrame | null) => void;
  setCrawlerFrames: (frames: CrawlerFrame[]) => void;
  setOutput: (output: string) => void;
  setErrors: (errors: string[]) => void;
  setWarnings: (warnings: string[]) => void;
  setTestResults: (results: TestResult[]) => void;
  setIsRunning: (running: boolean) => void;
  setWasmOutput: (js: string | null, wasm: string | null, data: string | null, compileTimeMs: number | null) => void;
  showNextHint: () => void;
  markPart1Complete: () => void;
  markPart2Complete: () => void;
  setPartFiles: (part: 1 | 2, files: Record<string, string>) => void;
  resetLesson: (part1Files: Record<string, string>, part2Files: Record<string, string>) => void;
}

export const useLessonStore = create<LessonStore>((set) => ({
  currentPart: 1,
  part1Completed: false,
  part2Completed: false,

  part1Code: "",
  part2Code: "",
  part1Files: { "main.cpp": "" },
  part2Files: { "main.cpp": "" },
  activeFilePath: "main.cpp",
  gameFrame: null,
  crawlerFrame: null,
  crawlerFrames: [],

  output: "",
  errors: [],
  warnings: [],
  testResults: [],
  isRunning: false,
  activeHint: -1,

  wasmJs: null,
  wasmWasm: null,
  wasmData: null,
  compileTimeMs: null,

  setCurrentPart: (part) =>
    set((s) => {
      const files = part === 1 ? s.part1Files : s.part2Files;
      const firstFile = Object.keys(files)[0] || "main.cpp";
      return {
        currentPart: part,
        activeFilePath: firstFile,
        output: "",
        errors: [],
        warnings: [],
        testResults: [],
        activeHint: -1,
        wasmJs: null,
        wasmWasm: null,
        wasmData: null,
        compileTimeMs: null,
      };
    }),
  setPart1Code: (code) =>
    set((s) => ({
      part1Code: code,
      part1Files: { ...s.part1Files, [s.activeFilePath]: code },
    })),
  setPart2Code: (code) =>
    set((s) => ({
      part2Code: code,
      part2Files: { ...s.part2Files, [s.activeFilePath]: code },
    })),
  setActiveFile: (path) =>
    set((s) => {
      if (s.currentPart === 1) {
        const files = { ...s.part1Files, [s.activeFilePath]: s.part1Code };
        return { activeFilePath: path, part1Code: files[path] || "", part1Files: files };
      } else {
        const files = { ...s.part2Files, [s.activeFilePath]: s.part2Code };
        return { activeFilePath: path, part2Code: files[path] || "", part2Files: files };
      }
    }),
  setGameFrame: (frame) => set({ gameFrame: frame }),
  setCrawlerFrame: (frame) => set({ crawlerFrame: frame }),
  setCrawlerFrames: (frames) => set({ crawlerFrames: frames }),
  setOutput: (output) => set({ output }),
  setErrors: (errors) => set({ errors }),
  setWarnings: (warnings) => set({ warnings }),
  setTestResults: (results) => set({ testResults: results }),
  setIsRunning: (running) => set({ isRunning: running }),
  setWasmOutput: (js, wasm, data, compileTimeMs) => set({ wasmJs: js, wasmWasm: wasm, wasmData: data, compileTimeMs }),
  showNextHint: () => set((s) => ({ activeHint: s.activeHint + 1 })),
  markPart1Complete: () => set({ part1Completed: true }),
  markPart2Complete: () => set({ part2Completed: true }),
  setPartFiles: (part, files) => {
    const first = Object.keys(files)[0] || "main.cpp";
    set(
      part === 1
        ? { part1Files: files, part1Code: files[first] || "", activeFilePath: first }
        : { part2Files: files, part2Code: files[first] || "", activeFilePath: first }
    );
  },
  resetLesson: (p1Files, p2Files) => {
    const firstFile = Object.keys(p1Files)[0] || "main.cpp";
    set({
      currentPart: 1,
      part1Completed: false,
      part2Completed: false,
      part1Code: p1Files[firstFile] || "",
      part2Code: p2Files[Object.keys(p2Files)[0] || "main.cpp"] || "",
      part1Files: p1Files,
      part2Files: p2Files,
      activeFilePath: firstFile,
      gameFrame: null,
      crawlerFrame: null,
      crawlerFrames: [],
      output: "",
      errors: [],
      warnings: [],
      testResults: [],
      isRunning: false,
      activeHint: -1,
      wasmJs: null,
      wasmWasm: null,
      wasmData: null,
      compileTimeMs: null,
    });
  },
}));
