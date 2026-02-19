import type { GameLessonVariant } from "@/types/game";

export const lesson08SimpleRpg: GameLessonVariant = {
  lessonId: "08-combat-rules",

  instructions: `# Combat Branching — Attack, Defend, or Heal\n\nTurn-based RPGs rely on **conditional branching** to resolve player actions. Each action type triggers different game logic — dealing damage, reducing incoming damage, or restoring health.\n\n## Objectives\n- Set up a warrior (100 HP) and a goblin (40 HP)\n- Define an action variable (1=Attack, 2=Defend, 3=Heal)\n- Use if/else if/else to resolve the chosen action\n- Display the result and updated entities\n\n## Action Rules\n- **Attack (action=1):** Deal 25 damage to goblin. Goblin HP decreases.\n- **Defend (action=2):** Warrior takes reduced damage. Enemy hits for 10, but defense blocks 7, so warrior takes only 3.\n- **Heal (action=3):** Warrior restores 20 HP.\n\nFor this lesson, use **action = 1** (Attack) as the simulated choice.\n\n## Output Protocol\n- \`ENTITY|id|type|x|y|width|height|health\` — render characters with updated HP\n- \`GAME_MESSAGE|text\` — describe action result\n- \`SCORE|value\` — damage dealt or HP restored`,

  starterCode: `#include <iostream>
using namespace std;

int main() {
    int warriorHP = 100;
    int goblinHP = 40;
    int action = 1; // 1=Attack, 2=Defend, 3=Heal

    // Use if/else if/else to handle the action:
    //
    // If action == 1 (Attack):
    //   Deal 25 damage to goblinHP
    //   Output: GAME_MESSAGE|Warrior attacks! Goblin takes 25 damage!
    //   Set score to 25
    //
    // Else if action == 2 (Defend):
    //   Enemy attacks for 10 but defense blocks 7 -> warrior takes 3
    //   Output: GAME_MESSAGE|Warrior defends! Only 3 damage taken!
    //   Set score to 7 (damage blocked)
    //
    // Else (Heal):
    //   Warrior restores 20 HP
    //   Output: GAME_MESSAGE|Warrior heals! Restored 20 HP!
    //   Set score to 20

    // Render warrior entity with updated HP
    // Format: ENTITY|warrior|player|180|200|22|26|<warriorHP>

    // Render goblin entity with updated HP
    // Format: ENTITY|goblin1|enemy|300|180|18|18|<goblinHP>

    // Output: SCORE|<score>

    return 0;
}`,

  solutionCode: `#include <iostream>
using namespace std;

int main() {
    int warriorHP = 100;
    int goblinHP = 40;
    int action = 1; // 1=Attack, 2=Defend, 3=Heal
    int score = 0;

    if (action == 1) {
        // Attack: deal 25 damage to goblin
        int damage = 25;
        goblinHP -= damage;
        cout << "GAME_MESSAGE|Warrior attacks! Goblin takes 25 damage!" << endl;
        score = damage;
    } else if (action == 2) {
        // Defend: reduce incoming damage
        int enemyAttack = 10;
        int blocked = 7;
        int damageTaken = enemyAttack - blocked;
        warriorHP -= damageTaken;
        cout << "GAME_MESSAGE|Warrior defends! Only 3 damage taken!" << endl;
        score = blocked;
    } else {
        // Heal: restore HP
        int healAmount = 20;
        warriorHP += healAmount;
        cout << "GAME_MESSAGE|Warrior heals! Restored 20 HP!" << endl;
        score = healAmount;
    }

    // Render entities with updated HP
    cout << "ENTITY|warrior|player|180|200|22|26|" << warriorHP << endl;
    cout << "ENTITY|goblin1|enemy|300|180|18|18|" << goblinHP << endl;

    // Output score
    cout << "SCORE|" << score << endl;

    return 0;
}`,

  tests: [
    {
      id: "attack-message",
      description: "Displays attack action message",
      expectedOutput: "GAME_MESSAGE\\|Warrior attacks! Goblin takes 25 damage!",
      isPattern: true,
    },
    {
      id: "warrior-hp",
      description: "Warrior HP stays at 100 after attacking",
      expectedOutput: "ENTITY\\|warrior\\|player\\|180\\|200\\|22\\|26\\|100",
      isPattern: true,
    },
    {
      id: "goblin-damaged",
      description: "Goblin HP reduced to 15 after taking 25 damage",
      expectedOutput: "ENTITY\\|goblin1\\|enemy\\|300\\|180\\|18\\|18\\|15",
      isPattern: true,
    },
    {
      id: "score-damage",
      description: "Score equals damage dealt (25)",
      expectedOutput: "SCORE\\|25",
      isPattern: true,
    },
  ],

  hints: [
    "Use if (action == 1) { ... } else if (action == 2) { ... } else { ... } to branch.",
    "For the attack branch: goblinHP -= 25; then output the attack message.",
    "Remember to output the ENTITY lines AFTER the if/else block so they show updated HP.",
  ],

  accumulatedCode: `#include <iostream>
using namespace std;

int main() {
    int warriorHP = 100;
    int goblinHP = 40;
    int action = 1; // 1=Attack, 2=Defend, 3=Heal
    int score = 0;

    if (action == 1) {
        // Attack: deal 25 damage to goblin
        int damage = 25;
        goblinHP -= damage;
        cout << "GAME_MESSAGE|Warrior attacks! Goblin takes 25 damage!" << endl;
        score = damage;
    } else if (action == 2) {
        // Defend: reduce incoming damage
        int enemyAttack = 10;
        int blocked = 7;
        int damageTaken = enemyAttack - blocked;
        warriorHP -= damageTaken;
        cout << "GAME_MESSAGE|Warrior defends! Only 3 damage taken!" << endl;
        score = blocked;
    } else {
        // Heal: restore HP
        int healAmount = 20;
        warriorHP += healAmount;
        cout << "GAME_MESSAGE|Warrior heals! Restored 20 HP!" << endl;
        score = healAmount;
    }

    // Render entities with updated HP
    cout << "ENTITY|warrior|player|180|200|22|26|" << warriorHP << endl;
    cout << "ENTITY|goblin1|enemy|300|180|18|18|" << goblinHP << endl;

    // Output score
    cout << "SCORE|" << score << endl;

    return 0;
}`,
};
