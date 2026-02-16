import type { Lesson } from "@/types/lesson";

export const lesson03: Lesson = {
  id: "03-functions",
  title: "Functions",
  description: "Create reusable code with functions, parameters, and return values.",
  order: 3,
  xpReward: 100,
  tier: "free",
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
  concepts: ["function definition", "parameters", "return values", "function calls"],
};
