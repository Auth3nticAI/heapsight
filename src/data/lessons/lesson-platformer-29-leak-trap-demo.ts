import type { Lesson } from "@/types/lesson";

const lessonPlatformer29: Lesson = {
  id: "platformer-29-leak-trap-demo",
  title: "Leak Trap Demo",
  description: "Add a deliberate per-frame allocation call to see the counter spike in the HUD.",
  order: 29,
  xpReward: 100,
  tier: "pro",
  concepts: ["memory leak", "per-frame allocation", "counter spike", "heap trap"],
  part1: {
    title: "Trap: Per-Frame Allocation",
    type: "concept",
    instructions: `# Leak Trap Demo

## The Problem
A per-frame allocation is an allocation inside the game loop.
It happens every frame: 60 times per second.
After 60 seconds: 3600 allocations. After 10 minutes: 36000.
The heap grows without bound. Eventually: fragmentation, latency spikes, crash.

## Your Task
Simulate the bad pattern: call countAlloc() inside a 60-iteration loop.
Show the counter after one simulated second.

## Expected Output
\`\`\`
LEAK: per-frame alloc detected
Counter: 60
Pattern: leak-trap
\`\`\`

## Beginner Trap
**Fixing the intentional leak to make the counter stop.** The point of the demo is to show what happens when you use new without delete. Leave the leak active, watch the counter climb, then replace it with pool allocation and watch the counter stay at zero.

## Elite Insight
Valgrind and AddressSanitizer detect leaks by tracking every allocation and matching it with a free. Your allocation counter is a manual version of the same technique — instrument the allocator to catch leaks in real time.

## Systems Thinking Connection
RPG L29 and Shooter L29 demonstrate the same leak trap. The lesson is universal: heap allocation in the game loop is a bug, and pools are the cure. Every path proves immunity by showing the allocation counter stays at zero.`,
    starterCode: `#include <iostream>
using namespace std;

int alloc_counter = 0;
void countAlloc() { alloc_counter++; }

int main() {
    cout << "LEAK: per-frame alloc detected" << endl;
    alloc_counter = 0;
    // TODO 1: simulate 60 frames, call countAlloc() once per frame
    cout << "Counter: " << alloc_counter << endl;
    cout << "Pattern: leak-trap" << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int alloc_counter = 0;
void countAlloc() { alloc_counter++; }

int main() {
    cout << "LEAK: per-frame alloc detected" << endl;
    alloc_counter = 0;
    for (int frame = 0; frame < 60; frame++) countAlloc();
    cout << "Counter: " << alloc_counter << endl;
    cout << "Pattern: leak-trap" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Leak detected", expectedOutput: "LEAK: per-frame alloc detected" },
      { id: "t2", description: "Counter 60", expectedOutput: "Counter: 60" },
      { id: "t3", description: "Pattern", expectedOutput: "Pattern: leak-trap" },
    ],
    hints: [
      'Simulate 60 frames with a for loop. Call countAlloc() inside the loop.',
      'After 60 iterations, alloc_counter == 60.',
      'This represents 60 allocations in one second of gameplay at 60fps.',
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Make the Counter Spike",
    type: "game_builder",
    instructions: `# Build: Demonstrate the Leak

## What You Are Building
Add one countAlloc() call INSIDE the game loop to demonstrate the leak pattern.
The HUD counter immediately shoots to 1 per frame (shown in RED).
This is the "feel the disease" lesson. Next lesson you will fix it.

## The Bad Code to Add
\`\`\`
// At the TOP of the game loop (before inputPass):
countAlloc();  // BAD: simulating a per-frame heap allocation
\`\`\`

## Expected Cout Output
\`\`\`
LEAK: per-frame alloc detected
Counter: 1
Pattern: leak-trap
\`\`\`

## Mastery Check
The HUD shows Allocs/frame: 1 in RED.
You can see the counter is non-zero. This is the leak.
The game still runs, but heap traffic is happening every frame.`,
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

const int MAX_PARTICLES = 32;
struct Particle { float x, y, vx, vy, life; bool active; };
Particle particles[MAX_PARTICLES];

void spawnParticles(float px, float py) {
    for (int k = 0; k < 4; k++) {
        for (int i = 0; i < MAX_PARTICLES; i++) {
            if (!particles[i].active) {
                float pvx = (float)((int)(lcgNext() % 120) - 60);
                float pvy = -(float)(lcgNext() % 80 + 20);
                particles[i] = {px, py, pvx, pvy, 0.4f, true};
                break;
            }
        }
    }
}

void updateParticles(float dt) {
    for (int i = 0; i < MAX_PARTICLES; i++) {
        if (!particles[i].active) continue;
        particles[i].x += particles[i].vx * dt;
        particles[i].y += particles[i].vy * dt;
        particles[i].life -= dt;
        if (particles[i].life <= 0) particles[i].active = false;
    }
}

int alloc_counter = 0;
void countAlloc() { alloc_counter++; }

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Platformer");
    SetTargetFPS(60);
    initWorld(w);
    for (int i = 0; i < MAX_PARTICLES; i++) particles[i].active = false;
    // TODO 1: cout << "LEAK: per-frame alloc detected" << endl;
    // TODO 2: cout << "Counter: 1" << endl;
    // TODO 3: cout << "Pattern: leak-trap" << endl;
    MoveState prev_state = GROUNDED;
    while (!WindowShouldClose()) {
        alloc_counter = 0;
        // TODO 4: countAlloc(); // the per-frame leak
        inputPass(w);
        if (IsKeyPressed(KEY_C)) saveCheckpoint(w);
        if (IsKeyPressed(KEY_R) && ckpt_valid) loadCheckpoint(w);
        updateEnemies(FIXED_DT);
        updateParticles(FIXED_DT);
        physicsPass(w);
        checkTileCollisionH(w);
        w.player.vy += GRAVITY * FIXED_DT;
        w.player.y  += w.player.vy * FIXED_DT;
        checkTileCollisionV(w);
        if (prev_state == AIRBORNE && w.player.state == GROUNDED)
            spawnParticles(w.player.x + 12, w.player.y + 24);
        prev_state = w.player.state;
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
        for (int i = 0; i < MAX_PARTICLES; i++)
            if (particles[i].active)
                DrawRectangle((int)particles[i].x, (int)particles[i].y, 4, 4, LIGHTGRAY);
        DrawText(w.player.state == GROUNDED ? "GROUNDED" : "AIRBORNE", 10, 10, 20, WHITE);
        DrawText(TextFormat("Score: %d", w.score), 10, 35, 20, YELLOW);
        DrawText(TextFormat("Level: %d", w.level_index + 1), 10, 60, 16, ORANGE);
        DrawText(TextFormat("Enemies: %d", enemy_count), 10, 80, 14, RED);
        DrawText("Particles: pool", 10, 97, 12, LIGHTGRAY);
        DrawText(TextFormat("Allocs/frame: %d", alloc_counter), 10, 114, 12, alloc_counter == 0 ? GREEN : RED);
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

const int MAX_PARTICLES = 32;
struct Particle { float x, y, vx, vy, life; bool active; };
Particle particles[MAX_PARTICLES];

void spawnParticles(float px, float py) {
    for (int k = 0; k < 4; k++) {
        for (int i = 0; i < MAX_PARTICLES; i++) {
            if (!particles[i].active) {
                float pvx = (float)((int)(lcgNext() % 120) - 60);
                float pvy = -(float)(lcgNext() % 80 + 20);
                particles[i] = {px, py, pvx, pvy, 0.4f, true};
                break;
            }
        }
    }
}

void updateParticles(float dt) {
    for (int i = 0; i < MAX_PARTICLES; i++) {
        if (!particles[i].active) continue;
        particles[i].x += particles[i].vx * dt;
        particles[i].y += particles[i].vy * dt;
        particles[i].life -= dt;
        if (particles[i].life <= 0) particles[i].active = false;
    }
}

int alloc_counter = 0;
void countAlloc() { alloc_counter++; }

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Platformer");
    SetTargetFPS(60);
    initWorld(w);
    for (int i = 0; i < MAX_PARTICLES; i++) particles[i].active = false;
    cout << "LEAK: per-frame alloc detected" << endl;
    cout << "Counter: 1" << endl;
    cout << "Pattern: leak-trap" << endl;
    MoveState prev_state = GROUNDED;
    while (!WindowShouldClose()) {
        alloc_counter = 0;
        countAlloc();  // BAD: per-frame allocation simulation
        inputPass(w);
        if (IsKeyPressed(KEY_C)) saveCheckpoint(w);
        if (IsKeyPressed(KEY_R) && ckpt_valid) loadCheckpoint(w);
        updateEnemies(FIXED_DT);
        updateParticles(FIXED_DT);
        physicsPass(w);
        checkTileCollisionH(w);
        w.player.vy += GRAVITY * FIXED_DT;
        w.player.y  += w.player.vy * FIXED_DT;
        checkTileCollisionV(w);
        if (prev_state == AIRBORNE && w.player.state == GROUNDED)
            spawnParticles(w.player.x + 12, w.player.y + 24);
        prev_state = w.player.state;
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
        for (int i = 0; i < MAX_PARTICLES; i++)
            if (particles[i].active)
                DrawRectangle((int)particles[i].x, (int)particles[i].y, 4, 4, LIGHTGRAY);
        DrawText(w.player.state == GROUNDED ? "GROUNDED" : "AIRBORNE", 10, 10, 20, WHITE);
        DrawText(TextFormat("Score: %d", w.score), 10, 35, 20, YELLOW);
        DrawText(TextFormat("Level: %d", w.level_index + 1), 10, 60, 16, ORANGE);
        DrawText(TextFormat("Enemies: %d", enemy_count), 10, 80, 14, RED);
        DrawText("Particles: pool", 10, 97, 12, LIGHTGRAY);
        DrawText(TextFormat("Allocs/frame: %d", alloc_counter), 10, 114, 12, alloc_counter == 0 ? GREEN : RED);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Leak detected", expectedOutput: "LEAK: per-frame alloc detected" },
      { id: "g2", description: "Counter 1", expectedOutput: "Counter: 1" },
      { id: "g3", description: "Pattern", expectedOutput: "Pattern: leak-trap" },
    ],
    hints: [
      'Add countAlloc(); at the very top of the while loop (before inputPass).',
      'The counter resets to 0 at the start of each frame, then countAlloc() sets it to 1.',
      'The HUD shows Allocs/frame: 1 in RED. This is the leak pattern you will fix in L30.',
    ],
    estimatedMinutes: 15,
  },
};

export default lessonPlatformer29;
