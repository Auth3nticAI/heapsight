import { Lesson } from "@/types/lesson";

export const lessonRPG26: Lesson = {
  id: "rpg-26-inventory-v0",
  title: "Inventory v0 (Fixed Size)",
  description: "Build a 5-slot fixed-size inventory as a plain int array. No std::vector, no heap. Item slots live on the stack, accessible in O(1).",
  order: 26,
  xpReward: 100,
  tier: "pro",
  concepts: ["inventory", "fixed arrays", "stack allocation", "item slots"],
  part1: {
    title: "Concept: Inventory v0 (Fixed Size)",
    type: "concept",
    instructions: `# Concept: Inventory v0 (Fixed Size)

## The Problem With std::vector
If you write \`std::vector<int> inventory;\` in your tick loop, every push allocates heap memory. That breaks determinism and triggers the allocator. We want \`zero\` heap allocations per tick.

## Fixed Array Solution
An inventory is a fixed-size array of item IDs. -1 means empty.
\`\`\`cpp
int inv_items[5] = {-1,-1,-1,-1,-1}; // 5 slots, stack allocated
int inv_count = 0;

void addItem(int id) {
    for (int i = 0; i < 5; i++) {
        if (inv_items[i] < 0) { inv_items[i] = id; inv_count++; return; }
    }
    // full - reject silently or log
}
\`\`\`

## Your Task
Expected output:
\`\`\`
Inventory: v0
Slots: 5
Slot 0: 1
Slot 1: 2
Slot 2: 3
Slot 3: -1
Slot 4: -1
Pattern: fixed-inventory
\`\`\`

## Beginner Trap
**Using item name strings as identifiers.** "Health Potion" vs "health_potion" vs "HealthPotion" all look different to strcmp(). Use integer IDs internally. Names are display-only strings looked up from a table.

## Elite Insight
Diablo II stores items as numeric IDs internally — names are display strings looked up from a localization table. This makes translation trivial: change the name table, not the game logic. Your ID-based inventory follows the same architecture.

## Systems Thinking Connection
Crawler L48 implements loot tables with the same ID-based approach — items are data entries, not hardcoded strings. The Shooter uses powerup type IDs (L43). Integer-keyed item systems scale across every game genre.`,
    starterCode: `#include <iostream>
using namespace std;

int inv_items[5] = {-1,-1,-1,-1,-1};
int inv_count = 0;

void addItem(int id) {
    for (int i = 0; i < 5; i++) {
        if (inv_items[i] < 0) { inv_items[i] = id; inv_count++; return; }
    }
    // TODO 1: print "Inventory: full" when no empty slot found
}

int main() {
    addItem(1); addItem(2); addItem(3);
    // TODO 2: cout << "Inventory: v0" << endl;
    // TODO 3: cout << "Slots: 5" << endl;
    // TODO 4: loop i=0..4, cout << "Slot " << i << ": " << inv_items[i] << endl;
    // TODO 5: cout << "Pattern: fixed-inventory" << endl;
    return 0;
} `,
    solutionCode: `#include <iostream>
using namespace std;

int inv_items[5] = {-1,-1,-1,-1,-1};
int inv_count = 0;

void addItem(int id) {
    for (int i = 0; i < 5; i++) {
        if (inv_items[i] < 0) { inv_items[i] = id; inv_count++; return; }
    }
    cout << "Inventory: full" << endl;
}

int main() {
    addItem(1); addItem(2); addItem(3);
    cout << "Inventory: v0" << endl;
    cout << "Slots: 5" << endl;
    for (int i = 0; i < 5; i++) {
        cout << "Slot " << i << ": " << inv_items[i] << endl;
    }
    cout << "Pattern: fixed-inventory" << endl;
    return 0;
} `,
    tests: [
      { id: "t1", description: "Inventory v0", expectedOutput: "Inventory: v0", isPattern: false },
      { id: "t2", description: "Slots 5", expectedOutput: "Slots: 5", isPattern: false },
      { id: "t3", description: "Pattern", expectedOutput: "Pattern: fixed-inventory", isPattern: false },
    ],
    hints: [
      "Declare int inv_items[5] = {-1,-1,-1,-1,-1}; and int inv_count = 0; before addItem.",
      "In addItem, loop i=0..4: if inv_items[i] < 0, set it to id and increment inv_count, then return.",
      "In main: print Inventory: v0, Slots: 5, then loop printing each slot.",
    ],
    estimatedMinutes: 10
  },
  part2: {
    title: "Build: Inventory v0 (Fixed Size)",
    type: "game_builder",
    instructions: `# Build: Inventory v0 (Fixed Size)

## What Changes
Add the \`// === INVENTORY MODULE (hs_inventory.h) ===\` section. Three things:
1. \`int inv_items[5] = {-1,-1,-1,-1,-1};\` — five stack slots
2. \`int inv_count = 0;\` — how many slots are filled
3. \`void addItem(int id)\` — scan for -1, fill it

## Step 1: Add the inventory module
\`\`\`cpp
// === INVENTORY MODULE (hs_inventory.h) ===
int inv_items[5] = {-1,-1,-1,-1,-1};
int inv_count = 0;

void addItem(int id) {
    for (int i = 0; i < 5; i++) {
        if (inv_items[i] < 0) { inv_items[i] = id; inv_count++; return; }
    }
    cout << "Inventory: full" << endl;
}
\`\`\`

## Step 2: Add startup items and couts
\`\`\`cpp
addItem(1); addItem(2); addItem(3);
cout << "Inventory: v0" << endl;
cout << "Slots: 5" << endl;
cout << "Pattern: fixed-inventory" << endl;
\`\`\`

## Step 3: Render inventory in HUD
\`\`\`cpp
DrawText("-- Inventory --", 400, 300, 14, YELLOW);
for (int i = 0; i < 5; i++) {
    Color ic = inv_items[i] >= 0 ? YELLOW : GRAY;
    DrawText(TextFormat("Slot%d: %d", i, inv_items[i]), 400, 316+i*16, 13, ic);
}
\`\`\`

Expected new startup lines:
\`\`\`
...Milestone: restart-resume
Inventory: v0
Slots: 5
Pattern: fixed-inventory
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
// TODO 1: int inv_items[5] = {-1,-1,-1,-1,-1};
// TODO 2: int inv_count = 0;
// TODO 3: void addItem(int id) { scan for empty slot (-1), set it to id, increment inv_count }

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
        cout << "Kill confirmed" << endl;
    }
    world.turn_count++;
}

int main() {
    InitWindow(640, 640, "HeapSight RPG");
    SetTargetFPS(60);
    loadRoom(0);
    saveGame();
    // TODO 4: addItem(1); addItem(2); addItem(3);
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
    // TODO 5: cout << "Inventory: v0" << endl;
    // TODO 6: cout << "Slots: 5" << endl;
    // TODO 7: cout << "Pattern: fixed-inventory" << endl;

    while (!WindowShouldClose()) {
        world.frame_count++;
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
        // TODO 8: DrawText("-- Inventory --", 400, 300, 14, YELLOW);
        // TODO 9: for each slot i, DrawText inv_items[i] content
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
int inv_items[5] = {-1,-1,-1,-1,-1};
int inv_count = 0;

void addItem(int id) {
    for (int i = 0; i < 5; i++) {
        if (inv_items[i] < 0) { inv_items[i] = id; inv_count++; return; }
    }
    cout << "Inventory: full" << endl;
}

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
        cout << "Kill confirmed" << endl;
    }
    world.turn_count++;
}

int main() {
    InitWindow(640, 640, "HeapSight RPG");
    SetTargetFPS(60);
    loadRoom(0);
    saveGame();
    addItem(1); addItem(2); addItem(3);
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

    while (!WindowShouldClose()) {
        world.frame_count++;
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
            Color ic = inv_items[i] >= 0 ? YELLOW : GRAY;
            DrawText(TextFormat("Slot%d: %d", i, inv_items[i]), 400, 316+i*16, 13, ic);
        }
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Player at spawn", expectedOutput: "Player: (1, 5)", isPattern: false },
      { id: "g2", description: "Milestone restart", expectedOutput: "Milestone: restart-resume", isPattern: false },
      { id: "g3", description: "Inventory v0", expectedOutput: "Inventory: v0", isPattern: false },
      { id: "g4", description: "Pattern fixed-inventory", expectedOutput: "Pattern: fixed-inventory", isPattern: false },
    ],
    hints: [
      "Add the INVENTORY MODULE section after the SAVE MODULE. Declare inv_items[5] initialized to -1 and addItem().",
      "Call addItem(1), addItem(2), addItem(3) in main after saveGame().",
      "In the HUD render loop, add the inventory display lines after the Save status.",
    ],
    estimatedMinutes: 15
  }
};