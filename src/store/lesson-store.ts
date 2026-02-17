import { create } from "zustand";
import type { TestResult } from "@/lib/cpp-runner";
import type { GameFrame } from "@/types/game";
import type { RobotFrame } from "@/types/robot";

interface LessonStore {
  currentPart: 1 | 2;
  part1Completed: boolean;
  part2Completed: boolean;

  part1Code: string;
  part2Code: string;
  gameFrame: GameFrame | null;
  robotFrame: RobotFrame | null;
  robotFrames: RobotFrame[];

  output: string;
  errors: string[];
  testResults: TestResult[];
  isRunning: boolean;
  activeHint: number;

  setCurrentPart: (part: 1 | 2) => void;
  setPart1Code: (code: string) => void;
  setPart2Code: (code: string) => void;
  setGameFrame: (frame: GameFrame | null) => void;
  setRobotFrame: (frame: RobotFrame | null) => void;
  setRobotFrames: (frames: RobotFrame[]) => void;
  setOutput: (output: string) => void;
  setErrors: (errors: string[]) => void;
  setTestResults: (results: TestResult[]) => void;
  setIsRunning: (running: boolean) => void;
  showNextHint: () => void;
  markPart1Complete: () => void;
  markPart2Complete: () => void;
  resetLesson: (part1Starter: string, part2Starter: string) => void;
}

export const useLessonStore = create<LessonStore>((set) => ({
  currentPart: 1,
  part1Completed: false,
  part2Completed: false,

  part1Code: "",
  part2Code: "",
  gameFrame: null,
  robotFrame: null,
  robotFrames: [],

  output: "",
  errors: [],
  testResults: [],
  isRunning: false,
  activeHint: -1,

  setCurrentPart: (part) =>
    set({ currentPart: part, output: "", errors: [], testResults: [], activeHint: -1 }),
  setPart1Code: (code) => set({ part1Code: code }),
  setPart2Code: (code) => set({ part2Code: code }),
  setGameFrame: (frame) => set({ gameFrame: frame }),
  setRobotFrame: (frame) => set({ robotFrame: frame }),
  setRobotFrames: (frames) => set({ robotFrames: frames }),
  setOutput: (output) => set({ output }),
  setErrors: (errors) => set({ errors }),
  setTestResults: (results) => set({ testResults: results }),
  setIsRunning: (running) => set({ isRunning: running }),
  showNextHint: () => set((s) => ({ activeHint: s.activeHint + 1 })),
  markPart1Complete: () => set({ part1Completed: true }),
  markPart2Complete: () => set({ part2Completed: true }),
  resetLesson: (part1Starter, part2Starter) =>
    set({
      currentPart: 1,
      part1Completed: false,
      part2Completed: false,
      part1Code: part1Starter,
      part2Code: part2Starter,
      gameFrame: null,
      robotFrame: null,
      robotFrames: [],
      output: "",
      errors: [],
      testResults: [],
      isRunning: false,
      activeHint: -1,
    }),
}));
