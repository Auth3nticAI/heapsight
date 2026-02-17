import type { Lesson } from "@/types/lesson";

export const lesson07: Lesson = {
  id: "07-loops",
  title: "Loops",
  description: "Repeat actions with for and while loops.",
  order: 7,
  xpReward: 100,
  tier: "pro",
  concepts: ["for loop", "while loop", "iteration", "loop counter"],
  part1: {
    title: "Concept: Loops",
    type: "concept",
    instructions: `# Loops

Loops let you repeat code without writing it multiple times.

## For Loop
\`\`\`cpp
for (int i = 0; i < 5; i++) {
    cout << i << endl;
}
\`\`\`
This prints 0, 1, 2, 3, 4.

## While Loop
\`\`\`cpp
int hp = 100;
while (hp > 0) {
    hp = hp - 30;
}
\`\`\`

## Looping Over Arrays
\`\`\`cpp
int scores[3] = {10, 20, 30};
for (int i = 0; i < 3; i++) {
    cout << scores[i] << endl;
}
\`\`\`

## Your Task
Use a for loop to print a countdown and a launch message:
\`\`\`
5
4
3
2
1
Launch!
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    // Use a for loop to count down from 5 to 1

    // Print "Launch!"

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    for (int i = 5; i >= 1; i--) {
        cout << i << endl;
    }
    cout << "Launch!" << endl;

    return 0;
}
`,
    tests: [
      {
        id: "t1",
        description: "Should count down and launch",
        expectedOutput: "5\n4\n3\n2\n1\nLaunch!\n",
      },
    ],
    hints: [
      "Start the loop at `i = 5` and go down: `for (int i = 5; i >= 1; i--)`",
      "Use `i--` to decrement (same as `i = i - 1`).",
      'Print `"Launch!"` after the loop ends.',
    ],
    estimatedMinutes: 4,
  },
  part2: {
    title: "Game: Spawn Wave",
    type: "game_builder",
    instructions: `# Game Builder: Spawning Enemy Waves with Loops

Loops are essential for games — spawning waves of enemies, updating positions, checking collisions. Let's use a for loop to spawn a wave of enemies.

## Spawning with Loops
\`\`\`cpp
for (int i = 0; i < 3; i++) {
    int xPos = 50 + i * 100;
    cout << "ENTITY|e" << i << "|enemy|" << xPos << "|80|16|16|30" << endl;
}
\`\`\`

## Your Task
1. Output a player entity
2. Use a for loop to spawn 5 enemies in a row, spaced 60 pixels apart starting at x=30
3. Show the wave number

Expected output:
\`\`\`
ENTITY|hero|player|180|220|24|24|100
ENTITY|e0|enemy|30|60|16|16|25
ENTITY|e1|enemy|90|60|16|16|25
ENTITY|e2|enemy|150|60|16|16|25
ENTITY|e3|enemy|210|60|16|16|25
ENTITY|e4|enemy|270|60|16|16|25
SCORE|0
GAME_MESSAGE|Wave 1: 5 enemies!
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    // Render player
    cout << "ENTITY|hero|player|180|220|24|24|100" << endl;

    // Use a for loop to spawn 5 enemies
    // Each at x = 30 + i * 60, y = 60

    // Score and wave message

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    cout << "ENTITY|hero|player|180|220|24|24|100" << endl;

    for (int i = 0; i < 5; i++) {
        int xPos = 30 + i * 60;
        cout << "ENTITY|e" << i << "|enemy|" << xPos << "|60|16|16|25" << endl;
    }

    cout << "SCORE|0" << endl;
    cout << "GAME_MESSAGE|Wave 1: 5 enemies!" << endl;

    return 0;
}
`,
    tests: [
      {
        id: "g1",
        description: "Should spawn 5 enemies",
        expectedOutput: "ENTITY\\|e4\\|enemy\\|270\\|60",
        isPattern: true,
      },
      {
        id: "g2",
        description: "Should show wave message",
        expectedOutput: "GAME_MESSAGE\\|Wave 1: 5 enemies!",
        isPattern: true,
      },
    ],
    hints: [
      "Loop from `i = 0` to `i < 5` to get 5 enemies.",
      "Calculate position: `int xPos = 30 + i * 60;`",
      'Use `<< i <<` in the entity ID to get "e0", "e1", etc.',
    ],
    estimatedMinutes: 7,
  },
};
