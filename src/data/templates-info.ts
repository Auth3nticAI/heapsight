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
    id: "dungeon_crawler",
    name: "Dungeon Crawler",
    description: "Explore 3D dungeons: cameras, lighting, procedural levels.",
    difficulty: "advanced",
    difficultyLevel: 4,
    difficultyLabel: "Advanced",
    icon: "castle",
    category: "crawler",
  },
  {
    id: "roguelike",
    name: "Roguelike",
    description: "Procedural generation, BSP dungeons, loot tables, permadeath.",
    difficulty: "advanced",
    difficultyLevel: 3,
    difficultyLabel: "Advanced",
    icon: "skull",
    category: "game",
  },
  {
    id: "aisandbox",
    name: "AI Sandbox",
    description: "Autonomous agents, flocking, behavior trees, genetic evolution.",
    difficulty: "advanced",
    difficultyLevel: 4,
    difficultyLabel: "Expert",
    icon: "brain",
    category: "game",
  },
];

export function getTemplateInfo(id: string): GameTemplateInfo | undefined {
  return GAME_TEMPLATES.find((t) => t.id === id);
}

export function getPathDifficulty(id: string): { level: number; label: string } {
  const t = GAME_TEMPLATES.find((t) => t.id === id);
  return t ? { level: t.difficultyLevel, label: t.difficultyLabel } : { level: 1, label: "Beginner" };
}
