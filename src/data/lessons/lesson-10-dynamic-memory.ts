import type { Lesson } from "@/types/lesson";

export const lesson10: Lesson = {
  id: "10-dynamic-memory",
  title: "Dynamic Memory",
  description: "Allocate and free memory with new and delete.",
  order: 10,
  xpReward: 125,
  tier: "pro",
  concepts: ["new", "delete", "heap allocation", "memory management"],
  part1: {
    title: "Concept: new/delete",
    type: "concept",
    instructions: `# Dynamic Memory

Stack variables are automatic. **Heap** variables live until you manually free them.

## new — Allocate
\`\`\`cpp
int* hp = new int;
*hp = 100;
\`\`\`

## delete — Free
\`\`\`cpp
delete hp;
hp = nullptr;  // prevent dangling pointer
\`\`\`

## Why It Matters
- Stack: fast, automatic, limited size
- Heap: flexible, manual, can leak memory!

Forgetting \`delete\` = **memory leak**. Using after \`delete\` = **crash**.

## Your Task
1. Allocate an int on the heap with \`new\`
2. Set it to 42
3. Print its value
4. Delete it and print confirmation

\`\`\`
Allocated: 42
Freed: done
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    // Allocate int on heap

    // Set value and print

    // Delete and confirm

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    int* val = new int;
    *val = 42;

    cout << "Allocated: " << *val << endl;

    delete val;
    cout << "Freed: done" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Should allocate, use, and free", expectedOutput: "Allocated: 42\nFreed: done\n" },
    ],
    hints: [
      "`int* val = new int;` allocates on the heap.",
      "`*val = 42;` sets the value. `*val` reads it.",
      "`delete val;` frees the memory.",
    ],
    estimatedMinutes: 4,
  },
  part2: {
    title: "Game: Dynamic Entities",
    type: "game_builder",
    instructions: `# Game Builder: Dynamic Entity Creation

In real games, entities are created dynamically — you don't know how many enemies there will be at compile time. Let's use \`new\` to create entity data.

## Your Task
1. Dynamically allocate HP values for a player and enemy using \`new int\`
2. Set player HP to 100, enemy HP to 70
3. Deal 40 damage to enemy
4. Render both, then \`delete\` both pointers

Expected output:
\`\`\`
ENTITY|hero|player|180|200|24|24|100
ENTITY|enemy1|enemy|300|120|20|20|30
GAME_MESSAGE|Dynamic combat! Enemy HP: 30
SCORE|40
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    // Dynamically allocate HP for player and enemy

    // Set values and deal damage

    // Render entities

    // Clean up (delete)

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    int* playerHP = new int;
    int* enemyHP = new int;

    *playerHP = 100;
    *enemyHP = 70;

    int damage = 40;
    *enemyHP = *enemyHP - damage;

    cout << "ENTITY|hero|player|180|200|24|24|" << *playerHP << endl;
    cout << "ENTITY|enemy1|enemy|300|120|20|20|" << *enemyHP << endl;
    cout << "GAME_MESSAGE|Dynamic combat! Enemy HP: " << *enemyHP << endl;
    cout << "SCORE|" << damage << endl;

    delete playerHP;
    delete enemyHP;

    return 0;
}
`,
    tests: [
      { id: "g1", description: "Enemy should have 30 HP", expectedOutput: "ENTITY\\|enemy1\\|enemy\\|.*\\|30", isPattern: true },
      { id: "g2", description: "Should show combat message", expectedOutput: "GAME_MESSAGE\\|Dynamic combat! Enemy HP: 30", isPattern: true },
    ],
    hints: [
      "`int* playerHP = new int;` allocates on the heap.",
      "Set with `*playerHP = 100;`, then do math: `*enemyHP = *enemyHP - damage;`",
      "Always `delete playerHP;` and `delete enemyHP;` at the end.",
    ],
    estimatedMinutes: 7,
  },
};
