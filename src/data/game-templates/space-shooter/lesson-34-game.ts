import type { GameLessonVariant } from "@/types/game";

export const lesson34SpaceShooter: GameLessonVariant = {
  lessonId: "34-allocator-awareness",
  instructions: `# Allocation Profiling — Your Wave System Leaks 4 Entities Per Run

You spawn enemies at the start of a wave. You destroy some during gameplay. You spawn more for the next wave. At the end of 3 waves, your allocation count does not match your free count. Four entities were allocated and never freed. In a 60 FPS loop running for an hour, that is 14,400 leaked allocations. Your game runs out of memory and crashes.

## What Breaks Without This

Without allocation tracking, memory leaks are invisible until the process dies. The OS reclaims everything on exit, so short test runs never expose the problem. But a game session running continuously accumulates leaked bytes until the allocator returns null or the system starts swapping to disk. Frame times spike. The player sees stuttering. Then a crash.

## The Fix

Wrap every allocation and deallocation in a tracker. \\\`trackAlloc\\\` increments a counter and updates peak usage. \\\`trackFree\\\` increments a separate counter. At any point, \\\`allocCount - freeCount\\\` tells you the net live allocations. If that number grows over time, you have a leak.

Peak usage matters separately from total allocations. If wave 1 spawns 5 entities before any die, your peak is 5. Wave 2 might reuse slots from wave 1's dead entities, keeping peak at 5. Peak tells you the high-water mark — the minimum pool size needed to avoid runtime allocation.

Per-wave tracking isolates the leak. Wave 2 allocates 3 and frees 3 — net zero, clean wave. Wave 1 and wave 3 each leak 2. Now you know exactly which spawn/cleanup code paths are broken.

## Your Task

1. Define \\\`AllocTracker\\\` with \\\`allocCount\\\`, \\\`freeCount\\\`, \\\`peakUsage\\\`
2. Write \\\`trackAlloc(AllocTracker& t)\\\` — increment allocCount, update peak if current net exceeds it
3. Write \\\`trackFree(AllocTracker& t)\\\` — increment freeCount
4. Simulate 3 waves: wave 1 (5 spawn, 3 die), wave 2 (3 spawn, 3 die), wave 3 (4 spawn, 2 die)
5. Print per-wave stats: \\\`WAVE|N|allocs|X|frees|Y|net|Z\\\`
6. Print summary: \\\`ALLOC_SUMMARY|total|12|freed|8|leaked|4|peak|5\\\`
7. Render 2 surviving entities and report the leak count

## Beginner Trap

**Common Mistake:** Computing peak as \\\`max(allocCount)\\\` instead of \\\`max(allocCount - freeCount)\\\`. Total allocations grow monotonically. Peak usage is the maximum number of simultaneously live allocations. After wave 1 spawns 5 and kills 3, net is 2. But peak was 5 — the moment before the first free. That 5 is your pool size requirement.

## Elite Insight

Production allocators track more than counts. They record allocation size, call stack, timestamp, and tag. jemalloc and tcmalloc expose this data through profiling APIs. The pattern you build here — count, track, report — is the same pattern, just with more metadata per allocation.

## Cross-Path Echo

Web applications track memory the same way. Chrome DevTools heap snapshots show allocation counts, retained sizes, and leak paths. The vocabulary differs but the analysis is identical: what was allocated, what was freed, what remains.`,
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
    { id: "g1", description: "Should show wave 1 with 5 allocs and 3 frees", expectedOutput: "WAVE\\|1\\|allocs\\|5\\|frees\\|3\\|net\\|2", isPattern: true },
    { id: "g2", description: "Should show wave 2 clean with net 0", expectedOutput: "WAVE\\|2\\|allocs\\|3\\|frees\\|3\\|net\\|0", isPattern: true },
    { id: "g3", description: "Should show wave 3 with 4 allocs and 2 frees", expectedOutput: "WAVE\\|3\\|allocs\\|4\\|frees\\|2\\|net\\|2", isPattern: true },
    { id: "g4", description: "Should show allocation summary with peak 5", expectedOutput: "ALLOC_SUMMARY\\|total\\|12\\|freed\\|8\\|leaked\\|4\\|peak\\|5", isPattern: true },
    { id: "g5", description: "Should render survivor1 entity", expectedOutput: "ENTITY\\|survivor1\\|enemy\\|120\\|40\\|22\\|22\\|30", isPattern: true },
    { id: "g6", description: "Should render survivor2 entity", expectedOutput: "ENTITY\\|survivor2\\|enemy\\|240\\|40\\|22\\|22\\|30", isPattern: true },
    { id: "g7", description: "Should show memory audit message", expectedOutput: "GAME_MESSAGE\\|Memory audit: 4 leaked allocations detected", isPattern: true },
    { id: "g8", description: "Should output score", expectedOutput: "SCORE\\|0", isPattern: true },
  ],
  hints: [
    "AllocTracker has 3 int fields. Initialize all to 0. trackAlloc increments allocCount and updates peakUsage if `allocCount - freeCount` exceeds it.",
    "Peak is reached after wave 1's 5 spawns (before any frees). At that point allocCount=5, freeCount=0, peak=5. Later waves never exceed 5 simultaneous live allocations.",
    "Total: 5+3+4=12 allocs. Freed: 3+3+2=8. Leaked: 12-8=4. Wave 2 is clean (net 0). Waves 1 and 3 each leak 2.",
  ],
  accumulatedCode: `#include <iostream>
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
    int w1Allocs = 0, w1Frees = 0;
    for (int i = 0; i < 5; i++) { trackAlloc(tracker); w1Allocs++; }
    for (int i = 0; i < 3; i++) { trackFree(tracker); w1Frees++; }
    cout << "WAVE|1|allocs|" << w1Allocs << "|frees|" << w1Frees << "|net|" << (w1Allocs - w1Frees) << endl;
    int w2Allocs = 0, w2Frees = 0;
    for (int i = 0; i < 3; i++) { trackAlloc(tracker); w2Allocs++; }
    for (int i = 0; i < 3; i++) { trackFree(tracker); w2Frees++; }
    cout << "WAVE|2|allocs|" << w2Allocs << "|frees|" << w2Frees << "|net|" << (w2Allocs - w2Frees) << endl;
    int w3Allocs = 0, w3Frees = 0;
    for (int i = 0; i < 4; i++) { trackAlloc(tracker); w3Allocs++; }
    for (int i = 0; i < 2; i++) { trackFree(tracker); w3Frees++; }
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
};
