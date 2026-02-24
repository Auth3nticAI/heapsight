export interface LessonTest {
  id: string;
  description: string;
  expectedOutput: string;
  isPattern?: boolean;
}

export interface LessonPart {
  title: string;
  type: "concept" | "game_builder";
  instructions: string;
  starterCode: string;
  solutionCode: string;
  tests: LessonTest[];
  hints: string[];
  estimatedMinutes: number;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  order: number;
  xpReward: number;
  tier: "free" | "pro";
  concepts: string[];
  part1: LessonPart;
  part2: LessonPart;
  customizationPrompt?: string;
}

export type LessonStatus = "locked" | "available" | "in_progress" | "completed";
export type PartStatus = "not_started" | "in_progress" | "completed";

export interface LessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  status: LessonStatus;
  part1Status: PartStatus;
  part2Status: PartStatus;
  part1UserCode: string | null;
  part2UserCode: string | null;
  attempts: number;
  completedAt: string | null;
}

export interface UserProfile {
  id: string;
  tier: "free" | "pro";
  totalXp: number;
  currentStreak: number;
  selectedGameTemplate: string | null;
  createdAt: string;
}
