import type { GameLessonVariant } from "@/types/game";

export const lesson37SpaceShooter: GameLessonVariant = {
  lessonId: "37-movement-system",
  instructions: `# Movement System — Entities Do Not Move Themselves

Object-oriented instinct says put an \\\`update()\\\` method on every entity. The entity knows its velocity, applies it, done. This scatters movement logic across every type. Bullet::update, Enemy::update, Particle::update — three functions doing the same x += vx operation. Three places to introduce bugs. Three places the compiler cannot auto-vectorize because it cannot prove the data is contiguous.

## What Breaks Without This

Without a centralized movement system, adding a new entity type means writing a new update method. Changing movement behavior means editing every class. Profiling movement means instrumenting every class. The codebase does not scale. At 50 entity types, you have 50 update methods doing the same arithmetic on scattered memory.

## The Fix

One function. One loop. All movement. \\\`movementSystem()\\\` iterates the SoA arrays. For every alive entity, x += vx, y += vy. That is it. No type checking. No virtual dispatch. One cache-friendly sweep through contiguous memory. The CPU prefetcher predicts every access.

\\\`formationSystem()\\\` is a second pass. It only touches enemies. A sine-wave offset table — \\\`[0, 10, 0, -10, 0]\\\` — cycles per entity and per step, creating a weaving formation pattern. The offset is additive on top of base movement. Two systems compose without coupling.

\\\`boundsSystem()\\\` is the third pass. Bullets past y < 0 get \\\`alive = false\\\`. The slot stays in the pool. No deallocation. No fragmentation. The entity is just skipped on the next frame.

The pipeline is: movement, formation, bounds, render. Each system reads the arrays, writes the arrays, passes control to the next. This is the ECS systems pattern stripped to its core.

## Your Task

1. SoA arrays for 10 entities: \\\`x[]\\\`, \\\`y[]\\\`, \\\`vx[]\\\`, \\\`vy[]\\\`, \\\`type[]\\\` (1=bullet, 2=enemy), \\\`alive[]\\\`
2. Spawn 5 bullets at x=200, y=300/296/292/288/284, vx=0, vy=-16
3. Spawn 5 enemies at x=80/120/160/200/240, y=60, vx=0, vy=4
4. Write \\\`movementSystem(count)\\\`: for each alive entity, x += vx, y += vy
5. Write \\\`formationSystem(count, step)\\\`: for alive enemies, \\\`x += offsets[(i + step) % 5]\\\` where offsets = [0, 10, 0, -10, 0]
6. Write \\\`boundsSystem(count)\\\`: bullets with y < 0 get alive = false
7. Run 5 steps. After each step print:
   - Each alive entity: \\\`MOVE|step|<s>|entity|<type>_<i>|x|<x>|y|<y>\\\`
   - Formation: \\\`FORMATION|step|<s>|enemy_spread|<max_x - min_x>|pattern|sine\\\`
   - Counts: \\\`ACTIVE|step|<s>|bullets|<n>|enemies|<n>\\\`
8. End with \\\`SCORE|0\\\`

## Beginner Trap

**Common Mistake:** Applying the formation offset to vx instead of x. The formation system adds a per-frame positional offset, not a permanent velocity change. If you modify vx, the offset compounds every frame and enemies fly off screen. Add the offset directly to x each frame.

## Elite Insight

This is the S in ECS — Systems. Components are the data (x, y, vx, vy). Entities are the indices. Systems are the functions that iterate. The entire architecture is: arrays of data, indexed by integer, processed by functions. No inheritance. No polymorphism. No virtual tables. Just data and loops. This is how Overwatch, Minecraft Bedrock, and every data-oriented engine processes entities.

## Cross-Path Echo

Unix pipes are the same architecture. \\\`cat file | grep pattern | sort | uniq\\\` — each command is a system. Data flows through. No command knows about the others. Each one transforms and passes. The composability comes from the shared data format, not from coupling.`,
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

// TODO: Write formationSystem(count, step)
//       For alive enemies (type==2):
//       offsets[] = {0, 10, 0, -10, 0}
//       x[i] += offsets[(i + step) % 5]

// TODO: Write boundsSystem(count) — bullets with y < 0 become not alive

int main() {
    int count = 0;

    // TODO: Spawn 5 bullets: x=200, y=300,296,292,288,284, vx=0, vy=-16
    // TODO: Spawn 5 enemies: x=80,120,160,200,240, y=60, vx=0, vy=4

    // TODO: Run 5 steps: movement -> formation -> bounds
    //       Print MOVE lines, FORMATION line, ACTIVE line per step

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
    { id: "g1", description: "Step 1: Should show bullet_0 at y=284", expectedOutput: "MOVE\\|step\\|1\\|entity\\|bullet_0\\|x\\|200\\|y\\|284", isPattern: true },
    { id: "g2", description: "Step 1: Should show enemies at y=64", expectedOutput: "MOVE\\|step\\|1\\|entity\\|enemy_\\d+\\|x\\|\\d+\\|y\\|64", isPattern: true },
    { id: "g3", description: "Step 1: Should report formation spread", expectedOutput: "FORMATION\\|step\\|1\\|enemy_spread\\|\\d+\\|pattern\\|sine", isPattern: true },
    { id: "g4", description: "Step 1: Should show 5 bullets and 5 enemies active", expectedOutput: "ACTIVE\\|step\\|1\\|bullets\\|5\\|enemies\\|5", isPattern: true },
    { id: "g5", description: "Step 5: Should still have enemies alive", expectedOutput: "ACTIVE\\|step\\|5\\|bullets\\|\\d+\\|enemies\\|5", isPattern: true },
    { id: "g6", description: "Should show final score", expectedOutput: "SCORE\\|0", isPattern: true },
  ],
  hints: [
    "Bullets are indices 0-4, enemies are indices 5-9. movementSystem does not care about type — it applies vx/vy to all alive entities.",
    "formationSystem only touches type==2 (enemies). Use offsets[] = {0, 10, 0, -10, 0} indexed by (i + step) % 5. This adds to x directly, not to vx.",
    "boundsSystem checks type==1 (bullets) with y < 0. At vy=-16 from y=300, bullets reach y<0 around step 19, so all bullets survive 5 steps.",
  ],
  accumulatedCode: `#include <iostream>
using namespace std;

const int POOL_SIZE = 600;
const int FIXED_DT = 16;

int x[POOL_SIZE];
int y[POOL_SIZE];
int vx[POOL_SIZE];
int vy[POOL_SIZE];
int hp[POOL_SIZE];
int type[POOL_SIZE];
bool alive[POOL_SIZE];

void spawnEnemy(int idx, int px, int py) {
    x[idx] = px;
    y[idx] = py;
    vx[idx] = 0;
    vy[idx] = 4;
    hp[idx] = 3;
    type[idx] = 2;
    alive[idx] = true;
}

void spawnBullet(int idx, int px, int py) {
    x[idx] = px;
    y[idx] = py;
    vx[idx] = 0;
    vy[idx] = -16;
    hp[idx] = 1;
    type[idx] = 1;
    alive[idx] = true;
}

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

int collisionSystem(int count) {
    int checks = 0;
    for (int b = 0; b < count; b++) {
        if (!alive[b] || type[b] != 1) continue;
        for (int e = 0; e < count; e++) {
            if (!alive[e] || type[e] != 2) continue;
            checks++;
            bool overlapX = x[b] < x[e] + 18 && x[b] + 6 > x[e];
            bool overlapY = y[b] < y[e] + 18 && y[b] + 6 > y[e];
            if (overlapX && overlapY) {
                hp[b] = 0;
                hp[e]--;
                break;
            }
        }
    }
    return checks;
}

void cleanupSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (alive[i] && hp[i] <= 0) {
            alive[i] = false;
        }
    }
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

    // Spawn enemies in formation
    for (int i = 0; i < 5; i++) {
        spawnEnemy(count, 80 + i * 40, 60);
        count++;
    }

    // Spawn bullets
    for (int i = 0; i < 5; i++) {
        spawnBullet(count, 200, 300 - i * 4);
        count++;
    }

    // Fixed timestep simulation
    int accumulator = 0;
    int totalSteps = 0;
    int frameTimes[] = {16, 32, 16};

    for (int f = 0; f < 3; f++) {
        accumulator += frameTimes[f];
        int stepsThisFrame = 0;
        while (accumulator >= FIXED_DT) {
            movementSystem(count);
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

    cout << "PIPELINE|movement|formation|bounds|collision|cleanup" << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
};
