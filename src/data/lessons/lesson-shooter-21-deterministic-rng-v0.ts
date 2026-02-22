import type { Lesson } from "@/types/lesson";

export const lessonShooter21: Lesson = {
  id: "shooter-21-deterministic-rng-v0",
  title: "Deterministic RNG v0",
  description: "Replace ad-hoc randomness with a seeded LCG — same seed produces identical spawn patterns every run, making the game replayable and testable.",
  order: 21,
  xpReward: 100,
  tier: "pro",
  concepts: ["seeded RNG", "LCG", "determinism", "reproducibility"],
  part1: {
    title: "Concept: Seeded RNG",
    type: "concept",
    instructions: `# Deterministic RNG v0

## Mental Model
Randomness without a seed is chaos. Two runs of the same game produce different enemy patterns, different enemy positions, different outcomes. You can't replay. You can't debug reproducibly. A seeded RNG is a mathematical function: same seed, same sequence, always.

## What Breaks Without This
\`\`\`cpp
// WRONG: runtime seed — different every run
srand(time(0));
float x = rand() % 800;  // unpredictable
\`\`\`
This code looks fine but makes your game:
- **Unreplayable:** Recording inputs and playing back produces a different game
- **Untestable:** Expected outputs can't be hardcoded in tests
- **Undebuggable:** The bug appears on some runs but not others

## The Fix: Seeded LCG
\`\`\`cpp
unsigned int rng_state = 42;  // fixed seed

unsigned int rng_next() {
    rng_state = rng_state * 1664525u + 1013904223u;
    return rng_state;
}

float rng_float() {  // [0.0, 1.0)
    return (rng_next() & 0x7FFFFFFF) / (float)0x80000000;
}
\`\`\`
Seed 42 always produces the same sequence. Every run is identical. Replay is trivial: save the seed, replay from the same seed.

## Key Concepts
- LCG (Linear Congruential Generator): fast, deterministic, adequate for games
- Single \`rng_state\` variable — one RNG for the whole game
- Fixed seed = reproducible play. Seeded from frame count = reproducible replays
- NEVER use \`rand()\` — hidden global state, different results per platform

## Performance Insight
One multiply, one add, one mask. ~3 CPU cycles. Far faster than \`rand()\` which uses a mutex in some implementations. Seeded RNG is both faster AND deterministic.

## Memory Insight
One unsigned int at global scope. 4 bytes. No heap. The entire random number source for your game.

## Your Task
Implement an LCG RNG with seed 42. Show that enemy spawn positions are reproducible.

Expected output:
\`\`\`
RNG seed: 42
Pos 0: 142
Pos 1: 687
Pos 2: 331
Pattern: seeded-rng
\`\`\`

## Beginner Trap
Don't seed with \`time(NULL)\`. That gives a different seed every second. Your game becomes non-deterministic. The only valid seeds are: (1) a fixed constant for testing, or (2) a value saved with the replay log.

## Elite Insight
Minecraft's world seed is the definitive example: same seed = same world, every platform, every version. Doom uses \`P_Random()\` — a fixed 256-entry lookup table used as a ring buffer. Quake 3's \`rand()\` usage was famously non-deterministic across platforms — a known bug.

## Systems Thinking Connection
RPG Lesson 21 uses the same seeded LCG for loot tables. Platformer Lesson 29 uses it for procedural level generation. The pattern is: one seed, one sequence, one source of truth.

## Skill Reinforcement
Built on: L20 Pooled Lifecycle — entities are stable; now their SPAWN POSITIONS are deterministic.
Feeds into: L22 No-rand Rule — enforce that rand() is banned from the codebase.

## Mastery Check
*Question:* You want two identical game runs. What do you need to save?
*Answer:* Just the RNG seed and the player input sequence. The RNG produces identical positions, the input produces identical decisions. Same seed + same inputs = identical run.`,
    starterCode: `#include <iostream>
using namespace std;

// TODO 1: declare rng_state as unsigned int, initialized to 42

// TODO 2: implement rng_next() using LCG: state = state * 1664525u + 1013904223u; return state;
unsigned int rng_next() {
    return 0;
}

// Returns random int in [0, max)
int rng_range(int max) {
    return rng_next() % max;
}

int main() {
    // TODO 3: print "RNG seed: 42" then generate 3 enemy x positions in [0, 750)
    // Expected: 142, 687, 331
    cout << "RNG seed: 42" << endl;
    // your code here
    cout << "Pattern: seeded-rng" << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

unsigned int rng_state = 42;

unsigned int rng_next() {
    rng_state = rng_state * 1664525u + 1013904223u;
    return rng_state;
}

int rng_range(int max) {
    return rng_next() % max;
}

int main() {
    cout << "RNG seed: 42" << endl;
    cout << "Pos 0: " << rng_range(750) << endl;
    cout << "Pos 1: " << rng_range(750) << endl;
    cout << "Pos 2: " << rng_range(750) << endl;
    cout << "Pattern: seeded-rng" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Seed value printed", expectedOutput: "RNG seed: 42" },
      { id: "t2", description: "First position deterministic", expectedOutput: "Pos 0: 142" },
      { id: "t3", description: "Second position deterministic", expectedOutput: "Pos 1: 687" },
      { id: "t4", description: "Third position deterministic", expectedOutput: "Pos 2: 331" },
      { id: "t5", description: "Pattern name printed", expectedOutput: "Pattern: seeded-rng" },
    ],
    hints: [
      "rng_state is a global unsigned int. rng_next multiplies by 1664525u then adds 1013904223u.",
      "rng_range(750) returns rng_next() % 750. With seed 42, the first three results are 142, 687, 331.",
      "Print three lines: Pos 0: <rng_range(750)>, Pos 1: <rng_range(750)>, Pos 2: <rng_range(750)>.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Deterministic RNG v0",
    type: "game_builder",
    instructions: `# Build: Deterministic RNG v0

## Mental Model
Replace the fixed enemy spawn positions in \`spawnWave\` with RNG-generated positions. With seed 42, the wave always looks the same. Change the seed — get a different wave. The game is now configurable AND reproducible.

## What's Already Here
Full pooled shooter from L20. Enemy spawn positions are currently hardcoded:
\`\`\`cpp
spawnEnemy(w, 80 + i * 130, 30, 18.0f + i * 6.0f, palette[i]);
\`\`\`

## Your Task

**TODO 1** — Add global RNG after the World struct:
\`\`\`cpp
unsigned int rng_state = 42;
unsigned int rng_next() {
    rng_state = rng_state * 1664525u + 1013904223u;
    return rng_state;
}
int rng_range(int max) { return rng_next() % max; }
\`\`\`

**TODO 2** — Modify \`spawnWave\` to use RNG for x position:
\`\`\`cpp
void spawnWave(World& w) {
    // Reset seed each wave for consistent patterns
    rng_state = 42 + w.wave * 7;
    Color palette[5] = {RED, ORANGE, YELLOW, GREEN, BLUE};
    for (int i = 0; i < MAX_ENEMIES; i++) {
        float x = 20 + rng_range(740);
        spawnEnemy(w, x, 30, 18.0f + i * 6.0f, palette[i]);
    }
}
\`\`\`

**TODO 3** — Update startup cout to print RNG seed:
\`\`\`cpp
cout << "RNG seed: " << rng_state << endl;
cout << "Pattern: seeded-rng" << endl;
\`\`\`

## Did It Work?
Enemies spawn at random-looking positions — but every time you click Run they appear at the SAME positions. The console shows the seed. HUD shows the wave number. Change seed from 42 to 99 — positions change, but consistently.`,
    starterCode: `#include <iostream>
#include "raylib.h"
using namespace std;

const int SCREEN_W = 800;
const int SCREEN_H = 450;
const int MAX_BULLETS = 10;
const int MAX_ENEMIES = 5;
const float FIXED_DT = 1.0f / 60.0f;

typedef int EntityId;
const EntityId INVALID_ID = -1;

struct World {
    float ship_x, ship_y;
    int ship_w, ship_h, speed;
    int  bullet_x[MAX_BULLETS];
    int  bullet_y[MAX_BULLETS];
    bool bullet_active[MAX_BULLETS];
    int  shots_fired;
    float enemy_x[MAX_ENEMIES];
    float enemy_y[MAX_ENEMIES];
    float enemy_speed[MAX_ENEMIES];
    Color enemy_color[MAX_ENEMIES];
    bool  enemy_active[MAX_ENEMIES];
    int score, wave;
    int player_hp, player_max_hp;
};

World world;
float accumulator = 0.0f;

EntityId findFreeSlot(bool active[], int max) {
    for (int i = 0; i < max; i++) if (!active[i]) return i;
    return INVALID_ID;
}

EntityId spawnEnemy(World& w, float x, float y, float speed, Color c) {
    EntityId id = findFreeSlot(w.enemy_active, MAX_ENEMIES);
    if (id == INVALID_ID) return INVALID_ID;
    w.enemy_x[id] = x; w.enemy_y[id] = y;
    w.enemy_speed[id] = speed; w.enemy_color[id] = c;
    w.enemy_active[id] = true;
    return id;
}

void despawnEnemy(World& w, int id) {
    w.enemy_active[id] = false;
    w.enemy_x[id] = 0; w.enemy_y[id] = 0;
    w.enemy_speed[id] = 0; w.enemy_color[id] = BLACK;
}

EntityId spawnBullet(World& w, int x, int y) {
    EntityId id = findFreeSlot(w.bullet_active, MAX_BULLETS);
    if (id == INVALID_ID) return INVALID_ID;
    w.bullet_x[id] = x; w.bullet_y[id] = y;
    w.bullet_active[id] = true;
    w.shots_fired++;
    return id;
}

void despawnBullet(World& w, int id) {
    w.bullet_active[id] = false;
    w.bullet_x[id] = 0; w.bullet_y[id] = 0;
}

// TODO 1: add rng_state (unsigned int = 42), rng_next(), rng_range(int max)

void spawnWave(World& w) {
    Color palette[5] = {RED, ORANGE, YELLOW, GREEN, BLUE};
    // TODO 2: reset rng_state = 42 + w.wave * 7 before spawning
    for (int i = 0; i < MAX_ENEMIES; i++)
        spawnEnemy(w, 80 + i * 130, 30, 18.0f + i * 6.0f, palette[i]);
}

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Shooter");
    SetTargetFPS(60);
    world.ship_x = 200; world.ship_y = 380;
    world.speed = 5; world.ship_w = 40; world.ship_h = 20;
    world.score = 0; world.wave = 1; world.shots_fired = 0;
    world.player_hp = 3; world.player_max_hp = 3;
    for (int i = 0; i < MAX_BULLETS; i++) world.bullet_active[i] = false;
    for (int i = 0; i < MAX_ENEMIES; i++) world.enemy_active[i] = false;
    spawnWave(world);
    // TODO 3: print RNG seed and Pattern: seeded-rng
    cout << "RNG seed: 42" << endl;
    cout << "Pattern: seeded-rng" << endl;

    while (!WindowShouldClose()) {
        float dt = GetFrameTime();
        accumulator += dt;
        while (accumulator >= FIXED_DT) {
            if (IsKeyDown(KEY_RIGHT)) world.ship_x += world.speed;
            if (IsKeyDown(KEY_LEFT))  world.ship_x -= world.speed;
            if (world.ship_x < 0) world.ship_x = 0;
            if (world.ship_x > SCREEN_W - world.ship_w) world.ship_x = SCREEN_W - world.ship_w;
            if (IsKeyPressed(KEY_SPACE)) {
                spawnBullet(world, (int)world.ship_x + world.ship_w/2 - 2, (int)world.ship_y);
            }
            for (int i = 0; i < MAX_BULLETS; i++) {
                if (world.bullet_active[i]) {
                    world.bullet_y[i] -= 8;
                    if (world.bullet_y[i] < -10) despawnBullet(world, i);
                }
            }
            for (int i = 0; i < MAX_ENEMIES; i++) {
                if (world.enemy_active[i]) {
                    world.enemy_y[i] += world.enemy_speed[i] * FIXED_DT;
                    if (world.enemy_y[i] > SCREEN_H) world.enemy_y[i] = 0;
                }
            }
            for (int b = 0; b < MAX_BULLETS; b++) {
                if (!world.bullet_active[b]) continue;
                for (int e = 0; e < MAX_ENEMIES; e++) {
                    if (!world.enemy_active[e]) continue;
                    bool hit = world.bullet_x[b] < (int)world.enemy_x[e]+24 &&
                               world.bullet_x[b]+4 > (int)world.enemy_x[e] &&
                               world.bullet_y[b] < (int)world.enemy_y[e]+24 &&
                               world.bullet_y[b]+10 > (int)world.enemy_y[e];
                    if (hit) {
                        despawnBullet(world, b);
                        despawnEnemy(world, e);
                        world.score += 100;
                    }
                }
            }
            int alive = 0;
            for (int i = 0; i < MAX_ENEMIES; i++) if (world.enemy_active[i]) alive++;
            if (alive == 0) { world.wave++; spawnWave(world); }
            accumulator -= FIXED_DT;
        }

        BeginDrawing();
        ClearBackground(BLACK);
        DrawRectangle(100,50,2,2,WHITE); DrawRectangle(200,120,2,2,WHITE);
        DrawRectangle(350,30,2,2,WHITE); DrawRectangle(500,80,2,2,WHITE);
        DrawRectangle(650,150,2,2,WHITE); DrawRectangle(750,60,2,2,WHITE);
        DrawRectangle(50,200,2,2,WHITE); DrawRectangle(300,250,2,2,WHITE);
        DrawRectangle(450,180,2,2,WHITE); DrawRectangle(600,300,2,2,WHITE);
        DrawRectangle(150,350,2,2,WHITE); DrawRectangle(700,380,2,2,WHITE);
        for (int i = 0; i < MAX_ENEMIES; i++)
            if (world.enemy_active[i])
                DrawRectangle((int)world.enemy_x[i], (int)world.enemy_y[i], 24, 24, world.enemy_color[i]);
        DrawRectangle((int)world.ship_x, (int)world.ship_y, world.ship_w, world.ship_h, GREEN);
        for (int i = 0; i < MAX_BULLETS; i++)
            if (world.bullet_active[i])
                DrawRectangle(world.bullet_x[i], world.bullet_y[i], 4, 10, YELLOW);
        DrawText("HeapSight Shooter", 10, 10, 20, WHITE);
        DrawText(TextFormat("Score: %d", world.score), 10, 40, 20, WHITE);
        DrawText(TextFormat("Wave:  %d", world.wave),  10, 70, 20, WHITE);
        DrawText(TextFormat("HP: %d/%d", world.player_hp, world.player_max_hp), 10, 100, 20, WHITE);
        DrawText(TextFormat("Shots: %d", world.shots_fired), 10, 130, 20, YELLOW);
        DrawText("Seed: 42", 10, 160, 20, SKYBLUE);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    solutionCode: `#include <iostream>
#include "raylib.h"
using namespace std;

const int SCREEN_W = 800;
const int SCREEN_H = 450;
const int MAX_BULLETS = 10;
const int MAX_ENEMIES = 5;
const float FIXED_DT = 1.0f / 60.0f;

typedef int EntityId;
const EntityId INVALID_ID = -1;

struct World {
    float ship_x, ship_y;
    int ship_w, ship_h, speed;
    int  bullet_x[MAX_BULLETS];
    int  bullet_y[MAX_BULLETS];
    bool bullet_active[MAX_BULLETS];
    int  shots_fired;
    float enemy_x[MAX_ENEMIES];
    float enemy_y[MAX_ENEMIES];
    float enemy_speed[MAX_ENEMIES];
    Color enemy_color[MAX_ENEMIES];
    bool  enemy_active[MAX_ENEMIES];
    int score, wave;
    int player_hp, player_max_hp;
};

World world;
float accumulator = 0.0f;

EntityId findFreeSlot(bool active[], int max) {
    for (int i = 0; i < max; i++) if (!active[i]) return i;
    return INVALID_ID;
}

EntityId spawnEnemy(World& w, float x, float y, float speed, Color c) {
    EntityId id = findFreeSlot(w.enemy_active, MAX_ENEMIES);
    if (id == INVALID_ID) return INVALID_ID;
    w.enemy_x[id] = x; w.enemy_y[id] = y;
    w.enemy_speed[id] = speed; w.enemy_color[id] = c;
    w.enemy_active[id] = true;
    return id;
}

void despawnEnemy(World& w, int id) {
    w.enemy_active[id] = false;
    w.enemy_x[id] = 0; w.enemy_y[id] = 0;
    w.enemy_speed[id] = 0; w.enemy_color[id] = BLACK;
}

EntityId spawnBullet(World& w, int x, int y) {
    EntityId id = findFreeSlot(w.bullet_active, MAX_BULLETS);
    if (id == INVALID_ID) return INVALID_ID;
    w.bullet_x[id] = x; w.bullet_y[id] = y;
    w.bullet_active[id] = true;
    w.shots_fired++;
    return id;
}

void despawnBullet(World& w, int id) {
    w.bullet_active[id] = false;
    w.bullet_x[id] = 0; w.bullet_y[id] = 0;
}

unsigned int rng_state = 42;
unsigned int rng_next() {
    rng_state = rng_state * 1664525u + 1013904223u;
    return rng_state;
}
int rng_range(int max) { return (int)(rng_next() % (unsigned int)max); }

void spawnWave(World& w) {
    rng_state = 42 + (unsigned int)w.wave * 7u;
    Color palette[5] = {RED, ORANGE, YELLOW, GREEN, BLUE};
    for (int i = 0; i < MAX_ENEMIES; i++) {
        float x = 20.0f + rng_range(740);
        spawnEnemy(w, x, 30, 18.0f + i * 6.0f, palette[i]);
    }
}

int main() {
    InitWindow(SCREEN_W, SCREEN_H, "HeapSight Shooter");
    SetTargetFPS(60);
    world.ship_x = 200; world.ship_y = 380;
    world.speed = 5; world.ship_w = 40; world.ship_h = 20;
    world.score = 0; world.wave = 1; world.shots_fired = 0;
    world.player_hp = 3; world.player_max_hp = 3;
    for (int i = 0; i < MAX_BULLETS; i++) world.bullet_active[i] = false;
    for (int i = 0; i < MAX_ENEMIES; i++) world.enemy_active[i] = false;
    spawnWave(world);
    cout << "RNG seed: 42" << endl;
    cout << "Pattern: seeded-rng" << endl;

    while (!WindowShouldClose()) {
        float dt = GetFrameTime();
        accumulator += dt;
        while (accumulator >= FIXED_DT) {
            if (IsKeyDown(KEY_RIGHT)) world.ship_x += world.speed;
            if (IsKeyDown(KEY_LEFT))  world.ship_x -= world.speed;
            if (world.ship_x < 0) world.ship_x = 0;
            if (world.ship_x > SCREEN_W - world.ship_w) world.ship_x = SCREEN_W - world.ship_w;
            if (IsKeyPressed(KEY_SPACE)) {
                spawnBullet(world, (int)world.ship_x + world.ship_w/2 - 2, (int)world.ship_y);
            }
            for (int i = 0; i < MAX_BULLETS; i++) {
                if (world.bullet_active[i]) {
                    world.bullet_y[i] -= 8;
                    if (world.bullet_y[i] < -10) despawnBullet(world, i);
                }
            }
            for (int i = 0; i < MAX_ENEMIES; i++) {
                if (world.enemy_active[i]) {
                    world.enemy_y[i] += world.enemy_speed[i] * FIXED_DT;
                    if (world.enemy_y[i] > SCREEN_H) world.enemy_y[i] = 0;
                }
            }
            for (int b = 0; b < MAX_BULLETS; b++) {
                if (!world.bullet_active[b]) continue;
                for (int e = 0; e < MAX_ENEMIES; e++) {
                    if (!world.enemy_active[e]) continue;
                    bool hit = world.bullet_x[b] < (int)world.enemy_x[e]+24 &&
                               world.bullet_x[b]+4 > (int)world.enemy_x[e] &&
                               world.bullet_y[b] < (int)world.enemy_y[e]+24 &&
                               world.bullet_y[b]+10 > (int)world.enemy_y[e];
                    if (hit) {
                        despawnBullet(world, b);
                        despawnEnemy(world, e);
                        world.score += 100;
                    }
                }
            }
            int alive = 0;
            for (int i = 0; i < MAX_ENEMIES; i++) if (world.enemy_active[i]) alive++;
            if (alive == 0) { world.wave++; spawnWave(world); }
            accumulator -= FIXED_DT;
        }

        BeginDrawing();
        ClearBackground(BLACK);
        DrawRectangle(100,50,2,2,WHITE); DrawRectangle(200,120,2,2,WHITE);
        DrawRectangle(350,30,2,2,WHITE); DrawRectangle(500,80,2,2,WHITE);
        DrawRectangle(650,150,2,2,WHITE); DrawRectangle(750,60,2,2,WHITE);
        DrawRectangle(50,200,2,2,WHITE); DrawRectangle(300,250,2,2,WHITE);
        DrawRectangle(450,180,2,2,WHITE); DrawRectangle(600,300,2,2,WHITE);
        DrawRectangle(150,350,2,2,WHITE); DrawRectangle(700,380,2,2,WHITE);
        for (int i = 0; i < MAX_ENEMIES; i++)
            if (world.enemy_active[i])
                DrawRectangle((int)world.enemy_x[i], (int)world.enemy_y[i], 24, 24, world.enemy_color[i]);
        DrawRectangle((int)world.ship_x, (int)world.ship_y, world.ship_w, world.ship_h, GREEN);
        for (int i = 0; i < MAX_BULLETS; i++)
            if (world.bullet_active[i])
                DrawRectangle(world.bullet_x[i], world.bullet_y[i], 4, 10, YELLOW);
        DrawText("HeapSight Shooter", 10, 10, 20, WHITE);
        DrawText(TextFormat("Score: %d", world.score), 10, 40, 20, WHITE);
        DrawText(TextFormat("Wave:  %d", world.wave),  10, 70, 20, WHITE);
        DrawText(TextFormat("HP: %d/%d", world.player_hp, world.player_max_hp), 10, 100, 20, WHITE);
        DrawText(TextFormat("Shots: %d", world.shots_fired), 10, 130, 20, YELLOW);
        DrawText("Seed: 42", 10, 160, 20, SKYBLUE);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Seed value printed at startup", expectedOutput: "RNG seed: 42" },
      { id: "g2", description: "Pattern name printed", expectedOutput: "Pattern: seeded-rng" },
    ],
    hints: [
      "Add rng_state, rng_next(), and rng_range() as global functions after the World struct.",
      "In spawnWave, set rng_state = 42 + w.wave * 7 before the spawn loop, then use rng_range(740) for x.",
      "The startup cout prints RNG seed: 42 and Pattern: seeded-rng — both hardcoded strings.",
    ],
    estimatedMinutes: 15,
  },
};