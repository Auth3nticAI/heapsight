import { Lesson } from "@/types/lesson";

export const lessonRPG22: Lesson = {
  id: "rpg-22-no-rand-rule",
  title: "No-rand Rule",
  description: "Enforce a discipline: one RNG, no std::rand. Every random number in the game comes from rng_next(). This makes the game fully reproducible.",
  order: 22,
  xpReward: 100,
  tier: "pro",
  concepts: ["discipline", "single RNG source", "reproducibility", "banned functions"],
  part1: {
    title: "Concept: No-rand Rule",
    type: "concept",
    instructions: `# Concept: No-rand Rule

## The Problem: Hidden Randomness
If two systems both call \`rand()\` independently, their random sequences interleave.
The output depends on call ORDER. Change one system, corrupt the other.
The game is no longer reproducible.

## The Rule
One game, one RNG, one seed. ALL randomness flows through \`rng_next()\`.
\`\`\`cpp
// BANNED:
// int x = rand() % 10;  // DO NOT USE

// APPROVED:
int x = rng_next() % 10;  // single source of truth
\`\`\`

## Your Task
Demonstrate that two calls use the same RNG state (both advance the sequence):

Expected output:
\`\`\`
A: 3
B: 6
Rand: banned
RNG: single-source
Pattern: no-rand
\`\`\`

## Beginner Trap
**Calling rand() directly in gameplay code instead of the game RNG function.** One stray rand() call breaks determinism silently. The bug is invisible until a replay diverges hundreds of frames later.

## Elite Insight
Factorio bans all non-deterministic calls in gameplay code — their multiplayer depends on perfect lockstep. A single desync crashes the session. Your no-rand rule enforces the same discipline at a smaller scale.

## Systems Thinking Connection
The Shooter enforces the same rule — all randomness routes through GameRNG, never through rand(). The Platformer and Crawler follow suit. This discipline is a prerequisite for replay in every path.`,
    starterCode: `#include <iostream>
#include <cstdint>
using namespace std;

uint32_t rng_state = 99;
uint32_t rng_next() {
    rng_state ^= rng_state << 13;
    rng_state ^= rng_state >> 17;
    rng_state ^= rng_state << 5;
    return rng_state;
}

int main() {
    // TODO 1: int a = rng_next() % 10; cout << "A: " << a << endl;
    // TODO 2: int b = rng_next() % 10; cout << "B: " << b << endl;
    // TODO 3: cout << "Rand: banned" << endl;
    // TODO 4: cout << "RNG: single-source" << endl;
    // TODO 5: cout << "Pattern: no-rand" << endl;
    return 0;
} `,
    solutionCode: `#include <iostream>
#include <cstdint>
using namespace std;

uint32_t rng_state = 99;
uint32_t rng_next() {
    rng_state ^= rng_state << 13;
    rng_state ^= rng_state >> 17;
    rng_state ^= rng_state << 5;
    return rng_state;
}

int main() {
    int a = rng_next() % 10; cout << "A: " << a << endl;
    int b = rng_next() % 10; cout << "B: " << b << endl;
    cout << "Rand: banned" << endl;
    cout << "RNG: single-source" << endl;
    cout << "Pattern: no-rand" << endl;
    return 0;
} `,
    tests: [
      { id: "t1", description: "A value printed", expectedOutput: "A: 3", isPattern: false },
      { id: "t2", description: "Rand banned", expectedOutput: "Rand: banned", isPattern: false },
      { id: "t3", description: "Pattern confirmed", expectedOutput: "Pattern: no-rand", isPattern: false },
    ],
    hints: [
      "int a = rng_next() % 10; then print A: and the value.",
      "int b = rng_next() % 10; then print B: and the value.",
      "Print the three pattern couts in order.",
    ],
    estimatedMinutes: 8
  },
  part2: {
    title: "Build: No-rand Rule",
    type: "game_builder",
    instructions: `# Build: No-rand Rule

## What Changes
Add a comment at the top of the RNG module declaring the no-rand rule.
This is an architecture discipline — code documentation that enforces the contract.

## Step 1: Add the rule comment to the RNG module
\`\`\`cpp
// === RNG MODULE (hs_rng.h) ===
// RULE: No std::rand() anywhere in the codebase. Only rng_next().
uint32_t rng_state = 12345;
// ...
\`\`\`

## Step 2: Add startup couts
\`\`\`cpp
cout << "Rand: banned" << endl;
cout << "RNG: single-source" << endl;
cout << "Pattern: no-rand" << endl;
\`\`\`

**Click Run** — no gameplay change. The architecture is now documented.

Expected new startup lines:
\`\`\`
...Pattern: deterministic-rng
Rand: banned
RNG: single-source
Pattern: no-rand
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
uint32_t rng_state = 12345;
void rng_seed(uint32_t s) { rng_state = s; }
uint32_t rng_next() {
    rng_state ^= rng_state << 13;
    rng_state ^= rng_state >> 17;
    rng_state ^= rng_state << 5;
    return rng_state;
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
    // TODO 1: cout << "Rand: banned" << endl;
    // TODO 2: cout << "RNG: single-source" << endl;
    // TODO 3: cout << "Pattern: no-rand" << endl;

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
// RULE: No std::rand() anywhere. Only rng_next().
uint32_t rng_state = 12345;
void rng_seed(uint32_t s) { rng_state = s; }
uint32_t rng_next() {
    rng_state ^= rng_state << 13;
    rng_state ^= rng_state >> 17;
    rng_state ^= rng_state << 5;
    return rng_state;
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
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Player at spawn", expectedOutput: "Player: (1, 5)", isPattern: false },
      { id: "g2", description: "Pattern no-rand", expectedOutput: "Pattern: no-rand", isPattern: false },
      { id: "g3", description: "Rand banned", expectedOutput: "Rand: banned", isPattern: false },
    ],
    hints: [
      "Add // RULE: No std::rand(). Only rng_next(). as a comment in the RNG section.",
      "Add the three startup couts after Pattern: deterministic-rng.",
      "No gameplay changes — this is architecture documentation.",
    ],
    estimatedMinutes: 10
  }
};