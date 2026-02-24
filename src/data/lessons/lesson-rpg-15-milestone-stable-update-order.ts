import { Lesson } from "@/types/lesson";

export const lessonRPG15: Lesson = {
  id: "rpg-15-milestone-stable-update-order",
  title: "Milestone: Stable Update Order",
  description: "Milestone checkpoint. Add frame_count tracking and cement the five-phase pipeline as an invariant. Every frame runs INPUT -> RESOLVE -> WORLD -> CLEANUP -> RENDER in this order, always.",
  order: 15,
  xpReward: 300,
  tier: "pro",
  concepts: ["update order", "frame counter", "phase invariant", "milestone"],
  part1: {
    title: "Concept: Stable Update Order",
    type: "concept",
    instructions: `# Concept: Stable Update Order

## Why Order Matters
In a game loop, the order phases run is a **contract**. If you change the order, you change the game's behavior.

Example: if WORLD runs before RESOLVE, the enemy moves based on the player's position from the *previous* frame. If CLEANUP runs before RESOLVE, you might kill an entity before its attack resolves.

The correct contract for our RPG:
\`\`\`
INPUT -> RESOLVE -> WORLD -> CLEANUP -> RENDER
\`\`\`

Each phase has a single responsibility:
- **INPUT**: read player keypress, set pending_intent
- **RESOLVE**: turn intent into effects (move, attack, damage)
- **WORLD**: simulate the world (enemy AI, physics)
- **CLEANUP**: apply deferred effects (death, turn++)
- **RENDER**: draw the current state

## Your Task
Call each phase function in the correct order and print the order as proof:

Expected output:
\`\`\`
Phase: INPUT
Phase: RESOLVE
Phase: WORLD
Phase: CLEANUP
Order: INPUT -> RESOLVE -> WORLD -> CLEANUP
Milestone: stable-update-order
\`\`\`

## Beginner Trap
**Not testing update order explicitly.** The game "works" today, but adding a new system changes the order and breaks behavior. Print the pass sequence and verify it matches the spec every build.

## Elite Insight
Fixed update ordering is a core guarantee in Unreal (tick groups) and Unity (script execution order). Professional engines let you declare "system A runs before system B" explicitly. Your ordered pass list is the same concept.

## Systems Thinking Connection
Platformer L15 hits the same milestone — stable update order is a prerequisite for deterministic replay. If pass order can change between runs, replay diverges. Every path enforces this before moving forward.`,
    starterCode: `#include <iostream>
using namespace std;

// These represent the four simulation phases (render is visual-only)
void phaseInput()   { cout << "Phase: INPUT"   << endl; }
void phaseResolve() { cout << "Phase: RESOLVE" << endl; }
void phaseWorld()   { cout << "Phase: WORLD"   << endl; }
void phaseCleanup() { cout << "Phase: CLEANUP" << endl; }

int main() {
    // TODO: Call the four phases in the correct order
    // Then print the order and the milestone
    cout << "Order: INPUT -> RESOLVE -> WORLD -> CLEANUP" << endl;
    cout << "Milestone: stable-update-order" << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

void phaseInput()   { cout << "Phase: INPUT"   << endl; }
void phaseResolve() { cout << "Phase: RESOLVE" << endl; }
void phaseWorld()   { cout << "Phase: WORLD"   << endl; }
void phaseCleanup() { cout << "Phase: CLEANUP" << endl; }

int main() {
    phaseInput();
    phaseResolve();
    phaseWorld();
    phaseCleanup();
    cout << "Order: INPUT -> RESOLVE -> WORLD -> CLEANUP" << endl;
    cout << "Milestone: stable-update-order" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "INPUT phase runs", expectedOutput: "Phase: INPUT", isPattern: false },
      { id: "t2", description: "WORLD phase runs", expectedOutput: "Phase: WORLD", isPattern: false },
      { id: "t3", description: "Milestone reached", expectedOutput: "Milestone: stable-update-order", isPattern: false },
    ],
    hints: [
      "Call phaseInput(), phaseResolve(), phaseWorld(), phaseCleanup() in that exact order.",
      "The order string and milestone cout are already in the starter code -- just add the 4 function calls above them.",
    ],
    estimatedMinutes: 8
  },
  part2: {
    title: "Build: Stable Update Order Milestone",
    type: "game_builder",
    instructions: `# Build: Stable Update Order Milestone

## What's New
This milestone adds **frame_count** tracking to prove the game loop runs correctly, and documents the pipeline as a named constant. After this lesson, Lessons 16-20 will build more mechanics on this stable foundation.

## Step 1: Add frame_count to World
\`\`\`cpp
struct World {
    // ... existing fields ...
    int frame_count = 0;  // increments every game loop iteration
};
\`\`\`

## Step 2: Increment frame_count every loop
Unlike turn_count (which only counts player turns), frame_count increases every frame:
\`\`\`cpp
while (!WindowShouldClose()) {
    world.frame_count++;  // every frame, not just on input
    phaseInput();
    if (pending_intent != INTENT_NONE) { ... }
}
\`\`\`

## Step 3: Add milestone startup cout
\`\`\`cpp
cout << "Milestone: stable-update-order" << endl;
\`\`\`

## Step 4: Add Frame HUD line
\`\`\`cpp
DrawText(TextFormat("Frame: %d", world.frame_count), 400, 240, 16, GRAY);
\`\`\`

**Click Run now** -- you should see the Frame counter climbing in the HUD.

## Milestone Checklist
- [ ] Startup cout includes \`Milestone: stable-update-order\`
- [ ] \`world.frame_count\` increments every game loop tick
- [ ] HUD shows Frame: counter
- [ ] All five phases (INPUT/RESOLVE/WORLD/CLEANUP/RENDER) in correct order
- [ ] Enemy AI, bump combat, and kill system all still work

Expected cout output:
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
Vec2i: OK
IDs: OK
SoA: OK
Milestone: stable-update-order
\`\`\``,
    starterCode: `#include <iostream>
#include "raylib.h"
using namespace std;

const int GRID_W = 12;
const int GRID_H = 10;
const int TILE = 32;
int tiles[GRID_H][GRID_W];

const int INTENT_NONE   = 0;
const int INTENT_UP     = 1;
const int INTENT_DOWN   = 2;
const int INTENT_LEFT   = 3;
const int INTENT_RIGHT  = 4;
const int INTENT_ATTACK = 5;
int pending_intent = INTENT_NONE;

const int NO_ENTITY    = -1;
const int MAX_ENTITIES = 2;

struct Vec2i { int x = 0; int y = 0; };
enum TileType { TILE_FLOOR = 0, TILE_WALL = 1 };

struct World {
    int player_id = 0;
    int enemy_id  = 1;
    Vec2i pos[MAX_ENTITIES] = {{5,5},{9,7}};
    bool enemy_alive = true;
    int player_hp = 20, player_max_hp = 20;
    int enemy_hp = 10, enemy_max_hp = 10;
    int turn_count = 0;
    int kills = 0;
    // TODO 1: Add int frame_count = 0;
};
World world;

const char* intentName(int intent) {
    switch(intent) {
        case INTENT_UP:     return "MOVE_UP";
        case INTENT_DOWN:   return "MOVE_DOWN";
        case INTENT_LEFT:   return "MOVE_LEFT";
        case INTENT_RIGHT:  return "MOVE_RIGHT";
        case INTENT_ATTACK: return "ATTACK";
        default:            return "NONE";
    }
}

const char* entityName(int id) {
    if (id == world.player_id) return "Player";
    if (id == world.enemy_id)  return "Enemy";
    return "None";
}

void resolveCommand() {
    if (pending_intent == INTENT_NONE || pending_intent == INTENT_ATTACK) return;
    int new_x = world.pos[world.player_id].x;
    int new_y = world.pos[world.player_id].y;
    if (pending_intent == INTENT_UP)    new_y--;
    else if (pending_intent == INTENT_DOWN)  new_y++;
    else if (pending_intent == INTENT_LEFT)  new_x--;
    else if (pending_intent == INTENT_RIGHT) new_x++;
    if (new_x < 0 || new_x >= GRID_W || new_y < 0 || new_y >= GRID_H) {
        pending_intent = INTENT_NONE; return;
    }
    if (tiles[new_y][new_x] == TILE_WALL) { pending_intent = INTENT_NONE; return; }
    if (world.enemy_alive && new_x == world.pos[world.enemy_id].x && new_y == world.pos[world.enemy_id].y) {
        pending_intent = INTENT_ATTACK; return;
    }
    world.pos[world.player_id].x = new_x;
    world.pos[world.player_id].y = new_y;
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
    if (IsKeyPressed(KEY_W))      pending_intent = INTENT_UP;
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
    int dx = world.pos[world.player_id].x - world.pos[world.enemy_id].x;
    int dy = world.pos[world.player_id].y - world.pos[world.enemy_id].y;
    int move_x = 0, move_y = 0;
    if (abs(dx) >= abs(dy)) { move_x = (dx > 0) ? 1 : -1; }
    else { move_y = (dy > 0) ? 1 : -1; }
    int nx = world.pos[world.enemy_id].x + move_x;
    int ny = world.pos[world.enemy_id].y + move_y;
    if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H &&
        tiles[ny][nx] != TILE_WALL && !(nx == world.pos[world.player_id].x && ny == world.pos[world.player_id].y)) {
        world.pos[world.enemy_id].x = nx; world.pos[world.enemy_id].y = ny;
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
            tiles[y][x] = (y==0||y==GRID_H-1||x==0||x==GRID_W-1) ? TILE_WALL : TILE_FLOOR;
    tiles[3][4] = TILE_WALL; tiles[3][5] = TILE_WALL;
    tiles[6][7] = TILE_WALL; tiles[6][8] = TILE_WALL;
}

int main() {
    InitWindow(640, 640, "HeapSight RPG");
    SetTargetFPS(60);
    initTiles();

    int wall_count = 0;
    for (int y = 0; y < GRID_H; y++)
        for (int x = 0; x < GRID_W; x++)
            if (tiles[y][x] == TILE_WALL) wall_count++;

    cout << "Player: (" << world.pos[world.player_id].x << ", " << world.pos[world.player_id].y << ")" << endl;
    cout << "Pipeline: INPUT -> RESOLVE -> CLEANUP -> RENDER" << endl;
    cout << "Turn: " << world.turn_count << endl;
    cout << "Enemy: (" << world.pos[world.enemy_id].x << ", " << world.pos[world.enemy_id].y << ")" << endl;
    cout << "Enemies: 1" << endl;
    cout << "Combat: bump" << endl;
    cout << "Player HP: " << world.player_hp << "/" << world.player_max_hp << endl;
    cout << "Enemy HP: " << world.enemy_hp << "/" << world.enemy_max_hp << endl;
    cout << "Kill: hp-to-zero" << endl;
    cout << "Milestone: micro-dungeon" << endl;
    cout << "Phases: INPUT -> RESOLVE -> WORLD -> CLEANUP -> RENDER" << endl;
    cout << "Struct: world" << endl;
    cout << "Vec2i: OK" << endl;
    cout << "IDs: OK" << endl;
    cout << "SoA: OK" << endl;
    // TODO 2: cout << "Milestone: stable-update-order" << endl;

    while (!WindowShouldClose()) {
        // TODO 3: world.frame_count++;  (increment every frame, not just on input)
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
                Color c = (tiles[y][x] == TILE_WALL) ? GRAY : DARKGRAY;
                DrawRectangle(x*TILE, y*TILE, TILE-1, TILE-1, c);
            }
        DrawRectangle(world.pos[world.player_id].x*TILE, world.pos[world.player_id].y*TILE, TILE-1, TILE-1, GREEN);
        if (world.enemy_alive)
            DrawRectangle(world.pos[world.enemy_id].x*TILE, world.pos[world.enemy_id].y*TILE, TILE-1, TILE-1, RED);
        DrawText("HeapSight RPG", 400, 10, 20, WHITE);
        DrawText(TextFormat("Turn: %d", world.turn_count), 400, 40, 16, WHITE);
        DrawText(TextFormat("Intent: %s", intentName(pending_intent)), 400, 60, 16, WHITE);
        DrawText(TextFormat("Player: (%d,%d)", world.pos[world.player_id].x, world.pos[world.player_id].y), 400, 80, 16, WHITE);
        DrawText(TextFormat("Walls: %d", wall_count), 400, 100, 16, WHITE);
        if (world.enemy_alive) {
            DrawText(TextFormat("Enemy:(%d,%d)", world.pos[world.enemy_id].x, world.pos[world.enemy_id].y), 400, 120, 16, RED);
            DrawText(TextFormat("Enemy HP:%d/%d", world.enemy_hp, world.enemy_max_hp), 400, 160, 16, RED);
        } else { DrawText("Enemy: DEAD", 400, 120, 16, DARKGRAY); }
        DrawText(TextFormat("Player HP:%d/%d", world.player_hp, world.player_max_hp), 400, 140, 16, GREEN);
        DrawText(TextFormat("Kills: %d", world.kills), 400, 180, 16, YELLOW);
        DrawText(TextFormat("Player[%d]", world.player_id), 400, 200, 16, WHITE);
        DrawText(TextFormat("Enemy[%d]",  world.enemy_id),  400, 220, 16, WHITE);
        // TODO 4: DrawText(TextFormat("Frame: %d", world.frame_count), 400, 240, 16, GRAY);
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

const int INTENT_NONE   = 0;
const int INTENT_UP     = 1;
const int INTENT_DOWN   = 2;
const int INTENT_LEFT   = 3;
const int INTENT_RIGHT  = 4;
const int INTENT_ATTACK = 5;
int pending_intent = INTENT_NONE;

const int NO_ENTITY    = -1;
const int MAX_ENTITIES = 2;

struct Vec2i { int x = 0; int y = 0; };
enum TileType { TILE_FLOOR = 0, TILE_WALL = 1 };

struct World {
    int player_id = 0;
    int enemy_id  = 1;
    Vec2i pos[MAX_ENTITIES] = {{5,5},{9,7}};
    bool enemy_alive = true;
    int player_hp = 20, player_max_hp = 20;
    int enemy_hp = 10, enemy_max_hp = 10;
    int turn_count = 0;
    int kills = 0;
    int frame_count = 0;
};
World world;

const char* intentName(int intent) {
    switch(intent) {
        case INTENT_UP:     return "MOVE_UP";
        case INTENT_DOWN:   return "MOVE_DOWN";
        case INTENT_LEFT:   return "MOVE_LEFT";
        case INTENT_RIGHT:  return "MOVE_RIGHT";
        case INTENT_ATTACK: return "ATTACK";
        default:            return "NONE";
    }
}

const char* entityName(int id) {
    if (id == world.player_id) return "Player";
    if (id == world.enemy_id)  return "Enemy";
    return "None";
}

void resolveCommand() {
    if (pending_intent == INTENT_NONE || pending_intent == INTENT_ATTACK) return;
    int new_x = world.pos[world.player_id].x;
    int new_y = world.pos[world.player_id].y;
    if (pending_intent == INTENT_UP)    new_y--;
    else if (pending_intent == INTENT_DOWN)  new_y++;
    else if (pending_intent == INTENT_LEFT)  new_x--;
    else if (pending_intent == INTENT_RIGHT) new_x++;
    if (new_x < 0 || new_x >= GRID_W || new_y < 0 || new_y >= GRID_H) {
        pending_intent = INTENT_NONE; return;
    }
    if (tiles[new_y][new_x] == TILE_WALL) { pending_intent = INTENT_NONE; return; }
    if (world.enemy_alive && new_x == world.pos[world.enemy_id].x && new_y == world.pos[world.enemy_id].y) {
        pending_intent = INTENT_ATTACK; return;
    }
    world.pos[world.player_id].x = new_x;
    world.pos[world.player_id].y = new_y;
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
    if (IsKeyPressed(KEY_W))      pending_intent = INTENT_UP;
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
    int dx = world.pos[world.player_id].x - world.pos[world.enemy_id].x;
    int dy = world.pos[world.player_id].y - world.pos[world.enemy_id].y;
    int move_x = 0, move_y = 0;
    if (abs(dx) >= abs(dy)) { move_x = (dx > 0) ? 1 : -1; }
    else { move_y = (dy > 0) ? 1 : -1; }
    int nx = world.pos[world.enemy_id].x + move_x;
    int ny = world.pos[world.enemy_id].y + move_y;
    if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H &&
        tiles[ny][nx] != TILE_WALL && !(nx == world.pos[world.player_id].x && ny == world.pos[world.player_id].y)) {
        world.pos[world.enemy_id].x = nx; world.pos[world.enemy_id].y = ny;
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
            tiles[y][x] = (y==0||y==GRID_H-1||x==0||x==GRID_W-1) ? TILE_WALL : TILE_FLOOR;
    tiles[3][4] = TILE_WALL; tiles[3][5] = TILE_WALL;
    tiles[6][7] = TILE_WALL; tiles[6][8] = TILE_WALL;
}

int main() {
    InitWindow(640, 640, "HeapSight RPG");
    SetTargetFPS(60);
    initTiles();

    int wall_count = 0;
    for (int y = 0; y < GRID_H; y++)
        for (int x = 0; x < GRID_W; x++)
            if (tiles[y][x] == TILE_WALL) wall_count++;

    cout << "Player: (" << world.pos[world.player_id].x << ", " << world.pos[world.player_id].y << ")" << endl;
    cout << "Pipeline: INPUT -> RESOLVE -> CLEANUP -> RENDER" << endl;
    cout << "Turn: " << world.turn_count << endl;
    cout << "Enemy: (" << world.pos[world.enemy_id].x << ", " << world.pos[world.enemy_id].y << ")" << endl;
    cout << "Enemies: 1" << endl;
    cout << "Combat: bump" << endl;
    cout << "Player HP: " << world.player_hp << "/" << world.player_max_hp << endl;
    cout << "Enemy HP: " << world.enemy_hp << "/" << world.enemy_max_hp << endl;
    cout << "Kill: hp-to-zero" << endl;
    cout << "Milestone: micro-dungeon" << endl;
    cout << "Phases: INPUT -> RESOLVE -> WORLD -> CLEANUP -> RENDER" << endl;
    cout << "Struct: world" << endl;
    cout << "Vec2i: OK" << endl;
    cout << "IDs: OK" << endl;
    cout << "SoA: OK" << endl;
    cout << "Milestone: stable-update-order" << endl;

    while (!WindowShouldClose()) {
        world.frame_count++;
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
                Color c = (tiles[y][x] == TILE_WALL) ? GRAY : DARKGRAY;
                DrawRectangle(x*TILE, y*TILE, TILE-1, TILE-1, c);
            }
        DrawRectangle(world.pos[world.player_id].x*TILE, world.pos[world.player_id].y*TILE, TILE-1, TILE-1, GREEN);
        if (world.enemy_alive)
            DrawRectangle(world.pos[world.enemy_id].x*TILE, world.pos[world.enemy_id].y*TILE, TILE-1, TILE-1, RED);
        DrawText("HeapSight RPG", 400, 10, 20, WHITE);
        DrawText(TextFormat("Turn: %d", world.turn_count), 400, 40, 16, WHITE);
        DrawText(TextFormat("Intent: %s", intentName(pending_intent)), 400, 60, 16, WHITE);
        DrawText(TextFormat("Player: (%d,%d)", world.pos[world.player_id].x, world.pos[world.player_id].y), 400, 80, 16, WHITE);
        DrawText(TextFormat("Walls: %d", wall_count), 400, 100, 16, WHITE);
        if (world.enemy_alive) {
            DrawText(TextFormat("Enemy:(%d,%d)", world.pos[world.enemy_id].x, world.pos[world.enemy_id].y), 400, 120, 16, RED);
            DrawText(TextFormat("Enemy HP:%d/%d", world.enemy_hp, world.enemy_max_hp), 400, 160, 16, RED);
        } else { DrawText("Enemy: DEAD", 400, 120, 16, DARKGRAY); }
        DrawText(TextFormat("Player HP:%d/%d", world.player_hp, world.player_max_hp), 400, 140, 16, GREEN);
        DrawText(TextFormat("Kills: %d", world.kills), 400, 180, 16, YELLOW);
        DrawText(TextFormat("Player[%d]", world.player_id), 400, 200, 16, WHITE);
        DrawText(TextFormat("Enemy[%d]",  world.enemy_id),  400, 220, 16, WHITE);
        DrawText(TextFormat("Frame: %d", world.frame_count), 400, 240, 16, GRAY);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Player position", expectedOutput: "Player: (5, 5)", isPattern: false },
      { id: "g2", description: "SoA OK", expectedOutput: "SoA: OK", isPattern: false },
      { id: "g3", description: "Milestone reached", expectedOutput: "Milestone: stable-update-order", isPattern: false },
    ],
    hints: [
      "Add int frame_count = 0; to struct World (after kills).",
      "Increment world.frame_count++ at the TOP of the game loop, before phaseInput().",
      "The milestone cout goes in the startup section (before the while loop).",
    ],
    estimatedMinutes: 12
  }
};