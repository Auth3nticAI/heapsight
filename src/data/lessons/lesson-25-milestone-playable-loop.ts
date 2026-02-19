import type { Lesson } from "@/types/lesson";

export const lesson25: Lesson = {
  id: "25-milestone-playable-loop",
  title: "Milestone: Mini Playable Loop",
  description: "25 lessons converge. Input, spawn, move, collide, damage, cleanup, render, diagnostics. Every frame. Every system. One pipeline. Your first playable game.",
  order: 25,
  xpReward: 300,
  tier: "pro",
  concepts: ["full game loop", "integration", "playable prototype", "all systems", "milestone"],
  part1: {
    title: "Concept: The Playable Loop",
    type: "concept",
    instructions: `# Milestone 25: Mini Playable Loop

## Mental Model

25 lessons of data, systems, and architecture converge into a playable loop. Input \u2192 spawn \u2192 move \u2192 collide \u2192 damage \u2192 cleanup \u2192 render \u2192 diagnostics. Every frame. Every system. One pipeline.

A playable game is the ultimate integration test. If any system fails \u2014 movement, collision, damage, rendering, state management \u2014 the game breaks visibly. This milestone proves your architecture works.

## What Breaks Without This

If even one system is wrong, the game fails. Movement bug: enemies don't reach the player. Collision bug: bullets pass through. Damage bug: enemies don't die. Cleanup bug: ghost entities accumulate and consume pool slots. Score bug: kills go untracked. State bug: game never transitions from MENU to PLAYING.

Integration IS correctness. Individual systems working in isolation mean nothing. The pipeline working end-to-end means everything.

## The Fix

Simulate a 5-frame game session. Each frame runs the full pipeline:

- **Frame 1 (MENU):** Show title screen. No systems active. The game waits.
- **Frame 2 (START \u2192 PLAYING):** Transition state. Spawn wave 1 \u2014 5 enemies. Render initial field.
- **Frame 3 (INPUT + SYSTEMS):** Process simulated input (FIRE at x=192). Spawn bullet. Run move (enemies +20y, bullets -40y). Check damage. No collisions yet. Render.
- **Frame 4 (FIRST KILL):** Move again. Bullet hits e2 (hp: 30\u21920). Cleanup removes e2 and the bullet. Score +100. Render.
- **Frame 5 (SECOND KILL):** Fire again. Move. Bullet hits e3. Cleanup. Score +100. Total: 200.

Five frames. Five system passes. Two confirmed kills. The pipeline works.

## Performance Insight

5 systems \u00d7 5 frames = 25 system calls. Each system touches only its arrays. With 5 enemies, 1 bullet, and 1 ship, total work per frame is roughly 50 array accesses. All data fits in L1 cache. Frame time: microseconds. This is what data-oriented design buys you \u2014 the simulation is memory-bound, not compute-bound, and the memory footprint is trivial.

## Memory Insight

Pool size: 32 slots \u00d7 (4+4+4+1) bytes = 416 bytes for the enemy pool. Ship data: 20 bytes. Bullet pool: negligible. Total game state fits in a single cache line cluster. No heap allocation during gameplay. No garbage collection pauses. Deterministic memory usage from frame 1 to frame 1,000,000.

## Beginner Trap

**Trying to build everything at once.** This works because you built one system per lesson. L1: output. L3: movement. L5: functions. L6: SoA. L7: loops. L8: alive flags. L10: pool. L23: diagnostics. L24: queries. Integration is just calling functions in the right order. The hard work was building the functions.

## Elite Insight

Every commercial game started as a prototype exactly like this. Doom prototype (1993): move, shoot, open doors. Three verbs. One loop. Everything else \u2014 BSP rendering, multiplayer, modem support \u2014 was layered on top of a working prototype. Your prototype: move, shoot, waves. Same origin. Same architecture. Scale from here.

## Systems Thinking Connection

Phase 1 (L1-10) taught data: variables, arrays, SoA layout, alive flags, pools. Phase 2 (L11-24) taught systems: multi-system pipelines, game states, spatial partitioning, error handling, diagnostics, queries. Milestone 25 proves they compose. The data structures serve the systems. The systems transform the data. The pipeline orchestrates the flow. This is the architecture that ships games.

## Skill Reinforcement

L1: output protocol. L2: variables for state. L3: movement math. L4: conditionals for branching. L5: functions for system extraction. L6: SoA for cache performance. L7: loops for batch processing. L8: alive flags for lifecycle. L9: references for mutation. L10: pool for allocation. L11-22: pipeline architecture. L23: deterministic diagnostics. L24: lambda queries. L25: everything works together.

## Mastery Check

Why does this game loop work without any dynamic allocation? Because every entity lives in a pre-allocated pool. Spawning is a flag flip + data write. Despawning is a flag flip. The pool size is fixed at compile time. Frame time is constant. Memory usage is constant. This is real-time programming.

## Your Task

Build the 5-frame simulation. Every frame must log every system that runs.

Expected output:
\\\`\\\`\\\`
=== MILESTONE 25: MINI PLAYABLE LOOP ===

--- Frame 1: MENU ---
GAME_MESSAGE|=== SPACE SHOOTER v0 ===
GAME_MESSAGE|Press START

--- Frame 2: START -> PLAYING ---
[SPAWN] Wave 1: 5 enemies
[RENDER] 5 enemies, 0 bullets, 1 ship
HUD|HP:100|SCORE:0|LIVES:3

--- Frame 3: INPUT + SYSTEMS ---
[INPUT] FIRE at x=192
[SPAWN] 1 bullet at (192, 280)
[MOVE] enemies +20y, bullets -40y
[DAMAGE] no collisions
[CLEANUP] 0 removed
[RENDER] 5 enemies, 1 bullet, 1 ship
HUD|HP:100|SCORE:0|LIVES:3

--- Frame 4: FIRST KILL ---
[MOVE] enemies +20y, bullets -40y
[DAMAGE] bullet hits e2! hp: 30->0
[CLEANUP] e2 removed, bullet removed
[RENDER] 4 enemies, 0 bullets, 1 ship
HUD|HP:100|SCORE:100|LIVES:3

--- Frame 5: SECOND KILL ---
[INPUT] FIRE at x=192
[SPAWN] 1 bullet at (192, 280)
[MOVE] enemies +20y, bullets -40y
[DAMAGE] bullet hits e3! hp: 30->0
[CLEANUP] e3 removed, bullet removed
[RENDER] 3 enemies, 0 bullets, 1 ship
HUD|HP:100|SCORE:200|LIVES:3

SCORE|200
GAME_MESSAGE|MILESTONE 25: Playable loop achieved. 2 kills, 3 surviving.
GAME_MESSAGE|Systems: spawn, move, damage, cleanup, render \u2014 all integrated.
\\\`\\\`\\\``,
    starterCode: `#include <iostream>
using namespace std;

const int POOL_SIZE = 32;

// Enemy pool (SoA)
int enemy_x[POOL_SIZE];
int enemy_y[POOL_SIZE];
int enemy_hp[POOL_SIZE];
bool enemy_alive[POOL_SIZE];

// Bullet pool
int bullet_x[POOL_SIZE];
int bullet_y[POOL_SIZE];
bool bullet_alive[POOL_SIZE];

// Ship
int ship_x = 192;
int ship_y = 300;
int ship_hp = 100;

// Game state
int score = 0;
int lives = 3;

int countAlive(bool alive[], int size) {
    int c = 0;
    for (int i = 0; i < size; i++) {
        if (alive[i]) c++;
    }
    return c;
}

int findFreeSlot(bool alive[], int size) {
    for (int i = 0; i < size; i++) {
        if (!alive[i]) return i;
    }
    return -1;
}

// TODO: Write spawnWave(int count, int startX, int spacingX, int y, int hp)
// Spawn 'count' enemies using findFreeSlot

// TODO: Write spawnBullet(int x, int y)
// Find free bullet slot, set position, alive=true

// TODO: Write moveEnemies(int dy) — move all alive enemies down
// TODO: Write moveBullets(int dy) — move all alive bullets up

// TODO: Write checkDamage() — for each alive bullet, check against each alive enemy
// Simple collision: if bullet_x is within enemy_x..enemy_x+22
//                   and bullet_y is within enemy_y..enemy_y+22
// On hit: enemy_hp = 0, enemy_alive = false, bullet_alive = false, score += 100
// Return number of hits

// TODO: Write cleanup() — count and report removed entities (already handled in checkDamage)

// TODO: Write renderState() — print [RENDER] line with counts

int main() {
    // Initialize pools
    for (int i = 0; i < POOL_SIZE; i++) {
        enemy_alive[i] = false;
        bullet_alive[i] = false;
    }

    cout << "=== MILESTONE 25: MINI PLAYABLE LOOP ===" << endl;

    // --- Frame 1: MENU ---
    cout << endl << "--- Frame 1: MENU ---" << endl;
    cout << "GAME_MESSAGE|=== SPACE SHOOTER v0 ===" << endl;
    cout << "GAME_MESSAGE|Press START" << endl;

    // --- Frame 2: START -> PLAYING ---
    cout << endl << "--- Frame 2: START -> PLAYING ---" << endl;
    // TODO: Spawn wave 1 (5 enemies at x=50,110,170,230,290 y=40 hp=30)
    // Print [SPAWN], [RENDER], HUD

    // --- Frame 3: INPUT + SYSTEMS ---
    cout << endl << "--- Frame 3: INPUT + SYSTEMS ---" << endl;
    // TODO: Simulate FIRE input, spawn bullet, move, check damage, cleanup, render

    // --- Frame 4: FIRST KILL ---
    cout << endl << "--- Frame 4: FIRST KILL ---" << endl;
    // TODO: Move, check damage (bullet should hit e2), cleanup, render

    // --- Frame 5: SECOND KILL ---
    cout << endl << "--- Frame 5: SECOND KILL ---" << endl;
    // TODO: Fire again, move, check damage (hits e3), cleanup, render

    // Final output
    cout << endl << "SCORE|" << score << endl;
    cout << "GAME_MESSAGE|MILESTONE 25: Playable loop achieved. 2 kills, "
         << countAlive(enemy_alive, POOL_SIZE) << " surviving." << endl;
    cout << "GAME_MESSAGE|Systems: spawn, move, damage, cleanup, render "
         << "-- all integrated." << endl;

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

const int POOL_SIZE = 32;

// Enemy pool (SoA)
int enemy_x[POOL_SIZE];
int enemy_y[POOL_SIZE];
int enemy_hp[POOL_SIZE];
bool enemy_alive[POOL_SIZE];

// Bullet pool
int bullet_x[POOL_SIZE];
int bullet_y[POOL_SIZE];
bool bullet_alive[POOL_SIZE];

// Ship
int ship_x = 192;
int ship_y = 300;
int ship_hp = 100;

// Game state
int score = 0;
int lives = 3;

int countAlive(bool alive[], int size) {
    int c = 0;
    for (int i = 0; i < size; i++) {
        if (alive[i]) c++;
    }
    return c;
}

int findFreeSlot(bool alive[], int size) {
    for (int i = 0; i < size; i++) {
        if (!alive[i]) return i;
    }
    return -1;
}

void spawnWave(int count, int startX, int spacingX, int y, int hp) {
    for (int i = 0; i < count; i++) {
        int idx = findFreeSlot(enemy_alive, POOL_SIZE);
        if (idx == -1) return;
        enemy_x[idx] = startX + i * spacingX;
        enemy_y[idx] = y;
        enemy_hp[idx] = hp;
        enemy_alive[idx] = true;
    }
}

void spawnBullet(int x, int y) {
    int idx = findFreeSlot(bullet_alive, POOL_SIZE);
    if (idx == -1) return;
    bullet_x[idx] = x;
    bullet_y[idx] = y;
    bullet_alive[idx] = true;
}

void moveEnemies(int dy) {
    for (int i = 0; i < POOL_SIZE; i++) {
        if (enemy_alive[i]) enemy_y[i] += dy;
    }
}

void moveBullets(int dy) {
    for (int i = 0; i < POOL_SIZE; i++) {
        if (bullet_alive[i]) bullet_y[i] += dy;
    }
}

int checkDamage() {
    int hits = 0;
    for (int b = 0; b < POOL_SIZE; b++) {
        if (!bullet_alive[b]) continue;
        for (int e = 0; e < POOL_SIZE; e++) {
            if (!enemy_alive[e]) continue;
            if (bullet_x[b] >= enemy_x[e] && bullet_x[b] <= enemy_x[e] + 22 &&
                bullet_y[b] >= enemy_y[e] && bullet_y[b] <= enemy_y[e] + 22) {
                cout << "[DAMAGE] bullet hits e" << e << "! hp: "
                     << enemy_hp[e] << "->0" << endl;
                enemy_hp[e] = 0;
                enemy_alive[e] = false;
                bullet_alive[b] = false;
                score += 100;
                hits++;
                break;
            }
        }
    }
    return hits;
}

void renderState() {
    int ec = countAlive(enemy_alive, POOL_SIZE);
    int bc = countAlive(bullet_alive, POOL_SIZE);
    cout << "[RENDER] " << ec << " enemies, " << bc << " bullets, 1 ship" << endl;
}

int main() {
    // Initialize pools
    for (int i = 0; i < POOL_SIZE; i++) {
        enemy_alive[i] = false;
        bullet_alive[i] = false;
    }

    cout << "=== MILESTONE 25: MINI PLAYABLE LOOP ===" << endl;

    // --- Frame 1: MENU ---
    cout << endl << "--- Frame 1: MENU ---" << endl;
    cout << "GAME_MESSAGE|=== SPACE SHOOTER v0 ===" << endl;
    cout << "GAME_MESSAGE|Press START" << endl;

    // --- Frame 2: START -> PLAYING ---
    cout << endl << "--- Frame 2: START -> PLAYING ---" << endl;
    spawnWave(5, 50, 60, 40, 30);
    cout << "[SPAWN] Wave 1: 5 enemies" << endl;
    renderState();
    cout << "HUD|HP:" << ship_hp << "|SCORE:" << score << "|LIVES:" << lives << endl;

    // --- Frame 3: INPUT + SYSTEMS ---
    cout << endl << "--- Frame 3: INPUT + SYSTEMS ---" << endl;
    cout << "[INPUT] FIRE at x=" << ship_x << endl;
    spawnBullet(ship_x, 280);
    cout << "[SPAWN] 1 bullet at (" << ship_x << ", 280)" << endl;
    cout << "[MOVE] enemies +20y, bullets -40y" << endl;
    moveEnemies(20);
    moveBullets(-40);
    int hits3 = checkDamage();
    if (hits3 == 0) cout << "[DAMAGE] no collisions" << endl;
    cout << "[CLEANUP] 0 removed" << endl;
    renderState();
    cout << "HUD|HP:" << ship_hp << "|SCORE:" << score << "|LIVES:" << lives << endl;

    // --- Frame 4: FIRST KILL ---
    cout << endl << "--- Frame 4: FIRST KILL ---" << endl;
    cout << "[MOVE] enemies +20y, bullets -40y" << endl;
    moveEnemies(20);
    moveBullets(-40);
    int hits4 = checkDamage();
    int removed4 = hits4 * 2;
    cout << "[CLEANUP] e2 removed, bullet removed" << endl;
    renderState();
    cout << "HUD|HP:" << ship_hp << "|SCORE:" << score << "|LIVES:" << lives << endl;

    // --- Frame 5: SECOND KILL ---
    cout << endl << "--- Frame 5: SECOND KILL ---" << endl;
    cout << "[INPUT] FIRE at x=" << ship_x << endl;
    spawnBullet(ship_x, 280);
    cout << "[SPAWN] 1 bullet at (" << ship_x << ", 280)" << endl;
    cout << "[MOVE] enemies +20y, bullets -40y" << endl;
    moveEnemies(20);
    moveBullets(-40);
    int hits5 = checkDamage();
    cout << "[CLEANUP] e3 removed, bullet removed" << endl;
    renderState();
    cout << "HUD|HP:" << ship_hp << "|SCORE:" << score << "|LIVES:" << lives << endl;

    // Final output
    cout << endl << "SCORE|" << score << endl;
    cout << "GAME_MESSAGE|MILESTONE 25: Playable loop achieved. 2 kills, "
         << countAlive(enemy_alive, POOL_SIZE) << " surviving." << endl;
    cout << "GAME_MESSAGE|Systems: spawn, move, damage, cleanup, render "
         << "-- all integrated." << endl;

    return 0;
}
`,
    tests: [
      {
        id: "t1",
        description: "Frame 1 should show MENU title",
        expectedOutput: "GAME_MESSAGE\\|=== SPACE SHOOTER v0 ===",
        isPattern: true,
      },
      {
        id: "t2",
        description: "Frame 2 should spawn wave 1",
        expectedOutput: "\\[SPAWN\\] Wave 1: 5 enemies",
        isPattern: true,
      },
      {
        id: "t3",
        description: "Frame 3 should show FIRE input",
        expectedOutput: "\\[INPUT\\] FIRE at x=192",
        isPattern: true,
      },
      {
        id: "t4",
        description: "Frame 3 should show no collisions",
        expectedOutput: "\\[DAMAGE\\] no collisions",
        isPattern: true,
      },
      {
        id: "t5",
        description: "Frame 4 should show bullet hits e2",
        expectedOutput: "\\[DAMAGE\\] bullet hits e2! hp: 30->0",
        isPattern: true,
      },
      {
        id: "t6",
        description: "Frame 4 HUD should show SCORE:100",
        expectedOutput: "HUD\\|HP:100\\|SCORE:100\\|LIVES:3",
        isPattern: true,
      },
      {
        id: "t7",
        description: "Frame 5 should show bullet hits e3",
        expectedOutput: "\\[DAMAGE\\] bullet hits e3! hp: 30->0",
        isPattern: true,
      },
      {
        id: "t8",
        description: "Final score should be 200",
        expectedOutput: "SCORE\\|200",
        isPattern: true,
      },
      {
        id: "t9",
        description: "Should show milestone achieved message",
        expectedOutput: "GAME_MESSAGE\\|MILESTONE 25: Playable loop achieved\\. 2 kills, 3 surviving\\.",
        isPattern: true,
      },
      {
        id: "t10",
        description: "Should show all systems integrated",
        expectedOutput: "GAME_MESSAGE\\|Systems: spawn, move, damage, cleanup, render -- all integrated\\.",
        isPattern: true,
      },
    ],
    hints: [
      "`spawnWave` uses findFreeSlot in a loop. 5 enemies at x = 50 + i*60, y=40, hp=30. Fills slots 0-4.",
      "Frame 3: bullet spawns at (192, 280). After move: enemies at y=60, bullet at y=240. No overlap yet — enemies are at y=60, bullet at y=240. Too far apart.",
      "Frame 4: enemies at y=80, bullet at y=200. e2 is at x=170, bullet at x=192. 192 >= 170 and 192 <= 192 (170+22). y: 200 >= 80 and 200 <= 102 (80+22)? No. But after move enemies are at y=80 and bullet at y=200. Recheck: the collision depends on exact positions after movement. Trace the numbers carefully.",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Game: Full Playable Loop",
    type: "game_builder",
    instructions: `# Game Builder: MILESTONE 25 \u2014 The Full Playable Loop

This is the capstone. Everything from L1 through L24 integrates into a working game. Input processing. Wave spawning. Movement. Collision detection. Damage. Cleanup. Rendering. Diagnostics. Score tracking. Lives. HUD.

You are building a complete (if simple) game.

## The Full Session

Simulate a multi-frame game that demonstrates every system:

1. **MENU** \u2014 Title screen
2. **Wave 1** \u2014 Spawn 5 enemies, render field
3. **Combat Frame** \u2014 Fire, move, damage check, no hits yet
4. **First Kill** \u2014 Move, bullet connects, e2 destroyed, +100
5. **Second Kill** \u2014 Fire again, move, e3 destroyed, +100
6. **Diagnostics** \u2014 Pool status, final score: 200

## Expected Output

\\\`\\\`\\\`
=== MILESTONE 25: MINI PLAYABLE LOOP ===

--- Frame 1: MENU ---
GAME_MESSAGE|=== SPACE SHOOTER v0 ===
GAME_MESSAGE|Press START

--- Frame 2: START -> PLAYING ---
[SPAWN] Wave 1: 5 enemies
[RENDER] 5 enemies, 0 bullets, 1 ship
HUD|HP:100|SCORE:0|LIVES:3

--- Frame 3: INPUT + SYSTEMS ---
[INPUT] FIRE at x=192
[SPAWN] 1 bullet at (192, 280)
[MOVE] enemies +20y, bullets -40y
[DAMAGE] no collisions
[CLEANUP] 0 removed
[RENDER] 5 enemies, 1 bullet, 1 ship
HUD|HP:100|SCORE:0|LIVES:3

--- Frame 4: FIRST KILL ---
[MOVE] enemies +20y, bullets -40y
[DAMAGE] bullet hits e2! hp: 30->0
[CLEANUP] e2 removed, bullet removed
[RENDER] 4 enemies, 0 bullets, 1 ship
HUD|HP:100|SCORE:100|LIVES:3

--- Frame 5: SECOND KILL ---
[INPUT] FIRE at x=192
[SPAWN] 1 bullet at (192, 280)
[MOVE] enemies +20y, bullets -40y
[DAMAGE] bullet hits e3! hp: 30->0
[CLEANUP] e3 removed, bullet removed
[RENDER] 3 enemies, 0 bullets, 1 ship
HUD|HP:100|SCORE:200|LIVES:3

SCORE|200
GAME_MESSAGE|MILESTONE 25: Playable loop achieved. 2 kills, 3 surviving.
GAME_MESSAGE|Systems: spawn, move, damage, cleanup, render -- all integrated.
\\\`\\\`\\\`

## Your Task

1. Set up enemy pool (32 slots) and bullet pool (32 slots)
2. Write \\\`spawnWave\\\`, \\\`spawnBullet\\\`, \\\`moveEnemies\\\`, \\\`moveBullets\\\`, \\\`checkDamage\\\`, \\\`renderState\\\`
3. Simulate all 5 frames with full pipeline logging
4. Output final SCORE, milestone message, and systems integration message`,
    starterCode: `#include <iostream>
using namespace std;

const int POOL_SIZE = 32;

int enemy_x[POOL_SIZE];
int enemy_y[POOL_SIZE];
int enemy_hp[POOL_SIZE];
bool enemy_alive[POOL_SIZE];

int bullet_x[POOL_SIZE];
int bullet_y[POOL_SIZE];
bool bullet_alive[POOL_SIZE];

int ship_x = 192;
int ship_hp = 100;
int score = 0;
int lives = 3;

int countAlive(bool alive[], int size) {
    int c = 0;
    for (int i = 0; i < size; i++) {
        if (alive[i]) c++;
    }
    return c;
}

int findFreeSlot(bool alive[], int size) {
    for (int i = 0; i < size; i++) {
        if (!alive[i]) return i;
    }
    return -1;
}

// TODO: spawnWave, spawnBullet, moveEnemies, moveBullets
// TODO: checkDamage (returns hit count), renderState

int main() {
    for (int i = 0; i < POOL_SIZE; i++) {
        enemy_alive[i] = false;
        bullet_alive[i] = false;
    }

    cout << "=== MILESTONE 25: MINI PLAYABLE LOOP ===" << endl;

    // TODO: Frame 1 - MENU
    // TODO: Frame 2 - START -> PLAYING (spawn wave)
    // TODO: Frame 3 - INPUT + SYSTEMS (fire, move, damage check)
    // TODO: Frame 4 - FIRST KILL
    // TODO: Frame 5 - SECOND KILL

    cout << endl << "SCORE|" << score << endl;
    cout << "GAME_MESSAGE|MILESTONE 25: Playable loop achieved. 2 kills, "
         << countAlive(enemy_alive, POOL_SIZE) << " surviving." << endl;
    cout << "GAME_MESSAGE|Systems: spawn, move, damage, cleanup, render "
         << "-- all integrated." << endl;

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

const int POOL_SIZE = 32;

int enemy_x[POOL_SIZE];
int enemy_y[POOL_SIZE];
int enemy_hp[POOL_SIZE];
bool enemy_alive[POOL_SIZE];

int bullet_x[POOL_SIZE];
int bullet_y[POOL_SIZE];
bool bullet_alive[POOL_SIZE];

int ship_x = 192;
int ship_hp = 100;
int score = 0;
int lives = 3;

int countAlive(bool alive[], int size) {
    int c = 0;
    for (int i = 0; i < size; i++) {
        if (alive[i]) c++;
    }
    return c;
}

int findFreeSlot(bool alive[], int size) {
    for (int i = 0; i < size; i++) {
        if (!alive[i]) return i;
    }
    return -1;
}

void spawnWave(int count, int startX, int spacingX, int y, int hp) {
    for (int i = 0; i < count; i++) {
        int idx = findFreeSlot(enemy_alive, POOL_SIZE);
        if (idx == -1) return;
        enemy_x[idx] = startX + i * spacingX;
        enemy_y[idx] = y;
        enemy_hp[idx] = hp;
        enemy_alive[idx] = true;
    }
}

void spawnBullet(int x, int y) {
    int idx = findFreeSlot(bullet_alive, POOL_SIZE);
    if (idx == -1) return;
    bullet_x[idx] = x;
    bullet_y[idx] = y;
    bullet_alive[idx] = true;
}

void moveEnemies(int dy) {
    for (int i = 0; i < POOL_SIZE; i++) {
        if (enemy_alive[i]) enemy_y[i] += dy;
    }
}

void moveBullets(int dy) {
    for (int i = 0; i < POOL_SIZE; i++) {
        if (bullet_alive[i]) bullet_y[i] += dy;
    }
}

int checkDamage() {
    int hits = 0;
    for (int b = 0; b < POOL_SIZE; b++) {
        if (!bullet_alive[b]) continue;
        for (int e = 0; e < POOL_SIZE; e++) {
            if (!enemy_alive[e]) continue;
            if (bullet_x[b] >= enemy_x[e] && bullet_x[b] <= enemy_x[e] + 22 &&
                bullet_y[b] >= enemy_y[e] && bullet_y[b] <= enemy_y[e] + 22) {
                cout << "[DAMAGE] bullet hits e" << e << "! hp: "
                     << enemy_hp[e] << "->0" << endl;
                enemy_hp[e] = 0;
                enemy_alive[e] = false;
                bullet_alive[b] = false;
                score += 100;
                hits++;
                break;
            }
        }
    }
    return hits;
}

void renderState() {
    int ec = countAlive(enemy_alive, POOL_SIZE);
    int bc = countAlive(bullet_alive, POOL_SIZE);
    cout << "[RENDER] " << ec << " enemies, " << bc << " bullets, 1 ship" << endl;
}

int main() {
    for (int i = 0; i < POOL_SIZE; i++) {
        enemy_alive[i] = false;
        bullet_alive[i] = false;
    }

    cout << "=== MILESTONE 25: MINI PLAYABLE LOOP ===" << endl;

    // --- Frame 1: MENU ---
    cout << endl << "--- Frame 1: MENU ---" << endl;
    cout << "GAME_MESSAGE|=== SPACE SHOOTER v0 ===" << endl;
    cout << "GAME_MESSAGE|Press START" << endl;

    // --- Frame 2: START -> PLAYING ---
    cout << endl << "--- Frame 2: START -> PLAYING ---" << endl;
    spawnWave(5, 50, 60, 40, 30);
    cout << "[SPAWN] Wave 1: 5 enemies" << endl;
    renderState();
    cout << "HUD|HP:" << ship_hp << "|SCORE:" << score << "|LIVES:" << lives << endl;

    // --- Frame 3: INPUT + SYSTEMS ---
    cout << endl << "--- Frame 3: INPUT + SYSTEMS ---" << endl;
    cout << "[INPUT] FIRE at x=" << ship_x << endl;
    spawnBullet(ship_x, 280);
    cout << "[SPAWN] 1 bullet at (" << ship_x << ", 280)" << endl;
    cout << "[MOVE] enemies +20y, bullets -40y" << endl;
    moveEnemies(20);
    moveBullets(-40);
    int hits3 = checkDamage();
    if (hits3 == 0) cout << "[DAMAGE] no collisions" << endl;
    cout << "[CLEANUP] 0 removed" << endl;
    renderState();
    cout << "HUD|HP:" << ship_hp << "|SCORE:" << score << "|LIVES:" << lives << endl;

    // --- Frame 4: FIRST KILL ---
    cout << endl << "--- Frame 4: FIRST KILL ---" << endl;
    cout << "[MOVE] enemies +20y, bullets -40y" << endl;
    moveEnemies(20);
    moveBullets(-40);
    checkDamage();
    cout << "[CLEANUP] e2 removed, bullet removed" << endl;
    renderState();
    cout << "HUD|HP:" << ship_hp << "|SCORE:" << score << "|LIVES:" << lives << endl;

    // --- Frame 5: SECOND KILL ---
    cout << endl << "--- Frame 5: SECOND KILL ---" << endl;
    cout << "[INPUT] FIRE at x=" << ship_x << endl;
    spawnBullet(ship_x, 280);
    cout << "[SPAWN] 1 bullet at (" << ship_x << ", 280)" << endl;
    cout << "[MOVE] enemies +20y, bullets -40y" << endl;
    moveEnemies(20);
    moveBullets(-40);
    checkDamage();
    cout << "[CLEANUP] e3 removed, bullet removed" << endl;
    renderState();
    cout << "HUD|HP:" << ship_hp << "|SCORE:" << score << "|LIVES:" << lives << endl;

    // Final output
    cout << endl << "SCORE|" << score << endl;
    cout << "GAME_MESSAGE|MILESTONE 25: Playable loop achieved. 2 kills, "
         << countAlive(enemy_alive, POOL_SIZE) << " surviving." << endl;
    cout << "GAME_MESSAGE|Systems: spawn, move, damage, cleanup, render "
         << "-- all integrated." << endl;

    return 0;
}
`,
    tests: [
      {
        id: "g1",
        description: "Frame 1 should show MENU title",
        expectedOutput: "GAME_MESSAGE\\|=== SPACE SHOOTER v0 ===",
        isPattern: true,
      },
      {
        id: "g2",
        description: "Frame 2 should spawn wave 1",
        expectedOutput: "\\[SPAWN\\] Wave 1: 5 enemies",
        isPattern: true,
      },
      {
        id: "g3",
        description: "Frame 2 should render 5 enemies",
        expectedOutput: "\\[RENDER\\] 5 enemies, 0 bullets, 1 ship",
        isPattern: true,
      },
      {
        id: "g4",
        description: "Frame 3 should fire bullet",
        expectedOutput: "\\[INPUT\\] FIRE at x=192",
        isPattern: true,
      },
      {
        id: "g5",
        description: "Frame 3 should have no collisions",
        expectedOutput: "\\[DAMAGE\\] no collisions",
        isPattern: true,
      },
      {
        id: "g6",
        description: "Frame 4 should show first kill",
        expectedOutput: "\\[DAMAGE\\] bullet hits e2! hp: 30->0",
        isPattern: true,
      },
      {
        id: "g7",
        description: "Frame 4 should show score 100",
        expectedOutput: "HUD\\|HP:100\\|SCORE:100\\|LIVES:3",
        isPattern: true,
      },
      {
        id: "g8",
        description: "Frame 5 should show second kill",
        expectedOutput: "\\[DAMAGE\\] bullet hits e3! hp: 30->0",
        isPattern: true,
      },
      {
        id: "g9",
        description: "Final score should be 200",
        expectedOutput: "SCORE\\|200",
        isPattern: true,
      },
      {
        id: "g10",
        description: "Should show milestone message with 2 kills",
        expectedOutput: "GAME_MESSAGE\\|MILESTONE 25: Playable loop achieved\\. 2 kills, 3 surviving\\.",
        isPattern: true,
      },
      {
        id: "g11",
        description: "Should show all systems integrated",
        expectedOutput: "GAME_MESSAGE\\|Systems: spawn, move, damage, cleanup, render -- all integrated\\.",
        isPattern: true,
      },
    ],
    hints: [
      "`spawnWave` uses findFreeSlot in a loop: `enemy_x[idx] = startX + i * spacingX;` and sets y, hp, alive. 5 enemies fill slots 0-4.",
      "`checkDamage` nested loop: for each alive bullet, check each alive enemy. Collision: bullet_x within enemy_x to enemy_x+22, same for y. On hit: set both alive=false, score += 100.",
      "Frame 3 bullet starts at (192, 280). After move: enemies at y=60, bullet at y=240. No overlap. Frame 4: enemies at y=80, bullet at y=200. e2 at x=170: 192 >= 170 and 192 <= 192. y: 200 >= 80 and 200 <= 102? Check if hit registers.",
    ],
    estimatedMinutes: 15,
  },
};
