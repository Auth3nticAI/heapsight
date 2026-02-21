import type { Lesson } from "@/types/lesson";
import { lessonCrawler1 } from "./lesson-crawler-01-boot-dungeon-3d";
import { lessonCrawler2 } from "./lesson-crawler-02-look-around";
import { lessonCrawler3 } from "./lesson-crawler-03-wasd-walk";
import { lessonCrawler4 } from "./lesson-crawler-04-wall-collision";
import { lessonCrawler5 } from "./lesson-crawler-05-multi-room-dungeon";
import { lessonCrawler6 } from "./lesson-crawler-06-floor-ceiling";
import { lessonCrawler7 } from "./lesson-crawler-07-minimap-overlay";
import { lessonCrawler8 } from "./lesson-crawler-08-door-mechanics";
import { lessonCrawler9 } from "./lesson-crawler-09-items-on-ground";
import { lessonCrawler10 } from "./lesson-crawler-10-milestone-explorable-dungeon";
import { lessonCrawler11 } from "./lesson-crawler-11-ray-wall-intersection";
import { lessonCrawler12 } from "./lesson-crawler-12-interaction-system";
import { lessonCrawler13 } from "./lesson-crawler-13-push-blocks";
import { lessonCrawler14 } from "./lesson-crawler-14-pressure-plates";
import { lessonCrawler15 } from "./lesson-crawler-15-milestone-puzzle-room";

export const ALL_CRAWLER_LESSONS: Lesson[] = [
  lessonCrawler1,
  lessonCrawler2,
  lessonCrawler3,
  lessonCrawler4,
  lessonCrawler5,
  lessonCrawler6,
  lessonCrawler7,
  lessonCrawler8,
  lessonCrawler9,
  lessonCrawler10,
  lessonCrawler11,
  lessonCrawler12,
  lessonCrawler13,
  lessonCrawler14,
  lessonCrawler15,
].sort((a, b) => a.order - b.order);

export function getCrawlerLessonById(id: string): Lesson | undefined {
  return ALL_CRAWLER_LESSONS.find((l) => l.id === id);
}

export function getNextCrawlerLesson(currentId: string): Lesson | undefined {
  const idx = ALL_CRAWLER_LESSONS.findIndex((l) => l.id === currentId);
  return idx >= 0 && idx < ALL_CRAWLER_LESSONS.length - 1
    ? ALL_CRAWLER_LESSONS[idx + 1]
    : undefined;
}
