import type { Lesson } from "@/types/lesson";

export const lesson16: Lesson = {
  id: "16-game-loop",
  title: "Game Loop",
  description: "Simulate a game loop with while and frame counting.",
  order: 16,
  xpReward: 125,
  tier: "pro",
  concepts: ["game loop", "frame counter", "update cycle", "while loop"],
  part1: {
    title: "Concept: Game Loop",
    type: "concept",
    instructions: `# The Game Loop

Every game runs a **loop**: update state, render, repeat. We'll simulate this with a frame counter.

## Basic Game Loop
\`\`\`cpp
int frame = 0;
while (frame < 5) {
    // Update game state
    // Render
    frame++;
}
\`\`\`

Real games run 60 frames per second. We'll simulate a few frames.

## Your Task
Simulate 3 frames of a game loop. Each frame, an enemy moves 10 pixels right starting from x=50.

\`\`\`
Frame 0: x=50
Frame 1: x=60
Frame 2: x=70
Done: 3 frames
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int enemyX = 50;
    int frame = 0;

    // Game loop: 3 frames

    // Print done message

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    int enemyX = 50;
    int frame = 0;

    while (frame < 3) {
        cout << "Frame " << frame << ": x=" << enemyX << endl;
        enemyX = enemyX + 10;
        frame++;
    }

    cout << "Done: " << frame << " frames" << endl;
    return 0;
}
`,
    tests: [
      { id: "t1", description: "Should simulate 3 frames", expectedOutput: "Frame 0: x=50\nFrame 1: x=60\nFrame 2: x=70\nDone: 3 frames\n" },
    ],
    hints: [
      "`while (frame < 3)` runs for frames 0, 1, 2.",
      "Print THEN update: show current x, then `enemyX = enemyX + 10;`",
      "Don't forget `frame++;` or it loops forever!",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Game: Frame Simulation",
    type: "game_builder",
    instructions: `# Game Builder: Simulated Game Frames

Let's simulate 3 game frames where an enemy moves toward the player. We'll output the final frame's state.

## Your Task
1. Player at x=180 (fixed)
2. Enemy starts at x=320, moves left by 30 each frame
3. After 3 frames, enemy is at 320 - 90 = 230
4. Render the final state

Expected output:
\`\`\`
ENTITY|hero|player|180|200|24|24|100
ENTITY|enemy1|enemy|230|100|20|20|80
GAME_MESSAGE|After 3 frames: Enemy at x=230
SCORE|0
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int playerX = 180;
    int enemyX = 320;
    int frame = 0;

    // Simulate 3 frames — enemy moves left by 30 each

    // Render final state

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    int playerX = 180;
    int enemyX = 320;
    int frame = 0;

    while (frame < 3) {
        enemyX = enemyX - 30;
        frame++;
    }

    cout << "ENTITY|hero|player|" << playerX << "|200|24|24|100" << endl;
    cout << "ENTITY|enemy1|enemy|" << enemyX << "|100|20|20|80" << endl;
    cout << "GAME_MESSAGE|After " << frame << " frames: Enemy at x=" << enemyX << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
    tests: [
      { id: "g1", description: "Enemy should be at x=230", expectedOutput: "ENTITY\\|enemy1\\|enemy\\|230\\|100", isPattern: true },
      { id: "g2", description: "Should show frame count message", expectedOutput: "GAME_MESSAGE\\|After 3 frames: Enemy at x=230", isPattern: true },
    ],
    hints: [
      "Each frame: `enemyX = enemyX - 30;`",
      "After 3 frames: 320 - 30 - 30 - 30 = 230.",
      "Render AFTER the loop to show the final state.",
    ],
    estimatedMinutes: 6,
  },
};
