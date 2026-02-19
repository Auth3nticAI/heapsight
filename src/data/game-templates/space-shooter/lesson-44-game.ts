import type { GameLessonVariant } from "@/types/game";

export const lesson44SpaceShooter: GameLessonVariant = {
  lessonId: "44-debug-overlay",
  instructions: `# Debug Overlay — Flying Blind Into Production

Your game runs. Entities spawn, move, collide, die. But you have no visibility into what is actually happening. Entity count slowly climbs every frame — a spawn leak. Pool fills up silently — next spawn fails. FPS drops from 60 to 30 — a collision system running O(N^2) on too many entities. Without diagnostics, you only discover these problems when the game crashes or the player complains.

## What Breaks Without This

Memory leaks go undetected. Every frame spawns one entity that never gets cleaned up. After 3600 frames (one minute at 60fps), you have 3600 leaked entities. The pool is full. New spawns fail. The game freezes. Without an entity count display, you would never see the linear growth that telegraphs the crash.

## The Fix

A debug overlay struct. Updated every frame from the live game state. Printed as a formatted diagnostic line. The numbers do not lie. Entity count growing = leak. Entity count spiking = burst spawn. Pool free dropping to zero = out of memory. FPS dropping = hot path bottleneck.

The overlay scans the SoA arrays once per frame. Count alive entities. Count by type. Compute pool usage. Compare to previous frame for delta detection. If the delta exceeds a threshold, raise an alert. This is your early warning system.

## Your Task

1. \\\`DebugOverlay\\\` struct: frameCount, entityCount, bulletCount, enemyCount, poolUsed, poolFree, fps
2. 20-slot pool. Spawn 5 enemies (type=2) and 10 bullets (type=1). Pool: 15 used, 5 free
3. Three frames:
   - Frame 1: no changes (15 alive)
   - Frame 2: spawn 3 more bullets (18 alive) — spawn burst
   - Frame 3: kill 4 bullets via collision (14 alive)
4. Print: \\\`DEBUG|frame|<n>|fps|60|entities|<total>|bullets|<b>|enemies|<e>|pool|<used>/<capacity>\\\`
5. If abs(delta) >= 3: \\\`DEBUG_ALERT|entity_count_spike|frame|<n>|delta|<+/-amount>\\\`
6. After all: \\\`DEBUG_SUMMARY|frames|3|peak_entities|18|final_entities|14|alerts|<n>\\\`
7. Print \\\`SCORE|0\\\`

## Beginner Trap

**Common Mistake:** Computing pool free as CAPACITY - alive count. Pool free is CAPACITY - total slots allocated (poolCount). Dead entities still occupy pool slots until recycled. In frame 3, 4 entities die but poolCount stays 18. The pool has 2 free slots, not 6.

## Elite Insight

Every AAA studio has a debug overlay. Unreal has stat commands. Unity has the profiler HUD. id Tech prints entity counts, draw calls, and frame timings. The overlay is not a development tool you remove before shipping — it stays in the binary behind a toggle. When a QA tester reports a bug, the first question is: what did the overlay say?

## Cross-Path Echo

Server monitoring is the same concept. Grafana dashboards show request count, error rate, latency percentiles, memory usage. A spike in error rate triggers an alert. The pattern is identical: collect metrics from live state, display them, detect anomalies, alert. Debug overlays are game-specific observability.`,
  starterCode: `#include <iostream>
using namespace std;

struct DebugOverlay {
    int frameCount;
    int entityCount;
    int bulletCount;
    int enemyCount;
    int poolUsed;
    int poolFree;
    int fps;
};

const int POOL_CAPACITY = 20;
int type[POOL_CAPACITY];
bool alive[POOL_CAPACITY];
int poolCount = 0;

// TODO: Write updateDebug(DebugOverlay&, frame) — scan arrays, compute counts

// TODO: Write printDebug(DebugOverlay&) — output formatted debug line

int main() {
    // TODO: Spawn 5 enemies (type=2) and 10 bullets (type=1)

    DebugOverlay debug;
    debug.fps = 60;

    // TODO: Frame 1: compute and print debug (15 entities)
    // TODO: Frame 2: spawn 3 more bullets, compute and print (18 entities)
    // TODO: Frame 3: kill 4 bullets, compute and print (14 entities)
    // Check for spikes after each frame

    // TODO: Print DEBUG_SUMMARY and SCORE

    return 0;
}
`,
  solutionCode: `#include <iostream>
using namespace std;

struct DebugOverlay {
    int frameCount;
    int entityCount;
    int bulletCount;
    int enemyCount;
    int poolUsed;
    int poolFree;
    int fps;
};

const int POOL_CAPACITY = 20;
int type[POOL_CAPACITY];
bool alive[POOL_CAPACITY];
int poolCount = 0;

void updateDebug(DebugOverlay& dbg, int frame) {
    dbg.frameCount = frame;
    dbg.entityCount = 0;
    dbg.bulletCount = 0;
    dbg.enemyCount = 0;
    for (int i = 0; i < poolCount; i++) {
        if (!alive[i]) continue;
        dbg.entityCount++;
        if (type[i] == 1) dbg.bulletCount++;
        if (type[i] == 2) dbg.enemyCount++;
    }
    dbg.poolUsed = poolCount;
    dbg.poolFree = POOL_CAPACITY - poolCount;
}

void printDebug(DebugOverlay& dbg) {
    cout << "DEBUG|frame|" << dbg.frameCount << "|fps|" << dbg.fps
         << "|entities|" << dbg.entityCount << "|bullets|" << dbg.bulletCount
         << "|enemies|" << dbg.enemyCount << "|pool|" << dbg.poolUsed
         << "/" << POOL_CAPACITY << endl;
}

int main() {
    for (int i = 0; i < 5; i++) {
        type[poolCount] = 2;
        alive[poolCount] = true;
        poolCount++;
    }
    for (int i = 0; i < 10; i++) {
        type[poolCount] = 1;
        alive[poolCount] = true;
        poolCount++;
    }

    DebugOverlay debug;
    debug.fps = 60;
    int prevEntityCount = 0;
    int alerts = 0;
    int peakEntities = 0;

    // Frame 1: no changes
    updateDebug(debug, 1);
    printDebug(debug);
    prevEntityCount = debug.entityCount;
    if (debug.entityCount > peakEntities) peakEntities = debug.entityCount;

    // Frame 2: spawn 3 more bullets
    for (int i = 0; i < 3; i++) {
        type[poolCount] = 1;
        alive[poolCount] = true;
        poolCount++;
    }
    updateDebug(debug, 2);
    printDebug(debug);
    int delta2 = debug.entityCount - prevEntityCount;
    int absDelta2 = delta2 < 0 ? -delta2 : delta2;
    if (absDelta2 >= 3) {
        cout << "DEBUG_ALERT|entity_count_spike|frame|2|delta|" << (delta2 > 0 ? "+" : "") << delta2 << endl;
        alerts++;
    }
    prevEntityCount = debug.entityCount;
    if (debug.entityCount > peakEntities) peakEntities = debug.entityCount;

    // Frame 3: kill 4 bullets (indices 5,6,7,8)
    alive[5] = false;
    alive[6] = false;
    alive[7] = false;
    alive[8] = false;
    updateDebug(debug, 3);
    printDebug(debug);
    int delta3 = debug.entityCount - prevEntityCount;
    int absDelta3 = delta3 < 0 ? -delta3 : delta3;
    if (absDelta3 >= 3) {
        cout << "DEBUG_ALERT|entity_count_spike|frame|3|delta|" << (delta3 > 0 ? "+" : "") << delta3 << endl;
        alerts++;
    }
    if (debug.entityCount > peakEntities) peakEntities = debug.entityCount;

    cout << "DEBUG_SUMMARY|frames|3|peak_entities|" << peakEntities
         << "|final_entities|" << debug.entityCount << "|alerts|" << alerts << endl;
    cout << "SCORE|0" << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "Frame 1 should show 15 entities with pool stats", expectedOutput: "DEBUG\\|frame\\|1\\|fps\\|60\\|entities\\|15\\|bullets\\|10\\|enemies\\|5\\|pool\\|15/20", isPattern: true },
    { id: "g2", description: "Frame 2 should show 18 entities after spawn burst", expectedOutput: "DEBUG\\|frame\\|2\\|fps\\|60\\|entities\\|18\\|bullets\\|13\\|enemies\\|5\\|pool\\|18/20", isPattern: true },
    { id: "g3", description: "Frame 2 should trigger entity spike alert", expectedOutput: "DEBUG_ALERT\\|entity_count_spike\\|frame\\|2\\|delta\\|\\+3", isPattern: true },
    { id: "g4", description: "Frame 3 should show 14 entities after kills", expectedOutput: "DEBUG\\|frame\\|3\\|fps\\|60\\|entities\\|14\\|bullets\\|9\\|enemies\\|5\\|pool\\|18/20", isPattern: true },
    { id: "g5", description: "Frame 3 should trigger entity spike alert for kills", expectedOutput: "DEBUG_ALERT\\|entity_count_spike\\|frame\\|3\\|delta\\|-4", isPattern: true },
    { id: "g6", description: "Should report debug summary with peak and alerts", expectedOutput: "DEBUG_SUMMARY\\|frames\\|3\\|peak_entities\\|18\\|final_entities\\|14\\|alerts\\|2", isPattern: true },
    { id: "g7", description: "Should show score", expectedOutput: "SCORE\\|0", isPattern: true },
  ],
  hints: [
    "updateDebug scans alive[] and type[] to count living entities by type. poolUsed = poolCount (total allocated, including dead). poolFree = POOL_CAPACITY - poolCount.",
    "Frame 2: spawn 3 bullets at poolCount indices 15,16,17. Entity count goes from 15 to 18. Delta = +3 triggers alert (abs >= 3).",
    "Frame 3: kill alive[5..8] = false. poolCount stays 18 — dead slots are not reclaimed. Entity count drops to 14. Delta = -4 triggers alert.",
  ],
  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

const int POOL_SIZE = 600;
const int FIXED_DT = 16;

struct EnemyDef {
    string name;
    int hp;
    int damage;
    int speed;
    string pattern;
};

struct DebugOverlay {
    int frameCount;
    int entityCount;
    int bulletCount;
    int enemyCount;
    int poolUsed;
    int poolFree;
    int fps;
};

int x[POOL_SIZE], y[POOL_SIZE];
int w[POOL_SIZE], h[POOL_SIZE];
int vx[POOL_SIZE], vy[POOL_SIZE];
int hp[POOL_SIZE], type[POOL_SIZE];
int defIndex[POOL_SIZE];
bool alive[POOL_SIZE];

EnemyDef parseEnemyDef(string line) {
    EnemyDef def;
    int p1 = line.find(',');
    def.name = line.substr(0, p1);
    int p2 = line.find(',', p1 + 1);
    def.hp = stoi(line.substr(p1 + 1, p2 - p1 - 1));
    int p3 = line.find(',', p2 + 1);
    def.damage = stoi(line.substr(p2 + 1, p3 - p2 - 1));
    int p4 = line.find(',', p3 + 1);
    def.speed = stoi(line.substr(p3 + 1, p4 - p3 - 1));
    def.pattern = line.substr(p4 + 1);
    return def;
}

bool checkAABB(int ax, int ay, int aw, int ah, int bx, int by, int bw, int bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

int spawnFromData(int count, EnemyDef defs[], int typeCount) {
    for (int i = 0; i < typeCount; i++) {
        for (int j = 0; j < 2; j++) {
            x[count] = 100 + i * 80 + j * 40;
            y[count] = 40;
            w[count] = 20;
            h[count] = 20;
            vx[count] = 0;
            vy[count] = defs[i].speed;
            hp[count] = defs[i].hp;
            type[count] = 2;
            defIndex[count] = i;
            alive[count] = true;
            count++;
        }
    }
    return count;
}

int spawnBullets(int count, int num) {
    for (int i = 0; i < num; i++) {
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

void updateDebug(DebugOverlay& dbg, int frame, int count, int poolSize) {
    dbg.frameCount = frame;
    dbg.entityCount = 0;
    dbg.bulletCount = 0;
    dbg.enemyCount = 0;
    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        dbg.entityCount++;
        if (type[i] == 1) dbg.bulletCount++;
        if (type[i] == 2) dbg.enemyCount++;
    }
    dbg.poolUsed = count;
    dbg.poolFree = poolSize - count;
}

int countByType(int count, int typeVal) {
    int c = 0;
    for (int i = 0; i < count; i++) {
        if (alive[i] && type[i] == typeVal) c++;
    }
    return c;
}

int main() {
    string enemyData[] = {
        "basic,30,10,2,down",
        "fast,15,5,4,zigzag",
        "tank,80,20,1,straight",
        "boss,200,50,1,track"
    };
    const int TYPE_COUNT = 4;
    EnemyDef defs[4];
    for (int i = 0; i < TYPE_COUNT; i++) {
        defs[i] = parseEnemyDef(enemyData[i]);
    }

    int count = 0;
    count = spawnFromData(count, defs, TYPE_COUNT);
    count = spawnBullets(count, 5);

    DebugOverlay debug;
    debug.fps = 60;
    int prevEntityCount = 0;

    int accumulator = 0;
    int totalSteps = 0;
    int frameTimes[] = {16, 32, 16};

    for (int f = 0; f < 3; f++) {
        accumulator += frameTimes[f];
        int stepsThisFrame = 0;
        while (accumulator >= FIXED_DT) {
            moveSystem(count);
            boundsSystem(count);
            collisionSystem(count);
            cleanupSystem(count);
            accumulator -= FIXED_DT;
            stepsThisFrame++;
            totalSteps++;
        }

        updateDebug(debug, f + 1, count, POOL_SIZE);
        cout << "DEBUG|frame|" << debug.frameCount << "|fps|" << debug.fps
             << "|entities|" << debug.entityCount << "|bullets|" << debug.bulletCount
             << "|enemies|" << debug.enemyCount << endl;

        int delta = debug.entityCount - prevEntityCount;
        int absDelta = delta < 0 ? -delta : delta;
        if (f > 0 && absDelta >= 3) {
            cout << "DEBUG_ALERT|entity_count_spike|frame|" << debug.frameCount
                 << "|delta|" << (delta > 0 ? "+" : "") << delta << endl;
        }
        prevEntityCount = debug.entityCount;
    }

    cout << "PIPELINE|spawn|move|bounds|collision|cleanup|debug" << endl;
    cout << "SCORE|0" << endl;
    return 0;
}
`,
};
