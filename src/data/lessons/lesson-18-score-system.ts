import type { Lesson } from "@/types/lesson";

export const lesson18: Lesson = {
  id: "18-score-system",
  title: "Score System",
  description: "Build a scoring system with global state tracking.",
  order: 18,
  xpReward: 100,
  tier: "pro",
  concepts: ["global variables", "score tracking", "accumulation"],
  part1: {
    title: "Concept: Global State",
    type: "concept",
    instructions: `# Score System

Games track state across the entire program. A score system demonstrates global state management.

## Global Variables
\`\`\`cpp
int score = 0;  // accessible everywhere

void addScore(int points) {
    score = score + points;
}
\`\`\`

## Score Multipliers
\`\`\`cpp
int calcPoints(int base, int combo) {
    return base * combo;
}
\`\`\`

## Your Task
1. Start with score = 0
2. Kill enemy: +100 points
3. Collect item: +50 points
4. Apply 2x combo to item collection

\`\`\`
Kill: +100, Total: 100
Item (2x combo): +100, Total: 200
Final Score: 200
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

int score = 0;

void addScore(int points) {
    score = score + points;
}

int main() {
    // Kill enemy: +100

    // Item with 2x combo: 50 * 2

    // Print final score

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int score = 0;

void addScore(int points) {
    score = score + points;
}

int main() {
    addScore(100);
    cout << "Kill: +100, Total: " << score << endl;

    int itemPoints = 50 * 2;
    addScore(itemPoints);
    cout << "Item (2x combo): +" << itemPoints << ", Total: " << score << endl;

    cout << "Final Score: " << score << endl;
    return 0;
}
`,
    tests: [
      { id: "t1", description: "Should track score correctly", expectedOutput: "Kill: +100, Total: 100\nItem (2x combo): +100, Total: 200\nFinal Score: 200\n" },
    ],
    hints: [
      "`addScore(100)` adds 100 to the global `score`.",
      "Item with combo: `50 * 2 = 100`",
      "The global variable retains its value between calls.",
    ],
    estimatedMinutes: 4,
  },
  part2: {
    title: "Game: Score Display",
    type: "game_builder",
    instructions: `# Game Builder: Score System Integration

Build a complete scoring system that tracks kills and renders the score.

## Your Task
1. Track score globally
2. Simulate killing 3 enemies (50 points each)
3. Render the game state with final score

Expected output:
\`\`\`
ENTITY|hero|player|180|200|24|24|100
ENTITY|e0|enemy|80|100|18|18|0
ENTITY|e1|enemy|200|80|18|18|0
ENTITY|e2|enemy|320|100|18|18|0
SCORE|150
GAME_MESSAGE|All enemies defeated! Score: 150
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

int score = 0;

void addScore(int points) {
    score = score + points;
}

int main() {
    // Player
    cout << "ENTITY|hero|player|180|200|24|24|100" << endl;

    // Simulate killing 3 enemies (loop), +50 each

    // Show score and victory message

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int score = 0;

void addScore(int points) {
    score = score + points;
}

int main() {
    cout << "ENTITY|hero|player|180|200|24|24|100" << endl;

    int ex[3] = {80, 200, 320};
    int ey[3] = {100, 80, 100};

    for (int i = 0; i < 3; i++) {
        addScore(50);
        cout << "ENTITY|e" << i << "|enemy|" << ex[i] << "|" << ey[i] << "|18|18|0" << endl;
    }

    cout << "SCORE|" << score << endl;
    cout << "GAME_MESSAGE|All enemies defeated! Score: " << score << endl;
    return 0;
}
`,
    tests: [
      { id: "g1", description: "Should show score 150", expectedOutput: "SCORE\\|150", isPattern: true },
      { id: "g2", description: "Should show victory message", expectedOutput: "GAME_MESSAGE\\|All enemies defeated! Score: 150", isPattern: true },
    ],
    hints: [
      "Use a loop: `for (int i = 0; i < 3; i++)` and call `addScore(50)` each iteration.",
      "All enemies shown with 0 HP (already defeated).",
      "After the loop, score = 150 (3 x 50).",
    ],
    estimatedMinutes: 6,
  },
};
