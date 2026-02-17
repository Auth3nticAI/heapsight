import type { Lesson } from "@/types/lesson";
import { lesson01 } from "./lesson-01-hello-world";
import { lesson02 } from "./lesson-02-variables";
import { lesson03 } from "./lesson-03-functions";
import { lesson04 } from "./lesson-04-structs";
import { lesson05 } from "./lesson-05-pointers";
import { lesson06 } from "./lesson-06-arrays";
import { lesson07 } from "./lesson-07-loops";
import { lesson08 } from "./lesson-08-conditionals";
import { lesson09 } from "./lesson-09-references";
import { lesson10 } from "./lesson-10-dynamic-memory";
import { lesson11 } from "./lesson-11-strings";
import { lesson12 } from "./lesson-12-input";
import { lesson13 } from "./lesson-13-enums";
import { lesson14 } from "./lesson-14-headers";
import { lesson15 } from "./lesson-15-collision";
import { lesson16 } from "./lesson-16-game-loop";
import { lesson17 } from "./lesson-17-entity-management";
import { lesson18 } from "./lesson-18-score-system";
import { lesson19 } from "./lesson-19-difficulty";
import { lesson20 } from "./lesson-20-effects";
import { lesson21 } from "./lesson-21-save-load";
import { lesson22 } from "./lesson-22-memory-leaks";
import { lesson23 } from "./lesson-23-smart-pointers";
import { lesson24 } from "./lesson-24-debugging";
import { lesson25 } from "./lesson-25-final-polish";

export const ALL_LESSONS: Lesson[] = [
  lesson01, lesson02, lesson03, lesson04, lesson05,
  lesson06, lesson07, lesson08, lesson09, lesson10,
  lesson11, lesson12, lesson13, lesson14, lesson15,
  lesson16, lesson17, lesson18, lesson19, lesson20,
  lesson21, lesson22, lesson23, lesson24, lesson25,
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
