import type { Lesson } from "@/types/lesson";

export const lessonShooter24: Lesson = {
  id: "shooter-24-save-snapshot-v0",
  title: "Save Snapshot v0",
  description: "Add a Snapshot struct that saves seed, score, and wave. Press S to save, L to restore — enemy positions reconstruct from the seed.",
  order: 24,
  xpReward: 100,
  tier: "pro",
  concepts: ["save snapshot", "minimal serialization", "seed-based reconstruction", "state restore"],
  part1: {
    title: "Concept: Minimal Save Snapshot",
    type: "concept",
    instructions: `# Save Snapshot v0

## Mental Model
A save snapshot is the minimum data needed to reconstruct the game state. Save seed + score + wave: you can re-run \`spawnWave\` with the saved seed and get identical enemy positions. Save everything else and you can restore the EXACT state, mid-wave.

## What Breaks Without This
Without a save, the player loses progress on every browser refresh. Without a MINIMAL save, you save too much data and the save is fragile — every struct change breaks all existing saves. Minimal serialization saves only what you can't reconstruct.

## The Fix: Minimal Snapshot Struct
\`\`\`cpp
struct Snapshot {
    unsigned int rng_seed;  // reproduces spawn positions
    int score;
    int wave;
    float ship_x;
    // Enemy positions NOT saved — reproduced from seed
};

void saveGame(Snapshot& snap, World& w) {
    snap.rng_seed = 42 + (unsigned int)w.wave * 7u;
    snap.score  = w.score;
    snap.wave   = w.wave;
    snap.ship_x = w.ship_x;
}

void loadGame(Snapshot& snap, World& w) {
    rng_state = snap.rng_seed;
    w.score   = snap.score;
    w.wave    = snap.wave;
    w.ship_x  = snap.ship_x;
    // Reconstruct enemies from seed:
    for (int i = 0; i < MAX_ENEMIES; i++) w.enemy_active[i] = false;
    spawnWave(w);  // uses rng_state just set from snap.rng_seed
}
\`\`\`

Enemy positions are NOT saved — they are derived from the seed. This is 16 bytes vs hundreds of bytes for a full entity dump. The seed is the compressed representation of the wave layout.

## Key Concepts
- Save: only unique data (seed, score, wave, ship position)
- Load: reconstruct derived data (enemy positions) from seed
- Snapshot struct is a plain-old-data type — copyable, hashable, sendable
- NO heap during save/load — struct on the stack, copied in place

## Performance Insight
Saving is 4 struct fields written = ~4 memory writes. Loading is 4 reads + spawnWave (~10 writes). Sub-microsecond. File I/O is the bottleneck in real save systems — your struct is so small it fits in a single disk sector.

## Memory Insight
sizeof(Snapshot) = ~16 bytes. The entire save is a struct that could fit in a single register on modern hardware. No heap allocation for save or load.

## Your Task
Save a snapshot, mutate state, then restore from snapshot and verify the state signature matches.

Expected output:
\`\`\`
Saved: seed=42 score=0 wave=1
Mutated: score=500 wave=3
Loaded: seed=42 score=0 wave=1
Match: YES
Pattern: snapshot
\`\`\`

## Beginner Trap
Don't save derived data (enemy positions computed from seed). Saving the seed lets you reconstruct everything. Saving positions creates a maintenance burden: if enemy count changes, all saves break.

## Elite Insight
Minecraft's save format saves the RNG seed per chunk — chunks regenerate from seed on load, not from stored block data. Celeste's save is 3KB: room ID, death count, crystal heart state. Doom's save is the full game state including all entity positions (no seed) — 127KB. Minimal saves win.

## Systems Thinking Connection
RPG Lesson 24 saves the command seed and replays commands on load. Platformer Lesson 21 saves checkpoint position. The pattern: save what you can't reconstruct, reproduce everything else.

## Skill Reinforcement
Built on: L23 State Signature — we use the signature to verify the loaded state matches the pre-save state.
Feeds into: L25 Milestone — Restart & Resume proves the full save/load/restore cycle.

## Mastery Check
*Question:* After loading a snapshot, the state signature differs from the pre-save signature. What likely went wrong?
*Answer:* Either the rng_state was not set correctly before spawnWave, or a field (score, wave, ship_x) was saved/loaded incorrectly.`,
    starterCode: `#include <iostream>
using namespace std;

struct GameState { int score; int wave; unsigned int seed; };
struct Snapshot  { int score; int wave; unsigned int seed; };

// TODO 1: implement saveSnapshot(Snapshot& snap, GameState& gs)
// Copy score, wave, seed from gs to snap
void saveSnapshot(Snapshot& snap, GameState& gs) {}

// TODO 2: implement loadSnapshot(Snapshot& snap, GameState& gs)
// Restore score, wave, seed from snap to gs
void loadSnapshot(Snapshot& snap, GameState& gs) {}

int main() {
    GameState gs = {0, 1, 42};
    Snapshot snap = {};

    saveSnapshot(snap, gs);
    cout << "Saved: seed=" << snap.seed << " score=" << snap.score << " wave=" << snap.wave << endl;

    gs.score = 500; gs.wave = 3; gs.seed = 99;
    cout << "Mutated: score=" << gs.score << " wave=" << gs.wave << endl;

    // TODO 3: call loadSnapshot and verify gs matches saved values
    loadSnapshot(snap, gs);
    cout << "Loaded: seed=" << gs.seed << " score=" << gs.score << " wave=" << gs.wave << endl;

    bool match = (gs.score == 0 && gs.wave == 1 && gs.seed == 42);
    cout << "Match: " << (match ? "YES" : "NO") << endl;
    cout << "Pattern: snapshot" << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct GameState { int score; int wave; unsigned int seed; };
struct Snapshot  { int score; int wave; unsigned int seed; };

void saveSnapshot(Snapshot& snap, GameState& gs) {
    snap.score = gs.score;
    snap.wave  = gs.wave;
    snap.seed  = gs.seed;
}

void loadSnapshot(Snapshot& snap, GameState& gs) {
    gs.score = snap.score;
    gs.wave  = snap.wave;
    gs.seed  = snap.seed;
}

int main() {
    GameState gs = {0, 1, 42};
    Snapshot snap = {};

    saveSnapshot(snap, gs);
    cout << "Saved: seed=" << snap.seed << " score=" << snap.score << " wave=" << snap.wave << endl;

    gs.score = 500; gs.wave = 3; gs.seed = 99;
    cout << "Mutated: score=" << gs.score << " wave=" << gs.wave << endl;

    loadSnapshot(snap, gs);
    cout << "Loaded: seed=" << gs.seed << " score=" << gs.score << " wave=" << gs.wave << endl;

    bool match = (gs.score == 0 && gs.wave == 1 && gs.seed == 42);
    cout << "Match: " << (match ? "YES" : "NO") << endl;
    cout << "Pattern: snapshot" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Save line printed", expectedOutput: "Saved: seed=42 score=0 wave=1" },
      { id: "t2", description: "Mutation reported", expectedOutput: "Mutated: score=500 wave=3" },
      { id: "t3", description: "Load restores original state", expectedOutput: "Loaded: seed=42 score=0 wave=1" },
      { id: "t4", description: "Match confirmed", expectedOutput: "Match: YES" },
      { id: "t5", description: "Pattern name printed", expectedOutput: "Pattern: snapshot" },
    ],
    hints: [
      "saveSnapshot copies gs fields to snap. loadSnapshot copies snap fields back to gs.",
      "After loading, check: gs.score == 0 && gs.wave == 1 && gs.seed == 42 for match.",
      "Both functions take their arguments by reference so modifications affect the original.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Save Snapshot v0",
    type: "game_builder",
    instructions: `# Build: Save Snapshot v0

## Mental Model
Press S to save the current game state to a Snapshot. Press L to load it. The HUD shows Saved! or Loaded! for 60 frames. After loading, the state signature should match what it was at save time.

## What's Already Here
Full shooter from L23 with state signature. The Snapshot struct and save/load functions need to be added.

## Your Task

**TODO 1** — Add \`Snapshot\` struct and functions after \`computeStateHash\`:
\`\`\`cpp
struct Snapshot {
    unsigned int rng_seed;
    int score, wave;
    float ship_x;
};
Snapshot save_slot = {};
bool has_save = false;
int save_flash = 0;  // frames to show Saved!/Loaded! message

void saveGame(World& w) {
    save_slot.rng_seed = 42 + (unsigned int)w.wave * 7u;
    save_slot.score = w.score;
    save_slot.wave  = w.wave;
    save_slot.ship_x = w.ship_x;
    has_save = true;
    save_flash = 60;
    cout << "Saved: seed=" << save_slot.rng_seed
         << " score=" << w.score
         << " wave=" << w.wave << endl;
}
void loadGame(World& w) {
    if (!has_save) return;
    rng_state = save_slot.rng_seed;
    w.score = save_slot.score;
    w.wave  = save_slot.wave;
    w.ship_x = save_slot.ship_x;
    for (int i = 0; i < MAX_ENEMIES; i++) w.enemy_active[i] = false;
    for (int i = 0; i < MAX_BULLETS; i++) despawnBullet(w, i);
    spawnWave(w);
    save_flash = -60;
    cout << "Loaded: seed=" << save_slot.rng_seed
         << " score=" << w.score
         << " wave=" << w.wave << endl;
}
\`\`\`

**TODO 2** — In the fixed-step input block, add:
\`\`\`cpp
if (IsKeyPressed(KEY_S)) saveGame(world);
if (IsKeyPressed(KEY_L)) loadGame(world);
\`\`\`
Also decrement \`if (save_flash > 0) save_flash--;\` or \`if (save_flash < 0) save_flash++;\`

**TODO 3** — Add startup cout:
\`\`\`cpp
cout << "Saved: seed=0 score=0 wave=0" << endl;  // placeholder
cout << "Pattern: snapshot" << endl;
\`\`\`
And in the render section, show save/load status.

## Did It Work?
Press S — HUD shows "Saved!" in green. Score changes. Press L — state resets to the save point, "Loaded!" appears in yellow. The state signature matches the pre-save value.`,
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

unsigned int computeStateHash(World& w) {
    unsigned int h = 0;
    for (int i = 0; i < MAX_ENEMIES; i++)
        if (w.enemy_active[i]) h += (unsigned int)(int)w.enemy_y[i];
    h += (unsigned int)(int)w.ship_x;
    h += (unsigned int)w.score;
    return h;
}

// TODO 1: add Snapshot struct, save_slot, has_save, save_flash
// Add saveGame(World& w) and loadGame(World& w) functions
struct Snapshot { unsigned int rng_seed; int score, wave; float ship_x; };
Snapshot save_slot = {};
bool has_save = false;
int save_flash = 0;
void saveGame(World& w) { has_save = true; save_flash = 60; }
void loadGame(World& w) { if (!has_save) return; save_flash = -60; }

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
    // TODO 3a: print startup save info
    cout << "Saved: seed=0 score=0 wave=0" << endl;
    cout << "Pattern: snapshot" << endl;

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
            // TODO 2: press S to saveGame, press L to loadGame, tick save_flash
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
        DrawText(TextFormat("Sig: %u", computeStateHash(world)), 10, 155, 16, LIME);
        DrawText("[S]ave [L]oad", 10, 175, 16, GRAY);
        // TODO 3b: show Saved! or Loaded! based on save_flash
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

struct Snapshot { unsigned int rng_seed; int score, wave; float ship_x; };
Snapshot save_slot = {};
bool has_save = false;
int save_flash = 0;

void saveGame(World& w) {
    save_slot.rng_seed = 42 + (unsigned int)w.wave * 7u;
    save_slot.score = w.score; save_slot.wave = w.wave; save_slot.ship_x = w.ship_x;
    has_save = true; save_flash = 60;
    cout << "Saved: seed=" << save_slot.rng_seed << " score=" << w.score << " wave=" << w.wave << endl;
}
void loadGame(World& w) {
    if (!has_save) return;
    rng_state = save_slot.rng_seed;
    w.score = save_slot.score; w.wave = save_slot.wave; w.ship_x = save_slot.ship_x;
    for (int i = 0; i < MAX_ENEMIES; i++) despawnEnemy(w, i);
    for (int i = 0; i < MAX_BULLETS; i++) despawnBullet(w, i);
    spawnWave(w);
    save_flash = -60;
    cout << "Loaded: seed=" << save_slot.rng_seed << " score=" << w.score << " wave=" << w.wave << endl;
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
    cout << "Saved: seed=0 score=0 wave=0" << endl;
    cout << "Pattern: snapshot" << endl;

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
            if (IsKeyPressed(KEY_S)) saveGame(world);
            if (IsKeyPressed(KEY_L)) loadGame(world);
            if (save_flash > 0) save_flash--;
            else if (save_flash < 0) save_flash++;
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
        DrawText(TextFormat("Sig: %u", computeStateHash(world)), 10, 155, 16, LIME);
        DrawText("[S]ave [L]oad", 10, 175, 16, GRAY);
        if (save_flash > 0)  DrawText("Saved!", 300, 200, 30, GREEN);
        if (save_flash < 0)  DrawText("Loaded!", 280, 200, 30, YELLOW);
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Startup save line", expectedOutput: "Saved: seed=0 score=0 wave=0" },
      { id: "g2", description: "Pattern name printed", expectedOutput: "Pattern: snapshot" },
    ],
    hints: [
      "saveGame captures rng_seed = 42 + wave*7, score, wave, ship_x. loadGame restores them and calls spawnWave.",
      "Add KEY_S and KEY_L checks inside the fixed-step while loop after ship movement.",
      "save_flash > 0 shows Saved! in GREEN, save_flash < 0 shows Loaded! in YELLOW.",
    ],
    estimatedMinutes: 18,
  },
};