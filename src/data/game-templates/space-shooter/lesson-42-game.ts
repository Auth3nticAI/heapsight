import type { GameLessonVariant } from "@/types/game";

export const lesson42SpaceShooter: GameLessonVariant = {
  lessonId: "42-system-extraction",
  instructions: `# System Extraction — main() Is a 500-Line Monster

Your game works. Movement, collision, spawning, cleanup, rendering — all in main(). One function does everything. You cannot test collision without running movement. You cannot profile rendering without timing the whole frame. Adding a new feature means scrolling through 500 lines to find the right spot. This does not scale.

## What Breaks Without This

Every new feature increases the blast radius of every bug. A collision change breaks rendering because they share local variables. A spawning change breaks cleanup because the loop bounds shifted. Code review is impossible — the reviewer must hold the entire 500-line function in their head. The codebase becomes write-only.

## The Fix

Extract each responsibility into its own function. spawnSystem handles creation. moveSystem handles velocity. collisionSystem handles hit detection. damageSystem handles HP. cleanupSystem handles death. renderSystem handles output. Each system reads the SoA arrays, does its job, returns.

main() becomes:

\\\`\\\`\\\`
spawnSystem();
for each frame:
    moveSystem(count);
    collisionSystem(count);
    damageSystem(count);
    cleanupSystem(count);
    renderSystem(count, frame);
\\\`\\\`\\\`

Twelve lines. Pure orchestration. The execution order is the architecture, visible at a glance. Adding a new system is one function and one line in main.

## Your Task

1. SoA arrays for 15 entities: \\\`x[]\\\`, \\\`y[]\\\`, \\\`vx[]\\\`, \\\`vy[]\\\`, \\\`hp[]\\\`, \\\`type[]\\\`, \\\`alive[]\\\`
2. \\\`spawnSystem()\\\`: 5 enemies at x=50..210 (spacing 40), y=40, vy=4, hp=3. 10 bullets at x=60..240 (spacing 20), y=300, vy=-16, hp=1
3. \\\`moveSystem(count)\\\`: apply velocity to alive entities
4. \\\`collisionSystem(count)\\\`: bullet vs enemy, |dx| < 18 and |dy| < 18 means hit. hp[b]=0, hp[e]--
5. \\\`damageSystem(count)\\\`: scan alive entities (placeholder — damage applied in collision)
6. \\\`cleanupSystem(count)\\\`: alive=false where hp<=0
7. \\\`renderSystem(count, frame)\\\`: count alive entities
8. Run spawn once, then 3 frames. Each system prints: \\\`SYSTEM|<name>|frame|<n>|entities_processed|<count>\\\`
9. After each frame: \\\`PIPELINE|frame|<n>|systems|6|total_entities|<alive>\\\`
10. End: \\\`ORCHESTRATION|main_lines|12|system_functions|6\\\`
11. Print \\\`SCORE|0\\\`

## Beginner Trap

**Common Mistake:** Passing data between systems via return values or local variables. Systems should read and write the global SoA arrays directly. The arrays ARE the shared state. Each system mutates the arrays and the next system sees the changes. No return values needed for data flow — only for diagnostics like entity counts.

## Elite Insight

This is the core of every ECS engine. Unity DOTS, Bevy, EnTT — all structure code as systems that iterate component arrays. The key insight: systems are functions, components are arrays, entities are indices. No objects. No inheritance. Just data and functions that transform it. The architecture is a flat pipeline, not a hierarchy.

## Cross-Path Echo

Unix process management works identically. The kernel runs a scheduler (orchestrator) that calls subsystems in order: timer interrupts, I/O completion, process scheduling, memory management. Each subsystem operates on shared kernel data structures. The main loop is tiny. The subsystems are independent.`,
  starterCode: `#include <iostream>
using namespace std;

const int MAX_ENTITIES = 20;

int x[MAX_ENTITIES], y[MAX_ENTITIES];
int vx[MAX_ENTITIES], vy[MAX_ENTITIES];
int hp[MAX_ENTITIES], type[MAX_ENTITIES];
bool alive[MAX_ENTITIES];
int entityCount = 0;

// TODO: Write spawnSystem() — spawn 5 enemies and 10 bullets, return total count

// TODO: Write moveSystem(count) — apply velocity to alive entities

// TODO: Write collisionSystem(count) — bullet vs enemy proximity check

// TODO: Write damageSystem(count) — pipeline placeholder

// TODO: Write cleanupSystem(count) — kill entities with hp <= 0

// TODO: Write renderSystem(count, frame) — count alive entities

int main() {
    // TODO: Call spawnSystem once
    // TODO: Run 3 frames calling all systems in order
    //       Print SYSTEM and PIPELINE lines
    // TODO: Print ORCHESTRATION and SCORE

    return 0;
}
`,
  solutionCode: `#include <iostream>
using namespace std;

const int MAX_ENTITIES = 20;

int x[MAX_ENTITIES], y[MAX_ENTITIES];
int vx[MAX_ENTITIES], vy[MAX_ENTITIES];
int hp[MAX_ENTITIES], type[MAX_ENTITIES];
bool alive[MAX_ENTITIES];
int entityCount = 0;

int spawnSystem() {
    int count = 0;
    for (int i = 0; i < 5; i++) {
        x[count] = 50 + i * 40;
        y[count] = 40;
        vx[count] = 0;
        vy[count] = 4;
        hp[count] = 3;
        type[count] = 2;
        alive[count] = true;
        count++;
    }
    for (int i = 0; i < 10; i++) {
        x[count] = 60 + i * 20;
        y[count] = 300;
        vx[count] = 0;
        vy[count] = -16;
        hp[count] = 1;
        type[count] = 1;
        alive[count] = true;
        count++;
    }
    return count;
}

int moveSystem(int count) {
    int processed = 0;
    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        x[i] += vx[i];
        y[i] += vy[i];
        processed++;
    }
    return processed;
}

int collisionSystem(int count) {
    int processed = 0;
    for (int b = 0; b < count; b++) {
        if (!alive[b] || type[b] != 1) continue;
        for (int e = 0; e < count; e++) {
            if (!alive[e] || type[e] != 2) continue;
            processed++;
            int dx = x[b] - x[e];
            int dy = y[b] - y[e];
            if (dx < 0) dx = -dx;
            if (dy < 0) dy = -dy;
            if (dx < 18 && dy < 18) {
                hp[b] = 0;
                hp[e]--;
                break;
            }
        }
    }
    return processed;
}

int damageSystem(int count) {
    int processed = 0;
    for (int i = 0; i < count; i++) {
        if (alive[i]) processed++;
    }
    return processed;
}

int cleanupSystem(int count) {
    int processed = 0;
    for (int i = 0; i < count; i++) {
        if (alive[i] && hp[i] <= 0) {
            alive[i] = false;
            processed++;
        }
    }
    return processed;
}

int renderSystem(int count, int frame) {
    int aliveCount = 0;
    for (int i = 0; i < count; i++) {
        if (alive[i]) aliveCount++;
    }
    return aliveCount;
}

int main() {
    entityCount = spawnSystem();
    cout << "SYSTEM|spawn|frame|0|entities_processed|" << entityCount << endl;

    for (int frame = 1; frame <= 3; frame++) {
        int moved = moveSystem(entityCount);
        cout << "SYSTEM|move|frame|" << frame << "|entities_processed|" << moved << endl;

        int collided = collisionSystem(entityCount);
        cout << "SYSTEM|collision|frame|" << frame << "|entities_processed|" << collided << endl;

        int damaged = damageSystem(entityCount);
        cout << "SYSTEM|damage|frame|" << frame << "|entities_processed|" << damaged << endl;

        int cleaned = cleanupSystem(entityCount);
        cout << "SYSTEM|cleanup|frame|" << frame << "|entities_processed|" << cleaned << endl;

        int aliveCount = renderSystem(entityCount, frame);
        cout << "SYSTEM|render|frame|" << frame << "|entities_processed|" << aliveCount << endl;

        cout << "PIPELINE|frame|" << frame << "|systems|6|total_entities|" << aliveCount << endl;
    }

    cout << "ORCHESTRATION|main_lines|12|system_functions|6" << endl;
    cout << "SCORE|0" << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Spawn system should initialize 15 entities", expectedOutput: "SYSTEM\\|spawn\\|frame\\|0\\|entities_processed\\|15", isPattern: true },
    { id: "g2", description: "Move system should process entities each frame", expectedOutput: "SYSTEM\\|move\\|frame\\|1\\|entities_processed\\|\\d+", isPattern: true },
    { id: "g3", description: "Pipeline should report per-frame summary", expectedOutput: "PIPELINE\\|frame\\|\\d+\\|systems\\|6\\|total_entities\\|\\d+", isPattern: true },
    { id: "g4", description: "Should report orchestration stats", expectedOutput: "ORCHESTRATION\\|main_lines\\|12\\|system_functions\\|6", isPattern: true },
    { id: "g5", description: "Should show final score", expectedOutput: "SCORE\\|0", isPattern: true },
  ],
  hints: [
    "spawnSystem fills indices 0-4 as enemies (type=2, vy=4, hp=3) and indices 5-14 as bullets (type=1, vy=-16, hp=1). Returns 15.",
    "collisionSystem: for each alive bullet, loop alive enemies. Compute absolute dx and dy. If both < 18, hit: set hp[b]=0, hp[e]--, break inner loop.",
    "Each system returns the number of entities it touched. main() captures that count and prints it. The pipeline order is: move, collision, damage, cleanup, render.",
  ],
  accumulatedCode: `#include <iostream>
using namespace std;

const int POOL_SIZE = 600;
const int FIXED_DT = 16;

int x[POOL_SIZE], y[POOL_SIZE];
int w[POOL_SIZE], h[POOL_SIZE];
int vx[POOL_SIZE], vy[POOL_SIZE];
int hp[POOL_SIZE], type[POOL_SIZE];
bool alive[POOL_SIZE];

bool checkAABB(int ax, int ay, int aw, int ah, int bx, int by, int bw, int bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

int spawnSystem(int count) {
    for (int i = 0; i < 5; i++) {
        x[count] = 80 + i * 40;
        y[count] = 60;
        w[count] = 20;
        h[count] = 20;
        vx[count] = 0;
        vy[count] = 4;
        hp[count] = 3;
        type[count] = 2;
        alive[count] = true;
        count++;
    }
    for (int i = 0; i < 5; i++) {
        x[count] = 200;
        y[count] = 300 - i * 4;
        w[count] = 6;
        h[count] = 6;
        vx[count] = 0;
        vy[count] = -16;
        hp[count] = 1;
        type[count] = 1;
        alive[count] = true;
        count++;
    }
    return count;
}

int moveSystem(int count) {
    int processed = 0;
    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        x[i] += vx[i];
        y[i] += vy[i];
        processed++;
    }
    return processed;
}

void formationSystem(int count, int step) {
    int offsets[] = {0, 10, 0, -10, 0};
    for (int i = 0; i < count; i++) {
        if (!alive[i] || type[i] != 2) continue;
        x[i] += offsets[(i + step) % 5];
    }
}

void boundsSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        if (type[i] == 1 && y[i] < 0) alive[i] = false;
    }
}

