import type { GameLessonVariant } from "@/types/game";

export const lesson08Platformer: GameLessonVariant = {
  lessonId: "08-combat-rules",
  instructions: `# State Transitions — Player State Machine

## Project: Platformer FSM — Core State Logic

**What you're building:** The foundation of a Finite State Machine (FSM) for the player character. Using if/else chains, you'll determine the player's current state based on velocity and ground contact — exactly how real platformers work.

## Concept: Finite State Machine

A player can only be in ONE state at a time:
- **idle** — on ground, not moving horizontally
- **running** — on ground, moving horizontally
- **jumping** — in air, moving upward (vy < 0)
- **falling** — in air, moving downward (vy >= 0)

\`\`\`
if (!onGround && vy < 0)       → jumping
else if (!onGround && vy >= 0)  → falling
else if (onGround && vx != 0)   → running
else                             → idle
\`\`\`

The order matters! Air states are checked first because they override ground states.

## Your Task

1. Given: \`double vx = 0; double vy = -5.0; bool onGround = false;\` (player just jumped)
2. Use if/else to determine the state string: "idle", "running", "jumping", or "falling"
3. Output the player: \`ENTITY|runner|player|50|180|16|24\`
4. Output the ground: \`ENTITY|ground|platform|0|240|380|20\`
5. Output \`GAME_MESSAGE|State: jumping\`
6. Output \`SCORE|0\``,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    double vx = 0;
    double vy = -5.0;
    bool onGround = false;

    string state;

    // TODO: Use if/else to determine state
    // Check air states first (not onGround), then ground states
    // jumping: in air, vy < 0
    // falling: in air, vy >= 0
    // running: on ground, vx != 0
    // idle: on ground, vx == 0

    // TODO: Output player entity, ground, GAME_MESSAGE with state, SCORE

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    double vx = 0;
    double vy = -5.0;
    bool onGround = false;

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

    cout << "ENTITY|runner|player|50|180|16|24" << endl;
    cout << "ENTITY|ground|platform|0|240|380|20" << endl;
    cout << "GAME_MESSAGE|State: " << state << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
  tests: [
    { id: "g1", description: "Should render player entity", expectedOutput: "ENTITY\\|runner\\|player\\|50\\|180\\|16\\|24", isPattern: true },
    { id: "g2", description: "Should render ground platform", expectedOutput: "ENTITY\\|ground\\|platform\\|0\\|240\\|380\\|20", isPattern: true },
    { id: "g3", description: "Should display jumping state", expectedOutput: "GAME_MESSAGE\\|State: jumping", isPattern: true },
    { id: "g4", description: "Should show score", expectedOutput: "SCORE\\|0", isPattern: true },
  ],
  hints: [
    "Check air states first: `if (!onGround && vy < 0)` means jumping.",
    "The else-if chain: `!onGround && vy >= 0` is falling, `onGround && vx != 0` is running, else idle.",
    "With vy = -5.0 and onGround = false, the state should be \"jumping\".",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

int main() {
    double vx = 0;
    double vy = -5.0;
    bool onGround = false;

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

    cout << "ENTITY|runner|player|50|180|16|24" << endl;
    cout << "ENTITY|ground|platform|0|240|380|20" << endl;
    cout << "GAME_MESSAGE|State: " << state << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
};
