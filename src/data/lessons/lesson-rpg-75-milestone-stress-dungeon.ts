import { Lesson } from "@/types/lesson";

export const lessonRPG75: Lesson = {
  id: "rpg-75-milestone-stress-dungeon",
  title: "Milestone: Stress Dungeon",
  description: "Spawn 50 enemies, run 10 turns, profile every pass — prove the game handles scale without breaking a sweat.",
  order: 75,
  xpReward: 300,
  tier: "pro",
  concepts: ["scale testing", "performance proof", "entity batching", "profiling integration", "milestone"],
  part1: {
    title: "Concept: Scale Validation",
    type: "concept",
    instructions: `# Milestone: Stress Dungeon

## Mental Model

Your game works with 5 entities. What about 50? Performance bugs
hide at scale: quadratic neighbor checks, linear scans through dead
entities, untracked pool exhaustion. A stress test reveals what
small tests cannot.

## What Breaks Without This

Without scale testing:
- Quadratic algorithms feel fine with 5 entities, break at 50
- Pool leaks take many turns to manifest
- Branch mispredictions only matter at higher entity counts
- "It works on my test" is not proof of scalability

## The Fix

Spawn 50 entities, run 10 turns, measure everything:

\`\`\`cpp
// This milestone integrates Phase 8:
// L71: Timer for per-pass profiling
// L72: Swap-and-pop for branchless processing
// L73: Spatial index for neighbor queries
// L74: Pool metrics for resource tracking
\`\`\`

## Key Concepts

- **Stress testing**: push entity count to reveal hidden bugs
- **Per-pass measurement**: identify which system is the bottleneck
- **Entity lifecycle**: entities must die and be cleaned up correctly
- **Pool tracking**: verify no resource leaks over many turns

## Performance Insight

50 entities is a realistic stress test for a turn-based RPG.
Real-time games test with 10,000+, but for turn-based command
processing, 50 entities exercising all systems is solid proof.

## Memory Insight

50 entities in SoA arrays: 50 * (4+4+4) bytes = 600 bytes for
position and HP. Pool tracking adds 12 bytes. Under 1 KB total.

## Your Task

Spawn 10 entities with RNG HP (3-8). Run 5 turns of combat
(each entity takes 1-2 dmg). Clean up dead entities each turn.
Print active count per turn.

## Beginner Trap

\`\`\`cpp
// BAD: only testing with 5 entities
// "Works for me" is not scalability proof
// Test with 10x your expected max
\`\`\`

## Elite Insight

Valve's Source engine runs bot stress tests with 64 AI players.
If the frame budget holds, the map ships. Same discipline:
automated scale validation.

## Systems Thinking Connection

This milestone proves every Phase 8 system works at scale:
timers (L71), swap-and-pop (L72), spatial index (L73), pool
metrics (L74). If any system has a bug, 50 entities will find it.

## Skill Reinforcement

- RNG-based spawning from L21
- Cleanup pass from L40/L72
- Pool tracking from L74
- Profiling from L71

## Mastery Check

You pass when MINI_STRESS shows 10 initial entities and the
active count decreases over 5 turns.`,
    starterCode: `#include <iostream>
using namespace std;

struct RNG { unsigned int state; int next(int lo, int hi) { state = state * 1103515245 + 12345; return lo + (int)((state >> 16) % (hi - lo + 1)); } };

const int MAX_E = 16;
struct World { int hp[MAX_E]; int active_count; RNG rng; };

void initWorld(World& w, unsigned int seed, int count) {
    w.rng = {seed}; w.active_count = count;
    for (int i = 0; i < count; i++) w.hp[i] = w.rng.next(3, 8);
}

void combatPass(World& w) {
    for (int i = 0; i < w.active_count; i++) w.hp[i] -= w.rng.next(1, 2);
}

// TODO: Write cleanupPass(World& w)
// Iterate backwards, swap-and-pop entities with hp <= 0

int main() {
    World world; initWorld(world, 42, 10);
    cout << "MINI_STRESS|init=" << world.active_count << endl;

    for (int t = 1; t <= 5; t++) {
        combatPass(world);
        // TODO: cleanupPass(world)
        cout << "TURN|" << t << "|active=" << world.active_count << endl;
    }

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct RNG { unsigned int state; int next(int lo, int hi) { state = state * 1103515245 + 12345; return lo + (int)((state >> 16) % (hi - lo + 1)); } };

const int MAX_E = 16;
struct World { int hp[MAX_E]; int active_count; RNG rng; };

void initWorld(World& w, unsigned int seed, int count) {
    w.rng = {seed}; w.active_count = count;
    for (int i = 0; i < count; i++) w.hp[i] = w.rng.next(3, 8);
}

void combatPass(World& w) {
    for (int i = 0; i < w.active_count; i++) w.hp[i] -= w.rng.next(1, 2);
}

void cleanupPass(World& w) {
    for (int i = w.active_count - 1; i >= 0; i--) {
        if (w.hp[i] <= 0) {
            int last = w.active_count - 1;
            if (i != last) swap(w.hp[i], w.hp[last]);
            w.active_count--;
        }
    }
}

int main() {
    World world; initWorld(world, 42, 10);
    cout << "MINI_STRESS|init=" << world.active_count << endl;
    for (int t = 1; t <= 5; t++) {
        combatPass(world);
        cleanupPass(world);
        cout << "TURN|" << t << "|active=" << world.active_count << endl;
    }
    return 0;
}`,
    tests: [
      { id: "t1", description: "Mini stress initialized", expectedOutput: "MINI_STRESS|init=10", isPattern: false },
      { id: "t2", description: "Turn 1 runs", expectedOutput: "TURN|1|active=", isPattern: true },
      { id: "t3", description: "Active count decreases", expectedOutput: "TURN|5|active=", isPattern: true },
    ],
    hints: [
      "cleanupPass iterates backwards: for (int i = w.active_count - 1; i >= 0; i--).",
      "When hp[i] <= 0: swap with last (if i != last), then w.active_count--.",
      "After cleanup, active_count reflects the number of surviving entities.",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: 50-Entity Stress Test",
    type: "game_builder",
    instructions: `# Build: 50-Entity Stress Test

## Mental Model

Part 1 proved cleanup works with 10 entities. Now scale to 50.
Spawn 50 enemies with RNG-assigned HP, run 10 turns of movement +
combat + cleanup, track pool metrics. Print a summary proving
the game scales.

## What Breaks Without This

Without full-scale testing:
- Swap-and-pop bugs only appear with many concurrent removals
- Pool tracking drift only shows after many turns
- Entity count never reaching zero means cleanup has a bug

## The Fix

Integrate everything: movement (L72-style branchless), combat,
cleanup (swap-and-pop), and pool metrics (L74). Run 10 turns
and report the results.

## Key Concepts

- **50-entity spawn**: RNG positions and HP, pool metrics initialized
- **10-turn simulation**: movement + combat + cleanup each turn
- **Pool sync**: m.used = active_count after each cleanup
- **Pass/fail**: stress test passes if entities died (final < initial)

## Performance Insight

50 entities with 3 passes per turn = 150 pass invocations over
10 turns. With swap-and-pop, each pass iterates only active
entities, not all 50 slots.

## Memory Insight

64-slot pool uses 64 * 12 bytes = 768 bytes. Pool metrics adds
12 bytes. Everything on the stack. Zero heap even at scale.

## Your Task

1. Write \`cleanupPass(World& w, PoolMetrics& m)\` — swap-and-pop + metric sync
2. Run 10 turns: movementPass, combatPass, cleanupPass
3. Print TURN|T|active=N each turn
4. Print STRESS_DONE|turns=10|final_active=N|peak=P|cap=C
5. Print STRESS|PASS if final_active < 50

## Beginner Trap

\`\`\`cpp
// BAD: forgetting to sync pool metrics after cleanup
cleanupPass(world);  // active_count changed
// m.used is now stale! Always update m.used = w.active_count
\`\`\`

## Elite Insight

Production stress tests run for thousands of turns with varying
spawn rates. The high_water metric reveals whether the pool is
sized correctly. If peak == capacity, you need a bigger pool.

## Mastery Check

You pass when STRESS_DONE shows final_active < 50 and the
STRESS|PASS line prints.`,
    starterCode: `#include <iostream>
using namespace std;

struct RNG { unsigned int state; int next(int lo, int hi) { state = state * 1103515245 + 12345; return lo + (int)((state >> 16) % (hi - lo + 1)); } };

const int MAX_E = 64;
struct World { int px[MAX_E]; int py[MAX_E]; int hp[MAX_E]; int active_count; RNG rng; };
struct PoolMetrics { int used; int capacity; int high_water; };

void initStress(World& w, PoolMetrics& m, unsigned int seed, int count) {
    w.rng = {seed}; w.active_count = count;
    for (int i = 0; i < count; i++) { w.px[i] = w.rng.next(0, 9); w.py[i] = w.rng.next(0, 9); w.hp[i] = w.rng.next(3, 8); }
    m = {count, MAX_E, count};
    cout << "STRESS|init=" << count << endl;
}

void movementPass(World& w) { for (int i = 0; i < w.active_count; i++) { w.px[i] += w.rng.next(-1, 1); w.py[i] += w.rng.next(-1, 1); } }
void combatPass(World& w) { for (int i = 0; i < w.active_count; i++) { w.hp[i] -= w.rng.next(1, 2); } }

// TODO: Write cleanupPass(World& w, PoolMetrics& m)
// Iterate backwards, swap-and-pop entities with hp <= 0
// After loop: m.used = w.active_count

int main() {
    World world; PoolMetrics metrics;
    initStress(world, metrics, 42, 50);
    for (int t = 1; t <= 10; t++) {
        movementPass(world); combatPass(world);
        // TODO: cleanupPass(world, metrics)
        cout << "TURN|" << t << "|active=" << world.active_count << endl;
    }
    // TODO: Print STRESS_DONE|turns=10|final_active=N|peak=P|cap=C
    // TODO: Print STRESS|PASS if final_active < 50, else STRESS|FAIL
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct RNG { unsigned int state; int next(int lo, int hi) { state = state * 1103515245 + 12345; return lo + (int)((state >> 16) % (hi - lo + 1)); } };

const int MAX_E = 64;
struct World { int px[MAX_E]; int py[MAX_E]; int hp[MAX_E]; int active_count; RNG rng; };
struct PoolMetrics { int used; int capacity; int high_water; };

void initStress(World& w, PoolMetrics& m, unsigned int seed, int count) {
    w.rng = {seed}; w.active_count = count;
    for (int i = 0; i < count; i++) { w.px[i] = w.rng.next(0, 9); w.py[i] = w.rng.next(0, 9); w.hp[i] = w.rng.next(3, 8); }
    m = {count, MAX_E, count};
    cout << "STRESS|init=" << count << endl;
}

void movementPass(World& w) { for (int i = 0; i < w.active_count; i++) { w.px[i] += w.rng.next(-1, 1); w.py[i] += w.rng.next(-1, 1); } }
void combatPass(World& w) { for (int i = 0; i < w.active_count; i++) { w.hp[i] -= w.rng.next(1, 2); } }

void cleanupPass(World& w, PoolMetrics& m) {
    for (int i = w.active_count - 1; i >= 0; i--) {
        if (w.hp[i] <= 0) {
            int last = w.active_count - 1;
            if (i != last) { swap(w.px[i], w.px[last]); swap(w.py[i], w.py[last]); swap(w.hp[i], w.hp[last]); }
            w.active_count--;
        }
    }
    m.used = w.active_count;
}

int main() {
    World world; PoolMetrics metrics;
    initStress(world, metrics, 42, 50);
    for (int t = 1; t <= 10; t++) {
        movementPass(world); combatPass(world); cleanupPass(world, metrics);
        cout << "TURN|" << t << "|active=" << world.active_count << endl;
    }
    cout << "STRESS_DONE|turns=10|final_active=" << world.active_count << "|peak=" << metrics.high_water << "|cap=" << metrics.capacity << endl;
    if (world.active_count < 50) cout << "STRESS|PASS" << endl;
    else cout << "STRESS|FAIL" << endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "50 entities initialized", expectedOutput: "STRESS|init=50", isPattern: false },
      { id: "g2", description: "Turn 1 runs", expectedOutput: "TURN|1|active=", isPattern: true },
      { id: "g3", description: "Stress test completes", expectedOutput: "STRESS_DONE|turns=10", isPattern: true },
      { id: "g4", description: "Stress test passes", expectedOutput: "STRESS|PASS", isPattern: false },
    ],
    hints: [
      "cleanupPass iterates backwards from active_count-1 to 0. Swap-and-pop when hp[i] <= 0.",
      "After the cleanup loop, set m.used = w.active_count to sync pool metrics.",
      "STRESS|PASS prints if world.active_count < 50 after 10 turns of combat damage.",
    ],
    estimatedMinutes: 18,
  },
};