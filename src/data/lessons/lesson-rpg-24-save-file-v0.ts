import { Lesson } from "@/types/lesson";

export const lessonRPG24: Lesson = {
  id: "rpg-24-save-file-v0",
  title: "Save File v0",
  description: "Add a save system using a fixed SaveState struct. Capture seed, room, and player HP. No heap allocation — the save buffer is a global struct.",
  order: 24,
  xpReward: 100,
  tier: "pro",
  concepts: ["save state", "serialization", "fixed struct", "no heap"],
  part1: {
    title: "Concept: Save File v0",
    type: "concept",
    instructions: `# Concept: Save File v0

## What to Save
A minimal save file captures just enough to recreate the game state:
- **Seed**: re-run the RNG from this point
- **Room**: which room the player is in
- **HP**: player health at save time

## No Heap, No File IO
We use a fixed-size struct as an in-memory save buffer.
For WASM, this is all we need. The browser handles persistence separately.

\`\`\`cpp
struct SaveState {
    uint32_t seed;
    int room;
    int player_hp;
};
SaveState save_buffer;

void saveGame() {
    save_buffer.seed = rng_state;
    save_buffer.room = current_room;
    save_buffer.player_hp = world.player_hp;
}
\`\`\`

## Your Task
Save a state and print the fields:

Expected output:
\`\`\`
Saved seed: 12345
Saved room: 0
Saved hp: 20
Save: v0
Pattern: save-file
\`\`\`

## Beginner Trap
**Writing raw structs to disk with fwrite().** Struct padding and field alignment differ between compilers and platforms. A save file from one build may be garbage on another. Serialize field by field in a defined order.

## Elite Insight
Bethesda save files (Skyrim, Fallout) use tagged key-value pairs so new fields do not break old saves. Each field has a string tag and a type marker. Your explicit field-by-field write is the simplified version of this approach.

## Systems Thinking Connection
Every path implements save/load — Platformer uses checkpoint-based saves (L24), Shooter saves high scores and progress. The serialization pattern is identical: write fields in order, read them back in the same order.`,
    starterCode: `#include <iostream>
#include <cstdint>
using namespace std;

uint32_t rng_state = 12345;
int current_room = 0;
int player_hp = 20;

struct SaveState { uint32_t seed; int room; int player_hp; };
SaveState save_buffer;

void saveGame() {
    // TODO 1: save_buffer.seed = rng_state;
    // TODO 2: save_buffer.room = current_room;
    // TODO 3: save_buffer.player_hp = player_hp;
}

int main() {
    saveGame();
    // TODO 4: cout << "Saved seed: " << save_buffer.seed << endl;
    // TODO 5: cout << "Saved room: " << save_buffer.room << endl;
    // TODO 6: cout << "Saved hp: " << save_buffer.player_hp << endl;
    // TODO 7: cout << "Save: v0" << endl;
    // TODO 8: cout << "Pattern: save-file" << endl;
    return 0;
} `,
    solutionCode: `#include <iostream>
#include <cstdint>
using namespace std;

uint32_t rng_state = 12345;
int current_room = 0;
int player_hp = 20;

struct SaveState { uint32_t seed; int room; int player_hp; };
SaveState save_buffer;

void saveGame() {
    save_buffer.seed = rng_state;
    save_buffer.room = current_room;
    save_buffer.player_hp = player_hp;
}

int main() {
    saveGame();
    cout << "Saved seed: " << save_buffer.seed << endl;
    cout << "Saved room: " << save_buffer.room << endl;
    cout << "Saved hp: " << save_buffer.player_hp << endl;
    cout << "Save: v0" << endl;
    cout << "Pattern: save-file" << endl;
    return 0;
} `,
    tests: [
      { id: "t1", description: "Seed saved", expectedOutput: "Saved seed: 12345", isPattern: false },
      { id: "t2", description: "HP saved", expectedOutput: "Saved hp: 20", isPattern: false },
      { id: "t3", description: "Pattern confirmed", expectedOutput: "Pattern: save-file", isPattern: false },
    ],
    hints: [
      "In saveGame, copy rng_state to save_buffer.seed, current_room to save_buffer.room, player_hp to save_buffer.player_hp.",
      "After calling saveGame() in main, print each save_buffer field.",
      "Then print Save: v0 and Pattern: save-file.",
    ],
    estimatedMinutes: 10
  },
  part2: {
    title: "Build: Save File v0",
    type: "game_builder",
    instructions: `# Build: Save File v0

## What Changes
Add a \`SaveState\` struct, \`saveGame()\`, and \`loadGame()\` functions. Press S to save, L to load.

## Step 1: Add save system
\`\`\`cpp
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
\`\`\`

## Step 2: Add S/L key handling in phaseInput
\`\`\`cpp
if (IsKeyPressed(KEY_F5)) saveGame();
if (IsKeyPressed(KEY_F9)) loadGame();
\`\`\`

## Step 3: Add startup couts
\`\`\`cpp
cout << "Save: v0" << endl;
cout << "Fields: seed,room,hp" << endl;
cout << "Pattern: save-file" << endl;
\`\`\`

**Click Run** — press F5 to save, F9 to load.

Expected new startup lines:
\`\`\`
...Pattern: state-signature
Save: v0
Fields: seed,room,hp
Pattern: save-file
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

// TODO 1: Add // === SAVE MODULE (hs_save.h) ===
// TODO 2: struct SaveState { uint32_t seed; int room; int player_hp; };
// TODO 3: SaveState save_buffer; bool has_save = false;
// TODO 4: void saveGame() { save_buffer = {rng_state, current_room, world.player_hp}; has_save=true; }
// TODO 5: void loadGame() { if(!has_save)return; rng_seed(save_buffer.seed); ... loadRoom(...); }

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
    // TODO 6: if (IsKeyPressed(KEY_F5)) saveGame();
    // TODO 7: if (IsKeyPressed(KEY_F9)) loadGame();
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
    // Deterministic: skip move 1 in 4 times using RNG
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
    // TODO 8: cout << "Save: v0" << endl;
    // TODO 9: cout << "Fields: seed,room,hp" << endl;
    // TODO 10: cout << "Pattern: save-file" << endl;

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
    // Deterministic: skip move 1 in 4 times using RNG
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
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Player at spawn", expectedOutput: "Player: (1, 5)", isPattern: false },
      { id: "g2", description: "Save fields", expectedOutput: "Fields: seed,room,hp", isPattern: false },
      { id: "g3", description: "Pattern save-file", expectedOutput: "Pattern: save-file", isPattern: false },
    ],
    hints: [
      "Define struct SaveState { uint32_t seed; int room; int player_hp; } and a global save_buffer.",
      "saveGame copies rng_state, current_room, world.player_hp into save_buffer.",
      "loadGame calls rng_seed(save_buffer.seed) then loadRoom(save_buffer.room) and restores HP.",
    ],
    estimatedMinutes: 18
  }
};