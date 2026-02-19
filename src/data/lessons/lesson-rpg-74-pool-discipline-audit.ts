import { Lesson } from "@/types/lesson";

export const lessonRPG74: Lesson = {
  id: "rpg-74-pool-discipline-audit",
  title: "Pool Discipline Audit",
  description: "Track pool usage every tick — slots used, slots free, high watermark. If usage drifts upward, you have a leak.",
  order: 74,
  xpReward: 100,
  tier: "pro",
  concepts: ["pool monitoring", "resource tracking", "watermark analysis", "leak detection", "capacity planning"],
  part1: {
    title: "Concept: Pool Usage Metrics",
    type: "concept",
    instructions: `# Pool Discipline Audit

## Mental Model

Gate A banned heap allocations in the game loop. You use pools instead.
But pools can still "leak" — if you acquire slots and never release
them, the pool fills up and entities stop spawning. The game silently
breaks without crashing. Track usage to catch leaks early.

## What Breaks Without This

Without pool metrics:
- Pool exhaustion causes silent spawn failures
- Leaks accumulate over minutes of gameplay
- No way to distinguish "full pool" from "leaking pool"
- Capacity planning is guesswork

## The Fix

Track three numbers every tick:

\`\`\`cpp
struct PoolMetrics {
    int used;        // Slots currently in use
    int capacity;    // Total pool size
    int high_water;  // Maximum "used" ever seen
};

void updateMetrics(PoolMetrics& m, int current_used) {
    m.used = current_used;
    if (m.used > m.high_water) m.high_water = m.used;
}
\`\`\`

## Key Concepts

- **used goes up and down**: healthy (acquire/release balanced)
- **used only goes up**: leak (acquiring, never releasing)
- **high_water near capacity**: at risk of exhaustion
- **high_water well below capacity**: pool oversized, memory wasted

## Performance Insight

Updating 3 integers per tick costs nothing. The information prevents
catastrophic failures. Always profile pool usage during development.

## Memory Insight

PoolMetrics is 12 bytes. One per pool. If you have 3 pools (entities,
projectiles, effects), that's 36 bytes of diagnostics for your
entire memory system.

## Your Task

Define PoolMetrics and updateMetrics. Acquire 3 slots, then release 1.
Print the metrics after each operation to show high_water tracking.

## Beginner Trap

\`\`\`cpp
// BAD: only checking capacity at spawn time
if (pool.used < pool.capacity) spawn();
// Never checking WHY capacity is consumed
// A leak means spawn fails eventually
\`\`\`

## Elite Insight

Unreal Engine tracks pool stats for every allocator: current, peak,
fragmentation. These metrics are on a HUD during development.

## Systems Thinking Connection

Pool metrics connect to Gate A (L30): the gate bans heap allocation,
so pools are your only resource. Monitoring them is mandatory.

## Skill Reinforcement

- Pool allocator from L30
- Struct design from L11
- Profiling mindset from L71

## Mastery Check

You pass when POOL_SIMPLE shows used=2 and hwm=3 after acquire 3,
release 1.`,
    starterCode: `#include <iostream>
using namespace std;

const int POOL_CAP = 10;
struct PoolMetrics { int used; int capacity; int high_water; };

// TODO: Write updateMetrics(PoolMetrics& m, int current_used)
// Set m.used = current_used
// If m.used > m.high_water, update high_water

int main() {
    PoolMetrics m = {0, POOL_CAP, 0};

    // TODO: Acquire 3 (m.used + 3), call updateMetrics
    // Print POOL_SIMPLE|used=3|hwm=3

    // TODO: Release 1 (m.used - 1), call updateMetrics
    // Print POOL_SIMPLE|used=2|hwm=3

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int POOL_CAP = 10;
struct PoolMetrics { int used; int capacity; int high_water; };

void updateMetrics(PoolMetrics& m, int current_used) {
    m.used = current_used;
    if (m.used > m.high_water) m.high_water = m.used;
}

int main() {
    PoolMetrics m = {0, POOL_CAP, 0};
    updateMetrics(m, m.used + 3);
    cout << "POOL_SIMPLE|used=" << m.used << "|hwm=" << m.high_water << endl;
    updateMetrics(m, m.used - 1);
    cout << "POOL_SIMPLE|used=" << m.used << "|hwm=" << m.high_water << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "After acquire 3", expectedOutput: "POOL_SIMPLE|used=3|hwm=3", isPattern: false },
      { id: "t2", description: "After release 1, hwm stays", expectedOutput: "POOL_SIMPLE|used=2|hwm=3", isPattern: false },
    ],
    hints: [
      "updateMetrics sets m.used = current_used, then checks if m.used > m.high_water.",
      "To acquire: updateMetrics(m, m.used + count). To release: updateMetrics(m, m.used - count).",
      "high_water only increases. After acquire 3 (hwm=3) then release 1 (used=2, hwm still 3).",
    ],
    estimatedMinutes: 6,
  },
  part2: {
    title: "Build: Pool Metrics Tracking",
    type: "game_builder",
    instructions: `# Build: Pool Usage Audit

## Mental Model

Part 1 proved updateMetrics works for a single acquire/release.
Now simulate a 5-turn game loop: spawn entities, kill some, spawn
more. Track pool metrics every turn. Print an audit showing peak
usage percentage.

## What Breaks Without This

Without multi-turn tracking:
- You can't detect slow leaks (usage drifts up over many turns)
- You can't size pools correctly (too big wastes memory, too small crashes)
- Peak usage is invisible without high_water tracking

## The Fix

Add poolAcquire and poolRelease wrappers. Simulate 5 turns with
varying spawn/kill counts. Print POOL metrics each turn and a
final AUDIT line with peak usage percentage.

## Key Concepts

- **Acquire/release wrappers**: encapsulate metric updates
- **Per-turn reporting**: see usage pattern over time
- **Peak usage audit**: high_water / capacity as percentage
- **Healthy pattern**: used goes up and down (not just up)

## Performance Insight

The metrics add 2 integer operations per acquire/release. Over
5 turns with ~3 operations each, that's 30 extra operations —
negligible compared to the information gained.

## Memory Insight

PoolMetrics is 12 bytes on the stack. Zero heap. The diagnostic
data costs less than a single entity slot.

## Your Task

1. \`poolAcquire(m, count)\` — increase used, update metrics
2. \`poolRelease(m, count)\` — decrease used, update metrics
3. Simulate: spawn 3, spawn 2, kill 1, kill 2, spawn 1
4. Print POOL|turn=T|used=U|cap=C|hwm=H each turn
5. Print AUDIT|peak_usage=X%

## Beginner Trap

\`\`\`cpp
// BAD: updating used directly without updateMetrics
m.used += count;  // Forgot to update high_water!
// Always go through updateMetrics
\`\`\`

## Elite Insight

Production memory profilers track not just current/peak but also
allocation rate (acquires per second) and fragmentation.
Pool metrics are the first step toward that level of insight.

## Mastery Check

You pass when all 5 POOL lines print correct values and AUDIT
shows peak_usage=50%.`,
    starterCode: `#include <iostream>
using namespace std;

const int POOL_CAP = 10;
struct PoolMetrics { int used; int capacity; int high_water; };

void updateMetrics(PoolMetrics& m, int current_used) {
    m.used = current_used;
    if (m.used > m.high_water) m.high_water = m.used;
}

// TODO: Write poolAcquire(PoolMetrics& m, int count)
// TODO: Write poolRelease(PoolMetrics& m, int count)

void printPool(int turn, const PoolMetrics& m) {
    cout << "POOL|turn=" << turn << "|used=" << m.used << "|cap=" << m.capacity << "|hwm=" << m.high_water << endl;
}

int main() {
    PoolMetrics m = {0, POOL_CAP, 0};

    // Turn 1: spawn 3
    // TODO: poolAcquire(m, 3); printPool(1, m);

    // Turn 2: spawn 2 more
    // TODO: poolAcquire(m, 2); printPool(2, m);

    // Turn 3: kill 1
    // TODO: poolRelease(m, 1); printPool(3, m);

    // Turn 4: kill 2
    // TODO: poolRelease(m, 2); printPool(4, m);

    // Turn 5: spawn 1
    // TODO: poolAcquire(m, 1); printPool(5, m);

    // TODO: Print AUDIT|peak_usage=X%

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int POOL_CAP = 10;
struct PoolMetrics { int used; int capacity; int high_water; };

void updateMetrics(PoolMetrics& m, int current_used) {
    m.used = current_used;
    if (m.used > m.high_water) m.high_water = m.used;
}

void poolAcquire(PoolMetrics& m, int count) { updateMetrics(m, m.used + count); }
void poolRelease(PoolMetrics& m, int count) { updateMetrics(m, m.used - count); }

void printPool(int turn, const PoolMetrics& m) {
    cout << "POOL|turn=" << turn << "|used=" << m.used << "|cap=" << m.capacity << "|hwm=" << m.high_water << endl;
}

int main() {
    PoolMetrics m = {0, POOL_CAP, 0};
    poolAcquire(m, 3); printPool(1, m);
    poolAcquire(m, 2); printPool(2, m);
    poolRelease(m, 1); printPool(3, m);
    poolRelease(m, 2); printPool(4, m);
    poolAcquire(m, 1); printPool(5, m);
    cout << "AUDIT|peak_usage=" << (m.high_water * 100) / m.capacity << "%" << endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Turn 1 pool state", expectedOutput: "POOL|turn=1|used=3|cap=10|hwm=3", isPattern: false },
      { id: "g2", description: "High watermark at turn 2", expectedOutput: "POOL|turn=2|used=5|cap=10|hwm=5", isPattern: false },
      { id: "g3", description: "Watermark stays after release", expectedOutput: "POOL|turn=4|used=2|cap=10|hwm=5", isPattern: false },
      { id: "g4", description: "Audit shows peak", expectedOutput: "AUDIT|peak_usage=50%", isPattern: false },
    ],
    hints: [
      "poolAcquire calls updateMetrics(m, m.used + count). poolRelease calls updateMetrics(m, m.used - count).",
      "printPool outputs POOL|turn=T|used=U|cap=C|hwm=H. Call it after each acquire/release.",
      "Peak usage percentage is (m.high_water * 100) / m.capacity using integer division.",
    ],
    estimatedMinutes: 10,
  },
};