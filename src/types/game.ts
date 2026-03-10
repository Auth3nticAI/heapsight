import type { LessonTest, LessonCode } from "./lesson";

export type GameTemplate =
  | "space_shooter"
  | "platformer"
  | "simple_rpg"
  | "dungeon_crawler"
  | "roguelike"
  | "aisandbox";

export type TemplateCategory = "game" | "crawler";

export interface GameTemplateInfo {
  id: GameTemplate;
  name: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
  difficultyLabel: string;
  icon: string;
  category: TemplateCategory;
}

export interface GameLessonVariant {
  lessonId: string;
  instructions?: string;
  starterCode: LessonCode;
  solutionCode: LessonCode;
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
