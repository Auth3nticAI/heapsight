import type { GameTemplate, GameLessonVariant } from "@/types/game";
import { spaceShooterVariants } from "./space-shooter";
import { platformerVariants } from "./platformer";
import { simpleRpgVariants } from "./simple-rpg";
import { differentialDriveRobotVariants } from "./differential-drive-robot";

const allVariants: Record<GameTemplate, Record<string, GameLessonVariant>> = {
  space_shooter: spaceShooterVariants,
  platformer: platformerVariants,
  simple_rpg: simpleRpgVariants,
  differential_drive_robot: differentialDriveRobotVariants,
};

export function getGameVariant(
  lessonId: string,
  template: GameTemplate
): GameLessonVariant | null {
  return allVariants[template]?.[lessonId] || null;
}
