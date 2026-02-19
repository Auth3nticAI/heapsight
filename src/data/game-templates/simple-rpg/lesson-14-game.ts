import type { GameLessonVariant } from "@/types/game";

export const lesson14SimpleRpg: GameLessonVariant = {
  lessonId: "14-dynamic-arrays",

  instructions: `# RPG Architecture — Forward-Declared Game Systems

## Objective
Learn how **forward declarations** let you organize RPG subsystems — damage, loot, and rendering — by declaring them before \`main()\` and defining them after.

## Why This Matters
Real RPG codebases split combat, loot, and rendering into separate modules. Forward declarations let you **read the high-level combat sequence first** (in \`main\`) and study the details later. This is the foundation of maintainable game architecture.

## Data-Driven OOP Concept
Separating *what happens* (the combat sequence in \`main\`) from *how it happens* (the function definitions below) is data-driven design: the sequence is the data, the functions are the engine.

## Requirements
1. **Forward declare** three functions before \`main()\`:
   - \`int calculateDamage(int baseDmg, int armor)\` — returns \`baseDmg - armor\` (minimum 1)
   - \`string processLoot(int enemyLevel)\` — returns a loot string based on enemy level
   - \`void renderBattle(string playerId, int playerHP, string enemyId, int enemyHP)\` — outputs ENTITY lines for both combatants
2. In \`main()\`, run a combat sequence:
   - Warrior (100 HP, 22x26 at 180,200) vs Skeleton (50 HP, 18x18 at 300,160)
   - Calculate damage: base 30, armor 8 → actual damage
   - Apply damage to skeleton
   - Render the battle state
   - Process loot from a level-3 enemy
   - Output a GAME_MESSAGE with the loot received
   - Output SCORE equal to damage dealt
3. **Define** all three functions after \`main()\`.

## Expected Output Format
\`\`\`
ENTITY|warrior|player|180|200|22|26|100
ENTITY|skeleton|enemy|300|160|18|18|<damaged HP>
GAME_MESSAGE|Loot received: <loot string>
SCORE|<damage dealt>
\`\`\``,

  starterCode: `#include <iostream>
#include <string>
using namespace std;

// Forward declare your three RPG system functions here:
// int calculateDamage(int baseDmg, int armor);
// string processLoot(int enemyLevel);
// void renderBattle(string playerId, int playerHP, string enemyId, int enemyHP);

int main() {
    // Warrior: 100 HP, at (180,200), size 22x26
    // Skeleton: 50 HP, at (300,160), size 18x18

    // 1. Calculate damage: base 30, armor 8
    // 2. Apply damage to skeleton HP
    // 3. Render the battle (outputs ENTITY lines)
    // 4. Process loot from level-3 enemy
    // 5. Output GAME_MESSAGE with loot
    // 6. Output SCORE equal to damage dealt

    return 0;
}

// Define calculateDamage: return baseDmg - armor (minimum 1)

// Define processLoot: return loot string based on enemyLevel
//   level >= 3 -> "Enchanted Blade"
//   otherwise  -> "Rusty Sword"

// Define renderBattle: output ENTITY lines for player and enemy`,

  solutionCode: `#include <iostream>
#include <string>
using namespace std;

// Forward declarations
int calculateDamage(int baseDmg, int armor);
string processLoot(int enemyLevel);
void renderBattle(string playerId, int playerHP, string enemyId, int enemyHP);

int main() {
    // Game entities
    int warriorHP = 100;
    int skeletonHP = 50;

    // Combat sequence
    int damage = calculateDamage(30, 8);
    skeletonHP = skeletonHP - damage;

    // Render current battle state
    renderBattle("warrior", warriorHP, "skeleton", skeletonHP);

    // Process loot
    string loot = processLoot(3);
    cout << "GAME_MESSAGE|Loot received: " << loot << endl;

    // Output score
    cout << "SCORE|" << damage << endl;

    return 0;
}

// Function definitions after main
int calculateDamage(int baseDmg, int armor) {
    int dmg = baseDmg - armor;
    if (dmg < 1) dmg = 1;
    return dmg;
}

string processLoot(int enemyLevel) {
    if (enemyLevel >= 3) {
        return "Enchanted Blade";
    }
    return "Rusty Sword";
}

void renderBattle(string playerId, int playerHP, string enemyId, int enemyHP) {
    cout << "ENTITY|" << playerId << "|player|180|200|22|26|" << playerHP << endl;
    cout << "ENTITY|" << enemyId << "|enemy|300|160|18|18|" << enemyHP << endl;
}`,

  tests: [
    {
      id: "warrior-entity",
      description: "Renders warrior entity with full 100 HP",
      expectedOutput: "ENTITY\\|warrior\\|player\\|180\\|200\\|22\\|26\\|100",
      isPattern: true,
    },
    {
      id: "skeleton-damaged",
      description: "Renders skeleton with HP reduced by calculated damage (50 - 22 = 28)",
      expectedOutput: "ENTITY\\|skeleton\\|enemy\\|300\\|160\\|18\\|18\\|28",
      isPattern: true,
    },
    {
      id: "loot-message",
      description: "Displays loot received message for level-3 enemy",
      expectedOutput: "GAME_MESSAGE\\|Loot received: Enchanted Blade",
      isPattern: true,
    },
    {
      id: "score-damage",
      description: "Outputs score equal to damage dealt (30 - 8 = 22)",
      expectedOutput: "SCORE\\|22",
      isPattern: true,
    },
  ],

  hints: [
    "Forward declare functions before main() with just the signature and a semicolon: int calculateDamage(int baseDmg, int armor);",
    "In calculateDamage, compute baseDmg - armor but ensure the result is at least 1 using an if statement.",
    "In processLoot, check if enemyLevel >= 3 to return \"Enchanted Blade\", otherwise return \"Rusty Sword\".",
  ],

  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

// Forward declarations
int calculateDamage(int baseDmg, int armor);
string processLoot(int enemyLevel);
void renderBattle(string playerId, int playerHP, string enemyId, int enemyHP);

int main() {
    // Game entities
    int warriorHP = 100;
    int skeletonHP = 50;

    // Combat sequence
    int damage = calculateDamage(30, 8);
    skeletonHP = skeletonHP - damage;

    // Render current battle state
    renderBattle("warrior", warriorHP, "skeleton", skeletonHP);

    // Process loot
    string loot = processLoot(3);
    cout << "GAME_MESSAGE|Loot received: " << loot << endl;

    // Output score
    cout << "SCORE|" << damage << endl;

    return 0;
}

// Function definitions after main
int calculateDamage(int baseDmg, int armor) {
    int dmg = baseDmg - armor;
    if (dmg < 1) dmg = 1;
    return dmg;
}

string processLoot(int enemyLevel) {
    if (enemyLevel >= 3) {
        return "Enchanted Blade";
    }
    return "Rusty Sword";
}

void renderBattle(string playerId, int playerHP, string enemyId, int enemyHP) {
    cout << "ENTITY|" << playerId << "|player|180|200|22|26|" << playerHP << endl;
    cout << "ENTITY|" << enemyId << "|enemy|300|160|18|18|" << enemyHP << endl;
}`,
};
