import type { Lesson } from "@/types/lesson";

export const lesson37: Lesson = {
  id: "37-movement-system",
  title: "Movement System",
  description: "Build a dedicated movement system that processes all entities in formation.",
  order: 37,
  xpReward: 150,
  tier: "pro",
  concepts: ["ECS systems", "batch processing", "formation patterns", "velocity components", "system architecture"],
  part1: {
    title: "Concept: System-Based Architecture",
    type: "concept",
    instructions: `# System-Based Architecture — Data and Logic Separation

In object-oriented code, each entity has its own \\\`update()\\\` method. A player updates itself. An enemy updates itself. A bullet updates itself. This scatters movement logic across every class. You cannot optimize it, cannot batch it, cannot reason about the whole picture.

Systems flip this. Instead of each entity knowing how to move, a single \\\`movementSystem()\\\` iterates **all** entities that have position and velocity. One function, one loop, all movement.

## The Pipeline

Systems run in order, each one transforming the data for the next:

\\\`\\\`\\\`
movementSystem(entities, count);  // apply velocity
boundsSystem(entities, count);    // wrap or kill out-of-bounds
renderSystem(entities, count);    // output state
\\\`\\\`\\\`

Each system reads and writes the same arrays. No entity owns its own update. The data flows through the pipeline.

## Your Task

1. Create parallel arrays for 4 entities: \\\`x[4]\\\`, \\\`y[4]\\\`, \\\`vx[4]\\\`, \\\`vy[4]\\\`, \\\`alive[4]\\\`
2. Initialize: entity 0 at (10,10) with velocity (2,0), entity 1 at (100,100) with velocity (0,-3), entity 2 at (400,50) with velocity (-5,0), entity 3 at (50,500) with velocity (0,1) — all alive
3. Write \\\`movementSystem(x, y, vx, vy, alive, count)\\\` — for each alive entity: x += vx, y += vy
4. Write \\\`boundsSystem(x, y, alive, count)\\\` — if x < 0 or x > 400 or y < 0 or y > 400, set alive = false
5. Run 3 steps: movementSystem then boundsSystem each step
6. After each step print each alive entity: \\\`ENTITY|<i>|x|<x>|y|<y>\\\`
7. After all steps print: \\\`PIPELINE|steps|3|alive|<count>\\\`

Expected output after step 1:
\\\`\\\`\\\`
STEP|1
ENTITY|0|x|12|y|10
ENTITY|1|x|100|y|97
ENTITY|2|x|395|y|50
ENTITY|3|x|50|y|501
STEP|2
ENTITY|0|x|14|y|10
ENTITY|1|x|100|y|94
ENTITY|2|x|390|y|50
STEP|3
ENTITY|0|x|16|y|10
ENTITY|1|x|100|y|91
ENTITY|2|x|385|y|50
PIPELINE|steps|3|alive|3
\\\`\\\`\\\`

Entity 3 goes to y=501 after step 1, exceeds bounds, and is killed. The remaining 3 survive all steps.`,
    starterCode: `#include <iostream>
using namespace std;

// TODO: Write movementSystem(x[], y[], vx[], vy[], alive[], count)
//       For each alive entity: x += vx, y += vy

// TODO: Write boundsSystem(x[], y[], alive[], count)
//       If x<0 or x>400 or y<0 or y>400, set alive=false

int main() {
    const int COUNT = 4;
    int x[] = {10, 100, 400, 50};
    int y[] = {10, 100, 50, 500};
    int vx[] = {2, 0, -5, 0};
    int vy[] = {0, -3, 0, 1};
    bool alive[] = {true, true, true, true};

    // TODO: Run 3 steps of movementSystem -> boundsSystem
    // After each step, print STEP|<n> then each alive entity
    // After all steps, count alive and print PIPELINE summary

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

void movementSystem(int x[], int y[], int vx[], int vy[], bool alive[], int count) {
    for (int i = 0; i < count; i++) {
        if (alive[i]) {
            x[i] += vx[i];
            y[i] += vy[i];
        }
    }
}

void boundsSystem(int x[], int y[], bool alive[], int count) {
    for (int i = 0; i < count; i++) {
        if (alive[i]) {
            if (x[i] < 0 || x[i] > 400 || y[i] < 0 || y[i] > 400) {
                alive[i] = false;
            }
        }
    }
}

int main() {
    const int COUNT = 4;
    int x[] = {10, 100, 400, 50};
    int y[] = {10, 100, 50, 500};
    int vx[] = {2, 0, -5, 0};
    int vy[] = {0, -3, 0, 1};
    bool alive[] = {true, true, true, true};

    for (int step = 1; step <= 3; step++) {
        movementSystem(x, y, vx, vy, alive, COUNT);
        boundsSystem(x, y, alive, COUNT);
        cout << "STEP|" << step << endl;
        for (int i = 0; i < COUNT; i++) {
            if (alive[i]) {
                cout << "ENTITY|" << i << "|x|" << x[i] << "|y|" << y[i] << endl;
            }
        }
    }

    int aliveCount = 0;
    for (int i = 0; i < COUNT; i++) {
        if (alive[i]) aliveCount++;
    }
    cout << "PIPELINE|steps|3|alive|" << aliveCount << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Step 1: Entity 0 should be at (12,10)", expectedOutput: "ENTITY|0|x|12|y|10" },
      { id: "t2", description: "Step 1: Entity 3 should be killed (y=501 > 400)", expectedOutput: "STEP|2\nENTITY|0", isPattern: false },
      { id: "t3", description: "Step 3: Entity 2 should be at (385,50)", expectedOutput: "ENTITY|2|x|385|y|50" },
      { id: "t4", description: "Should report 3 alive entities after pipeline", expectedOutput: "PIPELINE|steps|3|alive|3" },
    ],
    hints: [
      "movementSystem loops all entities, checks alive, then applies `x[i] += vx[i]` and `y[i] += vy[i]`.",
      "boundsSystem checks if any coordinate is outside 0-400. Entity 3 starts at y=500, moves to y=501 — immediately out of bounds.",
      "Run movementSystem first, then boundsSystem, then print. This is the system pipeline order.",
    ],
    estimatedMinutes: 7,
  },
  part2: {
    title: "Game: Movement System Pipeline",
    type: "game_builder",
    instructions: `# Game Builder: Movement System Pipeline

Build dedicated systems that process all entities in batch. movementSystem handles velocity. formationSystem adds sine-wave offsets to enemies. boundsSystem kills out-of-bounds bullets. This is the systems.h architecture — data flows through a pipeline of pure functions.

## Your Task
1. SoA arrays for 10 entities: x[], y[], vx[], vy[], type[] (1=bullet, 2=enemy), alive[]
2. Spawn 5 bullets at x=200, y=300..284 (spacing 4), vx=0, vy=-16
3. Spawn 5 enemies at x=80..240 (spacing 40), y=60, vx=0, vy=4
4. Write \\\`movementSystem(count)\\\` — for each alive: x += vx, y += vy
5. Write \\\`formationSystem(count, step)\\\` — for each alive enemy, add a sine-wave x offset: offsets cycle through [0, 10, 0, -10, 0] based on (entity_index + step) % 5. Apply offset to x.
6. Write \\\`boundsSystem(count)\\\` — if bullet y < 0, set alive = false
7. Run 5 simulation steps. After each step print:
   - Each alive entity: \\\`MOVE|step|<s>|entity|<type>_<i>|x|<x>|y|<y>\\\`
   - Formation info: \\\`FORMATION|step|<s>|enemy_spread|<max_x - min_x among alive enemies>|pattern|sine\\\`
   - Active count: \\\`ACTIVE|step|<s>|bullets|<count>|enemies|<count>\\\`
8. Print \\\`SCORE|0\\\` at end`,
    starterCode: `#include <iostream>
using namespace std;

const int MAX_ENTITIES = 10;

int x[MAX_ENTITIES];
int y[MAX_ENTITIES];
int vx[MAX_ENTITIES];
int vy[MAX_ENTITIES];
int type[MAX_ENTITIES];  // 1=bullet, 2=enemy
bool alive[MAX_ENTITIES];

// TODO: Write movementSystem(count) — for each alive: x += vx, y += vy

// TODO: Write formationSystem(count, step) — for alive enemies,
//       apply sine offset: offsets[] = {0, 10, 0, -10, 0}
//       index into offsets using (entity_index + step) % 5

// TODO: Write boundsSystem(count) — bullets with y < 0 become not alive

int main() {
    int count = 0;

    // TODO: Spawn 5 bullets at x=200, y=300,296,292,288,284, vy=-16
    // TODO: Spawn 5 enemies at x=80,120,160,200,240, y=60, vy=4

    // TODO: Run 5 steps: movement -> formation -> bounds -> print

    // TODO: Print SCORE|0

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAX_ENTITIES = 10;

int x[MAX_ENTITIES];
int y[MAX_ENTITIES];
int vx[MAX_ENTITIES];
int vy[MAX_ENTITIES];
int type[MAX_ENTITIES];
bool alive[MAX_ENTITIES];

void movementSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        x[i] += vx[i];
        y[i] += vy[i];
    }
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
        if (type[i] == 1 && y[i] < 0) {
            alive[i] = false;
        }
    }
}

int main() {
    int count = 0;

    for (int i = 0; i < 5; i++) {
        x[count] = 200;
        y[count] = 300 - i * 4;
        vx[count] = 0;
        vy[count] = -16;
        type[count] = 1;
        alive[count] = true;
        count++;
    }

    for (int i = 0; i < 5; i++) {
        x[count] = 80 + i * 40;
        y[count] = 60;
        vx[count] = 0;
        vy[count] = 4;
        type[count] = 2;
        alive[count] = true;
        count++;
    }

    for (int step = 1; step <= 5; step++) {
        movementSystem(count);
        formationSystem(count, step);
        boundsSystem(count);

        int bulletCount = 0;
        int enemyCount = 0;
        int enemyMinX = 9999;
        int enemyMaxX = -1;

        for (int i = 0; i < count; i++) {
            if (!alive[i]) continue;
            string label = (type[i] == 1) ? "bullet" : "enemy";
            cout << "MOVE|step|" << step << "|entity|" << label << "_" << i
                 << "|x|" << x[i] << "|y|" << y[i] << endl;
            if (type[i] == 1) bulletCount++;
            if (type[i] == 2) {
                enemyCount++;
                if (x[i] < enemyMinX) enemyMinX = x[i];
                if (x[i] > enemyMaxX) enemyMaxX = x[i];
            }
        }

        int spread = (enemyCount > 0) ? (enemyMaxX - enemyMinX) : 0;
        cout << "FORMATION|step|" << step << "|enemy_spread|" << spread << "|pattern|sine" << endl;
        cout << "ACTIVE|step|" << step << "|bullets|" << bulletCount << "|enemies|" << enemyCount << endl;
    }

    cout << "SCORE|0" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Step 1: Should show bullet movement", expectedOutput: "MOVE\\|step\\|1\\|entity\\|bullet_0\\|x\\|200\\|y\\|284", isPattern: true },
      { id: "t2", description: "Step 1: Should show enemy movement with formation", expectedOutput: "MOVE\\|step\\|1\\|entity\\|enemy_\\d+\\|x\\|\\d+\\|y\\|64", isPattern: true },
      { id: "t3", description: "Step 1: Should show formation spread", expectedOutput: "FORMATION\\|step\\|1\\|enemy_spread\\|\\d+\\|pattern\\|sine", isPattern: true },
      { id: "t4", description: "Step 1: Should show active counts", expectedOutput: "ACTIVE\\|step\\|1\\|bullets\\|5\\|enemies\\|5", isPattern: true },
      { id: "t5", description: "Later steps: Some bullets should die from bounds", expectedOutput: "ACTIVE\\|step\\|5\\|bullets\\|\\d+\\|enemies\\|5", isPattern: true },
      { id: "t6", description: "Should show score", expectedOutput: "SCORE\\|0", isPattern: true },
    ],
    hints: [
      "Spawn bullets at indices 0-4, enemies at indices 5-9. Bullets: x=200, y=300-(i*4), vy=-16. Enemies: x=80+(i*40), y=60, vy=4.",
      "formationSystem uses offsets[] = {0, 10, 0, -10, 0}. Index with (i + step) % 5. This creates a cycling sine-like wave pattern.",
      "boundsSystem: only bullets (type==1) with y < 0 die. At vy=-16, bullet_0 starts at y=300 and reaches y<0 after ~19 steps, so all 5 survive the first few steps.",
    ],
    estimatedMinutes: 10,
  },
};
