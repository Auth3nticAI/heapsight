import type { Lesson } from "@/types/lesson";

export const lesson15: Lesson = {
  id: "15-multi-system-tick",
  title: "Multi System Tick",
  description: "Run movement, damage, cleanup, and render as a pipeline. Every frame. In order. This is a game engine.",
  order: 15,
  xpReward: 150,
  tier: "pro",
  concepts: ["system pipeline", "tick order", "movement system", "damage system", "cleanup system", "frame phases"],
  part1: {
    title: "Concept: Multi System Tick",
    type: "concept",
    instructions: `# Multi System Tick — MILESTONE 15

This is the moment everything clicks. You have component arrays. You have system functions. Now they run together, in order, every frame. This IS a game engine.

## Mental Model

A game frame is a pipeline: Input -> Move -> Collide -> Damage -> Cleanup -> Render. Order matters. Each system is a pure function over the data arrays. The pipeline runs once per frame. Every entity gets processed. Every system sees the results of the previous system.

## What Breaks

Wrong order kills everything. If cleanup runs before damage, you remove enemies before checking if they were hit. If render runs before movement, entities appear at last frame's position. If damage runs before movement, collision checks use stale positions. Pipeline order IS correctness.

## The Fix

Define 4 system functions. Run them in order every frame: move -> damage -> cleanup -> render. Each takes component arrays by reference. Each does one job. The pipeline composes them into a complete frame update.

\`\`\`cpp
void moveSystem(int py[], bool alive[], int cap, int speed);
void damageSystem(int hp[], bool alive[], int cap, int target, int dmg);
void cleanupSystem(bool alive[], int hp[], int cap, int& removed);
void renderSystem(int px[], int py[], int hp[], bool alive[], int cap, int& rendered);
\`\`\`

## TargetFile: src/main.cpp and include/systems.h

Simulate 3 frames:
- **Frame 1:** Spawn 5 enemies. Move all down 20. No damage. No cleanup. Render 5.
- **Frame 2:** Move down 20. Damage enemy 2 (lethal: 30->0). Cleanup removes dead. Render 4.
- **Frame 3:** Move down 20. Damage enemy 4 (lethal: 30->0). Cleanup removes dead. Render 3.

Each frame logs what each system did. The output tells you exactly what happened and in what order.

## Performance Insight

Each system touches only the arrays it needs. moveSystem: posY[]. damageSystem: hp[]. cleanupSystem: alive[] + hp[]. renderSystem: all arrays. No system loads data it doesn't use. This is data-oriented design. Cache lines stay hot because each system streams through one array at a time.

## Memory Insight

5 entities * 4 arrays * 4 bytes = 80 bytes of game state. The entire simulation fits in a single cache line. At scale with 1000 entities, that's 16KB — still L1 cache. SoA layout means each system's working set is contiguous.

## Your Task

1. Write \`moveSystem\` — add speed to posY for all alive entities, return count moved
2. Write \`cleanupSystem\` — set alive=false for any entity with hp <= 0, return count removed
3. Simulate 3 frames with the pipeline: move -> damage -> cleanup -> render
4. Frame 1: no damage, all 5 alive
5. Frame 2: enemy 2 takes 30 damage (lethal), removed by cleanup, 4 alive
6. Frame 3: enemy 4 takes 30 damage (lethal), removed by cleanup, 3 alive
7. Track score: +100 per kill. Output SCORE|200 at the end.

## Beginner Trap

Putting all logic in one giant loop. "For each entity: move it, damage it, check health, render it." This couples everything. One bug in damage breaks rendering. Systems separate concerns. One function per responsibility. Test each independently.

## Elite Insight

Unity's system update order: OnUpdate runs systems in declared order. Unreal's tick groups: PrePhysics, DuringPhysics, PostPhysics. Same pipeline concept. Your 4 functions in a loop IS the same architecture. The only difference is scale and a scheduler.

## Systems Thinking Connection

The system pipeline is the core loop of every game engine ever built. Input -> Simulate -> Render. Your 4 functions running in sequence IS the simulation step. Everything you build from here — weapons, AI, particles, UI — plugs into this pipeline as another system function.

## Skill Reinforcement

moveSystem from L9. Alive flags from L8. Pool management from L10. Capacity from L14. Now they compose into a pipeline. Each lesson was a building block. This is the structure they build.

## Mastery Check

If you add a collisionSystem between move and damage, where does it go in the pipeline? After move (positions are updated), before damage (collision results feed damage). move -> collision -> damage -> cleanup -> render.`,
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

// TODO: moveSystem — loop all slots, if alive, add speed to posY
// Return count of entities moved
int moveSystem(int speed) {
    int moved = 0;
    // Your code here
    return moved;
}

// TODO: cleanupSystem — loop all slots, if alive and hp <= 0, set alive=false
// Return count of entities removed
int cleanupSystem() {
    int removed = 0;
    // Your code here
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
    // TODO: Run moveSystem(20), print moved count
    // TODO: Print damage: 0 hits applied
    // TODO: Run cleanupSystem, print removed count
    // TODO: Render: count alive, print each ENTITY, print alive count

    // === FRAME 2 ===
    cout << "=== FRAME 2 ===" << endl;
    // TODO: moveSystem(20)
    // TODO: Damage enemy 2: hp[2] -= 30, print damage info
    // TODO: cleanupSystem
    // TODO: Render alive entities

    // === FRAME 3 ===
    cout << "=== FRAME 3 ===" << endl;
    // TODO: moveSystem(20)
    // TODO: Damage enemy 4: hp[4] -= 30, print damage info
    // TODO: cleanupSystem
    // TODO: Render alive entities

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
        if (alive[i]) {
            posY[i] += speed;
            moved++;
        }
    }
    return moved;
}

int cleanupSystem() {
    int removed = 0;
    for (int i = 0; i < CAPACITY; i++) {
        if (alive[i] && hp[i] <= 0) {
            alive[i] = false;
            removed++;
        }
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
    for (int i = 0; i < CAPACITY; i++) {
        if (alive[i]) aliveCount++;
    }
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
    int oldHp2 = hp[2];
    hp[2] -= 30;
    if (hp[2] < 0) hp[2] = 0;
    cout << "[DAMAGE] 1 hits applied (e2: " << oldHp2 << "->0)" << endl;
    score += 100;
    removed = cleanupSystem();
    cout << "[CLEANUP] " << removed << " removed" << endl;
    aliveCount = 0;
    for (int i = 0; i < CAPACITY; i++) {
        if (alive[i]) aliveCount++;
    }
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
    int oldHp4 = hp[4];
    hp[4] -= 30;
    if (hp[4] < 0) hp[4] = 0;
    cout << "[DAMAGE] 1 hits applied (e4: " << oldHp4 << "->0)" << endl;
    score += 100;
    removed = cleanupSystem();
    cout << "[CLEANUP] " << removed << " removed" << endl;
    aliveCount = 0;
    for (int i = 0; i < CAPACITY; i++) {
        if (alive[i]) aliveCount++;
    }
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
      {
        id: "t1",
        description: "Frame 1 should show 5 alive",
        expectedOutput: "[RENDER] 5 alive",
      },
      {
        id: "t2",
        description: "Frame 2 should show 4 alive after e2 killed",
        expectedOutput: "[RENDER] 4 alive",
      },
      {
        id: "t3",
        description: "Frame 3 should show 3 alive after e4 killed",
        expectedOutput: "[RENDER] 3 alive",
      },
      {
        id: "t4",
        description: "Should show final score of 200",
        expectedOutput: "SCORE|200",
      },
      {
        id: "t5",
        description: "Should show pipeline message",
        expectedOutput: "System pipeline: move->damage->cleanup->render. Order is correctness.",
      },
    ],
    hints: [
      "moveSystem: `for (int i = 0; i < CAPACITY; i++) { if (alive[i]) { posY[i] += speed; moved++; } }`",
      "cleanupSystem: `if (alive[i] && hp[i] <= 0) { alive[i] = false; removed++; }` — checks both alive AND hp.",
      "Damage in frame 2: `hp[2] -= 30;` then cleanupSystem finds hp[2] <= 0 and removes it. Score += 100.",
    ],
    estimatedMinutes: 7,
  },
  part2: {
    title: "Game: System Pipeline",
    type: "game_builder",
    instructions: `# Game Builder: Full System Pipeline — MILESTONE 15

This is the first time all systems run in a pipeline. Ship, bullets, enemies — all processed by the same system functions. This is the architecture that scales to any game.

## TargetFile: src/main.cpp and include/systems.h

## Your Task

1. Spawn 5 enemies at x = 60 + i*60, y = 40, hp = 30
2. Simulate 3 frames of the system pipeline:

**Frame 1:** Move all down 20. No damage. No cleanup. Render 5 enemies.
**Frame 2:** Move down 20. Enemy e2 takes lethal hit (30 damage). Cleanup removes e2. Render 4.
**Frame 3:** Move down 20. Enemy e4 takes lethal hit (30 damage). Cleanup removes e4. Render 3.

3. Each frame outputs system phase tags: [MOVE], [DAMAGE], [CLEANUP], [RENDER]
4. Render alive entities with ENTITY protocol
5. Output SCORE|200 (100 per kill)
6. Output pipeline message

Expected output for Frame 3:
\`\`\`
=== FRAME 3 ===
[MOVE] 4 entities moved
[DAMAGE] 1 hits applied (e4: 30->0)
[CLEANUP] 1 removed
[RENDER] 3 alive
ENTITY|e0|enemy|60|100|22|22|30
ENTITY|e1|enemy|120|100|22|22|30
ENTITY|e3|enemy|240|100|22|22|30
\`\`\`

## Mental Model

Each frame is a pipeline. Each system function operates on the same arrays. The order guarantees correctness: movement updates positions, damage applies hits using current positions, cleanup removes the dead, render draws what's left. Add a new system? Slot it into the pipeline at the right position.

## Performance Insight

4 systems * 5 entities = 20 function calls per frame maximum. Each system streams through one or two arrays. At 60 FPS, that's 1200 lightweight iterations per second. The CPU doesn't even notice.

## Memory Insight

Game state between frames: only the arrays change. No allocations. No copies. Systems mutate in place. Frame 1 state flows into Frame 2 by doing nothing — the arrays persist.

## Beginner Trap

Resetting entity positions between frames. Positions accumulate. Frame 1: y = 40+20 = 60. Frame 2: y = 60+20 = 80. Frame 3: y = 80+20 = 100. Each frame builds on the last. That's simulation.

## Elite Insight

This pipeline is deterministic. Same input, same output, every time. No randomness, no timing dependencies. Determinism enables replays, networking, and testing. Record the inputs, replay the pipeline, get the same result.

## Systems Thinking Connection

MILESTONE 15. You now have: SoA data layout (L6), alive flags (L8), system functions (L9), entity pool (L10), capacity planning (L14), and a system pipeline (L15). This is ECS. Everything from here — weapons, AI, particles, networking — is a new system function plugged into this pipeline.

## Skill Reinforcement

Every lesson converges here. Arrays from L6. Loops from L7. Conditionals from L8. Functions from L9. Pool from L10. Capacity from L14. The pipeline is the structure that holds them all.

## Mastery Check

What's the entity count at each render? Frame 1: 5. Frame 2: 4. Frame 3: 3. What's the y position at Frame 3 render? 40 + 20 + 20 + 20 = 100. If you can predict these instantly, you understand the pipeline.`,
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

    // TODO: Frame 2 — move, damage e2 (30 dmg), cleanup, render

    // TODO: Frame 3 — move, damage e4 (30 dmg), cleanup, render

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
      {
        id: "g1",
        description: "Frame 1: all 5 alive at y=60",
        expectedOutput: "ENTITY\\|e4\\|enemy\\|300\\|60\\|22\\|22\\|30",
        isPattern: true,
      },
      {
        id: "g2",
        description: "Frame 2: 4 alive, e2 missing",
        expectedOutput: "\\[RENDER\\] 4 alive",
        isPattern: true,
      },
      {
        id: "g3",
        description: "Frame 3: 3 alive at y=100",
        expectedOutput: "ENTITY\\|e3\\|enemy\\|240\\|100\\|22\\|22\\|30",
        isPattern: true,
      },
      {
        id: "g4",
        description: "Score should be 200",
        expectedOutput: "SCORE\\|200",
        isPattern: true,
      },
      {
        id: "g5",
        description: "Pipeline message",
        expectedOutput: "GAME_MESSAGE\\|System pipeline: move->damage->cleanup->render",
        isPattern: true,
      },
    ],
    hints: [
      "Frame 1: `int moved = moveSystem(20);` then render loop. No damage this frame.",
      "Frame 2: after moveSystem, apply `hp[2] -= 30;` then `cleanupSystem()` finds and removes the dead entity.",
      "Positions accumulate: y starts at 40. After 3 moves of 20: 40 -> 60 -> 80 -> 100.",
    ],
    estimatedMinutes: 10,
  },
};
