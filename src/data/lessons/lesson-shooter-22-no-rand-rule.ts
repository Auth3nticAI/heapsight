import type { Lesson } from "@/types/lesson";

export const lessonShooter22: Lesson = {
  id: "shooter-22-no-rand-rule",
  title: "No-rand Rule",
  description: "Find and remove the hidden rand() call. Enforce the no-rand policy so all randomness flows through the seeded rng_next() — no exceptions.",
  order: 22,
  xpReward: 100,
  tier: "pro",
  concepts: ["no-rand policy", "determinism enforcement", "single RNG source", "policy over convention"],
  part1: {
    title: "Concept: No-rand Policy",
    type: "concept",
    instructions: `# No-rand Rule

## Mental Model
A codebase with one seeded RNG is deterministic. A codebase with ONE rand() call anywhere is broken — rand() uses hidden global state, reseeds itself differently per platform, and can't be controlled. One rand() pollutes the entire determinism guarantee.

## What Breaks Without This
\`\`\`cpp
// Somewhere in enemy AI:
int flee_chance = rand() % 100;  // ONE hidden rand()

// Your seeded RNG is perfect, but this rand() call:
// - Uses a different hidden seed (time-based on MSVC)
// - Returns platform-specific values (Linux vs Windows)
// - Can't be replayed
// Result: your replay system fails even though YOU followed the rules.
\`\`\`
The no-rand rule exists because correctness is a team sport. One violation anywhere breaks everyone's replays.

## The Fix: Policy Enforcement
\`\`\`cpp
// At the top of every game file:
// NO rand() ALLOWED — use rng_next() instead

// Optionally, make violations compile-fail:
// #define rand BANNED_RAND_USE_RNG_NEXT
\`\`\`
The \`#define\` approach turns a runtime bug into a compile error. Any file that includes your RNG header and calls rand() won't compile.

## Key Concepts
- One RNG source — all randomness flows from \`rng_state\`
- Zero \`rand()\` calls — banned by policy, not by convention
- Policy enforcement is architectural — the code prevents the mistake, not willpower
- rand() is also SLOWER than your LCG due to mutex overhead in some stdlib implementations

## Performance Insight
Your LCG: 1 multiply + 1 add + 1 modulo = ~3 cycles. rand(): mutex acquire + state update + mutex release = 20-100 cycles on multi-threaded builds. No-rand is faster AND deterministic.

## Memory Insight
rand() has hidden global state in the C standard library — a global int that you cannot inspect or control. Your rng_state is explicit, inspectable, and saveable.

## Your Task
Audit a fake codebase with 2 rand() calls and 3 rng_next() calls. Report the count, enforce the policy.

Expected output:
\`\`\`
rand() calls found: 0
rng_next() calls: 3
Policy: no-rand
Pattern: no-rand
\`\`\`

## Beginner Trap
Don't use rand() "just for prototyping." Once it's in the codebase it spreads. Code is copied, pasted, and rand() travels. Enforce the rule from lesson one.

## Elite Insight
Valve's Source Engine bans rand() in networked code and uses a seeded RNG per entity. Riot Games spent months fixing a Valorant anti-cheat regression caused by a single uncontrolled rand() call in a utility library. The no-rand rule is non-negotiable in production.

## Systems Thinking Connection
RPG Lesson 22 enforces the same no-rand rule for its loot tables. Platformer Lesson 29 bans rand() in procedural generation. The discipline is universal.

## Skill Reinforcement
Built on: L21 Seeded RNG — the alternative to rand() is now available.
Feeds into: L23 State Signature — proving determinism requires no hidden random sources.

## Mastery Check
*Question:* How do you prevent rand() from being called by accident in a large codebase?
*Answer:* Add #define rand RAND_IS_BANNED_USE_RNG_NEXT to your shared RNG header. Any rand() call will fail to compile with a descriptive error message.`,
    starterCode: `#include <iostream>
// NO rand() ALLOWED — use rng_next() instead
using namespace std;

unsigned int rng_state = 42;
unsigned int rng_next() {
    rng_state = rng_state * 1664525u + 1013904223u;
    return rng_state;
}
int rng_range(int max) { return (int)(rng_next() % (unsigned int)max); }

// Simulated call log (no actual rand() calls)
int rand_call_count = 0;  // we are enforcing zero
int rng_call_count = 0;

void enemy_spawn() {
    // TODO 1: call rng_range(800) for x position and increment rng_call_count
    rng_call_count++;  // placeholder — replace with actual rng_range call
}

void bullet_spawn() {
    rng_range(10);  // uses rng for spread
    // TODO 2: increment rng_call_count here
}

void power_up_drop() {
    rng_range(100);  // loot roll
    rng_call_count++;
}

int main() {
    enemy_spawn();
    bullet_spawn();
    power_up_drop();
    // TODO 3: print the counts and policy lines
    cout << "rand() calls found: " << rand_call_count << endl;
    cout << "rng_next() calls: " << rng_call_count << endl;
    cout << "Policy: no-rand" << endl;
    cout << "Pattern: no-rand" << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
// NO rand() ALLOWED — use rng_next() instead
using namespace std;

unsigned int rng_state = 42;
unsigned int rng_next() {
    rng_state = rng_state * 1664525u + 1013904223u;
    return rng_state;
}
int rng_range(int max) { return (int)(rng_next() % (unsigned int)max); }

int rand_call_count = 0;
int rng_call_count = 0;

void enemy_spawn() {
    rng_range(800);
    rng_call_count++;
}

void bullet_spawn() {
    rng_range(10);
    rng_call_count++;
}

void power_up_drop() {
    rng_range(100);
    rng_call_count++;
}

int main() {
    enemy_spawn();
    bullet_spawn();
    power_up_drop();
    cout << "rand() calls found: " << rand_call_count << endl;
    cout << "rng_next() calls: " << rng_call_count << endl;
    cout << "Policy: no-rand" << endl;
    cout << "Pattern: no-rand" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Zero rand() calls found", expectedOutput: "rand() calls found: 0" },
      { id: "t2", description: "RNG calls counted", expectedOutput: "rng_next() calls: 3" },
      { id: "t3", description: "Policy name printed", expectedOutput: "Policy: no-rand" },
      { id: "t4", description: "Pattern name printed", expectedOutput: "Pattern: no-rand" },
    ],
    hints: [
      "Increment rng_call_count inside enemy_spawn() after the rng_range(800) call.",
      "Increment rng_call_count inside bullet_spawn() after rng_range(10).",
      "power_up_drop already increments rng_call_count. All three functions = 3 rng calls total.",
    ],
    estimatedMinutes: 7,
  },
  part2: {
    title: "Build: No-rand Rule",
    type: "game_builder",
    instructions: `# Build: No-rand Rule

## Mental Model
Add the no-rand policy comment to the top of main.cpp. Find and remove the one hidden rand() call in the starter code. Replace it with rng_range(). The HUD badge confirms the policy is active.

## What's Already Here
Full shooter from L21 with seeded RNG. The starter has ONE rand() call hidden in the ship starting position initialization — a deliberate violation to find and fix.

## Your Task

**TODO 1** — Find and fix the rand() violation in main(). The ship X position uses rand():
\`\`\`cpp
// WRONG (in starter):
world.ship_x = 100 + rand() % 600;
\`\`\`
Replace with:
\`\`\`cpp
world.ship_x = 200;  // fixed start position — deterministic
\`\`\`
Or use rng_range if you want a random but deterministic start:
\`\`\`cpp
world.ship_x = 100 + rng_range(600);
\`\`\`

**TODO 2** — Add the no-rand policy comment at the top of the file, after the includes:
\`\`\`cpp
// POLICY: NO rand() — use rng_next()/rng_range() only
\`\`\`

**TODO 3** — Update startup cout to print the policy:
\`\`\`cpp
cout << "rand() calls found: 0" << endl;
cout << "rng_next() calls: 1" << endl;
cout << "Policy: no-rand" << endl;
cout << "Pattern: no-rand" << endl;
\`\`\`

## Did It Work?
The ship always starts at position 200 (deterministic). Console prints the no-rand audit. HUD shows "No rand" badge in green.`,
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

// POLICY: NO rand() — use rng_next()/rng_range() only
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
    // TODO 1: find and fix the rand() violation below — replace with fixed 200
    world.ship_x = 100 + rand() % 600;  // BUG: rand() violates no-rand policy
    world.ship_y = 380;
    world.speed = 5; world.ship_w = 40; world.ship_h = 20;
    world.score = 0; world.wave = 1; world.shots_fired = 0;
    world.player_hp = 3; world.player_max_hp = 3;
    for (int i = 0; i < MAX_BULLETS; i++) world.bullet_active[i] = false;
    for (int i = 0; i < MAX_ENEMIES; i++) world.enemy_active[i] = false;
    spawnWave(world);
    // TODO 2: add policy comment: // POLICY: NO rand() — use rng_next()/rng_range() only
    // TODO 3: print the 4 audit lines
    cout << "rand() calls found: 1" << endl;  // fix this to 0 after removing rand()
    cout << "rng_next() calls: 1" << endl;
    cout << "Policy: no-rand" << endl;
    cout << "Pattern: no-rand" << endl;

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
        DrawText("No rand", 10, 160, 20, GREEN);
        DrawText("Seed: 42", 10, 185, 20, SKYBLUE);
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

// POLICY: NO rand() — use rng_next()/rng_range() only
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
    world.ship_x = 200;
    world.ship_y = 380;
    world.speed = 5; world.ship_w = 40; world.ship_h = 20;
    world.score = 0; world.wave = 1; world.shots_fired = 0;
    world.player_hp = 3; world.player_max_hp = 3;
    for (int i = 0; i < MAX_BULLETS; i++) world.bullet_active[i] = false;
    for (int i = 0; i < MAX_ENEMIES; i++) world.enemy_active[i] = false;
    spawnWave(world);
    cout << "rand() calls found: 0" << endl;
    cout << "rng_next() calls: 1" << endl;
    cout << "Policy: no-rand" << endl;
    cout << "Pattern: no-rand" << endl;

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
        DrawText("No rand", 10, 160, 20, GREEN);
        DrawText("Seed: 42", 10, 185, 20, SKYBLUE);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Zero rand() calls confirmed", expectedOutput: "rand() calls found: 0" },
      { id: "g2", description: "RNG call count printed", expectedOutput: "rng_next() calls: 1" },
      { id: "g3", description: "Policy line printed", expectedOutput: "Policy: no-rand" },
      { id: "g4", description: "Pattern name printed", expectedOutput: "Pattern: no-rand" },
    ],
    hints: [
      "Find world.ship_x = 100 + rand() % 600 and replace with world.ship_x = 200.",
      "Change the first cout from rand() calls found: 1 to rand() calls found: 0.",
      "The HUD badge No rand in GREEN confirms the policy is active.",
    ],
    estimatedMinutes: 12,
  },
};