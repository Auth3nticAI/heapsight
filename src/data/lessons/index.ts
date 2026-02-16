import type { Lesson } from "@/types/lesson";
import { lesson01 } from "./lesson-01-hello-world";
import { lesson02 } from "./lesson-02-variables";
import { lesson03 } from "./lesson-03-functions";
import { lesson04 } from "./lesson-04-structs";
import { lesson05 } from "./lesson-05-pointers";

export const ALL_LESSONS: Lesson[] = [
  lesson01,
  lesson02,
  lesson03,
  lesson04,
  lesson05,
].sort((a, b) => a.order - b.order);

export function getLessonById(id: string): Lesson | undefined {
  return ALL_LESSONS.find((l) => l.id === id);
}

export function getNextLesson(currentId: string): Lesson | undefined {
  const idx = ALL_LESSONS.findIndex((l) => l.id === currentId);
  return idx >= 0 && idx < ALL_LESSONS.length - 1
    ? ALL_LESSONS[idx + 1]
    : undefined;
}
