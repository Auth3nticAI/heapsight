import { Lesson } from "@/types/lesson";

export const lessonRPG03: Lesson = {
  id: "rpg-03-command-resolution",
  title: "Command Resolution",
  description: "resolveCommand() converts intent into position change. The player actually moves now — intent becomes action.",
  order: 3,
  xpReward: 50,
  tier: "free",
  concepts: ["command resolution", "intent to action", "position update", "pipeline flow"],
  part1: {
    title: "Concept: Intent to Action",
    type: "concept",
    instructions: `# Command Resolution

## Mental Model
Intent is queued. Now it must be resolved. \`resolveCommand()\` reads \`pending_intent\`, computes the new position, applies it, and resets the intent. This is the second stage of the pipeline: input → intent → **resolve** → apply. The intent variable is consumed — after resolution, it returns to NONE.

## What Breaks Without This
Without a resolution function, you either move directly in the input handler (mixing input and state mutation) or you never move at all. The resolution function is the single point where intent becomes action. Every future system — collision, combat, AI — hooks into this point.

## The Fix: resolveCommand()
\`\`\`cpp
void resolveCommand() {
    if (pending_intent == INTENT_NONE) return;
    int new_x = player_x;
    int new_y = player_y;
    if (pending_intent == INTENT_UP) new_y--;
    else if (pending_intent == INTENT_DOWN) new_y++;
    else if (pending_intent == INTENT_LEFT) new_x--;
    else if (pending_intent == INTENT_RIGHT) new_x++;
    player_x = new_x;
    player_y = new_y;
    pending_intent = INTENT_NONE;
}
\`\`\`

The function is simple on purpose. It does ONE thing: convert intent to movement. No collision checks yet — that comes next lesson. Right now, the player can walk through walls. That's a deliberate design choice: get movement working first, add constraints second.

## Key Concepts
- Resolution is a function, not inline code: isolates the intent-to-action logic
- Compute new position BEFORE applying: \`new_x\`/\`new_y\` are candidates, not committed
- Reset intent after resolution: each intent is consumed exactly once
- Print the resolution for debugging: shows what happened and where

## Beginner Trap
**Modifying player_x/player_y directly without computing new_x/new_y first.** If you write \`player_x++\` directly, you can't check the destination before moving. Computing \`new_x\` first lets you validate the target tile (next lesson) before committing.

## Elite Insight
Every ECS (Entity Component System) game engine has a "system" that processes movement intents. Unity's CharacterController.Move() computes the destination, checks collisions, then applies. Your resolveCommand() is the same pattern — compute, validate, apply.

## Your Task
Write \`resolveCommand()\` that converts intent into movement. Simulate two commands (RIGHT then DOWN) and print the resolution trace.

Expected output:
\`\`\`
Start: (5, 5)
Resolve: MOVE_RIGHT -> (6, 5)
Player: (6, 5)
Resolve: MOVE_DOWN -> (6, 6)
Player: (6, 6)
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

const char* intentName(int intent) {
    switch(intent) {
        case INTENT_UP: return "MOVE_UP";
        case INTENT_DOWN: return "MOVE_DOWN";
        case INTENT_LEFT: return "MOVE_LEFT";
        case INTENT_RIGHT: return "MOVE_RIGHT";
        default: return "NONE";
    }
}

// TODO: Write resolveCommand() function
// If pending_intent != INTENT_NONE:
//   1. Compute new_x and new_y based on intent direction
//   2. Print: "Resolve: MOVE_RIGHT -> (6, 5)" using intentName()
//   3. Apply: player_x = new_x, player_y = new_y
//   4. Reset pending_intent = INTENT_NONE

int main() {
    cout << "Start: (" << player_x << ", " << player_y << ")" << endl;

    pending_intent = INTENT_RIGHT;
    // TODO: Call resolveCommand()
    cout << "Player: (" << player_x << ", " << player_y << ")" << endl;

    pending_intent = INTENT_DOWN;
    // TODO: Call resolveCommand()
    cout << "Player: (" << player_x << ", " << player_y << ")" << endl;

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

void resolveCommand() {
    if (pending_intent == INTENT_NONE) return;
    int new_x = player_x;
    int new_y = player_y;
    if (pending_intent == INTENT_UP) new_y--;
    else if (pending_intent == INTENT_DOWN) new_y++;
    else if (pending_intent == INTENT_LEFT) new_x--;
    else if (pending_intent == INTENT_RIGHT) new_x++;
    cout << "Resolve: " << intentName(pending_intent) << " -> (" << new_x << ", " << new_y << ")" << endl;
    player_x = new_x;
    player_y = new_y;
    pending_intent = INTENT_NONE;
}

int main() {
    cout << "Start: (" << player_x << ", " << player_y << ")" << endl;

    pending_intent = INTENT_RIGHT;
    resolveCommand();
    cout << "Player: (" << player_x << ", " << player_y << ")" << endl;

    pending_intent = INTENT_DOWN;
    resolveCommand();
    cout << "Player: (" << player_x << ", " << player_y << ")" << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Prints start position", expectedOutput: "Start: (5, 5)", isPattern: false },
      { id: "t2", description: "Resolves MOVE_RIGHT", expectedOutput: "Resolve: MOVE_RIGHT -> (6, 5)", isPattern: false },
      { id: "t3", description: "Player at (6, 5) after right", expectedOutput: "Player: (6, 5)", isPattern: false },
      { id: "t4", description: "Resolves MOVE_DOWN", expectedOutput: "Resolve: MOVE_DOWN -> (6, 6)", isPattern: false },
    ],
    hints: [
      "resolveCommand() should check if pending_intent == INTENT_NONE first and return early if so.",
      "Compute new_x and new_y by copying player_x/player_y, then adjusting based on intent direction.",
      "Print the resolve line BEFORE applying the new position. Use intentName() for the direction string.",
    ],
    estimatedMinutes: 8
  },
  part2: {
    title: "Build: Command Resolution",
    type: "game_builder",
    instructions: `# Build: Command Resolution

## Mental Model
Your intent system captures WASD input. Now add the resolution step: \`resolveCommand()\` reads the pending intent, computes the new position, and moves the player. After this lesson, pressing WASD will visually move the GREEN player square across the dungeon grid.

## What Breaks Without This
Without resolution, the intent system is just a display. The HUD shows "MOVE_RIGHT" but nothing happens. The resolution function connects intent to state mutation — it's the bridge between "player wants to move" and "player has moved."

## The Fix: resolveCommand() in the Game Loop
After reading input (setting \`pending_intent\`), call \`resolveCommand()\`. The function:
1. Checks if intent is NONE (skip if so)
2. Computes new_x/new_y based on intent direction
3. Applies: \`player_x = new_x\`, \`player_y = new_y\`
4. Resets \`pending_intent = INTENT_NONE\`

No collision checks yet — the player can walk through walls. That's intentional. Get movement working first, add constraints next lesson.

## Key Concepts
- resolveCommand() is called AFTER input, BEFORE rendering
- New position is computed first, then applied
- Intent is consumed (reset to NONE) after resolution
- Player visually moves because the render loop reads updated player_x/player_y

## Your Task
Add the \`resolveCommand()\` function and call it in the game loop after input reading. The player should move when WASD is pressed.

Expected cout output:
\`\`\`
Player: (5, 5)
Command resolution: ACTIVE
\`\`\`

## Beginner Trap
**Calling resolveCommand() AFTER BeginDrawing().** The resolution must happen before rendering so the player's new position is drawn this frame. If you resolve after BeginDrawing, the player renders at the old position and appears to lag one frame behind input.

## Elite Insight
The order Input → Resolve → Render is the standard game loop pattern. Unity calls it Update() then LateUpdate() then OnRenderObject(). Unreal calls it PlayerInput then Tick then Draw. The names differ, the order is universal.

## Mastery Check
Question: Why does resolveCommand() reset pending_intent to NONE?
Answer: Without the reset, the same intent would be resolved again next frame. One keypress should produce one move. The intent is consumed on use.`,
    starterCode: `#include <iostream>
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

// TODO: Write resolveCommand() function
// If pending_intent != INTENT_NONE:
//   1. Compute new_x and new_y based on intent direction
//   2. Apply: player_x = new_x, player_y = new_y
//   3. Reset pending_intent = INTENT_NONE

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
    cout << "Command resolution: ACTIVE" << endl;

    while (!WindowShouldClose()) {
        pending_intent = INTENT_NONE;
        if (IsKeyPressed(KEY_W)) pending_intent = INTENT_UP;
        else if (IsKeyPressed(KEY_S)) pending_intent = INTENT_DOWN;
        else if (IsKeyPressed(KEY_A)) pending_intent = INTENT_LEFT;
        else if (IsKeyPressed(KEY_D)) pending_intent = INTENT_RIGHT;

        // TODO: Call resolveCommand() here

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

void resolveCommand() {
    if (pending_intent == INTENT_NONE) return;
    int new_x = player_x;
    int new_y = player_y;
    if (pending_intent == INTENT_UP) new_y--;
    else if (pending_intent == INTENT_DOWN) new_y++;
    else if (pending_intent == INTENT_LEFT) new_x--;
    else if (pending_intent == INTENT_RIGHT) new_x++;
    player_x = new_x;
    player_y = new_y;
    pending_intent = INTENT_NONE;
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
    cout << "Command resolution: ACTIVE" << endl;

    while (!WindowShouldClose()) {
        pending_intent = INTENT_NONE;
        if (IsKeyPressed(KEY_W)) pending_intent = INTENT_UP;
        else if (IsKeyPressed(KEY_S)) pending_intent = INTENT_DOWN;
        else if (IsKeyPressed(KEY_A)) pending_intent = INTENT_LEFT;
        else if (IsKeyPressed(KEY_D)) pending_intent = INTENT_RIGHT;

        resolveCommand();

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
      { id: "g2", description: "Command resolution active", expectedOutput: "Command resolution: ACTIVE", isPattern: false },
    ],
    hints: [
      "resolveCommand() checks pending_intent, computes new_x/new_y, applies, and resets intent to NONE.",
      "Call resolveCommand() AFTER reading WASD input but BEFORE BeginDrawing().",
      "The player moves because the render loop reads the updated player_x/player_y values each frame.",
    ],
    estimatedMinutes: 12
  }
};
