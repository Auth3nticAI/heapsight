import type { GameLessonVariant } from "@/types/game";

export const lesson17SimpleRpg: GameLessonVariant = {
  lessonId: "17-entity-management",

  instructions: `# Party Management — Multi-Character Arrays

## Objective
Manage a party of 3 heroes using **parallel arrays** — each array stores one attribute (name, HP, ATK, alive status) for all party members.

## Why This Matters
RPG party systems manage multiple characters simultaneously. Before you learn classes, **parallel arrays** are the simplest way to track many entities sharing the same attributes. This is how early RPGs like Dragon Quest stored party data.

## Data-Driven OOP Concept
Parallel arrays are the precursor to **struct-of-arrays** (SoA) layout used in data-driven engines. The data (stats per member) is separated from the logic (attack, check alive). Adding a new party member means adding one entry to each array — no new code needed.

## Requirements
1. Create parallel arrays for 3 party members:
   - \`names[]\`: "Knight", "Mage", "Archer"
   - \`hp[]\`: 120, 80, 90
   - \`atk[]\`: 25, 35, 30
   - \`alive[]\`: true, true, true
2. Each member attacks a dragon (starting 200 HP). Subtract each member's ATK from dragon HP.
3. The dragon retaliates with 50 damage to the Mage (index 1). If HP <= 0, set alive to false.
4. Output ENTITY for each party member: position them at x = 100 + (index * 80), y = 200, size 22x26.
   - Only output entities for alive members.
5. Output ENTITY for the dragon at (350, 160), size 28x28, with remaining HP.
6. Output \`GAME_MESSAGE|Party dealt X total damage!\` where X is sum of all ATK values.
7. Output \`GAME_MESSAGE|Mage has fallen!\` if Mage is dead.
8. Output \`SCORE|<total damage dealt>\`.

## Expected Output
\`\`\`
ENTITY|Knight|party|100|200|22|26|120
ENTITY|Mage|party|180|200|22|26|30
ENTITY|Archer|party|260|200|22|26|90
ENTITY|dragon|enemy|350|160|28|28|110
GAME_MESSAGE|Party dealt 90 total damage!
SCORE|90
\`\`\``,

  starterCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    // Parallel arrays for 3 party members
    // string names[] = {"Knight", "Mage", "Archer"};
    // int hp[] = {120, 80, 90};
    // int atk[] = {25, 35, 30};
    // bool alive[] = {true, true, true};

    // Dragon: 200 HP
    // int dragonHP = 200;
    // int totalDamage = 0;

    // Each member attacks dragon:
    // Loop through party, subtract atk[i] from dragonHP
    // Track totalDamage

    // Dragon retaliates: deal 50 damage to Mage (index 1)
    // If hp[1] <= 0, set alive[1] = false, clamp hp to 0

    // Output ENTITY for each alive member
    // Position: x = 100 + (i * 80), y = 200, size 22x26
    // Format: ENTITY|name|party|x|200|22|26|hp

    // Output dragon entity at (350,160), size 28x28
    // Format: ENTITY|dragon|enemy|350|160|28|28|dragonHP

    // Output GAME_MESSAGE with total damage
    // If Mage is dead, output GAME_MESSAGE|Mage has fallen!
    // Output SCORE|totalDamage

    return 0;
}`,

  solutionCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    // Parallel arrays for 3 party members
    string names[] = {"Knight", "Mage", "Archer"};
    int hp[] = {120, 80, 90};
    int atk[] = {25, 35, 30};
    bool alive[] = {true, true, true};

    int dragonHP = 200;
    int totalDamage = 0;

    // Each member attacks dragon
    for (int i = 0; i < 3; i++) {
        dragonHP = dragonHP - atk[i];
        totalDamage = totalDamage + atk[i];
    }

    // Dragon retaliates against Mage (index 1)
    hp[1] = hp[1] - 50;
    if (hp[1] <= 0) {
        hp[1] = 0;
        alive[1] = false;
    }

    // Output alive party members
    for (int i = 0; i < 3; i++) {
        if (alive[i]) {
            int x = 100 + (i * 80);
            cout << "ENTITY|" << names[i] << "|party|" << x
                 << "|200|22|26|" << hp[i] << endl;
        }
    }

    // Output dragon
    cout << "ENTITY|dragon|enemy|350|160|28|28|" << dragonHP << endl;

    // Output messages
    cout << "GAME_MESSAGE|Party dealt " << totalDamage << " total damage!" << endl;

    if (!alive[1]) {
        cout << "GAME_MESSAGE|Mage has fallen!" << endl;
    }

    cout << "SCORE|" << totalDamage << endl;

    return 0;
}`,

  tests: [
    {
      id: "knight-entity",
      description: "Knight rendered at x=100 with 120 HP",
      expectedOutput: "ENTITY\\|Knight\\|party\\|100\\|200\\|22\\|26\\|120",
      isPattern: true,
    },
    {
      id: "mage-entity",
      description: "Mage rendered at x=180 with 30 HP (80 - 50 = 30, still alive)",
      expectedOutput: "ENTITY\\|Mage\\|party\\|180\\|200\\|22\\|26\\|30",
      isPattern: true,
    },
    {
      id: "archer-entity",
      description: "Archer rendered at x=260 with 90 HP",
      expectedOutput: "ENTITY\\|Archer\\|party\\|260\\|200\\|22\\|26\\|90",
      isPattern: true,
    },
    {
      id: "dragon-entity",
      description: "Dragon has 110 HP remaining (200 - 25 - 35 - 30)",
      expectedOutput: "ENTITY\\|dragon\\|enemy\\|350\\|160\\|28\\|28\\|110",
      isPattern: true,
    },
    {
      id: "total-damage-message",
      description: "Reports 90 total party damage",
      expectedOutput: "GAME_MESSAGE\\|Party dealt 90 total damage!",
      isPattern: true,
    },
    {
      id: "score-output",
      description: "Score equals total damage dealt (90)",
      expectedOutput: "SCORE\\|90",
      isPattern: true,
    },
  ],

  hints: [
    "Declare parallel arrays: string names[] = {\"Knight\", \"Mage\", \"Archer\"}; and similarly for hp[], atk[], alive[].",
    "Use a for loop from 0 to 2 to have each member attack: dragonHP -= atk[i]; totalDamage += atk[i];",
    "After the dragon hits Mage: hp[1] -= 50; then check if hp[1] <= 0 to set alive[1] = false.",
  ],

  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    // Parallel arrays for 3 party members
    string names[] = {"Knight", "Mage", "Archer"};
    int hp[] = {120, 80, 90};
    int atk[] = {25, 35, 30};
    bool alive[] = {true, true, true};

    int dragonHP = 200;
    int totalDamage = 0;

    // Each member attacks dragon
    for (int i = 0; i < 3; i++) {
        dragonHP = dragonHP - atk[i];
        totalDamage = totalDamage + atk[i];
    }

    // Dragon retaliates against Mage (index 1)
    hp[1] = hp[1] - 50;
    if (hp[1] <= 0) {
        hp[1] = 0;
        alive[1] = false;
    }

    // Output alive party members
    for (int i = 0; i < 3; i++) {
        if (alive[i]) {
            int x = 100 + (i * 80);
            cout << "ENTITY|" << names[i] << "|party|" << x
                 << "|200|22|26|" << hp[i] << endl;
        }
    }

    // Output dragon
    cout << "ENTITY|dragon|enemy|350|160|28|28|" << dragonHP << endl;

    // Output messages
    cout << "GAME_MESSAGE|Party dealt " << totalDamage << " total damage!" << endl;

    if (!alive[1]) {
        cout << "GAME_MESSAGE|Mage has fallen!" << endl;
    }

    cout << "SCORE|" << totalDamage << endl;

    return 0;
}`,
};
