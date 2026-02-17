import type { Lesson } from "@/types/lesson";

export const lesson19: Lesson = {
  id: "19-difficulty",
  title: "Difficulty Scaling",
  description: "Scale game difficulty using math functions.",
  order: 19,
  xpReward: 100,
  tier: "pro",
  concepts: ["math functions", "scaling", "difficulty curves"],
  part1: {
    title: "Concept: Scaling",
    type: "concept",
    instructions: `# Difficulty Scaling

Games get harder as you progress. Math functions create smooth difficulty curves.

## Linear Scaling
\`\`\`cpp
int enemyHP = 50 + level * 10;  // 60, 70, 80...
\`\`\`

## Scaling Functions
\`\`\`cpp
int scaleValue(int base, int level, int factor) {
    return base + level * factor;
}
\`\`\`

## Your Task
Write a \`scaleValue\` function. Calculate enemy HP and spawn count for level 5:
- Base HP: 40, factor: 15 per level → 40 + 5*15 = 115
- Base spawns: 2, factor: 1 per level → 2 + 5*1 = 7

\`\`\`
Level 5 Enemy HP: 115
Level 5 Spawns: 7
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

// Write scaleValue function

int main() {
    int level = 5;

    // Calculate scaled enemy HP and spawn count

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int scaleValue(int base, int level, int factor) {
    return base + level * factor;
}

int main() {
    int level = 5;

    int hp = scaleValue(40, level, 15);
    int spawns = scaleValue(2, level, 1);

    cout << "Level " << level << " Enemy HP: " << hp << endl;
    cout << "Level " << level << " Spawns: " << spawns << endl;
    return 0;
}
`,
    tests: [
      { id: "t1", description: "Should show scaled values", expectedOutput: "Level 5 Enemy HP: 115\nLevel 5 Spawns: 7\n" },
    ],
    hints: [
      "Function: `int scaleValue(int base, int level, int factor) { return base + level * factor; }`",
      "HP: `scaleValue(40, 5, 15)` = 40 + 75 = 115",
      "Spawns: `scaleValue(2, 5, 1)` = 2 + 5 = 7",
    ],
    estimatedMinutes: 4,
  },
  part2: {
    title: "Game: Scaled Waves",
    type: "game_builder",
    instructions: `# Game Builder: Difficulty Scaling

Scale enemy count and HP based on wave number. Wave 3: spawn 5 enemies with 70 HP each.

## Your Task
1. Write scaleValue function
2. Wave 3: enemies = scaleValue(2, 3, 1) = 5, hp = scaleValue(40, 3, 10) = 70
3. Spawn enemies in a loop

Expected output:
\`\`\`
ENTITY|hero|player|180|220|24|24|100
ENTITY|e0|enemy|30|60|16|16|70
ENTITY|e1|enemy|100|60|16|16|70
ENTITY|e2|enemy|170|60|16|16|70
ENTITY|e3|enemy|240|60|16|16|70
ENTITY|e4|enemy|310|60|16|16|70
SCORE|0
GAME_MESSAGE|Wave 3: 5 enemies (70 HP each)
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

int scaleValue(int base, int level, int factor) {
    return base + level * factor;
}

int main() {
    int wave = 3;

    // Calculate enemy count and HP

    // Render player + enemies in a loop

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int scaleValue(int base, int level, int factor) {
    return base + level * factor;
}

int main() {
    int wave = 3;
    int enemyCount = scaleValue(2, wave, 1);
    int enemyHP = scaleValue(40, wave, 10);

    cout << "ENTITY|hero|player|180|220|24|24|100" << endl;

    for (int i = 0; i < enemyCount; i++) {
        int xPos = 30 + i * 70;
        cout << "ENTITY|e" << i << "|enemy|" << xPos << "|60|16|16|" << enemyHP << endl;
    }

    cout << "SCORE|0" << endl;
    cout << "GAME_MESSAGE|Wave " << wave << ": " << enemyCount << " enemies (" << enemyHP << " HP each)" << endl;
    return 0;
}
`,
    tests: [
      { id: "g1", description: "Should spawn 5 enemies", expectedOutput: "ENTITY\\|e4\\|enemy\\|310\\|60\\|16\\|16\\|70", isPattern: true },
      { id: "g2", description: "Should show wave info", expectedOutput: "GAME_MESSAGE\\|Wave 3: 5 enemies \\(70 HP each\\)", isPattern: true },
    ],
    hints: [
      "enemyCount = scaleValue(2, 3, 1) = 5",
      "enemyHP = scaleValue(40, 3, 10) = 70",
      "Space enemies: `xPos = 30 + i * 70`",
    ],
    estimatedMinutes: 7,
  },
};
