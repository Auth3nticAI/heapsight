import type { GameLessonVariant } from "@/types/game";

export const lesson12SimpleRpg: GameLessonVariant = {
  lessonId: "12-extract-components-header",

  instructions: `# Menu System — Choice-Driven Gameplay\n\nRPG menu systems read player input and dispatch to the correct game action. This is the core of **event-driven architecture** in turn-based games — the player's choice determines which code path executes.\n\n## Objectives\n- Display a combat menu with 3 options (Attack, Defend, Item)\n- Read the player's choice via \`cin\`\n- Dispatch to the correct action based on the choice\n- Display the result and render entities\n\n## Menu Options\n- **1 = Attack:** Warrior attacks goblin for 30 damage\n- **2 = Defend:** Warrior enters defensive stance, gains 10 armor\n- **3 = Item:** Warrior uses Health Potion, restores 25 HP\n\nFor testing, simulate input of **1** (Attack).\n\n## Output Protocol\n- \`ENTITY|id|type|x|y|width|height|health\` — render characters\n- \`GAME_MESSAGE|text\` — menu display and action result\n- \`SCORE|value\` — damage dealt or value of action`,

  starterCode: `#include <iostream>
using namespace std;

int main() {
    int warriorHP = 100;
    int goblinHP = 50;
    int choice;

    // Display menu options
    // Output: GAME_MESSAGE|=== COMBAT MENU ===
    // Output: GAME_MESSAGE|1) Attack  2) Defend  3) Item

    // Read player choice
    // cin >> choice;

    // Process choice:
    // If choice == 1: goblinHP -= 30
    //   Output: GAME_MESSAGE|Warrior slashes goblin for 30 damage!
    //   score = 30
    // If choice == 2: warrior gains armor
    //   Output: GAME_MESSAGE|Warrior raises shield! +10 armor!
    //   score = 10
    // If choice == 3: warriorHP += 25
    //   Output: GAME_MESSAGE|Warrior drinks potion! +25 HP!
    //   score = 25
    // Default: GAME_MESSAGE|Invalid choice!
    //   score = 0

    // Render warrior: ENTITY|warrior|player|180|200|22|26|<warriorHP>
    // Render goblin:  ENTITY|goblin1|enemy|300|180|18|18|<goblinHP>
    // Output: SCORE|<score>

    return 0;
}`,

  solutionCode: `#include <iostream>
using namespace std;

int main() {
    int warriorHP = 100;
    int goblinHP = 50;
    int choice;
    int score = 0;

    // Display combat menu
    cout << "GAME_MESSAGE|=== COMBAT MENU ===" << endl;
    cout << "GAME_MESSAGE|1) Attack  2) Defend  3) Item" << endl;

    // Read player choice
    cin >> choice;

    // Dispatch based on choice
    if (choice == 1) {
        goblinHP -= 30;
        cout << "GAME_MESSAGE|Warrior slashes goblin for 30 damage!" << endl;
        score = 30;
    } else if (choice == 2) {
        cout << "GAME_MESSAGE|Warrior raises shield! +10 armor!" << endl;
        score = 10;
    } else if (choice == 3) {
        warriorHP += 25;
        cout << "GAME_MESSAGE|Warrior drinks potion! +25 HP!" << endl;
        score = 25;
    } else {
        cout << "GAME_MESSAGE|Invalid choice!" << endl;
        score = 0;
    }

    // Render entities
    cout << "ENTITY|warrior|player|180|200|22|26|" << warriorHP << endl;
    cout << "ENTITY|goblin1|enemy|300|180|18|18|" << goblinHP << endl;

    // Output score
    cout << "SCORE|" << score << endl;

    return 0;
}`,

  tests: [
    {
      id: "menu-header",
      description: "Displays combat menu header",
      expectedOutput: "GAME_MESSAGE\\|=== COMBAT MENU ===",
      isPattern: true,
    },
    {
      id: "menu-options",
      description: "Displays menu options",
      expectedOutput: "GAME_MESSAGE\\|1\\) Attack  2\\) Defend  3\\) Item",
      isPattern: true,
    },
    {
      id: "attack-result",
      description: "Displays attack result for choice 1",
      expectedOutput: "GAME_MESSAGE\\|Warrior slashes goblin for 30 damage!",
      isPattern: true,
    },
    {
      id: "warrior-entity",
      description: "Renders warrior with 100 HP (unchanged after attack)",
      expectedOutput: "ENTITY\\|warrior\\|player\\|180\\|200\\|22\\|26\\|100",
      isPattern: true,
    },
    {
      id: "goblin-damaged",
      description: "Renders goblin with 20 HP after taking 30 damage",
      expectedOutput: "ENTITY\\|goblin1\\|enemy\\|300\\|180\\|18\\|18\\|20",
      isPattern: true,
    },
    {
      id: "score-damage",
      description: "Score equals damage dealt (30)",
      expectedOutput: "SCORE\\|30",
      isPattern: true,
    },
  ],

  hints: [
    "Use cin >> choice; to read the player's menu selection as an integer.",
    "Use if/else if/else to dispatch: if (choice == 1) { ... } else if (choice == 2) { ... } etc.",
    "For choice 1, subtract 30 from goblinHP before rendering the goblin entity.",
  ],

  accumulatedCode: `#include <iostream>
using namespace std;

int main() {
    int warriorHP = 100;
    int goblinHP = 50;
    int choice;
    int score = 0;

    // Display combat menu
    cout << "GAME_MESSAGE|=== COMBAT MENU ===" << endl;
    cout << "GAME_MESSAGE|1) Attack  2) Defend  3) Item" << endl;

    // Read player choice
    cin >> choice;

    // Dispatch based on choice
    if (choice == 1) {
        goblinHP -= 30;
        cout << "GAME_MESSAGE|Warrior slashes goblin for 30 damage!" << endl;
        score = 30;
    } else if (choice == 2) {
        cout << "GAME_MESSAGE|Warrior raises shield! +10 armor!" << endl;
        score = 10;
    } else if (choice == 3) {
        warriorHP += 25;
        cout << "GAME_MESSAGE|Warrior drinks potion! +25 HP!" << endl;
        score = 25;
    } else {
        cout << "GAME_MESSAGE|Invalid choice!" << endl;
        score = 0;
    }

    // Render entities
    cout << "ENTITY|warrior|player|180|200|22|26|" << warriorHP << endl;
    cout << "ENTITY|goblin1|enemy|300|180|18|18|" << goblinHP << endl;

    // Output score
    cout << "SCORE|" << score << endl;

    return 0;
}`,
};
