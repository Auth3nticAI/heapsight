import { Lesson } from "@/types/lesson";

export const lessonRPG22: Lesson = {
  id: "rpg-22-no-rand-rule",
  title: "No-rand Rule",
  description: "Ban rand(). Single RNG in WorldState. All randomness flows through rng_range(w.rng, lo, hi).",
  order: 22,
  xpReward: 100,
  tier: "pro",
  concepts: ["no-rand rule", "single RNG source", "global state elimination", "RNG discipline", "hs_rng.h"],
  part1: {
    title: "Concept: No-rand Rule",
    type: "concept",
    instructions: `# No-rand Rule

## Mental Model

The no-rand rule is absolute: \`rand()\` is banned from your codebase. The only source of randomness is the \`RNG\` struct in WorldState. Every function that needs a random number takes \`WorldState&\` or \`RNG&\` as a parameter. One RNG. One seed. One sequence. One source of truth.

## What Breaks Without This

\`\`\`cpp
RNG rng;
rng_seed(rng, 42);
int item_id = rng_range(rng, 0, 5);  // controlled

int enemy_x = rand() % 8 + 1;  // BREAKS determinism silently
\`\`\`

Seed 42 no longer guarantees the same run. The \`enemy_x\` differs every execution because \`rand()\` draws from a separate, uncontrolled global state. One stray \`rand()\` call and your replay system is broken.

## The Fix: RNG in WorldState

Move the RNG into WorldState. Every function that needs randomness receives \`WorldState&\` and uses \`w.rng\`:

\`\`\`cpp
struct WorldState {
    RNG          rng;
    unsigned int seed;
    int pos_x[MAX_E], pos_y[MAX_E];
    int hp[MAX_E]; bool alive[MAX_E];
    int entity_count;
};

void spawnEnemies(WorldState& w, int count) {
    for (int i = 0; i < count; i++) {
        int eid = w.entity_count++;
        w.pos_x[eid] = rng_range(w.rng, 1, 8);
        w.pos_y[eid] = rng_range(w.rng, 1, 8);
        w.hp[eid] = 30; w.alive[eid] = true;
    }
}
\`\`\`

The RNG travels with the world. Save the world, save the RNG state. Load the world, restore the RNG state. The sequence continues exactly where it left off.

## Key Concepts
- **Single source** -- one \`RNG\` instance in WorldState. All randomness from one stream.
- **Explicit parameter** -- functions needing randomness take \`WorldState&\`. Never call \`rand()\`.
- **RNG in WorldState** -- the RNG travels with game state. Save the seed, restore the sequence.
- **Audit discipline** -- grep for \`rand(\`. Zero hits is the passing condition.

## Performance Insight

Passing \`WorldState&\` is one pointer -- 8 bytes on 64-bit. Same cost as a global. The discipline adds zero runtime overhead. The compiler may even inline the \`rng_range\` call, reducing it to 3 instructions at the call site.

## Memory Insight

The RNG struct adds 4 bytes to WorldState. No additional allocation. No indirection. The entire RNG state lives inside the WorldState struct on the stack (or wherever WorldState lives). When you \`memcpy\` WorldState for a save file, the RNG state comes along automatically.

## Your Task

Move the RNG into WorldState. Write \`spawnEnemies(WorldState& w, int count)\` that spawns enemies using \`w.rng\` for positions [1,8]. Seed with 1337, spawn 3 enemies.

Expected output:
\`\`\`
RNG_IN_WORLD|seed=1337
SPAWN|eid=1|pos=5,4
SPAWN|eid=2|pos=7,6
SPAWN|eid=3|pos=1,8
NO_RAND_AUDIT|pass
\`\`\`

## Beginner Trap

**Creating a second RNG for "testing."** If you have two RNG instances, they produce independent sequences. Any code that uses the "test" RNG instead of \`w.rng\` breaks determinism. One RNG. Always.

## Elite Insight

Nethack enforces a single RNG seed for the entire dungeon. The \`rn2()\` function is the only source of randomness, and it draws from one global state that is saved with the game. This is why Nethack seeds produce identical dungeons. Your no-rand rule follows the same discipline -- one source, one sequence, one truth.

## Systems Thinking Connection

This discipline is the RPG equivalent of the Robotics path's \`deterministic_seed\` parameter. Both enforce one rule: if you cannot reproduce it, you cannot debug it. The robot seeds its noise model; you seed your combat rolls. Same principle, different domain.

## Skill Reinforcement

Lesson 21 introduced the RNG struct. This lesson moves it into WorldState and enforces exclusive use. Lesson 23 will hash the world state each tick to detect determinism violations. Lesson 28 will use this disciplined RNG for loot drops.

## Mastery Check

Question: Why is \`rand()\` banned even if you seed it with \`srand(42)\`?
Answer: Because \`srand/rand\` use hidden global state that any library code can also call, and the implementation varies across platforms. Your \`RNG\` struct is explicit, portable, and isolated -- no surprises.`,
    starterCode: `#include <iostream>
using namespace std;
const int MAX_E = 16;

struct RNG { unsigned int state; };
void rng_seed(RNG& r, unsigned int s) { r.state = s; }
unsigned int rng_next(RNG& r) { r.state = r.state*1664525u+1013904223u; return r.state; }
int rng_range(RNG& r, int lo, int hi) { return lo+(int)(rng_next(r)%(unsigned)(hi-lo+1)); }

struct WorldState {
    int pos_x[MAX_E], pos_y[MAX_E];
    int hp[MAX_E]; bool alive[MAX_E];
    int entity_count;
    // TODO: add RNG rng and unsigned int seed
};

// TODO: void spawnEnemies(WorldState& w, int count)
// For each enemy: eid = w.entity_count++, pos from rng_range(w.rng, 1, 8)
// Set hp[eid]=30, alive[eid]=true
// Print SPAWN|eid=N|pos=X,Y

int main() {
    WorldState w = {};
    w.seed = 1337;
    // TODO: rng_seed(w.rng, w.seed);
    w.entity_count = 1;
    w.alive[0] = true; w.hp[0] = 100;

    cout << "RNG_IN_WORLD|seed=" << w.seed << endl;
    spawnEnemies(w, 3);
    cout << "NO_RAND_AUDIT|pass" << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;
const int MAX_E = 16;

struct RNG { unsigned int state; };
void rng_seed(RNG& r, unsigned int s) { r.state = s; }
unsigned int rng_next(RNG& r) { r.state = r.state*1664525u+1013904223u; return r.state; }
int rng_range(RNG& r, int lo, int hi) { return lo+(int)(rng_next(r)%(unsigned)(hi-lo+1)); }

struct WorldState {
    int pos_x[MAX_E], pos_y[MAX_E];
    int hp[MAX_E]; bool alive[MAX_E];
    int entity_count;
    RNG rng;
    unsigned int seed;
};

void spawnEnemies(WorldState& w, int count) {
    for (int i = 0; i < count; i++) {
        int eid = w.entity_count++;
        w.pos_x[eid] = rng_range(w.rng, 1, 8);
        w.pos_y[eid] = rng_range(w.rng, 1, 8);
        w.hp[eid] = 30; w.alive[eid] = true;
        cout << "SPAWN|eid=" << eid << "|pos=" << w.pos_x[eid] << "," << w.pos_y[eid] << endl;
    }
}

int main() {
    WorldState w = {};
    w.seed = 1337;
    rng_seed(w.rng, w.seed);
    w.entity_count = 1;
    w.alive[0] = true; w.hp[0] = 100;

    cout << "RNG_IN_WORLD|seed=" << w.seed << endl;
    spawnEnemies(w, 3);
    cout << "NO_RAND_AUDIT|pass" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "RNG in WorldState with seed 1337", expectedOutput: "RNG_IN_WORLD|seed=1337" },
      { id: "t2", description: "First enemy spawned", expectedOutput: "SPAWN|eid=1|pos=5,4" },
      { id: "t3", description: "Third enemy spawned", expectedOutput: "SPAWN|eid=3|pos=1,8" },
      { id: "t4", description: "No-rand audit passes", expectedOutput: "NO_RAND_AUDIT|pass" },
    ],
    hints: [
      "Add RNG rng and unsigned int seed fields to the WorldState struct.",
      "In spawnEnemies, use w.entity_count++ to get the next eid, then rng_range(w.rng, 1, 8) for x and y.",
      "Do not forget to call rng_seed(w.rng, w.seed) in main before calling spawnEnemies.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Spawn and Loot with Disciplined RNG",
    type: "game_builder",
    instructions: `# Build: Spawn and Loot with Disciplined RNG

## Mental Model

Every random event in the game -- spawning, damage, loot -- flows through \`w.rng\`. No exceptions. The WorldState owns the RNG, and every function that needs randomness takes \`WorldState&\`. This is the no-rand discipline applied to a complete game tick.

## What Breaks Without This

If \`spawnEnemies\` uses \`w.rng\` but \`dropLoot\` uses \`rand()\`, the spawn sequence is reproducible but loot is not. Replay would show identical enemy positions but different items. Half-deterministic is worse than non-deterministic because it is harder to debug.

## The Fix: Complete RNG Discipline

1. Spawn enemies using \`w.rng\` for positions
2. Drop loot using \`w.rng\` for item selection
3. Every random call advances the same RNG sequence
4. Same seed produces same spawns AND same loot

## Key Concepts
- **Total RNG coverage** -- every random call goes through \`w.rng\`
- **Call order matters** -- spawn first, then loot. The order is the sequence.
- **Audit rule** -- zero calls to \`rand()\` anywhere in the code
- **Reproducibility proof** -- seed twice, compare results

## Performance Insight

Seven RNG calls (6 for positions + 1 for loot) cost 21 instructions total. The entire spawn + loot sequence is cheaper than a single cache miss. Determinism is free.

## Memory Insight

All entity data lives in fixed-size arrays inside WorldState. Spawning fills the next slot -- no allocation. The loot ID is an integer. The total memory cost of spawning 3 enemies and 1 loot drop: zero heap bytes, ~100 stack bytes written.

## Your Task

1. Seed WorldState with 1337.
2. Spawn 3 enemies using \`spawnEnemies(w, 3)\` with positions from \`rng_range(w.rng, 1, 8)\`.
3. Drop loot using \`dropLoot(w)\` returning an item_id from \`rng_range(w.rng, 0, 4)\`.
4. Re-seed with 1337, repeat, verify results match.

Expected output:
\`\`\`
RNG_IN_WORLD|seed=1337
SPAWN|eid=1|pos=5,4
SPAWN|eid=2|pos=7,6
SPAWN|eid=3|pos=1,8
LOOT|item_id=2
RESEED|1337
SPAWN|eid=1|pos=5,4
SPAWN|eid=2|pos=7,6
SPAWN|eid=3|pos=1,8
LOOT|item_id=2
NO_RAND_VERIFIED|true
\`\`\`

## Beginner Trap

**Using \`w.rng\` for spawns but a local RNG for loot.** Even if both are seeded the same, they advance independently. The world's RNG sequence must be one unbroken chain: spawn, spawn, spawn, loot. Any fork breaks replay.

## Elite Insight

Diablo 2's loot generation uses the same RNG that determines monster placement. This means the exact sequence of events -- which monsters appear, where they stand, what they drop -- is fully determined by one seed. Speedrunners memorize seed behaviors to optimize runs. Your code follows the same single-sequence discipline.

## Mastery Check

Question: If you add a debug print that calls \`rng_range(w.rng, 0, 99)\` to log a random test value between spawn and loot, what happens?
Answer: The loot item changes. The debug print consumed one RNG value, shifting the entire sequence forward. Every call counts. Debug code that touches the RNG is not "free" -- it changes the game.`,
    starterCode: `#include <iostream>
using namespace std;
const int MAX_E = 16;

struct RNG { unsigned int state; };
void rng_seed(RNG& r, unsigned int s) { r.state = s; }
unsigned int rng_next(RNG& r) { r.state = r.state*1664525u+1013904223u; return r.state; }
int rng_range(RNG& r, int lo, int hi) { return lo+(int)(rng_next(r)%(unsigned)(hi-lo+1)); }

struct WorldState {
    int pos_x[MAX_E], pos_y[MAX_E];
    int hp[MAX_E]; bool alive[MAX_E];
    int entity_count;
    RNG rng;
    unsigned int seed;
};

void spawnEnemies(WorldState& w, int count) {
    for (int i = 0; i < count; i++) {
        int eid = w.entity_count++;
        w.pos_x[eid] = rng_range(w.rng, 1, 8);
        w.pos_y[eid] = rng_range(w.rng, 1, 8);
        w.hp[eid] = 30; w.alive[eid] = true;
        cout << "SPAWN|eid=" << eid << "|pos=" << w.pos_x[eid] << "," << w.pos_y[eid] << endl;
    }
}

// TODO: int dropLoot(WorldState& w)
// return rng_range(w.rng, 0, 4) and print LOOT|item_id=N

int main() {
    WorldState w = {};
    w.seed = 1337;
    rng_seed(w.rng, w.seed);
    w.entity_count = 1;
    w.alive[0] = true; w.hp[0] = 100;

    cout << "RNG_IN_WORLD|seed=" << w.seed << endl;
    spawnEnemies(w, 3);
    int loot1 = dropLoot(w);

    // Re-seed and verify
    rng_seed(w.rng, w.seed);
    w.entity_count = 1;
    cout << "RESEED|" << w.seed << endl;
    spawnEnemies(w, 3);
    int loot2 = dropLoot(w);

    cout << "NO_RAND_VERIFIED|" << (loot1 == loot2 ? "true" : "false") << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;
const int MAX_E = 16;

struct RNG { unsigned int state; };
void rng_seed(RNG& r, unsigned int s) { r.state = s; }
unsigned int rng_next(RNG& r) { r.state = r.state*1664525u+1013904223u; return r.state; }
int rng_range(RNG& r, int lo, int hi) { return lo+(int)(rng_next(r)%(unsigned)(hi-lo+1)); }

struct WorldState {
    int pos_x[MAX_E], pos_y[MAX_E];
    int hp[MAX_E]; bool alive[MAX_E];
    int entity_count;
    RNG rng;
    unsigned int seed;
};

void spawnEnemies(WorldState& w, int count) {
    for (int i = 0; i < count; i++) {
        int eid = w.entity_count++;
        w.pos_x[eid] = rng_range(w.rng, 1, 8);
        w.pos_y[eid] = rng_range(w.rng, 1, 8);
        w.hp[eid] = 30; w.alive[eid] = true;
        cout << "SPAWN|eid=" << eid << "|pos=" << w.pos_x[eid] << "," << w.pos_y[eid] << endl;
    }
}

int dropLoot(WorldState& w) {
    int item = rng_range(w.rng, 0, 4);
    cout << "LOOT|item_id=" << item << endl;
    return item;
}

int main() {
    WorldState w = {};
    w.seed = 1337;
    rng_seed(w.rng, w.seed);
    w.entity_count = 1;
    w.alive[0] = true; w.hp[0] = 100;

    cout << "RNG_IN_WORLD|seed=" << w.seed << endl;
    spawnEnemies(w, 3);
    int loot1 = dropLoot(w);

    rng_seed(w.rng, w.seed);
    w.entity_count = 1;
    cout << "RESEED|" << w.seed << endl;
    spawnEnemies(w, 3);
    int loot2 = dropLoot(w);

    cout << "NO_RAND_VERIFIED|" << (loot1 == loot2 ? "true" : "false") << endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "World seeded with 1337", expectedOutput: "RNG_IN_WORLD|seed=1337" },
      { id: "g2", description: "First enemy position correct", expectedOutput: "SPAWN|eid=1|pos=5,4" },
      { id: "g3", description: "Loot item generated", expectedOutput: "LOOT|item_id=2" },
      { id: "g4", description: "Reseed confirmation", expectedOutput: "RESEED|1337" },
      { id: "g5", description: "No-rand discipline verified", expectedOutput: "NO_RAND_VERIFIED|true" },
    ],
    hints: [
      "dropLoot is a simple wrapper: call rng_range(w.rng, 0, 4), print the result, return it.",
      "The function signature is: int dropLoot(WorldState& w). It uses w.rng, not a local RNG.",
      "After re-seeding, entity_count must reset to 1 so the second spawnEnemies writes to the same indices.",
    ],
    estimatedMinutes: 12,
  },
};