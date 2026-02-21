/**
 * Achievement Badge System
 * 15 achievements across 3 categories: learning, streak, mastery
 */

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "learning" | "streak" | "mastery";
  rarity: "common" | "rare" | "epic" | "legendary";
  xp_reward: number;
  unlock_criteria: {
    type:
      | "lessons_completed"
      | "streak_days"
      | "total_xp"
      | "path_completed"
      | "daily_goals";
    threshold: number;
    path?: string;
  };
}

export const ACHIEVEMENTS: Achievement[] = [
  // ─── Learning ────────────────────────────────────────────
  {
    id: "first_lesson",
    title: "Hello, World!",
    description: "Complete your first lesson",
    icon: "\uD83C\uDFAF",
    category: "learning",
    rarity: "common",
    xp_reward: 25,
    unlock_criteria: { type: "lessons_completed", threshold: 1 },
  },
  {
    id: "five_lessons",
    title: "Quick Learner",
    description: "Complete 5 lessons",
    icon: "\uD83D\uDCDA",
    category: "learning",
    rarity: "common",
    xp_reward: 50,
    unlock_criteria: { type: "lessons_completed", threshold: 5 },
  },
  {
    id: "ten_lessons",
    title: "Dedicated Student",
    description: "Complete 10 lessons",
    icon: "\uD83C\uDF93",
    category: "learning",
    rarity: "rare",
    xp_reward: 100,
    unlock_criteria: { type: "lessons_completed", threshold: 10 },
  },
  {
    id: "first_path_complete",
    title: "Path Completer",
    description: "Complete all 25 lessons in one path",
    icon: "\uD83C\uDFC6",
    category: "learning",
    rarity: "epic",
    xp_reward: 500,
    unlock_criteria: { type: "lessons_completed", threshold: 25 },
  },
  {
    id: "daily_devotee",
    title: "Daily Devotee",
    description: "Complete 30 daily goals",
    icon: "\uD83C\uDFAF",
    category: "learning",
    rarity: "epic",
    xp_reward: 750,
    unlock_criteria: { type: "daily_goals", threshold: 30 },
  },

  // ─── Streak ──────────────────────────────────────────────
  {
    id: "week_warrior",
    title: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: "\uD83D\uDD25",
    category: "streak",
    rarity: "rare",
    xp_reward: 150,
    unlock_criteria: { type: "streak_days", threshold: 7 },
  },
  {
    id: "fortnight_fighter",
    title: "Fortnight Fighter",
    description: "Maintain a 14-day streak",
    icon: "\u26A1",
    category: "streak",
    rarity: "rare",
    xp_reward: 300,
    unlock_criteria: { type: "streak_days", threshold: 14 },
  },
  {
    id: "month_master",
    title: "Month Master",
    description: "Maintain a 30-day streak",
    icon: "\uD83D\uDC8E",
    category: "streak",
    rarity: "epic",
    xp_reward: 750,
    unlock_criteria: { type: "streak_days", threshold: 30 },
  },
  {
    id: "centurion",
    title: "Centurion",
    description: "Maintain a 100-day streak",
    icon: "\uD83D\uDC51",
    category: "streak",
    rarity: "legendary",
    xp_reward: 2500,
    unlock_criteria: { type: "streak_days", threshold: 100 },
  },

  // ─── Mastery ─────────────────────────────────────────────
  {
    id: "ecs_master",
    title: "ECS Architect",
    description: "Complete Space Shooter path",
    icon: "\uD83D\uDE80",
    category: "mastery",
    rarity: "epic",
    xp_reward: 500,
    unlock_criteria: { type: "path_completed", threshold: 1, path: "space_shooter" },
  },
  {
    id: "fsm_master",
    title: "State Machine Expert",
    description: "Complete Platformer path",
    icon: "\uD83C\uDFC3",
    category: "mastery",
    rarity: "epic",
    xp_reward: 500,
    unlock_criteria: { type: "path_completed", threshold: 1, path: "platformer" },
  },
  {
    id: "oop_master",
    title: "Data-Driven Designer",
    description: "Complete Simple RPG path",
    icon: "\u2694\uFE0F",
    category: "mastery",
    rarity: "epic",
    xp_reward: 500,
    unlock_criteria: { type: "path_completed", threshold: 1, path: "simple_rpg" },
  },
  {
    id: "crawler_master",
    title: "Dungeon Architect",
    description: "Complete Dungeon Crawler path",
    icon: "\uD83C\uDFF0",
    category: "mastery",
    rarity: "epic",
    xp_reward: 500,
    unlock_criteria: {
      type: "path_completed",
      threshold: 1,
      path: "dungeon_crawler",
    },
  },
  {
    id: "quadruple_threat",
    title: "Paradigm Master",
    description: "Complete all 4 paths",
    icon: "\uD83C\uDF1F",
    category: "mastery",
    rarity: "legendary",
    xp_reward: 5000,
    unlock_criteria: { type: "path_completed", threshold: 4 },
  },
  {
    id: "xp_legend",
    title: "XP Legend",
    description: "Earn 10,000 total XP",
    icon: "\uD83D\uDCAB",
    category: "mastery",
    rarity: "legendary",
    xp_reward: 1000,
    unlock_criteria: { type: "total_xp", threshold: 10000 },
  },
];

export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case "common":
      return "text-gray-400 border-gray-600";
    case "rare":
      return "text-blue-400 border-blue-600";
    case "epic":
      return "text-purple-400 border-purple-600";
    case "legendary":
      return "text-yellow-400 border-yellow-600";
    default:
      return "text-gray-400 border-gray-600";
  }
}

export function getRarityGradient(rarity: string): string {
  switch (rarity) {
    case "common":
      return "from-gray-600/20 to-gray-700/20";
    case "rare":
      return "from-blue-600/20 to-blue-700/20";
    case "epic":
      return "from-purple-600/20 to-purple-700/20";
    case "legendary":
      return "from-yellow-600/20 to-yellow-700/20";
    default:
      return "from-gray-600/20 to-gray-700/20";
  }
}

export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
