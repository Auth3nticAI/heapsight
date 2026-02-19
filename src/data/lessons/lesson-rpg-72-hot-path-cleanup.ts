import { Lesson } from "@/types/lesson";

export const lessonRPG72: Lesson = {
  id: "rpg-72-hot-path-cleanup",
  title: "Hot Path Cleanup",
  description: "Eliminate unnecessary branches from the tick loop — fewer ifs means faster passes and better branch prediction.",
  order: 72,
  xpReward: 100,
  tier: "pro",
  concepts: ["branch elimination", "hot path optimization", "swap-and-pop", "branchless techniques", "CPU-friendly patterns"],
  part1: {
    title: "Concept: Branch Elimination",
    type: "concept",
    instructions: `# Hot Path Cleanup

## Mental Model

Your movement pass has an \`if (!alive[i]) continue;\` in every loop.
With 50 entities, that's 50 branch predictions the CPU must make.
When half are dead, the branch predictor guesses wrong, stalling
the pipeline. Fix: eliminate the branch entirely.

## What Breaks Without This

Without branch elimination:
- 50% dead entities means ~50% branch mispredictions
- Each misprediction costs 15-20 CPU cycles
- Hot loops become cache-unfriendly (skipping dead slots)
- Performance degrades non-linearly as entities die

## The Fix

Keep active entities packed at the front of every array. When an
entity dies, swap it with the last active and decrement \`active_count\`:

\`\`\`cpp
// BEFORE: branch per entity
for (int i = 0; i < entity_count; i++) {
    if (!alive[i]) continue;  // Branch!
    px[i] += dx[i];
}

// AFTER: only iterate active entities
for (int i = 0; i < active_count; i++) {
    px[i] += dx[i];  // No branch!
}
\`\`\`

## Key Concepts

- **Swap-and-pop**: swap dead entity with last active, decrement count
- **Data compaction**: active entities always packed at front
- **Branchless loops**: iterate only over active range
- **Backwards iteration**: when removing during cleanup, iterate in reverse

## Performance Insight

Removing branches from hot loops improves throughput by 20-40% for
entity counts > 50. Branch mispredictions cost 15-20 cycles each.
With 100 entities and 50% dead, that's ~1000 wasted cycles per pass.

## Memory Insight

Swap-and-pop uses the SAME arrays — no new memory. You're just
reorganizing data in place. Active entities packed at the front
also improves cache locality.

## Your Task

Write a \`removeEntity\` function that swaps an entity at index \`idx\`
with the last active entity and decrements \`active_count\`. Test by
removing entity 1 from a 4-entity world.

## Beginner Trap

\`\`\`cpp
// BAD: swap-and-pop during forward iteration
for (int i = 0; i < active_count; i++) {
    if (hp[i] <= 0) removeEntity(w, i);
    // BUG: skips the swapped-in entity at i
}
// FIX: iterate backwards or decrement i after removal
\`\`\`

## Elite Insight

This is how ECS frameworks (EnTT, flecs) handle entity removal.
Active components are always packed, dead ones swapped out. The
iteration loop never branches on liveness.

## Systems Thinking Connection

Swap-and-pop connects to the cleanup pass (L40): instead of
marking entities as dead, you physically remove them. The cleanup
pass becomes a compaction pass.

## Skill Reinforcement

- Parallel arrays (SoA) from L06/L14
- Cleanup pass from L40
- Entity management from L16-L17

## Mastery Check

You pass when REMOVE prints the correct active count after swapping
out one entity.`,
    starterCode: `#include <iostream>
using namespace std;

const int MAX_E = 16;
struct World {
    int px[MAX_E]; int py[MAX_E]; int hp[MAX_E]; bool alive[MAX_E];
    int entity_count; int active_count;
};

void initWorld(World& w, int count) {
    w.entity_count = count; w.active_count = count;
    for (int i = 0; i < count; i++) { w.px[i] = i; w.py[i] = 0; w.hp[i] = 5; w.alive[i] = true; }
}

// TODO: Write removeEntity(World& w, int idx)
// Swap all arrays (px, py, hp, alive) at idx with last active entity
// Decrement active_count

int main() {
    World world; initWorld(world, 4);
    cout << "BEFORE|active=" << world.active_count << "|px0=" << world.px[0] << "|px1=" << world.px[1] << "|px2=" << world.px[2] << "|px3=" << world.px[3] << endl;

    // TODO: Remove entity at index 1
    // Print REMOVE|idx=1|active=<new_active_count>
    // Print AFTER|active=X|px0=...|px1=...|px2=...

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAX_E = 16;
struct World {
    int px[MAX_E]; int py[MAX_E]; int hp[MAX_E]; bool alive[MAX_E];
    int entity_count; int active_count;
};

void initWorld(World& w, int count) {
    w.entity_count = count; w.active_count = count;
    for (int i = 0; i < count; i++) { w.px[i] = i; w.py[i] = 0; w.hp[i] = 5; w.alive[i] = true; }
}

void removeEntity(World& w, int idx) {
    int last = w.active_count - 1;
    if (idx != last) {
        swap(w.px[idx], w.px[last]); swap(w.py[idx], w.py[last]);
        swap(w.hp[idx], w.hp[last]); swap(w.alive[idx], w.alive[last]);
    }
    w.active_count--;
}

int main() {
    World world; initWorld(world, 4);
    cout << "BEFORE|active=" << world.active_count << "|px0=" << world.px[0] << "|px1=" << world.px[1] << "|px2=" << world.px[2] << "|px3=" << world.px[3] << endl;
    removeEntity(world, 1);
    cout << "REMOVE|idx=1|active=" << world.active_count << endl;
    cout << "AFTER|active=" << world.active_count << "|px0=" << world.px[0] << "|px1=" << world.px[1] << "|px2=" << world.px[2] << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Before state printed", expectedOutput: "BEFORE|active=4", isPattern: false },
      { id: "t2", description: "Entity removed", expectedOutput: "REMOVE|idx=1|active=3", isPattern: false },
      { id: "t3", description: "After state printed", expectedOutput: "AFTER|active=3", isPattern: false },
    ],
    hints: [
      "removeEntity needs to swap all parallel arrays at idx with the last active index (active_count - 1).",
      "Use swap(w.px[idx], w.px[last]) for each array, then w.active_count--.",
      "After removing index 1 from {0,1,2,3}, entity 3 moves to slot 1. Active count drops to 3.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Swap-and-Pop Cleanup",
    type: "game_builder",
    instructions: `# Build: Swap-and-Pop Cleanup

## Mental Model

Part 1 proved removeEntity works for a single removal. Now build
the full pattern: movementBranched vs movementCompact, plus a
cleanupPass that uses swap-and-pop to compact after kills. Compare
iteration counts to prove the optimization saves work.

## What Breaks Without This

Without compact iteration:
- Branched version iterates all entity_count slots (including dead)
- Compact version iterates only active_count slots
- The difference grows as more entities die

## The Fix

Write two movement functions: branched (old, checks alive) and
compact (new, iterates only active). After killing some entities,
run cleanupPass to compact, then compare iteration counts.

## Key Concepts

- **Branched vs branchless**: measure the difference, don't guess
- **Cleanup pass**: iterate backwards when using swap-and-pop
- **Iteration savings**: active_count < entity_count after kills
- **Structural proof**: print iteration counts to verify optimization

## Performance Insight

With 8 entities and 2 killed, compact saves 2 iterations per pass.
At 500 entities with 50% killed, that's 250 saved iterations —
plus better cache behavior from packed data.

## Memory Insight

No additional memory. Swap-and-pop works in-place on existing arrays.
The only new state is \`active_count\` (4 bytes).

## Your Task

1. Write \`movementCompact\` — iterate only active_count, return iter count
2. Write \`cleanupPass\` — iterate backwards, removeEntity if hp<=0
3. Kill entities 2 and 5, run cleanup, compare branched vs compact iters
4. Print SAVED|N iterations showing the difference

## Beginner Trap

\`\`\`cpp
// BAD: forward iteration with swap-and-pop
for (int i = 0; i < w.active_count; i++) {
    if (w.hp[i] <= 0) removeEntity(w, i);
    // Skips the entity that was swapped into slot i!
}
// FIX: iterate backwards
for (int i = w.active_count - 1; i >= 0; i--) { ... }
\`\`\`

## Elite Insight

Production ECS frameworks track "archetype" changes. When a component
is removed, the entity moves to a different archetype chunk. Swap-and-pop
is the manual version of this automatic process.

## Mastery Check

You pass when COMPACT shows 6 iterations (not 8) after 2 kills,
and SAVED shows 2.`,
    starterCode: `#include <iostream>
using namespace std;

const int MAX_E = 16;
struct World {
    int px[MAX_E]; int py[MAX_E]; int hp[MAX_E]; bool alive[MAX_E];
    int entity_count; int active_count;
};

void initWorld(World& w, int count) {
    w.entity_count = count; w.active_count = count;
    for (int i = 0; i < count; i++) { w.px[i] = i; w.py[i] = 0; w.hp[i] = 5; w.alive[i] = true; }
    cout << "INIT|entities=" << w.entity_count << "|active=" << w.active_count << endl;
}

void removeEntity(World& w, int idx) {
    int last = w.active_count - 1;
    if (idx != last) {
        swap(w.px[idx], w.px[last]); swap(w.py[idx], w.py[last]);
        swap(w.hp[idx], w.hp[last]); swap(w.alive[idx], w.alive[last]);
    }
    w.active_count--;
}

int movementBranched(World& w) {
    int iters = 0;
    for (int i = 0; i < w.entity_count; i++) { iters++; if (!w.alive[i]) continue; w.px[i]++; }
    return iters;
}

// TODO: Write movementCompact(World& w)
// Iterate only 0..active_count-1, no alive check needed
// Return iteration count

// TODO: Write cleanupPass(World& w)
// Iterate backwards through active entities, removeEntity if hp<=0

int main() {
    World world; initWorld(world, 8);

    int b1 = movementBranched(world);
    cout << "BRANCHED|iters=" << b1 << "|active=" << world.active_count << endl;
    // TODO: Run movementCompact, print COMPACT|iters=X|active=X

    // Kill entities at index 2 and 5
    world.hp[2] = 0; world.hp[5] = 0;
    cout << "KILL|idx=2" << endl << "KILL|idx=5" << endl;

    // TODO: Run cleanupPass, print CLEANUP|active=X

    int b2 = movementBranched(world);
    cout << "BRANCHED|iters=" << b2 << "|active=" << world.active_count << endl;
    // TODO: Run movementCompact, print COMPACT|iters=X|active=X

    // TODO: Print SAVED|D iterations (where D = b2 - compact_iters)

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAX_E = 16;
struct World {
    int px[MAX_E]; int py[MAX_E]; int hp[MAX_E]; bool alive[MAX_E];
    int entity_count; int active_count;
};

void initWorld(World& w, int count) {
    w.entity_count = count; w.active_count = count;
    for (int i = 0; i < count; i++) { w.px[i] = i; w.py[i] = 0; w.hp[i] = 5; w.alive[i] = true; }
    cout << "INIT|entities=" << w.entity_count << "|active=" << w.active_count << endl;
}

void removeEntity(World& w, int idx) {
    int last = w.active_count - 1;
    if (idx != last) {
        swap(w.px[idx], w.px[last]); swap(w.py[idx], w.py[last]);
        swap(w.hp[idx], w.hp[last]); swap(w.alive[idx], w.alive[last]);
    }
    w.active_count--;
}

int movementBranched(World& w) {
    int iters = 0;
    for (int i = 0; i < w.entity_count; i++) { iters++; if (!w.alive[i]) continue; w.px[i]++; }
    return iters;
}

int movementCompact(World& w) {
    int iters = 0;
    for (int i = 0; i < w.active_count; i++) { iters++; w.px[i]++; }
    return iters;
}

void cleanupPass(World& w) {
    for (int i = w.active_count - 1; i >= 0; i--) {
        if (w.hp[i] <= 0) removeEntity(w, i);
    }
}

int main() {
    World world; initWorld(world, 8);
    int b1 = movementBranched(world);
    cout << "BRANCHED|iters=" << b1 << "|active=" << world.active_count << endl;
    int c1 = movementCompact(world);
    cout << "COMPACT|iters=" << c1 << "|active=" << world.active_count << endl;
    world.hp[2] = 0; world.hp[5] = 0;
    cout << "KILL|idx=2" << endl << "KILL|idx=5" << endl;
    cleanupPass(world);
    cout << "CLEANUP|active=" << world.active_count << endl;
    int b2 = movementBranched(world);
    cout << "BRANCHED|iters=" << b2 << "|active=" << world.active_count << endl;
    int c2 = movementCompact(world);
    cout << "COMPACT|iters=" << c2 << "|active=" << world.active_count << endl;
    cout << "SAVED|" << (b2 - c2) << " iterations" << endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Initial entity count", expectedOutput: "INIT|entities=8|active=8", isPattern: false },
      { id: "g2", description: "Cleanup reduces active count", expectedOutput: "CLEANUP|active=6", isPattern: false },
      { id: "g3", description: "Compact uses fewer iterations", expectedOutput: "COMPACT|iters=6|active=6", isPattern: false },
      { id: "g4", description: "Iterations saved", expectedOutput: "SAVED|2 iterations", isPattern: false },
    ],
    hints: [
      "movementCompact iterates 0 to active_count-1 with no alive check. Count iterations and increment px[i].",
      "cleanupPass must iterate BACKWARDS: for (int i = w.active_count - 1; i >= 0; i--) to avoid skipping swapped entities.",
      "In main, after cleanup: int c2 = movementCompact(world); then print SAVED|(b2-c2) iterations.",
    ],
    estimatedMinutes: 15,
  },
};