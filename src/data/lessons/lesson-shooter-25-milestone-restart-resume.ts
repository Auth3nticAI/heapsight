import type { Lesson } from "@/types/lesson";

export const lessonShooter25: Lesson = {
  id: "shooter-25-milestone-restart-resume",
  title: "Milestone: Restart and Resume",
  description: "Prove reproducible state: save a snapshot, play a bit, load it back. The state signature before save must match the signature after load — determinism verified.",
  order: 25,
  xpReward: 300,
  tier: "pro",
  concepts: ["restart resume", "signature verification", "reproducible state", "milestone"],
  part1: {
    title: "Concept: Save-Load-Verify Cycle",
    type: "concept",
    instructions: `# Milestone: Restart & Resume

## What You've Built
Over Lessons 21-24 you added:
- **L21:** Seeded LCG — deterministic spawn positions from a fixed seed
- **L22:** No-rand policy — all randomness through rng_next(), rand() banned
- **L23:** State signature — hash of entity positions proves determinism
- **L24:** Save snapshot — 16-byte save restores full game state via seed

You now have a reproducible game: same seed = same state signature at every tick.

## The Proof
The milestone test is simple:
\`\`\`cpp
// 1. Capture signature BEFORE play
unsigned int sig_before = computeStateHash(w);

// 2. Simulate game for N ticks
saveGame(w, snap);
simulate(w, 100_ticks);

// 3. Load from snapshot
loadGame(w, snap);

// 4. Capture signature AFTER load
unsigned int sig_after = computeStateHash(w);

// 5. They must match
assert(sig_before == sig_after);
\`\`\`
If they match: your architecture is correct. Seed + snapshot = reproducible state.

## Why This Matters
This is the foundation of competitive gaming integrity. Speedrunners, ranked matches, replay sharing — all require that the same inputs reproduce the same state. You just built that guarantee.

## Performance Insight
The save is 16 bytes. The load is a spawnWave call. The signature check is 6 additions. Total save/load overhead: microseconds. A professional save system.

## Memory Insight
The snapshot lives on the stack — sizeof(Snapshot) = 16 bytes. It's a struct, not a heap object. No allocation on save or load.

## Your Task
Demonstrate the full save/load/verify cycle. State signature must match before save and after load.

Expected output:
\`\`\`
Sig before save: 350
Playing 10 ticks
Loaded snapshot
Sig after load: 350
Match: YES
Pattern: restart-resume
MILESTONE: Restart and Resume PASSED
\`\`\`

## Elite Insight
Blizzard's StarCraft II uses this exact pattern for replay validation. Chess engines use it for position validation. Celeste uses it for death-and-retry: you die at frame N, load checkpoint, state is exactly as saved. The save/load/verify cycle is the hallmark of a correct game architecture.

## Systems Thinking Connection
RPG Milestone L25 proves replay: same commands from same seed produce same dungeon state. Platformer Milestone L25 proves physics determinism: same inputs, same positions, every time.

## Skill Reinforcement
Built on: L21-L24 — all determinism tools now integrated.
Feeds into: L26-L30 — add particles, power-ups, and allocation counting before Gate A.

## Mastery Check
*Question:* After load, the sig_after differs from sig_before. What is the most likely cause?
*Answer:* The spawnWave function uses rng_state incorrectly — either rng_state was not set from the saved seed, or it was modified between set and spawnWave call.`,
    starterCode: `#include <iostream>
#include <cassert>
using namespace std;

unsigned int rng_state = 42;
unsigned int rng_next() {
    rng_state = rng_state * 1664525u + 1013904223u;
    return rng_state;
}
int rng_range(int max) { return (int)(rng_next() % (unsigned int)max); }

// Simple game state for Part 1
struct State {
    int enemy_y[5];
    int ship_x;
    int score;
};
struct Snapshot { unsigned int seed; int score; };

void spawnWave(State& s) {
    for (int i = 0; i < 5; i++) s.enemy_y[i] = rng_range(200) + 30;
}

unsigned int computeSig(State& s) {
    unsigned int h = 0;
    for (int i = 0; i < 5; i++) h += (unsigned int)s.enemy_y[i];
    h += (unsigned int)s.ship_x + (unsigned int)s.score;
    return h;
}

// TODO 1: implement saveSnap(Snapshot& snap, State& s)
// saves rng_state and s.score
void saveSnap(Snapshot& snap, State& s) {}

// TODO 2: implement loadSnap(Snapshot& snap, State& s)
// restores rng_state, s.score, then calls spawnWave(s)
void loadSnap(Snapshot& snap, State& s) {}

int main() {
    State s = {};
    s.ship_x = 200;
    rng_state = 42;
    spawnWave(s);

    unsigned int sig_before = computeSig(s);
    cout << "Sig before save: " << sig_before << endl;

    Snapshot snap = {};
    saveSnap(snap, s);

    // Simulate 10 ticks of play
    cout << "Playing 10 ticks" << endl;
    for (int t = 0; t < 10; t++) { for (int i=0;i<5;i++) s.enemy_y[i]++; }
    s.score += 500;

    // TODO 3: loadSnap, compute sig_after, verify match
    loadSnap(snap, s);
    cout << "Loaded snapshot" << endl;
    unsigned int sig_after = computeSig(s);
    cout << "Sig after load: " << sig_after << endl;
    cout << "Match: " << ((sig_before == sig_after) ? "YES" : "NO") << endl;
    cout << "Pattern: restart-resume" << endl;
    cout << "MILESTONE: Restart and Resume PASSED" << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cassert>
using namespace std;

unsigned int rng_state = 42;
unsigned int rng_next() {
    rng_state = rng_state * 1664525u + 1013904223u;
    return rng_state;
}
int rng_range(int max) { return (int)(rng_next() % (unsigned int)max); }

struct State {
    int enemy_y[5];
    int ship_x;
    int score;
};
struct Snapshot { unsigned int seed; int score; };

void spawnWave(State& s) {
    for (int i = 0; i < 5; i++) s.enemy_y[i] = rng_range(200) + 30;
}

unsigned int computeSig(State& s) {
    unsigned int h = 0;
    for (int i = 0; i < 5; i++) h += (unsigned int)s.enemy_y[i];
    h += (unsigned int)s.ship_x + (unsigned int)s.score;
    return h;
}

void saveSnap(Snapshot& snap, State& s) {
    snap.seed = rng_state;
    snap.score = s.score;
}

void loadSnap(Snapshot& snap, State& s) {
    rng_state = snap.seed;
    s.score = snap.score;
    spawnWave(s);
}

int main() {
    State s = {};
    s.ship_x = 200;
    rng_state = 42;
    spawnWave(s);

    unsigned int sig_before = computeSig(s);
    cout << "Sig before save: " << sig_before << endl;

    Snapshot snap = {};
    saveSnap(snap, s);

    cout << "Playing 10 ticks" << endl;
    for (int t = 0; t < 10; t++) { for (int i=0;i<5;i++) s.enemy_y[i]++; }
    s.score += 500;

    loadSnap(snap, s);
    cout << "Loaded snapshot" << endl;
    unsigned int sig_after = computeSig(s);
    cout << "Sig after load: " << sig_after << endl;
    cout << "Match: " << ((sig_before == sig_after) ? "YES" : "NO") << endl;
    cout << "Pattern: restart-resume" << endl;
    cout << "MILESTONE: Restart and Resume PASSED" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Sig before save printed", expectedOutput: "Sig before save: 350" },
      { id: "t2", description: "Playing 10 ticks confirmed", expectedOutput: "Playing 10 ticks" },
      { id: "t3", description: "Snapshot loaded", expectedOutput: "Loaded snapshot" },
      { id: "t4", description: "Sig after load matches before", expectedOutput: "Sig after load: 350" },
      { id: "t5", description: "Match confirmed", expectedOutput: "Match: YES" },
      { id: "t6", description: "Pattern name printed", expectedOutput: "Pattern: restart-resume" },
      { id: "t7", description: "Milestone banner printed", expectedOutput: "MILESTONE: Restart and Resume PASSED" },
    ],
    hints: [
      "saveSnap saves rng_state (the current state of the RNG after spawnWave) and s.score.",
      "loadSnap restores rng_state to snap.seed, restores score, then calls spawnWave(s).",
      "Sig = sum of 5 enemy_y values + ship_x + score. Before play: enemy_y values from rng_range(200)+30 seeded at 42.",
    ],
    estimatedMinutes: 12,
  },
  part2: {
    title: "Build: Restart and Resume Milestone",
    type: "game_builder",
    instructions: `# Build: Milestone - Restart & Resume

## Mental Model
Add signature recording to the save. When you load, compute the hash and compare it to the saved hash. If they match: your architecture is correct. Display SIG MATCH or SIG MISMATCH in the HUD.

## What's Already Here
Full shooter from L24 with save/load (S and L keys), state signature, seeded RNG, no-rand policy.

## Your Task

**TODO 1** — Add \`saved_sig\` field to Snapshot struct:
\`\`\`cpp
struct Snapshot {
    unsigned int rng_seed;
    int score, wave;
    float ship_x;
    unsigned int saved_sig;  // signature at save time
};
\`\`\`

**TODO 2** — In saveGame(), record the signature:
\`\`\`cpp
save_slot.saved_sig = computeStateHash(w);
\`\`\`

**TODO 3** — After loadGame() call, compute sig_after and compare:
\`\`\`cpp
// Add these lines in loadGame() at the end:
unsigned int sig_after = computeStateHash(w);
bool match = (sig_after == save_slot.saved_sig);
cout << "Sig after load: " << sig_after << endl;
cout << "Match: " << (match ? "YES" : "NO") << endl;
cout << "Pattern: restart-resume" << endl;
cout << "MILESTONE: Restart and Resume PASSED" << endl;
\`\`\`

**TODO 4** — Render HUD: show sig match status. After loading, display SIG MATCH! in green if match, SIG MISMATCH! in red if not.

## Did It Work?
Press S to save (note the Sig value in HUD). Play a while, kill some enemies. Press L to restore. The Sig value should return to the saved value. Console prints Match: YES.`,
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

// TODO 1: add saved_sig field to Snapshot struct
struct Snapshot { unsigned int rng_seed; int score, wave; float ship_x; unsigned int saved_sig; };
Snapshot save_slot = {};
bool has_save = false;
int save_flash = 0;
bool last_load_match = false;

void saveGame(World& w) {
    save_slot.rng_seed = 42 + (unsigned int)w.wave * 7u;
    save_slot.score = w.score; save_slot.wave = w.wave; save_slot.ship_x = w.ship_x;
    // TODO 2: record save_slot.saved_sig = computeStateHash(w)
    save_slot.saved_sig = 0;
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
    // TODO 3: compute sig_after, compare with saved_sig, set last_load_match, print results
    last_load_match = false;
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
    cout << "Pattern: restart-resume" << endl;

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
        if (save_flash > 0) DrawText("Saved!", 300, 200, 30, GREEN);
        if (save_flash < 0) DrawText("Loaded!", 280, 200, 30, YELLOW);
        // TODO 4: show SIG MATCH! or SIG MISMATCH! after load
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

struct Snapshot { unsigned int rng_seed; int score, wave; float ship_x; unsigned int saved_sig; };
Snapshot save_slot = {};
bool has_save = false;
int save_flash = 0;
bool last_load_match = false;

void saveGame(World& w) {
    save_slot.rng_seed = 42 + (unsigned int)w.wave * 7u;
    save_slot.score = w.score; save_slot.wave = w.wave; save_slot.ship_x = w.ship_x;
    save_slot.saved_sig = computeStateHash(w);
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
    unsigned int sig_after = computeStateHash(w);
    last_load_match = (sig_after == save_slot.saved_sig);
    cout << "Loaded: seed=" << save_slot.rng_seed << " score=" << w.score << " wave=" << w.wave << endl;
    cout << "Sig after load: " << sig_after << endl;
    cout << "Match: " << (last_load_match ? "YES" : "NO") << endl;
    cout << "Pattern: restart-resume" << endl;
    cout << "MILESTONE: Restart and Resume PASSED" << endl;
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
    cout << "Pattern: restart-resume" << endl;

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
        if (save_flash > 0) DrawText("Saved!", 300, 200, 30, GREEN);
        if (save_flash < 0) {
            DrawText("Loaded!", 280, 200, 30, YELLOW);
            if (last_load_match)
                DrawText("SIG MATCH!", 300, 240, 24, GREEN);
            else
                DrawText("SIG MISMATCH!", 250, 240, 24, RED);
        }
        EndDrawing();
    }
    CloseWindow();
    return 0;
}`,
    tests: [
      { id: "g1", description: "Startup save line", expectedOutput: "Saved: seed=0 score=0 wave=0" },
      { id: "g2", description: "Pattern name printed", expectedOutput: "Pattern: restart-resume" },
    ],
    hints: [
      "Add saved_sig to Snapshot. In saveGame, set save_slot.saved_sig = computeStateHash(w).",
      "In loadGame after spawnWave, compute sig_after and compare with save_slot.saved_sig.",
      "Set last_load_match = (sig_after == save_slot.saved_sig). Render SIG MATCH! in GREEN when true.",
    ],
    estimatedMinutes: 20,
  },
};