import type { Lesson } from "@/types/lesson";

export const lesson34: Lesson = {
  id: "34-allocator-awareness",
  title: "Allocator Awareness",
  description: "Track and log every allocation to find hidden performance costs.",
  order: 34,
  xpReward: 150,
  tier: "pro",
  concepts: ["allocation tracking", "performance profiling", "allocation counter", "per-wave analysis", "memory budget"],
  part1: {
    title: "Concept: Allocator Awareness",
    type: "concept",
    instructions: `# Allocator Awareness

Every \\\`new\\\` call goes to the heap allocator. Every heap allocation has a cost — typically 50-200 nanoseconds. In a game loop running at 60 FPS, you have 16.6 milliseconds per frame. Hidden allocations eat that budget silently.

## The Problem

You write clean code. Objects are created when needed, destroyed when done. But underneath, every \\\`string\\\` copy allocates. Every \\\`vector.push_back\\\` may reallocate. You do not see these allocations in your source code, but the allocator sees every one.

## Tracking Allocations

Create a simple counter that wraps allocation:

\\\`\\\`\\\`
struct AllocTracker {
    int allocCount;
    int freeCount;
};

AllocTracker tracker = {0, 0};
\\\`\\\`\\\`

Wrap your allocations to count them:

\\\`\\\`\\\`
int* allocInt(AllocTracker& t, int value) {
    t.allocCount++;
    return new int(value);
}

void freeInt(AllocTracker& t, int*& ptr) {
    t.freeCount++;
    delete ptr;
    ptr = nullptr;
}
\\\`\\\`\\\`

## Finding Hidden Costs

Run a loop that creates and destroys objects. Check the tracker. If you expected 5 allocations but the tracker says 15, you have hidden allocations — probably from string copies or container resizing.

## Your Task
1. Define an \\\`AllocTracker\\\` struct with \\\`allocCount\\\` and \\\`freeCount\\\` (both int)
2. Write \\\`allocInt(AllocTracker& t, int value)\\\` — increments count, returns \\\`new int(value)\\\`
3. Write \\\`freeInt(AllocTracker& t, int*& ptr)\\\` — increments freeCount, deletes, sets nullptr
4. Allocate 5 integers in a loop with values 10, 20, 30, 40, 50
5. Free 3 of them
6. Print: \\\`"Allocations: 5"\\\`, \\\`"Frees: 3"\\\`, \\\`"Net: 2"\\\`, \\\`"Leaked: 2"\\\``,
    starterCode: `#include <iostream>
using namespace std;

// Define AllocTracker struct: allocCount, freeCount

// Write allocInt(AllocTracker& t, int value) — returns new int

// Write freeInt(AllocTracker& t, int*& ptr) — deletes and nulls

int main() {
    // Create tracker
    // Allocate 5 ints in a loop
    // Free first 3
    // Print allocation report

    return 0;
}
`,
    solutionCode: `#include <iostream>
using namespace std;

struct AllocTracker {
    int allocCount;
    int freeCount;
};

int* allocInt(AllocTracker& t, int value) {
    t.allocCount++;
    return new int(value);
}

void freeInt(AllocTracker& t, int*& ptr) {
    t.freeCount++;
    delete ptr;
    ptr = nullptr;
}

int main() {
    AllocTracker tracker = {0, 0};

    int* ptrs[5];
    int values[] = {10, 20, 30, 40, 50};
    for (int i = 0; i < 5; i++) {
        ptrs[i] = allocInt(tracker, values[i]);
    }

    for (int i = 0; i < 3; i++) {
        freeInt(tracker, ptrs[i]);
    }

    int net = tracker.allocCount - tracker.freeCount;
    cout << "Allocations: " << tracker.allocCount << endl;
    cout << "Frees: " << tracker.freeCount << endl;
    cout << "Net: " << net << endl;
    cout << "Leaked: " << net << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Should show 5 allocations", expectedOutput: "Allocations: 5\n" },
      { id: "t2", description: "Should show 3 frees", expectedOutput: "Frees: 3\n" },
      { id: "t3", description: "Should show net 2", expectedOutput: "Net: 2\n" },
      { id: "t4", description: "Should show 2 leaked", expectedOutput: "Leaked: 2\n" },
    ],
    hints: [
      "AllocTracker needs two int fields: `allocCount` and `freeCount`. Initialize both to 0.",
      "`allocInt` increments `t.allocCount++` then returns `new int(value)`. `freeInt` increments `t.freeCount++`, deletes, and sets ptr to nullptr.",
      "Net = allocCount - freeCount = 5 - 3 = 2. These 2 pointers were never freed — they are leaked.",
    ],
    estimatedMinutes: 6,
  },
  part2: {
    title: "Game: Allocation Tracking Per Wave",
    type: "game_builder",
    instructions: `# Game Builder: Per-Wave Allocation Profiling

Apply allocation tracking to your space shooter wave system. Spawn enemies, process a wave, clean up. Track every allocation and free across 3 waves. Find which wave leaks.

## Your Task
1. Define \\\`AllocTracker\\\` with \\\`allocCount\\\`, \\\`freeCount\\\`, \\\`peakUsage\\\` (all int)
2. Write \\\`trackAlloc(AllocTracker& t)\\\` — increments allocCount, updates peakUsage
3. Write \\\`trackFree(AllocTracker& t)\\\` — increments freeCount
4. Simulate 3 waves:
   - Wave 1: spawn 5 enemies (5 allocs), destroy 3 (3 frees)
   - Wave 2: spawn 3 enemies (3 allocs, reusing pool), destroy 3 (3 frees)
   - Wave 3: spawn 4 enemies (4 allocs), destroy 2 (2 frees)
5. Print per-wave stats: \\\`"WAVE|N|allocs|X|frees|Y|net|Z"\\\`
6. Print final summary: \\\`"ALLOC_SUMMARY|total|12|freed|8|leaked|4|peak|5"\\\`
7. Render 2 surviving entities and print score

Expected output:
\\\`\\\`\\\`
WAVE|1|allocs|5|frees|3|net|2
WAVE|2|allocs|3|frees|3|net|0
WAVE|3|allocs|4|frees|2|net|2
ALLOC_SUMMARY|total|12|freed|8|leaked|4|peak|5
ENTITY|survivor1|enemy|120|40|22|22|30
ENTITY|survivor2|enemy|240|40|22|22|30
GAME_MESSAGE|Memory audit: 4 leaked allocations detected
SCORE|0
\\\`\\\`\\\``,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

// Define AllocTracker: allocCount, freeCount, peakUsage

// Write trackAlloc(AllocTracker& t)

// Write trackFree(AllocTracker& t)

struct Entity {
    string id;
    string type;
    int x, y, width, height, hp;
    bool alive;
};

void renderEntity(Entity e) {
    if (!e.alive) return;
    cout << "ENTITY|" << e.id << "|" << e.type << "|"
         << e.x << "|" << e.y << "|" << e.width << "|" << e.height
         << "|" << e.hp << endl;
}

int main() {
    // Create tracker
    // Simulate 3 waves with allocs and frees
    // Print per-wave stats
    // Print final summary
    // Render surviving entities
    // Print GAME_MESSAGE and SCORE

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct AllocTracker {
    int allocCount;
    int freeCount;
    int peakUsage;
};

void trackAlloc(AllocTracker& t) {
    t.allocCount++;
    int current = t.allocCount - t.freeCount;
    if (current > t.peakUsage) {
        t.peakUsage = current;
    }
}

void trackFree(AllocTracker& t) {
    t.freeCount++;
}

struct Entity {
    string id;
    string type;
    int x, y, width, height, hp;
    bool alive;
};

void renderEntity(Entity e) {
    if (!e.alive) return;
    cout << "ENTITY|" << e.id << "|" << e.type << "|"
         << e.x << "|" << e.y << "|" << e.width << "|" << e.height
         << "|" << e.hp << endl;
}

int main() {
    AllocTracker tracker = {0, 0, 0};

    // Wave 1: spawn 5, destroy 3
    int w1Allocs = 0, w1Frees = 0;
    for (int i = 0; i < 5; i++) {
        trackAlloc(tracker);
        w1Allocs++;
    }
    for (int i = 0; i < 3; i++) {
        trackFree(tracker);
        w1Frees++;
    }
    cout << "WAVE|1|allocs|" << w1Allocs << "|frees|" << w1Frees << "|net|" << (w1Allocs - w1Frees) << endl;

    // Wave 2: spawn 3, destroy 3 (clean wave)
    int w2Allocs = 0, w2Frees = 0;
    for (int i = 0; i < 3; i++) {
        trackAlloc(tracker);
        w2Allocs++;
    }
    for (int i = 0; i < 3; i++) {
        trackFree(tracker);
        w2Frees++;
    }
    cout << "WAVE|2|allocs|" << w2Allocs << "|frees|" << w2Frees << "|net|" << (w2Allocs - w2Frees) << endl;

    // Wave 3: spawn 4, destroy 2
    int w3Allocs = 0, w3Frees = 0;
    for (int i = 0; i < 4; i++) {
        trackAlloc(tracker);
        w3Allocs++;
    }
    for (int i = 0; i < 2; i++) {
        trackFree(tracker);
        w3Frees++;
    }
    cout << "WAVE|3|allocs|" << w3Allocs << "|frees|" << w3Frees << "|net|" << (w3Allocs - w3Frees) << endl;

    int leaked = tracker.allocCount - tracker.freeCount;
    cout << "ALLOC_SUMMARY|total|" << tracker.allocCount << "|freed|" << tracker.freeCount << "|leaked|" << leaked << "|peak|" << tracker.peakUsage << endl;

    Entity survivor1 = {"survivor1", "enemy", 120, 40, 22, 22, 30, true};
    Entity survivor2 = {"survivor2", "enemy", 240, 40, 22, 22, 30, true};
    renderEntity(survivor1);
    renderEntity(survivor2);

    cout << "GAME_MESSAGE|Memory audit: " << leaked << " leaked allocations detected" << endl;
    cout << "SCORE|0" << endl;

    return 0;
}
`,
    tests: [
      { id: "g1", description: "Should show wave 1 stats", expectedOutput: "WAVE\\|1\\|allocs\\|5\\|frees\\|3\\|net\\|2", isPattern: true },
      { id: "g2", description: "Should show wave 2 clean", expectedOutput: "WAVE\\|2\\|allocs\\|3\\|frees\\|3\\|net\\|0", isPattern: true },
      { id: "g3", description: "Should show wave 3 stats", expectedOutput: "WAVE\\|3\\|allocs\\|4\\|frees\\|2\\|net\\|2", isPattern: true },
      { id: "g4", description: "Should show allocation summary", expectedOutput: "ALLOC_SUMMARY\\|total\\|12\\|freed\\|8\\|leaked\\|4\\|peak\\|5", isPattern: true },
      { id: "g5", description: "Should render survivor1", expectedOutput: "ENTITY\\|survivor1\\|enemy\\|120\\|40\\|22\\|22\\|30", isPattern: true },
      { id: "g6", description: "Should render survivor2", expectedOutput: "ENTITY\\|survivor2\\|enemy\\|240\\|40\\|22\\|22\\|30", isPattern: true },
      { id: "g7", description: "Should show leak detection message", expectedOutput: "GAME_MESSAGE\\|Memory audit: 4 leaked allocations detected", isPattern: true },
      { id: "g8", description: "Should output score", expectedOutput: "SCORE\\|0", isPattern: true },
    ],
    hints: [
      "AllocTracker has 3 fields: allocCount, freeCount, peakUsage. Initialize all to 0.",
      "trackAlloc increments allocCount and checks if `allocCount - freeCount > peakUsage`. Peak after wave 1 is 5 (5 allocs, 0 frees at that point). After 3 frees, net is 2. Wave 2 adds 3 more (net 5) then frees 3 (net 2). Peak stays 5.",
      "Total: 5 + 3 + 4 = 12 allocs. Freed: 3 + 3 + 2 = 8. Leaked: 12 - 8 = 4. Peak = 5 (reached after wave 1 spawns).",
    ],
    estimatedMinutes: 10,
  },
};
