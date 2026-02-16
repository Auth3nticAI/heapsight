import type { Lesson } from "@/types/lesson";

export const lesson02: Lesson = {
  id: "02-variables",
  title: "Variables & Types",
  description: "Learn about int, float, and string variables in C++.",
  order: 2,
  xpReward: 75,
  tier: "free",
  instructions: `# Variables & Types

C++ is a **statically typed** language — every variable must have a declared type.

## Common Types
- **\`int\`** — whole numbers: \`42\`, \`-7\`, \`0\`
- **\`float\`** — decimal numbers: \`3.14\`, \`-0.5\`
- **\`string\`** — text (requires \`#include <string>\`)
- **\`bool\`** — \`true\` or \`false\`

## Declaring Variables
\`\`\`cpp
int age = 25;
float pi = 3.14;
string name = "Alice";
bool alive = true;
\`\`\`

## Your Task
Create variables and print them so the output is exactly:
\`\`\`
Player: Hero
HP: 100
Speed: 2.5
Alive: 1
\`\`\`

Note: In C++, \`true\` prints as \`1\` and \`false\` prints as \`0\`.`,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    // Declare your variables here

    // Print them out

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string name = "Hero";
    int hp = 100;
    float speed = 2.5;
    bool alive = true;

    cout << "Player: " << name << endl;
    cout << "HP: " << hp << endl;
    cout << "Speed: " << speed << endl;
    cout << "Alive: " << alive << endl;

    return 0;
}
`,
  tests: [
    {
      id: "t1",
      description: "Output should display all 4 variables correctly",
      expectedOutput: "Player: Hero\nHP: 100\nSpeed: 2.5\nAlive: 1\n",
    },
  ],
  hints: [
    "Declare a `string name`, `int hp`, `float speed`, and `bool alive`.",
    'Use `cout << "Label: " << variable << endl;` to print each.',
    "`bool` values print as `1` (true) or `0` (false) by default.",
  ],
  concepts: ["int", "float", "string", "bool", "variable declaration"],
};
