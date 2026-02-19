import type { GameLessonVariant } from "@/types/game";

export const lesson01SimpleRpg: GameLessonVariant = {
  lessonId: "01-boot-the-system",

  starterCode: `#include <iostream>
using namespace std;

int main() {
    // Output a warrior entity on screen
    // Format: ENTITY|id|type|x|y|width|height
    // Then display a quest message
    // Format: GAME_MESSAGE|text

    return 0;
}`,

  solutionCode: `#include <iostream>
using namespace std;

int main() {
    // Spawn the warrior hero
    cout << "ENTITY|warrior|player|180|200|20|24" << endl;

    // Display the quest message
    cout << "GAME_MESSAGE|A new quest begins!" << endl;

    return 0;
}`,

  tests: [
    {
      id: "warrior-entity",
      description: "Outputs warrior entity with correct position and size",
      expectedOutput: "ENTITY\\|warrior\\|player\\|180\\|200\\|20\\|24",
      isPattern: true,
    },
    {
      id: "quest-message",
      description: "Displays the quest beginning message",
      expectedOutput: "GAME_MESSAGE\\|A new quest begins!",
      isPattern: true,
    },
  ],

  hints: [
    "Use cout to print each game protocol line followed by endl.",
    "The warrior entity line is: ENTITY|warrior|player|180|200|20|24",
    "The message line is: GAME_MESSAGE|A new quest begins!",
    "Each line should be a separate cout statement ending with << endl.",
  ],

  accumulatedCode: `#include <iostream>
using namespace std;

int main() {
    // Spawn the warrior hero
    cout << "ENTITY|warrior|player|180|200|20|24" << endl;

    // Display the quest message
    cout << "GAME_MESSAGE|A new quest begins!" << endl;

    return 0;
}`,
};
