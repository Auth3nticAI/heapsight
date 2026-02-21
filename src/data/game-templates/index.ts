import type { GameTemplate, GameLessonVariant } from "@/types/game";
import { spaceShooterVariants } from "./space-shooter";
import { platformerVariants } from "./platformer";
import { simpleRpgVariants } from "./simple-rpg";
import { dungeonCrawlerVariants } from "./dungeon-crawler";

const allVariants: Record<GameTemplate, Record<string, GameLessonVariant>> = {
  space_shooter: spaceShooterVariants,
  platformer: platformerVariants,
  simple_rpg: simpleRpgVariants,
  dungeon_crawler: dungeonCrawlerVariants,
};

export function getGameVariant(
  lessonId: string,
  template: GameTemplate
): GameLessonVariant | null {
  return allVariants[template]?.[lessonId] || null;
}
