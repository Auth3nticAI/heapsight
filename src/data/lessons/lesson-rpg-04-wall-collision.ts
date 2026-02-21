import { Lesson } from "@/types/lesson";

export const lessonRPG04: Lesson = {
  id: "rpg-04-wall-collision",
  title: "Wall Collision",
  description: "resolveCommand() checks the destination tile before moving. Walls block movement — collision as command rejection.",
  order: 4,
  xpReward: 50,
  tier: "free",
  concepts: ["collision detection", "command rejection", "bounds checking", "tile lookup"],
  part1: {
    title: "Concept: Collision as Command Rejection",
    type: "concept",
    instructions: `# Wall Collision

## Mental Model
Movement is no longer guaranteed. Before applying a move, \`resolveCommand()\` checks the destination tile. If it's a wall or out of bounds, the command is rejected — the player stays in place. This is collision as command rejection: the intent exists, the resolution says "no."

## What Breaks Without This
Without collision, the player walks through walls. They can walk off the edge of the grid, accessing \`tiles[-1][5]\` — undefined memory. The game crashes or produces garbage. Collision isn't cosmetic; it's a safety check that prevents out-of-bounds array access.

## The Fix: Check Before Apply
\`\`\`cpp
void resolveCommand() {
    if (pending_intent == INTENT_NONE) return;
    int new_x = player_x, new_y = player_y;
    // ... compute new_x/new_y from intent ...
    if (new_x < 0 || new_x >= GRID_W || new_y < 0 || new_y >= GRID_H) {
        // BLOCKED: out of bounds
    } else if (tiles[new_y][new_x] == 1) {
        // BLOCKED: wall
    } else {
        player_x = new_x;
        player_y = new_y;
    }
    pending_intent = INTENT_NONE;
}
\`\`\`

The check order matters: bounds first, then wall. If you check \`tiles[new_y][new_x]\` when new_y is -1, you access memory outside the array. Always validate indices before using them to index an array.

## Key Concepts
- Bounds check first: is the destination inside the grid?
- Wall check second: is the destination tile a wall (value 1)?
- Only apply movement if BOTH checks pass
- The player position is unchanged on rejection

## Beginner Trap
**Checking walls before bounds.** If the player is at x=0 and presses LEFT, new_x becomes -1. If you check \`tiles[new_y][-1]\` before checking bounds, you read garbage memory. C++ won't warn you — it just silently reads whatever is at that address. Bounds check MUST come first.

## Elite Insight
Doom's collision system rejects movement commands that would place the player inside a wall. The BSP tree determines "can the player be at this position?" If no, the move is rejected. Your \`tiles[new_y][new_x] == 1\` check is the same concept — a spatial query that gates movement.

## Systems Thinking Connection
This bounds-then-content check pattern appears everywhere: array bounds before array access, null check before dereference, permission check before file write. In robotics, the planner checks if a waypoint is in free space BEFORE commanding the motors. Always validate before acting.

## Your Task
Modify \`resolveCommand()\` to check bounds and walls before applying movement. Start the player at (1, 1) adjacent to walls. Simulate three moves: UP (blocked by wall), RIGHT (succeeds), DOWN (succeeds).

Expected output:
\`\`\`
Start: (1, 1)
Resolve: MOVE_UP -> BLOCKED (wall)
Resolve: MOVE_RIGHT -> (2, 1)
Player: (2, 1)
Resolve: MOVE_DOWN -> (2, 2)
Player: (2, 2)
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

const int GRID_W = 12;
const int GRID_H = 10;
int tiles[GRID_H][GRID_W];
int player_x = 1, player_y = 1;

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

void resolveCommand() {
    if (pending_intent == INTENT_NONE) return;
    int new_x = player_x;
    int new_y = player_y;
    if (pending_intent == INTENT_UP) new_y--;
    else if (pending_intent == INTENT_DOWN) new_y++;
    else if (pending_intent == INTENT_LEFT) new_x--;
    else if (pending_intent == INTENT_RIGHT) new_x++;

    // TODO: Add bounds check
    // If new_x < 0 or >= GRID_W or new_y < 0 or >= GRID_H -> print BLOCKED (bounds)

    // TODO: Add wall check
    // If tiles[new_y][new_x] == 1 -> print BLOCKED (wall)

    // TODO: If both checks pass, print resolve info and apply movement
    // Otherwise just reset intent

    pending_intent = INTENT_NONE;
}

int main() {
    initTiles();

    cout << "Start: (" << player_x << ", " << player_y << ")" << endl;

    pending_intent = INTENT_UP;
    resolveCommand();

    pending_intent = INTENT_RIGHT;
    resolveCommand();
    cout << "Player: (" << player_x << ", " << player_y << ")" << endl;

    pending_intent = INTENT_DOWN;
    resolveCommand();
    cout << "Player: (" << player_x << ", " << player_y << ")" << endl;

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int GRID_W = 12;
const int GRID_H = 10;
int tiles[GRID_H][GRID_W];
int player_x = 1, player_y = 1;

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

void resolveCommand() {
    if (pending_intent == INTENT_NONE) return;
    int new_x = player_x;
    int new_y = player_y;
    if (pending_intent == INTENT_UP) new_y--;
    else if (pending_intent == INTENT_DOWN) new_y++;
    else if (pending_intent == INTENT_LEFT) new_x--;
    else if (pending_intent == INTENT_RIGHT) new_x++;

    if (new_x < 0 || new_x >= GRID_W || new_y < 0 || new_y >= GRID_H) {
        cout << "Resolve: " << intentName(pending_intent) << " -> BLOCKED (bounds)" << endl;
    } else if (tiles[new_y][new_x] == 1) {
        cout << "Resolve: " << intentName(pending_intent) << " -> BLOCKED (wall)" << endl;
    } else {
        cout << "Resolve: " << intentName(pending_intent) << " -> (" << new_x << ", " << new_y << ")" << endl;
        player_x = new_x;
        player_y = new_y;
    }
    pending_intent = INTENT_NONE;
}

int main() {
    initTiles();

    cout << "Start: (" << player_x << ", " << player_y << ")" << endl;

    pending_intent = INTENT_UP;
    resolveCommand();

    pending_intent = INTENT_RIGHT;
    resolveCommand();
    cout << "Player: (" << player_x << ", " << player_y << ")" << endl;

    pending_intent = INTENT_DOWN;
    resolveCommand();
    cout << "Player: (" << player_x << ", " << player_y << ")" << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Prints start position", expectedOutput: "Start: (1, 1)", isPattern: false },
      { id: "t2", description: "Wall blocks movement", expectedOutput: "BLOCKED (wall)", isPattern: false },
      { id: "t3", description: "Resolves MOVE_RIGHT", expectedOutput: "Resolve: MOVE_RIGHT -> (2, 1)", isPattern: false },
      { id: "t4", description: "Player reaches (2, 2)", expectedOutput: "Player: (2, 2)", isPattern: false },
    ],
    hints: [
      "Check bounds first: if new_x < 0 || new_x >= GRID_W || new_y < 0 || new_y >= GRID_H, print BLOCKED (bounds).",
      "Check walls second: if tiles[new_y][new_x] == 1, print BLOCKED (wall). Only check AFTER bounds are valid.",
      "Only apply player_x = new_x, player_y = new_y when BOTH checks pass.",
    ],
    estimatedMinutes: 10
  },
  part2: {
    title: "Build: Wall Collision",
    type: "game_builder",
    instructions: `# Build: Wall Collision

## Mental Model
Your player moves freely on the grid. Now add the constraint: walls block movement. \`resolveCommand()\` checks \`tiles[new_y][new_x]\` before applying the move. If the destination is a wall or out of bounds, the command is rejected. The player bumps into walls visually — the GREEN square stays in place.

## What Breaks Without This
Without collision, the player walks through the GRAY wall tiles. The grid is decorative, not functional. Collision makes the grid real — the data in \`tiles[][]\` now governs gameplay. The walls are no longer just pixels; they are rules.

## The Fix: Guard Clauses in resolveCommand()
Before \`player_x = new_x\`, add two checks:
1. **Bounds check**: Is \`new_x/new_y\` inside the grid? (prevents array out-of-bounds)
2. **Wall check**: Is \`tiles[new_y][new_x] == 1\`? (prevents walking into walls)

If either check fails, skip the assignment. The player stays in place.

## Key Concepts
- Bounds check prevents undefined memory access
- Wall check uses the same tile data the renderer reads
- Rejection is silent in the game (player just doesn't move)
- The grid is now both visual AND functional

## Your Task
Modify \`resolveCommand()\` to check bounds and wall tiles before applying movement. Count the walls and print the total. The player should be unable to walk through GRAY wall tiles.

Expected cout output:
\`\`\`
Player: (5, 5)
Wall collision: ACTIVE
Walls: 44
\`\`\`

## Beginner Trap
**Forgetting the bounds check.** If you only check \`tiles[new_y][new_x] == 1\` without checking bounds first, the player at x=0 pressing LEFT reads \`tiles[y][-1]\` — undefined behavior. The bounds check is a safety net for the wall check.

## Elite Insight
Minecraft checks block solidity before allowing player movement. The block data (stone, air, water) determines collision properties. Your \`tiles[y][x] == 1\` is the same lookup — tile data drives collision rules. Later lessons can add more tile types (doors, pits, water) with different collision behaviors.

## Mastery Check
Question: Why check bounds before walls?
Answer: If the destination is outside the grid, \`tiles[new_y][new_x]\` accesses memory outside the array. The bounds check prevents undefined behavior. Always validate array indices before using them.`,
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

void resolveCommand() {
    if (pending_intent == INTENT_NONE) return;
    int new_x = player_x;
    int new_y = player_y;
    if (pending_intent == INTENT_UP) new_y--;
    else if (pending_intent == INTENT_DOWN) new_y++;
    else if (pending_intent == INTENT_LEFT) new_x--;
    else if (pending_intent == INTENT_RIGHT) new_x++;

    // TODO: Add bounds check
    // If new_x < 0 or >= GRID_W or new_y < 0 or >= GRID_H -> reject move (return early)

    // TODO: Add wall check
    // If tiles[new_y][new_x] == 1 -> reject move (return early)

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

    // TODO: Count walls in the grid and print "Walls: 44"
    cout << "Player: (" << player_x << ", " << player_y << ")" << endl;
    cout << "Wall collision: ACTIVE" << endl;

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

    if (new_x < 0 || new_x >= GRID_W || new_y < 0 || new_y >= GRID_H) {
        pending_intent = INTENT_NONE;
        return;
    }
    if (tiles[new_y][new_x] == 1) {
        pending_intent = INTENT_NONE;
        return;
    }

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

    int wall_count = 0;
    for (int y = 0; y < GRID_H; y++)
        for (int x = 0; x < GRID_W; x++)
            if (tiles[y][x] == 1) wall_count++;

    cout << "Player: (" << player_x << ", " << player_y << ")" << endl;
    cout << "Wall collision: ACTIVE" << endl;
    cout << "Walls: " << wall_count << endl;

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
        DrawText(TextFormat("Walls: %d", wall_count), 400, 80, 16, WHITE);

        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Prints player position", expectedOutput: "Player: (5, 5)", isPattern: false },
      { id: "g2", description: "Wall collision active", expectedOutput: "Wall collision: ACTIVE", isPattern: false },
      { id: "g3", description: "Prints wall count", expectedOutput: "Walls: 44", isPattern: false },
    ],
    hints: [
      "Add bounds check first: if (new_x < 0 || new_x >= GRID_W || new_y < 0 || new_y >= GRID_H) return early.",
      "Add wall check after bounds: if (tiles[new_y][new_x] == 1) return early. Only check tiles AFTER bounds are valid.",
      "Count walls with a nested loop before the game loop: if (tiles[y][x] == 1) wall_count++.",
    ],
    estimatedMinutes: 12
  }
};
