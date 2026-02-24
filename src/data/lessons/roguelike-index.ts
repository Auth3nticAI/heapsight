import type { Lesson } from "@/types/lesson";

export const ALL_ROGUELIKE_LESSONS: Lesson[] = [];

export function getRoguelikeLessonById(id: string): Lesson | undefined {
  return ALL_ROGUELIKE_LESSONS.find((l) => l.id === id);
}

export function getNextRoguelikeLesson(currentId: string): Lesson | undefined {
  const idx = ALL_ROGUELIKE_LESSONS.findIndex((l) => l.id === currentId);
  return idx >= 0 && idx < ALL_ROGUELIKE_LESSONS.length - 1
    ? ALL_ROGUELIKE_LESSONS[idx + 1]
    : undefined;
}
