import type { GameTemplateInfo } from "@/types/game";

export const GAME_TEMPLATES: GameTemplateInfo[] = [
  {
    id: "space_shooter",
    name: "Space Shooter",
    description: "Classic arcade action. Move, shoot, dodge enemies.",
    difficulty: "beginner",
    difficultyLevel: 1,
    difficultyLabel: "Beginner",
    icon: "rocket",
    category: "game",
  },
  {
    id: "platformer",
    name: "Platformer",
    description: "Jump, run, collect coins. Physics-based movement.",
    difficulty: "intermediate",
    difficultyLevel: 2,
    difficultyLabel: "Intermediate",
    icon: "runner",
    category: "game",
  },
  {
    id: "simple_rpg",
    name: "Simple RPG",
    description: "Turn-based combat, inventory, quests.",
    difficulty: "advanced",
    difficultyLevel: 3,
    difficultyLabel: "Intermediate-Advanced",
    icon: "sword",
    category: "game",
  },
  {
    id: "differential_drive_robot",
    name: "Differential Drive Robot",
    description: "Program a robot: navigation, sensors, path planning.",
    difficulty: "advanced",
    difficultyLevel: 4,
    difficultyLabel: "Advanced",
    icon: "robot",
    category: "robot",
  },
];

export function getTemplateInfo(id: string): GameTemplateInfo | undefined {
  return GAME_TEMPLATES.find((t) => t.id === id);
}

export function getPathDifficulty(id: string): { level: number; label: string } {
  const t = GAME_TEMPLATES.find((t) => t.id === id);
  return t ? { level: t.difficultyLevel, label: t.difficultyLabel } : { level: 1, label: "Beginner" };
}
