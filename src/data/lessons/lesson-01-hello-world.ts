import type { Lesson } from "@/types/lesson";

export const lesson01: Lesson = {
  id: "01-hello-world",
  title: "Hello, World!",
  description: "Write your first C++ program and print to the console.",
  order: 1,
  xpReward: 50,
  tier: "free",
  concepts: ["#include", "main()", "cout", "endl"],
  part1: {
    title: "Concept: cout",
    type: "concept",
    instructions: `# Hello, World!

Every C++ program starts with a \`main()\` function. To print text to the console, we use \`cout\` from the \`<iostream>\` library.

## Key Concepts
- **\`#include <iostream>\`** — imports the input/output library
- **\`using namespace std;\`** — lets us write \`cout\` instead of \`std::cout\`
- **\`cout << "text"\`** — prints text to the console
- **\`endl\`** — adds a newline at the end

## Your Task
Write a program that prints exactly:
\`\`\`
Hello, World!
\`\`\`

Make sure to include a newline at the end using \`endl\` or \`"\\n"\`.`,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    // Write your code here

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}
`,
    tests: [
      {
        id: "t1",
        description: 'Output should be "Hello, World!"',
        expectedOutput: "Hello, World!\n",
      },
    ],
    hints: [
      'Use `cout << "text"` to print text.',
      "Don't forget `endl` or `\"\\n\"` at the end.",
      'The full line is: `cout << "Hello, World!" << endl;`',
    ],
    estimatedMinutes: 3,
  },
  part2: {
    title: "Game: First Output",
    type: "game_builder",
    instructions: `# Game Builder: Your First Game Output

Now let's use \`cout\` to create your first game frame! Your game uses a **text protocol** — special \`cout\` lines that the game preview canvas understands.

## Game Protocol
- **\`ENTITY|id|type|x|y|width|height\`** — draws a game entity
- **\`GAME_MESSAGE|text\`** — shows a message on screen

## Entity Types
- \`player\` — your character (drawn as a triangle)
- \`enemy\` — bad guys (drawn as red rectangles)
- \`item\` — collectibles (drawn as purple rectangles)

## Your Task
Use \`cout\` to output these lines (one per line):
1. A player entity at position (180, 200) with size 20x20
2. A welcome message

Expected output:
\`\`\`
ENTITY|hero|player|180|200|20|20
GAME_MESSAGE|Welcome to the game!
\`\`\`

Look at the Game Preview panel to see your entity appear!`,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    // Output a player entity using the game protocol
    // Format: ENTITY|id|type|x|y|width|height

    // Output a welcome message
    // Format: GAME_MESSAGE|text

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    cout << "ENTITY|hero|player|180|200|20|20" << endl;
    cout << "GAME_MESSAGE|Welcome to the game!" << endl;
    return 0;
}
`,
    tests: [
      {
        id: "g1",
        description: "Should output a player entity",
        expectedOutput: "ENTITY\\|hero\\|player\\|",
        isPattern: true,
      },
      {
        id: "g2",
        description: "Should output a welcome message",
        expectedOutput: "GAME_MESSAGE\\|",
        isPattern: true,
      },
    ],
    hints: [
      'Use `cout << "ENTITY|hero|player|180|200|20|20" << endl;` to create an entity.',
      "Each protocol line must be on its own line — use `endl`.",
      'The message format is: `cout << "GAME_MESSAGE|Welcome to the game!" << endl;`',
    ],
    estimatedMinutes: 5,
  },
};
