import type { GameLessonVariant } from "@/types/game";

export const lesson72SpaceShooter: GameLessonVariant = {
  lessonId: "72-job-style-update",
  instructions: `# Job-Style Update — Batched Game Systems

Your space shooter runs multiple systems per frame. Each direct system call jumps to different code, touches different data. A job system queues all work items and processes them in priority batches. SPAWN first so new entities exist before MOVE. MOVE before DAMAGE so positions are current. CLEANUP after DAMAGE so dead entities are removed. RENDER last so the frame is complete.

## What Breaks Without This

Without job batching, system order is implicit in the code. Move the collision call above the movement call and bullets check old positions. The bug is invisible until a player reports missed hits. A job system makes order explicit: priority values define execution sequence. The scheduler enforces it.

## The Fix

Each system submits jobs to a queue instead of executing directly. The job processor sorts by priority and drains the queue. Same work, explicit order, better data locality.

\\\`\\\`\\\`
// Priority: SPAWN(0) -> MOVE(1) -> DAMAGE(2) -> CLEANUP(3) -> RENDER(4)
submitJob(SPAWN, entityCount);
submitJob(MOVE, entityCount);
// ... scheduler sorts and processes
\\\`\\\`\\\`

## Your Task

1. Define job types: SPAWN=0, MOVE=1, DAMAGE=2, CLEANUP=3, RENDER=4
2. Queue 10 jobs per frame in mixed order:
   - RENDER(0), MOVE(1), SPAWN(0), DAMAGE(0), MOVE(2), RENDER(1)
   - SPAWN(1), DAMAGE(1), CLEANUP(0), MOVE(3)
3. Sort by type (priority order: SPAWN, MOVE, DAMAGE, CLEANUP, RENDER)
4. Process sorted queue. SPAWN creates 2 entities each, MOVE moves 4 entities each, DAMAGE resolves hits
5. Print per batch:
   - \\\`JOB|process|SPAWN|count|2|entities_created|4\\\`
   - \\\`JOB|process|MOVE|count|3|entities_moved|12\\\`
   - \\\`JOB|process|DAMAGE|count|2|hits_resolved|3\\\`
   - \\\`JOB|process|CLEANUP|count|1|entities_removed|2\\\`
   - \\\`JOB|process|RENDER|count|2|frames_drawn|1\\\`
6. Print: \\\`JOB_SUMMARY|frame|1|jobs_queued|10|jobs_processed|10|reordered|true\\\`

## Beginner Trap

**Common Mistake:** Processing jobs in queue insertion order. The RENDER job was inserted first but must execute last. Priority sorting is not optional. Without it, you render before entities have moved, showing stale positions.

## Elite Insight

Unreal Engine 5 processes thousands of jobs per frame across multiple cores. Each job declares dependencies. The scheduler builds a DAG and executes independent jobs in parallel. Your single-threaded priority queue is the same concept with sequential execution. The architecture scales by swapping the scheduler, not rewriting the jobs.

## Cross-Path Echo

Database query optimizers reorder operations the same way. You write SELECT with a WHERE clause, but the optimizer decides to filter before joining. The declared order is not the execution order. Your job queue optimizes game system execution the same way a query planner optimizes data access.`,
  starterCode: `#include <iostream>
#include <string>
using namespace std;

const int JOB_SPAWN = 0;
const int JOB_MOVE = 1;
const int JOB_DAMAGE = 2;
const int JOB_CLEANUP = 3;
const int JOB_RENDER = 4;

struct Job {
    int type;
    int data;
};

string jobTypeName(int t) {
    if (t == JOB_SPAWN) return "SPAWN";
    if (t == JOB_MOVE) return "MOVE";
    if (t == JOB_DAMAGE) return "DAMAGE";
    if (t == JOB_CLEANUP) return "CLEANUP";
    if (t == JOB_RENDER) return "RENDER";
    return "UNKNOWN";
}

int main() {
    const int MAX_JOBS = 10;
    Job queue[MAX_JOBS];
    int jobCount = 0;

    // TODO: Enqueue 10 jobs in mixed order:
    //   RENDER(0), MOVE(1), SPAWN(0), DAMAGE(0), MOVE(2), RENDER(1)
    //   SPAWN(1), DAMAGE(1), CLEANUP(0), MOVE(3)

    // TODO: Sort queue by type (ascending = priority order)

    // TODO: Process sorted queue in batches by type
    //   Count jobs per type, compute results:
    //   SPAWN: 2 entities per job
    //   MOVE: 4 entities per job
    //   DAMAGE: hits = count + 1
    //   CLEANUP: entities_removed = count + 1
    //   RENDER: always 1 frame drawn

    // TODO: Print JOB_SUMMARY

    return 0;
}
`,
  solutionCode: `#include <iostream>
#include <string>
using namespace std;

const int JOB_SPAWN = 0;
const int JOB_MOVE = 1;
const int JOB_DAMAGE = 2;
const int JOB_CLEANUP = 3;
const int JOB_RENDER = 4;

struct Job {
    int type;
    int data;
};

string jobTypeName(int t) {
    if (t == JOB_SPAWN) return "SPAWN";
    if (t == JOB_MOVE) return "MOVE";
    if (t == JOB_DAMAGE) return "DAMAGE";
    if (t == JOB_CLEANUP) return "CLEANUP";
    if (t == JOB_RENDER) return "RENDER";
    return "UNKNOWN";
}

int main() {
    const int MAX_JOBS = 10;
    Job queue[MAX_JOBS];
    int jobCount = 0;

    // Enqueue in mixed order
    queue[jobCount++] = {JOB_RENDER, 0};
    queue[jobCount++] = {JOB_MOVE, 1};
    queue[jobCount++] = {JOB_SPAWN, 0};
    queue[jobCount++] = {JOB_DAMAGE, 0};
    queue[jobCount++] = {JOB_MOVE, 2};
    queue[jobCount++] = {JOB_RENDER, 1};
    queue[jobCount++] = {JOB_SPAWN, 1};
    queue[jobCount++] = {JOB_DAMAGE, 1};
    queue[jobCount++] = {JOB_CLEANUP, 0};
    queue[jobCount++] = {JOB_MOVE, 3};

    // Bubble sort by type
    for (int i = 0; i < jobCount - 1; i++) {
        for (int j = 0; j < jobCount - 1 - i; j++) {
            if (queue[j].type > queue[j + 1].type) {
                Job tmp = queue[j];
                queue[j] = queue[j + 1];
                queue[j + 1] = tmp;
            }
        }
    }

    // Count jobs per type
    int batchCounts[5] = {0, 0, 0, 0, 0};
    for (int i = 0; i < jobCount; i++) {
        batchCounts[queue[i].type]++;
    }

    // Process batches
    int entitiesCreated = batchCounts[JOB_SPAWN] * 2;
    cout << "JOB|process|SPAWN|count|" << batchCounts[JOB_SPAWN]
         << "|entities_created|" << entitiesCreated << endl;

    int entitiesMoved = batchCounts[JOB_MOVE] * 4;
    cout << "JOB|process|MOVE|count|" << batchCounts[JOB_MOVE]
         << "|entities_moved|" << entitiesMoved << endl;

    int hitsResolved = batchCounts[JOB_DAMAGE] + 1;
    cout << "JOB|process|DAMAGE|count|" << batchCounts[JOB_DAMAGE]
         << "|hits_resolved|" << hitsResolved << endl;

    int entitiesRemoved = batchCounts[JOB_CLEANUP] + 1;
    cout << "JOB|process|CLEANUP|count|" << batchCounts[JOB_CLEANUP]
         << "|entities_removed|" << entitiesRemoved << endl;

    cout << "JOB|process|RENDER|count|" << batchCounts[JOB_RENDER]
         << "|frames_drawn|1" << endl;

    cout << "JOB_SUMMARY|frame|1|jobs_queued|" << jobCount
         << "|jobs_processed|" << jobCount << "|reordered|true" << endl;

    return 0;
}
`,
  tests: [
    { id: "g1", description: "SPAWN batch processed first", expectedOutput: "JOB\\|process\\|SPAWN\\|count\\|2\\|entities_created\\|4", isPattern: true },
    { id: "g2", description: "MOVE batch processed second", expectedOutput: "JOB\\|process\\|MOVE\\|count\\|3\\|entities_moved\\|12", isPattern: true },
    { id: "g3", description: "DAMAGE batch resolved hits", expectedOutput: "JOB\\|process\\|DAMAGE\\|count\\|2\\|hits_resolved\\|3", isPattern: true },
    { id: "g4", description: "CLEANUP batch removed entities", expectedOutput: "JOB\\|process\\|CLEANUP\\|count\\|1\\|entities_removed\\|2", isPattern: true },
    { id: "g5", description: "RENDER batch drawn last", expectedOutput: "JOB\\|process\\|RENDER\\|count\\|2\\|frames_drawn\\|1", isPattern: true },
    { id: "g6", description: "Job summary correct", expectedOutput: "JOB_SUMMARY\\|frame\\|1\\|jobs_queued\\|10\\|jobs_processed\\|10\\|reordered\\|true", isPattern: true },
  ],
  hints: [
    "Enqueue with: queue[jobCount++] = {JOB_RENDER, 0}. The type constants define priority: JOB_SPAWN=0 is highest, JOB_RENDER=4 is lowest.",
    "Bubble sort by type: compare queue[j].type > queue[j+1].type and swap entire Job structs. After sorting, SPAWN jobs come first, then MOVE, DAMAGE, CLEANUP, RENDER.",
    "Count with batchCounts[5]. SPAWN creates 2 entities per job (2*2=4). MOVE moves 4 per job (3*4=12). DAMAGE resolves count+1 hits (2+1=3). CLEANUP removes count+1 (1+1=2).",
  ],
  accumulatedCode: `#include <iostream>
#include <cmath>
#include <string>
using namespace std;

const int POOL_SIZE = 30;
const int FIXED_DT = 16;
const int SCREEN_W = 20;
const int SCREEN_H = 10;
const int VIEW_W = 200;
const int VIEW_H = 100;

int x[POOL_SIZE], y[POOL_SIZE];
int vx[POOL_SIZE], vy[POOL_SIZE];
int hp[POOL_SIZE], type[POOL_SIZE];
bool alive[POOL_SIZE];
int entityCount = 0;

int freeList[POOL_SIZE];
int freeCount = POOL_SIZE;

int score = 0;
int kills = 0;
int wave = 1;
int lives = 3;

enum Action { NONE, MOVE_UP, MOVE_DOWN, MOVE_LEFT, MOVE_RIGHT, FIRE };
enum AIPattern { AI_NONE, AI_LINEAR, AI_SINE, AI_TRACK };

int aiPattern[POOL_SIZE];

int playerSpeed = 4;
int playerDamage = 10;

// --- Loading system ---
struct LoadTask {
    string name;
    int totalTicks;
    int progress;
};

bool runLoadingPhase(LoadTask tasks[], int numTasks) {
    int currentTick = 0;
    int currentTask = 0;
    int totalTicks = 0;
    for (int i = 0; i < numTasks; i++) totalTicks += tasks[i].totalTicks;

    while (currentTask < numTasks) {
        currentTick++;
        tasks[currentTask].progress++;
        int pct = (tasks[currentTask].progress * 100) / tasks[currentTask].totalTicks;
        cout << "LOADING|tick|" << currentTick
             << "|task|" << tasks[currentTask].name
             << "|progress|" << pct << "%" << endl;
        if (tasks[currentTask].progress >= tasks[currentTask].totalTicks) {
            cout << "LOAD_COMPLETE|task|" << tasks[currentTask].name
                 << "|tick|" << currentTick << endl;
            currentTask++;
        }
    }
    cout << "ALL_LOADED|tick|" << currentTick
         << "|tasks|" << numTasks << "|total_ticks|" << totalTicks << endl;
    cout << "STATE|LOADING->READY" << endl;
    return true;
}

// --- Job system ---
const int JOB_SPAWN = 0;
const int JOB_MOVE = 1;
const int JOB_DAMAGE = 2;
const int JOB_CLEANUP = 3;
const int JOB_RENDER = 4;

struct Job {
    int jtype;
    int data;
};

const int MAX_JOBS = 32;
Job jobQueue[MAX_JOBS];
int jobCount = 0;

void submitJob(int jtype, int data) {
    if (jobCount < MAX_JOBS) {
        jobQueue[jobCount++] = {jtype, data};
    }
}

void sortJobs() {
    for (int i = 0; i < jobCount - 1; i++) {
        for (int j = 0; j < jobCount - 1 - i; j++) {
            if (jobQueue[j].jtype > jobQueue[j + 1].jtype) {
                Job tmp = jobQueue[j];
                jobQueue[j] = jobQueue[j + 1];
                jobQueue[j + 1] = tmp;
            }
        }
    }
}

string jobTypeName(int t) {
    if (t == JOB_SPAWN) return "SPAWN";
    if (t == JOB_MOVE) return "MOVE";
    if (t == JOB_DAMAGE) return "DAMAGE";
    if (t == JOB_CLEANUP) return "CLEANUP";
    if (t == JOB_RENDER) return "RENDER";
    return "UNKNOWN";
}

// --- Core systems ---
Action mapInput(char c) {
    switch (c) {
        case 'w': return MOVE_UP;
        case 's': return MOVE_DOWN;
        case 'a': return MOVE_LEFT;
        case 'd': return MOVE_RIGHT;
        case ' ': return FIRE;
        default: return NONE;
    }
}

int spawnFromPool(int px, int py, int pvx, int pvy, int php, int ptype) {
    if (freeCount <= 0) return -1;
    freeCount--;
    int idx = freeList[freeCount];
    x[idx] = px;
    y[idx] = py;
    vx[idx] = pvx;
    vy[idx] = pvy;
    hp[idx] = php;
    type[idx] = ptype;
    alive[idx] = true;
    aiPattern[idx] = AI_LINEAR;
    return idx;
}

void returnToPool(int idx) {
    alive[idx] = false;
    freeList[freeCount] = idx;
    freeCount++;
}

void movementSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (!alive[i] || type[i] == 2) continue;
        x[i] += vx[i];
        y[i] += vy[i];
    }
}

void collisionSystem(int count) {
    for (int b = 0; b < count; b++) {
        if (!alive[b] || type[b] != 1) continue;
        for (int e = 0; e < count; e++) {
            if (!alive[e] || type[e] != 2) continue;
            int dx = x[b] - x[e];
            int dy = y[b] - y[e];
            if (dx < 0) dx = -dx;
            if (dy < 0) dy = -dy;
            if (dx < 18 && dy < 18) {
                hp[b] = 0;
                hp[e] -= playerDamage;
                score += 100;
                kills++;
                break;
            }
        }
    }
}

void cleanupSystem(int count) {
    for (int i = 0; i < count; i++) {
        if (alive[i] && hp[i] <= 0) alive[i] = false;
    }
}

int countAlive(int count) {
    int c = 0;
    for (int i = 0; i < count; i++) {
        if (alive[i]) c++;
    }
    return c;
}

int worldToScreenX(int wx, int camX) {
    return (wx - camX) * SCREEN_W / VIEW_W;
}

int worldToScreenY(int wy, int camY) {
    return (wy - camY) * SCREEN_H / VIEW_H;
}

void processInput(char input, int playerIdx) {
    Action a = mapInput(input);
    if (a == MOVE_UP) y[playerIdx] -= playerSpeed;
    else if (a == MOVE_DOWN) y[playerIdx] += playerSpeed;
    else if (a == MOVE_LEFT) x[playerIdx] -= playerSpeed;
    else if (a == MOVE_RIGHT) x[playerIdx] += playerSpeed;
    else if (a == FIRE) {
        spawnFromPool(x[playerIdx], y[playerIdx], 0, -16, 1, 1);
    }
}

void renderSystem(int count, int camX, int camY) {
    char grid[SCREEN_H][SCREEN_W];
    for (int r = 0; r < SCREEN_H; r++)
        for (int c = 0; c < SCREEN_W; c++)
            grid[r][c] = '.';

    for (int i = 0; i < count; i++) {
        if (!alive[i]) continue;
        int sx = worldToScreenX(x[i], camX);
        int sy = worldToScreenY(y[i], camY);
        if (sx >= 0 && sx < SCREEN_W && sy >= 0 && sy < SCREEN_H) {
            if (type[i] == 0) grid[sy][sx] = 'P';
            else if (type[i] == 1) grid[sy][sx] = '|';
            else if (type[i] == 2) grid[sy][sx] = 'V';
        }
    }

    for (int r = 0; r < SCREEN_H; r++) {
        for (int c = 0; c < SCREEN_W; c++) cout << grid[r][c];
        cout << endl;
    }
}

void debugSystem(int frame, int count) {
    int active = countAlive(count);
    cout << "DEBUG|frame|" << frame << "|active|" << active
         << "|pool|" << active << "/" << POOL_SIZE
         << "|fps|60|kills|" << kills << endl;
}

void processJobQueue(int count) {
    sortJobs();
    int batchCounts[5] = {0, 0, 0, 0, 0};
    for (int i = 0; i < jobCount; i++) {
        batchCounts[jobQueue[i].jtype]++;
    }

    if (batchCounts[JOB_SPAWN] > 0) {
        cout << "JOB|process|SPAWN|count|" << batchCounts[JOB_SPAWN]
             << "|entities_created|" << batchCounts[JOB_SPAWN] * 2 << endl;
    }
    if (batchCounts[JOB_MOVE] > 0) {
        movementSystem(count);
        cout << "JOB|process|MOVE|count|" << batchCounts[JOB_MOVE]
             << "|entities_moved|" << batchCounts[JOB_MOVE] * 4 << endl;
    }
    if (batchCounts[JOB_DAMAGE] > 0) {
        collisionSystem(count);
        cout << "JOB|process|DAMAGE|count|" << batchCounts[JOB_DAMAGE]
             << "|hits_resolved|" << (batchCounts[JOB_DAMAGE] + 1) << endl;
    }
    if (batchCounts[JOB_CLEANUP] > 0) {
        cleanupSystem(count);
        cout << "JOB|process|CLEANUP|count|" << batchCounts[JOB_CLEANUP]
             << "|entities_removed|" << (batchCounts[JOB_CLEANUP] + 1) << endl;
    }
    if (batchCounts[JOB_RENDER] > 0) {
        cout << "JOB|process|RENDER|count|" << batchCounts[JOB_RENDER]
             << "|frames_drawn|1" << endl;
    }

    cout << "JOB_SUMMARY|frame|1|jobs_queued|" << jobCount
         << "|jobs_processed|" << jobCount << "|reordered|true" << endl;

    jobCount = 0;
}

int main() {
    // Loading phase
    LoadTask loadTasks[3];
    loadTasks[0] = {"wave_data", 3, 0};
    loadTasks[1] = {"enemy_defs", 2, 0};
    loadTasks[2] = {"sprites", 4, 0};
    runLoadingPhase(loadTasks, 3);

    // Init pool
    for (int i = 0; i < POOL_SIZE; i++) {
        freeList[i] = i;
        alive[i] = false;
    }

    int playerIdx = spawnFromPool(180, 300, 0, 0, 100, 0);
    spawnFromPool(100, 40, 0, 4, 1, 2);
    spawnFromPool(180, 40, 0, 4, 1, 2);
    spawnFromPool(260, 40, 0, 4, 1, 2);
    int count = entityCount;

    // Submit jobs and process via job system
    submitJob(JOB_RENDER, 0);
    submitJob(JOB_MOVE, 1);
    submitJob(JOB_SPAWN, 0);
    submitJob(JOB_DAMAGE, 0);
    submitJob(JOB_MOVE, 2);
    submitJob(JOB_RENDER, 1);
    submitJob(JOB_SPAWN, 1);
    submitJob(JOB_DAMAGE, 1);
    submitJob(JOB_CLEANUP, 0);
    submitJob(JOB_MOVE, 3);

    processJobQueue(count);

    return 0;
}
`,
};
