import type { Lesson } from "@/types/lesson";

export const lesson08: Lesson = {
  id: "08-conditionals",
  title: "Conditionals",
  description: "Make decisions with if/else and switch statements.",
  order: 8,
  xpReward: 100,
  tier: "pro",
  concepts: ["if/else", "comparison operators", "logical operators", "switch"],
  part1: {
    title: "Concept: Conditionals",
    type: "concept",
    instructions: `# Conditionals

Conditionals let your program make decisions based on conditions.

## If/Else
\`\`\`cpp
int hp = 25;
if (hp > 50) {
    cout << "Healthy" << endl;
} else if (hp > 0) {
    cout << "Wounded" << endl;
} else {
    cout << "Dead" << endl;
}
\`\`\`

## Comparison Operators
- \`==\` equal, \`!=\` not equal
- \`<\` less than, \`>\` greater than
- \`<=\` less or equal, \`>=\` greater or equal

## Logical Operators
- \`&&\` AND, \`||\` OR, \`!\` NOT

## Your Task
Given \`playerHP = 45\`, \`enemyHP = 0\`, \`hasPotion = true\`:

Print the status of each:
\`\`\`
Player: Wounded
Enemy: Defeated
Has potion: Drink to heal!
\`\`\`

Rules: HP > 75 = "Healthy", HP > 0 = "Wounded", HP <= 0 = "Defeated". If hasPotion is true, print "Drink to heal!".`,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int playerHP = 45;
    int enemyHP = 0;
    bool hasPotion = true;

    // Check player status

    // Check enemy status

    // Check potion

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    int playerHP = 45;
    int enemyHP = 0;
    bool hasPotion = true;

    if (playerHP > 75) {
        cout << "Player: Healthy" << endl;
    } else if (playerHP > 0) {
        cout << "Player: Wounded" << endl;
    } else {
        cout << "Player: Defeated" << endl;
    }

    if (enemyHP > 75) {
        cout << "Enemy: Healthy" << endl;
    } else if (enemyHP > 0) {
        cout << "Enemy: Wounded" << endl;
    } else {
        cout << "Enemy: Defeated" << endl;
    }

    if (hasPotion) {
        cout << "Has potion: Drink to heal!" << endl;
    }

    return 0;
}
`,
    tests: [
      {
        id: "t1",
        description: "Should show correct statuses",
        expectedOutput: "Player: Wounded\nEnemy: Defeated\nHas potion: Drink to heal!\n",
      },
    ],
    hints: [
      "Check `playerHP > 75` first, then `> 0`, then the else case.",
      "Use the same pattern for `enemyHP`.",
      "For the potion: `if (hasPotion)` — booleans can be used directly in conditions.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Game: Combat Logic",
    type: "game_builder",
    instructions: `# Game Builder: Conditional Combat

Games are full of conditionals: is the enemy alive? Did the player win? Should we show game over?

## Your Task
1. Create player (HP = 80) and enemy (HP = 30)
2. Simulate an attack: player deals 35 damage to enemy
3. Check if enemy HP <= 0 — if so, it's defeated
4. Render entities with updated HP and show appropriate message

Since enemy takes 35 damage (30 - 35 = -5, clamp to 0), enemy is defeated:

Expected output:
\`\`\`
ENTITY|hero|player|180|200|24|24|80
ENTITY|enemy1|enemy|300|120|20|20|0
GAME_MESSAGE|Enemy defeated! Victory!
SCORE|100
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int playerHP = 80;
    int enemyHP = 30;
    int damage = 35;

    // Apply damage to enemy

    // Clamp to 0 if negative

    // Render entities

    // Check if enemy defeated and show message

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    int playerHP = 80;
    int enemyHP = 30;
    int damage = 35;

    enemyHP = enemyHP - damage;
    if (enemyHP < 0) {
        enemyHP = 0;
    }

    cout << "ENTITY|hero|player|180|200|24|24|" << playerHP << endl;
    cout << "ENTITY|enemy1|enemy|300|120|20|20|" << enemyHP << endl;

    if (enemyHP <= 0) {
        cout << "GAME_MESSAGE|Enemy defeated! Victory!" << endl;
        cout << "SCORE|100" << endl;
    } else {
        cout << "GAME_MESSAGE|Enemy still standing!" << endl;
        cout << "SCORE|0" << endl;
    }

    return 0;
}
`,
    tests: [
      {
        id: "g1",
        description: "Should show enemy with 0 HP",
        expectedOutput: "ENTITY\\|enemy1\\|enemy\\|.*\\|0",
        isPattern: true,
      },
      {
        id: "g2",
        description: "Should show victory message",
        expectedOutput: "GAME_MESSAGE\\|Enemy defeated! Victory!",
        isPattern: true,
      },
      {
        id: "g3",
        description: "Should award 100 score",
        expectedOutput: "SCORE\\|100",
        isPattern: true,
      },
    ],
    hints: [
      "Subtract damage: `enemyHP = enemyHP - damage;`",
      "Clamp: `if (enemyHP < 0) { enemyHP = 0; }`",
      "Use `if (enemyHP <= 0)` to decide which message to show.",
    ],
    estimatedMinutes: 7,
  },
};
