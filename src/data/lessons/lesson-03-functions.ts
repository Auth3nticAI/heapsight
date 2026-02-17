import type { Lesson } from "@/types/lesson";

export const lesson03: Lesson = {
  id: "03-functions",
  title: "Functions",
  description: "Create reusable code with functions, parameters, and return values.",
  order: 3,
  xpReward: 100,
  tier: "free",
  concepts: ["function definition", "parameters", "return values", "function calls"],
  part1: {
    title: "Concept: Functions",
    type: "concept",
    instructions: `# Functions

Functions let you organize code into reusable blocks.

## Anatomy of a Function
\`\`\`cpp
int add(int a, int b) {
    return a + b;
}
\`\`\`

- **\`int\`** — return type (what the function gives back)
- **\`add\`** — function name
- **\`int a, int b\`** — parameters (inputs)
- **\`return\`** — sends a value back to the caller

## Calling Functions
\`\`\`cpp
int result = add(3, 5); // result = 8
\`\`\`

## Your Task
Write two functions:
1. \`int calculateDamage(int baseDmg, int multiplier)\` — returns \`baseDmg * multiplier\`
2. \`int calculateHP(int maxHP, int damage)\` — returns \`maxHP - damage\`

Then use them in \`main()\` to produce:
\`\`\`
Damage dealt: 150
Remaining HP: 850
\`\`\`

Use \`baseDmg = 50\`, \`multiplier = 3\`, and \`maxHP = 1000\`.`,
    starterCode: `#include <iostream>
using namespace std;

// Write your functions here

int main() {
    // Call your functions and print results

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int calculateDamage(int baseDmg, int multiplier) {
    return baseDmg * multiplier;
}

int calculateHP(int maxHP, int damage) {
    return maxHP - damage;
}

int main() {
    int damage = calculateDamage(50, 3);
    int hp = calculateHP(1000, damage);

    cout << "Damage dealt: " << damage << endl;
    cout << "Remaining HP: " << hp << endl;

    return 0;
}
`,
    tests: [
      {
        id: "t1",
        description: "Output should show damage and remaining HP",
        expectedOutput: "Damage dealt: 150\nRemaining HP: 850\n",
      },
    ],
    hints: [
      "Define `calculateDamage` before `main()` — it takes two `int` params and returns their product.",
      "Define `calculateHP` — it takes `maxHP` and `damage` and returns the difference.",
      "In `main()`: call `calculateDamage(50, 3)`, store the result, then pass it to `calculateHP(1000, damage)`.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Game: Spawn Functions",
    type: "game_builder",
    instructions: `# Game Builder: Functions for Entities

Let's use functions to create game entities! Writing a function to output entity protocol lines makes your code cleaner and reusable.

## Printing Entities with Functions
\`\`\`cpp
void spawnEntity(string id, string type, int x, int y, int w, int h) {
    cout << "ENTITY|" << id << "|" << type << "|"
         << x << "|" << y << "|" << w << "|" << h << endl;
}
\`\`\`

A \`void\` function doesn't return a value — it just does something (like print).

## Your Task
1. Write a \`void spawnEntity(...)\` function that outputs an entity line
2. Write an \`int calcDamage(int base, int mult)\` function that returns \`base * mult\`
3. Use them to spawn a player, an enemy, and show damage

Expected output:
\`\`\`
ENTITY|hero|player|180|200|24|24
ENTITY|boss|enemy|300|80|30|30
GAME_MESSAGE|Boss takes 120 damage!
SCORE|120
\`\`\`

Use \`calcDamage(40, 3)\` for the damage value.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

// Write your spawnEntity function here

// Write your calcDamage function here

int main() {
    // Spawn player and boss

    // Calculate and display damage

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

void spawnEntity(string id, string type, int x, int y, int w, int h) {
    cout << "ENTITY|" << id << "|" << type << "|"
         << x << "|" << y << "|" << w << "|" << h << endl;
}

int calcDamage(int base, int mult) {
    return base * mult;
}

int main() {
    spawnEntity("hero", "player", 180, 200, 24, 24);
    spawnEntity("boss", "enemy", 300, 80, 30, 30);

    int dmg = calcDamage(40, 3);
    cout << "GAME_MESSAGE|Boss takes " << dmg << " damage!" << endl;
    cout << "SCORE|" << dmg << endl;

    return 0;
}
`,
    tests: [
      {
        id: "g1",
        description: "Should spawn a player entity",
        expectedOutput: "ENTITY\\|hero\\|player\\|180\\|200\\|24\\|24",
        isPattern: true,
      },
      {
        id: "g2",
        description: "Should spawn a boss enemy",
        expectedOutput: "ENTITY\\|boss\\|enemy\\|300\\|80\\|30\\|30",
        isPattern: true,
      },
      {
        id: "g3",
        description: "Should show damage message with calculated value",
        expectedOutput: "GAME_MESSAGE\\|Boss takes 120 damage!",
        isPattern: true,
      },
    ],
    hints: [
      "The `spawnEntity` function should be `void` since it just prints — no return value needed.",
      "Chain the parameters with `|` separators in the `cout` statement.",
      "Call `calcDamage(40, 3)` to get 120, then use that in the GAME_MESSAGE output.",
    ],
    estimatedMinutes: 7,
  },
};
