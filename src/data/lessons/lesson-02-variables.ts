import type { Lesson } from "@/types/lesson";

export const lesson02: Lesson = {
  id: "02-variables",
  title: "Variables & Types",
  description: "Learn about int, float, and string variables in C++.",
  order: 2,
  xpReward: 75,
  tier: "free",
  concepts: ["int", "float", "string", "bool", "variable declaration"],
  part1: {
    title: "Concept: Types",
    type: "concept",
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
    estimatedMinutes: 4,
  },
  part2: {
    title: "Game: Entity Stats",
    type: "game_builder",
    instructions: `# Game Builder: Entity Properties with Variables

Now use variables to define your game entities! Instead of hardcoding values in strings, use variables to store entity properties and build the output.

## Combining Variables with Output
\`\`\`cpp
int x = 100;
int y = 200;
cout << "ENTITY|hero|player|" << x << "|" << y << "|20|20" << endl;
\`\`\`

## Your Task
1. Create variables for your player: \`x = 180\`, \`y = 200\`, \`width = 24\`, \`height = 24\`, \`health = 100\`
2. Create variables for an enemy: \`ex = 300\`, \`ey = 100\`, \`ewidth = 20\`, \`eheight = 20\`, \`ehealth = 50\`
3. Output both entities and a score using the game protocol

Expected output:
\`\`\`
ENTITY|hero|player|180|200|24|24|100
ENTITY|enemy1|enemy|300|100|20|20|50
SCORE|0
GAME_MESSAGE|Two entities spawned!
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    // Player variables
    int x = 180;
    int y = 200;
    // Add width, height, health variables

    // Enemy variables

    // Output entities using the game protocol
    // Format: ENTITY|id|type|x|y|width|height|health

    // Output score and message

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    int x = 180;
    int y = 200;
    int width = 24;
    int height = 24;
    int health = 100;

    int ex = 300;
    int ey = 100;
    int ewidth = 20;
    int eheight = 20;
    int ehealth = 50;

    cout << "ENTITY|hero|player|" << x << "|" << y << "|" << width << "|" << height << "|" << health << endl;
    cout << "ENTITY|enemy1|enemy|" << ex << "|" << ey << "|" << ewidth << "|" << eheight << "|" << ehealth << endl;
    cout << "SCORE|0" << endl;
    cout << "GAME_MESSAGE|Two entities spawned!" << endl;

    return 0;
}
`,
    tests: [
      {
        id: "g1",
        description: "Should output a player entity with health",
        expectedOutput: "ENTITY\\|hero\\|player\\|180\\|200\\|24\\|24\\|100",
        isPattern: true,
      },
      {
        id: "g2",
        description: "Should output an enemy entity",
        expectedOutput: "ENTITY\\|enemy1\\|enemy\\|300\\|100\\|20\\|20\\|50",
        isPattern: true,
      },
      {
        id: "g3",
        description: "Should output a score",
        expectedOutput: "SCORE\\|0",
        isPattern: true,
      },
    ],
    hints: [
      "Don't forget to declare `width`, `height`, and `health` for the player.",
      'Build the entity string by chaining: `cout << "ENTITY|hero|player|" << x << "|" << y << ...`',
      "Make sure each entity output is on its own line with `endl`.",
    ],
    estimatedMinutes: 6,
  },
};
