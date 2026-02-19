import type { GameLessonVariant } from "@/types/game";

export const lesson23SpaceShooter: GameLessonVariant = {
  lessonId: "23-thread-awareness-v0",
  instructions: `# Thread Awareness v0 — Deterministic Pipeline with Read-Only Diagnostics

## Mental Model

Game logic must be deterministic. Every frame runs the same pipeline: spawn → move → damage → cleanup → render. After the pipeline completes, a diagnostics function reads the final state and reports. It never writes. It never modifies. It is a pure observer.

Two systems writing the same data = race condition. If moveSystem and damageSystem both touch \`enemy_hp[]\` simultaneously, the result is undefined. One write overwrites the other. Or worse — a partial write is visible mid-operation. HP is half-updated. The damage check sees garbage. The game breaks in a way you cannot reproduce.

The fix is simple and absolute: game systems run sequentially on one thread. Diagnostics is read-only.

## What Breaks Without This

Without determinism guarantees, your game behaves differently on every run. Enemy dies on frame 47 in one run, frame 49 in the next. Collision detected in one playthrough, missed in another. Players report bugs you cannot reproduce because the race condition depends on thread scheduling — which is controlled by the OS, not your code.

Every shipped engine solves this the same way. Serial game logic. Parallel read-only work.

## The Fix

Your pipeline runs four systems in order: move, damage, cleanup, render. Each system completes before the next begins. After all four, \`printDiagnostics\` reads \`enemy_alive[]\` and counts entities. It produces a \`[DIAG]\` line showing entity count, pool usage, and free slots. Pure observation. Zero side effects.

The data flow is: Frame 1 (MENU) shows empty pool. Frame 2 (PLAYING) spawns 5 enemies — diagnostics confirms 5. Frame 3 (COMBAT) kills e1 and e3 — diagnostics drops to 3. Frame 4 (STABLE) no changes — diagnostics confirms 3 again. Stability proven.

## Your Task

1. Write \`printDiagnostics(bool alive[], int pool_size)\` — count alive entities and free slots, print \`[DIAG] entities=N pool=N/POOL_SIZE freeList=M\`
2. Frame 1 (MENU): print title, run diagnostics on empty pool (0 entities, 32 free)
3. Frame 2 (PLAYING): spawn 5 enemies at x=50+i*60, y=40, hp=30. Run move/render/HUD/diagnostics
4. Frame 3 (COMBAT): move, kill e1 and e3 (hp→0, alive→false), cleanup, render. Score +100 per kill. Diagnostics shows 3
5. Frame 4 (STABLE): move, no damage, render. Diagnostics confirms 3 stable
6. Print pipeline verified message and SCORE|200

## Performance Insight

The diagnostics function scans 32 booleans — 32 bytes. One cache line. The cost is invisible. In production, diagnostics would run on a separate thread reading a snapshot. Here we run it inline because the principle is the same: read-only observation of finalized state.

## Memory Insight

\`printDiagnostics\` takes a pointer to the alive array. No copy. No allocation. The function reads 32 bytes in-place and exits. Stack frame: two local ints (count, freeSlots). 8 bytes total. This is what zero-overhead diagnostics looks like.

## Beginner Trap

**Modifying state inside diagnostics.** If \`printDiagnostics\` accidentally sets \`alive[i] = false\` while counting, entities vanish. The function signature should signal intent: it takes \`bool alive[]\` (not a reference to a mutable container). In production, you would use \`const bool alive[]\` to enforce read-only at compile time.

## Elite Insight

Doom (1993): P_Ticker runs all game logic on one thread. R_RenderPlayerView runs the renderer — it reads the world state but never modifies it. This separation is why Doom could render at 35fps with a 35Hz game tick. Your \`printDiagnostics\` follows the same contract as Doom's renderer: read the world, produce output, touch nothing.

## Systems Thinking Connection

L11-22 built the pipeline: move → damage → cleanup → render. L23 adds the proof that it works. Diagnostics is your first integration test. If the diagnostic counts match expected values after each frame, your pipeline is correct. Determinism is not assumed — it is verified.

## Skill Reinforcement

L6: SoA arrays. L8: alive flags. L10: pool lifecycle. L11-22: system pipeline. L23: read-only observation. Each layer builds on the last. Diagnostics only works because the pool is well-structured and the pipeline is sequential.

## Mastery Check

What makes \`printDiagnostics\` safe to call from any context? It reads \`alive[]\` and computes derived values. It writes nothing. No side effects. No state mutation. Any number of observers can read simultaneously without conflict. This is the foundation of thread-safe design.`,
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

// TODO: Write printDiagnostics(bool alive[], int pool_size)
// Count alive entities and free slots. Print [DIAG] line.
// This function is READ-ONLY. Zero writes. Zero side effects.

int main() {
    for (int i = 0; i < POOL_SIZE; i++) {
        enemy_alive[i] = false;
    }

    int score = 0;

    // --- Frame 1: MENU ---
    cout << "--- Frame 1: MENU ---" << endl;
    cout << "GAME_MESSAGE|=== SPACE SHOOTER v0 ===" << endl;
    // TODO: Call printDiagnostics (empty pool)

    // --- Frame 2: PLAYING ---
    cout << endl << "--- Frame 2: PLAYING ---" << endl;
    // TODO: Spawn 5 enemies at x=50+i*60, y=40, hp=30
    // Print [SPAWN], [MOVE], [RENDER], HUD, diagnostics

    // --- Frame 3: COMBAT ---
    cout << endl << "--- Frame 3: COMBAT ---" << endl;
    // TODO: Move, damage e1 and e3 (hp->0, alive->false)
    // Print [DAMAGE] lines, [CLEANUP], [RENDER], HUD, diagnostics
    // Score +100 per kill

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
    { id: "g1", description: "Frame 1 diagnostics: empty pool", expectedOutput: "\\[DIAG\\] entities=0 pool=0/32 freeList=32", isPattern: true },
    { id: "g2", description: "Frame 2 should spawn 5 enemies", expectedOutput: "\\[SPAWN\\] 5 enemies", isPattern: true },
    { id: "g3", description: "Frame 2 diagnostics: 5 entities", expectedOutput: "\\[DIAG\\] entities=5 pool=5/32 freeList=27", isPattern: true },
    { id: "g4", description: "Frame 3 should kill e1", expectedOutput: "\\[DAMAGE\\] e1 hp:30->0 KILLED", isPattern: true },
    { id: "g5", description: "Frame 3 should kill e3", expectedOutput: "\\[DAMAGE\\] e3 hp:30->0 KILLED", isPattern: true },
    { id: "g6", description: "Frame 3 cleanup removes 2", expectedOutput: "\\[CLEANUP\\] 2 removed", isPattern: true },
    { id: "g7", description: "Frame 3 diagnostics: 3 entities", expectedOutput: "\\[DIAG\\] entities=3 pool=3/32 freeList=29", isPattern: true },
    { id: "g8", description: "Frame 4 diagnostics stable at 3", expectedOutput: "\\[DIAG\\] entities=3 pool=3/32 freeList=29", isPattern: true },
    { id: "g9", description: "Pipeline verified message", expectedOutput: "GAME_MESSAGE\\|Pipeline verified: 4 frames, 0 race conditions\\.", isPattern: true },
    { id: "g10", description: "Final score 200", expectedOutput: "SCORE\\|200", isPattern: true },
  ],
  hints: [
    "`printDiagnostics` loops 0 to pool_size: count alive (entities) and !alive (freeSlots). Format: `[DIAG] entities=N pool=N/32 freeList=M`.",
    "Frame 3: set `enemy_hp[1] = 0; enemy_hp[3] = 0;` then `enemy_alive[1] = false; enemy_alive[3] = false;`. Print damage lines before cleanup. Score += 200.",
    "Frame 4 is pure observation — no state changes. Same counts as frame 3. Diagnostics confirms stability.",
  ],
  accumulatedCode: `#include <iostream>
using namespace std;

// === L23: Thread Awareness v0 ===
// Game logic: single-threaded, sequential pipeline
// Diagnostics: read-only observer, zero side effects

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

// Read-only diagnostics — never modifies game state
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

int findFreeSlot(bool alive[], int size) {
    for (int i = 0; i < size; i++) {
        if (!alive[i]) return i;
    }
    return -1;
}

void spawnEnemy(int idx, int x, int y, int hp,
                int ex[], int ey[], int ehp[], bool alive[]) {
    ex[idx] = x;
    ey[idx] = y;
    ehp[idx] = hp;
    alive[idx] = true;
}

void despawnEnemy(int idx, bool alive[]) {
    alive[idx] = false;
}

void moveSystem(int ey[], bool alive[], int count, int speed) {
    for (int i = 0; i < count; i++) {
        if (alive[i]) ey[i] += speed;
    }
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
        spawnEnemy(findFreeSlot(enemy_alive, POOL_SIZE),
                   50 + i * 60, 40, 30,
                   enemy_x, enemy_y, enemy_hp, enemy_alive);
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
    despawnEnemy(1, enemy_alive);
    despawnEnemy(3, enemy_alive);
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
};
