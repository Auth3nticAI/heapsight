import { create } from "zustand";
import type { TestResult } from "@/lib/cpp-runner";

interface LessonStore {
  currentCode: string;
  output: string;
  errors: string[];
  testResults: TestResult[];
  isRunning: boolean;
  activeHint: number;

  setCode: (code: string) => void;
  setOutput: (output: string) => void;
  setErrors: (errors: string[]) => void;
  setTestResults: (results: TestResult[]) => void;
  setIsRunning: (running: boolean) => void;
  showNextHint: () => void;
  resetLesson: (starterCode: string) => void;
}

export const useLessonStore = create<LessonStore>((set) => ({
  currentCode: "",
  output: "",
  errors: [],
  testResults: [],
  isRunning: false,
  activeHint: -1,

  setCode: (code) => set({ currentCode: code }),
  setOutput: (output) => set({ output }),
  setErrors: (errors) => set({ errors }),
  setTestResults: (results) => set({ testResults: results }),
  setIsRunning: (running) => set({ isRunning: running }),
  showNextHint: () => set((s) => ({ activeHint: s.activeHint + 1 })),
  resetLesson: (starterCode) =>
    set({
      currentCode: starterCode,
      output: "",
      errors: [],
      testResults: [],
      isRunning: false,
      activeHint: -1,
    }),
}));
