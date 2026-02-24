import type { Lesson, LessonCode } from "@/types/lesson";
import { getShooterLessonById } from "@/data/lessons/shooter-index";
import { getSpaceShooterLessonById } from "@/data/lessons";
import { getRPGLessonById } from "@/data/lessons/rpg-index";
import { getPlatformerLessonById } from "@/data/lessons/platformer-index";
import { getCrawlerLessonById } from "@/data/lessons/crawler-index";
import { getRoguelikeLessonById } from "@/data/lessons/roguelike-index";
import { getAISandboxLessonById } from "@/data/lessons/aisandbox-index";

/**
 * Resolve a LessonCode (or live file map) to a single string for compilation.
 * - string → returned as-is
 * - Record<filename, content> → headers first, then sources, with local
 *   #include directives stripped (the header content is already present).
 */
export function resolveCode(code: LessonCode | Record<string, string>): string {
  if (typeof code === "string") return code;

  const fileNames = new Set(Object.keys(code));

  // Sort: .h/.hpp first, then everything else (preserves insertion order within groups)
  const entries = Object.entries(code).sort(([a], [b]) => {
    const aH = a.endsWith(".h") || a.endsWith(".hpp");
    const bH = b.endsWith(".h") || b.endsWith(".hpp");
    if (aH && !bH) return -1;
    if (!aH && bH) return 1;
    return 0;
  });

  return entries
    .map(([, content]) =>
      content
        .split("\n")
        .filter((line) => {
          const m = line.match(/^\s*#include\s+"([^"]+)"/);
          return !m || !fileNames.has(m[1]);
        })
        .join("\n")
    )
    .join("\n");
}

/**
 * Normalize a LessonCode into a file map.
 * - string → { "main.cpp": code }
 * - Record → returned as-is
 */
export function getCodeFiles(code: LessonCode): Record<string, string> {
  if (typeof code === "string") return { "main.cpp": code };
  return code;
}

/**
 * Check if a LessonCode represents multiple files.
 */
export function isMultiFile(code: LessonCode): code is Record<string, string> {
  return typeof code !== "string";
}

// ---------------------------------------------------------------------------
// Universal lesson lookup (searches all path indices)
// ---------------------------------------------------------------------------

function getLessonById(id: string): Lesson | undefined {
  return (
    getShooterLessonById(id) ??
    getSpaceShooterLessonById(id) ??
    getRPGLessonById(id) ??
    getPlatformerLessonById(id) ??
    getCrawlerLessonById(id) ??
    getRoguelikeLessonById(id) ??
    getAISandboxLessonById(id)
  );
}

// ---------------------------------------------------------------------------
// Hybrid Snapshot/Delta resolution
//
// Delta lessons store only changed files in starterCode/solutionCode and set
// baseLesson to the previous lesson's ID. The resolver walks the chain back
// to the nearest snapshot (a lesson with no baseLesson) and merges files
// forward, with later lessons overriding earlier ones.
// ---------------------------------------------------------------------------

const _resolveCache = new Map<string, Record<string, string>>();

/**
 * Resolve the full starter-code file map for a lesson part.
 * For delta lessons (baseLesson set), merges the base lesson's *solution*
 * files with the current lesson's starter delta.
 * For snapshot lessons (no baseLesson), returns getCodeFiles(starterCode).
 */
export function resolveFullProject(
  lesson: Lesson,
  part: "part1" | "part2",
): Record<string, string> {
  const key = `${lesson.id}:${part}:starter`;
  const cached = _resolveCache.get(key);
  if (cached) return cached;

  const lp = lesson[part];
  const currentFiles = getCodeFiles(lp.starterCode);

  if (!lp.baseLesson) {
    _resolveCache.set(key, currentFiles);
    return currentFiles;
  }

  const baseFiles = _resolveSolution(lp.baseLesson, part);
  const merged = { ...baseFiles, ...currentFiles };
  _resolveCache.set(key, merged);
  return merged;
}

/**
 * Resolve the full solution-code file map for a lesson part.
 * For delta lessons, merges base solution with current solution delta.
 * For snapshot lessons, returns getCodeFiles(solutionCode).
 */
export function resolveFullProjectFromSolution(
  lesson: Lesson,
  part: "part1" | "part2",
): Record<string, string> {
  return _resolveSolution(lesson.id, part, lesson);
}

/** Internal: recursively resolve solution files for a lesson ID. */
function _resolveSolution(
  lessonId: string,
  part: "part1" | "part2",
  knownLesson?: Lesson,
): Record<string, string> {
  const key = `${lessonId}:${part}:solution`;
  const cached = _resolveCache.get(key);
  if (cached) return cached;

  const lesson = knownLesson ?? getLessonById(lessonId);
  if (!lesson) return {};

  const lp = lesson[part];
  const currentFiles = getCodeFiles(lp.solutionCode);

  if (!lp.baseLesson) {
    _resolveCache.set(key, currentFiles);
    return currentFiles;
  }

  const baseFiles = _resolveSolution(lp.baseLesson, part);
  const merged = { ...baseFiles, ...currentFiles };
  _resolveCache.set(key, merged);
  return merged;
}
