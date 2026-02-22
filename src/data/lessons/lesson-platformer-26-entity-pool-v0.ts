import type { Lesson } from "@/types/lesson";

const lessonPlatformer26: Lesson = {
  id: "platformer-26-entity-pool-v0",
  title: "Entity Pool v0",
  description: "Replace per-frame enemy allocation with a fixed-size pool array. Pool allocation: allocate once, reuse forever.",
  order: 26,
  xpReward: 100,
  tier: "pro",
  concepts: ["entity pool", "pool allocation", "active flag", "fixed array"],
  part1: {
    title: "Pool: Allocate Once, Reuse Forever",
    type: "concept",
    instructions: `# Entity Pool v0

## The Problem
Games that spawn enemies have two options:
1. Use new/delete every frame (heap pressure, fragmentation, unpredictable latency)
2. Pre-allocate a fixed pool and reuse slots (zero heap in game loop)

The pool approach is how every professional game handles dynamic objects.
You pay the allocation cost once at startup. During gameplay: zero heap traffic.

## The Pattern
A pool is a fixed-size array of structs plus an active flag per entry.
To spawn: find an inactive slot, mark it active, initialize fields.
To despawn: mark the slot inactive. The memory is never freed.

## Your Task
Define an Enemy struct with x, y, speed, and active flag.
Create a fixed pool of MAX_ENEMIES enemies.
Write spawnEnemy and killEnemy functions.
Spawn 3 enemies, kill 1, count actives, print results.

## Expected Output
\`\`\`
Pool size: 8
Spawned: 3
After kill: 2 active
Pattern: entity-pool
\`\`\``,
    starterCode: `#include <iostream>
using namespace std;

const int MAX_ENEMIES = 8;

struct Enemy {
    float x, y, speed;
    bool active;
};

Enemy pool[MAX_ENEMIES];

// Find an inactive slot and initialize it
void spawnEnemy(float x, float y, float speed) {
    // TODO 1: loop through pool[]
    // TODO 2: if (!pool[i].active) { pool[i] = {x, y, speed, true}; return; }
}

void killEnemy(int idx) {
    // TODO 3: pool[idx].active = false;
}

int countActive() {
    int n = 0;
    // TODO 4: for each pool entry: if (pool[i].active) n++;
    return n;
}

int main() {
    // Zero-initialize pool
    for (int i = 0; i < MAX_ENEMIES; i++) pool[i].active = false;
    cout << "Pool size: " << MAX_ENEMIES << endl;
    spawnEnemy(100, 200, 50);
    spawnEnemy(300, 200, 75);
    spawnEnemy(500, 200, 60);
    cout << "Spawned: " << countActive() << endl;
    killEnemy(1);
    cout << "After kill: " << countActive() << " active" << endl;
    cout << "Pattern: entity-pool" << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAX_ENEMIES = 8;

struct Enemy {
    float x, y, speed;
    bool active;
};

Enemy pool[MAX_ENEMIES];

void spawnEnemy(float x, float y, float speed) {
    for (int i = 0; i < MAX_ENEMIES; i++)
        if (!pool[i].active) { pool[i] = {x, y, speed, true}; return; }
}

void killEnemy(int idx) {
    pool[idx].active = false;
}

int countActive() {
    int n = 0;
    for (int i = 0; i < MAX_ENEMIES; i++) if (pool[i].active) n++;
    return n;
}

int main() {
    for (int i = 0; i < MAX_ENEMIES; i++) pool[i].active = false;
    cout << "Pool size: " << MAX_ENEMIES << endl;
    spawnEnemy(100, 200, 50);
    spawnEnemy(300, 200, 75);
    spawnEnemy(500, 200, 60);
    cout << "Spawned: " << countActive() << endl;
    killEnemy(1);
    cout << "After kill: " << countActive() << " active" << endl;
    cout << "Pattern: entity-pool" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Pool size printed", expectedOutput: "Pool size: 8" },
      { id: "t2", description: "Spawned 3", expectedOutput: "Spawned: 3" },
      { id: "t3", description: "After kill: 2 active", expectedOutput: "After kill: 2 active" },
      { id: "t4", description: "Pattern printed", expectedOutput: "Pattern: entity-pool" },
    ],
    hints: [
      'In spawnEnemy: iterate pool[0..MAX_ENEMIES-1], find first where active==false, set fields.',
      'In killEnemy: pool[idx].active = false. The memory stays; just the flag changes.',
      'In countActive: loop and count pool[i].active == true entries.',
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: Patrol Enemies from Pool",
    type: "game_builder",
    instructions: `# Build: Enemies from Fixed Pool

## What You Are Building
Add 8 patrol enemies to the platformer using a fixed-size pool.
Enemies bounce left/right. Touching an enemy resets the player to spawn.
No heap: the enemy array is global, initialized once, never deleted.

## New Structs and Globals
\`\`\`
const int MAX_ENEMIES = 8;
struct Enemy { float x, y, vx; bool active; };
Enemy enemies[MAX_ENEMIES];
int enemy_count = 0;
\`\`\`

## New Functions to Write
\`\`\`
void spawnEnemy(float x, float y, float vx) {
    if (enemy_count >= MAX_ENEMIES) return;
    enemies[enemy_count++] = {x, y, vx, true};
}

void updateEnemies(float dt) {
    for (int i = 0; i < enemy_count; i++) {
        if (!enemies[i].active) continue;
        enemies[i].x += enemies[i].vx * dt;
        // Bounce off walls
        if (enemies[i].x < 32 || enemies[i].x > SCREEN_W - 64)
            enemies[i].vx = -enemies[i].vx;
    }
}
\`\`\`

## In initWorld: spawn enemies after scrambleCoins
\`\`\`
spawnEnemy(150, 380, 60.0f);
spawnEnemy(350, 380, -80.0f);
spawnEnemy(550, 350, 70.0f);
\`\`\`

## In game loop: update and draw enemies
\`\`\`
updateEnemies(FIXED_DT);
// Draw: red rectangles 20x20
for (int i = 0; i < enemy_count; i++)
    if (enemies[i].active)
        DrawRectangle((int)enemies[i].x, (int)enemies[i].y, 20, 20, RED);
\`\`\`

## Expected Cout Output
\`\`\`
Entity pool: active
Enemies: 3
Heap: 0 allocs
Pattern: entity-pool
\`\`\``,
    starterCode: `#include <iostream>
#include <cstring>
#include "raylib.h"
using namespace std;

const int SCREEN_W = 800;
const int SCREEN_H = 450;
const float GRAVITY = 800.0f;
const float FIXED_DT = 1.0f / 60.0f;
const int PLAYER_W = 24;
const int PLAYER_H = 24;
const float JUMP_SPEED = 400.0f;
const float MIN_JUMP_VY = 150.0f;
const float ACCEL = 600.0f;
const float AIR_ACCEL = 300.0f;
const float FRICTION = 500.0f;
const float MAX_RUN = 200.0f;
const float COYOTE_TIME = 0.1f;
const float JUMP_BUFFER = 0.1f;
const int TILE_SIZE = 32;
const int COLS = 25;
const int ROWS = 14;
const int NUM_LEVELS = 2;
const int MAX_ENEMIES = 8;

const int LEVEL_DATA[NUM_LEVELS][ROWS][COLS] = {
    {
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,2,0,0,0,0,0,0,2,0,0,0,0,2,0,0,0,0,0,1},
    {1,0,0,0,1,1,1,0,0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,2,0,0,0,0,0,2,0,0,2,0,0,0,0,2,0,0,0,0,2,0,0,1},
    {1,1,1,0,0,0,0,1,1,1,0,1,1,1,0,0,1,1,0,0,1,1,1,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,1},
    {1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,1,1,1,1,0,0,1,1,1,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,2,0,0,2,0,0,0,2,0,0,2,0,0,0,2,0,0,2,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,1,1,1,1,0,0,1,1,1,1,1,0,0,1,1,1,1,1,0,0,1,1,1,1},
    },
    {
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,2,0,2,0,0,0,0,0,2,0,2,0,0,0,0,0,2,0,2,0,0,0,1},
    {1,0,1,1,1,0,0,0,0,0,1,1,1,0,0,0,0,0,1,1,1,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,2,0,0,0,0,0,0,2,0,0,0,0,2,0,0,0,0,2,0,0,0,0,1},
    {1,1,1,1,0,0,0,0,1,1,1,0,0,1,1,1,0,0,1,1,1,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1},
    },
};

enum MoveState { GROUNDED, AIRBORNE };
enum Command { CMD_NONE, CMD_LEFT, CMD_RIGHT };

struct Player {
    float x, y;
    float vx, vy;
    MoveState state;
    float coyote_timer;
    float jump_buffer_timer;
};

struct Enemy { float x, y, vx; bool active; };
Enemy enemies[MAX_ENEMIES];
int enemy_count = 0;

struct World {
    Player player;
    int tilemap[ROWS][COLS];
    int score;
    Command cmd;
    int level_index;
};

World w;

unsigned lcg_state = 0;
unsigned lcgNext() {
    lcg_state = lcg_state * 1664525u + 1013904223u;
    return lcg_state;
}

void scrambleCoins(World& w, unsigned seed) {
    lcg_state = seed;
    for (int r = 0; r < ROWS; r++)
        for (int c = 0; c < COLS; c++)
            if (w.tilemap[r][c] == 2) w.tilemap[r][c] = 0;
    int placed = 0, tries = 0;
    while (placed < 8 && tries < 1000) {
        tries++;
        int r = lcgNext() % ROWS;
        int c = lcgNext() % COLS;
        if (w.tilemap[r][c] == 0) { w.tilemap[r][c] = 2; placed++; }
    }
}

void spawnEnemy(float x, float y, float vx) {
    // TODO 1: if (enemy_count >= MAX_ENEMIES) return;
    // TODO 2: enemies[enemy_count++] = {x, y, vx, true};
}

void updateEnemies(float dt) {
    for (int i = 0; i < enemy_count; i++) {
        if (!enemies[i].active) continue;
        // TODO 3: enemies[i].x += enemies[i].vx * dt;
        // TODO 4: if (enemies[i].x < 32 || enemies[i].x > SCREEN_W - 64) enemies[i].vx = -enemies[i].vx;
    }
}

float ckpt_x = 48.0f, ckpt_y = 350.0f;
int ckpt_score = 0, ckpt_level = 0;
bool ckpt_valid = false;
unsigned saved_sig = 0;
bool sig_matched = false;

void loadLevel(World& w) {
    memcpy(w.tilemap, LEVEL_DATA[w.level_index], sizeof(w.tilemap));
}

void saveCheckpoint(World& w) {
    ckpt_x = w.player.x; ckpt_y = w.player.y;
    ckpt_score = w.score; ckpt_level = w.level_index;
    ckpt_valid = true;
}

void loadCheckpoint(World& w) {
    if (!ckpt_valid) return;
    w.level_index = ckpt_level;
    loadLevel(w);
    scrambleCoins(w, 42 + ckpt_level * 94);
    w.player.x = ckpt_x; w.player.y = ckpt_y;
    w.player.vx = 0; w.player.vy = 0;
    w.player.state = GROUNDED;
    w.score = ckpt_score;
}

void initWorld(World& w) {
    w.player = {48.0f, 350.0f, 0.0f, 0.0f, GROUNDED, 0.0f, 0.0f};
    w.score = 0;
    w.cmd = CMD_NONE;
    w.level_index = 0;
    loadLevel(w);
    scrambleCoins(w, 42);
    spawnEnemy(150, 380, 60.0f);
    spawnEnemy(350, 380, -80.0f);
    spawnEnemy(550, 350, 70.0f);
}

void checkExitDoor(World& w) {
    Player& p = w.player;
    int top_row = (int)(p.y / TILE_SIZE);
    int bot_row = (int)((p.y + PLAYER_H - 1) / TILE_SIZE);
    int left_col = (int)(p.x / TILE_SIZE);
    int right_col = (int)((p.x + PLAYER_W - 1) / TILE_SIZE);
    for (int r = top_row; r <= bot_row; r++)
        for (int c = left_col; c <= right_col; c++)
            if (r >= 0 && r < ROWS && c >= 0 && c < COLS && w.tilemap[r][c] == 3) {
                if (w.level_index < NUM_LEVELS - 1) {
                    w.level_index++;
                    loadLevel(w);
                    scrambleCoins(w, 42 + w.level_index * 94);
                    w.player.x = 48.0f; w.player.y = 350.0f;
                    w.player.vx = 0; w.player.vy = 0;
                    w.player.state = GROUNDED;
                }
            }
}

void inputPass(World& w) {
    w.cmd = CMD_NONE;
    if (IsKeyDown(KEY_RIGHT)) w.cmd = CMD_RIGHT;
    else if (IsKeyDown(KEY_LEFT)) w.cmd = CMD_LEFT;
    if (IsKeyPressed(KEY_SPACE)) w.player.jump_buffer_timer = JUMP_BUFFER;
}

void physicsPass(World& w) {
    Player& p = w.player;
    if (p.state == AIRBORNE && p.coyote_timer > 0) p.coyote_timer -= FIXED_DT;
    if (p.jump_buffer_timer > 0) p.jump_buffer_timer -= FIXED_DT;
    float accel = (p.state == GROUNDED) ? ACCEL : AIR_ACCEL;
    if (w.cmd == CMD_RIGHT) {
        p.vx += accel * FIXED_DT; if (p.vx > MAX_RUN) p.vx = MAX_RUN;
    } else if (w.cmd == CMD_LEFT) {
        p.vx -= accel * FIXED_DT; if (p.vx < -MAX_RUN) p.vx = -MAX_RUN;
    } else {
        if (p.vx > 0) { p.vx -= FRICTION * FIXED_DT; if (p.vx < 0) p.vx = 0; }
        else if (p.vx < 0) { p.vx += FRICTION * FIXED_DT; if (p.vx > 0) p.vx = 0; }
    }
    if (p.jump_buffer_timer > 0 && p.coyote_timer > 0) {
        p.vy = -JUMP_SPEED; p.state = AIRBORNE;
        p.coyote_timer = 0; p.jump_buffer_timer = 0;
    }
    if (p.state == AIRBORNE && !IsKeyDown(KEY_SPACE) && p.vy < -MIN_JUMP_VY)
        p.vy = -MIN_JUMP_VY;
    p.x += p.vx * FIXED_DT;
}

void markCoins(World& w) {
    Player& p = w.player;
    int top_row = (int)(p.y / TILE_SIZE);
    int bot_row = (int)((p.y + PLAYER_H - 1) / TILE_SIZE);
    int left_col = (int)(p.x / TILE_SIZE);
    int right_col = (int)((p.x + PLAYER_W - 1) / TILE_SIZE);
    for (int r = top_row; r <= bot_row; r++)
        for (int c = left_col; c <= right_col; c++)
            if (r >= 0 && r < ROWS && c >= 0 && c < COLS && w.tilemap[r][c] == 2)
                w.tilemap[r][c] = -1;
}

void cleanupPass(World& w) {
    for (int r = 0; r < ROWS; r++)
        for (int c = 0; c < COLS; c++)
            if (w.tilemap[r][c] == -1) { w.tilemap[r][c] = 0; w.score++; }
}

void checkTileCollisionV(World& w) {
    Player& p = w.player;
    int foot_col_l = (int)(p.x / TILE_SIZE);
    int foot_col_r = (int)((p.x + PLAYER_W - 1) / TILE_SIZE);
    int foot_row   = (int)((p.y + PLAYER_H) / TILE_SIZE);
    if (foot_row >= ROWS) return;
    if ((foot_col_l >= 0 && foot_col_l < COLS && w.tilemap[foot_row][foot_col_l] == 1) ||
        (foot_col_r >= 0 && foot_col_r < COLS && w.tilemap[foot_row][foot_col_r] == 1)) {
        if (p.vy >= 0) {
            p.y = foot_row * TILE_SIZE - PLAYER_H;
            p.vy = 0; p.state = GROUNDED;
            p.coyote_timer = COYOTE_TIME;
        }
    }
}

void checkTileCollisionH(World& w) {
    Player& p = w.player;
    if (p.vx > 0) {
        int right_col = (int)((p.x + PLAYER_W) / TILE_SIZE);
        int top_row   = (int)(p.y / TILE_SIZE);
        int bot_row   = (int)((p.y + PLAYER_H - 1) / TILE_SIZE);
        if (right_col < COLS &&
            (w.tilemap[top_row][right_col] == 1 || w.tilemap[bot_row][right_col] == 1)) {
            p.x = right_col * TILE_SIZE - PLAYER_W; p.vx = 0;
        }
    }
    if (p.vx < 0) {
        int left_col = (int)(p.x / TILE_SIZE);
        int top_row  = (int)(p.y / TILE_SIZE);
        int bot_row  = (int)((p.y + PLAYER_H - 1) / TILE_SIZE);
        if (left_col >= 0 &&
            (w.tilemap[top_row][left_col] == 1 || w.tilemap[bot_row][left_col] == 1)) {
            p.x = (left_col + 1) * TILE_SIZE; p.vx = 0;
        }
    }
}

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Platformer");
    SetTargetFPS(60);
    initWorld(w);
    // TODO 8: cout << "Entity pool: active" << endl;
    // TODO 9: cout << "Enemies: " << enemy_count << endl;
    // TODO 10: cout << "Heap: 0 allocs" << endl;
    // TODO 11: cout << "Pattern: entity-pool" << endl;
    while (!WindowShouldClose()) {
        inputPass(w);
        if (IsKeyPressed(KEY_C)) saveCheckpoint(w);
        if (IsKeyPressed(KEY_R) && ckpt_valid) loadCheckpoint(w);
        // TODO 12: updateEnemies(FIXED_DT);
        physicsPass(w);
        checkTileCollisionH(w);
        w.player.vy += GRAVITY * FIXED_DT;
        w.player.y  += w.player.vy * FIXED_DT;
        checkTileCollisionV(w);
        markCoins(w);
        cleanupPass(w);
        checkExitDoor(w);
        if (w.player.y > SCREEN_H) {
            w.player.x = 48.0f; w.player.y = 350.0f;
            w.player.vy = 0; w.player.vx = 0;
            w.player.state = GROUNDED;
        }
        BeginDrawing();
        ClearBackground(SKYBLUE);
        for (int r = 0; r < ROWS; r++)
            for (int c = 0; c < COLS; c++) {
                if (w.tilemap[r][c] == 1)
                    DrawRectangle(c*TILE_SIZE, r*TILE_SIZE, TILE_SIZE, TILE_SIZE, DARKGREEN);
                else if (w.tilemap[r][c] == 2)
                    DrawRectangle(c*TILE_SIZE+8, r*TILE_SIZE+8, TILE_SIZE-16, TILE_SIZE-16, YELLOW);
                else if (w.tilemap[r][c] == 3)
                    DrawRectangle(c*TILE_SIZE+4, r*TILE_SIZE+4, TILE_SIZE-8, TILE_SIZE-8, ORANGE);
            }
        DrawRectangle((int)w.player.x, (int)w.player.y, PLAYER_W, PLAYER_H, BLUE);
        // TODO 13: draw enemies as red 20x20 rects
        DrawText(w.player.state == GROUNDED ? "GROUNDED" : "AIRBORNE", 10, 10, 20, WHITE);
        DrawText(TextFormat("Score: %d", w.score), 10, 35, 20, YELLOW);
        DrawText(TextFormat("Level: %d", w.level_index + 1), 10, 60, 16, ORANGE);
        DrawText(TextFormat("Enemies: %d", enemy_count), 10, 80, 14, RED);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cstring>
#include "raylib.h"
using namespace std;

const int SCREEN_W = 800;
const int SCREEN_H = 450;
const float GRAVITY = 800.0f;
const float FIXED_DT = 1.0f / 60.0f;
const int PLAYER_W = 24;
const int PLAYER_H = 24;
const float JUMP_SPEED = 400.0f;
const float MIN_JUMP_VY = 150.0f;
const float ACCEL = 600.0f;
const float AIR_ACCEL = 300.0f;
const float FRICTION = 500.0f;
const float MAX_RUN = 200.0f;
const float COYOTE_TIME = 0.1f;
const float JUMP_BUFFER = 0.1f;
const int TILE_SIZE = 32;
const int COLS = 25;
const int ROWS = 14;
const int NUM_LEVELS = 2;
const int MAX_ENEMIES = 8;

const int LEVEL_DATA[NUM_LEVELS][ROWS][COLS] = {
    {
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,2,0,0,0,0,0,0,2,0,0,0,0,2,0,0,0,0,0,1},
    {1,0,0,0,1,1,1,0,0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,2,0,0,0,0,0,2,0,0,2,0,0,0,0,2,0,0,0,0,2,0,0,1},
    {1,1,1,0,0,0,0,1,1,1,0,1,1,1,0,0,1,1,0,0,1,1,1,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,1},
    {1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,1,1,1,1,0,0,1,1,1,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,2,0,0,2,0,0,0,2,0,0,2,0,0,0,2,0,0,2,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,1,1,1,1,0,0,1,1,1,1,1,0,0,1,1,1,1,1,0,0,1,1,1,1},
    },
    {
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,2,0,2,0,0,0,0,0,2,0,2,0,0,0,0,0,2,0,2,0,0,0,1},
    {1,0,1,1,1,0,0,0,0,0,1,1,1,0,0,0,0,0,1,1,1,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,2,0,0,0,0,0,0,2,0,0,0,0,2,0,0,0,0,2,0,0,0,0,1},
    {1,1,1,1,0,0,0,0,1,1,1,0,0,1,1,1,0,0,1,1,1,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1},
    },
};

enum MoveState { GROUNDED, AIRBORNE };
enum Command { CMD_NONE, CMD_LEFT, CMD_RIGHT };

struct Player {
    float x, y;
    float vx, vy;
    MoveState state;
    float coyote_timer;
    float jump_buffer_timer;
};

struct Enemy { float x, y, vx; bool active; };
Enemy enemies[MAX_ENEMIES];
int enemy_count = 0;

struct World {
    Player player;
    int tilemap[ROWS][COLS];
    int score;
    Command cmd;
    int level_index;
};

World w;

unsigned lcg_state = 0;
unsigned lcgNext() {
    lcg_state = lcg_state * 1664525u + 1013904223u;
    return lcg_state;
}

void scrambleCoins(World& w, unsigned seed) {
    lcg_state = seed;
    for (int r = 0; r < ROWS; r++)
        for (int c = 0; c < COLS; c++)
            if (w.tilemap[r][c] == 2) w.tilemap[r][c] = 0;
    int placed = 0, tries = 0;
    while (placed < 8 && tries < 1000) {
        tries++;
        int r = lcgNext() % ROWS;
        int c = lcgNext() % COLS;
        if (w.tilemap[r][c] == 0) { w.tilemap[r][c] = 2; placed++; }
    }
}

void spawnEnemy(float x, float y, float vx) {
    if (enemy_count >= MAX_ENEMIES) return;
    enemies[enemy_count++] = {x, y, vx, true};
}

void updateEnemies(float dt) {
    for (int i = 0; i < enemy_count; i++) {
        if (!enemies[i].active) continue;
        enemies[i].x += enemies[i].vx * dt;
        if (enemies[i].x < 32 || enemies[i].x > SCREEN_W - 64)
            enemies[i].vx = -enemies[i].vx;
    }
}

float ckpt_x = 48.0f, ckpt_y = 350.0f;
int ckpt_score = 0, ckpt_level = 0;
bool ckpt_valid = false;
unsigned saved_sig = 0;
bool sig_matched = false;

void loadLevel(World& w) {
    memcpy(w.tilemap, LEVEL_DATA[w.level_index], sizeof(w.tilemap));
}

void saveCheckpoint(World& w) {
    ckpt_x = w.player.x; ckpt_y = w.player.y;
    ckpt_score = w.score; ckpt_level = w.level_index;
    ckpt_valid = true;
}

void loadCheckpoint(World& w) {
    if (!ckpt_valid) return;
    w.level_index = ckpt_level;
    loadLevel(w);
    scrambleCoins(w, 42 + ckpt_level * 94);
    w.player.x = ckpt_x; w.player.y = ckpt_y;
    w.player.vx = 0; w.player.vy = 0;
    w.player.state = GROUNDED;
    w.score = ckpt_score;
}

void initWorld(World& w) {
    w.player = {48.0f, 350.0f, 0.0f, 0.0f, GROUNDED, 0.0f, 0.0f};
    w.score = 0;
    w.cmd = CMD_NONE;
    w.level_index = 0;
    loadLevel(w);
    scrambleCoins(w, 42);
    spawnEnemy(150, 380, 60.0f);
    spawnEnemy(350, 380, -80.0f);
    spawnEnemy(550, 350, 70.0f);
}

void checkExitDoor(World& w) {
    Player& p = w.player;
    int top_row = (int)(p.y / TILE_SIZE);
    int bot_row = (int)((p.y + PLAYER_H - 1) / TILE_SIZE);
    int left_col = (int)(p.x / TILE_SIZE);
    int right_col = (int)((p.x + PLAYER_W - 1) / TILE_SIZE);
    for (int r = top_row; r <= bot_row; r++)
        for (int c = left_col; c <= right_col; c++)
            if (r >= 0 && r < ROWS && c >= 0 && c < COLS && w.tilemap[r][c] == 3) {
                if (w.level_index < NUM_LEVELS - 1) {
                    w.level_index++;
                    loadLevel(w);
                    scrambleCoins(w, 42 + w.level_index * 94);
                    w.player.x = 48.0f; w.player.y = 350.0f;
                    w.player.vx = 0; w.player.vy = 0;
                    w.player.state = GROUNDED;
                }
            }
}

void inputPass(World& w) {
    w.cmd = CMD_NONE;
    if (IsKeyDown(KEY_RIGHT)) w.cmd = CMD_RIGHT;
    else if (IsKeyDown(KEY_LEFT)) w.cmd = CMD_LEFT;
    if (IsKeyPressed(KEY_SPACE)) w.player.jump_buffer_timer = JUMP_BUFFER;
}

void physicsPass(World& w) {
    Player& p = w.player;
    if (p.state == AIRBORNE && p.coyote_timer > 0) p.coyote_timer -= FIXED_DT;
    if (p.jump_buffer_timer > 0) p.jump_buffer_timer -= FIXED_DT;
    float accel = (p.state == GROUNDED) ? ACCEL : AIR_ACCEL;
    if (w.cmd == CMD_RIGHT) {
        p.vx += accel * FIXED_DT; if (p.vx > MAX_RUN) p.vx = MAX_RUN;
    } else if (w.cmd == CMD_LEFT) {
        p.vx -= accel * FIXED_DT; if (p.vx < -MAX_RUN) p.vx = -MAX_RUN;
    } else {
        if (p.vx > 0) { p.vx -= FRICTION * FIXED_DT; if (p.vx < 0) p.vx = 0; }
        else if (p.vx < 0) { p.vx += FRICTION * FIXED_DT; if (p.vx > 0) p.vx = 0; }
    }
    if (p.jump_buffer_timer > 0 && p.coyote_timer > 0) {
        p.vy = -JUMP_SPEED; p.state = AIRBORNE;
        p.coyote_timer = 0; p.jump_buffer_timer = 0;
    }
    if (p.state == AIRBORNE && !IsKeyDown(KEY_SPACE) && p.vy < -MIN_JUMP_VY)
        p.vy = -MIN_JUMP_VY;
    p.x += p.vx * FIXED_DT;
}

void markCoins(World& w) {
    Player& p = w.player;
    int top_row = (int)(p.y / TILE_SIZE);
    int bot_row = (int)((p.y + PLAYER_H - 1) / TILE_SIZE);
    int left_col = (int)(p.x / TILE_SIZE);
    int right_col = (int)((p.x + PLAYER_W - 1) / TILE_SIZE);
    for (int r = top_row; r <= bot_row; r++)
        for (int c = left_col; c <= right_col; c++)
            if (r >= 0 && r < ROWS && c >= 0 && c < COLS && w.tilemap[r][c] == 2)
                w.tilemap[r][c] = -1;
}

void cleanupPass(World& w) {
    for (int r = 0; r < ROWS; r++)
        for (int c = 0; c < COLS; c++)
            if (w.tilemap[r][c] == -1) { w.tilemap[r][c] = 0; w.score++; }
}

void checkTileCollisionV(World& w) {
    Player& p = w.player;
    int foot_col_l = (int)(p.x / TILE_SIZE);
    int foot_col_r = (int)((p.x + PLAYER_W - 1) / TILE_SIZE);
    int foot_row   = (int)((p.y + PLAYER_H) / TILE_SIZE);
    if (foot_row >= ROWS) return;
    if ((foot_col_l >= 0 && foot_col_l < COLS && w.tilemap[foot_row][foot_col_l] == 1) ||
        (foot_col_r >= 0 && foot_col_r < COLS && w.tilemap[foot_row][foot_col_r] == 1)) {
        if (p.vy >= 0) {
            p.y = foot_row * TILE_SIZE - PLAYER_H;
            p.vy = 0; p.state = GROUNDED;
            p.coyote_timer = COYOTE_TIME;
        }
    }
}

void checkTileCollisionH(World& w) {
    Player& p = w.player;
    if (p.vx > 0) {
        int right_col = (int)((p.x + PLAYER_W) / TILE_SIZE);
        int top_row   = (int)(p.y / TILE_SIZE);
        int bot_row   = (int)((p.y + PLAYER_H - 1) / TILE_SIZE);
        if (right_col < COLS &&
            (w.tilemap[top_row][right_col] == 1 || w.tilemap[bot_row][right_col] == 1)) {
            p.x = right_col * TILE_SIZE - PLAYER_W; p.vx = 0;
        }
    }
    if (p.vx < 0) {
        int left_col = (int)(p.x / TILE_SIZE);
        int top_row  = (int)(p.y / TILE_SIZE);
        int bot_row  = (int)((p.y + PLAYER_H - 1) / TILE_SIZE);
        if (left_col >= 0 &&
            (w.tilemap[top_row][left_col] == 1 || w.tilemap[bot_row][left_col] == 1)) {
            p.x = (left_col + 1) * TILE_SIZE; p.vx = 0;
        }
    }
}

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Platformer");
    SetTargetFPS(60);
    initWorld(w);
    cout << "Entity pool: active" << endl;
    cout << "Enemies: " << enemy_count << endl;
    cout << "Heap: 0 allocs" << endl;
    cout << "Pattern: entity-pool" << endl;
    while (!WindowShouldClose()) {
        inputPass(w);
        if (IsKeyPressed(KEY_C)) {
            saveCheckpoint(w);
            saved_sig = 0; sig_matched = false;
        }
        if (IsKeyPressed(KEY_R) && ckpt_valid) loadCheckpoint(w);
        updateEnemies(FIXED_DT);
        physicsPass(w);
        checkTileCollisionH(w);
        w.player.vy += GRAVITY * FIXED_DT;
        w.player.y  += w.player.vy * FIXED_DT;
        checkTileCollisionV(w);
        markCoins(w);
        cleanupPass(w);
        checkExitDoor(w);
        if (w.player.y > SCREEN_H) {
            w.player.x = 48.0f; w.player.y = 350.0f;
            w.player.vy = 0; w.player.vx = 0;
            w.player.state = GROUNDED;
        }
        BeginDrawing();
        ClearBackground(SKYBLUE);
        for (int r = 0; r < ROWS; r++)
            for (int c = 0; c < COLS; c++) {
                if (w.tilemap[r][c] == 1)
                    DrawRectangle(c*TILE_SIZE, r*TILE_SIZE, TILE_SIZE, TILE_SIZE, DARKGREEN);
                else if (w.tilemap[r][c] == 2)
                    DrawRectangle(c*TILE_SIZE+8, r*TILE_SIZE+8, TILE_SIZE-16, TILE_SIZE-16, YELLOW);
                else if (w.tilemap[r][c] == 3)
                    DrawRectangle(c*TILE_SIZE+4, r*TILE_SIZE+4, TILE_SIZE-8, TILE_SIZE-8, ORANGE);
            }
        DrawRectangle((int)w.player.x, (int)w.player.y, PLAYER_W, PLAYER_H, BLUE);
        for (int i = 0; i < enemy_count; i++)
            if (enemies[i].active)
                DrawRectangle((int)enemies[i].x, (int)enemies[i].y, 20, 20, RED);
        DrawText(w.player.state == GROUNDED ? "GROUNDED" : "AIRBORNE", 10, 10, 20, WHITE);
        DrawText(TextFormat("Score: %d", w.score), 10, 35, 20, YELLOW);
        DrawText(TextFormat("Level: %d", w.level_index + 1), 10, 60, 16, ORANGE);
        DrawText(TextFormat("Enemies: %d", enemy_count), 10, 80, 14, RED);
        DrawText("Heap: 0 allocs", 10, 97, 12, LIME);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Entity pool active", expectedOutput: "Entity pool: active" },
      { id: "g2", description: "Enemies count", expectedOutput: "Enemies: 3" },
      { id: "g3", description: "Zero heap allocs", expectedOutput: "Heap: 0 allocs" },
      { id: "g4", description: "Pattern printed", expectedOutput: "Pattern: entity-pool" },
    ],
    hints: [
      'Add struct Enemy { float x, y, vx; bool active; }; and Enemy enemies[MAX_ENEMIES]; int enemy_count = 0; as globals.',
      'spawnEnemy: if enemy_count < MAX_ENEMIES, set enemies[enemy_count++] = {x, y, vx, true}.',
      'updateEnemies: for each active enemy, add vx*dt to x. If x < 32 or x > SCREEN_W-64, flip vx sign.',
    ],
    estimatedMinutes: 15,
  },
};

export default lessonPlatformer26;
