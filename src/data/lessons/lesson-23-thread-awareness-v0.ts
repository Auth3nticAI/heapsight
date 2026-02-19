import type { Lesson } from "@/types/lesson";

export const lesson23: Lesson = {
  id: "23-thread-awareness-v0",
  title: "Thread Awareness v0",
  description: "Game logic is single-threaded. Background diagnostics are read-only observers. Determinism first.",
  order: 23,
  xpReward: 125,
  tier: "pro",
  concepts: ["concurrency awareness", "determinism", "background diagnostics", "main thread safety"],
  part1: {
    title: "Concept: Thread Awareness",
    type: "concept",
    instructions: `# Thread Awareness v0

## Mental Model

Game logic must be deterministic. Background tasks — diagnostics, logging, telemetry — run separately and never modify game state. The main thread owns the data. Everyone else is a read-only observer.

Two systems reading and writing the same array = race condition. If moveSystem runs on thread A while damageSystem runs on thread B, entity state is undefined. Position updated halfway through a damage check. Collision missed. Player walks through a wall. Unreproducible.

Fix: game logic is single-threaded. Background tasks are read-only observers. They read entity counts, pool stats, frame timing. They never write.

## What Breaks Without This

Thread A moves enemy to x=100. Thread B checks collision at x=50 (stale value). Collision missed. Player walks through enemy. Race condition = nondeterminism = unreproducible bugs. The worst kind of bugs. You cannot replay the frame. You cannot debug. You can only stare at logs and guess.

In a single-threaded pipeline, every system sees the result of the previous system. moveSystem runs. damageSystem sees the moved positions. cleanupSystem sees the damaged entities. Deterministic. Reproducible. Debuggable.

## The Fix

All game systems run sequentially on the main thread. After each frame, a \\\`printDiagnostics\\\` function reads entity counts and pool stats. Output is interleaved with game output, but data is safe because diagnostics only reads. It never writes.

The pattern:
\\\`\\\`\\\`cpp
void printDiagnostics(bool alive[], int pool_size) {
    int count = 0;
    int freeSlots = 0;
    for (int i = 0; i < pool_size; i++) {
        if (alive[i]) count++;
        else freeSlots++;
    }
    cout << "[DIAG] entities=" << count
         << " pool=" << count << "/" << pool_size
         << " freeList=" << freeSlots << endl;
}
\\\`\\\`\\\`

This function touches zero mutable state. It reads \\\`alive[]\\\` and counts. Pure observation. Safe to call from any context — main thread, background thread, debug overlay.

## Performance Insight

Real threading: parallel computation for rendering, physics broad phase, audio mixing. But game state updates are serial. This is how every shipping engine works. Doom: single-threaded game logic, threaded renderer. Unity: Jobs system reads components, main thread commits writes. Unreal: game thread owns state, render thread gets a snapshot.

Threading does not make game logic faster. It makes it wrong. Thread only proven-safe work: rendering from a snapshot, audio from a queue, I/O from a buffer.

## Memory Insight

The diagnostics function takes a pointer to the alive array. It does not copy the array. It reads in-place. For a 32-slot pool, that is 32 bytes read. Fits in a single cache line. The read is free in terms of memory allocation.

## Beginner Trap

**Thinking threads = faster.** Threads + shared mutable state = bugs. Two threads writing the same HP array means one thread's write gets lost. Or worse — half a write visible to the other thread. Start single-threaded. Thread only proven-safe work (rendering, audio). Never thread game state updates.

## Elite Insight

Doom (1993): single-threaded game logic, threaded renderer. Unity DOTS: Jobs system reads components via \\\`ReadOnly\\\` attribute, main thread writes. Unreal: GameThread owns all UObject state, RenderThread gets a frozen copy. Every engine converges on the same answer — game logic is serial. Observation is parallel.

## Systems Thinking Connection

Your pipeline from L11-22 runs move → damage → cleanup → render. Each system depends on the previous system's output. This dependency chain IS the argument for single-threading. Parallelize independent work. Serialize dependent work. Diagnostics is independent — it only reads the final state.

## Skill Reinforcement

L6: SoA arrays. L8: alive flags. L10: pool lifecycle. L11-22: multi-system pipeline. L23: proving the pipeline is deterministic by adding a read-only observer that cannot corrupt state.

## Mastery Check

Why is game logic single-threaded in every major engine? Because game systems have data dependencies. moveSystem output feeds damageSystem input. Parallelizing dependent operations requires synchronization that costs more than serial execution. Single-threaded is faster AND correct.

## Your Task

Build a 3-frame game simulation with diagnostics after each frame:
1. Frame 1: 5 enemies alive, no hits, diagnostics reads pool state
2. Frame 2: 1 hit (e2 destroyed), cleanup removes it, diagnostics sees 4
3. Frame 3: no hits, diagnostics confirms stable state
4. Print the determinism message

Expected output:
\\\`\\\`\\\`
=== FRAME 1 (main thread) ===
[MOVE] 5 enemies processed
[DAMAGE] 0 hits
[RENDER] 5 alive
[DIAG] entities=5 pool=5/32 freeList=27

=== FRAME 2 (main thread) ===
[MOVE] 5 enemies processed
[DAMAGE] 1 hit (e2 destroyed)
[CLEANUP] 1 removed
[RENDER] 4 alive
[DIAG] entities=4 pool=4/32 freeList=28

=== FRAME 3 (main thread) ===
[MOVE] 4 enemies processed
[DAMAGE] 0 hits
[RENDER] 4 alive
[DIAG] entities=4 pool=4/32 freeList=28
GAME_MESSAGE|Determinism first. Diagnostics read-only. No race conditions.
\\\`\\\`\\\``,
    starterCode: `#include <iostream>
using namespace std;

const int POOL_SIZE = 32;

int enemy_x[POOL_SIZE];
int enemy_y[POOL_SIZE];
int enemy_hp[POOL_SIZE];
bool enemy_alive[POOL_SIZE];

// TODO: Write printDiagnostics(bool alive[], int pool_size)
// Count alive entities and free slots. Print [DIAG] line.
// This function is READ-ONLY. It never modifies state.

int countAlive(bool alive[], int size) {
    int count = 0;
    for (int i = 0; i < size; i++) {
        if (alive[i]) count++;
    }
    return count;
}

int main() {
    // Initialize pool
    for (int i = 0; i < POOL_SIZE; i++) {
        enemy_alive[i] = false;
    }

    // Spawn 5 enemies (slots 0-4)
    for (int i = 0; i < 5; i++) {
        enemy_x[i] = 50 + i * 60;
        enemy_y[i] = 40;
        enemy_hp[i] = 30;
        enemy_alive[i] = true;
    }

    // === FRAME 1 ===
    cout << "=== FRAME 1 (main thread) ===" << endl;
    // TODO: Print [MOVE] with count of alive enemies processed
    // TODO: Print [DAMAGE] 0 hits
    // TODO: Print [RENDER] with count alive
    // TODO: Call printDiagnostics

    // === FRAME 2 ===
    cout << endl << "=== FRAME 2 (main thread) ===" << endl;
    int moveCount2 = countAlive(enemy_alive, POOL_SIZE);
    cout << "[MOVE] " << moveCount2 << " enemies processed" << endl;
    // Damage: e2 takes lethal hit
    enemy_hp[2] = 0;
    cout << "[DAMAGE] 1 hit (e2 destroyed)" << endl;
    // Cleanup: remove dead
    // TODO: Set e2 alive to false, print [CLEANUP] 1 removed
    int alive2 = countAlive(enemy_alive, POOL_SIZE);
    cout << "[RENDER] " << alive2 << " alive" << endl;
    // TODO: Call printDiagnostics

    // === FRAME 3 ===
    cout << endl << "=== FRAME 3 (main thread) ===" << endl;
    // TODO: Print [MOVE], [DAMAGE], [RENDER], and diagnostics for frame 3
    // No hits this frame. 4 enemies remain.

    cout << "GAME_MESSAGE|Determinism first. Diagnostics read-only. No race conditions." << endl;

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

void printDiagnostics(bool alive[], int pool_size) {
    int count = 0;
    int freeSlots = 0;
    for (int i = 0; i < pool_size; i++) {
        if (alive[i]) count++;
        else freeSlots++;
    }
    cout << "[DIAG] entities=" << count
         << " pool=" << count << "/" << pool_size
         << " freeList=" << freeSlots << endl;
}

int countAlive(bool alive[], int size) {
    int count = 0;
    for (int i = 0; i < size; i++) {
        if (alive[i]) count++;
    }
    return count;
}

int main() {
    // Initialize pool
    for (int i = 0; i < POOL_SIZE; i++) {
        enemy_alive[i] = false;
    }

    // Spawn 5 enemies (slots 0-4)
    for (int i = 0; i < 5; i++) {
        enemy_x[i] = 50 + i * 60;
        enemy_y[i] = 40;
        enemy_hp[i] = 30;
        enemy_alive[i] = true;
    }

    // === FRAME 1 ===
    cout << "=== FRAME 1 (main thread) ===" << endl;
    int moveCount1 = countAlive(enemy_alive, POOL_SIZE);
    cout << "[MOVE] " << moveCount1 << " enemies processed" << endl;
    cout << "[DAMAGE] 0 hits" << endl;
    cout << "[RENDER] " << moveCount1 << " alive" << endl;
    printDiagnostics(enemy_alive, POOL_SIZE);

    // === FRAME 2 ===
    cout << endl << "=== FRAME 2 (main thread) ===" << endl;
    int moveCount2 = countAlive(enemy_alive, POOL_SIZE);
    cout << "[MOVE] " << moveCount2 << " enemies processed" << endl;
    enemy_hp[2] = 0;
    cout << "[DAMAGE] 1 hit (e2 destroyed)" << endl;
    enemy_alive[2] = false;
    cout << "[CLEANUP] 1 removed" << endl;
    int alive2 = countAlive(enemy_alive, POOL_SIZE);
    cout << "[RENDER] " << alive2 << " alive" << endl;
    printDiagnostics(enemy_alive, POOL_SIZE);

    // === FRAME 3 ===
    cout << endl << "=== FRAME 3 (main thread) ===" << endl;
    int moveCount3 = countAlive(enemy_alive, POOL_SIZE);
    cout << "[MOVE] " << moveCount3 << " enemies processed" << endl;
    cout << "[DAMAGE] 0 hits" << endl;
    cout << "[RENDER] " << moveCount3 << " alive" << endl;
    printDiagnostics(enemy_alive, POOL_SIZE);

    cout << "GAME_MESSAGE|Determinism first. Diagnostics read-only. No race conditions." << endl;

    return 0;
}
`,
    tests: [
      {
        id: "t1",
        description: "Frame 1 diagnostics should show 5 entities",
        expectedOutput: "\\[DIAG\\] entities=5 pool=5/32 freeList=27",
        isPattern: true,
      },
      {
        id: "t2",
        description: "Frame 2 should show e2 destroyed",
        expectedOutput: "\\[DAMAGE\\] 1 hit \\(e2 destroyed\\)",
        isPattern: true,
      },
      {
        id: "t3",
        description: "Frame 2 diagnostics should show 4 entities",
        expectedOutput: "\\[DIAG\\] entities=4 pool=4/32 freeList=28",
        isPattern: true,
      },
      {
        id: "t4",
        description: "Frame 3 should render 4 alive",
        expectedOutput: "\\[RENDER\\] 4 alive",
        isPattern: true,
      },
      {
        id: "t5",
        description: "Should print determinism message",
        expectedOutput: "GAME_MESSAGE\\|Determinism first\\. Diagnostics read-only\\. No race conditions\\.",
        isPattern: true,
      },
    ],
    hints: [
      "`printDiagnostics` loops through `alive[]`, counts true (entities) and false (freeSlots), then prints the [DIAG] line. It reads only — never modifies.",
      "Frame 1: all 5 enemies alive. `countAlive` returns 5. Diagnostics shows entities=5, pool=5/32, freeList=27.",
      "Frame 2: after setting `enemy_alive[2] = false`, countAlive returns 4. Print `[CLEANUP] 1 removed` before the render line.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Game: Diagnostics Pipeline",
    type: "game_builder",
    instructions: `# Game Builder: Full Pipeline with Diagnostics

Your multi-system pipeline now has a diagnostic observer. Every frame runs: spawn → move → damage → cleanup → render → diagnostics. The diagnostics function is a pure reader. It counts entities, reports pool usage, and never touches game state.

## The Pipeline

1. **Frame 1: MENU** — Show title, diagnostics reads empty pool
2. **Frame 2: PLAYING** — Spawn wave 1 (5 enemies), run full pipeline, diagnostics confirms 5 entities
3. **Frame 3: COMBAT** — Damage kills e1 and e3, cleanup removes them, diagnostics shows 3 entities
4. **Frame 4: STABLE** — No new damage, diagnostics confirms stable at 3 entities

## Expected Output

\\\`\\\`\\\`
--- Frame 1: MENU ---
GAME_MESSAGE|=== SPACE SHOOTER v0 ===
[DIAG] entities=0 pool=0/32 freeList=32

--- Frame 2: PLAYING ---
[SPAWN] 5 enemies
[MOVE] 5 processed
[RENDER] 5 alive
HUD|HP:100|SCORE:0|LIVES:3
[DIAG] entities=5 pool=5/32 freeList=27

--- Frame 3: COMBAT ---
[MOVE] 5 processed
[DAMAGE] e1 hp:30->0 KILLED
[DAMAGE] e3 hp:30->0 KILLED
[CLEANUP] 2 removed
[RENDER] 3 alive
HUD|HP:100|SCORE:200|LIVES:3
[DIAG] entities=3 pool=3/32 freeList=29

--- Frame 4: STABLE ---
[MOVE] 3 processed
[DAMAGE] 0 hits
[RENDER] 3 alive
HUD|HP:100|SCORE:200|LIVES:3
[DIAG] entities=3 pool=3/32 freeList=29
GAME_MESSAGE|Pipeline verified: 4 frames, 0 race conditions.
SCORE|200
\\\`\\\`\\\``,
    starterCode: `#include <iostream>
using namespace std;

const int POOL_SIZE = 32;

int enemy_x[POOL_SIZE];
int enemy_y[POOL_SIZE];
int enemy_hp[POOL_SIZE];
bool enemy_alive[POOL_SIZE];

int countAlive(bool alive[], int size) {
    int count = 0;
    for (int i = 0; i < size; i++) {
        if (alive[i]) count++;
    }
    return count;
}

// TODO: Write printDiagnostics — read-only observer
// Print: [DIAG] entities=N pool=N/POOL_SIZE freeList=M

int main() {
    for (int i = 0; i < POOL_SIZE; i++) {
        enemy_alive[i] = false;
    }

    int score = 0;

    // --- Frame 1: MENU ---
    cout << "--- Frame 1: MENU ---" << endl;
    cout << "GAME_MESSAGE|=== SPACE SHOOTER v0 ===" << endl;
    // TODO: diagnostics (0 entities)

    // --- Frame 2: PLAYING ---
    cout << endl << "--- Frame 2: PLAYING ---" << endl;
    // TODO: Spawn 5 enemies at x=50+i*60, y=40, hp=30
    // Print [SPAWN], [MOVE], [RENDER], HUD, diagnostics

    // --- Frame 3: COMBAT ---
    cout << endl << "--- Frame 3: COMBAT ---" << endl;
    // TODO: Move, damage e1 and e3 (hp->0), cleanup, render, HUD, diagnostics
    // Add 100 score per kill

    // --- Frame 4: STABLE ---
    cout << endl << "--- Frame 4: STABLE ---" << endl;
    // TODO: Move, no damage, render, HUD, diagnostics

    cout << "GAME_MESSAGE|Pipeline verified: 4 frames, 0 race conditions." << endl;
    cout << "SCORE|" << score << endl;

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

int countAlive(bool alive[], int size) {
    int count = 0;
    for (int i = 0; i < size; i++) {
        if (alive[i]) count++;
    }
    return count;
}

void printDiagnostics(bool alive[], int pool_size) {
    int count = 0;
    int freeSlots = 0;
    for (int i = 0; i < pool_size; i++) {
        if (alive[i]) count++;
        else freeSlots++;
    }
    cout << "[DIAG] entities=" << count
         << " pool=" << count << "/" << pool_size
         << " freeList=" << freeSlots << endl;
}

int main() {
    for (int i = 0; i < POOL_SIZE; i++) {
        enemy_alive[i] = false;
    }

    int score = 0;

    // --- Frame 1: MENU ---
    cout << "--- Frame 1: MENU ---" << endl;
    cout << "GAME_MESSAGE|=== SPACE SHOOTER v0 ===" << endl;
    printDiagnostics(enemy_alive, POOL_SIZE);

    // --- Frame 2: PLAYING ---
    cout << endl << "--- Frame 2: PLAYING ---" << endl;
    for (int i = 0; i < 5; i++) {
        enemy_x[i] = 50 + i * 60;
        enemy_y[i] = 40;
        enemy_hp[i] = 30;
        enemy_alive[i] = true;
    }
    cout << "[SPAWN] 5 enemies" << endl;
    cout << "[MOVE] " << countAlive(enemy_alive, POOL_SIZE) << " processed" << endl;
    cout << "[RENDER] " << countAlive(enemy_alive, POOL_SIZE) << " alive" << endl;
    cout << "HUD|HP:100|SCORE:" << score << "|LIVES:3" << endl;
    printDiagnostics(enemy_alive, POOL_SIZE);

    // --- Frame 3: COMBAT ---
    cout << endl << "--- Frame 3: COMBAT ---" << endl;
    cout << "[MOVE] " << countAlive(enemy_alive, POOL_SIZE) << " processed" << endl;
    enemy_hp[1] = 0;
    cout << "[DAMAGE] e1 hp:30->0 KILLED" << endl;
    enemy_hp[3] = 0;
    cout << "[DAMAGE] e3 hp:30->0 KILLED" << endl;
    enemy_alive[1] = false;
    enemy_alive[3] = false;
    cout << "[CLEANUP] 2 removed" << endl;
    score += 200;
    cout << "[RENDER] " << countAlive(enemy_alive, POOL_SIZE) << " alive" << endl;
    cout << "HUD|HP:100|SCORE:" << score << "|LIVES:3" << endl;
    printDiagnostics(enemy_alive, POOL_SIZE);

    // --- Frame 4: STABLE ---
    cout << endl << "--- Frame 4: STABLE ---" << endl;
    cout << "[MOVE] " << countAlive(enemy_alive, POOL_SIZE) << " processed" << endl;
    cout << "[DAMAGE] 0 hits" << endl;
    cout << "[RENDER] " << countAlive(enemy_alive, POOL_SIZE) << " alive" << endl;
    cout << "HUD|HP:100|SCORE:" << score << "|LIVES:3" << endl;
    printDiagnostics(enemy_alive, POOL_SIZE);

    cout << "GAME_MESSAGE|Pipeline verified: 4 frames, 0 race conditions." << endl;
    cout << "SCORE|" << score << endl;

    return 0;
}
`,
    tests: [
      {
        id: "g1",
        description: "Frame 1 diagnostics should show empty pool",
        expectedOutput: "\\[DIAG\\] entities=0 pool=0/32 freeList=32",
        isPattern: true,
      },
      {
        id: "g2",
        description: "Frame 2 should spawn 5 enemies",
        expectedOutput: "\\[SPAWN\\] 5 enemies",
        isPattern: true,
      },
      {
        id: "g3",
        description: "Frame 2 diagnostics should show 5 entities",
        expectedOutput: "\\[DIAG\\] entities=5 pool=5/32 freeList=27",
        isPattern: true,
      },
      {
        id: "g4",
        description: "Frame 3 should show 2 kills and cleanup",
        expectedOutput: "\\[CLEANUP\\] 2 removed",
        isPattern: true,
      },
      {
        id: "g5",
        description: "Frame 3 diagnostics should show 3 entities",
        expectedOutput: "\\[DIAG\\] entities=3 pool=3/32 freeList=29",
        isPattern: true,
      },
      {
        id: "g6",
        description: "Frame 4 diagnostics should remain stable at 3",
        expectedOutput: "\\[DIAG\\] entities=3 pool=3/32 freeList=29",
        isPattern: true,
      },
      {
        id: "g7",
        description: "Should show pipeline verified message",
        expectedOutput: "GAME_MESSAGE\\|Pipeline verified: 4 frames, 0 race conditions\\.",
        isPattern: true,
      },
      {
        id: "g8",
        description: "Score should be 200",
        expectedOutput: "SCORE\\|200",
        isPattern: true,
      },
    ],
    hints: [
      "`printDiagnostics` counts alive (entities) and !alive (freeSlots) in one loop. Print format: `[DIAG] entities=N pool=N/32 freeList=M`.",
      "Frame 3: after killing e1 and e3, set `enemy_alive[1] = false` and `enemy_alive[3] = false`. Add 200 to score (100 per kill).",
      "Frame 4 is identical to frame 3's render state — 3 alive, score 200. Diagnostics confirms stability.",
    ],
    estimatedMinutes: 7,
  },
};
