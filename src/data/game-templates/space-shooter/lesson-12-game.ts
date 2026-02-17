import type { GameLessonVariant } from "@/types/game";

export const lesson12SpaceShooter: GameLessonVariant = {
  lessonId: "12-input",
  instructions: `# Input System — Component-Driven Controls

## Project: Space Shooter ECS — Simulated Input Processing

**What you're building:** An input system that reads boolean input flags and translates them into component mutations — moving the player and spawning a bullet entity.

## ECS Concept: Input as a System

In ECS, input handling is just another system. It reads **input components** (flags/state) and modifies **position/velocity components**:

\`\`\`
// Input system pseudocode:
if (moveLeft)  playerX -= speed;
if (moveRight) playerX += speed;
if (fire)      spawnBullet(playerX, playerY);
\`\`\`

The input system doesn't know about keyboards or gamepads — it just reads boolean component data. A separate system translates hardware input into those booleans. This **decoupling** is a core ECS principle.

## Your Task

1. Create player components: posX=180, posY=220, health=100, width=24, height=24
2. Set movement speed to 15
3. Simulate input with bool flags: moveLeft=false, moveRight=true, fire=true
4. **Input system:** If moveLeft, subtract speed from posX. If moveRight, add speed to posX.
5. The player should move right to posX=195
6. Render the player entity (id="ship", type="player")
7. **Fire system:** If fire is true, spawn a bullet at (playerX + 10, playerY - 20) with width=4, height=10, health=0
8. Render the bullet entity (id="bullet0", type="bullet")
9. Output \`GAME_MESSAGE|Engines: right | Weapons: fired!\`
10. Output \`SCORE|0\``,
  starterCode: `#include <iostream>
using namespace std;

int main() {
    // Player components
    int playerX = 180;
    int playerY = 220;
    int playerHP = 100;
    int speed = 15;

    // Simulated input flags
    bool moveLeft = false;
    bool moveRight = true;
    bool fire = true;

    // TODO: Input system - update playerX based on input flags
    // If moveLeft: playerX -= speed
    // If moveRight: playerX += speed

    // TODO: Render player entity
    // ENTITY|ship|player|playerX|playerY|24|24|playerHP

    // TODO: Fire system - if fire is true, spawn bullet
    // Bullet at (playerX + 10, playerY - 20), size 4x10
    // ENTITY|bullet0|bullet|bulletX|bulletY|4|10|0

    // TODO: Output GAME_MESSAGE and SCORE

    return 0;
}
`,
  solutionCode: `#include <iostream>
using namespace std;

int main() {
    // Player components
    int playerX = 180;
    int playerY = 220;
    int playerHP = 100;
    int speed = 15;

    // Simulated input flags
    bool moveLeft = false;
    bool moveRight = true;
    bool fire = true;

    // Input system: update position based on flags
    if (moveLeft) playerX -= speed;
    if (moveRight) playerX += speed;

    // Render player
    cout << "ENTITY|ship|player|" << playerX << "|" << playerY
         << "|24|24|" << playerHP << endl;

    // Fire system: spawn bullet if firing
    if (fire) {
        int bulletX = playerX + 10;
        int bulletY = playerY - 20;
        cout << "ENTITY|bullet0|bullet|" << bulletX << "|" << bulletY
             << "|4|10|0" << endl;
    }

    cout << "GAME_MESSAGE|Engines: right | Weapons: fired!" << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
  tests: [
    { id: "g1", description: "Player should be at x=195 after moving right", expectedOutput: "ENTITY\\|ship\\|player\\|195\\|220\\|24\\|24\\|100", isPattern: true },
    { id: "g2", description: "Bullet should spawn at (205, 200)", expectedOutput: "ENTITY\\|bullet0\\|bullet\\|205\\|200\\|4\\|10\\|0", isPattern: true },
    { id: "g3", description: "Should show input status message", expectedOutput: "GAME_MESSAGE\\|Engines: right \\| Weapons: fired!", isPattern: true },
    { id: "g4", description: "Should show score", expectedOutput: "SCORE\\|0", isPattern: true },
  ],
  hints: [
    "Use `if (moveRight) playerX += speed;` — simple boolean check modifies the component.",
    "The bullet position is relative to the player: `playerX + 10` and `playerY - 20`.",
    "Remember: after moveRight, playerX is 195, so bulletX = 195 + 10 = 205.",
  ],
  accumulatedCode: `#include <iostream>
using namespace std;

int main() {
    // Player components
    int playerX = 180;
    int playerY = 220;
    int playerHP = 100;
    int speed = 15;

    // Simulated input flags
    bool moveLeft = false;
    bool moveRight = true;
    bool fire = true;

    // Input system: update position based on flags
    if (moveLeft) playerX -= speed;
    if (moveRight) playerX += speed;

    // Render player
    cout << "ENTITY|ship|player|" << playerX << "|" << playerY
         << "|24|24|" << playerHP << endl;

    // Fire system: spawn bullet if firing
    if (fire) {
        int bulletX = playerX + 10;
        int bulletY = playerY - 20;
        cout << "ENTITY|bullet0|bullet|" << bulletX << "|" << bulletY
             << "|4|10|0" << endl;
    }

    cout << "GAME_MESSAGE|Engines: right | Weapons: fired!" << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
};
