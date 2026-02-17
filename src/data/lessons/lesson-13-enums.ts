import type { Lesson } from "@/types/lesson";

export const lesson13: Lesson = {
  id: "13-enums",
  title: "Enums",
  description: "Define named constants for game states and types.",
  order: 13,
  xpReward: 100,
  tier: "pro",
  concepts: ["enum", "named constants", "game states", "type safety"],
  part1: {
    title: "Concept: Enums",
    type: "concept",
    instructions: `# Enums

An **enum** defines a set of named integer constants. Perfect for game states!

## Defining Enums
\`\`\`cpp
enum GameState {
    MENU,      // 0
    PLAYING,   // 1
    PAUSED,    // 2
    GAME_OVER  // 3
};
\`\`\`

## Using Enums
\`\`\`cpp
GameState state = PLAYING;
if (state == PLAYING) {
    cout << "Game is running!" << endl;
}
\`\`\`

Enums make code readable: \`state == PLAYING\` is clearer than \`state == 1\`.

## Your Task
Define a \`GameState\` enum and use it:

\`\`\`
State: Playing
State value: 1
Is playing: 1
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

// Define GameState enum: MENU, PLAYING, PAUSED, GAME_OVER

int main() {
    // Set state to PLAYING

    // Print state name, value, and check

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

enum GameState {
    MENU,
    PLAYING,
    PAUSED,
    GAME_OVER
};

int main() {
    GameState state = PLAYING;

    cout << "State: Playing" << endl;
    cout << "State value: " << state << endl;
    cout << "Is playing: " << (state == PLAYING) << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Should show enum state info", expectedOutput: "State: Playing\nState value: 1\nIs playing: 1\n" },
    ],
    hints: [
      "Define enum before main: `enum GameState { MENU, PLAYING, PAUSED, GAME_OVER };`",
      "`GameState state = PLAYING;` creates a variable of enum type.",
      "Enums print as integers. PLAYING = 1 (second value, zero-indexed).",
    ],
    estimatedMinutes: 4,
  },
  part2: {
    title: "Game: Game States",
    type: "game_builder",
    instructions: `# Game Builder: State Machine

Every game has states: menu, playing, paused, game over. Let's use an enum to control what gets rendered.

## Your Task
1. Define a \`GameState\` enum
2. Set state to \`PLAYING\`
3. If PLAYING, render entities and score
4. If GAME_OVER, show the game over screen

Since state is PLAYING:

Expected output:
\`\`\`
ENTITY|hero|player|180|200|24|24|100
ENTITY|enemy1|enemy|300|100|20|20|50
SCORE|250
GAME_MESSAGE|Level in progress...
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

// Define GameState enum

int main() {
    // Set game state

    // Render based on state

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

enum GameState {
    MENU,
    PLAYING,
    PAUSED,
    GAME_OVER_STATE
};

int main() {
    GameState state = PLAYING;
    int score = 250;

    if (state == PLAYING) {
        cout << "ENTITY|hero|player|180|200|24|24|100" << endl;
        cout << "ENTITY|enemy1|enemy|300|100|20|20|50" << endl;
        cout << "SCORE|" << score << endl;
        cout << "GAME_MESSAGE|Level in progress..." << endl;
    } else if (state == GAME_OVER_STATE) {
        cout << "GAME_MESSAGE|Game Over!" << endl;
        cout << "GAME_OVER" << endl;
    }

    return 0;
}
`,
    tests: [
      { id: "g1", description: "Should render entities when playing", expectedOutput: "ENTITY\\|hero\\|player\\|180\\|200", isPattern: true },
      { id: "g2", description: "Should show score", expectedOutput: "SCORE\\|250", isPattern: true },
      { id: "g3", description: "Should show level message", expectedOutput: "GAME_MESSAGE\\|Level in progress", isPattern: true },
    ],
    hints: [
      "Name the last value `GAME_OVER_STATE` to avoid conflict with the protocol keyword.",
      "`if (state == PLAYING)` to check current state.",
      "Only render entities when the game is in PLAYING state.",
    ],
    estimatedMinutes: 6,
  },
};
