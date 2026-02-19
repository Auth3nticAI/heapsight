import { Lesson } from "@/types/lesson";

export const lessonRPG71: Lesson = {
  id: "rpg-71-profiling-timers-v0",
  title: "Profiling Timers v0",
  description: "Measure how long each pass takes — you can't optimize what you can't measure.",
  order: 71,
  xpReward: 100,
  tier: "pro",
  concepts: ["profiling", "timing measurement", "performance analysis", "chrono library", "bottleneck detection"],
  part1: {
    title: "Concept: Profiling Timers",
    type: "concept",
    instructions: `# Profiling Timers v0

## Mental Model

Your game runs "fast enough" with 5 entities. But what about 50? 500?
You won't know where the bottleneck is until you measure. Guessing is
wrong 90% of the time — profiling is the only honest answer.

## What Breaks Without This

Without per-pass timing:
- You optimize the wrong system (movement is fast, combat is slow)
- Frame budget overruns go undetected
- Performance regressions hide in noise
- "It feels slow" is not actionable data

## The Fix

C++'s \`<chrono>\` gives microsecond precision. Wrap each pass in a timer:

\`\`\`cpp
#include <chrono>
using Clock = chrono::high_resolution_clock;

struct Timer {
    chrono::time_point<Clock> start;
    void begin() { start = Clock::now(); }
    long long endMicro() {
        auto end = Clock::now();
        return chrono::duration_cast<chrono::microseconds>(end - start).count();
    }
};
\`\`\`

Use it around each pass:

\`\`\`cpp
Timer t;
t.begin();
movementPass(world);
long long move_us = t.endMicro();
\`\`\`

## Key Concepts

- **high_resolution_clock**: best available resolution on the platform
- **duration_cast**: converts time differences to specific units (microseconds)
- **Per-pass timing**: measure each system independently, not the whole frame
- **Accumulation**: sum over multiple turns for stable averages

## Performance Insight

The timer itself takes ~100 nanoseconds per call. For passes that run
in microseconds, the overhead is negligible. For production, you might
disable profiling — but during development, always measure.

## Memory Insight

A Timer struct is 8 bytes (one time_point). No heap allocation. You
can have a timer per pass with zero memory pressure.

## Your Task

Define a Timer struct with \`begin()\` and \`endMicro()\`. Use it to time
a single movementPass call. Print the elapsed microseconds.

## Beginner Trap

\`\`\`cpp
// BAD: Timing the entire frame including cout
t.begin();
movementPass(world);
cout << "moved" << endl;  // cout is SLOW
long long total = t.endMicro();  // measures I/O, not logic
\`\`\`

Always time computation separately from I/O.

## Elite Insight

id Software profiles every system every frame in their engines.
Frame budgets are hard limits: if physics takes more than 2ms,
it gets flagged. Same idea, same discipline.

## Systems Thinking Connection

Profiling connects to the pass pipeline (L36—L40): each system
is a separate function, which means each system is independently
measurable. Monolithic tick() functions can't be profiled this way.

## Skill Reinforcement

- Per-pass architecture from L36—L40
- Struct design from L11
- No-heap discipline from Gate A (L30)

## Mastery Check

You pass when TIMER_TEST prints a non-negative microsecond value
for a single movementPass call.`,
    starterCode: `#include <iostream>
#include <chrono>
using namespace std;
using Clock = chrono::high_resolution_clock;

struct RNG { unsigned int state; int next(int lo, int hi) { state = state * 1103515245 + 12345; return lo + (int)((state >> 16) % (hi - lo + 1)); } };

// TODO: Define Timer struct
// - chrono::time_point<Clock> start
// - void begin() { start = Clock::now(); }
// - long long endMicro() { return duration_cast<microseconds>(now - start).count(); }

const int MAX_E = 10;
struct World { int px[MAX_E]; int py[MAX_E]; int hp[MAX_E]; bool alive[MAX_E]; int entity_count; int turn; RNG rng; };

void initWorld(World& w, unsigned int seed) {
    w.entity_count = 5; w.turn = 0; w.rng = {seed};
    for (int i = 0; i < w.entity_count; i++) { w.px[i] = i; w.py[i] = 0; w.hp[i] = 3 + i; w.alive[i] = true; }
}

void movementPass(World& w) {
    for (int i = 0; i < w.entity_count; i++) {
        if (!w.alive[i]) continue;
        w.px[i] += w.rng.next(-1, 1); w.py[i] += w.rng.next(-1, 1);
    }
}

int main() {
    World world; initWorld(world, 42);

    // TODO: Create a Timer, call begin(), run movementPass, call endMicro()
    // Print TIMER_TEST|move=Xus
    movementPass(world);

    return 0;
}`,
    solutionCode: `#include <iostream>
#include <chrono>
using namespace std;
using Clock = chrono::high_resolution_clock;

struct RNG { unsigned int state; int next(int lo, int hi) { state = state * 1103515245 + 12345; return lo + (int)((state >> 16) % (hi - lo + 1)); } };

struct Timer {
    chrono::time_point<Clock> start;
    void begin() { start = Clock::now(); }
    long long endMicro() {
        auto end = Clock::now();
        return chrono::duration_cast<chrono::microseconds>(end - start).count();
    }
};

const int MAX_E = 10;
struct World { int px[MAX_E]; int py[MAX_E]; int hp[MAX_E]; bool alive[MAX_E]; int entity_count; int turn; RNG rng; };

void initWorld(World& w, unsigned int seed) {
    w.entity_count = 5; w.turn = 0; w.rng = {seed};
    for (int i = 0; i < w.entity_count; i++) { w.px[i] = i; w.py[i] = 0; w.hp[i] = 3 + i; w.alive[i] = true; }
}

void movementPass(World& w) {
    for (int i = 0; i < w.entity_count; i++) {
        if (!w.alive[i]) continue;
        w.px[i] += w.rng.next(-1, 1); w.py[i] += w.rng.next(-1, 1);
    }
}

int main() {
    World world; initWorld(world, 42);
    Timer t;
    t.begin();
    movementPass(world);
    long long move_us = t.endMicro();
    cout << "TIMER_TEST|move=" << move_us << "us" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Timer test output printed", expectedOutput: "TIMER_TEST|move=", isPattern: true },
      { id: "t2", description: "Value ends with us suffix", expectedOutput: "us", isPattern: true },
    ],
    hints: [
      "Timer needs a chrono::time_point<Clock> member. begin() sets it to Clock::now().",
      "endMicro() computes auto end = Clock::now() then duration_cast<chrono::microseconds>(end - start).count().",
      "In main: Timer t; t.begin(); movementPass(world); long long us = t.endMicro(); then print TIMER_TEST|move=<us>us.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Per-Pass Profiling",
    type: "game_builder",
    instructions: `# Build: Per-Pass Profiling

## Mental Model

Part 1 timed a single pass. Now time all three passes (movement,
combat, cleanup) over a 5-turn simulation. Accumulate totals and
print a structured profile line. This is how real engines measure
frame budgets.

## What Breaks Without This

Without multi-pass profiling:
- You only know total frame time, not which pass is slow
- Optimization guesses waste effort on fast passes
- Regressions in one pass hide inside total noise

## The Fix

Time each pass independently. Accumulate microseconds over 5 turns.
Print per-pass and total microseconds in a structured format.

## Key Concepts

- **Accumulated timing**: sum over multiple turns for stable data
- **Structured output**: PROFILE|move=X|combat=X|cleanup=X|total=X
- **Entity lifecycle**: cleanup removes dead entities, affecting future passes
- **Independent measurement**: each pass timed separately

## Performance Insight

Three timer calls per turn (6 Clock::now() calls) add ~600ns of
overhead. The game logic itself takes microseconds. Timer overhead
is < 0.1% of measured time — acceptable for development profiling.

## Memory Insight

Timer is 8 bytes. Three long long accumulators are 24 bytes. The
entire profiling system uses 32 bytes of stack. Zero heap.

## Your Task

1. Use Timer from part 1 to time movementPass, combatPass, cleanupPass
2. Run 5 turns, accumulating microseconds for each pass
3. Print TURN|N|entities=X after each turn
4. Print PROFILE|move=Xus|combat=Xus|cleanup=Xus|total=Xus after loop

## Beginner Trap

\`\`\`cpp
// BAD: Timing all three passes together
t.begin();
movementPass(world);
combatPass(world);
cleanupPass(world);
total += t.endMicro();  // which pass is slow?
\`\`\`

Time each pass individually to identify the bottleneck.

## Elite Insight

Unreal Engine's stat system categorizes every subsystem. When a
frame exceeds budget, the profile output immediately shows which
system overran. Three passes is the minimum viable version.

## Mastery Check

You pass when TURN lines show decreasing entity counts and the
PROFILE line shows per-pass microsecond values summing to total.`,
    starterCode: `#include <iostream>
#include <chrono>
using namespace std;
using Clock = chrono::high_resolution_clock;

struct RNG { unsigned int state; int next(int lo, int hi) { state = state * 1103515245 + 12345; return lo + (int)((state >> 16) % (hi - lo + 1)); } };

struct Timer {
    chrono::time_point<Clock> start;
    void begin() { start = Clock::now(); }
    long long endMicro() { auto end = Clock::now(); return chrono::duration_cast<chrono::microseconds>(end - start).count(); }
};

const int MAX_E = 10;
struct World {
    int px[MAX_E]; int py[MAX_E]; int hp[MAX_E]; bool alive[MAX_E];
    int entity_count; int turn; RNG rng;
};

void initWorld(World& w, unsigned int seed) {
    w.entity_count = 5; w.turn = 0; w.rng = {seed};
    for (int i = 0; i < w.entity_count; i++) { w.px[i] = i; w.py[i] = 0; w.hp[i] = 3 + i; w.alive[i] = true; }
}

void movementPass(World& w) {
    for (int i = 0; i < w.entity_count; i++) {
        if (!w.alive[i]) continue;
        w.px[i] += w.rng.next(-1, 1); w.py[i] += w.rng.next(-1, 1);
    }
}

void combatPass(World& w) {
    for (int i = 1; i < w.entity_count; i++) {
        if (!w.alive[i]) continue;
        int dmg = w.rng.next(1, 2);
        w.hp[i] -= dmg;
    }
}

void cleanupPass(World& w) {
    for (int i = 0; i < w.entity_count; i++) {
        if (w.alive[i] && w.hp[i] <= 0) w.alive[i] = false;
    }
}

int countAlive(const World& w) { int c = 0; for (int i = 0; i < w.entity_count; i++) if (w.alive[i]) c++; return c; }

int main() {
    World world; initWorld(world, 42);
    long long total_move = 0, total_combat = 0, total_cleanup = 0;
    Timer t;

    for (int turn = 1; turn <= 5; turn++) {
        world.turn = turn;
        // TODO: Time movementPass, combatPass, cleanupPass separately
        // Accumulate into total_move, total_combat, total_cleanup
        movementPass(world);
        combatPass(world);
        cleanupPass(world);
        cout << "TURN|" << turn << "|entities=" << countAlive(world) << endl;
    }

    // TODO: Print PROFILE|move=Xus|combat=Xus|cleanup=Xus|total=Xus

    return 0;
}`,
    solutionCode: `#include <iostream>
#include <chrono>
using namespace std;
using Clock = chrono::high_resolution_clock;

struct RNG { unsigned int state; int next(int lo, int hi) { state = state * 1103515245 + 12345; return lo + (int)((state >> 16) % (hi - lo + 1)); } };

struct Timer {
    chrono::time_point<Clock> start;
    void begin() { start = Clock::now(); }
    long long endMicro() { auto end = Clock::now(); return chrono::duration_cast<chrono::microseconds>(end - start).count(); }
};

const int MAX_E = 10;
struct World {
    int px[MAX_E]; int py[MAX_E]; int hp[MAX_E]; bool alive[MAX_E];
    int entity_count; int turn; RNG rng;
};

void initWorld(World& w, unsigned int seed) {
    w.entity_count = 5; w.turn = 0; w.rng = {seed};
    for (int i = 0; i < w.entity_count; i++) { w.px[i] = i; w.py[i] = 0; w.hp[i] = 3 + i; w.alive[i] = true; }
}

void movementPass(World& w) {
    for (int i = 0; i < w.entity_count; i++) {
        if (!w.alive[i]) continue;
        w.px[i] += w.rng.next(-1, 1); w.py[i] += w.rng.next(-1, 1);
    }
}

void combatPass(World& w) {
    for (int i = 1; i < w.entity_count; i++) {
        if (!w.alive[i]) continue;
        int dmg = w.rng.next(1, 2);
        w.hp[i] -= dmg;
    }
}

void cleanupPass(World& w) {
    for (int i = 0; i < w.entity_count; i++) {
        if (w.alive[i] && w.hp[i] <= 0) w.alive[i] = false;
    }
}

int countAlive(const World& w) { int c = 0; for (int i = 0; i < w.entity_count; i++) if (w.alive[i]) c++; return c; }

int main() {
    World world; initWorld(world, 42);
    long long total_move = 0, total_combat = 0, total_cleanup = 0;
    Timer t;

    for (int turn = 1; turn <= 5; turn++) {
        world.turn = turn;
        t.begin(); movementPass(world); total_move += t.endMicro();
        t.begin(); combatPass(world); total_combat += t.endMicro();
        t.begin(); cleanupPass(world); total_cleanup += t.endMicro();
        cout << "TURN|" << turn << "|entities=" << countAlive(world) << endl;
    }

    long long total = total_move + total_combat + total_cleanup;
    cout << "PROFILE|move=" << total_move << "us|combat=" << total_combat << "us|cleanup=" << total_cleanup << "us|total=" << total << "us" << endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Turn 1 shows 5 entities", expectedOutput: "TURN|1|entities=5", isPattern: false },
      { id: "g2", description: "Entity count decreases by turn 5", expectedOutput: "TURN|5|entities=", isPattern: true },
      { id: "g3", description: "Profile line printed", expectedOutput: "PROFILE|move=", isPattern: true },
      { id: "g4", description: "Profile has total", expectedOutput: "us|total=", isPattern: true },
    ],
    hints: [
      "Timer from part 1 is already defined. Use t.begin() before each pass and total_X += t.endMicro() after.",
      "Wrap each pass: t.begin(); movementPass(world); total_move += t.endMicro(); then repeat for combat and cleanup.",
      "After the loop: long long total = total_move + total_combat + total_cleanup; then print PROFILE|move=...|combat=...|cleanup=...|total=...",
    ],
    estimatedMinutes: 12,
  },
};