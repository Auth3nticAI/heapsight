import type { Lesson } from "@/types/lesson";

export const lesson06: Lesson = {
  id: "06-arrays",
  title: "Arrays",
  description: "Store multiple values in fixed-size arrays.",
  order: 6,
  xpReward: 100,
  tier: "pro",
  concepts: ["arrays", "indexing", "fixed size", "iteration"],
  part1: {
    title: "Concept: Arrays",
    type: "concept",
    instructions: `# Arrays

An **array** stores multiple values of the same type in a fixed-size container.

## Declaring Arrays
\`\`\`cpp
int scores[5] = {10, 20, 30, 40, 50};
string names[3] = {"Alice", "Bob", "Charlie"};
\`\`\`

## Accessing Elements
Arrays use **zero-based indexing**:
\`\`\`cpp
cout << scores[0]; // 10 (first element)
cout << scores[4]; // 50 (last element)
scores[2] = 99;    // modify third element
\`\`\`

## Array Size
The size is fixed at compile time. Going past the end causes **undefined behavior** (crashes!).

## Your Task
Create an array of 5 enemy HP values: \`{100, 80, 60, 120, 90}\`. Print the total HP and the strongest enemy's HP.

\`\`\`
Total HP: 450
Strongest: 120
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    // Create array of enemy HP values
    int hp[5] = {100, 80, 60, 120, 90};

    // Calculate total HP

    // Find the strongest (highest HP)

    // Print results

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    int hp[5] = {100, 80, 60, 120, 90};

    int total = 0;
    int strongest = hp[0];

    total = hp[0] + hp[1] + hp[2] + hp[3] + hp[4];

    if (hp[1] > strongest) strongest = hp[1];
    if (hp[2] > strongest) strongest = hp[2];
    if (hp[3] > strongest) strongest = hp[3];
    if (hp[4] > strongest) strongest = hp[4];

    cout << "Total HP: " << total << endl;
    cout << "Strongest: " << strongest << endl;

    return 0;
}
`,
    tests: [
      {
        id: "t1",
        description: "Should output total HP and strongest",
        expectedOutput: "Total HP: 450\nStrongest: 120\n",
      },
    ],
    hints: [
      "Sum all elements: `total = hp[0] + hp[1] + hp[2] + hp[3] + hp[4];`",
      "Start with `strongest = hp[0]`, then compare each element.",
      "Check each: `if (hp[i] > strongest) strongest = hp[i];`",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Game: Entity Array",
    type: "game_builder",
    instructions: `# Game Builder: Multiple Entities with Arrays

Arrays let you manage multiple game entities efficiently. Let's use arrays to store positions and render several entities.

## Parallel Arrays
\`\`\`cpp
int xPos[3] = {50, 150, 250};
int yPos[3] = {100, 100, 100};
\`\`\`

## Your Task
1. Create arrays for 3 enemies: x positions \`{60, 180, 300}\`, y positions \`{80, 120, 80}\`
2. All enemies are 18x18 with 40 health
3. Output a player, all 3 enemies, and the score

Expected output:
\`\`\`
ENTITY|hero|player|180|220|24|24|100
ENTITY|e0|enemy|60|80|18|18|40
ENTITY|e1|enemy|180|120|18|18|40
ENTITY|e2|enemy|300|80|18|18|40
SCORE|0
GAME_MESSAGE|3 enemies approaching!
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    // Player
    cout << "ENTITY|hero|player|180|220|24|24|100" << endl;

    // Enemy position arrays
    int ex[3] = {60, 180, 300};
    int ey[3] = {80, 120, 80};

    // Output each enemy using array indices

    // Score and message

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    cout << "ENTITY|hero|player|180|220|24|24|100" << endl;

    int ex[3] = {60, 180, 300};
    int ey[3] = {80, 120, 80};

    cout << "ENTITY|e0|enemy|" << ex[0] << "|" << ey[0] << "|18|18|40" << endl;
    cout << "ENTITY|e1|enemy|" << ex[1] << "|" << ey[1] << "|18|18|40" << endl;
    cout << "ENTITY|e2|enemy|" << ex[2] << "|" << ey[2] << "|18|18|40" << endl;

    cout << "SCORE|0" << endl;
    cout << "GAME_MESSAGE|3 enemies approaching!" << endl;

    return 0;
}
`,
    tests: [
      {
        id: "g1",
        description: "Should render 3 enemies",
        expectedOutput: "ENTITY\\|e0\\|enemy.*\\nENTITY\\|e1\\|enemy.*\\nENTITY\\|e2\\|enemy",
        isPattern: true,
      },
      {
        id: "g2",
        description: "Should show approaching message",
        expectedOutput: "GAME_MESSAGE\\|3 enemies approaching!",
        isPattern: true,
      },
    ],
    hints: [
      "Access array elements with `ex[0]`, `ex[1]`, `ex[2]`.",
      "Build each enemy line: `cout << \"ENTITY|e0|enemy|\" << ex[0] << \"|\" << ey[0] << ...",
      "Use `e0`, `e1`, `e2` as the entity IDs.",
    ],
    estimatedMinutes: 6,
  },
};
