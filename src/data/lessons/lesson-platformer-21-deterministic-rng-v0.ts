import { Lesson } from "../../types/lesson";

const lessonPlatformer21: Lesson = {
  id: "platformer-21-deterministic-rng-v0",
  title: "Deterministic RNG v0",
  description: "Add a seeded LCG. Same seed produces same coin layout every run. Change the seed, change the world.",
  order: 21,
  xpReward: 100,
  tier: "pro",
  concepts: ["LCG", "deterministic random", "seeded RNG", "reproducible state"],
  part1: {
    title: "Concept: Linear Congruential Generator",
    type: "concept",
    instructions: `# Deterministic RNG v0

## Mental Model
Random numbers in games feel magical, but they are math. A linear congruential generator (LCG) takes a seed and applies a formula: next = current * A + C. The formula is deterministic: the same seed always produces the same sequence. This is what makes game replay possible.

## The LCG Formula

\`\`\`cpp
unsigned lcg_state = 0;

unsigned lcgNext() {
    lcg_state = lcg_state * 1664525u + 1013904223u;
    return lcg_state;
}
\`\`\`

The multiplier 1664525 and increment 1013904223 are the Numerical Recipes constants, widely used in game engines. The unsigned 32-bit overflow is intentional: it wraps around like a clock, giving a period of 2^32.

## Why Determinism Matters
When you set lcg_state = 42 and call lcgNext() three times, you always get the same three values. Every run. Every machine. This enables: (a) replays that play back the same game, (b) identical level layouts from the same seed, (c) network games that agree on AI decisions without sending state.

## Key Concepts
- **LCG**: next = state * A + C, simple and fast
- **Seed**: the starting value that determines the whole sequence
- **Period**: the length before the sequence repeats (2^32 for 32-bit LCG)
- **Determinism**: same seed = same sequence, always

## Your Task
Implement the LCG and print the first 3 values with seed 42 using % 100.

Expected output:
\`\`\`
Seed: 42
Step 1: 73
Step 2: 88
Step 3: 63
RNG: deterministic
Pattern: lcg-rng
\`\`\`

## Beginner Trap
Using rand() from cstdlib. The rand() function uses global hidden state with no guaranteed seed. Two machines may produce different sequences. The LCG you write IS the entire random system: visible, controllable, portable.

## Elite Insight
Minecraft uses a similar seeded RNG for world generation. Same seed = same world on any machine. Celeste uses deterministic RNG for procedural level generation in speedrun verification. Your LCG is the same concept.

## Mastery Check
**Q:** What happens when you change seed from 42 to 99?
**A:** You get a completely different sequence of numbers. The sequence is still deterministic (same 99 seed always gives same output), but different from seed 42. Two players with different seeds play different coin layouts.

## Systems Thinking Connection
The RPG seeds its RNG identically (L21) to guarantee combat outcomes match between recording and playback. The Shooter seeds per-wave for enemy spawn patterns. Deterministic RNG is a cross-path requirement — replay and save/load both depend on reproducible random sequences.`,
    starterCode: `#include <iostream>
using namespace std;

unsigned lcg_state = 0;

unsigned lcgNext() {
    lcg_state = lcg_state * 1664525u + 1013904223u;
    return lcg_state;
}

int main() {
    // TODO 1: Set lcg_state = 42
    // TODO 2: cout << "Seed: 42" << endl;
    // TODO 3: Loop i from 1 to 3:
    //   cout << "Step " << i << ": " << (lcgNext() % 100) << endl;
    // TODO 4: cout << "RNG: deterministic" << endl;
    // TODO 5: cout << "Pattern: lcg-rng" << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

unsigned lcg_state = 0;

unsigned lcgNext() {
    lcg_state = lcg_state * 1664525u + 1013904223u;
    return lcg_state;
}

int main() {
    unsigned seed = 42;
    lcg_state = seed;
    cout << "Seed: " << seed << endl;
    for (int i = 1; i <= 3; i++) {
        cout << "Step " << i << ": " << (lcgNext() % 100) << endl;
    }
    cout << "RNG: deterministic" << endl;
    cout << "Pattern: lcg-rng" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Seed printed", expectedOutput: "Seed: 42" },
      { id: "t2", description: "RNG determinism stated", expectedOutput: "RNG: deterministic" },
      { id: "t3", description: "Pattern printed", expectedOutput: "Pattern: lcg-rng" },
    ],
    hints: [
      "Set lcg_state = 42 before the loop.",
      "Call lcgNext() inside the loop body, then print lcgNext() % 100.",
      "Step 1 should print 73, Step 2 should print 88, Step 3 should print 63.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Seeded Coin Scramble",
    type: "game_builder",
    instructions: `# Build: Deterministic RNG v0

## Mental Model
The platformer gets a scrambleCoins function that resets and re-places coins using lcgNext(). Call it with seed 42 after initWorld. Change the seed to 99 and the coin layout changes completely but consistently. The game plays differently but deterministically based on seed.

## What's Already Here
The LCG (lcg_state, lcgNext) and scrambleCoins are defined. The game loop is complete from L20. Your task is to fill in scrambleCoins and call it after initWorld.

## Your Task
Complete scrambleCoins and add the startup output:

\`\`\`cpp
void scrambleCoins(World& w, unsigned seed) {
    lcg_state = seed;
    // Step 1: clear all coins
    for (int r = 0; r < ROWS; r++)
        for (int c = 0; c < COLS; c++)
            if (w.tilemap[r][c] == 2) w.tilemap[r][c] = 0;
    // Step 2: place 8 coins in random empty cells
    int placed = 0, tries = 0;
    while (placed < 8 && tries < 1000) {
        tries++;
        int r = lcgNext() % ROWS;
        int c = lcgNext() % COLS;
        if (w.tilemap[r][c] == 0) { w.tilemap[r][c] = 2; placed++; }
    }
}
\`\`\`

## Expected Output (first 3 lines before game loop)
\`\`\`
Seed: 42
RNG: active
Pattern: deterministic-rng
\`\`\`

## HUD
Add DrawText("Seed: 42", 10, 100, 16, WHITE) in the render block after the score line.

## Beginner Trap
Forgetting to set lcg_state = seed inside scrambleCoins. Without this, the sequence starts from wherever lcg_state was left, giving inconsistent layouts.

## Elite Insight
Change seed from 42 to 99 in both scrambleCoins call and HUD text. The coin layout changes completely. Same code, different data. This is data-driven level design: the seed IS a level parameter.`,
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

const int LEVEL_DATA[NUM_LEVELS][ROWS][COLS] = {
    // Level 0: mini level with exit door at top-right
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
    // Level 1: reward level
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

struct World {
    Player player;
    int tilemap[ROWS][COLS];
    int score;
    Command cmd;
    int level_index;
};

World w;

// LCG random number generator
unsigned lcg_state = 0;

unsigned lcgNext() {
    lcg_state = lcg_state * 1664525u + 1013904223u;
    return lcg_state;
}

void scrambleCoins(World& w, unsigned seed) {
    lcg_state = seed;
    // TODO 1: Clear all coins: loop ROWS and COLS, if tilemap[r][c]==2 set it to 0
    // TODO 2: Place 8 coins in empty cells using lcgNext() % ROWS and % COLS
    //   while(placed < 8 && tries < 1000) { tries++; r=lcgNext()%ROWS; c=lcgNext()%COLS;
    //     if(tilemap[r][c]==0) { tilemap[r][c]=2; placed++; } }
}

const char* cmdName(Command cmd) {
    if (cmd == CMD_LEFT)  return "CMD_LEFT";
    if (cmd == CMD_RIGHT) return "CMD_RIGHT";
    return "CMD_NONE";
}

void loadLevel(World& w) {
    memcpy(w.tilemap, LEVEL_DATA[w.level_index], sizeof(w.tilemap));
}

void initWorld(World& w) {
    w.player = {48.0f, 350.0f, 0.0f, 0.0f, GROUNDED, 0.0f, 0.0f};
    w.score = 0;
    w.cmd = CMD_NONE;
    w.level_index = 0;
    loadLevel(w);
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
                    scrambleCoins(w, 42 + w.level_index * 37);
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
    // TODO 3: Call scrambleCoins(w, 42) to randomize coin layout
    cout << "Seed: 42" << endl;
    cout << "RNG: active" << endl;
    cout << "Pattern: deterministic-rng" << endl;
    while (!WindowShouldClose()) {
        inputPass(w);
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
        DrawText(w.player.state == GROUNDED ? "GROUNDED" : "AIRBORNE", 10, 10, 20, WHITE);
        DrawText(TextFormat("Score: %d", w.score), 10, 35, 20, YELLOW);
        DrawText(TextFormat("Level: %d", w.level_index + 1), 10, 60, 16, ORANGE);
        // TODO 4: DrawText("Seed: 42", 10, 85, 16, WHITE);
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

const int LEVEL_DATA[NUM_LEVELS][ROWS][COLS] = {
    // Level 0: mini level with exit door at top-right
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
    // Level 1: reward level
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

struct World {
    Player player;
    int tilemap[ROWS][COLS];
    int score;
    Command cmd;
    int level_index;
};

World w;

// LCG random number generator
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

const char* cmdName(Command cmd) {
    if (cmd == CMD_LEFT)  return "CMD_LEFT";
    if (cmd == CMD_RIGHT) return "CMD_RIGHT";
    return "CMD_NONE";
}

void loadLevel(World& w) {
    memcpy(w.tilemap, LEVEL_DATA[w.level_index], sizeof(w.tilemap));
}

void initWorld(World& w) {
    w.player = {48.0f, 350.0f, 0.0f, 0.0f, GROUNDED, 0.0f, 0.0f};
    w.score = 0;
    w.cmd = CMD_NONE;
    w.level_index = 0;
    loadLevel(w);
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
                    scrambleCoins(w, 42 + w.level_index * 37);
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
    scrambleCoins(w, 42);
    cout << "Seed: 42" << endl;
    cout << "RNG: active" << endl;
    cout << "Pattern: deterministic-rng" << endl;
    while (!WindowShouldClose()) {
        inputPass(w);
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
        DrawText(w.player.state == GROUNDED ? "GROUNDED" : "AIRBORNE", 10, 10, 20, WHITE);
        DrawText(TextFormat("Score: %d", w.score), 10, 35, 20, YELLOW);
        DrawText(TextFormat("Level: %d", w.level_index + 1), 10, 60, 16, ORANGE);
        DrawText("Seed: 42", 10, 85, 16, WHITE);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Seed printed in output", expectedOutput: "Seed: 42" },
      { id: "g2", description: "RNG active", expectedOutput: "RNG: active" },
      { id: "g3", description: "Pattern printed", expectedOutput: "Pattern: deterministic-rng" },
    ],
    hints: [
      "In scrambleCoins, first loop all tiles and set tile==2 to 0 (clear coins).",
      "Then use a while loop: tries++; r=lcgNext()%ROWS; c=lcgNext()%COLS; if tile==0, set to 2 and placed++.",
      "Call scrambleCoins(w, 42) after initWorld(w) in main.",
    ],
    estimatedMinutes: 15,
  },
};

export default lessonPlatformer21;