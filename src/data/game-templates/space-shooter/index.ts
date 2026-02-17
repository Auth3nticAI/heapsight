import type { GameLessonVariant } from "@/types/game";
import { lesson01SpaceShooter } from "./lesson-01-game";
import { lesson02SpaceShooter } from "./lesson-02-game";
import { lesson03SpaceShooter } from "./lesson-03-game";
import { lesson04SpaceShooter } from "./lesson-04-game";
import { lesson05SpaceShooter } from "./lesson-05-game";
import { lesson06SpaceShooter } from "./lesson-06-game";
import { lesson07SpaceShooter } from "./lesson-07-game";
import { lesson08SpaceShooter } from "./lesson-08-game";
import { lesson09SpaceShooter } from "./lesson-09-game";
import { lesson10SpaceShooter } from "./lesson-10-game";
import { lesson11SpaceShooter } from "./lesson-11-game";
import { lesson12SpaceShooter } from "./lesson-12-game";
import { lesson13SpaceShooter } from "./lesson-13-game";
import { lesson14SpaceShooter } from "./lesson-14-game";
import { lesson15SpaceShooter } from "./lesson-15-game";
import { lesson16SpaceShooter } from "./lesson-16-game";
import { lesson17SpaceShooter } from "./lesson-17-game";
import { lesson18SpaceShooter } from "./lesson-18-game";
import { lesson19SpaceShooter } from "./lesson-19-game";
import { lesson20SpaceShooter } from "./lesson-20-game";
import { lesson21SpaceShooter } from "./lesson-21-game";
import { lesson22SpaceShooter } from "./lesson-22-game";
import { lesson23SpaceShooter } from "./lesson-23-game";
import { lesson24SpaceShooter } from "./lesson-24-game";
import { lesson25SpaceShooter } from "./lesson-25-game";

export const spaceShooterVariants: Record<string, GameLessonVariant> = {
  "01-hello-world": lesson01SpaceShooter,
  "02-variables": lesson02SpaceShooter,
  "03-functions": lesson03SpaceShooter,
  "04-structs": lesson04SpaceShooter,
  "05-pointers": lesson05SpaceShooter,
  "06-arrays": lesson06SpaceShooter,
  "07-loops": lesson07SpaceShooter,
  "08-conditionals": lesson08SpaceShooter,
  "09-references": lesson09SpaceShooter,
  "10-dynamic-memory": lesson10SpaceShooter,
  "11-strings": lesson11SpaceShooter,
  "12-input": lesson12SpaceShooter,
  "13-enums": lesson13SpaceShooter,
  "14-headers": lesson14SpaceShooter,
  "15-collision": lesson15SpaceShooter,
  "16-game-loop": lesson16SpaceShooter,
  "17-entity-management": lesson17SpaceShooter,
  "18-score-system": lesson18SpaceShooter,
  "19-difficulty": lesson19SpaceShooter,
  "20-effects": lesson20SpaceShooter,
  "21-save-load": lesson21SpaceShooter,
  "22-memory-leaks": lesson22SpaceShooter,
  "23-smart-pointers": lesson23SpaceShooter,
  "24-debugging": lesson24SpaceShooter,
  "25-final-polish": lesson25SpaceShooter,
};
