import type { Lesson } from "@/types/lesson";

export const lesson42: Lesson = {
  id: "42-system-extraction",
  title: "System Extraction",
  description: "Extract all game logic into dedicated system functions — main becomes pure orchestration.",
  order: 42,
  xpReward: 175,
  tier: "pro",
  concepts: ["separation of concerns", "system extraction", "orchestration", "clean architecture"],
  part1: {
    title: "Concept: System Extraction",
    type: "concept",
    instructions: `# System Extraction — main() Should Not Think

A 500-line main function is a liability. Every system — movement, collision, spawning, cleanup, rendering — is tangled together. You cannot test movement without running collision. You cannot profile rendering without timing the entire frame. You cannot add a new system without reading 500 lines to find where it fits.

## The Extraction

Move each responsibility into its own function. Each function takes the arrays it needs, processes them, returns. main() becomes a loop that calls functions in order:

\\\`\\\`\\\`
for each frame:
    inputSystem();
    spawnSystem();
    moveSystem();
    collideSystem();
    damageSystem();
    cleanupSystem();
    renderSystem();
\\\`\\\`\\\`

main() is now 20 lines. Each system is isolated. You can test, profile, and modify them independently. The execution order is explicit and readable. Adding a new system means writing a function and adding one line to main.

## Pipeline Order Matters

Systems run in sequence. moveSystem before collideSystem — because you test collision on the new positions. damageSystem after collideSystem — because collisions produce damage events. cleanupSystem after damageSystem — because dead entities get removed. The order is the architecture.

## Your Task

1. Create parallel arrays for 6 entities: \\\`x[6]\\\`, \\\`y[6]\\\`, \\\`vx[6]\\\`, \\\`vy[6]\\\`, \\\`hp[6]\\\`, \\\`alive[6]\\\`
2. Initialize: all alive, hp=3, positions at (10*i, 10*i), velocities (2, 1) for each
3. Write 4 system functions:
   - \\\`moveSystem(x, y, vx, vy, alive, count)\\\` — apply velocity to alive entities
   - \\\`damageSystem(hp, alive, count)\\\` — reduce hp by 1 for entity 0 and entity 3 each call (simulating hits)
   - \\\`cleanupSystem(hp, alive, count)\\\` — set alive=false for any entity with hp <= 0
   - \\\`renderSystem(x, y, hp, alive, count, frame)\\\` — print each alive entity
4. Run 3 frames. Each frame calls: moveSystem, damageSystem, cleanupSystem, renderSystem in that order
5. After each system call, print: \\\`SYSTEM|<name>|frame|<n>\\\`
6. After renderSystem, print each alive entity: \\\`ENTITY|<i>|x|<x>|y|<y>|hp|<hp>\\\`
7. After all frames print: \\\`ORCHESTRATION|main_lines|12|system_functions|4\\\`

Expected flow: Entity 0 and 3 lose 1 hp per frame. After frame 3 they reach hp=0 and get cleaned up.`,
    starterCode: `#include <iostream>
using namespace std;

const int COUNT = 6;

int x[COUNT], y[COUNT], vx[COUNT], vy[COUNT], hp[COUNT];
bool alive[COUNT];

// TODO: Write moveSystem — for alive entities: x += vx, y += vy

// TODO: Write damageSystem — reduce hp by 1 for entity 0 and entity 3

// TODO: Write cleanupSystem — alive = false if hp <= 0

// TODO: Write renderSystem — print each alive entity

int main() {
    for (int i = 0; i < COUNT; i++) {
        x[i] = 10 * i;
        y[i] = 10 * i;
        vx[i] = 2;
        vy[i] = 1;
        hp[i] = 3;
        alive[i] = true;
    }

    // TODO: Run 3 frames
    //   Call: moveSystem, damageSystem, cleanupSystem, renderSystem
    //   Print SYSTEM|<name>|frame|<n> after each call
    //   Print alive entities after renderSystem

    // TODO: Print ORCHESTRATION summary

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

const int COUNT = 6;

int x[COUNT], y[COUNT], vx[COUNT], vy[COUNT], hp[COUNT];
bool alive[COUNT];

void moveSystem() {
    for (int i = 0; i < COUNT; i++) {
        if (!alive[i]) continue;
        x[i] += vx[i];
        y[i] += vy[i];
    }
}

void damageSystem() {
    if (alive[0]) hp[0]--;
    if (alive[3]) hp[3]--;
}

void cleanupSystem() {
    for (int i = 0; i < COUNT; i++) {
        if (alive[i] && hp[i] <= 0) {
            alive[i] = false;
        }
    }
}

void renderSystem(int frame) {
    for (int i = 0; i < COUNT; i++) {
        if (!alive[i]) continue;
        cout << "ENTITY|" << i << "|x|" << x[i] << "|y|" << y[i] << "|hp|" << hp[i] << endl;
    }
}

int main() {
    for (int i = 0; i < COUNT; i++) {
        x[i] = 10 * i;
        y[i] = 10 * i;
        vx[i] = 2;
        vy[i] = 1;
        hp[i] = 3;
        alive[i] = true;
    }

    for (int frame = 1; frame <= 3; frame++) {
        moveSystem();
        cout << "SYSTEM|move|frame|" << frame << endl;
        damageSystem();
        cout << "SYSTEM|damage|frame|" << frame << endl;
        cleanupSystem();
        cout << "SYSTEM|cleanup|frame|" << frame << endl;
        renderSystem(frame);
        cout << "SYSTEM|render|frame|" << frame << endl;
    }

    cout << "ORCHESTRATION|main_lines|12|system_functions|4" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Frame 1: move system should execute", expectedOutput: "SYSTEM|move|frame|1" },
      { id: "t2", description: "Frame 1: Entity 0 should have hp=2 after damage", expectedOutput: "ENTITY|0|x|2|y|1|hp|2" },
      { id: "t3", description: "Frame 3: Entity 0 should be dead (hp=0, cleaned up)", expectedOutput: "SYSTEM|cleanup|frame|3" },
      { id: "t4", description: "Should report orchestration summary", expectedOutput: "ORCHESTRATION|main_lines|12|system_functions|4" },
    ],
    hints: [
      "moveSystem loops all entities and applies velocity. damageSystem only touches entities 0 and 3, decrementing hp by 1 each frame.",
      "After 3 frames of damageSystem, entities 0 and 3 have hp = 3 - 3 = 0. cleanupSystem sets alive=false for hp <= 0.",
      "main() just loops 3 times calling the four systems in order. The system calls plus prints is about 12 lines.",
    ],
    estimatedMinutes: 7,
  },
  part2: {
    title: "Game: System Pipeline Architecture",
    type: "game_builder",
    instructions: `# Game Builder: System Pipeline

Extract every piece of game logic into a named system function. main() becomes an orchestrator that calls systems in pipeline order. Each system reports what it processed.

## Your Task
1. SoA arrays for 15 entities: \\\`x[]\\\`, \\\`y[]\\\`, \\\`vx[]\\\`, \\\`vy[]\\\`, \\\`hp[]\\\`, \\\`type[]\\\`, \\\`alive[]\\\`
2. Write \\\`spawnSystem()\\\` — spawn 5 enemies at x=50..210 (spacing 40), y=40, vy=4, hp=3, type=2. Spawn 10 bullets at x=60..240 (spacing 20), y=300, vy=-16, hp=1, type=1
3. Write \\\`moveSystem(count)\\\` — apply velocity to all alive entities
4. Write \\\`collisionSystem(count)\\\` — for each alive bullet vs alive enemy, check if |x[b]-x[e]| < 18 and |y[b]-y[e]| < 18. On hit: hp[b]=0, hp[e]--
5. Write \\\`damageSystem(count)\\\` — no-op (damage applied in collision), but print its name for pipeline tracking
6. Write \\\`cleanupSystem(count)\\\` — alive=false if hp<=0
7. Write \\\`renderSystem(count, frame)\\\` — count alive by type
8. main() runs spawnSystem once, then 3 frames calling: move, collision, damage, cleanup, render
9. Each system prints: \\\`SYSTEM|<name>|frame|<n>|entities_processed|<count>\\\`
10. After each frame: \\\`PIPELINE|frame|<n>|systems|6|total_entities|<alive_count>\\\`
11. After all frames: \\\`ORCHESTRATION|main_lines|12|system_functions|6\\\`
12. Print \\\`SCORE|0\\\``,
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
      { id: "t1", description: "Spawn system should process 15 entities", expectedOutput: "SYSTEM\\|spawn\\|frame\\|0\\|entities_processed\\|15", isPattern: true },
      { id: "t2", description: "Move system should report processing", expectedOutput: "SYSTEM\\|move\\|frame\\|1\\|entities_processed\\|\\d+", isPattern: true },
      { id: "t3", description: "Pipeline should report systems and entity count", expectedOutput: "PIPELINE\\|frame\\|1\\|systems\\|6\\|total_entities\\|\\d+", isPattern: true },
      { id: "t4", description: "Should report orchestration summary", expectedOutput: "ORCHESTRATION\\|main_lines\\|12\\|system_functions\\|6", isPattern: true },
      { id: "t5", description: "Should show score", expectedOutput: "SCORE\\|0", isPattern: true },
    ],
    hints: [
      "spawnSystem fills indices 0-4 with enemies and 5-14 with bullets. Return 15 as the count.",
      "collisionSystem uses proximity: abs(x[b]-x[e]) < 18 and abs(y[b]-y[e]) < 18. Compute dx and dy, negate if negative to get absolute value.",
      "Each system function returns the number of entities it processed. main() just calls them in order and prints the results.",
    ],
    estimatedMinutes: 12,
  },
};
