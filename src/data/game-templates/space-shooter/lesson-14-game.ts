import type { GameLessonVariant } from "@/types/game";

export const lesson14SpaceShooter: GameLessonVariant = {
  lessonId: "14-dynamic-arrays",
  instructions: `# Capacity Overflow — Your Pool Silently Drops Enemies

Your fixed pool of 20 slots worked for small waves. Now the game designer wants 3 waves of 8 enemies each. 24 total. 20 slots. Four enemies never spawn. No error. No crash. The player just sees a weaker wave 3 and thinks the game is broken.

## What Breaks Without This

Wave 3 calls findFreeSlot 8 times. First 4 succeed (slots freed by earlier kills are exhausted, remaining slots fill). Last 4 return -1. If you don't check, you write to index -1 — memory corruption. If you do check and skip, enemies silently vanish. Either way, the game is wrong.

## The Fix

Upgrade capacity to 32. Track \`count\` alongside \`capacity\`. Every spawn increments count. Every despawn decrements it. Before spawning, check \`count < capacity\`. After each wave, log utilization: \`count/capacity\`. This is monitoring. You can't fix what you can't see.

The pool arrays grow from 20 to 32 slots. Memory cost: 12 extra entities * ~13 bytes each = 156 bytes. Invisible. The benefit: your game handles 3 full waves plus headroom for powerups and boss minions.

Spawn all 3 waves. Run moveSystem to advance enemies down by 20. Render all 24 alive entities. Output pool utilization as a percentage. 24/32 = 75%. Healthy. Room to grow.

## Your Task

1. Set up a 32-slot pool with SoA arrays
2. Spawn wave 1: 8 enemies at x = 40 + i*40, y = 40, hp = 30
3. Spawn wave 2: 8 more enemies continuing the x pattern
4. Spawn wave 3: 8 more enemies continuing the x pattern
5. Run moveSystem with speed 20 (all enemies move to y=60)
6. Render all alive entities: \`ENTITY|eN|enemy|x|60|22|22|30\`
7. Output \`GAME_MESSAGE|Pool: 24/32 used (75%)\`
8. Output \`SCORE|0\`

## Beginner Trap

**Common Mistake:** Assuming findFreeSlot always succeeds. In a 20-slot pool with 20 alive entities, findFreeSlot returns -1. Writing to \`posX[-1]\` overwrites whatever sits before the array in memory. Always guard: \`if (idx == -1) return;\`

## Elite Insight

std::vector solves this with automatic reallocation. But automatic growth means unpredictable frame time — one frame takes 10x longer because it triggered a realloc+copy. Game engines use fixed pools with known capacity because predictable performance matters more than convenience.

## Systems Thinking Connection

Pool capacity is a design constraint, not a code detail. It determines maximum entity count, which determines maximum wave size, which determines game difficulty. One number ripples through the entire design.

## Skill Reinforcement

Uses findFreeSlot and spawnEnemy from L10, moveSystem from L9, SoA arrays from L6. The pool pattern is unchanged — only the capacity number grew.

## Mastery Check

At 75% utilization with capacity 32, how many more enemies can spawn before overflow? 8. If your boss spawns 12 minions at once, do you need to increase capacity? Yes — to at least 36.`,
  starterCode: `#include <iostream>
using namespace std;

const int CAPACITY = 32;

int posX[CAPACITY];
int posY[CAPACITY];
int hp[CAPACITY];
bool alive[CAPACITY];

int findFreeSlot(bool alive[], int size) {
    for (int i = 0; i < size; i++) {
        if (!alive[i]) return i;
    }
    return -1;
}

void spawnEnemy(int idx, int x, int y, int health,
                int px[], int py[], int h[], bool a[]) {
    px[idx] = x;
    py[idx] = y;
    h[idx] = health;
    a[idx] = true;
}

void moveSystem(int py[], bool alive[], int capacity, int speed) {
    for (int i = 0; i < capacity; i++) {
        if (alive[i]) py[i] += speed;
    }
}

int main() {
    for (int i = 0; i < CAPACITY; i++) alive[i] = false;

    int count = 0;

    // TODO: Spawn wave 1 - 8 enemies at x = 40 + i*40, y = 40, hp = 30

    // TODO: Spawn wave 2 - 8 more enemies

    // TODO: Spawn wave 3 - 8 more enemies

    // TODO: Run moveSystem with speed 20

    // TODO: Render all alive entities
    // ENTITY|eN|enemy|x|y|22|22|hp

    // TODO: Print utilization message and score

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

int findFreeSlot(bool alive[], int size) {
    for (int i = 0; i < size; i++) {
        if (!alive[i]) return i;
    }
    return -1;
}

void spawnEnemy(int idx, int x, int y, int health,
                int px[], int py[], int h[], bool a[]) {
    px[idx] = x;
    py[idx] = y;
    h[idx] = health;
    a[idx] = true;
}

void moveSystem(int py[], bool alive[], int capacity, int speed) {
    for (int i = 0; i < capacity; i++) {
        if (alive[i]) py[i] += speed;
    }
}

int main() {
    for (int i = 0; i < CAPACITY; i++) alive[i] = false;

    int count = 0;

    // Wave 1: 8 enemies
    for (int i = 0; i < 8; i++) {
        int idx = findFreeSlot(alive, CAPACITY);
        if (idx != -1) {
            spawnEnemy(idx, 40 + i * 40, 40, 30, posX, posY, hp, alive);
            count++;
        }
    }

    // Wave 2: 8 more
    for (int i = 0; i < 8; i++) {
        int idx = findFreeSlot(alive, CAPACITY);
        if (idx != -1) {
            spawnEnemy(idx, 40 + (8 + i) * 40, 40, 30, posX, posY, hp, alive);
            count++;
        }
    }

    // Wave 3: 8 more
    for (int i = 0; i < 8; i++) {
        int idx = findFreeSlot(alive, CAPACITY);
        if (idx != -1) {
            spawnEnemy(idx, 40 + (16 + i) * 40, 40, 30, posX, posY, hp, alive);
            count++;
        }
    }

    // Movement
    moveSystem(posY, alive, CAPACITY, 20);

    // Render
    for (int i = 0; i < CAPACITY; i++) {
        if (alive[i]) {
            cout << "ENTITY|e" << i << "|enemy|"
                 << posX[i] << "|" << posY[i]
                 << "|22|22|" << hp[i] << endl;
        }
    }

    int utilization = (count * 100) / CAPACITY;
    cout << "GAME_MESSAGE|Pool: " << count << "/" << CAPACITY
         << " used (" << utilization << "%)" << endl;
    cout << "SCORE|0" << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Should render first enemy at y=60", expectedOutput: "ENTITY\\|e0\\|enemy\\|40\\|60\\|22\\|22\\|30", isPattern: true },
    { id: "g2", description: "Should render last enemy (slot 23)", expectedOutput: "ENTITY\\|e23\\|enemy", isPattern: true },
    { id: "g3", description: "Should show 75% pool utilization", expectedOutput: "GAME_MESSAGE\\|Pool: 24/32 used \\(75%\\)", isPattern: true },
    { id: "g4", description: "Should show score", expectedOutput: "SCORE\\|0", isPattern: true },
  ],
  hints: [
    "Each wave is a loop of 8: `for (int i = 0; i < 8; i++) { int idx = findFreeSlot(alive, CAPACITY); ... }`",
    "Guard every spawn with `if (idx != -1)`. Increment `count` only on successful spawn.",
    "Wave 2 x positions continue: `40 + (8 + i) * 40`. Wave 3: `40 + (16 + i) * 40`.",
  ],
  accumulatedCode: `#include <iostream>
using namespace std;

// === L14: Dynamic Arrays — capacity upgraded to 32 ===
// L6: SoA arrays | L7: Loops | L8: Alive flags
// L9: System functions | L10: Pool lifecycle | L14: Capacity planning

const int CAPACITY = 32;

// --- Component arrays (SoA layout) ---
int posX[CAPACITY];
int posY[CAPACITY];
int hp[CAPACITY];
bool alive[CAPACITY];

// --- Pool management ---
int findFreeSlot(bool alive[], int size) {
    for (int i = 0; i < size; i++) {
        if (!alive[i]) return i;
    }
    return -1;
}

void spawnEnemy(int idx, int x, int y, int health,
                int px[], int py[], int h[], bool a[]) {
    px[idx] = x;
    py[idx] = y;
    h[idx] = health;
    a[idx] = true;
}

void despawnEnemy(int idx, bool a[]) {
    a[idx] = false;
}

// --- System functions ---
void moveSystem(int py[], bool alive[], int capacity, int speed) {
    for (int i = 0; i < capacity; i++) {
        if (alive[i]) py[i] += speed;
    }
}

void damageSystem(int hp[], bool alive[], int capacity, int targetIdx, int damage) {
    hp[targetIdx] -= damage;
    if (hp[targetIdx] < 0) hp[targetIdx] = 0;
    if (hp[targetIdx] <= 0) alive[targetIdx] = false;
}

int main() {
    for (int i = 0; i < CAPACITY; i++) alive[i] = false;

    int count = 0;

    // Spawn 3 waves of 8 (24 total, 75% utilization)
    for (int w = 0; w < 3; w++) {
        for (int i = 0; i < 8; i++) {
            int idx = findFreeSlot(alive, CAPACITY);
            if (idx != -1) {
                spawnEnemy(idx, 40 + (w * 8 + i) * 40, 40, 30,
                           posX, posY, hp, alive);
                count++;
            }
        }
    }

    // Movement
    moveSystem(posY, alive, CAPACITY, 20);

    // Render
    for (int i = 0; i < CAPACITY; i++) {
        if (alive[i]) {
            cout << "ENTITY|e" << i << "|enemy|"
                 << posX[i] << "|" << posY[i]
                 << "|22|22|" << hp[i] << endl;
        }
    }

    int utilization = (count * 100) / CAPACITY;
    cout << "GAME_MESSAGE|Pool: " << count << "/" << CAPACITY
         << " used (" << utilization << "%)" << endl;
    cout << "SCORE|0" << endl;

    return 0;
}
`,
};
