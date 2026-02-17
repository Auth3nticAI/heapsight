import type { GameLessonVariant } from "@/types/game";
import { lesson01Platformer } from "./lesson-01-game";
import { lesson02Platformer } from "./lesson-02-game";
import { lesson03Platformer } from "./lesson-03-game";
import { lesson04Platformer } from "./lesson-04-game";
import { lesson05Platformer } from "./lesson-05-game";
import { lesson06Platformer } from "./lesson-06-game";
import { lesson07Platformer } from "./lesson-07-game";
import { lesson08Platformer } from "./lesson-08-game";
import { lesson09Platformer } from "./lesson-09-game";
import { lesson10Platformer } from "./lesson-10-game";
import { lesson11Platformer } from "./lesson-11-game";
import { lesson12Platformer } from "./lesson-12-game";
import { lesson13Platformer } from "./lesson-13-game";
import { lesson14Platformer } from "./lesson-14-game";
import { lesson15Platformer } from "./lesson-15-game";
import { lesson16Platformer } from "./lesson-16-game";
import { lesson17Platformer } from "./lesson-17-game";
import { lesson18Platformer } from "./lesson-18-game";
import { lesson19Platformer } from "./lesson-19-game";
import { lesson20Platformer } from "./lesson-20-game";
import { lesson21Platformer } from "./lesson-21-game";
import { lesson22Platformer } from "./lesson-22-game";
import { lesson23Platformer } from "./lesson-23-game";
import { lesson24Platformer } from "./lesson-24-game";
import { lesson25Platformer } from "./lesson-25-game";

export const platformerVariants: Record<string, GameLessonVariant> = {
  "01-hello-world": lesson01Platformer,
  "02-variables": lesson02Platformer,
  "03-functions": lesson03Platformer,
  "04-structs": lesson04Platformer,
  "05-pointers": lesson05Platformer,
  "06-arrays": lesson06Platformer,
  "07-loops": lesson07Platformer,
  "08-conditionals": lesson08Platformer,
  "09-references": lesson09Platformer,
  "10-dynamic-memory": lesson10Platformer,
  "11-strings": lesson11Platformer,
  "12-input": lesson12Platformer,
  "13-enums": lesson13Platformer,
  "14-headers": lesson14Platformer,
  "15-collision": lesson15Platformer,
  "16-game-loop": lesson16Platformer,
  "17-entity-management": lesson17Platformer,
  "18-score-system": lesson18Platformer,
  "19-difficulty": lesson19Platformer,
  "20-effects": lesson20Platformer,
  "21-save-load": lesson21Platformer,
  "22-memory-leaks": lesson22Platformer,
  "23-smart-pointers": lesson23Platformer,
  "24-debugging": lesson24Platformer,
  "25-final-polish": lesson25Platformer,
};
