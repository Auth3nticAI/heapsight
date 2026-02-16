export interface LessonTest {
  id: string;
  description: string;
  expectedOutput: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  order: number;
  xpReward: number;
  tier: "free" | "pro";
  instructions: string;
  starterCode: string;
  solutionCode: string;
  tests: LessonTest[];
  hints: string[];
  concepts: string[];
}

export type LessonStatus = "locked" | "available" | "in_progress" | "completed";

export interface LessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  status: LessonStatus;
  userCode: string | null;
  attempts: number;
  completedAt: string | null;
}

export interface UserProfile {
  id: string;
  tier: "free" | "pro";
  totalXp: number;
  currentStreak: number;
  createdAt: string;
}
