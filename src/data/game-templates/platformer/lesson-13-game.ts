import type { GameLessonVariant } from "@/types/game";

export const lesson13Platformer: GameLessonVariant = {
  lessonId: "13-enums",
  instructions: `# Player States — Enum-Driven FSM

## Project: Platformer FSM — Type-Safe State Machine with Enums

**What you're building:** A proper enum-based Finite State Machine where player states are defined as an enum type. This replaces magic numbers and loose strings with compiler-checked values — exactly how professional game engines implement state machines.

## Concept: Enum-Driven FSM

Using an enum for states gives you:
- **Type safety** — the compiler catches invalid states
- **Switch statements** — clean, exhaustive state handling
- **Self-documenting code** — \`PlayerState::JUMPING\` is clearer than \`2\`

\`\`\`
enum PlayerState { IDLE, RUNNING, JUMPING, FALLING };

switch (state) {
    case IDLE:    /* idle behavior */    break;
    case RUNNING: /* running behavior */ break;
    case JUMPING: /* jumping behavior */ break;
    case FALLING: /* falling behavior */ break;
}
\`\`\`

Each case handles one state's behavior — rendering, physics, transitions. This scales to dozens of states without becoming unreadable.

## Your Task

1. Define \`enum PlayerState { IDLE, RUNNING, JUMPING, FALLING };\`
2. Simulate: player starts IDLE, then transitions to JUMPING (a jump was pressed)
3. Use a \`switch\` statement on the current state to:
   - IDLE: set description = "Standing still", vy = 0
   - RUNNING: set description = "Moving forward", vy = 0
   - JUMPING: set description = "Rising upward", vy = -8
   - FALLING: set description = "Falling down", vy = 4
4. Compute playerY = 200 + vy (so 200 + (-8) = 192)
5. Output \`ENTITY|runner|player|50|playerY|16|24\`
6. Output \`ENTITY|ground|platform|0|240|380|20\`
7. Output \`GAME_MESSAGE|State: JUMPING - Rising upward\`
8. Output \`SCORE|0\``,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

// TODO: Define enum PlayerState { IDLE, RUNNING, JUMPING, FALLING };

int main() {
    // TODO: Start in IDLE, then transition to JUMPING

    int vy = 0;
    string description;

    // TODO: Use switch on state to set description and vy
    // IDLE: "Standing still", vy=0
    // RUNNING: "Moving forward", vy=0
    // JUMPING: "Rising upward", vy=-8
    // FALLING: "Falling down", vy=4

    // TODO: Compute playerY = 200 + vy

    // TODO: Output entities, GAME_MESSAGE, SCORE

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

enum PlayerState { IDLE, RUNNING, JUMPING, FALLING };

int main() {
    PlayerState state = IDLE;
    state = JUMPING;

    int vy = 0;
    string description;
    string stateName;

    switch (state) {
        case IDLE:
            stateName = "IDLE";
            description = "Standing still";
            vy = 0;
            break;
        case RUNNING:
            stateName = "RUNNING";
            description = "Moving forward";
            vy = 0;
            break;
        case JUMPING:
            stateName = "JUMPING";
            description = "Rising upward";
            vy = -8;
            break;
        case FALLING:
            stateName = "FALLING";
            description = "Falling down";
            vy = 4;
            break;
    }

    int playerY = 200 + vy;

    cout << "ENTITY|runner|player|50|" << playerY << "|16|24" << endl;
    cout << "ENTITY|ground|platform|0|240|380|20" << endl;
    cout << "GAME_MESSAGE|State: " << stateName << " - " << description << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
  tests: [
    { id: "g1", description: "Should render player at computed Y=192", expectedOutput: "ENTITY\\|runner\\|player\\|50\\|192\\|16\\|24", isPattern: true },
    { id: "g2", description: "Should render ground platform", expectedOutput: "ENTITY\\|ground\\|platform\\|0\\|240\\|380\\|20", isPattern: true },
    { id: "g3", description: "Should show enum state and description", expectedOutput: "GAME_MESSAGE\\|State: JUMPING - Rising upward", isPattern: true },
    { id: "g4", description: "Should show score", expectedOutput: "SCORE\\|0", isPattern: true },
  ],
  hints: [
    "Define the enum outside main: `enum PlayerState { IDLE, RUNNING, JUMPING, FALLING };`",
    "Declare and assign: `PlayerState state = IDLE; state = JUMPING;`",
    "In the JUMPING case: `vy = -8;` so playerY = 200 + (-8) = 192.",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

enum PlayerState { IDLE, RUNNING, JUMPING, FALLING };

int main() {
    PlayerState state = IDLE;
    state = JUMPING;

    int vy = 0;
    string description;
    string stateName;

    switch (state) {
        case IDLE:
            stateName = "IDLE";
            description = "Standing still";
            vy = 0;
            break;
        case RUNNING:
            stateName = "RUNNING";
            description = "Moving forward";
            vy = 0;
            break;
        case JUMPING:
            stateName = "JUMPING";
            description = "Rising upward";
            vy = -8;
            break;
        case FALLING:
            stateName = "FALLING";
            description = "Falling down";
            vy = 4;
            break;
    }

    int playerY = 200 + vy;

    cout << "ENTITY|runner|player|50|" << playerY << "|16|24" << endl;
    cout << "ENTITY|ground|platform|0|240|380|20" << endl;
    cout << "GAME_MESSAGE|State: " << stateName << " - " << description << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
};
