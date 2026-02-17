import type { GameLessonVariant } from "@/types/game";

export const lesson11Platformer: GameLessonVariant = {
  lessonId: "11-strings",
  instructions: `# State Names — String-Based State Display

## Project: Platformer FSM — String State Representation

**What you're building:** A debug display system that converts numeric state values to human-readable string names. Every game engine has a debug overlay that shows the current FSM state — this is how you build one.

## Concept: State-to-String Mapping

FSM states are stored as integers (fast for the CPU), but humans need readable names for debugging:

\`\`\`
// State constants
const int IDLE = 0, RUNNING = 1, JUMPING = 2, FALLING = 3;

string getStateName(int state) {
    if (state == IDLE) return "IDLE";
    // ...
}
\`\`\`

This pattern — mapping numeric states to string names — appears everywhere in game development: AI states, animation states, menu states, and more.

## Your Task

1. Define state constants: IDLE=0, RUNNING=1, JUMPING=2, FALLING=3
2. Write \`string getStateName(int state)\` that returns the uppercase name for each state, or "UNKNOWN" for invalid values
3. Simulate a state sequence: start IDLE, transition to RUNNING, then JUMPING
4. Output the player: \`ENTITY|runner|player|50|180|16|24\`
5. Output the ground: \`ENTITY|ground|platform|0|240|380|20\`
6. Output \`GAME_MESSAGE|IDLE -> RUNNING -> JUMPING\`
7. Output \`GAME_MESSAGE|Current: JUMPING\`
8. Output \`SCORE|0\``,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

const int IDLE = 0;
const int RUNNING = 1;
const int JUMPING = 2;
const int FALLING = 3;

// TODO: Write string getStateName(int state)
// Return "IDLE", "RUNNING", "JUMPING", "FALLING", or "UNKNOWN"

int main() {
    // TODO: Start in IDLE, transition to RUNNING, then JUMPING
    // Build a transition string: "IDLE -> RUNNING -> JUMPING"

    // TODO: Output player entity, ground, GAME_MESSAGE lines, SCORE

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

const int IDLE = 0;
const int RUNNING = 1;
const int JUMPING = 2;
const int FALLING = 3;

string getStateName(int state) {
    if (state == IDLE) return "IDLE";
    if (state == RUNNING) return "RUNNING";
    if (state == JUMPING) return "JUMPING";
    if (state == FALLING) return "FALLING";
    return "UNKNOWN";
}

int main() {
    int state = IDLE;
    string history = getStateName(state);

    state = RUNNING;
    history += " -> " + getStateName(state);

    state = JUMPING;
    history += " -> " + getStateName(state);

    cout << "ENTITY|runner|player|50|180|16|24" << endl;
    cout << "ENTITY|ground|platform|0|240|380|20" << endl;
    cout << "GAME_MESSAGE|" << history << endl;
    cout << "GAME_MESSAGE|Current: " << getStateName(state) << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
  tests: [
    { id: "g1", description: "Should render player entity", expectedOutput: "ENTITY\\|runner\\|player\\|50\\|180\\|16\\|24", isPattern: true },
    { id: "g2", description: "Should render ground", expectedOutput: "ENTITY\\|ground\\|platform\\|0\\|240\\|380\\|20", isPattern: true },
    { id: "g3", description: "Should show state transition history", expectedOutput: "GAME_MESSAGE\\|IDLE -> RUNNING -> JUMPING", isPattern: true },
    { id: "g4", description: "Should show current state", expectedOutput: "GAME_MESSAGE\\|Current: JUMPING", isPattern: true },
    { id: "g5", description: "Should show score", expectedOutput: "SCORE\\|0", isPattern: true },
  ],
  hints: [
    "Use if-chains in getStateName: `if (state == IDLE) return \"IDLE\";`",
    "Build the history string with `+=`: `history += \" -> \" + getStateName(state);`",
    "Remember to call getStateName() for the GAME_MESSAGE output too.",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

const int IDLE = 0;
const int RUNNING = 1;
const int JUMPING = 2;
const int FALLING = 3;

string getStateName(int state) {
    if (state == IDLE) return "IDLE";
    if (state == RUNNING) return "RUNNING";
    if (state == JUMPING) return "JUMPING";
    if (state == FALLING) return "FALLING";
    return "UNKNOWN";
}

int main() {
    int state = IDLE;
    string history = getStateName(state);

    state = RUNNING;
    history += " -> " + getStateName(state);

    state = JUMPING;
    history += " -> " + getStateName(state);

    cout << "ENTITY|runner|player|50|180|16|24" << endl;
    cout << "ENTITY|ground|platform|0|240|380|20" << endl;
    cout << "GAME_MESSAGE|" << history << endl;
    cout << "GAME_MESSAGE|Current: " << getStateName(state) << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
};
