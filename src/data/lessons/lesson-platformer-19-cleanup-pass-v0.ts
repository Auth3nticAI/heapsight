import { Lesson } from "../../types/lesson";

const lessonPlatformer19: Lesson = {
  id: "platformer-19-cleanup-pass-v0",
  title: "Cleanup Pass v0",
  description: "Separate coin detection from removal: markCoins flags with -1, cleanupPass sweeps and removes. The deferred deletion pattern that scales to enemies, projectiles, and effects.",
  order: 19,
  xpReward: 100,
  tier: "pro",
  concepts: ["cleanup pass", "mark then sweep", "deferred deletion", "sentinel values"],
  part1: {
    title: "Concept: Mark then Sweep",
    type: "concept",
    instructions: `# Cleanup Pass v0

## Mental Model
Right now, when the player overlaps a coin, checkCoins removes it immediately (sets tilemap[r][c] = 0). This works, but it mixes detection and removal in one pass. The cleanup pass separates these: a MARK PASS flags entities for removal, and a SWEEP PASS removes everything flagged. Detection is now clearly separated from deletion.

## What Breaks Without This
Immediate removal is fine for simple coins. But when you add enemies that die on stomp (Lesson 48), you cannot remove the enemy mid-collision-loop — the array index is still live, and other enemies might need to react to its death before it disappears. The cleanup pass defers removal until after all logic completes.

## The Fix: Mark then Sweep
Use a sentinel value (-1) to flag entities for removal. The mark pass finds collisions and sets the tile to -1. The cleanup (sweep) pass scans the tilemap, counts -1 tiles, awards score, then sets them to 0:

\`\`\`cpp
// Mark pass: detect and flag
void markCollectedCoins(World& w) {
    // When player overlaps a coin (tile == 2), mark it: tile = -1
}

// Sweep pass: remove flagged, update score
void cleanupPass(World& w) {
    for (int r = 0; r < ROWS; r++)
        for (int c = 0; c < COLS; c++)
            if (w.tilemap[r][c] == -1) {
                w.tilemap[r][c] = 0;
                w.score++;
            }
}
\`\`\`

## Key Concepts
- **Sentinel value**: -1 means "pending removal" — distinct from 0 (empty) and 1 (solid)
- **Mark pass**: detects overlap, flags with sentinel — no deletion yet
- **Sweep pass**: scans all, removes flagged — one clean deletion phase
- **Order guarantee**: all logic sees full state before cleanup removes anything

## Performance Insight
The cleanup sweep scans all ROWS*COLS tiles every frame. For a 25x14 grid that is 350 comparisons — trivial. If you scale to a large world, only scan active chunks. But for a fixed 25x14 tilemap, a full sweep costs microseconds and gives you architectural clarity.

## Memory Insight
The sentinel -1 reuses existing tile storage — no extra memory. In more complex systems (enemies, bullets), you mark dead entities with alive = false and the cleanup pass re-adds their indices to a free list. Same pattern, same cost.

## Your Task
Simulate mark-then-sweep on a small tile array. Mark flagged coins, then sweep and remove them.

Expected output:
\`\`\`
Cleanup pass: active
Mark pass: 3 flagged
Sweep pass: 3 removed
Remaining: 0
Pattern: cleanup-pass
\`\`\`

## Beginner Trap
Removing tiles inside the mark loop while iterating. If you delete tile[r][c] immediately, later iterations in the same frame may access inconsistent state. Always complete the mark pass first, then run the sweep as a separate operation. The two-pass design is the whole point.

## Elite Insight
Unity's Destroy() call does not delete the object immediately — it flags it for destruction at end of frame (the cleanup pass). Godot's queue_free() is identical. Every major engine uses deferred deletion because immediate removal during active iteration is undefined behavior territory.

## Systems Thinking Connection
In the Space Shooter, despawnEnemy marked the slot as inactive and the system skipped inactive slots next frame. The Platformer uses a tile sentinel instead. Same pattern: mark dead, sweep later. Lesson 35 formalizes this as cleanupSystem(w) in the named pipeline.

## Mastery Check
**Q:** Why use -1 as the sentinel instead of just removing the coin immediately in the mark pass?
**A:** Immediate removal in the mark pass means the sweep has nothing to sweep — and other systems that run after mark but before sweep (enemy AI, score multipliers, sound triggers) cannot react to the coin-collected event. The sentinel keeps the coin visible to all systems for one frame after collection.`,
    starterCode: `#include <iostream>
using namespace std;

// Simulate a small tilemap: 0=empty, 2=coin, -1=marked for removal
int tiles[5] = {2, 0, 2, 1, 2};  // 3 coins, 1 wall, nothing
int n = 5;

int main() {
    // TODO 1: Print "Cleanup pass: active"

    // Mark pass: flag all coins (tile == 2) with -1
    int marked = 0;
    for (int i = 0; i < n; i++) {
        if (tiles[i] == 2) {
            // TODO 2: tiles[i] = -1; marked++;
        }
    }
    // TODO 3: Print "Mark pass: X flagged" (use marked count)

    // Sweep pass: remove marked tiles
    int removed = 0;
    for (int i = 0; i < n; i++) {
        if (tiles[i] == -1) {
            // TODO 4: tiles[i] = 0; removed++;
        }
    }
    // TODO 5: Print "Sweep pass: X removed" (use removed count)

    // Count remaining coins
    int remaining = 0;
    for (int i = 0; i < n; i++) if (tiles[i] == 2) remaining++;
    // TODO 6: Print "Remaining: X" (use remaining count)
    // TODO 7: Print "Pattern: cleanup-pass"
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int tiles[5] = {2, 0, 2, 1, 2};
int n = 5;

int main() {
    cout << "Cleanup pass: active" << endl;
    int marked = 0;
    for (int i = 0; i < n; i++) {
        if (tiles[i] == 2) { tiles[i] = -1; marked++; }
    }
    cout << "Mark pass: " << marked << " flagged" << endl;
    int removed = 0;
    for (int i = 0; i < n; i++) {
        if (tiles[i] == -1) { tiles[i] = 0; removed++; }
    }
    cout << "Sweep pass: " << removed << " removed" << endl;
    int remaining = 0;
    for (int i = 0; i < n; i++) if (tiles[i] == 2) remaining++;
    cout << "Remaining: " << remaining << endl;
    cout << "Pattern: cleanup-pass" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Cleanup active", expectedOutput: "Cleanup pass: active" },
      { id: "t2", description: "Mark count correct", expectedOutput: "Mark pass: 3 flagged" },
      { id: "t3", description: "Sweep count correct", expectedOutput: "Sweep pass: 3 removed" },
      { id: "t4", description: "No coins remaining", expectedOutput: "Remaining: 0" },
      { id: "t5", description: "Pattern printed", expectedOutput: "Pattern: cleanup-pass" },
    ],
    hints: [
      "Mark pass: if tiles[i] == 2, set tiles[i] = -1 and increment marked.",
      "Sweep pass: if tiles[i] == -1, set tiles[i] = 0 and increment removed.",
      "Count remaining coins after the sweep: loop again checking for tiles[i] == 2. After a full sweep, remaining should be 0.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Cleanup Pass v0",
    type: "game_builder",
    instructions: `# Build: Cleanup Pass v0

## Mental Model
The coin collection now uses mark-then-sweep. markCoins() detects player-coin overlap and sets the tile to -1. cleanupPass() scans the whole tilemap, converts -1 to 0, and increments score. The game plays identically — but the architecture is two explicit passes instead of one tangled function.

## What's Already Here
markCoins() and cleanupPass() are implemented and called in the correct order. Your task is to add the cout output proving the cleanup pipeline is active, and add a HUD label.

## Your Task
Add cleanup pass verification after initWorld:

\`\`\`cpp
cout << "Cleanup pass: active" << endl;
cout << "Mark: -1 (pending removal)" << endl;
cout << "Pattern: cleanup-pass" << endl;
\`\`\`

And add to the render block:
\`\`\`cpp
DrawText("Cleanup: active", 10, 80, 16, LIME);
\`\`\`

## Did It Work?
Run the game and collect a coin. The score increments exactly once per coin — no double-counting from the split passes. The console shows the cleanup pipeline. The HUD confirms the system is live.

## Beginner Trap
Putting the cleanup pass BEFORE the mark pass. The sweep looks for -1 tiles; if nothing is marked yet, it removes nothing. Always: mark first, then sweep. The order is part of the architecture.

## Elite Insight
When you add enemies in Lesson 47, they use alive = false as their sentinel. cleanupPass will check enemy alive flags and return their slots to a free list. Same function, new entity type. The cleanup pattern generalizes across every entity in the game.`,
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

const int DEFAULT_MAP[ROWS][COLS] = {
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,2,0,0,0,0,0,0,2,0,0,0,0,2,0,0,0,0,0,1},
    {1,0,0,0,1,1,1,0,0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,2,0,0,0,0,0,2,0,0,2,0,0,0,0,2,0,0,0,0,2,0,0,1},
    {1,1,1,0,0,0,0,1,1,1,0,1,1,1,0,0,1,1,0,0,1,1,1,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,1,1,1,1,0,0,1,1,1,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,2,0,0,2,0,0,0,2,0,0,2,0,0,0,2,0,0,2,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,1,1,1,1,0,0,1,1,1,1,1,0,0,1,1,1,1,1,0,0,1,1,1,1},
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

struct World {
    Player player;
    int tilemap[ROWS][COLS];
    int score;
    Command cmd;
};

World w;

const char* cmdName(Command c) {
    if (c == CMD_LEFT)  return "CMD_LEFT";
    if (c == CMD_RIGHT) return "CMD_RIGHT";
    return "CMD_NONE";
}

void initWorld(World& w) {
    w.player = {48.0f, 350.0f, 0.0f, 0.0f, GROUNDED, 0.0f, 0.0f};
    w.score = 0;
    w.cmd = CMD_NONE;
    memcpy(w.tilemap, DEFAULT_MAP, sizeof(w.tilemap));
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

// Mark pass: detect coin overlaps, flag with -1
void markCoins(World& w) {
    Player& p = w.player;
    int top_row = (int)(p.y / TILE_SIZE);
    int bot_row = (int)((p.y + PLAYER_H - 1) / TILE_SIZE);
    int left_col = (int)(p.x / TILE_SIZE);
    int right_col = (int)((p.x + PLAYER_W - 1) / TILE_SIZE);
    for (int r = top_row; r <= bot_row; r++)
        for (int c = left_col; c <= right_col; c++)
            if (r >= 0 && r < ROWS && c >= 0 && c < COLS && w.tilemap[r][c] == 2)
                w.tilemap[r][c] = -1;  // flag for cleanup
}

// Sweep pass: remove flagged tiles, award score
void cleanupPass(World& w) {
    for (int r = 0; r < ROWS; r++)
        for (int c = 0; c < COLS; c++)
            if (w.tilemap[r][c] == -1) {
                w.tilemap[r][c] = 0;
                w.score++;
            }
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

    // TODO 1: cout << "Cleanup pass: active" << endl;
    // TODO 2: cout << "Mark: -1 (pending removal)" << endl;
    // TODO 3: cout << "Pattern: cleanup-pass" << endl;

    while (!WindowShouldClose()) {
        inputPass(w);
        physicsPass(w);
        checkTileCollisionH(w);
        w.player.vy += GRAVITY * FIXED_DT;
        w.player.y  += w.player.vy * FIXED_DT;
        checkTileCollisionV(w);
        markCoins(w);
        cleanupPass(w);
        if (w.player.y > SCREEN_H) {
            w.player.x = 48.0f; w.player.y = 350.0f;
            w.player.vy = 0; w.player.vx = 0;
            w.player.state = GROUNDED;
        }
        BeginDrawing();
        ClearBackground(SKYBLUE);
        for (int r = 0; r < ROWS; r++)
            for (int c = 0; c < COLS; c++)
                if (w.tilemap[r][c] == 1)
                    DrawRectangle(c*TILE_SIZE, r*TILE_SIZE, TILE_SIZE, TILE_SIZE, DARKGREEN);
                else if (w.tilemap[r][c] == 2)
                    DrawRectangle(c*TILE_SIZE+8, r*TILE_SIZE+8, TILE_SIZE-16, TILE_SIZE-16, YELLOW);
        DrawRectangle((int)w.player.x, (int)w.player.y, PLAYER_W, PLAYER_H, BLUE);
        DrawText(w.player.state == GROUNDED ? "GROUNDED" : "AIRBORNE", 10, 10, 20, WHITE);
        DrawText(TextFormat("Score: %d", w.score), 10, 35, 20, YELLOW);
        DrawText(TextFormat("Cmd: %s", cmdName(w.cmd)), 10, 60, 16, LIME);
        // TODO 4: DrawText("Cleanup: active", 10, 80, 16, LIME);
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

const int DEFAULT_MAP[ROWS][COLS] = {
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,2,0,0,0,0,0,0,2,0,0,0,0,2,0,0,0,0,0,1},
    {1,0,0,0,1,1,1,0,0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,2,0,0,0,0,0,2,0,0,2,0,0,0,0,2,0,0,0,0,2,0,0,1},
    {1,1,1,0,0,0,0,1,1,1,0,1,1,1,0,0,1,1,0,0,1,1,1,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,1,1,1,1,0,0,1,1,1,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,0,2,0,0,2,0,0,0,2,0,0,2,0,0,0,2,0,0,2,0,0,0,0,1},
    {1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1},
    {1,1,1,1,1,0,0,1,1,1,1,1,0,0,1,1,1,1,1,0,0,1,1,1,1},
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

struct World {
    Player player;
    int tilemap[ROWS][COLS];
    int score;
    Command cmd;
};

World w;

const char* cmdName(Command c) {
    if (c == CMD_LEFT)  return "CMD_LEFT";
    if (c == CMD_RIGHT) return "CMD_RIGHT";
    return "CMD_NONE";
}

void initWorld(World& w) {
    w.player = {48.0f, 350.0f, 0.0f, 0.0f, GROUNDED, 0.0f, 0.0f};
    w.score = 0;
    w.cmd = CMD_NONE;
    memcpy(w.tilemap, DEFAULT_MAP, sizeof(w.tilemap));
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

// Mark pass: detect coin overlaps, flag with -1
void markCoins(World& w) {
    Player& p = w.player;
    int top_row = (int)(p.y / TILE_SIZE);
    int bot_row = (int)((p.y + PLAYER_H - 1) / TILE_SIZE);
    int left_col = (int)(p.x / TILE_SIZE);
    int right_col = (int)((p.x + PLAYER_W - 1) / TILE_SIZE);
    for (int r = top_row; r <= bot_row; r++)
        for (int c = left_col; c <= right_col; c++)
            if (r >= 0 && r < ROWS && c >= 0 && c < COLS && w.tilemap[r][c] == 2)
                w.tilemap[r][c] = -1;  // flag for cleanup
}

// Sweep pass: remove flagged tiles, award score
void cleanupPass(World& w) {
    for (int r = 0; r < ROWS; r++)
        for (int c = 0; c < COLS; c++)
            if (w.tilemap[r][c] == -1) {
                w.tilemap[r][c] = 0;
                w.score++;
            }
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

    cout << "Cleanup pass: active" << endl;
    cout << "Mark: -1 (pending removal)" << endl;
    cout << "Pattern: cleanup-pass" << endl;

    while (!WindowShouldClose()) {
        inputPass(w);
        physicsPass(w);
        checkTileCollisionH(w);
        w.player.vy += GRAVITY * FIXED_DT;
        w.player.y  += w.player.vy * FIXED_DT;
        checkTileCollisionV(w);
        markCoins(w);
        cleanupPass(w);
        if (w.player.y > SCREEN_H) {
            w.player.x = 48.0f; w.player.y = 350.0f;
            w.player.vy = 0; w.player.vx = 0;
            w.player.state = GROUNDED;
        }
        BeginDrawing();
        ClearBackground(SKYBLUE);
        for (int r = 0; r < ROWS; r++)
            for (int c = 0; c < COLS; c++)
                if (w.tilemap[r][c] == 1)
                    DrawRectangle(c*TILE_SIZE, r*TILE_SIZE, TILE_SIZE, TILE_SIZE, DARKGREEN);
                else if (w.tilemap[r][c] == 2)
                    DrawRectangle(c*TILE_SIZE+8, r*TILE_SIZE+8, TILE_SIZE-16, TILE_SIZE-16, YELLOW);
        DrawRectangle((int)w.player.x, (int)w.player.y, PLAYER_W, PLAYER_H, BLUE);
        DrawText(w.player.state == GROUNDED ? "GROUNDED" : "AIRBORNE", 10, 10, 20, WHITE);
        DrawText(TextFormat("Score: %d", w.score), 10, 35, 20, YELLOW);
        DrawText(TextFormat("Cmd: %s", cmdName(w.cmd)), 10, 60, 16, LIME);
        DrawText("Cleanup: active", 10, 80, 16, LIME);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Cleanup active in output", expectedOutput: "Cleanup pass: active" },
      { id: "g2", description: "Mark sentinel shown", expectedOutput: "Mark: -1 (pending removal)" },
      { id: "g3", description: "Pattern printed", expectedOutput: "Pattern: cleanup-pass" },
    ],
    hints: [
      "Add three cout lines after initWorld(w): Cleanup pass active, Mark sentinel, Pattern.",
      'Add DrawText("Cleanup: active", 10, 80, 16, LIME); in the render block.',
      "The game loop already calls markCoins(w) then cleanupPass(w) in the correct order.",
    ],
    estimatedMinutes: 12,
  },
};

export default lessonPlatformer19;