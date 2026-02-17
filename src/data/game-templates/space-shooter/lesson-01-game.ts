import type { GameLessonVariant } from "@/types/game";

export const lesson01SpaceShooter: GameLessonVariant = {
  lessonId: "01-hello-world",

  starterCode: `#include <iostream>
using namespace std;

int main() {
    // Output a spaceship entity using the game protocol:
    // ENTITY|id|type|x|y|width|height
    // Then output a GAME_MESSAGE with "Launch sequence initiated!"

    return 0;
}`,

  solutionCode: `#include <iostream>
using namespace std;

int main() {
    cout << "ENTITY|ship|player|180|220|20|20" << endl;
    cout << "GAME_MESSAGE|Launch sequence initiated!" << endl;

    return 0;
}`,

  tests: [
    {
      id: "entity-ship",
      description: "Output a ship entity at position (180,220) with size 20x20",
      expectedOutput: "ENTITY\\|ship\\|player\\|180\\|220\\|20\\|20",
      isPattern: true,
    },
    {
      id: "game-message",
      description: "Output the launch sequence message",
      expectedOutput: "GAME_MESSAGE\\|Launch sequence initiated!",
      isPattern: true,
    },
  ],

  hints: [
    "Use cout to print each line of game protocol output.",
    "The ENTITY format is: ENTITY|id|type|x|y|width|height",
    "Use endl or \"\\n\" to separate each protocol line.",
    "The ship entity should be: ENTITY|ship|player|180|220|20|20",
    "The message should be: GAME_MESSAGE|Launch sequence initiated!",
  ],

  accumulatedCode: `#include <iostream>
using namespace std;

int main() {
    cout << "ENTITY|ship|player|180|220|20|20" << endl;
    cout << "GAME_MESSAGE|Launch sequence initiated!" << endl;

    return 0;
}`,
};
