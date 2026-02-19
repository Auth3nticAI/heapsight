import type { GameLessonVariant } from "@/types/game";

export const lesson24RPG: GameLessonVariant = {
  lessonId: "rpg-24-diagnostics",

  instructions: `# Diagnostics System — Observe, Don't Mutate

## Mental Model

Diagnostics pattern: observe, don't mutate. The diagnostics function reads everything, changes nothing. That is the foundation of debugging. If your debug code changes the system it is observing, you introduce a new class of bugs: Heisenbugs. The bug disappears when you add the print statement because the print statement changed something. Diagnostics that follow the read-only contract never cause Heisenbugs.

The \`printDiagnostics\` function signature tells you everything: it takes values, not references to mutable state. It cannot change anything. Its return type is void — it produces output, not data. It is a one-way valve: information flows out, nothing flows in.

## What Breaks Without This

Without structured diagnostics, debugging a 3-frame sequence is guesswork. An enemy disappears. Is it frame 1? Frame 2? Did the pool overflow? Did the room transition corrupt the count? You do not know. You add \`cout << alive_c\` somewhere and get a single number. One number. One frame. One guess. With \`DIAG|\` lines after every frame, you have a complete timeline. You see exactly when each count changed. The bug's location is obvious.

## The Fix

\`\`\`cpp
void printDiagnostics(int frame, int alive, int dead,
                      int pool, int poolMax, int room) {
    cout << "DIAG|frame=" << frame
         << "|alive=" << alive
         << "|dead=" << dead
         << "|pool=" << pool << "/" << poolMax
         << "|room=" << room << endl;
}
\`\`\`

Call it unconditionally at the end of every frame. No branching. No filtering. Every frame gets a line. If you need to filter later, filter the output — not the calls. The calls always happen.

## Pattern Insight

This is the structured logging pattern. The key insight is separating the log format (the \`DIAG|\` protocol) from the log consumers (whoever reads the output). Your program writes structured lines. A human reads them. Later, an automated tool parses them. Even later, a dashboard visualizes them. The format never changes. The consumers multiply. Structure at the source enables everything downstream.

## Scalability Insight

Add a timestamp field: \`DIAG|t=16.7ms|frame=1|...\`. Add a session ID: \`DIAG|session=abc123|frame=1|...\`. Add severity: \`DIAG|level=INFO|frame=1|...\`. Each addition is a new key-value pair appended to the existing line. Old parsers skip unknown fields. New parsers use them. This is how production logging systems evolve: backward-compatible extensions to a fixed-format protocol.

## Your Task

Build the 3-frame diagnostic game loop integrated with grid rendering:

**Setup:**
- 4 initial enemy slots: (3,2), (7,2), (12,2), (16,2)
- 2 reserve slots for frame 3 spawns
- Player at (3,5), HP 100
- poolMax = 20

**Frame 1 — Populate Room 0:**
- Spawn enemies 0-3, all alive
- Render 20x10 grid
- \`DIAG|frame=1|alive=4|dead=0|pool=4/20|room=0\`

**Frame 2 — Combat Loss:**
- Enemy 0 dies (alive[0] = false)
- Pool unchanged (slot still allocated, not recycled)
- Render grid (X at enemy 0's position)
- \`DIAG|frame=2|alive=3|dead=1|pool=4/20|room=0\`

**Frame 3 — Room Transition + Reinforcements:**
- room = 1
- Spawn 2 new enemies at (5,3) and (14,3)
- pool = 6, alive = 5 (3 survivors + 2 new), dead = 1
- Render grid with all 6 entities
- \`DIAG|frame=3|alive=5|dead=1|pool=6/20|room=1\`

**Final:** \`GAME_MESSAGE|Systems monitored.\`

## Common Mistake

Recycling the dead slot's pool count in frame 2. In a real free-list EntityManager, the pool count does not decrease when an entity dies — the slot stays allocated until it is reused by a new spawn. Only a spawn changes pool count. Pool tracks allocations, not aliveness. Keeping pool=4 in frame 2 is correct and intentional.

## Elite Insight

id Software's Quake III Arena had a console variable system that acted as a live diagnostics dashboard. Every subsystem wrote to \`cvar\` variables. The developer typed \`cvarlist\` to dump the entire system state. Every \`cvar\` was a read-only observation point for the console. The game ran the same whether the console was open or not. Your \`printDiagnostics\` function is a structured \`cvarlist\` for your game. The principle is identical.

## Pattern Recognition

Read-only observation is fundamental to all monitoring systems. Database read replicas: read without locking the write path. Prometheus metrics: scrape state without modifying it. Profilers: sample the call stack without altering execution. Flight data recorders: capture everything, modify nothing. Your \`printDiagnostics\` function follows this universal contract. The contract is ancient and proven: observers must not interfere.

## Skill Reinforcement

- Pure output function: no mutation, only reads + prints
- Frame-indexed diagnostics: frame number as timeline key
- Pool vs. alive distinction: allocation count != living count
- Structured protocol: parseable \`key=value\` format with \`|\` delimiter

## Mastery Check

Why does the pool not decrease when an enemy dies in frame 2? Because the EntityManager's free list is lazy — it does not zero out or reclaim a slot on death. The slot is marked dead, but the allocation stands. The free list reclaims dead slots when new spawns need them. Until then, pool = allocated slots, alive = living slots, dead = allocated but not living. Three numbers. Two relationships. Full picture.`,

  starterCode: `#include <iostream>
using namespace std;

void printDiagnostics(int frame, int alive, int dead, int pool, int poolMax, int room) {
    cout << "DIAG|frame=" << frame
         << "|alive=" << alive
         << "|dead=" << dead
         << "|pool=" << pool << "/" << poolMax
         << "|room=" << room << endl;
}

void renderGrid(int px, int py, int* ex, int* ey, bool* alive, int count) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#';
            } else if (col == px && row == py) {
                cout << '@';
            } else {
                char cell = '.';
                for (int i = 0; i < count; i++) {
                    if (col == ex[i] && row == ey[i]) {
                        cell = alive[i] ? 'E' : 'X';
                        break;
                    }
                }
                cout << cell;
            }
        }
        cout << endl;
    }
}

int main() {
    int poolMax = 20;
    const int MAX = 6;
    int ex[MAX] = {3, 7, 12, 16, 0, 0};
    int ey[MAX] = {2, 2,  2,  2, 0, 0};
    bool alive[MAX] = {false};
    int count = 0;

    int px = 3, py = 5, room = 0;
    int alive_c = 0, dead_c = 0, pool = 0;

    // TODO: Frame 1 — spawn 4, render, DIAG
    // TODO: Frame 2 — kill enemy 0, render, DIAG
    // TODO: Frame 3 — room=1, spawn 2 at (5,3),(14,3), render, DIAG
    // TODO: GAME_MESSAGE|Systems monitored.

    return 0;
}
`,

  solutionCode: `#include <iostream>
using namespace std;

void printDiagnostics(int frame, int alive, int dead, int pool, int poolMax, int room) {
    cout << "DIAG|frame=" << frame
         << "|alive=" << alive
         << "|dead=" << dead
         << "|pool=" << pool << "/" << poolMax
         << "|room=" << room << endl;
}

void renderGrid(int px, int py, int* ex, int* ey, bool* alive, int count) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#';
            } else if (col == px && row == py) {
                cout << '@';
            } else {
                char cell = '.';
                for (int i = 0; i < count; i++) {
                    if (col == ex[i] && row == ey[i]) {
                        cell = alive[i] ? 'E' : 'X';
                        break;
                    }
                }
                cout << cell;
            }
        }
        cout << endl;
    }
}

int main() {
    int poolMax = 20;
    const int MAX = 6;
    int ex[MAX] = {3, 7, 12, 16, 0, 0};
    int ey[MAX] = {2, 2,  2,  2, 0, 0};
    bool alive[MAX] = {false};
    int count = 0;

    int px = 3, py = 5, room = 0;

    // === Frame 1: Spawn 4 enemies ===
    for (int i = 0; i < 4; i++) alive[i] = true;
    count = 4;
    int pool    = 4;
    int alive_c = 4;
    int dead_c  = 0;
    renderGrid(px, py, ex, ey, alive, count);
    printDiagnostics(1, alive_c, dead_c, pool, poolMax, room);

    // === Frame 2: Kill enemy 0 ===
    alive[0] = false;
    alive_c  = 3;
    dead_c   = 1;
    // pool unchanged — slot still allocated in free-list manager
    renderGrid(px, py, ex, ey, alive, count);
    printDiagnostics(2, alive_c, dead_c, pool, poolMax, room);

    // === Frame 3: Room transition + reinforce ===
    room = 1;
    ex[4] = 5;  ey[4] = 3; alive[4] = true;
    ex[5] = 14; ey[5] = 3; alive[5] = true;
    count   = 6;
    pool    = 6;
    alive_c = 5;
    renderGrid(px, py, ex, ey, alive, count);
    printDiagnostics(3, alive_c, dead_c, pool, poolMax, room);

    cout << "GAME_MESSAGE|Systems monitored." << endl;

    return 0;
}
`,

  tests: [
    {
      id: "g1",
      description: "Grid renders with # wall borders each frame",
      expectedOutput: "####################",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Frame 1 DIAG line: 4 alive, 0 dead, pool 4/20, room 0",
      expectedOutput: "DIAG\\|frame=1\\|alive=4\\|dead=0\\|pool=4/20\\|room=0",
      isPattern: true,
    },
    {
      id: "g3",
      description: "Frame 2 DIAG line: 3 alive, 1 dead, pool 4/20, room 0",
      expectedOutput: "DIAG\\|frame=2\\|alive=3\\|dead=1\\|pool=4/20\\|room=0",
      isPattern: true,
    },
    {
      id: "g4",
      description: "Frame 3 DIAG line: 5 alive, 1 dead, pool 6/20, room 1",
      expectedOutput: "DIAG\\|frame=3\\|alive=5\\|dead=1\\|pool=6/20\\|room=1",
      isPattern: true,
    },
    {
      id: "g5",
      description: "GAME_MESSAGE confirms systems monitored",
      expectedOutput: "GAME_MESSAGE\\|Systems monitored\\.",
      isPattern: true,
    },
  ],

  hints: [
    "Frame 1: set alive[0..3]=true, count=4, pool=4, alive_c=4, dead_c=0. Call renderGrid then printDiagnostics.",
    "Frame 2: alive[0]=false, alive_c=3, dead_c=1. Pool stays 4. renderGrid shows X at (3,2) for the dead enemy.",
    "Frame 3: room=1, set ex[4]=5,ey[4]=3,alive[4]=true and ex[5]=14,ey[5]=3,alive[5]=true. count=6, pool=6, alive_c=5.",
  ],

  accumulatedCode: `#include <iostream>
using namespace std;

// ==============================
// RPG CORE — Lesson 24
// Diagnostics System
// ==============================

// === DIAGNOSTICS — Read-Only Observer ===
// Reads all values as parameters. Mutates nothing.
// Frame number is the timeline key.
// pool=used/max: allocation count, NOT alive count.
void printDiagnostics(int frame, int alive, int dead, int pool, int poolMax, int room) {
    cout << "DIAG|frame=" << frame
         << "|alive=" << alive
         << "|dead=" << dead
         << "|pool=" << pool << "/" << poolMax
         << "|room=" << room << endl;
}

// === GRID RENDER — State-Driven ===
// E = alive enemy, X = dead enemy, @ = player, # = wall, . = floor
void renderGrid(int px, int py, int* ex, int* ey, bool* alive, int count) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#';
            } else if (col == px && row == py) {
                cout << '@';
            } else {
                char cell = '.';
                for (int i = 0; i < count; i++) {
                    if (col == ex[i] && row == ey[i]) {
                        cell = alive[i] ? 'E' : 'X';
                        break;
                    }
                }
                cout << cell;
            }
        }
        cout << endl;
    }
}

int main() {
    int poolMax = 20;
    const int MAX = 6;

    // Entity arrays — flat SoA layout
    int ex[MAX] = {3, 7, 12, 16, 0, 0};
    int ey[MAX] = {2, 2,  2,  2, 0, 0};
    bool alive[MAX] = {false};
    int count = 0;

    int px = 3, py = 5, room = 0;

    // === Frame 1: Spawn 4 enemies ===
    for (int i = 0; i < 4; i++) alive[i] = true;
    count = 4;
    int pool    = 4;
    int alive_c = 4;
    int dead_c  = 0;
    renderGrid(px, py, ex, ey, alive, count);
    printDiagnostics(1, alive_c, dead_c, pool, poolMax, room);

    // === Frame 2: Kill enemy 0 ===
    alive[0] = false;
    alive_c  = 3;
    dead_c   = 1;
    renderGrid(px, py, ex, ey, alive, count);
    printDiagnostics(2, alive_c, dead_c, pool, poolMax, room);

    // === Frame 3: Room transition + reinforce ===
    room = 1;
    ex[4] = 5;  ey[4] = 3; alive[4] = true;
    ex[5] = 14; ey[5] = 3; alive[5] = true;
    count   = 6;
    pool    = 6;
    alive_c = 5;
    renderGrid(px, py, ex, ey, alive, count);
    printDiagnostics(3, alive_c, dead_c, pool, poolMax, room);

    cout << "GAME_MESSAGE|Systems monitored." << endl;

    return 0;
}
`,
};
