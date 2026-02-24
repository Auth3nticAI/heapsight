import { Lesson } from "@/types/lesson";

export const lessonRPG06: Lesson = {
  id: "rpg-06-enemy-on-grid",
  title: "Enemy on Grid",
  description: "Add a red enemy that chases the player each turn. Introduces phaseWorld() -- the AI/world-update phase of the pipeline.",
  order: 6,
  xpReward: 50,
  tier: "free",
  concepts: ["enemy AI", "chase algorithm", "phaseWorld", "multi-entity pipeline"],
  part1: {
    title: "Concept: Enemy on Grid",
    type: "concept",
    instructions: `# Enemy on Grid

## Mental Model
The pipeline now has a new phase: **WORLD**. After the player resolves their move, the world reacts. Each enemy takes one step toward the player. This is \`phaseWorld()\` -- the AI/simulation phase. It fires once per player turn, keeping the game turn-based.

## Why a Separate Phase?
Putting enemy movement inside \`resolveCommand()\` would couple player logic with enemy logic. What happens when there are 10 enemies? A dedicated \`phaseWorld()\` keeps concerns separated: player intent goes in RESOLVE, world simulation goes in WORLD.

## The Fix: phaseWorld()
\`\`\`cpp
void phaseWorld() {
    if (!enemy_alive) return;
    int dx = player_x - enemy_x;
    int dy = player_y - enemy_y;
    // Move along the axis with greater distance
    int move_x = 0, move_y = 0;
    if (abs(dx) >= abs(dy)) {
        move_x = (dx > 0) ? 1 : -1;
    } else {
        move_y = (dy > 0) ? 1 : -1;
    }
    int nx = enemy_x + move_x;
    int ny = enemy_y + move_y;
    if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H &&
        !(nx == player_x && ny == player_y)) {
        enemy_x = nx; enemy_y = ny;
    }
}
\`\`\`

The updated game loop calls it after RESOLVE:
\`\`\`cpp
if (pending_intent != INTENT_NONE) {
    phaseResolve();
    phaseWorld();   // enemy reacts after player moves
    phaseCleanup();
}
\`\`\`

## Key Concepts
- \`phaseWorld()\` fires once per player turn, not every frame
- Manhattan priority chase: move along the axis with greater distance first
- \`enemy_alive\` flag enables deferred removal in a later lesson
- Enemy never moves onto the player (that is combat, handled in L07)

## Beginner Trap
**Calling phaseWorld() every frame.** Enemy AI should fire once per turn. Gate it inside the \`if (pending_intent != INTENT_NONE)\` block. Without this gate the enemy moves 60 times per second while the player sits still.

## Elite Insight
This is the foundation of Roguelike AI. NetHack, Angband, and Dungeon Crawl Stone Soup all use the same pattern: after the player acts, every monster takes exactly one action in turn order. The complexity comes from what each monster does in its turn -- not from the pipeline structure.

## Your Task
Implement \`phaseWorld()\` with a simple Manhattan chase. Place the enemy at (9, 7). Print its position before and after it moves.

Expected output:
\`\`\`
Enemy: (9, 7)
Enemies: 1
Enemy moves to: (8, 7)
Turn done
\`\`\`

## Systems Thinking Connection
The Platformer places enemies at grid-aligned positions too (Lesson 47), but converts to pixel coordinates for smooth movement. Your RPG keeps enemies in grid space permanently. Both approaches work — the key is consistency within your coordinate system.`,
    starterCode: `#include <iostream>
using namespace std;

const int GRID_W = 12;
const int GRID_H = 10;
int player_x = 5, player_y = 5;
int enemy_x = 9, enemy_y = 7;
bool enemy_alive = true;

// TODO: Write phaseWorld()
// If enemy_alive is false, return early
// Compute dx = player_x - enemy_x, dy = player_y - enemy_y
// If abs(dx) >= abs(dy): move_x = (dx > 0) ? 1 : -1
// Else: move_y = (dy > 0) ? 1 : -1
// Move enemy to (enemy_x + move_x, enemy_y + move_y)
// Guard: in-bounds AND not player position

int main() {
    cout << "Enemy: (" << enemy_x << ", " << enemy_y << ")" << endl;
    cout << "Enemies: 1" << endl;
    // TODO: Call phaseWorld()
    cout << "Enemy moves to: (" << enemy_x << ", " << enemy_y << ")" << endl;
    cout << "Turn done" << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int GRID_W = 12;
const int GRID_H = 10;
int player_x = 5, player_y = 5;
int enemy_x = 9, enemy_y = 7;
bool enemy_alive = true;

void phaseWorld() {
    if (!enemy_alive) return;
    int dx = player_x - enemy_x;
    int dy = player_y - enemy_y;
    int move_x = 0, move_y = 0;
    if (abs(dx) >= abs(dy)) {
        move_x = (dx > 0) ? 1 : -1;
    } else {
        move_y = (dy > 0) ? 1 : -1;
    }
    int nx = enemy_x + move_x;
    int ny = enemy_y + move_y;
    if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H &&
        !(nx == player_x && ny == player_y)) {
        enemy_x = nx;
        enemy_y = ny;
    }
}

int main() {
    cout << "Enemy: (" << enemy_x << ", " << enemy_y << ")" << endl;
    cout << "Enemies: 1" << endl;
    phaseWorld();
    cout << "Enemy moves to: (" << enemy_x << ", " << enemy_y << ")" << endl;
    cout << "Turn done" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Enemy initial position", expectedOutput: "Enemy: (9, 7)", isPattern: false },
      { id: "t2", description: "Enemy count", expectedOutput: "Enemies: 1", isPattern: false },
      { id: "t3", description: "Enemy moves toward player", expectedOutput: "Enemy moves to: (8, 7)", isPattern: false },
      { id: "t4", description: "Turn complete", expectedOutput: "Turn done", isPattern: false },
    ],
    hints: [
      "phaseWorld() computes dx = player_x - enemy_x and dy = player_y - enemy_y.",
      "If abs(dx) >= abs(dy), move horizontally (move_x = dx > 0 ? 1 : -1). Otherwise move vertically.",
      "Guard: only move if in bounds AND target tile is not the player position.",
    ],
    estimatedMinutes: 8
  },
  part2: {
    title: "Build: Enemy on Grid",
    type: "game_builder",
    instructions: `# Build: Enemy on Grid

## Mental Model
Add a visible red enemy to the dungeon grid. The enemy chases the player by one step after every player move. This requires a new pipeline phase: \`phaseWorld()\`, called after \`phaseResolve()\` and before \`phaseCleanup()\`.

## What Breaks Without This
Without \`phaseWorld()\`, the dungeon is a static puzzle. The player can explore with no threat. \`phaseWorld()\` is the hook where all world simulation happens: enemy AI, effect timers, environmental changes.

## Step 1: Add Enemy State
At file scope (after \`turn_count\`):
\`\`\`cpp
int enemy_x = 9, enemy_y = 7;
bool enemy_alive = true;
\`\`\`

## Step 2: Write phaseWorld()
\`\`\`cpp
void phaseWorld() {
    if (!enemy_alive) return;
    int dx = player_x - enemy_x;
    int dy = player_y - enemy_y;
    int move_x = 0, move_y = 0;
    if (abs(dx) >= abs(dy)) {
        move_x = (dx > 0) ? 1 : -1;
    } else {
        move_y = (dy > 0) ? 1 : -1;
    }
    int nx = enemy_x + move_x;
    int ny = enemy_y + move_y;
    if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H &&
        tiles[ny][nx] != 1 &&
        !(nx == player_x && ny == player_y)) {
        enemy_x = nx; enemy_y = ny;
    }
}
\`\`\`

Note: this version also checks \`tiles[ny][nx] != 1\` so the enemy does not walk through walls.

## Step 3: Add to Game Loop
Call \`phaseWorld()\` after \`phaseResolve()\`:
\`\`\`cpp
if (pending_intent != INTENT_NONE) {
    phaseResolve();
    phaseWorld();
    phaseCleanup();
}
\`\`\`

## Step 4: Draw the Enemy
In the draw loop, after drawing the player:
\`\`\`cpp
if (enemy_alive) {
    DrawRectangle(enemy_x * TILE, enemy_y * TILE, TILE - 1, TILE - 1, RED);
}
\`\`\`

**Click Run now** -- you should see a red square at position (9, 7) on the grid. Move the player with WASD and watch the red enemy close in.

## Step 5: Add HUD + cout
Add to the startup cout block:
\`\`\`cpp
cout << "Enemy: (" << enemy_x << ", " << enemy_y << ")" << endl;
cout << "Enemies: 1" << endl;
\`\`\`

Add to the HUD section:
\`\`\`cpp
DrawText(TextFormat("Enemy: (%d, %d)", enemy_x, enemy_y), 400, 120, 16, RED);
\`\`\`

## Beginner Trap
**Putting \`phaseWorld()\` outside the intent check.** If you do this, the enemy moves 60 times per second while the player is idle. Gate it inside the \`if (pending_intent != INTENT_NONE)\` block.

## Elite Insight
Notice that \`phaseWorld()\` is completely decoupled from the player. It only reads \`player_x/player_y\` and updates \`enemy_x/enemy_y\`. This is the ECS preview: systems operate on data, not on each other. Next lesson, the enemy will block the player's path -- adding combat as a command.

## Mastery Check
Question: What happens if the enemy reaches the player's tile?
Answer: Right now, nothing. The movement guard \`!(nx == player_x && ny == player_y)\` prevents overlap. In Lesson 7, bumping into the enemy triggers combat intent instead.

Expected cout output:
\`\`\`
Player: (5, 5)
Pipeline: INPUT -> RESOLVE -> CLEANUP -> RENDER
Turn: 0
Enemy: (9, 7)
Enemies: 1
\`\`\``,
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
int turn_count = 0;

// TODO 1: Add enemy_x = 9, enemy_y = 7, enemy_alive = true at file scope

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

void phaseInput() {
    pending_intent = INTENT_NONE;
    if (IsKeyPressed(KEY_W)) pending_intent = INTENT_UP;
    else if (IsKeyPressed(KEY_S)) pending_intent = INTENT_DOWN;
    else if (IsKeyPressed(KEY_A)) pending_intent = INTENT_LEFT;
    else if (IsKeyPressed(KEY_D)) pending_intent = INTENT_RIGHT;
}

void phaseResolve() {
    resolveCommand();
}

void phaseCleanup() {
    turn_count++;
}

// TODO 2: Write phaseWorld()
// If !enemy_alive, return. Compute dx/dy toward player.
// Move along dominant axis. Guard: in-bounds + no wall + no player.

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
    cout << "Pipeline: INPUT -> RESOLVE -> CLEANUP -> RENDER" << endl;
    cout << "Turn: " << turn_count << endl;
    // TODO 3: cout Enemy position and Enemies: 1

    while (!WindowShouldClose()) {
        phaseInput();
        if (pending_intent != INTENT_NONE) {
            phaseResolve();
            // TODO 4: Call phaseWorld() here
            phaseCleanup();
        }

        BeginDrawing();
        ClearBackground(BLACK);

        for (int y = 0; y < GRID_H; y++) {
            for (int x = 0; x < GRID_W; x++) {
                Color c = (tiles[y][x] == 1) ? GRAY : DARKGRAY;
                DrawRectangle(x * TILE, y * TILE, TILE - 1, TILE - 1, c);
            }
        }
        DrawRectangle(player_x * TILE, player_y * TILE, TILE - 1, TILE - 1, GREEN);
        // TODO 5: if (enemy_alive) draw enemy RED at (enemy_x*TILE, enemy_y*TILE, TILE-1, TILE-1)

        DrawText("HeapSight RPG", 400, 10, 20, WHITE);
        DrawText(TextFormat("Turn: %d", turn_count), 400, 40, 16, WHITE);
        DrawText(TextFormat("Intent: %s", intentName(pending_intent)), 400, 60, 16, WHITE);
        DrawText(TextFormat("Player: (%d, %d)", player_x, player_y), 400, 80, 16, WHITE);
        DrawText(TextFormat("Walls: %d", wall_count), 400, 100, 16, WHITE);
        // TODO 6: DrawText(TextFormat("Enemy: (%d, %d)", enemy_x, enemy_y), 400, 120, 16, RED)

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
int turn_count = 0;

int enemy_x = 9, enemy_y = 7;
bool enemy_alive = true;

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

void phaseInput() {
    pending_intent = INTENT_NONE;
    if (IsKeyPressed(KEY_W)) pending_intent = INTENT_UP;
    else if (IsKeyPressed(KEY_S)) pending_intent = INTENT_DOWN;
    else if (IsKeyPressed(KEY_A)) pending_intent = INTENT_LEFT;
    else if (IsKeyPressed(KEY_D)) pending_intent = INTENT_RIGHT;
}

void phaseResolve() {
    resolveCommand();
}

void phaseWorld() {
    if (!enemy_alive) return;
    int dx = player_x - enemy_x;
    int dy = player_y - enemy_y;
    int move_x = 0, move_y = 0;
    if (abs(dx) >= abs(dy)) {
        move_x = (dx > 0) ? 1 : -1;
    } else {
        move_y = (dy > 0) ? 1 : -1;
    }
    int nx = enemy_x + move_x;
    int ny = enemy_y + move_y;
    if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H &&
        tiles[ny][nx] != 1 &&
        !(nx == player_x && ny == player_y)) {
        enemy_x = nx;
        enemy_y = ny;
    }
}

void phaseCleanup() {
    turn_count++;
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
    cout << "Pipeline: INPUT -> RESOLVE -> CLEANUP -> RENDER" << endl;
    cout << "Turn: " << turn_count << endl;
    cout << "Enemy: (" << enemy_x << ", " << enemy_y << ")" << endl;
    cout << "Enemies: 1" << endl;

    while (!WindowShouldClose()) {
        phaseInput();
        if (pending_intent != INTENT_NONE) {
            phaseResolve();
            phaseWorld();
            phaseCleanup();
        }

        BeginDrawing();
        ClearBackground(BLACK);

        for (int y = 0; y < GRID_H; y++) {
            for (int x = 0; x < GRID_W; x++) {
                Color c = (tiles[y][x] == 1) ? GRAY : DARKGRAY;
                DrawRectangle(x * TILE, y * TILE, TILE - 1, TILE - 1, c);
            }
        }
        DrawRectangle(player_x * TILE, player_y * TILE, TILE - 1, TILE - 1, GREEN);
        if (enemy_alive) {
            DrawRectangle(enemy_x * TILE, enemy_y * TILE, TILE - 1, TILE - 1, RED);
        }

        DrawText("HeapSight RPG", 400, 10, 20, WHITE);
        DrawText(TextFormat("Turn: %d", turn_count), 400, 40, 16, WHITE);
        DrawText(TextFormat("Intent: %s", intentName(pending_intent)), 400, 60, 16, WHITE);
        DrawText(TextFormat("Player: (%d, %d)", player_x, player_y), 400, 80, 16, WHITE);
        DrawText(TextFormat("Walls: %d", wall_count), 400, 100, 16, WHITE);
        DrawText(TextFormat("Enemy: (%d, %d)", enemy_x, enemy_y), 400, 120, 16, RED);

        EndDrawing();
    }

    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Prints player position", expectedOutput: "Player: (5, 5)", isPattern: false },
      { id: "g2", description: "Prints pipeline order", expectedOutput: "Pipeline: INPUT -> RESOLVE -> CLEANUP -> RENDER", isPattern: false },
      { id: "g3", description: "Prints initial turn", expectedOutput: "Turn: 0", isPattern: false },
      { id: "g4", description: "Prints enemy position", expectedOutput: "Enemy: (9, 7)", isPattern: false },
      { id: "g5", description: "Prints enemy count", expectedOutput: "Enemies: 1", isPattern: false },
    ],
    hints: [
      "Add int enemy_x = 9, enemy_y = 7; bool enemy_alive = true; at file scope after turn_count.",
      "phaseWorld() computes dx = player_x - enemy_x, dy = player_y - enemy_y, then moves 1 step along the dominant axis.",
      "Call phaseWorld() between phaseResolve() and phaseCleanup() inside the intent check.",
    ],
    estimatedMinutes: 12
  }
};
