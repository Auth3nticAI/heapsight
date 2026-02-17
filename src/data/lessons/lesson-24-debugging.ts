import type { Lesson } from "@/types/lesson";

export const lesson24: Lesson = {
  id: "24-debugging",
  title: "Debugging",
  description: "Read errors, use assertions, and fix bugs.",
  order: 24,
  xpReward: 125,
  tier: "pro",
  concepts: ["debugging", "error messages", "assertions", "bug fixing"],
  part1: {
    title: "Concept: Debugging",
    type: "concept",
    instructions: `# Debugging

Bugs are inevitable. The skill is finding and fixing them fast.

## Common Bug Types
- **Off-by-one**: loop runs 1 too many/few times
- **Wrong operator**: \`=\` instead of \`==\` in conditions
- **Uninitialized variables**: random garbage values

## Debug with Print
\`\`\`cpp
cout << "DEBUG: x = " << x << endl;
\`\`\`

## Your Task
This code has 2 bugs. Fix them to get:
\`\`\`
Sum: 15
Count: 5
\`\`\`

The array is {1, 2, 3, 4, 5}. Sum should be 15, count should be 5.`,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int nums[5] = {1, 2, 3, 4, 5};
    int sum = 0;
    int count = 0;

    // Bug 1: loop condition should be < 5, not <= 5
    for (int i = 0; i <= 5; i++) {
        sum = sum + nums[i];
        count++;
    }

    // Bug 2: should print count, not sum again
    cout << "Sum: " << sum << endl;
    cout << "Count: " << sum << endl;

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    int nums[5] = {1, 2, 3, 4, 5};
    int sum = 0;
    int count = 0;

    for (int i = 0; i < 5; i++) {
        sum = sum + nums[i];
        count++;
    }

    cout << "Sum: " << sum << endl;
    cout << "Count: " << count << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Should show correct sum and count", expectedOutput: "Sum: 15\nCount: 5\n" },
    ],
    hints: [
      "Bug 1: `i <= 5` accesses `nums[5]` which is out of bounds. Change to `i < 5`.",
      "Bug 2: Second print says `sum` but should say `count`.",
      "Off-by-one errors are the most common C++ bug!",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Game: Bug Hunt",
    type: "game_builder",
    instructions: `# Game Builder: Fix the Game Bugs

This game code has bugs! Fix them to render correctly.

## Bugs to Fix
1. Enemy loop should use \`< 3\` not \`<= 3\`
2. Score should use \`score\` not \`enemyHP\`
3. Player entity uses wrong variable for health

Expected output after fixing:
\`\`\`
ENTITY|hero|player|180|200|24|24|100
ENTITY|e0|enemy|80|80|18|18|40
ENTITY|e1|enemy|180|80|18|18|40
ENTITY|e2|enemy|280|80|18|18|40
SCORE|150
GAME_MESSAGE|3 enemies spawned!
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int playerHP = 100;
    int enemyHP = 40;
    int score = 150;

    // Bug 1: should use playerHP, not enemyHP
    cout << "ENTITY|hero|player|180|200|24|24|" << enemyHP << endl;

    int ex[3] = {80, 180, 280};

    // Bug 2: i <= 3 goes out of bounds, should be i < 3
    for (int i = 0; i <= 3; i++) {
        cout << "ENTITY|e" << i << "|enemy|" << ex[i] << "|80|18|18|" << enemyHP << endl;
    }

    // Bug 3: should print score, not enemyHP
    cout << "SCORE|" << enemyHP << endl;
    cout << "GAME_MESSAGE|3 enemies spawned!" << endl;

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    int playerHP = 100;
    int enemyHP = 40;
    int score = 150;

    cout << "ENTITY|hero|player|180|200|24|24|" << playerHP << endl;

    int ex[3] = {80, 180, 280};

    for (int i = 0; i < 3; i++) {
        cout << "ENTITY|e" << i << "|enemy|" << ex[i] << "|80|18|18|" << enemyHP << endl;
    }

    cout << "SCORE|" << score << endl;
    cout << "GAME_MESSAGE|3 enemies spawned!" << endl;

    return 0;
}
`,
    tests: [
      { id: "g1", description: "Player should have 100 HP", expectedOutput: "ENTITY\\|hero\\|player\\|180\\|200\\|24\\|24\\|100", isPattern: true },
      { id: "g2", description: "Should spawn exactly 3 enemies", expectedOutput: "ENTITY\\|e2\\|enemy\\|280\\|80\\|18\\|18\\|40", isPattern: true },
      { id: "g3", description: "Score should be 150", expectedOutput: "SCORE\\|150", isPattern: true },
    ],
    hints: [
      "Bug 1: Change `enemyHP` to `playerHP` in the player entity line.",
      "Bug 2: Change `i <= 3` to `i < 3` — arrays of size 3 use indices 0, 1, 2.",
      "Bug 3: Change `enemyHP` to `score` in the SCORE line.",
    ],
    estimatedMinutes: 7,
  },
};
