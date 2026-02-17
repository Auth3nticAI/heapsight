import type { GameLessonVariant } from "@/types/game";

export const lesson09Platformer: GameLessonVariant = {
  lessonId: "09-references",
  instructions: `# Physics Tuning — Velocity by Reference

## Project: Platformer FSM — Reference-Based Physics

**What you're building:** Physics functions that modify velocity directly through references. Game developers pass physics parameters by reference so that functions like \`applyGravity\` and \`applyJump\` can tune player movement without returning values.

## Concept: Physics by Reference

In a real game loop, each frame calls physics functions that mutate velocity in place:

\`\`\`
void applyGravity(double& vy, double gravity) {
    vy += gravity;  // directly modifies the caller's vy
}
\`\`\`

By passing \`vy\` by reference, the game loop stays clean — just call the function and the velocity is updated. No return values needed.

## Your Task

1. Write \`void applyGravity(double& vy, double gravity)\` — adds gravity to vy
2. Write \`void applyJump(double& vy, double jumpForce)\` — sets vy to -jumpForce (upward)
3. Simulate this sequence:
   - Start: vy = 0, gravity = 2.0, jumpForce = 10.0
   - Call applyJump (vy becomes -10)
   - Call applyGravity 3 times (vy becomes -8, -6, -4)
4. Compute playerY = 200 + (int)vy (so 200 + (-4) = 196)
5. Output \`ENTITY|runner|player|50|196|16|24\`
6. Output \`ENTITY|ground|platform|0|240|380|20\`
7. Output \`GAME_MESSAGE|vy after 3 frames: -4\`
8. Output \`SCORE|0\``,
  starterCode: `#include <iostream>
using namespace std;

// TODO: Write applyGravity(double& vy, double gravity)
// Adds gravity to vy

// TODO: Write applyJump(double& vy, double jumpForce)
// Sets vy to -jumpForce (negative = upward)

int main() {
    double vy = 0;
    double gravity = 2.0;
    double jumpForce = 10.0;

    // TODO: Apply jump, then 3 frames of gravity
    // TODO: Calculate playerY = 200 + (int)vy
    // TODO: Output entities, GAME_MESSAGE with vy, SCORE

    return 0;
}
`,
  solutionCode: `#include <iostream>
using namespace std;

void applyGravity(double& vy, double gravity) {
    vy += gravity;
}

void applyJump(double& vy, double jumpForce) {
    vy = -jumpForce;
}

int main() {
    double vy = 0;
    double gravity = 2.0;
    double jumpForce = 10.0;

    applyJump(vy, jumpForce);

    applyGravity(vy, gravity);
    applyGravity(vy, gravity);
    applyGravity(vy, gravity);

    int playerY = 200 + (int)vy;

    cout << "ENTITY|runner|player|50|" << playerY << "|16|24" << endl;
    cout << "ENTITY|ground|platform|0|240|380|20" << endl;
    cout << "GAME_MESSAGE|vy after 3 frames: " << (int)vy << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
  tests: [
    { id: "g1", description: "Should render player at computed Y=196", expectedOutput: "ENTITY\\|runner\\|player\\|50\\|196\\|16\\|24", isPattern: true },
    { id: "g2", description: "Should render ground platform", expectedOutput: "ENTITY\\|ground\\|platform\\|0\\|240\\|380\\|20", isPattern: true },
    { id: "g3", description: "Should display vy after 3 frames", expectedOutput: "GAME_MESSAGE\\|vy after 3 frames: -4", isPattern: true },
    { id: "g4", description: "Should show score", expectedOutput: "SCORE\\|0", isPattern: true },
  ],
  hints: [
    "applyGravity adds: `vy += gravity;` — the `&` means it modifies the original.",
    "applyJump sets: `vy = -jumpForce;` — negative means upward in screen coordinates.",
    "After jump: vy=-10. After 3x gravity(+2): -10+2=-8, -8+2=-6, -6+2=-4. playerY = 200+(-4) = 196.",
  ],
  accumulatedCode: `#include <iostream>
using namespace std;

void applyGravity(double& vy, double gravity) {
    vy += gravity;
}

void applyJump(double& vy, double jumpForce) {
    vy = -jumpForce;
}

int main() {
    double vy = 0;
    double gravity = 2.0;
    double jumpForce = 10.0;

    applyJump(vy, jumpForce);

    applyGravity(vy, gravity);
    applyGravity(vy, gravity);
    applyGravity(vy, gravity);

    int playerY = 200 + (int)vy;

    cout << "ENTITY|runner|player|50|" << playerY << "|16|24" << endl;
    cout << "ENTITY|ground|platform|0|240|380|20" << endl;
    cout << "GAME_MESSAGE|vy after 3 frames: " << (int)vy << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
};
