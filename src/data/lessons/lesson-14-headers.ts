import type { Lesson } from "@/types/lesson";

export const lesson14: Lesson = {
  id: "14-headers",
  title: "Header Files",
  description: "Understand multi-file organization (simulated in single file).",
  order: 14,
  xpReward: 100,
  tier: "pro",
  concepts: ["header files", "#include", "declarations", "definitions"],
  part1: {
    title: "Concept: Headers",
    type: "concept",
    instructions: `# Header Files

Real C++ projects split code across files. **Headers** (\`.h\`) declare what exists; **source** (\`.cpp\`) defines how it works.

## How Headers Work
\`\`\`
// enemy.h — declaration
struct Enemy { string name; int hp; };
int calcDamage(int base, int mult);

// enemy.cpp — definition
int calcDamage(int base, int mult) { return base * mult; }
\`\`\`

## Simulating Headers
Since we use a single file, we'll practice the **separation pattern**: declarations first, definitions later.

## Your Task
Write declarations (prototypes) at the top, definitions at the bottom:
1. Declare \`int add(int a, int b);\` at the top
2. Define the function after \`main()\`

\`\`\`
Sum: 15
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

// Declare function prototype here

int main() {
    cout << "Sum: " << add(7, 8) << endl;
    return 0;
}

// Define function here
`,
    solutionCode: `#include <iostream>
using namespace std;

int add(int a, int b);

int main() {
    cout << "Sum: " << add(7, 8) << endl;
    return 0;
}

int add(int a, int b) {
    return a + b;
}
`,
    tests: [
      { id: "t1", description: "Should show sum using forward declaration", expectedOutput: "Sum: 15\n" },
    ],
    hints: [
      "Prototype: `int add(int a, int b);` — note the semicolon, no body.",
      "Put the prototype before main, the full definition after main.",
      "The definition is: `int add(int a, int b) { return a + b; }`",
    ],
    estimatedMinutes: 4,
  },
  part2: {
    title: "Game: Code Organization",
    type: "game_builder",
    instructions: `# Game Builder: Organized Game Code

Let's organize game code with forward declarations — declare all functions first, use them in main, define them after.

## Your Task
1. Forward-declare: \`void renderEntity(...);\` and \`int calcScore(int kills, int bonus);\`
2. In main: render player + enemy, calculate and show score
3. Define functions after main

Expected output:
\`\`\`
ENTITY|hero|player|180|200|24|24|100
ENTITY|enemy1|enemy|300|100|20|20|60
SCORE|350
GAME_MESSAGE|Score calculated: 350
\`\`\`

calcScore(5, 100) = 5 * 50 + 100 = 350`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

// Forward declarations here

int main() {
    // Use functions, render entities, show score
    return 0;
}

// Function definitions here
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

void renderEntity(string id, string type, int x, int y, int w, int h, int hp);
int calcScore(int kills, int bonus);

int main() {
    renderEntity("hero", "player", 180, 200, 24, 24, 100);
    renderEntity("enemy1", "enemy", 300, 100, 20, 20, 60);

    int score = calcScore(5, 100);
    cout << "SCORE|" << score << endl;
    cout << "GAME_MESSAGE|Score calculated: " << score << endl;
    return 0;
}

void renderEntity(string id, string type, int x, int y, int w, int h, int hp) {
    cout << "ENTITY|" << id << "|" << type << "|"
         << x << "|" << y << "|" << w << "|" << h << "|" << hp << endl;
}

int calcScore(int kills, int bonus) {
    return kills * 50 + bonus;
}
`,
    tests: [
      { id: "g1", description: "Should render entities", expectedOutput: "ENTITY\\|hero\\|player\\|180\\|200", isPattern: true },
      { id: "g2", description: "Should show score 350", expectedOutput: "SCORE\\|350", isPattern: true },
    ],
    hints: [
      "Forward declare with full signature + semicolon: `void renderEntity(string id, ...);`",
      "Call functions in main as normal — the compiler knows they exist from the declaration.",
      "calcScore: `kills * 50 + bonus` = 5 * 50 + 100 = 350.",
    ],
    estimatedMinutes: 7,
  },
};