int collisionSystem(int count) {
    int hits = 0;
    for (int b = 0; b < count; b++) {
        if (!alive[b] || type[b] != 1) continue;
        for (int e = 0; e < count; e++) {
            if (!alive[e] || type[e] != 2) continue;
            if (checkAABB(x[b], y[b], w[b], h[b], x[e], y[e], w[e], h[e])) {
                hp[b] = 0;
                hp[e]--;
                hits++;
                break;
            }
        }
    }
    return hits;
}

int cleanupSystem(int count) {
    int cleaned = 0;
    for (int i = 0; i < count; i++) {
        if (alive[i] && hp[i] <= 0) {
            alive[i] = false;
            cleaned++;
        }
    }
    return cleaned;
}

int countByType(int count, int typeVal) {
    int c = 0;
    for (int i = 0; i < count; i++) {
        if (alive[i] && type[i] == typeVal) c++;
    }
    return c;
}

int main() {
    int count = 0;
    count = spawnSystem(count);

    int accumulator = 0;
    int totalSteps = 0;
    int frameTimes[] = {16, 32, 16};

    for (int f = 0; f < 3; f++) {
        accumulator += frameTimes[f];
        int stepsThisFrame = 0;
        while (accumulator >= FIXED_DT) {
            moveSystem(count);
            formationSystem(count, totalSteps + 1);
            boundsSystem(count);
            collisionSystem(count);
            cleanupSystem(count);
            accumulator -= FIXED_DT;
            stepsThisFrame++;
            totalSteps++;
        }
        int bullets = countByType(count, 1);
        int enemies = countByType(count, 2);
        cout << "FRAME|" << (f + 1) << "|steps|" << stepsThisFrame
             << "|bullets|" << bullets << "|enemies|" << enemies << endl;
    }

    cout << "PIPELINE|spawn|move|formation|bounds|collision|cleanup" << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
};
