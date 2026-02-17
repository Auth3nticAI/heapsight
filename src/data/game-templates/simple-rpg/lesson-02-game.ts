import type { GameLessonVariant } from "@/types/game";

export const lesson02SimpleRpg: GameLessonVariant = {
  lessonId: "02-variables",

  starterCode: `#include <iostream>
using namespace std;

int main() {
    // Declare variables for warrior properties
    // name (string), x (int), y (int), width (int), height (int), health (int)

    // Declare variables for goblin properties
    // name (string), x (int), y (int), width (int), height (int), health (int)

    // Output warrior entity using variables
    // Format: ENTITY|id|type|x|y|width|height|health

    // Output goblin entity using variables

    // Output starting score
    // Format: SCORE|number

    // Output encounter message
    // Format: GAME_MESSAGE|text

    return 0;
}`,

  solutionCode: `#include <iostream>
using namespace std;

int main() {
    // Warrior properties
    string warriorName = "warrior";
    int warriorX = 180;
    int warriorY = 200;
    int warriorW = 22;
    int warriorH = 26;
    int warriorHP = 100;

    // Goblin properties
    string goblinName = "goblin1";
    int goblinX = 300;
    int goblinY = 180;
    int goblinW = 18;
    int goblinH = 18;
    int goblinHP = 40;

    // Output warrior entity
    cout << "ENTITY|" << warriorName << "|player|"
         << warriorX << "|" << warriorY << "|"
         << warriorW << "|" << warriorH << "|"
         << warriorHP << endl;

    // Output goblin entity
    cout << "ENTITY|" << goblinName << "|enemy|"
         << goblinX << "|" << goblinY << "|"
         << goblinW << "|" << goblinH << "|"
         << goblinHP << endl;

    // Output starting score
    cout << "SCORE|0" << endl;

    // Output encounter message
    cout << "GAME_MESSAGE|Goblin spotted in the forest!" << endl;

    return 0;
}`,

  tests: [
    {
      id: "warrior-entity",
      description: "Outputs warrior entity with health using variables",
      expectedOutput: "ENTITY\\|warrior\\|player\\|180\\|200\\|22\\|26\\|100",
      isPattern: true,
    },
    {
      id: "goblin-entity",
      description: "Outputs goblin entity with health using variables",
      expectedOutput: "ENTITY\\|goblin1\\|enemy\\|300\\|180\\|18\\|18\\|40",
      isPattern: true,
    },
    {
      id: "score-output",
      description: "Outputs starting score of 0",
      expectedOutput: "SCORE\\|0",
      isPattern: true,
    },
    {
      id: "encounter-message",
      description: "Displays goblin encounter message",
      expectedOutput: "GAME_MESSAGE\\|Goblin spotted in the forest!",
      isPattern: true,
    },
  ],

  hints: [
    "Declare string variables for names and int variables for positions, sizes, and health.",
    "Use string concatenation with cout: cout << \"ENTITY|\" << name << \"|player|\" << x << ...",
    "The warrior has 100 HP and the goblin has 40 HP.",
    "Don't forget to output SCORE|0 and the GAME_MESSAGE line at the end.",
  ],

  accumulatedCode: `#include <iostream>
using namespace std;

int main() {
    // Warrior properties
    string warriorName = "warrior";
    int warriorX = 180;
    int warriorY = 200;
    int warriorW = 22;
    int warriorH = 26;
    int warriorHP = 100;

    // Goblin properties
    string goblinName = "goblin1";
    int goblinX = 300;
    int goblinY = 180;
    int goblinW = 18;
    int goblinH = 18;
    int goblinHP = 40;

    // Output warrior entity
    cout << "ENTITY|" << warriorName << "|player|"
         << warriorX << "|" << warriorY << "|"
         << warriorW << "|" << warriorH << "|"
         << warriorHP << endl;

    // Output goblin entity
    cout << "ENTITY|" << goblinName << "|enemy|"
         << goblinX << "|" << goblinY << "|"
         << goblinW << "|" << goblinH << "|"
         << goblinHP << endl;

    // Output starting score
    cout << "SCORE|0" << endl;

    // Output encounter message
    cout << "GAME_MESSAGE|Goblin spotted in the forest!" << endl;

    return 0;
}`,
};
