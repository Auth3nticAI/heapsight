import type { Lesson } from "@/types/lesson";

export const lesson12: Lesson = {
  id: "12-input",
  title: "Input Handling",
  description: "Simulate game controls with variables and conditions.",
  order: 12,
  xpReward: 100,
  tier: "pro",
  concepts: ["input simulation", "game controls", "state variables"],
  part1: {
    title: "Concept: Input",
    type: "concept",
    instructions: `# Input Handling

Real games read keyboard input. Since we can't use \`cin\` interactively here, we'll **simulate** input by using variables as if a key was pressed.

## Simulated Controls
\`\`\`cpp
// Simulate: player pressed "right" and "shoot"
bool pressRight = true;
bool pressShoot = true;

int playerX = 100;
if (pressRight) {
    playerX = playerX + 10;
}
\`\`\`

This is exactly how game engines work — they check input state each frame.

## Your Task
Simulate these inputs: \`pressRight = true\`, \`pressJump = false\`, \`pressShoot = true\`.

Starting at x=100, y=200:
- Right adds 15 to x
- Jump subtracts 50 from y
- Shoot prints a message

\`\`\`
Position: 115, 200
Shot fired!
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    bool pressRight = true;
    bool pressJump = false;
    bool pressShoot = true;

    int playerX = 100;
    int playerY = 200;

    // Apply movement based on input

    // Print position

    // Check if shoot was pressed

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    bool pressRight = true;
    bool pressJump = false;
    bool pressShoot = true;

    int playerX = 100;
    int playerY = 200;

    if (pressRight) playerX = playerX + 15;
    if (pressJump) playerY = playerY - 50;

    cout << "Position: " << playerX << ", " << playerY << endl;

    if (pressShoot) {
        cout << "Shot fired!" << endl;
    }

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Should show position and shot", expectedOutput: "Position: 115, 200\nShot fired!\n" },
    ],
    hints: [
      "`if (pressRight) playerX = playerX + 15;`",
      "Jump doesn't happen because `pressJump` is false.",
      "`if (pressShoot)` — the bool can be used directly as a condition.",
    ],
    estimatedMinutes: 4,
  },
  part2: {
    title: "Game: Controls",
    type: "game_builder",
    instructions: `# Game Builder: Simulated Game Controls

Let's simulate a game frame where the player moves right and fires a projectile.

## Your Task
1. Simulate: player presses right and shoot
2. Player starts at (100, 200), moves right by 20
3. Spawn a projectile at the player's new position
4. Render everything

Expected output:
\`\`\`
ENTITY|hero|player|120|200|24|24|100
ENTITY|bullet1|projectile|144|200|6|6
GAME_MESSAGE|Pew! Projectile launched!
SCORE|0
\`\`\`

Projectile spawns at player x + width (120 + 24 = 144).`,
    starterCode: `#include <iostream>
using namespace std;

int main() {
    bool moveRight = true;
    bool shoot = true;

    int px = 100, py = 200;
    int pw = 24, ph = 24;

    // Apply movement

    // Render player

    // If shoot, spawn projectile at player's right edge

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

int main() {
    bool moveRight = true;
    bool shoot = true;

    int px = 100, py = 200;
    int pw = 24, ph = 24;

    if (moveRight) px = px + 20;

    cout << "ENTITY|hero|player|" << px << "|" << py << "|" << pw << "|" << ph << "|100" << endl;

    if (shoot) {
        int bulletX = px + pw;
        cout << "ENTITY|bullet1|projectile|" << bulletX << "|" << py << "|6|6" << endl;
        cout << "GAME_MESSAGE|Pew! Projectile launched!" << endl;
    }

    cout << "SCORE|0" << endl;
    return 0;
}
`,
    tests: [
      { id: "g1", description: "Player should be at x=120", expectedOutput: "ENTITY\\|hero\\|player\\|120\\|200", isPattern: true },
      { id: "g2", description: "Should spawn projectile", expectedOutput: "ENTITY\\|bullet1\\|projectile\\|144\\|200", isPattern: true },
    ],
    hints: [
      "`if (moveRight) px = px + 20;` moves the player.",
      "Bullet x position = player x + player width: `px + pw`",
      "Only spawn the bullet if `shoot` is true.",
    ],
    estimatedMinutes: 6,
  },
};
