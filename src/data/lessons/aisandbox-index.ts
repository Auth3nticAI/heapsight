import type { Lesson } from "@/types/lesson";
import { lessonAISandbox1 } from "./aisandbox/lesson-aisandbox-01-spawn-population";
import { lessonAISandbox2 } from "./aisandbox/lesson-aisandbox-02-screen-wrapping";
import { lessonAISandbox3 } from "./aisandbox/lesson-aisandbox-03-seek-behavior";
import { lessonAISandbox4 } from "./aisandbox/lesson-aisandbox-04-flocking-v0";
import { lessonAISandbox5 } from "./aisandbox/lesson-aisandbox-05-wander-behavior";
import { lessonAISandbox6 } from "./aisandbox/lesson-aisandbox-06-hunger-system";
import { lessonAISandbox7 } from "./aisandbox/lesson-aisandbox-07-starvation";
import { lessonAISandbox8 } from "./aisandbox/lesson-aisandbox-08-food-respawn";
import { lessonAISandbox9 } from "./aisandbox/lesson-aisandbox-09-flee-behavior";
import { lessonAISandbox10 } from "./aisandbox/lesson-aisandbox-10-milestone-micro-ecosystem";
import { lessonAISandbox11 } from "./aisandbox/lesson-aisandbox-11-god-object-refactor";
import { lessonAISandbox12 } from "./aisandbox/lesson-aisandbox-12-agent-types";
import { lessonAISandbox13 } from "./aisandbox/lesson-aisandbox-13-agent-ids";
import { lessonAISandbox14 } from "./aisandbox/lesson-aisandbox-14-soa-formalized";
import { lessonAISandbox15 } from "./aisandbox/lesson-aisandbox-15-milestone-clean-architecture";

export const ALL_AISANDBOX_LESSONS: Lesson[] = [
  lessonAISandbox1,
  lessonAISandbox2,
  lessonAISandbox3,
  lessonAISandbox4,
  lessonAISandbox5,
  lessonAISandbox6,
  lessonAISandbox7,
  lessonAISandbox8,
  lessonAISandbox9,
  lessonAISandbox10,
  lessonAISandbox11,
  lessonAISandbox12,
  lessonAISandbox13,
  lessonAISandbox14,
  lessonAISandbox15,
].sort((a, b) => a.order - b.order);

export function getAISandboxLessonById(id: string): Lesson | undefined {
  return ALL_AISANDBOX_LESSONS.find((l) => l.id === id);
}

export function getNextAISandboxLesson(currentId: string): Lesson | undefined {
  const idx = ALL_AISANDBOX_LESSONS.findIndex((l) => l.id === currentId);
  return idx >= 0 && idx < ALL_AISANDBOX_LESSONS.length - 1
    ? ALL_AISANDBOX_LESSONS[idx + 1]
    : undefined;
}
