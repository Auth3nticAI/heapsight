export type Difficulty = "easy" | "medium" | "hard";

interface LessonMeta {
  icon: string;
  difficulty: Difficulty;
  minutes: number;
}

const META: Record<string, LessonMeta> = {
  "01-boot-the-system":   { icon: "\uD83D\uDE80", difficulty: "easy",   minutes: 8 },
  "02-player-stats":      { icon: "\uD83D\uDCCA", difficulty: "easy",   minutes: 10 },
  "03-bullet-math":       { icon: "\uD83D\uDD0B", difficulty: "easy",   minutes: 10 },
  "04-hit-or-miss":       { icon: "\uD83C\uDFAF", difficulty: "easy",   minutes: 12 },
  "05-damage-function":   { icon: "\uD83D\uDD27", difficulty: "easy",   minutes: 12 },
  "06-soa-enemies":       { icon: "\uD83D\uDCCA", difficulty: "medium", minutes: 14 },
  "07-spawn-wave-loop":   { icon: "\uD83D\uDD01", difficulty: "medium", minutes: 13 },
  "08-combat-rules":      { icon: "\uD83E\uDDE0", difficulty: "medium", minutes: 14 },
  "09-component-mutation": { icon: "\uD83D\uDCC1", difficulty: "medium", minutes: 12 },
  "10-entity-pool-v0":    { icon: "\uD83C\uDFD7\uFE0F", difficulty: "medium", minutes: 17 },
  "11-component-structs":          { icon: "\uD83D\uDCE6", difficulty: "medium", minutes: 20 },
  "12-extract-components-header":  { icon: "\uD83D\uDCC1", difficulty: "medium", minutes: 20 },
  "13-inheritance-trap":           { icon: "\u26A0\uFE0F", difficulty: "medium", minutes: 22 },
  "14-dynamic-arrays":             { icon: "\uD83D\uDCC8", difficulty: "medium", minutes: 22 },
  "15-multi-system-tick":          { icon: "\u2699\uFE0F", difficulty: "medium", minutes: 25 },
  "16-entity-manager-class":       { icon: "\uD83C\uDFD7\uFE0F", difficulty: "medium", minutes: 25 },
  "17-ids-and-free-list":          { icon: "\uD83D\uDD04", difficulty: "hard",   minutes: 28 },
  "18-save-snapshot-v0":           { icon: "\uD83D\uDCBE", difficulty: "hard",   minutes: 25 },
  "19-game-states-v0":             { icon: "\uD83C\uDFAE", difficulty: "hard",   minutes: 28 },
  "20-spatial-buckets-v0":         { icon: "\uD83D\uDDFA\uFE0F", difficulty: "hard",   minutes: 30 },
  "21-checkpoint-save-load":       { icon: "\uD83D\uDCBE", difficulty: "hard",   minutes: 30 },
  "22-error-handling-v0":          { icon: "\uD83D\uDEE1\uFE0F", difficulty: "hard",   minutes: 25 },
  "23-thread-awareness-v0":        { icon: "\uD83E\uDDF5", difficulty: "hard",   minutes: 30 },
  "24-lambdas-for-queries":        { icon: "\uD83D\uDD0D", difficulty: "hard",   minutes: 28 },
  "25-milestone-playable-loop":    { icon: "\uD83C\uDFC6", difficulty: "hard",   minutes: 60 },
};

const DEFAULT: LessonMeta = { icon: "\uD83D\uDCDD", difficulty: "medium", minutes: 20 };

export function getLessonMeta(lessonId: string): LessonMeta {
  return META[lessonId] || DEFAULT;
}

export function getDifficultyStars(d: Difficulty): number {
  return d === "easy" ? 1 : d === "medium" ? 2 : 3;
}

// ─── Level System (1–50, exponential curve) ─────────────────────────────────

const LEVEL_TITLES: [number, string][] = [
  [1, "Novice"],
  [3, "Apprentice"],
  [6, "Practitioner"],
  [10, "Adept"],
  [15, "Expert"],
  [20, "Master"],
  [25, "Grandmaster"],
  [30, "Legend"],
  [35, "Mythic"],
  [40, "Divine"],
  [45, "Transcendent"],
  [50, "Immortal"],
];

function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(100 * Math.pow(1.12, level - 2));
}

export function getLevelInfo(xp: number) {
  let level = 1;
  let remaining = xp;

  while (level < 50) {
    const needed = xpForLevel(level + 1);
    if (remaining < needed) break;
    remaining -= needed;
    level++;
  }

  const xpForNext = level < 50 ? xpForLevel(level + 1) : 1;
  const xpInLevel = level < 50 ? remaining : xpForNext;
  const progress = Math.min((xpInLevel / xpForNext) * 100, 100);

  let title = "Novice";
  for (const [lvl, t] of LEVEL_TITLES) {
    if (level >= lvl) title = t;
  }

  return { level, title, progress, xpInLevel, xpForNext };
}

export function getNextTitle(currentLevel: number): string {
  for (const [lvl, t] of LEVEL_TITLES) {
    if (lvl > currentLevel) return t;
  }
  return "Immortal";
}
