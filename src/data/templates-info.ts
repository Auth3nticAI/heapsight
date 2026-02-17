import type { GameTemplateInfo } from "@/types/game";

export const GAME_TEMPLATES: GameTemplateInfo[] = [
  {
    id: "space_shooter",
    name: "Space Shooter",
    description: "Classic arcade action. Move, shoot, dodge enemies.",
    difficulty: "beginner",
    icon: "rocket",
    category: "game",
  },
  {
    id: "platformer",
    name: "Platformer",
    description: "Jump, run, collect coins. Physics-based movement.",
    difficulty: "intermediate",
    icon: "runner",
    category: "game",
  },
  {
    id: "simple_rpg",
    name: "Simple RPG",
    description: "Turn-based combat, inventory, quests.",
    difficulty: "advanced",
    icon: "sword",
    category: "game",
  },
  {
    id: "differential_drive_robot",
    name: "Differential Drive Robot",
    description: "Program a robot: navigation, sensors, path planning.",
    difficulty: "intermediate",
    icon: "robot",
    category: "robot",
  },
];

export function getTemplateInfo(id: string): GameTemplateInfo | undefined {
  return GAME_TEMPLATES.find((t) => t.id === id);
}
