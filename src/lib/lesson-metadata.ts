export type Difficulty = "easy" | "medium" | "hard";

interface LessonMeta {
  icon: string;
  difficulty: Difficulty;
  minutes: number;
}

const META: Record<string, LessonMeta> = {
  "01-hello-world":       { icon: "\uD83D\uDE80", difficulty: "easy",   minutes: 10 },
  "02-variables":         { icon: "\uD83D\uDCCA", difficulty: "easy",   minutes: 12 },
  "03-functions":         { icon: "\uD83D\uDD0B", difficulty: "easy",   minutes: 15 },
  "04-structs":           { icon: "\uD83D\uDCE1", difficulty: "easy",   minutes: 15 },
  "05-pointers":          { icon: "\uD83D\uDD27", difficulty: "medium", minutes: 18 },
  "06-arrays":            { icon: "\uD83D\uDCCA", difficulty: "medium", minutes: 20 },
  "07-loops":             { icon: "\uD83D\uDD01", difficulty: "medium", minutes: 20 },
  "08-conditionals":      { icon: "\uD83E\uDDE0", difficulty: "medium", minutes: 22 },
  "09-references":        { icon: "\uD83D\uDCC1", difficulty: "medium", minutes: 22 },
  "10-dynamic-memory":    { icon: "\uD83C\uDFD7\uFE0F", difficulty: "medium", minutes: 25 },
  "11-strings":           { icon: "\uD83D\uDCDD", difficulty: "medium", minutes: 25 },
  "12-input":             { icon: "\uD83D\uDC42", difficulty: "medium", minutes: 25 },
  "13-enums":             { icon: "\uD83C\uDFF7\uFE0F", difficulty: "medium", minutes: 25 },
  "14-headers":           { icon: "\u2699\uFE0F", difficulty: "hard",   minutes: 30 },
  "15-collision":         { icon: "\uD83E\uDD1D", difficulty: "hard",   minutes: 30 },
  "16-game-loop":         { icon: "\uD83D\uDEE0\uFE0F", difficulty: "hard",   minutes: 30 },
  "17-entity-management": { icon: "\uD83C\uDFAF", difficulty: "hard",   minutes: 35 },
  "18-score-system":      { icon: "\uD83C\uDFDB\uFE0F", difficulty: "hard",   minutes: 35 },
  "19-difficulty":        { icon: "\u26A1",       difficulty: "hard",   minutes: 35 },
  "20-effects":           { icon: "\uD83D\uDDFA\uFE0F", difficulty: "hard",   minutes: 35 },
  "21-save-load":         { icon: "\uD83C\uDFDB\uFE0F", difficulty: "hard",   minutes: 40 },
  "22-memory-leaks":      { icon: "\uD83D\uDD0D", difficulty: "hard",   minutes: 40 },
  "23-smart-pointers":    { icon: "\uD83E\uDDED", difficulty: "hard",   minutes: 40 },
  "24-debugging":         { icon: "\uD83D\uDD00", difficulty: "hard",   minutes: 45 },
  "25-final-polish":      { icon: "\uD83C\uDFC6", difficulty: "hard",   minutes: 60 },
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
