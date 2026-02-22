import type { Lesson } from "@/types/lesson";

export const lessonShooter23: Lesson = {
  id: "shooter-23-state-signature-v0",
  title: "State Signature v0",
  description: "Add a state hash function that fingerprints entity positions — if two runs with the same seed produce different signatures, hidden non-determinism is present.",
  order: 23,
  xpReward: 100,
  tier: "pro",
  concepts: ["state signature", "hash function", "determinism verification", "replay validation"],
  part1: {
    title: "Concept: State Signature",
    type: "concept",
    instructions: `# State Signature v0

## Mental Model
A state signature is a fingerprint of the game state. If two game runs produce the same inputs, they MUST produce the same signature at every tick. If signatures diverge, hidden non-determinism exists somewhere. The signature is your canary.

## What Breaks Without This
Without a state signature you can't verify determinism. You might THINK your game is replay-safe, but without a fingerprint you have no proof. The replay diverges subtly — entity positions drift by 0.001 per frame. After 1000 frames, enemies are in completely different positions. Your replay system is broken and you had no warning.

## The Fix: XOR Hash of State
\`\`\`cpp
unsigned int computeStateHash(int positions[], int active[], int count) {
    unsigned int h = 0;
    for (int i = 0; i < count; i++) {
        if (active[i]) h += (unsigned int)positions[i];
    }
    return h;
}
\`\`\`
The hash accumulates all active entity positions. Two runs with the same seed and inputs produce identical hash values at every tick. If they don't match, something mutated state without going through the deterministic pipeline.

## Key Concepts
- Hash covers ALL active entities — any position drift shows as a mismatch
- Computed at the END of the update pass, BEFORE rendering
- Can be compared between two replays: same hash = identical state
- V0 is intentionally simple — sufficient for basic replay validation

## Performance Insight
5 enemy positions + ship = 6 additions per tick. Sub-microsecond. In production, this hash is often computed only on checkpoints (every 30 ticks) to save CPU. For debugging, you enable per-tick hashing.

## Memory Insight
One unsigned int. The hash is ephemeral — computed, compared, discarded. It's not stored per-frame unless you're building a full replay log.

## Your Task
Compute a state hash for 5 enemies at fixed y positions. All at y=30.

Expected output:
\`\`\`
Positions hashed: 5
Signature: 150
Pattern: state-sig
\`\`\`

## Beginner Trap
Don't hash entity INDICES — hash entity DATA (positions). Index 2 being active doesn't tell you where the entity is. Position drift is what breaks replays.

## Elite Insight
Valve's Source Engine computes a CRC32 of the full game state every 128 ticks during replays and aborts on mismatch. StarCraft II has a per-frame hash verification mode enabled during competitive play. Overwatch uses a 64-bit state hash to detect desyncs in spectator mode.

## Systems Thinking Connection
RPG Lesson 23 computes the same hash for turn state verification. Platformer Lesson 34 hashes physics state. The hash is the universal determinism validator.

## Skill Reinforcement
Built on: L22 No-rand Rule — state is now fully deterministic, making the signature meaningful.
Feeds into: L24 Save Snapshot — the hash confirms the loaded state matches the saved state.

## Mastery Check
*Question:* Two replay runs diverge at frame 450. How do you find which frame first diverged?
*Answer:* Binary search: compare hash at frame 225. If same, diverged in [226, 450]. If different, diverged in [1, 225]. Repeat until you find the exact frame.`,
    starterCode: `#include <iostream>
using namespace std;

const int ENEMY_COUNT = 5;
int enemy_y[ENEMY_COUNT] = {30, 30, 30, 30, 30};
bool enemy_active[ENEMY_COUNT] = {true, true, true, true, true};

// TODO 1: implement computeStateHash()
// Sum active enemy_y values and return the total as unsigned int
unsigned int computeStateHash() {
    unsigned int h = 0;
    // your code here
    return h;
}

int main() {
    int hashed = 0;
    for (int i = 0; i < ENEMY_COUNT; i++) if (enemy_active[i]) hashed++;
    // TODO 2: call computeStateHash() and store in sig
    unsigned int sig = 0;
    cout << "Positions hashed: " << hashed << endl;
    // TODO 3: print "Signature: " << sig << endl
    cout << "Pattern: state-sig" << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int ENEMY_COUNT = 5;
int enemy_y[ENEMY_COUNT] = {30, 30, 30, 30, 30};
bool enemy_active[ENEMY_COUNT] = {true, true, true, true, true};

unsigned int computeStateHash() {
    unsigned int h = 0;
    for (int i = 0; i < ENEMY_COUNT; i++)
        if (enemy_active[i]) h += (unsigned int)enemy_y[i];
    return h;
}

int main() {
    int hashed = 0;
    for (int i = 0; i < ENEMY_COUNT; i++) if (enemy_active[i]) hashed++;
    unsigned int sig = computeStateHash();
    cout << "Positions hashed: " << hashed << endl;
    cout << "Signature: " << sig << endl;
    cout << "Pattern: state-sig" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Hashed count printed", expectedOutput: "Positions hashed: 5" },
      { id: "t2", description: "Signature matches sum of 5x30", expectedOutput: "Signature: 150" },
      { id: "t3", description: "Pattern name printed", expectedOutput: "Pattern: state-sig" },
    ],
    hints: [
      "computeStateHash loops over ENEMY_COUNT. For each active[i], add enemy_y[i] to h. Return h.",
      "All 5 enemies are at y=30. Sum = 5 * 30 = 150. Signature should be 150.",
      "Call computeStateHash() after the hashed count loop, store in sig, then print Signature: sig.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: State Signature v0",
    type: "game_builder",
    instructions: `# Build: State Signature v0

## Mental Model
Add \`computeStateHash(World& w)\` to the game. Call it once after \`spawnWave\` to print the initial signature. The HUD shows a live hash. If you change the seed, the hash changes. Same seed = always the same hash.

## What's Already Here
Full shooter from L22 with seeded RNG and no-rand policy. The state is now deterministic — hashing it gives a repeatable fingerprint.

## Your Task

**TODO 1** — Add \`computeStateHash(World& w)\` after \`spawnWave\`:
\`\`\`cpp
unsigned int computeStateHash(World& w) {
    unsigned int h = 0;
    for (int i = 0; i < MAX_ENEMIES; i++)
        if (w.enemy_active[i]) h += (unsigned int)(int)w.enemy_y[i];
    h += (unsigned int)(int)w.ship_x;
    h += (unsigned int)w.score;
    return h;
}
\`\`\`

**TODO 2** — In main(), after \`spawnWave(world)\`, print the startup hash:
\`\`\`cpp
unsigned int sig = computeStateHash(world);
cout << "Positions hashed: " << MAX_ENEMIES << endl;
cout << "Signature: " << sig << endl;
cout << "Pattern: state-sig" << endl;
\`\`\`

**TODO 3** — In the render section, show the live hash in HUD:
\`\`\`cpp
DrawText(TextFormat("Sig: %u", computeStateHash(world)), 10, 185, 16, LIME);
\`\`\`

## Did It Work?
The HUD shows a live "Sig: N" value. Every time you kill an enemy or move the ship, the signature changes. Click Run a second time — the starting signature is identical. Same seed = deterministic.`,
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

// TODO 1: implement computeStateHash(World& w)
// Sum active enemy_y values (as int) + ship_x (as int) + score
unsigned int computeStateHash(World& w) {
    return 0;
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
    // TODO 2: compute sig = computeStateHash(world) and print:
    // "Positions hashed: " MAX_ENEMIES
    // "Signature: " sig
    // "Pattern: state-sig"
    cout << "Positions hashed: " << MAX_ENEMIES << endl;
    cout << "Signature: 0" << endl;  // fix this
    cout << "Pattern: state-sig" << endl;

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
        // TODO 3: draw live Sig: N in LIME color
        DrawText("Sig: ...", 10, 160, 16, LIME);
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

unsigned int computeStateHash(World& w) {
    unsigned int h = 0;
    for (int i = 0; i < MAX_ENEMIES; i++)
        if (w.enemy_active[i]) h += (unsigned int)(int)w.enemy_y[i];
    h += (unsigned int)(int)w.ship_x;
    h += (unsigned int)w.score;
    return h;
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
    { unsigned int sig = computeStateHash(world);
      cout << "Positions hashed: " << MAX_ENEMIES << endl;
      cout << "Signature: " << sig << endl;
      cout << "Pattern: state-sig" << endl; }

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
        DrawText(TextFormat("Sig: %u", computeStateHash(world)), 10, 160, 16, LIME);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Hash count at startup", expectedOutput: "Positions hashed: 5" },
      { id: "g2", description: "Pattern name printed", expectedOutput: "Pattern: state-sig" },
    ],
    hints: [
      "computeStateHash sums active enemy_y as int, adds ship_x as int and score. Return the accumulated uint.",
      "Call computeStateHash(world) after spawnWave. Print Positions hashed: MAX_ENEMIES, Signature: sig, Pattern: state-sig.",
      "In the render section, use TextFormat with %u to display the hash from computeStateHash(world).",
    ],
    estimatedMinutes: 15,
  },
};