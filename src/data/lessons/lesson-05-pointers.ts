import type { Lesson } from "@/types/lesson";

export const lesson05: Lesson = {
  id: "05-pointers",
  title: "Pointers & Memory",
  description: "Understand pointers, addresses, and why they crash games.",
  order: 5,
  xpReward: 150,
  tier: "free",
  concepts: ["pointers", "address-of (&)", "dereference (*)", "memory"],
  part1: {
    title: "Concept: Pointers",
    type: "concept",
    instructions: `# Pointers & Memory

A **pointer** stores the memory address of another variable. This is the core concept behind C++ power — and bugs.

## Pointer Basics
\`\`\`cpp
int x = 42;
int* ptr = &x;  // ptr holds the address of x
cout << *ptr;    // prints 42 (dereference)
\`\`\`

- **\`&x\`** — "address of" x
- **\`int*\`** — pointer to an int
- **\`*ptr\`** — "value at" the address ptr holds (dereference)

## Why This Matters
Pointers let you:
- Share data without copying
- Build dynamic data structures
- **Crash your program** if you're not careful (dangling pointers!)

## Your Task
1. Create an \`int health = 100\`
2. Create a pointer \`int* healthPtr\` that points to \`health\`
3. Use the pointer to modify health to 75
4. Print the results:

\`\`\`
Address stored: yes
Health via pointer: 75
Original variable: 75
Same value: 1
\`\`\`

The last line checks if \`*healthPtr == health\`.`,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    // Create health variable and pointer

    // Modify health through the pointer

    // Print results

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    int health = 100;
    int* healthPtr = &health;

    *healthPtr = 75;

    cout << "Address stored: yes" << endl;
    cout << "Health via pointer: " << *healthPtr << endl;
    cout << "Original variable: " << health << endl;
    cout << "Same value: " << (*healthPtr == health) << endl;

    return 0;
}
`,
    tests: [
      {
        id: "t1",
        description: "Output should demonstrate pointer usage",
        expectedOutput:
          "Address stored: yes\nHealth via pointer: 75\nOriginal variable: 75\nSame value: 1\n",
      },
    ],
    hints: [
      "Declare the pointer with `int* healthPtr = &health;`",
      "Modify through the pointer with `*healthPtr = 75;` — this changes `health` too!",
      "`*healthPtr == health` evaluates to `true` (prints as `1`) because they reference the same memory.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Game: Pointer Power",
    type: "game_builder",
    instructions: `# Game Builder: Modifying Entities via Pointers

Pointers are how real game engines modify entities efficiently. Instead of copying data, you pass a pointer and modify the original.

## Modifying Through Pointers
\`\`\`cpp
int hp = 100;
int* hpPtr = &hp;
*hpPtr = *hpPtr - 25;  // hp is now 75
\`\`\`

## Your Task
1. Create entity health variables: \`playerHP = 100\`, \`enemyHP = 80\`
2. Create pointers to both
3. Use pointers to deal 30 damage to the enemy
4. Render both entities and a message about the attack

Expected output:
\`\`\`
ENTITY|hero|player|180|200|24|24|100
ENTITY|enemy1|enemy|300|120|20|20|50
GAME_MESSAGE|Enemy hit! HP reduced from 80 to 50
SCORE|30
\`\`\`

The enemy's health goes from 80 to 50 (80 - 30 = 50).`,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    // Entity health variables
    int playerHP = 100;
    int enemyHP = 80;

    // Create pointers to health values

    // Deal 30 damage to enemy via pointer

    // Render entities and show damage message

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    int playerHP = 100;
    int enemyHP = 80;

    int* pHP = &playerHP;
    int* eHP = &enemyHP;

    int damage = 30;
    int oldHP = *eHP;
    *eHP = *eHP - damage;

    cout << "ENTITY|hero|player|180|200|24|24|" << *pHP << endl;
    cout << "ENTITY|enemy1|enemy|300|120|20|20|" << *eHP << endl;
    cout << "GAME_MESSAGE|Enemy hit! HP reduced from " << oldHP << " to " << *eHP << endl;
    cout << "SCORE|" << damage << endl;

    return 0;
}
`,
    tests: [
      {
        id: "g1",
        description: "Should render player with full health",
        expectedOutput: "ENTITY\\|hero\\|player\\|.*\\|100",
        isPattern: true,
      },
      {
        id: "g2",
        description: "Should render enemy with reduced health (50)",
        expectedOutput: "ENTITY\\|enemy1\\|enemy\\|.*\\|50",
        isPattern: true,
      },
      {
        id: "g3",
        description: "Should show damage message",
        expectedOutput: "GAME_MESSAGE\\|Enemy hit! HP reduced from 80 to 50",
        isPattern: true,
      },
    ],
    hints: [
      "Create pointers: `int* pHP = &playerHP;` and `int* eHP = &enemyHP;`",
      "Save the old value before modifying: `int oldHP = *eHP;` then `*eHP = *eHP - damage;`",
      "Use `*pHP` and `*eHP` when building the ENTITY output lines.",
    ],
    estimatedMinutes: 8,
  },
};
