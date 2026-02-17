import type { Lesson } from "@/types/lesson";

export const lesson09: Lesson = {
  id: "09-references",
  title: "References",
  description: "Pass variables by reference to modify them directly.",
  order: 9,
  xpReward: 100,
  tier: "pro",
  concepts: ["references", "pass-by-reference", "& parameter", "alias"],
  part1: {
    title: "Concept: References",
    type: "concept",
    instructions: `# References

A **reference** is an alias for an existing variable. It's like a pointer but simpler and safer.

## Creating References
\`\`\`cpp
int health = 100;
int& hRef = health;  // hRef IS health
hRef = 50;           // health is now 50 too
\`\`\`

## Pass by Reference
\`\`\`cpp
void heal(int& hp, int amount) {
    hp = hp + amount;  // modifies the original!
}
\`\`\`

Without the \`&\`, the function gets a copy and the original doesn't change.

## Your Task
Write a \`void applyDamage(int& hp, int dmg)\` function that subtracts damage from HP (clamp to 0).

\`\`\`
Before: 100
After: 65
\`\`\`

Call with \`applyDamage(hp, 35)\`.`,
    starterCode: `#include <iostream>
using namespace std;

// Write applyDamage function with reference parameter

int main() {
    int hp = 100;
    cout << "Before: " << hp << endl;

    // Call applyDamage

    cout << "After: " << hp << endl;
    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

void applyDamage(int& hp, int dmg) {
    hp = hp - dmg;
    if (hp < 0) hp = 0;
}

int main() {
    int hp = 100;
    cout << "Before: " << hp << endl;
    applyDamage(hp, 35);
    cout << "After: " << hp << endl;
    return 0;
}
`,
    tests: [
      { id: "t1", description: "Should show before and after HP", expectedOutput: "Before: 100\nAfter: 65\n" },
    ],
    hints: [
      "The `&` in `int& hp` means the function receives the original variable, not a copy.",
      "Inside the function: `hp = hp - dmg;`",
      "Add clamping: `if (hp < 0) hp = 0;`",
    ],
    estimatedMinutes: 4,
  },
  part2: {
    title: "Game: Damage System",
    type: "game_builder",
    instructions: `# Game Builder: Reference-Based Damage

References make damage systems clean. Pass entity HP by reference to modify it directly.

## Your Task
1. Write \`void takeDamage(int& hp, int dmg)\` — subtracts damage, clamps to 0
2. Create player (100 HP) and enemy (60 HP)
3. Player deals 45 damage to enemy via reference
4. Render both entities

Expected output:
\`\`\`
ENTITY|hero|player|180|200|24|24|100
ENTITY|enemy1|enemy|300|120|20|20|15
GAME_MESSAGE|Enemy takes 45 damage! HP: 15
SCORE|45
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

// Write takeDamage function using references

int main() {
    int playerHP = 100;
    int enemyHP = 60;

    // Deal 45 damage to enemy

    // Render entities and message

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

void takeDamage(int& hp, int dmg) {
    hp = hp - dmg;
    if (hp < 0) hp = 0;
}

int main() {
    int playerHP = 100;
    int enemyHP = 60;

    takeDamage(enemyHP, 45);

    cout << "ENTITY|hero|player|180|200|24|24|" << playerHP << endl;
    cout << "ENTITY|enemy1|enemy|300|120|20|20|" << enemyHP << endl;
    cout << "GAME_MESSAGE|Enemy takes 45 damage! HP: " << enemyHP << endl;
    cout << "SCORE|45" << endl;
    return 0;
}
`,
    tests: [
      { id: "g1", description: "Enemy should have 15 HP", expectedOutput: "ENTITY\\|enemy1\\|enemy\\|.*\\|15", isPattern: true },
      { id: "g2", description: "Should show damage message", expectedOutput: "GAME_MESSAGE\\|Enemy takes 45 damage! HP: 15", isPattern: true },
    ],
    hints: [
      "`void takeDamage(int& hp, int dmg)` — the `&` makes hp a reference.",
      "Just call `takeDamage(enemyHP, 45);` — enemyHP changes directly.",
      "After the call, enemyHP is 15 (60 - 45).",
    ],
    estimatedMinutes: 6,
  },
};
