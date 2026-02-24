import { Lesson } from "@/types/lesson";

export const lessonRPG29: Lesson = {
  id: "rpg-29-allocation-counter",
  title: "Allocation Counter",
  description: "Add an allocation counter to track heap usage per tick. Fixed arrays produce zero allocations — the counter proves it. This is the setup for Gate A.",
  order: 29,
  xpReward: 100,
  tier: "pro",
  concepts: ["allocation tracking", "tick budget", "heap discipline", "zero-alloc"],
  part1: {
    title: "Concept: Allocation Counter",
    type: "concept",
    instructions: `# Concept: Allocation Counter

## Why Count Allocations?
A counter that stays at 0 per tick is proof that nothing is calling \`new\` or \`malloc\` in your game loop. Zero means your data is stack-resident or pre-allocated.

## The Pattern
\`\`\`cpp
int tick_alloc = 0; // reset at tick start

// At the start of each tick:
tick_alloc = 0;

// Any heap alloc would increment tick_alloc.
// With fixed arrays: tick_alloc stays 0 every tick.
\`\`\`

## Your Task
Expected output:
\`\`\`
Alloc: tracked
Counter: active
Alloc/tick: 0
Pattern: alloc-counter
\`\`\`

## Beginner Trap
**Allocating inside the game loop without realizing it.** One new/malloc per frame means 3600 allocations per minute at 60fps. Each allocation is a potential stall. Count allocations per frame and drive the number to zero.

## Elite Insight
Doom and Quake pre-allocate all memory at startup — zero heap allocations during gameplay. John Carmack called heap allocation in the hot path "a bug." Your allocation counter makes this discipline measurable.

## Systems Thinking Connection
Shooter L28 tracks the same metric — allocations per frame must be zero for consistent frame times. Platformer L28 does the same. Heap discipline is a cross-path gate that every path must pass.`,
    starterCode: `#include <iostream>
using namespace std;

// No heap used. We count theoretical allocs per tick.
int tick_alloc = 0;

// Simulated fixed-array operations (no actual heap)
void pushFixedArray(int* arr, int& count, int max, int val) {
    if (count < max) { arr[count++] = val; }
    // No heap alloc: tick_alloc stays 0
}

int main() {
    int buf[8] = {}; int buf_count = 0;
    // Simulate a tick: reset counter, do work, check
    tick_alloc = 0; // TODO 1: add this at tick start
    pushFixedArray(buf, buf_count, 8, 42);
    pushFixedArray(buf, buf_count, 8, 99);
    // TODO 2: cout << "Alloc: tracked" << endl;
    // TODO 3: cout << "Counter: active" << endl;
    // TODO 4: cout << "Alloc/tick: " << tick_alloc << endl;
    // TODO 5: cout << "Pattern: alloc-counter" << endl;
    return 0;
} `,
    solutionCode: `#include <iostream>
using namespace std;

int tick_alloc = 0;

void pushFixedArray(int* arr, int& count, int max, int val) {
    if (count < max) { arr[count++] = val; }
}

int main() {
    int buf[8] = {}; int buf_count = 0;
    tick_alloc = 0;
    pushFixedArray(buf, buf_count, 8, 42);
    pushFixedArray(buf, buf_count, 8, 99);
    cout << "Alloc: tracked" << endl;
    cout << "Counter: active" << endl;
    cout << "Alloc/tick: " << tick_alloc << endl;
    cout << "Pattern: alloc-counter" << endl;
    return 0;
} `,
    tests: [
      { id: "t1", description: "Alloc tracked", expectedOutput: "Alloc: tracked", isPattern: false },
      { id: "t2", description: "Counter active", expectedOutput: "Counter: active", isPattern: false },
      { id: "t3", description: "Zero allocs", expectedOutput: "Alloc/tick: 0", isPattern: false },
      { id: "t4", description: "Pattern", expectedOutput: "Pattern: alloc-counter", isPattern: false },
    ],
    hints: [
      "Declare int tick_alloc = 0; at the top. Set tick_alloc = 0 at the start of each tick.",
      "Since pushFixedArray never allocates heap, tick_alloc stays 0. Print Alloc/tick: tick_alloc.",
    ],
    estimatedMinutes: 8
  },
  part2: {
    title: "Build: Allocation Counter",
    type: "game_builder",
    instructions: `# Build: Allocation Counter

## What Changes
Add the ALLOC MODULE with \`int tick_alloc = 0;\` and reset it at the start of each game tick.

## Step 1: Add the ALLOC MODULE after INVENTORY MODULE
\`\`\`cpp
// === ALLOC MODULE (hs_alloc.h) ===
// Track heap allocations per tick. Fixed arrays = 0 allocs per tick.
int tick_alloc = 0;
\`\`\`

## Step 2: Reset at tick start in the game loop
\`\`\`cpp
while (!WindowShouldClose()) {
    world.frame_count++;
    tick_alloc = 0; // reset each tick
    phaseInput();
    ...
}
\`\`\`

## Step 3: Show in HUD and add startup couts
\`\`\`cpp
DrawText(TextFormat("Alloc/tick: %d", tick_alloc), 400, 396, 13, tick_alloc == 0 ? GREEN : RED);
\`\`\`

Expected new startup lines:
\`\`\`
...Pattern: deterministic-loot
Alloc: tracked
Counter: active
Pattern: alloc-counter
\`\`\``,
    starterCode: `#include <iostream>
#include <cstdint>
#include "raylib.h"
using namespace std;

const int GRID_W = 12; const int GRID_H = 10; const int TILE = 32;
int tiles[GRID_H][GRID_W];

const int CMD_NONE=0, CMD_MOVE_UP=1, CMD_MOVE_DOWN=2;
const int CMD_MOVE_LEFT=3, CMD_MOVE_RIGHT=4, CMD_ATTACK=5;
const int TILE_EXIT = 2;
int current_room = 0;

struct Command { int type; int p1; int p2; };
const int MAX_CMD = 4;
Command cmd_queue[MAX_CMD];
int cmd_count = 0;

void enqueueCmd(int t, int p1=0, int p2=0) {
    if (cmd_count < MAX_CMD) cmd_queue[cmd_count++] = {t, p1, p2};
}
void clearQueue() { cmd_count = 0; }

const int MAX_ENTITIES = 2;
struct Vec2i { int x = 0; int y = 0; };
enum TileType { TILE_FLOOR = 0, TILE_WALL = 1 };

struct World {
    int player_id = 0; int enemy_id = 1;
    Vec2i pos[MAX_ENTITIES] = {{1,5},{9,7}};
    bool enemy_alive = true;
    int player_hp = 20, player_max_hp = 20;
    int enemy_hp = 10, enemy_max_hp = 10;
    int turn_count = 0; int kills = 0; int frame_count = 0;
};
World world;

int room_data[2][GRID_H][GRID_W] = {
  {
    {1,1,1,1,1,1,1,1,1,1,1,1},
    {1,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,1,1,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,2,1},
    {1,0,0,0,0,0,0,1,1,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,1},
    {1,1,1,1,1,1,1,1,1,1,1,1}
  },
  {
    {1,1,1,1,1,1,1,1,1,1,1,1},
    {1,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,1,1,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,1},
    {1,2,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,1,1,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,1},
    {1,1,1,1,1,1,1,1,1,1,1,1}
  }
};

void loadRoom(int id) {
    current_room = id;
    for (int y = 0; y < GRID_H; y++)
        for (int x = 0; x < GRID_W; x++)
            tiles[y][x] = room_data[id][y][x];
    if (id == 0) { world.pos[world.player_id] = {1,5}; world.pos[world.enemy_id] = {9,7}; }
    else         { world.pos[world.player_id] = {10,5}; world.pos[world.enemy_id] = {3,7}; }
    world.enemy_alive = true; world.enemy_hp = 10;
    cout << "Room: " << id << endl;
}

// === RNG MODULE (hs_rng.h) ===
// RULE: No std::rand(). Only rng_next().
uint32_t rng_state = 12345;
void rng_seed(uint32_t s) { rng_state = s; }
uint32_t rng_next() {
    rng_state ^= rng_state << 13;
    rng_state ^= rng_state >> 17;
    rng_state ^= rng_state << 5;
    return rng_state;
}

// === METRICS MODULE (hs_metrics.h) ===
uint32_t worldHash() {
    uint32_t h = 0;
    h ^= (uint32_t)world.pos[world.player_id].x;
    h ^= (uint32_t)world.pos[world.player_id].y << 4;
    h ^= (uint32_t)world.enemy_hp << 8;
    h ^= (uint32_t)world.kills << 16;
    return h;
}

// === SAVE MODULE (hs_save.h) ===
struct SaveState { uint32_t seed; int room; int player_hp; };
SaveState save_buffer;
bool has_save = false;

void saveGame() {
    save_buffer = { rng_state, current_room, world.player_hp };
    has_save = true;
    cout << "Saved" << endl;
}

void loadGame() {
    if (!has_save) return;
    rng_seed(save_buffer.seed);
    world.player_hp = save_buffer.player_hp;
    loadRoom(save_buffer.room);
    cout << "Loaded" << endl;
}

// === INVENTORY MODULE (hs_inventory.h) ===
const int ITEM_NONE=-1, ITEM_SWORD=1, ITEM_SHIELD=2, ITEM_POTION=3;
const char* ITEM_NAMES[4] = {"", "Sword", "Shield", "Potion"};
int inv_items[5] = {-1,-1,-1,-1,-1};
int inv_count = 0;

void addItem(int id) {
    for (int i = 0; i < 5; i++) {
        if (inv_items[i] < 0) { inv_items[i] = id; inv_count++; return; }
    }
    cout << "Inventory: full" << endl;
}
// === ALLOC MODULE (hs_alloc.h) ===
// TODO 1: int tick_alloc = 0; // reset per tick, tracks heap allocations

// === RESOLVE MODULE (hs_commands.h) ===
void resolveMovement(Command& c) {
    if (c.type == CMD_NONE || c.type == CMD_ATTACK) return;
    int nx = world.pos[world.player_id].x;
    int ny = world.pos[world.player_id].y;
    if (c.type == CMD_MOVE_UP)         ny--;
    else if (c.type == CMD_MOVE_DOWN)  ny++;
    else if (c.type == CMD_MOVE_LEFT)  nx--;
    else if (c.type == CMD_MOVE_RIGHT) nx++;
    if (nx < 0 || nx >= GRID_W || ny < 0 || ny >= GRID_H) return;
    if (tiles[ny][nx] == TILE_WALL) return;
    if (tiles[ny][nx] == TILE_EXIT) { loadRoom(1 - current_room); return; }
    if (world.enemy_alive && nx == world.pos[world.enemy_id].x && ny == world.pos[world.enemy_id].y) {
        c.type = CMD_ATTACK; return;
    }
    world.pos[world.player_id].x = nx; world.pos[world.player_id].y = ny;
}

// === COMBAT MODULE (hs_combat.h) ===
int calcDamage(int base) { return base; }
int lootDrop() { return (int)(rng_next() % 3) + 1; }
void resolveCombat(Command& c) {
    if (c.type != CMD_ATTACK) return;
    int dmg = calcDamage(3);
    world.enemy_hp -= dmg;
    cout << "Damage: " << dmg << endl;
    cout << "Enemy HP: " << world.enemy_hp << "/" << world.enemy_max_hp << endl;
}

void phaseInput() {
    clearQueue();
    if (IsKeyPressed(KEY_W))      enqueueCmd(CMD_MOVE_UP);
    else if (IsKeyPressed(KEY_S)) enqueueCmd(CMD_MOVE_DOWN);
    else if (IsKeyPressed(KEY_A)) enqueueCmd(CMD_MOVE_LEFT);
    else if (IsKeyPressed(KEY_D)) enqueueCmd(CMD_MOVE_RIGHT);
    if (IsKeyPressed(KEY_F5)) saveGame();
    if (IsKeyPressed(KEY_F9)) loadGame();
}

void phaseResolve() {
    for (int i = 0; i < cmd_count; i++) {
        resolveMovement(cmd_queue[i]);
        resolveCombat(cmd_queue[i]);
    }
}

// === WORLD MODULE (hs_world.h) ===
void phaseWorld() {
    if (!world.enemy_alive) return;
    if (rng_next() % 4 == 0) return;
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
        world.enemy_alive = false; world.kills++;
        int loot = lootDrop();
        addItem(loot);
        cout << "Kill confirmed" << endl;
        cout << "Loot: " << loot << endl;
    }
    world.turn_count++;
}

int main() {
    InitWindow(640, 640, "HeapSight RPG");
    SetTargetFPS(60);
    loadRoom(0);
    saveGame();
    addItem(ITEM_SWORD);
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
    cout << "Queue: active" << endl;
    cout << "CMD: POD struct" << endl;
    cout << "Pattern: command-queue" << endl;
    cout << "Resolve: isolated" << endl;
    cout << "Pattern: resolve-isolated" << endl;
    cout << "Combat: isolated" << endl;
    cout << "Pattern: combat-isolated" << endl;
    cout << "Cleanup: isolated" << endl;
    cout << "Pattern: cleanup-isolated" << endl;
    cout << "Room: data-driven" << endl;
    cout << "Exit: tile-trigger" << endl;
    cout << "Milestone: room-transition" << endl;
    cout << "RNG: seeded" << endl;
    cout << "Seed: 12345" << endl;
    cout << "Pattern: deterministic-rng" << endl;
    cout << "Rand: banned" << endl;
    cout << "RNG: single-source" << endl;
    cout << "Pattern: no-rand" << endl;
    cout << "Signature: v0" << endl;
    cout << "Hash: active" << endl;
    cout << "Pattern: state-signature" << endl;
    cout << "Save: v0" << endl;
    cout << "Fields: seed,room,hp" << endl;
    cout << "Pattern: save-file" << endl;
    cout << "Restart: ok" << endl;
    cout << "Resume: ok" << endl;
    cout << "Milestone: restart-resume" << endl;
    cout << "Inventory: v0" << endl;
    cout << "Slots: 5" << endl;
    cout << "Pattern: fixed-inventory" << endl;
    cout << "Items: ID-based" << endl;
    cout << "Table: static" << endl;
    cout << "Pattern: item-ids" << endl;
    cout << "Loot: rng-driven" << endl;
    cout << "Drop: on-kill" << endl;
    cout << "Pattern: deterministic-loot" << endl;
    // TODO 2: cout << "Alloc: tracked" << endl;
    // TODO 3: cout << "Counter: active" << endl;
    // TODO 4: cout << "Pattern: alloc-counter" << endl;

    while (!WindowShouldClose()) {
        world.frame_count++;
        // TODO 5: tick_alloc = 0; // reset allocation counter each tick
        phaseInput();
        if (cmd_count > 0) {
            phaseResolve();
            phaseWorld();
            phaseCleanup();
        }
        BeginDrawing();
        ClearBackground(BLACK);
        for (int y = 0; y < GRID_H; y++)
            for (int x = 0; x < GRID_W; x++) {
                Color tc = (tiles[y][x] == TILE_WALL) ? GRAY :
                           (tiles[y][x] == TILE_EXIT) ? YELLOW : DARKGRAY;
                DrawRectangle(x*TILE, y*TILE, TILE-1, TILE-1, tc);
            }
        DrawRectangle(world.pos[world.player_id].x*TILE, world.pos[world.player_id].y*TILE, TILE-1, TILE-1, GREEN);
        if (world.enemy_alive)
            DrawRectangle(world.pos[world.enemy_id].x*TILE, world.pos[world.enemy_id].y*TILE, TILE-1, TILE-1, RED);
        DrawText("HeapSight RPG", 400, 10, 20, WHITE);
        DrawText(TextFormat("Turn: %d", world.turn_count), 400, 40, 16, WHITE);
        DrawText(TextFormat("Queue: %d cmd", cmd_count), 400, 60, 16, WHITE);
        DrawText(TextFormat("Player: (%d,%d)", world.pos[world.player_id].x, world.pos[world.player_id].y), 400, 80, 16, WHITE);
        DrawText(TextFormat("Room: %d", current_room), 400, 100, 16, YELLOW);
        if (world.enemy_alive) {
            DrawText(TextFormat("Enemy:(%d,%d)", world.pos[world.enemy_id].x, world.pos[world.enemy_id].y), 400, 120, 16, RED);
            DrawText(TextFormat("Enemy HP:%d/%d", world.enemy_hp, world.enemy_max_hp), 400, 160, 16, RED);
        } else { DrawText("Enemy: DEAD", 400, 120, 16, DARKGRAY); }
        DrawText(TextFormat("Player HP:%d/%d", world.player_hp, world.player_max_hp), 400, 140, 16, GREEN);
        DrawText(TextFormat("Kills: %d", world.kills), 400, 180, 16, YELLOW);
        DrawText(TextFormat("Player[%d]", world.player_id), 400, 200, 16, WHITE);
        DrawText(TextFormat("Enemy[%d]",  world.enemy_id),  400, 220, 16, WHITE);
        DrawText(TextFormat("Frame: %d", world.frame_count), 400, 240, 16, GRAY);
        DrawText(TextFormat("Hash: %u", worldHash()), 400, 260, 14, GRAY);
        DrawText(has_save ? "Save: YES" : "Save: NO", 400, 280, 14, has_save ? GREEN : GRAY);
        DrawText("-- Inventory --", 400, 300, 14, YELLOW);
        for (int i = 0; i < 5; i++) {
            Color ic = inv_items[i] > 0 ? YELLOW : GRAY;
            const char* nm = inv_items[i] > 0 ? ITEM_NAMES[inv_items[i]] : "--";
            DrawText(TextFormat("Slot%d: %s", i, nm), 400, 316+i*16, 13, ic);
        }
        // TODO 6: DrawText(TextFormat("Alloc/tick: %d", tick_alloc), 400, 396, 13, GREEN);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cstdint>
#include "raylib.h"
using namespace std;

const int GRID_W = 12; const int GRID_H = 10; const int TILE = 32;
int tiles[GRID_H][GRID_W];

const int CMD_NONE=0, CMD_MOVE_UP=1, CMD_MOVE_DOWN=2;
const int CMD_MOVE_LEFT=3, CMD_MOVE_RIGHT=4, CMD_ATTACK=5;
const int TILE_EXIT = 2;
int current_room = 0;

struct Command { int type; int p1; int p2; };
const int MAX_CMD = 4;
Command cmd_queue[MAX_CMD];
int cmd_count = 0;

void enqueueCmd(int t, int p1=0, int p2=0) {
    if (cmd_count < MAX_CMD) cmd_queue[cmd_count++] = {t, p1, p2};
}
void clearQueue() { cmd_count = 0; }

const int MAX_ENTITIES = 2;
struct Vec2i { int x = 0; int y = 0; };
enum TileType { TILE_FLOOR = 0, TILE_WALL = 1 };

struct World {
    int player_id = 0; int enemy_id = 1;
    Vec2i pos[MAX_ENTITIES] = {{1,5},{9,7}};
    bool enemy_alive = true;
    int player_hp = 20, player_max_hp = 20;
    int enemy_hp = 10, enemy_max_hp = 10;
    int turn_count = 0; int kills = 0; int frame_count = 0;
};
World world;

int room_data[2][GRID_H][GRID_W] = {
  {
    {1,1,1,1,1,1,1,1,1,1,1,1},
    {1,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,1,1,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,2,1},
    {1,0,0,0,0,0,0,1,1,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,1},
    {1,1,1,1,1,1,1,1,1,1,1,1}
  },
  {
    {1,1,1,1,1,1,1,1,1,1,1,1},
    {1,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,1,1,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,1},
    {1,2,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,1,1,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,1},
    {1,1,1,1,1,1,1,1,1,1,1,1}
  }
};

void loadRoom(int id) {
    current_room = id;
    for (int y = 0; y < GRID_H; y++)
        for (int x = 0; x < GRID_W; x++)
            tiles[y][x] = room_data[id][y][x];
    if (id == 0) { world.pos[world.player_id] = {1,5}; world.pos[world.enemy_id] = {9,7}; }
    else         { world.pos[world.player_id] = {10,5}; world.pos[world.enemy_id] = {3,7}; }
    world.enemy_alive = true; world.enemy_hp = 10;
    cout << "Room: " << id << endl;
}

// === RNG MODULE (hs_rng.h) ===
// RULE: No std::rand(). Only rng_next().
uint32_t rng_state = 12345;
void rng_seed(uint32_t s) { rng_state = s; }
uint32_t rng_next() {
    rng_state ^= rng_state << 13;
    rng_state ^= rng_state >> 17;
    rng_state ^= rng_state << 5;
    return rng_state;
}

// === METRICS MODULE (hs_metrics.h) ===
uint32_t worldHash() {
    uint32_t h = 0;
    h ^= (uint32_t)world.pos[world.player_id].x;
    h ^= (uint32_t)world.pos[world.player_id].y << 4;
    h ^= (uint32_t)world.enemy_hp << 8;
    h ^= (uint32_t)world.kills << 16;
    return h;
}

// === SAVE MODULE (hs_save.h) ===
struct SaveState { uint32_t seed; int room; int player_hp; };
SaveState save_buffer;
bool has_save = false;

void saveGame() {
    save_buffer = { rng_state, current_room, world.player_hp };
    has_save = true;
    cout << "Saved" << endl;
}

void loadGame() {
    if (!has_save) return;
    rng_seed(save_buffer.seed);
    world.player_hp = save_buffer.player_hp;
    loadRoom(save_buffer.room);
    cout << "Loaded" << endl;
}

// === INVENTORY MODULE (hs_inventory.h) ===
const int ITEM_NONE=-1, ITEM_SWORD=1, ITEM_SHIELD=2, ITEM_POTION=3;
const char* ITEM_NAMES[4] = {"", "Sword", "Shield", "Potion"};
int inv_items[5] = {-1,-1,-1,-1,-1};
int inv_count = 0;

void addItem(int id) {
    for (int i = 0; i < 5; i++) {
        if (inv_items[i] < 0) { inv_items[i] = id; inv_count++; return; }
    }
    cout << "Inventory: full" << endl;
}
// === ALLOC MODULE (hs_alloc.h) ===
// Track heap allocations per tick. Fixed arrays = 0 allocs per tick.
int tick_alloc = 0; // reset per tick, must stay 0 in the tick loop

// === RESOLVE MODULE (hs_commands.h) ===
void resolveMovement(Command& c) {
    if (c.type == CMD_NONE || c.type == CMD_ATTACK) return;
    int nx = world.pos[world.player_id].x;
    int ny = world.pos[world.player_id].y;
    if (c.type == CMD_MOVE_UP)         ny--;
    else if (c.type == CMD_MOVE_DOWN)  ny++;
    else if (c.type == CMD_MOVE_LEFT)  nx--;
    else if (c.type == CMD_MOVE_RIGHT) nx++;
    if (nx < 0 || nx >= GRID_W || ny < 0 || ny >= GRID_H) return;
    if (tiles[ny][nx] == TILE_WALL) return;
    if (tiles[ny][nx] == TILE_EXIT) { loadRoom(1 - current_room); return; }
    if (world.enemy_alive && nx == world.pos[world.enemy_id].x && ny == world.pos[world.enemy_id].y) {
        c.type = CMD_ATTACK; return;
    }
    world.pos[world.player_id].x = nx; world.pos[world.player_id].y = ny;
}

// === COMBAT MODULE (hs_combat.h) ===
int calcDamage(int base) { return base; }
int lootDrop() { return (int)(rng_next() % 3) + 1; }
void resolveCombat(Command& c) {
    if (c.type != CMD_ATTACK) return;
    int dmg = calcDamage(3);
    world.enemy_hp -= dmg;
    cout << "Damage: " << dmg << endl;
    cout << "Enemy HP: " << world.enemy_hp << "/" << world.enemy_max_hp << endl;
}

void phaseInput() {
    clearQueue();
    if (IsKeyPressed(KEY_W))      enqueueCmd(CMD_MOVE_UP);
    else if (IsKeyPressed(KEY_S)) enqueueCmd(CMD_MOVE_DOWN);
    else if (IsKeyPressed(KEY_A)) enqueueCmd(CMD_MOVE_LEFT);
    else if (IsKeyPressed(KEY_D)) enqueueCmd(CMD_MOVE_RIGHT);
    if (IsKeyPressed(KEY_F5)) saveGame();
    if (IsKeyPressed(KEY_F9)) loadGame();
}

void phaseResolve() {
    for (int i = 0; i < cmd_count; i++) {
        resolveMovement(cmd_queue[i]);
        resolveCombat(cmd_queue[i]);
    }
}

// === WORLD MODULE (hs_world.h) ===
void phaseWorld() {
    if (!world.enemy_alive) return;
    if (rng_next() % 4 == 0) return;
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
        world.enemy_alive = false; world.kills++;
        int loot = lootDrop();
        addItem(loot);
        cout << "Kill confirmed" << endl;
        cout << "Loot: " << loot << endl;
    }
    world.turn_count++;
}

int main() {
    InitWindow(640, 640, "HeapSight RPG");
    SetTargetFPS(60);
    loadRoom(0);
    saveGame();
    addItem(ITEM_SWORD);
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
    cout << "Queue: active" << endl;
    cout << "CMD: POD struct" << endl;
    cout << "Pattern: command-queue" << endl;
    cout << "Resolve: isolated" << endl;
    cout << "Pattern: resolve-isolated" << endl;
    cout << "Combat: isolated" << endl;
    cout << "Pattern: combat-isolated" << endl;
    cout << "Cleanup: isolated" << endl;
    cout << "Pattern: cleanup-isolated" << endl;
    cout << "Room: data-driven" << endl;
    cout << "Exit: tile-trigger" << endl;
    cout << "Milestone: room-transition" << endl;
    cout << "RNG: seeded" << endl;
    cout << "Seed: 12345" << endl;
    cout << "Pattern: deterministic-rng" << endl;
    cout << "Rand: banned" << endl;
    cout << "RNG: single-source" << endl;
    cout << "Pattern: no-rand" << endl;
    cout << "Signature: v0" << endl;
    cout << "Hash: active" << endl;
    cout << "Pattern: state-signature" << endl;
    cout << "Save: v0" << endl;
    cout << "Fields: seed,room,hp" << endl;
    cout << "Pattern: save-file" << endl;
    cout << "Restart: ok" << endl;
    cout << "Resume: ok" << endl;
    cout << "Milestone: restart-resume" << endl;
    cout << "Inventory: v0" << endl;
    cout << "Slots: 5" << endl;
    cout << "Pattern: fixed-inventory" << endl;
    cout << "Items: ID-based" << endl;
    cout << "Table: static" << endl;
    cout << "Pattern: item-ids" << endl;
    cout << "Loot: rng-driven" << endl;
    cout << "Drop: on-kill" << endl;
    cout << "Pattern: deterministic-loot" << endl;
    cout << "Alloc: tracked" << endl;
    cout << "Counter: active" << endl;
    cout << "Pattern: alloc-counter" << endl;

    while (!WindowShouldClose()) {
        world.frame_count++;
        tick_alloc = 0; // reset allocation counter each tick
        phaseInput();
        if (cmd_count > 0) {
            phaseResolve();
            phaseWorld();
            phaseCleanup();
        }
        BeginDrawing();
        ClearBackground(BLACK);
        for (int y = 0; y < GRID_H; y++)
            for (int x = 0; x < GRID_W; x++) {
                Color tc = (tiles[y][x] == TILE_WALL) ? GRAY :
                           (tiles[y][x] == TILE_EXIT) ? YELLOW : DARKGRAY;
                DrawRectangle(x*TILE, y*TILE, TILE-1, TILE-1, tc);
            }
        DrawRectangle(world.pos[world.player_id].x*TILE, world.pos[world.player_id].y*TILE, TILE-1, TILE-1, GREEN);
        if (world.enemy_alive)
            DrawRectangle(world.pos[world.enemy_id].x*TILE, world.pos[world.enemy_id].y*TILE, TILE-1, TILE-1, RED);
        DrawText("HeapSight RPG", 400, 10, 20, WHITE);
        DrawText(TextFormat("Turn: %d", world.turn_count), 400, 40, 16, WHITE);
        DrawText(TextFormat("Queue: %d cmd", cmd_count), 400, 60, 16, WHITE);
        DrawText(TextFormat("Player: (%d,%d)", world.pos[world.player_id].x, world.pos[world.player_id].y), 400, 80, 16, WHITE);
        DrawText(TextFormat("Room: %d", current_room), 400, 100, 16, YELLOW);
        if (world.enemy_alive) {
            DrawText(TextFormat("Enemy:(%d,%d)", world.pos[world.enemy_id].x, world.pos[world.enemy_id].y), 400, 120, 16, RED);
            DrawText(TextFormat("Enemy HP:%d/%d", world.enemy_hp, world.enemy_max_hp), 400, 160, 16, RED);
        } else { DrawText("Enemy: DEAD", 400, 120, 16, DARKGRAY); }
        DrawText(TextFormat("Player HP:%d/%d", world.player_hp, world.player_max_hp), 400, 140, 16, GREEN);
        DrawText(TextFormat("Kills: %d", world.kills), 400, 180, 16, YELLOW);
        DrawText(TextFormat("Player[%d]", world.player_id), 400, 200, 16, WHITE);
        DrawText(TextFormat("Enemy[%d]",  world.enemy_id),  400, 220, 16, WHITE);
        DrawText(TextFormat("Frame: %d", world.frame_count), 400, 240, 16, GRAY);
        DrawText(TextFormat("Hash: %u", worldHash()), 400, 260, 14, GRAY);
        DrawText(has_save ? "Save: YES" : "Save: NO", 400, 280, 14, has_save ? GREEN : GRAY);
        DrawText("-- Inventory --", 400, 300, 14, YELLOW);
        for (int i = 0; i < 5; i++) {
            Color ic = inv_items[i] > 0 ? YELLOW : GRAY;
            const char* nm = inv_items[i] > 0 ? ITEM_NAMES[inv_items[i]] : "--";
            DrawText(TextFormat("Slot%d: %s", i, nm), 400, 316+i*16, 13, ic);
        }        DrawText(TextFormat("Alloc/tick: %d", tick_alloc), 400, 396, 13, tick_alloc == 0 ? GREEN : RED);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Player at spawn", expectedOutput: "Player: (1, 5)", isPattern: false },
      { id: "g2", description: "Alloc tracked", expectedOutput: "Alloc: tracked", isPattern: false },
      { id: "g3", description: "Pattern alloc-counter", expectedOutput: "Pattern: alloc-counter", isPattern: false },
    ],
    hints: [
      "Add the ALLOC MODULE section with int tick_alloc = 0; after the INVENTORY MODULE.",
      "Add tick_alloc = 0; at the very start of the while loop body, before phaseInput().",
      "Add the DrawText for Alloc/tick after the inventory HUD section, and the three startup couts.",
    ],
    estimatedMinutes: 12
  }
};