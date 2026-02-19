import type { Lesson } from "@/types/lesson";

export const lesson72: Lesson = {
  id: "72-job-style-update",
  title: "Job-Style Update",
  description: "Structure system updates as queued jobs that process in batch.",
  order: 72,
  xpReward: 200,
  tier: "pro",
  concepts: ["job system", "work items", "batch processing", "task scheduling"],
  part1: {
    title: "Concept: Job-Style Update",
    type: "concept",
    instructions: `# Job-Style Update — Scattered Updates Kill Cache Lines

Calling systems directly scatters work across your frame. Movement here, collision there, spawning somewhere else. Each call jumps to a different code path, touches different data, and the CPU pipeline stalls on every branch. A job system fixes this: queue work items, sort by type, process in batch. Same work, better locality.

## What Breaks Without This

Without a job system, system calls are hardcoded in order. Adding a new system means editing the main loop. Reordering means moving code. Disabling a system means commenting it out. The loop becomes fragile. A job queue decouples what to do from when to do it. Systems submit jobs. The scheduler decides order and timing.

## The Fix

Define a Job with a type and data payload. Systems do not execute directly. They enqueue jobs. The job processor drains the queue in priority order. Same work, but now you control the execution order without touching the systems.

\\\`\\\`\\\`
struct Job {
    int type;     // MOVE=0, SPAWN=1, DAMAGE=2, CLEANUP=3, RENDER=4
    int data;     // entity index or count
};
\\\`\\\`\\\`

Queue jobs. Sort by priority. Process in order. Each batch processes all jobs of one type before moving to the next. This gives you cache-friendly execution: all movement data accessed together, all collision data accessed together.

## Your Task

1. Define 5 job types: MOVE=0, SPAWN=1, DAMAGE=2, CLEANUP=3, RENDER=4
2. Create a job queue (array of 8 Jobs)
3. Enqueue 8 jobs in mixed order:
   - RENDER(data=0), MOVE(data=3), DAMAGE(data=1), SPAWN(data=2)
   - MOVE(data=5), CLEANUP(data=0), RENDER(data=1), MOVE(data=7)
4. Sort the queue by type (ascending = priority order: MOVE, SPAWN, DAMAGE, CLEANUP, RENDER)
5. Process sorted queue. For each job print: \\\`JOB|process|<type_name>|data|<data>\\\`
6. Print batch counts: \\\`BATCH|MOVE|3|SPAWN|1|DAMAGE|1|CLEANUP|1|RENDER|2\\\`
7. Print: \\\`JOB_SUMMARY|queued|8|processed|8|batches|5\\\`

Expected output:
\\\`\\\`\\\`
JOB|process|MOVE|data|3
JOB|process|MOVE|data|5
JOB|process|MOVE|data|7
JOB|process|SPAWN|data|2
JOB|process|DAMAGE|data|1
JOB|process|CLEANUP|data|0
JOB|process|RENDER|data|0
JOB|process|RENDER|data|1
BATCH|MOVE|3|SPAWN|1|DAMAGE|1|CLEANUP|1|RENDER|2
JOB_SUMMARY|queued|8|processed|8|batches|5
\\\`\\\`\\\`

## Beginner Trap

**Common Mistake:** Processing jobs in insertion order instead of priority order. The whole point of a job system is decoupling submission from execution. If you process in FIFO order, you get the same scattered access pattern as direct calls. Sort by type first.

## Elite Insight

Modern engines use job graphs with dependencies. A MOVE job depends on INPUT completing. COLLISION depends on MOVE completing. The scheduler resolves the graph and parallelizes independent jobs across cores. Your single-threaded sorted queue is the serial version of this parallel scheduler.

## Cross-Path Echo

Operating system task schedulers work identically. Processes have priorities. The scheduler drains the ready queue in priority order. High-priority interrupts preempt low-priority work. Your job queue is a miniature OS scheduler for game systems.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

const int MOVE = 0;
const int SPAWN = 1;
const int DAMAGE = 2;
const int CLEANUP = 3;
const int RENDER = 4;

struct Job {
    int type;
    int data;
};

string typeName(int t) {
    if (t == MOVE) return "MOVE";
    if (t == SPAWN) return "SPAWN";
    if (t == DAMAGE) return "DAMAGE";
    if (t == CLEANUP) return "CLEANUP";
    if (t == RENDER) return "RENDER";
    return "UNKNOWN";
}

int main() {
    const int MAX_JOBS = 8;
    Job queue[MAX_JOBS];
    int jobCount = 0;

    // TODO: Enqueue 8 jobs in mixed order:
    //   RENDER(0), MOVE(3), DAMAGE(1), SPAWN(2),
    //   MOVE(5), CLEANUP(0), RENDER(1), MOVE(7)

    // TODO: Sort queue by type (ascending) — use simple bubble sort

    // TODO: Process sorted queue, print JOB line for each

    // TODO: Count jobs per type, print BATCH line

    // TODO: Print JOB_SUMMARY

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

const int MOVE = 0;
const int SPAWN = 1;
const int DAMAGE = 2;
const int CLEANUP = 3;
const int RENDER = 4;

struct Job {
    int type;
    int data;
};

string typeName(int t) {
    if (t == MOVE) return "MOVE";
    if (t == SPAWN) return "SPAWN";
    if (t == DAMAGE) return "DAMAGE";
    if (t == CLEANUP) return "CLEANUP";
    if (t == RENDER) return "RENDER";
    return "UNKNOWN";
}

int main() {
    const int MAX_JOBS = 8;
    Job queue[MAX_JOBS];
    int jobCount = 0;

    // Enqueue in mixed order
    queue[jobCount++] = {RENDER, 0};
    queue[jobCount++] = {MOVE, 3};
    queue[jobCount++] = {DAMAGE, 1};
    queue[jobCount++] = {SPAWN, 2};
    queue[jobCount++] = {MOVE, 5};
    queue[jobCount++] = {CLEANUP, 0};
    queue[jobCount++] = {RENDER, 1};
    queue[jobCount++] = {MOVE, 7};

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

    // Process and count
    int batchCounts[5] = {0, 0, 0, 0, 0};
    for (int i = 0; i < jobCount; i++) {
        cout << "JOB|process|" << typeName(queue[i].type)
             << "|data|" << queue[i].data << endl;
        batchCounts[queue[i].type]++;
    }

    cout << "BATCH|MOVE|" << batchCounts[MOVE]
         << "|SPAWN|" << batchCounts[SPAWN]
         << "|DAMAGE|" << batchCounts[DAMAGE]
         << "|CLEANUP|" << batchCounts[CLEANUP]
         << "|RENDER|" << batchCounts[RENDER] << endl;

    cout << "JOB_SUMMARY|queued|" << jobCount
         << "|processed|" << jobCount << "|batches|5" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "MOVE jobs processed first", expectedOutput: "JOB\\|process\\|MOVE\\|data\\|3", isPattern: true },
      { id: "t2", description: "All MOVE jobs before SPAWN", expectedOutput: "JOB\\|process\\|MOVE\\|data\\|7", isPattern: true },
      { id: "t3", description: "SPAWN processed after MOVE", expectedOutput: "JOB\\|process\\|SPAWN\\|data\\|2", isPattern: true },
      { id: "t4", description: "RENDER processed last", expectedOutput: "JOB\\|process\\|RENDER\\|data\\|1", isPattern: true },
      { id: "t5", description: "Batch counts correct", expectedOutput: "BATCH\\|MOVE\\|3\\|SPAWN\\|1\\|DAMAGE\\|1\\|CLEANUP\\|1\\|RENDER\\|2", isPattern: true },
      { id: "t6", description: "Summary shows all 8 processed", expectedOutput: "JOB_SUMMARY\\|queued\\|8\\|processed\\|8\\|batches\\|5", isPattern: true },
    ],
    hints: [
      "Enqueue with aggregate init: queue[jobCount++] = {RENDER, 0}. The type field is the enum constant, data is the payload integer.",
      "Bubble sort compares queue[j].type > queue[j+1].type. Swap the entire Job struct. After sorting, all MOVE jobs (type=0) come first, then SPAWN (type=1), and so on.",
      "Count with an array: batchCounts[5] = {0}. Increment batchCounts[queue[i].type] for each processed job. The batch count tells you how many jobs of each type were processed.",
    ],
    estimatedMinutes: 7,
  },
  part2: {
    title: "Game: Job-Style Update System",
    type: "game_builder",
    instructions: `# Game Builder: Job-Style Update — Batched Game Systems

Your space shooter runs nine systems per frame. Each system call jumps to different code, touches different data. A job system queues all work items and processes them in priority batches. SPAWN first so new entities exist before MOVE. MOVE before DAMAGE so positions are current. CLEANUP after DAMAGE so dead entities are removed. RENDER last so the frame is complete.

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

    // Process in batches by type
    int batchCounts[5] = {0, 0, 0, 0, 0};
    for (int i = 0; i < jobCount; i++) {
        batchCounts[queue[i].type]++;
    }

    // SPAWN batch
    int entitiesCreated = batchCounts[JOB_SPAWN] * 2;
    cout << "JOB|process|SPAWN|count|" << batchCounts[JOB_SPAWN]
         << "|entities_created|" << entitiesCreated << endl;

    // MOVE batch
    int entitiesMoved = batchCounts[JOB_MOVE] * 4;
    cout << "JOB|process|MOVE|count|" << batchCounts[JOB_MOVE]
         << "|entities_moved|" << entitiesMoved << endl;

    // DAMAGE batch
    int hitsResolved = batchCounts[JOB_DAMAGE] + 1;
    cout << "JOB|process|DAMAGE|count|" << batchCounts[JOB_DAMAGE]
         << "|hits_resolved|" << hitsResolved << endl;

    // CLEANUP batch
    int entitiesRemoved = batchCounts[JOB_CLEANUP] + 1;
    cout << "JOB|process|CLEANUP|count|" << batchCounts[JOB_CLEANUP]
         << "|entities_removed|" << entitiesRemoved << endl;

    // RENDER batch
    cout << "JOB|process|RENDER|count|" << batchCounts[JOB_RENDER]
         << "|frames_drawn|1" << endl;

    cout << "JOB_SUMMARY|frame|1|jobs_queued|" << jobCount
         << "|jobs_processed|" << jobCount << "|reordered|true" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "SPAWN batch processed first", expectedOutput: "JOB\\|process\\|SPAWN\\|count\\|2\\|entities_created\\|4", isPattern: true },
      { id: "t2", description: "MOVE batch processed second", expectedOutput: "JOB\\|process\\|MOVE\\|count\\|3\\|entities_moved\\|12", isPattern: true },
      { id: "t3", description: "DAMAGE batch resolved hits", expectedOutput: "JOB\\|process\\|DAMAGE\\|count\\|2\\|hits_resolved\\|3", isPattern: true },
      { id: "t4", description: "CLEANUP batch removed entities", expectedOutput: "JOB\\|process\\|CLEANUP\\|count\\|1\\|entities_removed\\|2", isPattern: true },
      { id: "t5", description: "RENDER batch drawn", expectedOutput: "JOB\\|process\\|RENDER\\|count\\|2\\|frames_drawn\\|1", isPattern: true },
      { id: "t6", description: "Job summary correct", expectedOutput: "JOB_SUMMARY\\|frame\\|1\\|jobs_queued\\|10\\|jobs_processed\\|10\\|reordered\\|true", isPattern: true },
    ],
    hints: [
      "Enqueue with: queue[jobCount++] = {JOB_RENDER, 0}. The type constants define priority: SPAWN=0 is highest, RENDER=4 is lowest.",
      "Bubble sort by type: compare queue[j].type > queue[j+1].type, swap entire Job struct. After sorting, all SPAWN jobs come first, then MOVE, then DAMAGE, CLEANUP, RENDER.",
      "Count jobs per type with batchCounts[5]. SPAWN creates 2 entities per job (2*2=4). MOVE moves 4 per job (3*4=12). DAMAGE resolves count+1 hits (2+1=3). CLEANUP removes count+1 (1+1=2).",
    ],
    estimatedMinutes: 10,
  },
};
