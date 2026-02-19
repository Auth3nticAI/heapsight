import type { LessonTest } from "./lesson";

export type GameTemplate =
  | "space_shooter"
  | "platformer"
  | "simple_rpg"
  | "differential_drive_robot";

export type TemplateCategory = "game" | "robot";

export interface GameTemplateInfo {
  id: GameTemplate;
  name: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  difficultyLevel: 1 | 2 | 3 | 4;
  difficultyLabel: string;
  icon: string;
  category: TemplateCategory;
}

export interface GameLessonVariant {
  lessonId: string;
  instructions?: string;
  starterCode: string;
  solutionCode: string;
  tests: LessonTest[];
  hints: string[];
  accumulatedCode: string;
}

export interface GameFrame {
  entities: GameEntity[];
  score: number;
  message: string;
  gameOver: boolean;
}

export interface GameEntity {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  health?: number;
}
