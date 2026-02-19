import type { Lesson } from "@/types/lesson";

export const lesson48: Lesson = {
  id: "48-input-system",
  title: "Input System",
  description: "Build an input system that processes WASD and space commands.",
  order: 48,
  xpReward: 175,
  tier: "pro",
  concepts: ["input handling", "command pattern", "input buffer", "action mapping"],
  part1: {
    title: "Concept: Input Abstraction",
    type: "concept",
    instructions: `# Input Abstraction — Raw Keys Are Not Actions

Your game logic should never see a raw key. It should see an action. \\\`w\\\` is not \\\`w\\\`. It is \\\`MOVE_UP\\\`. The difference matters. Raw keys couple your game to a specific keyboard layout. Actions decouple input from behavior. Rebinding keys becomes a table lookup, not a code rewrite.

## What Breaks Without This

Without input abstraction, every system that cares about player intent must check raw characters. Movement checks \\\`w\\\`. Shooting checks \\\`space\\\`. Menu checks \\\`escape\\\`. Changing the fire key from space to \\\`f\\\` means hunting through every system. Add gamepad support and you double every check. The code does not scale.

## The Fix

One function maps raw input to actions. A switch or lookup table: \\\`'w'\\\` returns \\\`MOVE_UP\\\`, \\\`'s'\\\` returns \\\`MOVE_DOWN\\\`, \\\`'a'\\\` returns \\\`MOVE_LEFT\\\`, \\\`'d'\\\` returns \\\`MOVE_RIGHT\\\`, \\\`' '\\\` returns \\\`FIRE\\\`. Everything else returns \\\`NONE\\\`. Game systems only see the action enum. The mapping lives in one place.

## Your Task

1. Define an enum for actions: \\\`NONE\\\`, \\\`MOVE_UP\\\`, \\\`MOVE_DOWN\\\`, \\\`MOVE_LEFT\\\`, \\\`MOVE_RIGHT\\\`, \\\`FIRE\\\`
2. Write \\\`mapInput(char c)\\\` that returns the action for a given character
3. Define a string of 10 inputs: \\\`"ww dswa  d"\\\` (spaces are fire commands)
4. Process each character through \\\`mapInput\\\`
5. For each input, print: \\\`INPUT|<char>|action|<ACTION_NAME>\\\`
   - Use the display char: \\\`w\\\`, \\\`a\\\`, \\\`s\\\`, \\\`d\\\` for movement, \\\`SPACE\\\` for \\\`' '\\\`
6. Count moves vs fires
7. Print: \\\`INPUT_SUMMARY|total|10|moves|7|fires|3\\\`

Expected output:
\\\`\\\`\\\`
INPUT|w|action|MOVE_UP
INPUT|w|action|MOVE_UP
INPUT|SPACE|action|FIRE
INPUT|d|action|MOVE_RIGHT
INPUT|s|action|MOVE_DOWN
INPUT|w|action|MOVE_UP
INPUT|a|action|MOVE_LEFT
INPUT|SPACE|action|FIRE
INPUT|SPACE|action|FIRE
INPUT|d|action|MOVE_RIGHT
INPUT_SUMMARY|total|10|moves|7|fires|3
\\\`\\\`\\\`

## Beginner Trap

**Common Mistake:** Comparing chars with double quotes. In C++, \\\`'w'\\\` is a char literal (single quotes). \\\`"w"\\\` is a string literal. If you write \\\`if (c == "w")\\\` the compiler will not do what you expect. Always use single quotes for char comparisons.

## Elite Insight

Professional engines buffer inputs per frame and process them in batch. This prevents input from arriving mid-physics-step and corrupting state. The input system reads hardware once, stores actions in a queue, and the game loop drains the queue at a defined point in the frame. Deterministic replay depends on this separation.

## Cross-Path Echo

Command pattern in software engineering is the same idea. Instead of calling functions directly, you create command objects. Undo/redo systems, macro recording, network replication — all built on the same abstraction: capture intent as data, execute it later.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

enum Action { NONE, MOVE_UP, MOVE_DOWN, MOVE_LEFT, MOVE_RIGHT, FIRE };

// TODO: Write mapInput(char c) that returns an Action
//       'w' -> MOVE_UP, 's' -> MOVE_DOWN, 'a' -> MOVE_LEFT,
//       'd' -> MOVE_RIGHT, ' ' -> FIRE, else -> NONE

// TODO: Write actionName(Action a) that returns a string
//       MOVE_UP -> "MOVE_UP", FIRE -> "FIRE", etc.

int main() {
    string inputs = "ww dswa  d";

    int moves = 0;
    int fires = 0;

    // TODO: Process each character in inputs
    //   Map to action via mapInput
    //   Print INPUT|<displayChar>|action|<actionName>
    //   Display char: use "SPACE" for ' ', else the char itself
    //   Count moves (UP/DOWN/LEFT/RIGHT) and fires

    // TODO: Print INPUT_SUMMARY|total|10|moves|<m>|fires|<f>

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

enum Action { NONE, MOVE_UP, MOVE_DOWN, MOVE_LEFT, MOVE_RIGHT, FIRE };

Action mapInput(char c) {
    switch (c) {
        case 'w': return MOVE_UP;
        case 's': return MOVE_DOWN;
        case 'a': return MOVE_LEFT;
        case 'd': return MOVE_RIGHT;
        case ' ': return FIRE;
        default: return NONE;
    }
}

string actionName(Action a) {
    switch (a) {
        case MOVE_UP: return "MOVE_UP";
        case MOVE_DOWN: return "MOVE_DOWN";
        case MOVE_LEFT: return "MOVE_LEFT";
        case MOVE_RIGHT: return "MOVE_RIGHT";
        case FIRE: return "FIRE";
        default: return "NONE";
    }
}

int main() {
    string inputs = "ww dswa  d";

    int moves = 0;
    int fires = 0;

    for (int i = 0; i < (int)inputs.size(); i++) {
        Action a = mapInput(inputs[i]);
        string displayChar = (inputs[i] == ' ') ? "SPACE" : string(1, inputs[i]);
        cout << "INPUT|" << displayChar << "|action|" << actionName(a) << endl;
        if (a == FIRE) fires++;
        else if (a != NONE) moves++;
    }

    cout << "INPUT_SUMMARY|total|" << (int)inputs.size()
         << "|moves|" << moves << "|fires|" << fires << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "First input maps w to MOVE_UP", expectedOutput: "INPUT|w|action|MOVE_UP" },
      { id: "t2", description: "Space maps to FIRE", expectedOutput: "INPUT|SPACE|action|FIRE" },
      { id: "t3", description: "Should map d to MOVE_RIGHT", expectedOutput: "INPUT|d|action|MOVE_RIGHT" },
      { id: "t4", description: "Should map a to MOVE_LEFT", expectedOutput: "INPUT|a|action|MOVE_LEFT" },
      { id: "t5", description: "Summary shows correct counts", expectedOutput: "INPUT_SUMMARY|total|10|moves|7|fires|3" },
    ],
    hints: [
      "Use a switch statement in mapInput. Each case returns the matching Action enum value. The default case returns NONE.",
      "To display the character, check if it is a space first: `string displayChar = (inputs[i] == ' ') ? \"SPACE\" : string(1, inputs[i]);`",
      "Count moves by checking if the action is not NONE and not FIRE. Any movement action (UP, DOWN, LEFT, RIGHT) counts as a move.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Game: Input System Pipeline",
    type: "game_builder",
    instructions: `# Game Builder: Input System Pipeline

Build an input system that maps raw keystrokes to game actions and applies them to the player entity. The input system reads a string of characters, maps each to an action, and mutates game state. This is the bridge between the player and the simulation.

## Your Task
1. Define Action enum: NONE, MOVE_UP, MOVE_DOWN, MOVE_LEFT, MOVE_RIGHT, FIRE
2. Write \\\`mapInput(char c)\\\` — maps w/a/s/d/space to actions
3. Player entity: x=180, y=300
4. Bullet pool: 10 slots, track bullet count with nextBullet index
5. Input string (8 chars): \\\`"wwd  w d"\\\` — simulates 8 keystrokes
6. Process each input:
   - MOVE_UP: player y -= 4
   - MOVE_DOWN: player y += 4
   - MOVE_LEFT: player x -= 4
   - MOVE_RIGHT: player x += 4
   - FIRE: spawn bullet at player position, name it \\\`bullet_<n>\\\`
7. For movement inputs print: \\\`INPUT|<char>|action|<ACTION>|player_pos|<x>,<y>\\\`
8. For fire inputs print: \\\`INPUT| |action|FIRE|bullet_spawned|bullet_<n>|at|<x>,<y>\\\`
9. After all inputs: \\\`INPUT_SUMMARY|moves|<m>|fires|<f>|player_final|<x>,<y>\\\`

## Beginner Trap

**Common Mistake:** Forgetting to update position BEFORE printing. The print line should show the position after the move, not before. Apply the velocity first, then print the result.

## Elite Insight

Input buffering prevents lost inputs. If the player presses fire during a physics step, the input is queued and processed next frame. Without buffering, fast typists lose inputs between frames. At 60 FPS you have 16ms per frame — a fast typist can press two keys in that window.

## Cross-Path Echo

Network protocols buffer packets the same way. TCP receives bytes into a buffer, the application reads from the buffer at its own pace. The producer (network) and consumer (application) are decoupled by the queue. Input systems are the same pattern: hardware produces, game loop consumes.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

enum Action { NONE, MOVE_UP, MOVE_DOWN, MOVE_LEFT, MOVE_RIGHT, FIRE };

// TODO: Write mapInput(char c)

// TODO: Write actionName(Action a)

int main() {
    int playerX = 180;
    int playerY = 300;

    const int MAX_BULLETS = 10;
    int bulletX[MAX_BULLETS];
    int bulletY[MAX_BULLETS];
    bool bulletAlive[MAX_BULLETS];
    int nextBullet = 0;

    for (int i = 0; i < MAX_BULLETS; i++) bulletAlive[i] = false;

    string inputs = "wwd  w d";

    int moves = 0;
    int fires = 0;

    // TODO: Process each input character
    //   Map to action
    //   Apply movement or spawn bullet
    //   Print INPUT line with appropriate format

    // TODO: Print INPUT_SUMMARY

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

enum Action { NONE, MOVE_UP, MOVE_DOWN, MOVE_LEFT, MOVE_RIGHT, FIRE };

Action mapInput(char c) {
    switch (c) {
        case 'w': return MOVE_UP;
        case 's': return MOVE_DOWN;
        case 'a': return MOVE_LEFT;
        case 'd': return MOVE_RIGHT;
        case ' ': return FIRE;
        default: return NONE;
    }
}

string actionName(Action a) {
    switch (a) {
        case MOVE_UP: return "MOVE_UP";
        case MOVE_DOWN: return "MOVE_DOWN";
        case MOVE_LEFT: return "MOVE_LEFT";
        case MOVE_RIGHT: return "MOVE_RIGHT";
        case FIRE: return "FIRE";
        default: return "NONE";
    }
}

int main() {
    int playerX = 180;
    int playerY = 300;

    const int MAX_BULLETS = 10;
    int bulletX[MAX_BULLETS];
    int bulletY[MAX_BULLETS];
    bool bulletAlive[MAX_BULLETS];
    int nextBullet = 0;

    for (int i = 0; i < MAX_BULLETS; i++) bulletAlive[i] = false;

    string inputs = "wwd  w d";

    int moves = 0;
    int fires = 0;

    for (int i = 0; i < (int)inputs.size(); i++) {
        Action a = mapInput(inputs[i]);
        if (a == MOVE_UP) { playerY -= 4; moves++; }
        else if (a == MOVE_DOWN) { playerY += 4; moves++; }
        else if (a == MOVE_LEFT) { playerX -= 4; moves++; }
        else if (a == MOVE_RIGHT) { playerX += 4; moves++; }
        else if (a == FIRE) { fires++; }

        if (a != FIRE && a != NONE) {
            string displayChar = string(1, inputs[i]);
            cout << "INPUT|" << displayChar << "|action|" << actionName(a)
                 << "|player_pos|" << playerX << "," << playerY << endl;
        } else if (a == FIRE) {
            bulletX[nextBullet] = playerX;
            bulletY[nextBullet] = playerY;
            bulletAlive[nextBullet] = true;
            cout << "INPUT| |action|FIRE|bullet_spawned|bullet_" << nextBullet
                 << "|at|" << playerX << "," << playerY << endl;
            nextBullet++;
        }
    }

    cout << "INPUT_SUMMARY|moves|" << moves << "|fires|" << fires
         << "|player_final|" << playerX << "," << playerY << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "First w input moves player up", expectedOutput: "INPUT\\|w\\|action\\|MOVE_UP\\|player_pos\\|180,296", isPattern: true },
      { id: "t2", description: "Second w input continues movement", expectedOutput: "INPUT\\|w\\|action\\|MOVE_UP\\|player_pos\\|180,292", isPattern: true },
      { id: "t3", description: "d input moves player right", expectedOutput: "INPUT\\|d\\|action\\|MOVE_RIGHT\\|player_pos\\|\\d+,\\d+", isPattern: true },
      { id: "t4", description: "Space input spawns bullet", expectedOutput: "INPUT\\| \\|action\\|FIRE\\|bullet_spawned\\|bullet_\\d+\\|at\\|\\d+,\\d+", isPattern: true },
      { id: "t5", description: "Summary shows correct move and fire counts", expectedOutput: "INPUT_SUMMARY\\|moves\\|\\d+\\|fires\\|\\d+\\|player_final\\|\\d+,\\d+", isPattern: true },
    ],
    hints: [
      "Process inputs left to right. 'w','w','d',' ',' ','w',' ','d' — that is 5 moves and 3 fires, but count carefully: spaces are fires, letters are moves.",
      "Apply movement before printing. Player starts at (180,300). First 'w' subtracts 4 from y, making it (180,296). Print the new position.",
      "For FIRE, spawn the bullet at the player's current position, then increment nextBullet. The bullet index is nextBullet before incrementing.",
    ],
    estimatedMinutes: 8,
  },
};
