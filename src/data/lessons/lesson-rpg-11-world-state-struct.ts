import { Lesson } from "@/types/lesson";

export const lessonRPG11: Lesson = {
  id: "rpg-11-world-state-struct",
  title: "World State Struct",
  description: "Group all mutable game state into a single World struct. Phase functions now operate on one observable object instead of scattered globals.",
  order: 11,
  xpReward: 100,
  tier: "pro",
  concepts: ["struct", "aggregate state", "single observable", "refactoring"],
  part1: {
    title: "Concept: World State Struct",
    type: "concept",
    instructions: `# World State Struct

## Mental Model
The game now has 12+ mutable globals: \`player_x\`, \`player_y\`, \`enemy_hp\`, \`turn_count\`, \`kills\`, etc. These are scattered at file scope. If you want to snapshot the game state, save it to disk, or pass it to a function, you need to list every variable manually.

The fix: put all mutable game state in one \`struct World\`. The \`struct\` is the single observable.
\`\`\`cpp
struct World {
    int player_x = 5, player_y = 5;
    int enemy_x = 9, enemy_y = 7;
    bool enemy_alive = true;
    int player_hp = 20, player_max_hp = 20;
    int enemy_hp = 10, enemy_max_hp = 10;
    int turn_count = 0;
    int kills = 0;
};
World world;
\`\`\`

Phase functions read and write \`world.player_x\` instead of a global \`player_x\`. The behavior is identical -- only the data layout changes.

## Key Concepts
- \`struct World\` is just a named group of fields. No methods, no encapsulation yet.
- Default member initializers (\`int player_x = 5\`) set values at declaration
- Constants (\`GRID_W, TILE, INTENT_NONE\`) stay as globals -- they are not mutable state
- \`tiles[][]\` stays global -- it is the map, not entity state

## Why Not Methods?
Adding methods to World creates a "God Object" anti-pattern -- one class that does everything. Keep \`struct World\` as pure data. The phase functions ARE the methods, kept separate by design.

## Beginner Trap
**Putting \`pending_intent\` inside World.** Pending intent is a pipeline variable -- it exists between INPUT and RESOLVE. It is not game state that you save or restore. Keep it as a file-scope global.

## Elite Insight
This struct is the first step toward serialization. To save the game, write \`sizeof(World)\` bytes to disk. To load, read them back. No custom serialization code needed. Scattered globals cannot be saved this simply.

## Your Task
Define \`struct World\` with all the game state fields. Create a \`World world;\` instance. Print each field to confirm the struct is correctly initialized.

Expected output:
\`\`\`
World: player=(5, 5)
World: enemy=(9, 7)
World: hp=20/20
World: turn=0
World: kills=0
Struct: OK
\`\`\`

## Systems Thinking Connection
The Platformer groups its game state into a single struct too — Level, Player, Enemies all live under one GameState. When you pass one struct instead of six globals, every function signature tells you exactly what data it touches.`,
    starterCode: `#include <iostream>
using namespace std;

// TODO: Define struct World with these fields:
// int player_x = 5, player_y = 5;
// int enemy_x = 9, enemy_y = 7;
// bool enemy_alive = true;
// int player_hp = 20, player_max_hp = 20;
// int enemy_hp = 10, enemy_max_hp = 10;
// int turn_count = 0;
// int kills = 0;

// TODO: Declare: World world;

int main() {
    // TODO: Print all fields using world.player_x etc.
    cout << "Struct: OK" << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct World {
    int player_x = 5, player_y = 5;
    int enemy_x = 9, enemy_y = 7;
    bool enemy_alive = true;
    int player_hp = 20, player_max_hp = 20;
    int enemy_hp = 10, enemy_max_hp = 10;
    int turn_count = 0;
    int kills = 0;
};
World world;

int main() {
    cout << "World: player=(" << world.player_x << ", " << world.player_y << ")" << endl;
    cout << "World: enemy=(" << world.enemy_x << ", " << world.enemy_y << ")" << endl;
    cout << "World: hp=" << world.player_hp << "/" << world.player_max_hp << endl;
    cout << "World: turn=" << world.turn_count << endl;
    cout << "World: kills=" << world.kills << endl;
    cout << "Struct: OK" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Player position from struct", expectedOutput: "World: player=(5, 5)", isPattern: false },
      { id: "t2", description: "Enemy position from struct", expectedOutput: "World: enemy=(9, 7)", isPattern: false },
      { id: "t3", description: "HP from struct", expectedOutput: "World: hp=20/20", isPattern: false },
      { id: "t4", description: "Turn counter from struct", expectedOutput: "World: turn=0", isPattern: false },
      { id: "t5", description: "Struct verified", expectedOutput: "Struct: OK", isPattern: false },
    ],
    hints: [
      "struct World { int player_x = 5, player_y = 5; ... }; goes before main().",
      "World world; declares a global instance with default values.",
      "Access fields with world.player_x, world.player_y, world.enemy_x, etc.",
    ],
    estimatedMinutes: 10
  },
  part2: {
    title: "Build: World State Struct",
    type: "game_builder",
    instructions: `# Build: World State Struct

## Mental Model
Refactor the game to use a \`struct World\`. All mutable entity state moves into the struct. Phase functions update \`world.player_x\` instead of a bare \`player_x\`. **The gameplay does not change.** This is a pure data reorganization.

## Step 1: Define the struct
Replace all the global entity variables with this struct (above the constants):
\`\`\`cpp
struct World {
    int player_x = 5, player_y = 5;
    int enemy_x = 9, enemy_y = 7;
    bool enemy_alive = true;
    int player_hp = 20, player_max_hp = 20;
    int enemy_hp = 10, enemy_max_hp = 10;
    int turn_count = 0;
    int kills = 0;
};
World world;
\`\`\`

## Step 2: Update phase functions
In every phase function, replace bare variable names with \`world.\` prefixed versions:
- \`player_x\` becomes \`world.player_x\`
- \`enemy_hp\` becomes \`world.enemy_hp\`
- \`turn_count\` becomes \`world.turn_count\`
- etc. for all entity state variables

Keep these as bare globals (not in struct):
- \`GRID_W, GRID_H, TILE\` -- constants
- \`tiles[][]\` -- the map
- \`pending_intent\` -- pipeline variable
- \`INTENT_NONE, INTENT_UP\` etc. -- constants

## Step 3: Update main()
Replace all bare variable references in the cout and HUD sections with \`world.\` versions.

**Click Run now** -- the game should behave identically to L10. Same tiles, same enemy, same combat. The only change is that state is accessed via \`world.xxx\`.

## Beginner Trap
**Forgetting to update one function.** If any function still uses the bare \`player_x\` global and you removed it, you get a compile error. Search for every occurrence and update them all.

## Elite Insight
You can now take a snapshot: \`World snapshot = world;\` -- a complete copy of all game state in one assignment. This is the foundation for undo systems, game saves, and replay recording.

Expected cout output (same as L10):
\`\`\`
Player: (5, 5)
Pipeline: INPUT -> RESOLVE -> CLEANUP -> RENDER
Turn: 0
Enemy: (9, 7)
Enemies: 1
Combat: bump
Player HP: 20/20
Enemy HP: 10/10
Kill: hp-to-zero
Milestone: micro-dungeon
Phases: INPUT -> RESOLVE -> WORLD -> CLEANUP -> RENDER
Struct: world
\`\`\``,
    starterCode: `#include <iostream>
#include "raylib.h"
using namespace std;

const int GRID_W = 12;
const int GRID_H = 10;
const int TILE = 32;
int tiles[GRID_H][GRID_W];

const int INTENT_NONE = 0;
const int INTENT_UP = 1;
const int INTENT_DOWN = 2;
const int INTENT_LEFT = 3;
const int INTENT_RIGHT = 4;
const int INTENT_ATTACK = 5;
int pending_intent = INTENT_NONE;

// TODO 1: Define struct World with all entity state fields
// (player_x/y, enemy_x/y/alive, player_hp/max, enemy_hp/max, turn_count, kills)
// Use default member initializers. Then declare: World world;

const char* intentName(int intent) {
    switch(intent) {
        case INTENT_UP: return "MOVE_UP";
        case INTENT_DOWN: return "MOVE_DOWN";
        case INTENT_LEFT: return "MOVE_LEFT";
        case INTENT_RIGHT: return "MOVE_RIGHT";
        case INTENT_ATTACK: return "ATTACK";
        default: return "NONE";
    }
}

// TODO 2: Update resolveCommand() to use world.player_x, world.enemy_x, etc.
void resolveCommand() {
    if (pending_intent == INTENT_NONE || pending_intent == INTENT_ATTACK) return;
    int new_x = world.player_x;  // world. prefix needed
    int new_y = world.player_y;
    if (pending_intent == INTENT_UP) new_y--;
    else if (pending_intent == INTENT_DOWN) new_y++;
    else if (pending_intent == INTENT_LEFT) new_x--;
    else if (pending_intent == INTENT_RIGHT) new_x++;
    if (new_x < 0 || new_x >= GRID_W || new_y < 0 || new_y >= GRID_H) {
        pending_intent = INTENT_NONE; return;
    }
    if (tiles[new_y][new_x] == 1) { pending_intent = INTENT_NONE; return; }
    if (world.enemy_alive && new_x == world.enemy_x && new_y == world.enemy_y) {
        pending_intent = INTENT_ATTACK; return;
    }
    world.player_x = new_x;
    world.player_y = new_y;
    pending_intent = INTENT_NONE;
}

// TODO 3: Update resolveCombat() to use world.enemy_hp, world.enemy_max_hp
void resolveCombat() {
    if (pending_intent != INTENT_ATTACK) return;
    int dmg = 3;
    world.enemy_hp -= dmg;  // world. prefix
    cout << "Damage: " << dmg << endl;
    cout << "Enemy HP: " << world.enemy_hp << "/" << world.enemy_max_hp << endl;
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
    resolveCombat();
}

// TODO 4: Update phaseWorld() to use world.enemy_x, world.enemy_y, etc.
void phaseWorld() {
    if (!world.enemy_alive) return;
    int dx = world.player_x - world.enemy_x;
    int dy = world.player_y - world.enemy_y;
    int move_x = 0, move_y = 0;
    if (abs(dx) >= abs(dy)) { move_x = (dx > 0) ? 1 : -1; }
    else { move_y = (dy > 0) ? 1 : -1; }
    int nx = world.enemy_x + move_x;
    int ny = world.enemy_y + move_y;
    if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H &&
        tiles[ny][nx] != 1 && !(nx == world.player_x && ny == world.player_y)) {
        world.enemy_x = nx; world.enemy_y = ny;
    }
}

// TODO 5: Update phaseCleanup() to use world.enemy_alive, world.enemy_hp, world.kills, world.turn_count
void phaseCleanup() {
    if (world.enemy_alive && world.enemy_hp <= 0) {
        world.enemy_alive = false;
        world.kills++;
        cout << "Kill confirmed" << endl;
    }
    world.turn_count++;
}

void initTiles() {
    for (int y = 0; y < GRID_H; y++)
        for (int x = 0; x < GRID_W; x++)
            tiles[y][x] = (y == 0 || y == GRID_H-1 || x == 0 || x == GRID_W-1) ? 1 : 0;
    tiles[3][4] = 1; tiles[3][5] = 1;
    tiles[6][7] = 1; tiles[6][8] = 1;
}

int main() {
    InitWindow(640, 640, "HeapSight RPG");
    SetTargetFPS(60);
    initTiles();

    int wall_count = 0;
    for (int y = 0; y < GRID_H; y++)
        for (int x = 0; x < GRID_W; x++)
            if (tiles[y][x] == 1) wall_count++;

    // TODO 6: Update all cout lines to use world.player_x, world.enemy_x, etc.
    cout << "Player: (" << world.player_x << ", " << world.player_y << ")" << endl;
    cout << "Pipeline: INPUT -> RESOLVE -> CLEANUP -> RENDER" << endl;
    cout << "Turn: " << world.turn_count << endl;
    cout << "Enemy: (" << world.enemy_x << ", " << world.enemy_y << ")" << endl;
    cout << "Enemies: 1" << endl;
    cout << "Combat: bump" << endl;
    cout << "Player HP: " << world.player_hp << "/" << world.player_max_hp << endl;
    cout << "Enemy HP: " << world.enemy_hp << "/" << world.enemy_max_hp << endl;
    cout << "Kill: hp-to-zero" << endl;
    cout << "Milestone: micro-dungeon" << endl;
    cout << "Phases: INPUT -> RESOLVE -> WORLD -> CLEANUP -> RENDER" << endl;
    // TODO 7: cout << "Struct: world" << endl;

    while (!WindowShouldClose()) {
        phaseInput();
        if (pending_intent != INTENT_NONE) {
            phaseResolve();
            phaseWorld();
            phaseCleanup();
        }
        BeginDrawing();
        ClearBackground(BLACK);
        for (int y = 0; y < GRID_H; y++)
            for (int x = 0; x < GRID_W; x++) {
                Color c = (tiles[y][x] == 1) ? GRAY : DARKGRAY;
                DrawRectangle(x * TILE, y * TILE, TILE-1, TILE-1, c);
            }
        DrawRectangle(world.player_x*TILE, world.player_y*TILE, TILE-1, TILE-1, GREEN);
        if (world.enemy_alive)
            DrawRectangle(world.enemy_x*TILE, world.enemy_y*TILE, TILE-1, TILE-1, RED);
        DrawText("HeapSight RPG", 400, 10, 20, WHITE);
        DrawText(TextFormat("Turn: %d", world.turn_count), 400, 40, 16, WHITE);
        DrawText(TextFormat("Intent: %s", intentName(pending_intent)), 400, 60, 16, WHITE);
        DrawText(TextFormat("Player: (%d, %d)", world.player_x, world.player_y), 400, 80, 16, WHITE);
        DrawText(TextFormat("Walls: %d", wall_count), 400, 100, 16, WHITE);
        if (world.enemy_alive) {
            DrawText(TextFormat("Enemy: (%d,%d)", world.enemy_x, world.enemy_y), 400, 120, 16, RED);
            DrawText(TextFormat("Enemy HP: %d/%d", world.enemy_hp, world.enemy_max_hp), 400, 160, 16, RED);
        } else {
            DrawText("Enemy: DEAD", 400, 120, 16, DARKGRAY);
        }
        DrawText(TextFormat("Player HP: %d/%d", world.player_hp, world.player_max_hp), 400, 140, 16, GREEN);
        DrawText(TextFormat("Kills: %d", world.kills), 400, 180, 16, YELLOW);
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

const int INTENT_NONE = 0;
const int INTENT_UP = 1;
const int INTENT_DOWN = 2;
const int INTENT_LEFT = 3;
const int INTENT_RIGHT = 4;
const int INTENT_ATTACK = 5;
int pending_intent = INTENT_NONE;

struct World {
    int player_x = 5, player_y = 5;
    int enemy_x = 9, enemy_y = 7;
    bool enemy_alive = true;
    int player_hp = 20, player_max_hp = 20;
    int enemy_hp = 10, enemy_max_hp = 10;
    int turn_count = 0;
    int kills = 0;
};
World world;

const char* intentName(int intent) {
    switch(intent) {
        case INTENT_UP: return "MOVE_UP";
        case INTENT_DOWN: return "MOVE_DOWN";
        case INTENT_LEFT: return "MOVE_LEFT";
        case INTENT_RIGHT: return "MOVE_RIGHT";
        case INTENT_ATTACK: return "ATTACK";
        default: return "NONE";
    }
}

void resolveCommand() {
    if (pending_intent == INTENT_NONE || pending_intent == INTENT_ATTACK) return;
    int new_x = world.player_x;
    int new_y = world.player_y;
    if (pending_intent == INTENT_UP) new_y--;
    else if (pending_intent == INTENT_DOWN) new_y++;
    else if (pending_intent == INTENT_LEFT) new_x--;
    else if (pending_intent == INTENT_RIGHT) new_x++;
    if (new_x < 0 || new_x >= GRID_W || new_y < 0 || new_y >= GRID_H) {
        pending_intent = INTENT_NONE; return;
    }
    if (tiles[new_y][new_x] == 1) { pending_intent = INTENT_NONE; return; }
    if (world.enemy_alive && new_x == world.enemy_x && new_y == world.enemy_y) {
        pending_intent = INTENT_ATTACK; return;
    }
    world.player_x = new_x;
    world.player_y = new_y;
    pending_intent = INTENT_NONE;
}

void resolveCombat() {
    if (pending_intent != INTENT_ATTACK) return;
    int dmg = 3;
    world.enemy_hp -= dmg;
    cout << "Damage: " << dmg << endl;
    cout << "Enemy HP: " << world.enemy_hp << "/" << world.enemy_max_hp << endl;
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
    resolveCombat();
}

void phaseWorld() {
    if (!world.enemy_alive) return;
    int dx = world.player_x - world.enemy_x;
    int dy = world.player_y - world.enemy_y;
    int move_x = 0, move_y = 0;
    if (abs(dx) >= abs(dy)) { move_x = (dx > 0) ? 1 : -1; }
    else { move_y = (dy > 0) ? 1 : -1; }
    int nx = world.enemy_x + move_x;
    int ny = world.enemy_y + move_y;
    if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H &&
        tiles[ny][nx] != 1 && !(nx == world.player_x && ny == world.player_y)) {
        world.enemy_x = nx; world.enemy_y = ny;
    }
}

void phaseCleanup() {
    if (world.enemy_alive && world.enemy_hp <= 0) {
        world.enemy_alive = false;
        world.kills++;
        cout << "Kill confirmed" << endl;
    }
    world.turn_count++;
}

void initTiles() {
    for (int y = 0; y < GRID_H; y++)
        for (int x = 0; x < GRID_W; x++)
            tiles[y][x] = (y == 0 || y == GRID_H-1 || x == 0 || x == GRID_W-1) ? 1 : 0;
    tiles[3][4] = 1; tiles[3][5] = 1;
    tiles[6][7] = 1; tiles[6][8] = 1;
}

int main() {
    InitWindow(640, 640, "HeapSight RPG");
    SetTargetFPS(60);
    initTiles();

    int wall_count = 0;
    for (int y = 0; y < GRID_H; y++)
        for (int x = 0; x < GRID_W; x++)
            if (tiles[y][x] == 1) wall_count++;

    cout << "Player: (" << world.player_x << ", " << world.player_y << ")" << endl;
    cout << "Pipeline: INPUT -> RESOLVE -> CLEANUP -> RENDER" << endl;
    cout << "Turn: " << world.turn_count << endl;
    cout << "Enemy: (" << world.enemy_x << ", " << world.enemy_y << ")" << endl;
    cout << "Enemies: 1" << endl;
    cout << "Combat: bump" << endl;
    cout << "Player HP: " << world.player_hp << "/" << world.player_max_hp << endl;
    cout << "Enemy HP: " << world.enemy_hp << "/" << world.enemy_max_hp << endl;
    cout << "Kill: hp-to-zero" << endl;
    cout << "Milestone: micro-dungeon" << endl;
    cout << "Phases: INPUT -> RESOLVE -> WORLD -> CLEANUP -> RENDER" << endl;
    cout << "Struct: world" << endl;

    while (!WindowShouldClose()) {
        phaseInput();
        if (pending_intent != INTENT_NONE) {
            phaseResolve();
            phaseWorld();
            phaseCleanup();
        }
        BeginDrawing();
        ClearBackground(BLACK);
        for (int y = 0; y < GRID_H; y++)
            for (int x = 0; x < GRID_W; x++) {
                Color c = (tiles[y][x] == 1) ? GRAY : DARKGRAY;
                DrawRectangle(x * TILE, y * TILE, TILE-1, TILE-1, c);
            }
        DrawRectangle(world.player_x*TILE, world.player_y*TILE, TILE-1, TILE-1, GREEN);
        if (world.enemy_alive)
            DrawRectangle(world.enemy_x*TILE, world.enemy_y*TILE, TILE-1, TILE-1, RED);
        DrawText("HeapSight RPG", 400, 10, 20, WHITE);
        DrawText(TextFormat("Turn: %d", world.turn_count), 400, 40, 16, WHITE);
        DrawText(TextFormat("Intent: %s", intentName(pending_intent)), 400, 60, 16, WHITE);
        DrawText(TextFormat("Player: (%d, %d)", world.player_x, world.player_y), 400, 80, 16, WHITE);
        DrawText(TextFormat("Walls: %d", wall_count), 400, 100, 16, WHITE);
        if (world.enemy_alive) {
            DrawText(TextFormat("Enemy: (%d,%d)", world.enemy_x, world.enemy_y), 400, 120, 16, RED);
            DrawText(TextFormat("Enemy HP: %d/%d", world.enemy_hp, world.enemy_max_hp), 400, 160, 16, RED);
        } else {
            DrawText("Enemy: DEAD", 400, 120, 16, DARKGRAY);
        }
        DrawText(TextFormat("Player HP: %d/%d", world.player_hp, world.player_max_hp), 400, 140, 16, GREEN);
        DrawText(TextFormat("Kills: %d", world.kills), 400, 180, 16, YELLOW);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Prints player position", expectedOutput: "Player: (5, 5)", isPattern: false },
      { id: "g2", description: "Prints pipeline order", expectedOutput: "Pipeline: INPUT -> RESOLVE -> CLEANUP -> RENDER", isPattern: false },
      { id: "g3", description: "Struct confirmed", expectedOutput: "Struct: world", isPattern: false },
      { id: "g4", description: "Player HP shown", expectedOutput: "Player HP: 20/20", isPattern: false },
      { id: "g5", description: "Milestone preserved", expectedOutput: "Milestone: micro-dungeon", isPattern: false },
    ],
    hints: [
      "Define struct World { int player_x = 5; ... }; World world; before the phase functions.",
      "Replace every bare player_x with world.player_x, enemy_hp with world.enemy_hp, etc.",
      "Keep pending_intent, tiles[][], GRID_W, TILE, and INTENT_* as bare globals.",
    ],
    estimatedMinutes: 15
  }
};
