import type { GameLessonVariant } from "@/types/game";

export const lesson10SpaceShooter: GameLessonVariant = {
  lessonId: "10-entity-pool-v0",
  instructions: `# No Pool, No Game \u2014 Entities Have No Lifecycle

You can spawn enemies. You can kill them. But dead slots are wasted forever. New waves require new indices. You run out of array space. The game stops spawning. Without a pool, your entity system has no lifecycle management.

## What Breaks Without This

Every wave consumes fresh array slots. Kill 5 enemies, spawn 5 more \u2014 you need 10 slots even though only 5 are alive. After enough waves, you hit the array ceiling. No more enemies. No more game. Dead memory sits unused while the allocator starves.

## The Fix

Pool = fixed array + alive flag. Spawn finds a dead slot and reuses it. No allocation in the game loop. Deterministic. Cache-friendly.

\`findFreeSlot\` does a linear scan for the first dead slot. \`spawnEnemy\` writes component data and sets alive=true. \`despawnEnemy\` sets alive=false. That is the entire lifecycle. Three functions. Zero allocations.

This is the capstone of Phase 1. Everything you have built \u2014 SoA arrays from L6, alive flags from L8, reference-based system functions from L9, loops from L7, conditionals from L8 \u2014 combines into a pool. Entities are indices. Components are parallel arrays. Systems are functions over arrays. The pool manages the lifecycle.

## The Full Lifecycle

1. **Initialize** \u2014 all 20 slots start dead
2. **Wave 1** \u2014 spawn 5 enemies using findFreeSlot (fills slots 0-4)
3. **Combat** \u2014 damageSystem kills slots 1 and 3, score +100 each
4. **Wave 2** \u2014 spawn 3 more enemies; findFreeSlot returns 1, 3 (reused!), then 5 (new)
5. **Movement** \u2014 moveSystem advances all alive enemies down by 30
6. **Render** \u2014 draw all alive entities

## Your Task

1. Write \`findFreeSlot\` \u2014 scan for first dead slot, return -1 if full
2. Write \`spawnEnemy\` \u2014 set x, y, hp, alive at given index
3. Write \`despawnEnemy\` \u2014 set alive=false
4. Spawn wave 1: 5 enemies at x=60,120,180,240,300 y=40 hp=30
5. Kill slots 1 and 3 via despawnEnemy (+100 score each)
6. Spawn wave 2: 3 enemies at x=100,200,300 y=40 hp=40 (observe slot reuse)
7. Run moveSystem with speed=30
8. Render all alive entities, output HUD and score

## Beginner Trap

**Common Mistake:** Not checking the return value of findFreeSlot. If the pool is full, it returns -1. Writing to index -1 corrupts memory before the array. Always guard: \`int idx = findFreeSlot(...); if (idx == -1) return;\`

## Elite Insight

You just built ECS v0. This is the same architecture as Unity DOTS, EnTT, and every custom engine pool allocator. The difference is scale (20 vs 100,000 entities) and optimization (linear scan vs free list). But the pattern is identical. Phase 1 complete. Everything from here builds on this foundation.

## Systems Thinking Connection

Phase 1 complete. You understand data-oriented game state. SoA layout gives cache performance. Alive flags give lifecycle control. System functions give clean separation. The pool ties it all together. This is how real engines work.

## Cross-Path Echo

The Platformer path pools platform tiles and particle effects the same way. The RPG path pools inventory items and spell effects. Every game path converges on the pool pattern.`,
  starterCode: `#include <iostream>
using namespace std;

const int POOL_SIZE = 20;

int enemy_x[POOL_SIZE];
int enemy_y[POOL_SIZE];
int enemy_hp[POOL_SIZE];
bool enemy_alive[POOL_SIZE];

// TODO: Write findFreeSlot(bool alive[], int size)
// Scan for first dead slot. Return index or -1 if full.

// TODO: Write spawnEnemy(int idx, int x, int y, int hp,
//       int ex[], int ey[], int ehp[], bool alive[])
// Write component data and set alive = true

// TODO: Write despawnEnemy(int idx, bool alive[])
// Set alive[idx] = false

void moveSystem(int ey[], bool alive[], int count, int speed) {
    for (int i = 0; i < count; i++) {
        if (alive[i]) ey[i] += speed;
    }
}

int main() {
    // Initialize pool
    for (int i = 0; i < POOL_SIZE; i++) {
        enemy_alive[i] = false;
    }

    int score = 0;

    // TODO: Wave 1 - spawn 5 enemies
    // x = 60 + i*60, y = 40, hp = 30

    // TODO: Combat - kill slots 1 and 3 (despawnEnemy)
    // Add 100 score per kill

    // TODO: Wave 2 - spawn 3 more enemies (reuse dead slots)
    // x positions: 100, 200, 300, y = 40, hp = 40

    // TODO: Run moveSystem with speed 30

    // TODO: Render all alive entities
    // ENTITY|eN|enemy|x|y|22|22|hp

    cout << "HUD|HP:100|SCORE:" << score << "|LIVES:3" << endl;
    cout << "GAME_MESSAGE|Phase 1 complete: pool active with 2 reused slots" << endl;
    cout << "SCORE|" << score << endl;

    return 0;
}
`,
  solutionCode: `#include <iostream>
using namespace std;

const int POOL_SIZE = 20;

int enemy_x[POOL_SIZE];
int enemy_y[POOL_SIZE];
int enemy_hp[POOL_SIZE];
bool enemy_alive[POOL_SIZE];

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
    // Initialize pool
    for (int i = 0; i < POOL_SIZE; i++) {
        enemy_alive[i] = false;
    }

    int score = 0;

    // Wave 1: spawn 5 enemies
    for (int i = 0; i < 5; i++) {
        int idx = findFreeSlot(enemy_alive, POOL_SIZE);
        spawnEnemy(idx, 60 + i * 60, 40, 30,
                   enemy_x, enemy_y, enemy_hp, enemy_alive);
    }

    // Combat: kill slots 1 and 3
    despawnEnemy(1, enemy_alive);
    score += 100;
    despawnEnemy(3, enemy_alive);
    score += 100;

    // Wave 2: spawn 3 more (reuses slots 1, 3, then 5)
    int wave2x[3] = {100, 200, 300};
    for (int i = 0; i < 3; i++) {
        int idx = findFreeSlot(enemy_alive, POOL_SIZE);
        spawnEnemy(idx, wave2x[i], 40, 40,
                   enemy_x, enemy_y, enemy_hp, enemy_alive);
    }

    // Movement system: all alive move down
    moveSystem(enemy_y, enemy_alive, POOL_SIZE, 30);

    // Render system
    for (int i = 0; i < POOL_SIZE; i++) {
        if (enemy_alive[i]) {
            cout << "ENTITY|e" << i << "|enemy|"
                 << enemy_x[i] << "|" << enemy_y[i]
                 << "|22|22|" << enemy_hp[i] << endl;
        }
    }

    cout << "HUD|HP:100|SCORE:" << score << "|LIVES:3" << endl;
    cout << "GAME_MESSAGE|Phase 1 complete: pool active with 2 reused slots" << endl;
    cout << "SCORE|" << score << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Slot 0: original enemy at y=70 hp=30", expectedOutput: "ENTITY\\|e0\\|enemy\\|60\\|70\\|22\\|22\\|30", isPattern: true },
    { id: "g2", description: "Slot 1: REUSED enemy at (100,70) hp=40", expectedOutput: "ENTITY\\|e1\\|enemy\\|100\\|70\\|22\\|22\\|40", isPattern: true },
    { id: "g3", description: "Slot 2: original enemy at y=70 hp=30", expectedOutput: "ENTITY\\|e2\\|enemy\\|180\\|70\\|22\\|22\\|30", isPattern: true },
    { id: "g4", description: "Slot 3: REUSED enemy at (200,70) hp=40", expectedOutput: "ENTITY\\|e3\\|enemy\\|200\\|70\\|22\\|22\\|40", isPattern: true },
    { id: "g5", description: "Slot 4: original enemy at y=70 hp=30", expectedOutput: "ENTITY\\|e4\\|enemy\\|300\\|70\\|22\\|22\\|30", isPattern: true },
    { id: "g6", description: "Slot 5: new enemy at (300,70) hp=40", expectedOutput: "ENTITY\\|e5\\|enemy\\|300\\|70\\|22\\|22\\|40", isPattern: true },
    { id: "g7", description: "HUD shows score 200", expectedOutput: "HUD\\|HP:100\\|SCORE:200\\|LIVES:3", isPattern: true },
    { id: "g8", description: "Phase 1 complete message", expectedOutput: "GAME_MESSAGE\\|Phase 1 complete: pool active with 2 reused slots", isPattern: true },
    { id: "g9", description: "Score is 200", expectedOutput: "SCORE\\|200", isPattern: true },
  ],
  hints: [
    "`findFreeSlot` scans left to right: `for (int i = 0; i < size; i++) { if (!alive[i]) return i; }` \u2014 dead slots from wave 1 kills get found first.",
    "After despawning slots 1 and 3, the next three findFreeSlot calls return 1, 3, 5 in that order. Slots 1 and 3 are reused. Slot 5 is fresh.",
    "moveSystem runs AFTER wave 2 spawns. All alive enemies (both waves) move from y=40 to y=70.",
  ],
  accumulatedCode: `#include <iostream>
using namespace std;

// === PHASE 1 COMPLETE: Entity Pool v0 ===
// L6: SoA arrays | L7: Loops | L8: Alive flags + conditionals
// L9: Reference-based system functions | L10: Pool lifecycle

const int POOL_SIZE = 20;

// --- Component arrays (SoA layout, L6) ---
int enemy_x[POOL_SIZE];
int enemy_y[POOL_SIZE];
int enemy_hp[POOL_SIZE];
bool enemy_alive[POOL_SIZE];

// --- Pool management (L10) ---
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

// --- System functions (L9: reference-based mutation) ---
void moveSystem(int ey[], bool alive[], int count, int speed) {
    for (int i = 0; i < count; i++) {
        if (alive[i]) ey[i] += speed;
    }
}

void damageSystem(int enemy_hp[], bool enemy_alive[], int count, int targetIdx, int damage) {
    enemy_hp[targetIdx] -= damage;
    if (enemy_hp[targetIdx] < 0) enemy_hp[targetIdx] = 0;
    if (enemy_hp[targetIdx] <= 0) enemy_alive[targetIdx] = false;
}

int main() {
    // Initialize pool (all dead)
    for (int i = 0; i < POOL_SIZE; i++) {
        enemy_alive[i] = false;
    }

    int score = 0;

    // --- Wave 1: spawn 5 enemies (L7: loops, L10: pool) ---
    for (int i = 0; i < 5; i++) {
        int idx = findFreeSlot(enemy_alive, POOL_SIZE);
        spawnEnemy(idx, 60 + i * 60, 40, 30,
                   enemy_x, enemy_y, enemy_hp, enemy_alive);
    }

    // --- Combat: kill slots 1, 3 (L10: despawn) ---
    despawnEnemy(1, enemy_alive);
    score += 100;
    despawnEnemy(3, enemy_alive);
    score += 100;

    // --- Wave 2: reuse dead slots (L10: pool lifecycle) ---
    int wave2x[3] = {100, 200, 300};
    for (int i = 0; i < 3; i++) {
        int idx = findFreeSlot(enemy_alive, POOL_SIZE);
        spawnEnemy(idx, wave2x[i], 40, 40,
                   enemy_x, enemy_y, enemy_hp, enemy_alive);
    }

    // --- Movement system (L9: reference mutation, L7: loops) ---
    moveSystem(enemy_y, enemy_alive, POOL_SIZE, 30);

    // --- Render system (L8: conditional filtering) ---
    for (int i = 0; i < POOL_SIZE; i++) {
        if (enemy_alive[i]) {
            cout << "ENTITY|e" << i << "|enemy|"
                 << enemy_x[i] << "|" << enemy_y[i]
                 << "|22|22|" << enemy_hp[i] << endl;
        }
    }

    cout << "HUD|HP:100|SCORE:" << score << "|LIVES:3" << endl;
    cout << "GAME_MESSAGE|Phase 1 complete: pool active with 2 reused slots" << endl;
    cout << "SCORE|" << score << endl;

    return 0;
}
`,
};
