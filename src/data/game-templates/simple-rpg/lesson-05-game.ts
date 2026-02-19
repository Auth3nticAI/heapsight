import type { GameLessonVariant } from "@/types/game";

export const lesson05SimpleRpg: GameLessonVariant = {
  lessonId: "05-damage-function",

  starterCode: `#include <iostream>
using namespace std;

// Use pointers to modify entity health values
// Warrior starts at 100 HP, goblin starts at 40 HP
// The goblin takes 25 damage via a pointer

int main() {
    // Declare warrior and goblin health as int variables
    // Create pointers to each health variable

    // Use the goblin health pointer to subtract 25 damage
    // Store the damage dealt in a variable

    // Output warrior entity with current health
    // Format: ENTITY|warrior|player|180|200|22|26|health
    // Output goblin entity with modified health
    // Format: ENTITY|goblin1|enemy|300|180|18|18|health

    // Output damage message showing old and new HP
    // Format: GAME_MESSAGE|Goblin struck! HP from 40 to 15
    // Output score equal to damage dealt
    // Format: SCORE|25

    return 0;
}`,

  solutionCode: `#include <iostream>
using namespace std;

int main() {
    // Entity health values
    int warriorHP = 100;
    int goblinHP = 40;

    // Create pointers to health
    int* pWarriorHP = &warriorHP;
    int* pGoblinHP = &goblinHP;

    // Deal damage through pointer
    int damage = 25;
    int oldGoblinHP = *pGoblinHP;
    *pGoblinHP = *pGoblinHP - damage;

    // Output warrior entity with health via pointer
    cout << "ENTITY|warrior|player|180|200|22|26|" << *pWarriorHP << endl;

    // Output goblin entity with modified health via pointer
    cout << "ENTITY|goblin1|enemy|300|180|18|18|" << *pGoblinHP << endl;

    // Output damage message
    cout << "GAME_MESSAGE|Goblin struck! HP from " << oldGoblinHP
         << " to " << *pGoblinHP << endl;

    // Output score
    cout << "SCORE|" << damage << endl;

    return 0;
}`,

  tests: [
    {
      id: "warrior-health",
      description: "Outputs warrior entity with 100 HP via pointer",
      expectedOutput: "ENTITY\\|warrior\\|player\\|180\\|200\\|22\\|26\\|100",
      isPattern: true,
    },
    {
      id: "goblin-damaged",
      description: "Outputs goblin entity with reduced HP (40 - 25 = 15)",
      expectedOutput: "ENTITY\\|goblin1\\|enemy\\|300\\|180\\|18\\|18\\|15",
      isPattern: true,
    },
    {
      id: "damage-message",
      description: "Displays damage message with old and new HP",
      expectedOutput: "GAME_MESSAGE\\|Goblin struck! HP from 40 to 15",
      isPattern: true,
    },
    {
      id: "score-damage",
      description: "Outputs score equal to damage dealt",
      expectedOutput: "SCORE\\|25",
      isPattern: true,
    },
  ],

  hints: [
    "Declare health variables first: int warriorHP = 100; int goblinHP = 40;",
    "Create pointers with: int* pGoblinHP = &goblinHP;",
    "Modify health through the pointer: *pGoblinHP = *pGoblinHP - 25;",
    "Read values through pointers in cout: cout << *pWarriorHP to get the current value.",
  ],

  accumulatedCode: `#include <iostream>
using namespace std;

int main() {
    // Entity health values
    int warriorHP = 100;
    int goblinHP = 40;

    // Create pointers to health
    int* pWarriorHP = &warriorHP;
    int* pGoblinHP = &goblinHP;

    // Deal damage through pointer
    int damage = 25;
    int oldGoblinHP = *pGoblinHP;
    *pGoblinHP = *pGoblinHP - damage;

    // Output warrior entity with health via pointer
    cout << "ENTITY|warrior|player|180|200|22|26|" << *pWarriorHP << endl;

    // Output goblin entity with modified health via pointer
    cout << "ENTITY|goblin1|enemy|300|180|18|18|" << *pGoblinHP << endl;

    // Output damage message
    cout << "GAME_MESSAGE|Goblin struck! HP from " << oldGoblinHP
         << " to " << *pGoblinHP << endl;

    // Output score
    cout << "SCORE|" << damage << endl;

    return 0;
}`,
};
