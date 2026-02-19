import type { GameLessonVariant } from "@/types/game";

export const lesson12Platformer: GameLessonVariant = {
  lessonId: "12-extract-components-header",
  instructions: `# Input Buffering — Responsive Controls

## Project: Platformer FSM — Input-Driven State Machine

**What you're building:** An input processing system that reads simulated button presses and translates them into player movement and state transitions. In real game loops, input is always processed FIRST, before physics and rendering.

## Concept: Input as First Step

Every game loop follows this order:
1. **Read Input** — check which buttons are pressed
2. **Update State** — apply movement, physics, transitions
3. **Render** — output the scene

\`\`\`
bool pressLeft = false, pressRight = true, pressJump = false;
// Step 1: read input (simulated above)
// Step 2: apply movement based on input
if (pressRight) vx = moveSpeed;
// Step 3: determine state and render
\`\`\`

## Your Task

1. Simulate input: \`pressLeft = false\`, \`pressRight = true\`, \`pressJump = true\`
2. Start with: playerX=50, playerY=200, vx=0, vy=0, moveSpeed=5, jumpForce=10, onGround=true
3. Process input:
   - If pressLeft: vx = -moveSpeed
   - If pressRight: vx = moveSpeed
   - If pressJump AND onGround: vy = -jumpForce, onGround = false
4. Apply movement: playerX += vx, playerY += vy
5. Determine state using FSM logic (same as lesson 08)
6. Output \`ENTITY|runner|player|playerX|playerY|16|24\`
7. Output \`ENTITY|ground|platform|0|240|380|20\`
8. Output \`GAME_MESSAGE|Input: RIGHT+JUMP | State: jumping\`
9. Output \`SCORE|0\``,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    // Simulated input
    bool pressLeft = false;
    bool pressRight = true;
    bool pressJump = true;

    int playerX = 50;
    int playerY = 200;
    int vx = 0;
    int vy = 0;
    int moveSpeed = 5;
    int jumpForce = 10;
    bool onGround = true;

    // TODO: Process input — set vx and vy based on button presses
    // pressLeft -> vx = -moveSpeed
    // pressRight -> vx = moveSpeed
    // pressJump && onGround -> vy = -jumpForce, onGround = false

    // TODO: Apply movement
    // playerX += vx; playerY += vy;

    // TODO: Determine state string (idle/running/jumping/falling)

    // TODO: Output entities, GAME_MESSAGE, SCORE

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    // Simulated input
    bool pressLeft = false;
    bool pressRight = true;
    bool pressJump = true;

    int playerX = 50;
    int playerY = 200;
    int vx = 0;
    int vy = 0;
    int moveSpeed = 5;
    int jumpForce = 10;
    bool onGround = true;

    // Process input
    if (pressLeft) vx = -moveSpeed;
    if (pressRight) vx = moveSpeed;
    if (pressJump && onGround) {
        vy = -jumpForce;
        onGround = false;
    }

    // Apply movement
    playerX += vx;
    playerY += vy;

    // Determine state
    string state;
    if (!onGround && vy < 0) {
        state = "jumping";
    } else if (!onGround && vy >= 0) {
        state = "falling";
    } else if (onGround && vx != 0) {
        state = "running";
    } else {
        state = "idle";
    }

    cout << "ENTITY|runner|player|" << playerX << "|" << playerY << "|16|24" << endl;
    cout << "ENTITY|ground|platform|0|240|380|20" << endl;
    cout << "GAME_MESSAGE|Input: RIGHT+JUMP | State: " << state << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
  tests: [
    { id: "g1", description: "Should render player at (55, 190)", expectedOutput: "ENTITY\\|runner\\|player\\|55\\|190\\|16\\|24", isPattern: true },
    { id: "g2", description: "Should render ground", expectedOutput: "ENTITY\\|ground\\|platform\\|0\\|240\\|380\\|20", isPattern: true },
    { id: "g3", description: "Should show input and state", expectedOutput: "GAME_MESSAGE\\|Input: RIGHT\\+JUMP \\| State: jumping", isPattern: true },
    { id: "g4", description: "Should show score", expectedOutput: "SCORE\\|0", isPattern: true },
  ],
  hints: [
    "Process input first: `if (pressRight) vx = moveSpeed;` then apply: `playerX += vx;`",
    "Jump sets vy negative AND sets onGround to false: `vy = -jumpForce; onGround = false;`",
    "After input: vx=5, vy=-10. After movement: playerX=55, playerY=190. State: jumping.",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    // Simulated input
    bool pressLeft = false;
    bool pressRight = true;
    bool pressJump = true;

    int playerX = 50;
    int playerY = 200;
    int vx = 0;
    int vy = 0;
    int moveSpeed = 5;
    int jumpForce = 10;
    bool onGround = true;

    // Process input
    if (pressLeft) vx = -moveSpeed;
    if (pressRight) vx = moveSpeed;
    if (pressJump && onGround) {
        vy = -jumpForce;
        onGround = false;
    }

    // Apply movement
    playerX += vx;
    playerY += vy;

    // Determine state
    string state;
    if (!onGround && vy < 0) {
        state = "jumping";
    } else if (!onGround && vy >= 0) {
        state = "falling";
    } else if (onGround && vx != 0) {
        state = "running";
    } else {
        state = "idle";
    }

    cout << "ENTITY|runner|player|" << playerX << "|" << playerY << "|16|24" << endl;
    cout << "ENTITY|ground|platform|0|240|380|20" << endl;
    cout << "GAME_MESSAGE|Input: RIGHT+JUMP | State: " << state << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
};
