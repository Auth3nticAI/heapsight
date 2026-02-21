import { Lesson } from "@/types/lesson";

export const lessonRPG02: Lesson = {
  id: "rpg-02-player-intent",
  title: "Player Intent System",
  description: "WASD sets a pending intent variable, not direct movement. Pressing a key declares intent; the player does not move yet.",
  order: 2,
  xpReward: 50,
  tier: "free",
  concepts: ["intent vs action", "input handling", "pipeline separation", "state representation"],
  part1: {
    title: "Concept: Intent vs Action",
    type: "concept",
    instructions: `# Player Intent System

## Mental Model
Input is not movement. When the player presses a key, you don't move them. You record their INTENT to move. The movement happens later, in a separate phase. This separation is the foundation of every deterministic game pipeline: input → intent → resolve → apply.

In a platformer, pressing RIGHT instantly changes velocity. In an RPG, pressing RIGHT queues a MOVE_RIGHT command. Then the command resolution pass decides if the move succeeds. That separation is the most important idea in this path.

## What Breaks Without This
If pressing a key directly modifies player_x, you can't validate the move before it happens. What if the target tile is a wall? You've already moved there. Now you have to undo it. What if you want to replay the game from a log? You can't — input and state mutation are tangled together. Determinism requires separation.

## The Fix: Intent Variables
\`\`\`cpp
const int INTENT_NONE = 0;
const int INTENT_UP = 1;
const int INTENT_DOWN = 2;
const int INTENT_LEFT = 3;
const int INTENT_RIGHT = 4;
int pending_intent = INTENT_NONE;
\`\`\`

The \`intentName()\` function converts the integer intent to a human-readable string. This is a data-to-string mapper — the same pattern you'll use for item names, enemy types, and quest states later.

## Key Concepts
- Intent is data, not action: a variable that records what the player WANTS to do
- Setting intent does NOT change player position
- \`intentName()\` maps integer constants to display strings
- The pipeline: input → intent → (resolve comes next lesson)

## Beginner Trap
**Moving the player inside the input handler.** Writing \`if (input == \'d\') player_x++\` skips the entire pipeline. You can't validate, can't log, can't replay. The whole point is: input ONLY writes to \`pending_intent\`. Movement happens elsewhere.

## Elite Insight
Baldur's Gate 3 uses a command queue. Click a tile → MOVE command queued. Click an enemy → ATTACK command queued. The resolution pass checks line of sight, action points, opportunity attacks — THEN applies. Your \`pending_intent\` is the same idea, simplified to one command at a time.

## Systems Thinking Connection
This intent pattern is the RPG equivalent of a ROS2 action goal. The robot's navigation stack receives a "go to position X" goal — it doesn't teleport. It plans a path, executes it, and reports progress. Your intent → resolve pipeline follows the same structure.

## Your Task
Define the intent constants and \`intentName()\` function. Simulate setting intent from a character input. Show that the player position does NOT change.

Expected output:
\`\`\`
Intent: NONE
Input: d
Intent: MOVE_RIGHT
Player: (5, 5) -- NOT MOVED
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

int player_x = 5, player_y = 5;

const int INTENT_NONE = 0;
const int INTENT_UP = 1;
const int INTENT_DOWN = 2;
const int INTENT_LEFT = 3;
const int INTENT_RIGHT = 4;
int pending_intent = INTENT_NONE;

// TODO: Write intentName() function
// Returns "MOVE_UP", "MOVE_DOWN", "MOVE_LEFT", "MOVE_RIGHT", or "NONE"

int main() {
    // TODO: Print the initial intent (should be NONE)

    char input = 'd';
    cout << "Input: " << input << endl;

    // TODO: Set pending_intent based on input character
    // w=UP, s=DOWN, a=LEFT, d=RIGHT

    // TODO: Print the intent after input

    // TODO: Print player position showing it has NOT changed

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int player_x = 5, player_y = 5;

const int INTENT_NONE = 0;
const int INTENT_UP = 1;
const int INTENT_DOWN = 2;
const int INTENT_LEFT = 3;
const int INTENT_RIGHT = 4;
int pending_intent = INTENT_NONE;

const char* intentName(int intent) {
    switch(intent) {
        case INTENT_UP: return "MOVE_UP";
        case INTENT_DOWN: return "MOVE_DOWN";
        case INTENT_LEFT: return "MOVE_LEFT";
        case INTENT_RIGHT: return "MOVE_RIGHT";
        default: return "NONE";
    }
}

int main() {
    cout << "Intent: " << intentName(pending_intent) << endl;

    char input = 'd';
    cout << "Input: " << input << endl;

    if (input == 'w') pending_intent = INTENT_UP;
    else if (input == 's') pending_intent = INTENT_DOWN;
    else if (input == 'a') pending_intent = INTENT_LEFT;
    else if (input == 'd') pending_intent = INTENT_RIGHT;

    cout << "Intent: " << intentName(pending_intent) << endl;
    cout << "Player: (" << player_x << ", " << player_y << ") -- NOT MOVED" << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Initial intent is NONE", expectedOutput: "Intent: NONE", isPattern: false },
      { id: "t2", description: "Intent after d key", expectedOutput: "Intent: MOVE_RIGHT", isPattern: false },
      { id: "t3", description: "Player did not move", expectedOutput: "Player: (5, 5) -- NOT MOVED", isPattern: false },
    ],
    hints: [
      "intentName() uses a switch statement on the intent value. Return a string literal for each case.",
      "Use if/else if to map the input character to the correct INTENT constant.",
      "Print \"Intent: \" << intentName(pending_intent) both before and after setting the intent.",
    ],
    estimatedMinutes: 8
  },
  part2: {
    title: "Build: Player Intent System",
    type: "game_builder",
    instructions: `# Build: Player Intent System

## Mental Model
Your dungeon grid is rendered. Now add the first layer of the command pipeline: input → intent. WASD keys set \`pending_intent\`, but the player does NOT move. The HUD displays the current intent so you can see the system working.

## What Breaks Without This
If input directly moves the player, you can't add wall collision later without rewriting the input handler. You can't replay inputs. You can't queue multiple commands. The intent system is the foundation that every future system builds on.

## The Fix: IsKeyPressed to Intent
Raylib's \`IsKeyPressed()\` fires once per key press (not every frame the key is held). Map each key to an intent constant:
\`\`\`cpp
if (IsKeyPressed(KEY_W)) pending_intent = INTENT_UP;
else if (IsKeyPressed(KEY_S)) pending_intent = INTENT_DOWN;
\`\`\`

## Key Concepts
- IsKeyPressed fires once per press (not held)
- Reset intent to NONE each frame before reading input
- HUD shows current intent via DrawText + TextFormat
- Player position does NOT change this lesson

## Your Task
Add intent constants, the intentName() function, and WASD input handling. Display the current intent on the HUD. The player should NOT move.

Expected cout output:
\`\`\`
Player: (5, 5)
Intent system: ACTIVE
Keys: WASD
\`\`\`

## Beginner Trap
**Using IsKeyDown instead of IsKeyPressed.** IsKeyDown fires every frame the key is held, which would queue dozens of intents per second. IsKeyPressed fires once per press — one press, one intent, one turn. Turn-based games need discrete input.

## Elite Insight
Nethack maps each keypress to a command enum (CMD_MOVE_N, CMD_MOVE_S, etc.). The input handler ONLY writes to the command variable. The main loop reads the command and decides what happens. Your pending_intent follows the exact same pattern.

## Mastery Check
Question: Why reset pending_intent to NONE at the start of each frame?
Answer: Without the reset, a key pressed in frame 10 would still show as the intent in frame 100. The intent should only be active for the frame it was pressed. No input = no intent.`,
    starterCode: `#include <iostream>
#include "raylib.h"
using namespace std;

const int GRID_W = 12;
const int GRID_H = 10;
const int TILE = 32;
int tiles[GRID_H][GRID_W];
int player_x = 5, player_y = 5;

// TODO: Define intent constants
// INTENT_NONE=0, INTENT_UP=1, INTENT_DOWN=2, INTENT_LEFT=3, INTENT_RIGHT=4
// int pending_intent = INTENT_NONE;

// TODO: Write intentName(int intent) function
// Returns "MOVE_UP", "MOVE_DOWN", "MOVE_LEFT", "MOVE_RIGHT", or "NONE"

void initTiles() {
    for (int y = 0; y < GRID_H; y++) {
        for (int x = 0; x < GRID_W; x++) {
            if (y == 0 || y == GRID_H - 1 || x == 0 || x == GRID_W - 1)
                tiles[y][x] = 1;
            else
                tiles[y][x] = 0;
        }
    }
    tiles[3][4] = 1;
    tiles[3][5] = 1;
    tiles[6][7] = 1;
    tiles[6][8] = 1;
}

int main() {
    InitWindow(640, 640, "HeapSight RPG");
    SetTargetFPS(60);

    initTiles();

    cout << "Player: (" << player_x << ", " << player_y << ")" << endl;
    cout << "Intent system: ACTIVE" << endl;
    cout << "Keys: WASD" << endl;

    while (!WindowShouldClose()) {
        // TODO: Reset pending_intent to INTENT_NONE
        // TODO: Read WASD using IsKeyPressed, set pending_intent

        BeginDrawing();
        ClearBackground(BLACK);

        for (int y = 0; y < GRID_H; y++) {
            for (int x = 0; x < GRID_W; x++) {
                Color c = (tiles[y][x] == 1) ? GRAY : DARKGRAY;
                DrawRectangle(x * TILE, y * TILE, TILE - 1, TILE - 1, c);
            }
        }
        DrawRectangle(player_x * TILE, player_y * TILE, TILE - 1, TILE - 1, GREEN);

        DrawText("HeapSight RPG", 400, 10, 20, WHITE);
        // TODO: DrawText showing current intent using TextFormat
        // TODO: DrawText showing player position

        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    solutionCode: `#include <iostream>
#include "raylib.h"
using namespace std;

const int GRID_W = 12;
const int GRID_H = 10;
const int TILE = 32;
int tiles[GRID_H][GRID_W];
int player_x = 5, player_y = 5;

const int INTENT_NONE = 0;
const int INTENT_UP = 1;
const int INTENT_DOWN = 2;
const int INTENT_LEFT = 3;
const int INTENT_RIGHT = 4;
int pending_intent = INTENT_NONE;

const char* intentName(int intent) {
    switch(intent) {
        case INTENT_UP: return "MOVE_UP";
        case INTENT_DOWN: return "MOVE_DOWN";
        case INTENT_LEFT: return "MOVE_LEFT";
        case INTENT_RIGHT: return "MOVE_RIGHT";
        default: return "NONE";
    }
}

void initTiles() {
    for (int y = 0; y < GRID_H; y++) {
        for (int x = 0; x < GRID_W; x++) {
            if (y == 0 || y == GRID_H - 1 || x == 0 || x == GRID_W - 1)
                tiles[y][x] = 1;
            else
                tiles[y][x] = 0;
        }
    }
    tiles[3][4] = 1;
    tiles[3][5] = 1;
    tiles[6][7] = 1;
    tiles[6][8] = 1;
}

int main() {
    InitWindow(640, 640, "HeapSight RPG");
    SetTargetFPS(60);

    initTiles();

    cout << "Player: (" << player_x << ", " << player_y << ")" << endl;
    cout << "Intent system: ACTIVE" << endl;
    cout << "Keys: WASD" << endl;

    while (!WindowShouldClose()) {
        pending_intent = INTENT_NONE;
        if (IsKeyPressed(KEY_W)) pending_intent = INTENT_UP;
        else if (IsKeyPressed(KEY_S)) pending_intent = INTENT_DOWN;
        else if (IsKeyPressed(KEY_A)) pending_intent = INTENT_LEFT;
        else if (IsKeyPressed(KEY_D)) pending_intent = INTENT_RIGHT;

        BeginDrawing();
        ClearBackground(BLACK);

        for (int y = 0; y < GRID_H; y++) {
            for (int x = 0; x < GRID_W; x++) {
                Color c = (tiles[y][x] == 1) ? GRAY : DARKGRAY;
                DrawRectangle(x * TILE, y * TILE, TILE - 1, TILE - 1, c);
            }
        }
        DrawRectangle(player_x * TILE, player_y * TILE, TILE - 1, TILE - 1, GREEN);

        DrawText("HeapSight RPG", 400, 10, 20, WHITE);
        DrawText(TextFormat("Intent: %s", intentName(pending_intent)), 400, 40, 16, WHITE);
        DrawText(TextFormat("Player: (%d, %d)", player_x, player_y), 400, 60, 16, WHITE);

        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Prints player position", expectedOutput: "Player: (5, 5)", isPattern: false },
      { id: "g2", description: "Intent system active", expectedOutput: "Intent system: ACTIVE", isPattern: false },
      { id: "g3", description: "Keys displayed", expectedOutput: "Keys: WASD", isPattern: false },
    ],
    hints: [
      "Define the 5 intent constants (INTENT_NONE through INTENT_RIGHT) and pending_intent at file scope.",
      "In the game loop, reset pending_intent = INTENT_NONE first, then check IsKeyPressed for each WASD key.",
      "Use DrawText(TextFormat(\"Intent: %s\", intentName(pending_intent)), 400, 40, 16, WHITE) on the HUD.",
    ],
    estimatedMinutes: 12
  }
};
