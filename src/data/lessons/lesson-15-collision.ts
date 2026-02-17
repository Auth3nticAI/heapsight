import type { Lesson } from "@/types/lesson";

export const lesson15: Lesson = {
  id: "15-collision",
  title: "Collision Detection",
  description: "Detect when game entities overlap using math.",
  order: 15,
  xpReward: 125,
  tier: "pro",
  concepts: ["AABB collision", "bounding box", "overlap detection"],
  part1: {
    title: "Concept: Collision",
    type: "concept",
    instructions: `# Collision Detection

**AABB** (Axis-Aligned Bounding Box) is the simplest collision check. Two rectangles overlap if they overlap on BOTH axes.

## The Formula
\`\`\`cpp
bool collides(int x1, int y1, int w1, int h1,
              int x2, int y2, int w2, int h2) {
    return x1 < x2 + w2 && x1 + w1 > x2 &&
           y1 < y2 + h2 && y1 + h1 > y2;
}
\`\`\`

If ANY of these conditions is false, the boxes don't overlap.

## Your Task
Write the \`collides\` function and test two pairs:
- Box A (10, 10, 30, 30) vs Box B (20, 20, 30, 30) — overlapping
- Box A (10, 10, 30, 30) vs Box C (100, 100, 30, 30) — not overlapping

\`\`\`
A vs B: 1
A vs C: 0
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

// Write collides function

int main() {
    // Test overlapping boxes

    // Test non-overlapping boxes

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

bool collides(int x1, int y1, int w1, int h1,
              int x2, int y2, int w2, int h2) {
    return x1 < x2 + w2 && x1 + w1 > x2 &&
           y1 < y2 + h2 && y1 + h1 > y2;
}

int main() {
    cout << "A vs B: " << collides(10, 10, 30, 30, 20, 20, 30, 30) << endl;
    cout << "A vs C: " << collides(10, 10, 30, 30, 100, 100, 30, 30) << endl;
    return 0;
}
`,
    tests: [
      { id: "t1", description: "Should detect overlapping and non-overlapping", expectedOutput: "A vs B: 1\nA vs C: 0\n" },
    ],
    hints: [
      "The function returns `bool` — true if overlapping.",
      "All 4 conditions must be true: left edge < right edge of other, etc.",
      "Call with 8 parameters: x, y, w, h for each box.",
    ],
    estimatedMinutes: 6,
  },
  part2: {
    title: "Game: Hit Detection",
    type: "game_builder",
    instructions: `# Game Builder: Collision in Action

Let's use AABB collision to detect if a projectile hits an enemy!

## Your Task
1. Write a \`collides\` function
2. Place player at (180, 200, 24, 24), enemy at (300, 100, 20, 20), bullet at (295, 105, 6, 6)
3. Check if bullet hits enemy — it does!
4. If hit: show damage message. If not: show miss.

Expected output:
\`\`\`
ENTITY|hero|player|180|200|24|24|100
ENTITY|enemy1|enemy|300|100|20|20|50
ENTITY|bullet|projectile|295|105|6|6
GAME_MESSAGE|Direct hit! Enemy damaged!
SCORE|50
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

// Write collides function

int main() {
    // Define entity positions

    // Check collision between bullet and enemy

    // Render entities and result

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

bool collides(int x1, int y1, int w1, int h1,
              int x2, int y2, int w2, int h2) {
    return x1 < x2 + w2 && x1 + w1 > x2 &&
           y1 < y2 + h2 && y1 + h1 > y2;
}

int main() {
    cout << "ENTITY|hero|player|180|200|24|24|100" << endl;
    cout << "ENTITY|enemy1|enemy|300|100|20|20|50" << endl;
    cout << "ENTITY|bullet|projectile|295|105|6|6" << endl;

    bool hit = collides(295, 105, 6, 6, 300, 100, 20, 20);

    if (hit) {
        cout << "GAME_MESSAGE|Direct hit! Enemy damaged!" << endl;
        cout << "SCORE|50" << endl;
    } else {
        cout << "GAME_MESSAGE|Missed!" << endl;
        cout << "SCORE|0" << endl;
    }
    return 0;
}
`,
    tests: [
      { id: "g1", description: "Should render bullet", expectedOutput: "ENTITY\\|bullet\\|projectile\\|295\\|105", isPattern: true },
      { id: "g2", description: "Should show hit message", expectedOutput: "GAME_MESSAGE\\|Direct hit!", isPattern: true },
      { id: "g3", description: "Should award score", expectedOutput: "SCORE\\|50", isPattern: true },
    ],
    hints: [
      "Bullet (295,105,6,6) overlaps enemy (300,100,20,20) — check the math!",
      "Store result: `bool hit = collides(bullet params, enemy params);`",
      "Use `if (hit)` to decide the message.",
    ],
    estimatedMinutes: 8,
  },
};
