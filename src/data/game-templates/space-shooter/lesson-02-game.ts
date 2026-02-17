import type { GameLessonVariant } from "@/types/game";

export const lesson02SpaceShooter: GameLessonVariant = {
  lessonId: "02-variables",

  starterCode: `#include <iostream>
using namespace std;

int main() {
    // Declare variables for a spaceship:
    // shipX = 180, shipY = 220, shipSize = 24, shipHealth = 100
    // Declare variables for an asteroid:
    // astX = 300, astY = 60, astSize = 18, astHealth = 40
    // Use these variables to output ENTITY lines, a SCORE, and a GAME_MESSAGE

    return 0;
}`,

  solutionCode: `#include <iostream>
using namespace std;

int main() {
    int shipX = 180;
    int shipY = 220;
    int shipSize = 24;
    int shipHealth = 100;

    int astX = 300;
    int astY = 60;
    int astSize = 18;
    int astHealth = 40;

    cout << "ENTITY|ship|player|" << shipX << "|" << shipY << "|"
         << shipSize << "|" << shipSize << "|" << shipHealth << endl;
    cout << "ENTITY|asteroid1|enemy|" << astX << "|" << astY << "|"
         << astSize << "|" << astSize << "|" << astHealth << endl;
    cout << "SCORE|0" << endl;
    cout << "GAME_MESSAGE|Asteroid field detected!" << endl;

    return 0;
}`,

  tests: [
    {
      id: "entity-ship",
      description: "Output ship entity with variables at (180,220) size 24x24 health 100",
      expectedOutput: "ENTITY\\|ship\\|player\\|180\\|220\\|24\\|24\\|100",
      isPattern: true,
    },
    {
      id: "entity-asteroid",
      description: "Output asteroid entity at (300,60) size 18x18 health 40",
      expectedOutput: "ENTITY\\|asteroid1\\|enemy\\|300\\|60\\|18\\|18\\|40",
      isPattern: true,
    },
    {
      id: "score",
      description: "Output the initial score of 0",
      expectedOutput: "SCORE\\|0",
      isPattern: true,
    },
    {
      id: "game-message",
      description: "Output the asteroid detection message",
      expectedOutput: "GAME_MESSAGE\\|Asteroid field detected!",
      isPattern: true,
    },
  ],

  hints: [
    "Declare int variables for each property: shipX, shipY, shipSize, shipHealth, etc.",
    "Use the << operator to concatenate variable values into the ENTITY string.",
    "Remember to separate each field with a pipe character |.",
    "The ship entity format: ENTITY|ship|player|shipX|shipY|shipSize|shipSize|shipHealth",
    "Don't forget to output SCORE|0 and the GAME_MESSAGE line.",
  ],

  accumulatedCode: `#include <iostream>
using namespace std;

int main() {
    int shipX = 180;
    int shipY = 220;
    int shipSize = 24;
    int shipHealth = 100;

    int astX = 300;
    int astY = 60;
    int astSize = 18;
    int astHealth = 40;

    cout << "ENTITY|ship|player|" << shipX << "|" << shipY << "|"
         << shipSize << "|" << shipSize << "|" << shipHealth << endl;
    cout << "ENTITY|asteroid1|enemy|" << astX << "|" << astY << "|"
         << astSize << "|" << astSize << "|" << astHealth << endl;
    cout << "SCORE|0" << endl;
    cout << "GAME_MESSAGE|Asteroid field detected!" << endl;

    return 0;
}`,
};
