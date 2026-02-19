import type { GameLessonVariant } from "@/types/game";

export const lesson15SpaceShooter: GameLessonVariant = {
  lessonId: "15-multi-system-tick",
  instructions: `# MILESTONE 15 — The System Pipeline Runs

Everything you have built converges here. SoA arrays from L6. Alive flags from L8. System functions from L9. Entity pool from L10. Capacity planning from L14. Now they run together as a pipeline. Move -> Damage -> Cleanup -> Render. Every frame. In order. This IS a game engine.

## What Breaks Without This

Without a pipeline, systems run ad-hoc. Movement happens somewhere. Damage happens somewhere else. Cleanup is an afterthought. Render sees stale data. Entities teleport. Dead enemies render for one extra frame. Scores are wrong. The game "works" but every interaction has a subtle bug.

## The Fix

Four system functions. One pipeline. Strict order:

1. **moveSystem** — streams through posY[], adds speed to every alive entity. Returns count moved.
2. **damageSystem** — applies damage to targeted entities. Reduces hp. Does NOT set alive=false. That's cleanup's job.
3. **cleanupSystem** — streams through alive[] and hp[]. Any entity with hp <= 0 gets alive set to false. Returns count removed.
4. **renderSystem** — streams through all arrays. Outputs ENTITY line for every alive entity. Returns count rendered.

Each system is a pure function over the data. No system knows about any other system. They communicate through the shared arrays. This is implicit dataflow — the arrays ARE the message bus.

Simulate 3 frames:
- **Frame 1:** 5 enemies spawn. All move down 20. No damage. All 5 render at y=60.
- **Frame 2:** All move down 20 (y=80). Enemy e2 takes 30 damage (lethal). Cleanup removes e2. 4 render.
- **Frame 3:** 4 move down 20 (y=100). Enemy e4 takes 30 damage (lethal). Cleanup removes e4. 3 render.

Score: 100 per kill. Total: 200.

## Your Task

1. Spawn 5 enemies at x = 60 + i*60, y = 40, hp = 30
2. Run 3 frames of the pipeline
3. Each frame logs: [MOVE] count, [DAMAGE] hits, [CLEANUP] removed, [RENDER] alive count
4. Render ENTITY lines for alive entities each frame
5. Output SCORE|200 and pipeline message at the end

## Beginner Trap

**Common Mistake:** Applying damage AND setting alive=false in the same step. Separation of concerns: damageSystem modifies hp. cleanupSystem reads hp and modifies alive. If you merge them, you can't add a "low health warning" system between damage and cleanup later. Keep systems single-responsibility.

## Elite Insight

This is the update loop of every commercial engine. Unity: PlayerLoop with phases (EarlyUpdate, FixedUpdate, Update, LateUpdate). Unreal: tick groups ordered by dependency. Godot: _physics_process then _process. Your 4 functions in a for loop IS the same architecture at hobby scale.

## Systems Thinking Connection

MILESTONE 15. The pipeline is the skeleton of your game engine. Every future feature is a system function slotted into this pipeline. Weapons? A fireSystem between input and move. AI? A behaviorSystem before move. Particles? A particleSystem before render. The pipeline grows horizontally. The architecture stays the same.

## Skill Reinforcement

This lesson uses every concept from L1-L14. cout (L1). Variables (L2). Math (L3). Conditionals (L4/L8). Functions (L5/L9). Arrays (L6). Loops (L7). Pool (L10). Strings (L11). Enums (L13). Capacity (L14). If any of those feel shaky, this lesson will surface it.

## Mastery Check

After Frame 2, what is e0's y position? 80 (40 + 20 + 20). What is e2's alive status? false (30 damage killed it, cleanup removed it). How many entities does moveSystem process in Frame 3? 4 (e2 is dead, e4 is still alive at the start of Frame 3 — it dies during Frame 3's damage phase).`,
  starterCode: `#include <iostream>
using namespace std;

const int CAPACITY = 32;

int posX[CAPACITY];
int posY[CAPACITY];
int hp[CAPACITY];
bool alive[CAPACITY];
int score = 0;

int findFreeSlot(bool alive[], int size) {
    for (int i = 0; i < size; i++) {
        if (!alive[i]) return i;
    }
    return -1;
}

void spawnEnemy(int idx, int x, int y, int health) {
    posX[idx] = x;
    posY[idx] = y;
    hp[idx] = health;
    alive[idx] = true;
}

int moveSystem(int speed) {
    int moved = 0;
    for (int i = 0; i < CAPACITY; i++) {
        if (alive[i]) { posY[i] += speed; moved++; }
    }
    return moved;
}

int cleanupSystem() {
    int removed = 0;
    for (int i = 0; i < CAPACITY; i++) {
        if (alive[i] && hp[i] <= 0) { alive[i] = false; removed++; }
    }
    return removed;
}

int main() {
    for (int i = 0; i < CAPACITY; i++) alive[i] = false;

    // Spawn 5 enemies
    for (int i = 0; i < 5; i++) {
        int idx = findFreeSlot(alive, CAPACITY);
        spawnEnemy(idx, 60 + i * 60, 40, 30);
    }

    // TODO: Frame 1 — move, no damage, cleanup, render

    // TODO: Frame 2 — move, damage e2 (30 dmg, lethal), cleanup, render

    // TODO: Frame 3 — move, damage e4 (30 dmg, lethal), cleanup, render

    cout << "SCORE|" << score << endl;
    cout << "GAME_MESSAGE|System pipeline: move->damage->cleanup->render. Order is correctness." << endl;

    return 0;
}
`,
  solutionCode: `#include <iostream>
using namespace std;

const int CAPACITY = 32;

int posX[CAPACITY];
int posY[CAPACITY];
int hp[CAPACITY];
bool alive[CAPACITY];
int score = 0;

int findFreeSlot(bool alive[], int size) {
    for (int i = 0; i < size; i++) {
        if (!alive[i]) return i;
    }
    return -1;
}

void spawnEnemy(int idx, int x, int y, int health) {
    posX[idx] = x;
    posY[idx] = y;
    hp[idx] = health;
    alive[idx] = true;
}

int moveSystem(int speed) {
    int moved = 0;
    for (int i = 0; i < CAPACITY; i++) {
        if (alive[i]) { posY[i] += speed; moved++; }
    }
    return moved;
}

int cleanupSystem() {
    int removed = 0;
    for (int i = 0; i < CAPACITY; i++) {
        if (alive[i] && hp[i] <= 0) { alive[i] = false; removed++; }
    }
    return removed;
}

int main() {
    for (int i = 0; i < CAPACITY; i++) alive[i] = false;

    // Spawn 5 enemies
    for (int i = 0; i < 5; i++) {
        int idx = findFreeSlot(alive, CAPACITY);
        spawnEnemy(idx, 60 + i * 60, 40, 30);
    }

    // === FRAME 1 ===
    cout << "=== FRAME 1 ===" << endl;
    int moved = moveSystem(20);
    cout << "[MOVE] " << moved << " entities moved" << endl;
    cout << "[DAMAGE] 0 hits applied" << endl;
    int removed = cleanupSystem();
    cout << "[CLEANUP] " << removed << " removed" << endl;
    int aliveCount = 0;
    for (int i = 0; i < CAPACITY; i++) if (alive[i]) aliveCount++;
    cout << "[RENDER] " << aliveCount << " alive" << endl;
    for (int i = 0; i < CAPACITY; i++) {
        if (alive[i]) {
            cout << "ENTITY|e" << i << "|enemy|"
                 << posX[i] << "|" << posY[i]
                 << "|22|22|" << hp[i] << endl;
        }
    }

    // === FRAME 2 ===
    cout << "=== FRAME 2 ===" << endl;
    moved = moveSystem(20);
    cout << "[MOVE] " << moved << " entities moved" << endl;
    hp[2] -= 30;
    if (hp[2] < 0) hp[2] = 0;
    cout << "[DAMAGE] 1 hits applied (e2: 30->0)" << endl;
    score += 100;
    removed = cleanupSystem();
    cout << "[CLEANUP] " << removed << " removed" << endl;
    aliveCount = 0;
    for (int i = 0; i < CAPACITY; i++) if (alive[i]) aliveCount++;
    cout << "[RENDER] " << aliveCount << " alive" << endl;
    for (int i = 0; i < CAPACITY; i++) {
        if (alive[i]) {
            cout << "ENTITY|e" << i << "|enemy|"
                 << posX[i] << "|" << posY[i]
                 << "|22|22|" << hp[i] << endl;
        }
    }

    // === FRAME 3 ===
    cout << "=== FRAME 3 ===" << endl;
    moved = moveSystem(20);
    cout << "[MOVE] " << moved << " entities moved" << endl;
    hp[4] -= 30;
    if (hp[4] < 0) hp[4] = 0;
    cout << "[DAMAGE] 1 hits applied (e4: 30->0)" << endl;
    score += 100;
    removed = cleanupSystem();
    cout << "[CLEANUP] " << removed << " removed" << endl;
    aliveCount = 0;
    for (int i = 0; i < CAPACITY; i++) if (alive[i]) aliveCount++;
    cout << "[RENDER] " << aliveCount << " alive" << endl;
    for (int i = 0; i < CAPACITY; i++) {
        if (alive[i]) {
            cout << "ENTITY|e" << i << "|enemy|"
                 << posX[i] << "|" << posY[i]
                 << "|22|22|" << hp[i] << endl;
        }
    }

    cout << "SCORE|" << score << endl;
    cout << "GAME_MESSAGE|System pipeline: move->damage->cleanup->render. Order is correctness." << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Frame 1: 5 entities alive", expectedOutput: "\\[RENDER\\] 5 alive", isPattern: true },
    { id: "g2", description: "Frame 1: e0 at y=60", expectedOutput: "ENTITY\\|e0\\|enemy\\|60\\|60\\|22\\|22\\|30", isPattern: true },
    { id: "g3", description: "Frame 2: 4 entities after e2 killed", expectedOutput: "\\[RENDER\\] 4 alive", isPattern: true },
    { id: "g4", description: "Frame 2: e2 damage logged", expectedOutput: "\\[DAMAGE\\] 1 hits applied \\(e2: 30->0\\)", isPattern: true },
    { id: "g5", description: "Frame 3: 3 entities at y=100", expectedOutput: "ENTITY\\|e0\\|enemy\\|60\\|100\\|22\\|22\\|30", isPattern: true },
    { id: "g6", description: "Score is 200", expectedOutput: "SCORE\\|200", isPattern: true },
    { id: "g7", description: "Pipeline message", expectedOutput: "GAME_MESSAGE\\|System pipeline: move->damage->cleanup->render", isPattern: true },
  ],
  hints: [
    "Each frame follows the same pattern: moveSystem -> apply damage -> cleanupSystem -> count alive -> render loop.",
    "Damage is manual: `hp[2] -= 30;` in Frame 2, `hp[4] -= 30;` in Frame 3. cleanupSystem handles the rest.",
    "y positions accumulate: 40 -> 60 (Frame 1) -> 80 (Frame 2) -> 100 (Frame 3). Each move adds 20.",
  ],
  accumulatedCode: `#include <iostream>
using namespace std;

// === MILESTONE 15: System Pipeline ===
// L6: SoA arrays | L7: Loops | L8: Alive flags | L9: System functions
// L10: Pool lifecycle | L14: Capacity planning | L15: System pipeline

const int CAPACITY = 32;

// --- Component arrays (SoA layout) ---
int posX[CAPACITY];
int posY[CAPACITY];
int hp[CAPACITY];
bool alive[CAPACITY];
int score = 0;

// --- Pool management ---
int findFreeSlot(bool alive[], int size) {
    for (int i = 0; i < size; i++) {
        if (!alive[i]) return i;
    }
    return -1;
}

void spawnEnemy(int idx, int x, int y, int health) {
    posX[idx] = x;
    posY[idx] = y;
    hp[idx] = health;
    alive[idx] = true;
}

void despawnEnemy(int idx) {
    alive[idx] = false;
}

// --- System functions (pipeline order: move -> damage -> cleanup -> render) ---
int moveSystem(int speed) {
    int moved = 0;
    for (int i = 0; i < CAPACITY; i++) {
        if (alive[i]) { posY[i] += speed; moved++; }
    }
    return moved;
}

void damageEntity(int target, int dmg) {
    hp[target] -= dmg;
    if (hp[target] < 0) hp[target] = 0;
}

int cleanupSystem() {
    int removed = 0;
    for (int i = 0; i < CAPACITY; i++) {
        if (alive[i] && hp[i] <= 0) { alive[i] = false; removed++; }
    }
    return removed;
}

int renderSystem() {
    int rendered = 0;
    for (int i = 0; i < CAPACITY; i++) {
        if (alive[i]) {
            cout << "ENTITY|e" << i << "|enemy|"
                 << posX[i] << "|" << posY[i]
                 << "|22|22|" << hp[i] << endl;
            rendered++;
        }
    }
    return rendered;
}

int main() {
    for (int i = 0; i < CAPACITY; i++) alive[i] = false;

    // Spawn wave
    for (int i = 0; i < 5; i++) {
        int idx = findFreeSlot(alive, CAPACITY);
        spawnEnemy(idx, 60 + i * 60, 40, 30);
    }

    // Frame loop: move -> damage -> cleanup -> render
    // Each frame runs the full pipeline in order
    int moved = moveSystem(20);
    int removed = cleanupSystem();
    int rendered = renderSystem();

    cout << "SCORE|" << score << endl;
    cout << "GAME_MESSAGE|System pipeline: move->damage->cleanup->render. Order is correctness." << endl;

    return 0;
}
`,
};
