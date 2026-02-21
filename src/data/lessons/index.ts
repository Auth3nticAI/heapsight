import type { Lesson } from "@/types/lesson";

// Old cout-only shooter lessons removed. New raylib lessons live in shooter-index.ts.

export const ALL_SPACE_SHOOTER_LESSONS: Lesson[] = [];

export function getSpaceShooterLessonById(id: string): Lesson | undefined {
  return ALL_SPACE_SHOOTER_LESSONS.find((l) => l.id === id);
}

export function getNextSpaceShooterLesson(currentId: string): Lesson | undefined {
  const idx = ALL_SPACE_SHOOTER_LESSONS.findIndex((l) => l.id === currentId);
  return idx >= 0 && idx < ALL_SPACE_SHOOTER_LESSONS.length - 1
    ? ALL_SPACE_SHOOTER_LESSONS[idx + 1]
    : undefined;
}
