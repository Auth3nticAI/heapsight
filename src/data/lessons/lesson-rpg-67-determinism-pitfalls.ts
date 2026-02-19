import { Lesson } from "@/types/lesson";

export const lessonRPG67: Lesson = {
  id: "rpg-67-determinism-pitfalls",
  title: "Determinism Pitfalls",
  description: "Enforce stable iteration order, eliminate uninitialized state, and remove stray rand() calls to keep replay determinism intact.",
  order: 67,
  xpReward: 100,
  tier: "pro",
  concepts: ["determinism pitfalls", "stable iteration order", "uninitialized variables", "replay correctness", "hs_world.h"],
  part1: {
    title: "Concept: Determinism Pitfalls",
    type: "concept",
    instructions: `# Determinism Pitfalls

## Mental Model

Determinism means same seed + same inputs = same output, every time. But having a seeded RNG is necessary, not sufficient. Five common pitfalls silently break determinism: unstable iteration order, floating-point logic, uninitialized variables, stray rand() calls, and address-dependent ordering. Any one of these makes your replay diverge.

## What Breaks Without This

\`\`\`cpp
// Looks deterministic. Is not.
for (int i = entity_count - 1; i >= 0; i--) {
    int dmg = rng_range(rng, 5, 20);
    enemy_hp[i] -= dmg;
}
\`\`\`

Reverse iteration consumes RNG values in a different order than forward iteration. The damage rolls are different. The final HP values are different. The state signature diverges. Your replay shows enemies dying at the wrong time.

## The Fix: Ordering Discipline

Process entities in ID order: 0, 1, 2, ..., entity_count - 1. Always. This guarantees the RNG is consumed in the same sequence every run. Combined with zero-initialization and the no-rand rule, this makes your game fully reproducible.

The five pitfalls and their fixes:

1. **Unstable iteration order** — Always iterate 0..entity_count in ascending order. Never reverse, never skip, never sort by anything that changes between runs.
2. **Floating-point math** — Use integers for all game logic. Floats produce different results on different compilers. Your damage, HP, and position must be ints.
3. **Uninitialized variables** — Zero-initialize every struct: \`WorldState w = {};\`. Garbage values differ between runs, breaking determinism silently.
4. **Stray rand() calls** — Every random value must come from the single seeded RNG. One \`rand()\` call anywhere breaks the sequence.
5. **Address-dependent ordering** — Never sort or compare by pointer address. Addresses change between runs. Use integer IDs.

## Key Concepts

- **Stable iteration** — process entities in ID order (0..count), every pass, every tick
- **Zero-init** — \`WorldState w = {};\` ensures no garbage values leak into game logic
- **Single RNG source** — the no-rand rule from Lesson 22 is a prerequisite for determinism
- **Integer-only logic** — floats are for display, ints are for state
- **ID-based ordering** — sort by entity ID, never by pointer or address

## Performance Insight

Processing entities in ID order is also the fastest order. Entity data lives in parallel arrays indexed by ID. Sequential access means the CPU prefetcher loads the next cache line before you need it. Random or reverse order breaks prefetch predictions and causes cache stalls.

## Memory Insight

Uninitialized stack variables contain whatever was previously in that memory location. On a clean stack, this might be zero. After a few function calls, it could be anything. Zero-initialization (\`= {}\`) writes zeros to every byte of the struct. The cost is one memset at startup — trivial compared to the debugging hours saved.

## Your Task

The starter code has three bugs that break determinism:

1. An **uninitialized variable** (\`bonus\`) added to damage
2. **Reverse iteration order** (processes enemies backward)
3. A **stray rand() call** adding random noise to damage

Fix all three bugs. The fixed code must:

- Initialize \`bonus = 0\`
- Iterate forward: \`for (int i = 0; i < 3; i++)\`
- Remove the \`rand()\` call and use only the seeded RNG

Expected output (seed=99):
\`\`\`
PITFALL_CHECK|seed=99
PROCESS|enemy_0|damage=11|hp=19
PROCESS|enemy_1|damage=18|hp=7
PROCESS|enemy_2|damage=13|hp=7
STATE_SIG|4217230528
DETERMINISM|STABLE
\`\`\`

## Beginner Trap

**Assuming "it works on my machine" means it is deterministic.** An uninitialized int might happen to be zero on your machine in debug mode. In release mode, or on a different OS, it is garbage. Zero-initialize everything: \`int bonus = 0;\`. Determinism means the same output on EVERY machine, EVERY time.

## Elite Insight

Nethack processes monsters in a strict index order to ensure seed-based replay fidelity. Diablo 2 deterministic networking requires all clients to process entities in the same order — if one client iterates backward, the game desyncs. The same principle applies to any deterministic system: iteration order IS the contract.

## Systems Thinking Connection

This ordering discipline is the RPG equivalent of the Space Shooter system loop order. The Shooter processes all positions, then all velocities, then all collisions — always in entity-ID order. The Platformer fixed-timestep accumulator enforces the same contract: same dt, same order, same result. Different domain, identical principle.

## Skill Reinforcement

Lesson 21 introduced the seeded RNG. Lesson 22 enforced the no-rand rule. Lesson 23 added state signatures. This lesson identifies the remaining pitfalls that break determinism even when those rules are followed. Lesson 68 will use state signatures to verify end-of-run determinism, and Lesson 69 will build automated replay verification.

## Mastery Check

Question: You have a seeded RNG and no rand() calls, but your replay still diverges. What are three things to check?
Answer: (1) Iteration order — are entities processed in the same order every tick? (2) Uninitialized variables — is every variable zero-initialized or explicitly set before use? (3) Float math — are you using integers for all game state, or do floats creep in?`,
    starterCode: `#include <iostream>
using namespace std;
const int MAX_E = 16;
struct RNG { unsigned int state; };
void rng_seed(RNG& r, unsigned int s) { r.state = s; }
unsigned int rng_next(RNG& r) { r.state = r.state*1664525u+1013904223u; return r.state; }
int rng_range(RNG& r, int lo, int hi) { return lo+(int)(rng_next(r)%(unsigned)(hi-lo+1)); }

unsigned int hashCombine(unsigned int s, int v) {
    s ^= (unsigned int)v + 0x9e3779b9u + (s<<6) + (s>>2);
    return s;
}

int main() {
    int enemy_hp[3] = {30, 25, 20};
    RNG rng;
    rng_seed(rng, 99);
    cout << "PITFALL_CHECK|seed=99" << endl;

    // BUG 1: uninitialized variable
    int bonus; // TODO: fix this

    // BUG 2: reverse iteration order
    for (int i = 2; i >= 0; i--) { // TODO: fix iteration order
        int dmg = rng_range(rng, 5, 20) + bonus;
        // BUG 3: stray rand() call
        dmg += rand() % 3; // TODO: remove this
        enemy_hp[i] -= dmg;
        cout << "PROCESS|enemy_" << i << "|damage=" << dmg
             << "|hp=" << enemy_hp[i] << endl;
    }

    unsigned int sig = 0;
    for (int i = 0; i < 3; i++) {
        sig = hashCombine(sig, enemy_hp[i]);
    }
    cout << "STATE_SIG|" << sig << endl;
    cout << "DETERMINISM|STABLE" << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;
const int MAX_E = 16;
struct RNG { unsigned int state; };
void rng_seed(RNG& r, unsigned int s) { r.state = s; }
unsigned int rng_next(RNG& r) { r.state = r.state*1664525u+1013904223u; return r.state; }
int rng_range(RNG& r, int lo, int hi) { return lo+(int)(rng_next(r)%(unsigned)(hi-lo+1)); }

unsigned int hashCombine(unsigned int s, int v) {
    s ^= (unsigned int)v + 0x9e3779b9u + (s<<6) + (s>>2);
    return s;
}

int main() {
    int enemy_hp[3] = {30, 25, 20};
    RNG rng;
    rng_seed(rng, 99);
    cout << "PITFALL_CHECK|seed=99" << endl;

    int bonus = 0;

    for (int i = 0; i < 3; i++) {
        int dmg = rng_range(rng, 5, 20) + bonus;
        enemy_hp[i] -= dmg;
        cout << "PROCESS|enemy_" << i << "|damage=" << dmg
             << "|hp=" << enemy_hp[i] << endl;
    }

    unsigned int sig = 0;
    for (int i = 0; i < 3; i++) {
        sig = hashCombine(sig, enemy_hp[i]);
    }
    cout << "STATE_SIG|" << sig << endl;
    cout << "DETERMINISM|STABLE" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Seed header printed", expectedOutput: "PITFALL_CHECK|seed=99" },
      { id: "t2", description: "Enemy 0 processed first with correct damage", expectedOutput: "PROCESS|enemy_0|damage=11|hp=19" },
      { id: "t3", description: "Enemy 1 processed second with correct damage", expectedOutput: "PROCESS|enemy_1|damage=18|hp=7" },
      { id: "t4", description: "State signature matches deterministic value", expectedOutput: "STATE_SIG|4217230528" },
      { id: "t5", description: "Determinism confirmed stable", expectedOutput: "DETERMINISM|STABLE" },
    ],
    hints: [
      "Look for three bugs: an uninitialized variable, a backward loop, and a call to rand().",
      "Initialize bonus to 0, change the loop to iterate from 0 to 2 (forward), and remove the rand() % 3 line.",
      "Set int bonus = 0; change the loop to for (int i = 0; i < 3; i++); delete the dmg += rand() % 3; line entirely.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Stable Iteration Order",
    type: "game_builder",
    instructions: `# Build: Stable Iteration Order

## Mental Model

A deterministic game runs identically when given the same seed. To prove this, run the simulation twice with seed 99: spawn 3 enemies, process one turn of RNG-driven combat in stable ID order, compute a state signature from final HP values, and compare. If the signatures match, determinism holds.

## What Breaks Without This

Without stable ordering, Run 1 might process enemy 2 before enemy 0. The RNG gives enemy 2 the damage roll that was meant for enemy 0. Both runs produce different HP values. The state signatures diverge. Your replay system reports a mismatch, and you have no idea which system caused it.

## The Fix: Two-Run Verification

Build a function \`runSimulation\` that:
1. Seeds the RNG with a given seed
2. Initializes 3 enemies with HP 30, 25, 20
3. Processes one combat turn: iterate 0..2, each enemy takes \`rng_range(rng, 5, 20)\` damage
4. Computes a state signature using hashCombine over all enemy HP values
5. Returns the signature

Call this function twice with seed 99. Compare the results. Print the dungeon grid, entity lines, processing order, signatures, and a DETERMINISM_CHECK verdict.

## Key Concepts

- **Run isolation** — each run starts from a clean state, same seed, same initial HP
- **hashCombine** — fold each HP value into a running hash to produce a state fingerprint
- **Comparison** — if sig1 == sig2, determinism holds
- **Stable order** — the loop must be \`for (int i = 0; i < 3; i++)\`, never reverse, never shuffled

## Performance Insight

The hashCombine function uses three bitwise operations and one addition. Computing a state signature over 3 enemies costs about 12 instructions total. Even with 1000 entities, hashing takes microseconds. The cost of NOT hashing is hours of debugging non-deterministic replays.

## Memory Insight

Each run state (3 ints for HP + 1 RNG struct) fits in 16 bytes. Two runs use 32 bytes of stack. No heap allocation. The signature is a single unsigned int — 4 bytes. This entire verification system runs on less memory than a single cache line.

## Your Task

Complete the \`runSimulation\` function and the main() logic. The program must:

1. Print DUNGEON header and GRID_ROW lines (8x6 grid)
2. Print ENTITY lines for 3 enemies with initial HP
3. Run simulation twice with seed 99
4. For each run, print TURN and PROCESS lines showing damage and remaining HP
5. Print STATE_SIG for each run
6. Compare signatures and print DETERMINISM_CHECK|PASS or DETERMINISM_CHECK|FAIL

Expected output (seed=99):
\`\`\`
DUNGEON|determinism_test
GRID_ROW|........
GRID_ROW|.@......
GRID_ROW|...E....
GRID_ROW|.....E..
GRID_ROW|.E......
GRID_ROW|........
ENTITY|enemy_0|hp=30
ENTITY|enemy_1|hp=25
ENTITY|enemy_2|hp=20
TURN|run_1|seed=99
PROCESS|enemy_0|damage=11|hp=19
PROCESS|enemy_1|damage=18|hp=7
PROCESS|enemy_2|damage=13|hp=7
STATE_SIG|run_1|4217230528
TURN|run_2|seed=99
PROCESS|enemy_0|damage=11|hp=19
PROCESS|enemy_1|damage=18|hp=7
PROCESS|enemy_2|damage=13|hp=7
STATE_SIG|run_2|4217230528
DETERMINISM_CHECK|PASS
GAME_MESSAGE|Stable iteration order verified
\`\`\`

## Beginner Trap

**Reusing the same RNG struct for both runs without re-seeding.** If you forget to call \`rng_seed(rng, 99)\` at the start of each run, the second run continues from where the first left off. The RNG sequence is different, the damage rolls are different, and DETERMINISM_CHECK prints FAIL. Each run must start from a fresh seed.

## Elite Insight

Valve Source engine uses a deterministic simulation for networked gameplay. Every client processes the same entities in the same order with the same random seed. If any client processes entities in a different order, the game desyncs and players see prediction errors. The same principle applies here — your two runs are like two clients that must agree on the final state.

## Mastery Check

Question: Why is hashCombine computed over HP values in entity-ID order (0, 1, 2) instead of in arbitrary order?
Answer: Because hashCombine is not commutative — hashCombine(hashCombine(0, A), B) != hashCombine(hashCombine(0, B), A). If you hash in different orders, you get different signatures even with identical HP values. The hash order must match the iteration order: both use entity ID 0..count.`,
    starterCode: `#include <iostream>
using namespace std;
const int MAX_E = 16;
const int GRID_W = 8;
const int GRID_H = 6;
struct RNG { unsigned int state; };
void rng_seed(RNG& r, unsigned int s) { r.state = s; }
unsigned int rng_next(RNG& r) { r.state = r.state*1664525u+1013904223u; return r.state; }
int rng_range(RNG& r, int lo, int hi) { return lo+(int)(rng_next(r)%(unsigned)(hi-lo+1)); }

unsigned int hashCombine(unsigned int s, int v) {
    s ^= (unsigned int)v + 0x9e3779b9u + (s<<6) + (s>>2);
    return s;
}

struct SimResult {
    int enemy_hp[3];
    int damage[3];
    unsigned int signature;
};

// TODO: implement runSimulation(unsigned int seed) -> SimResult
// 1. Seed the RNG with the given seed
// 2. Set enemy HP to {30, 25, 20}
// 3. Iterate i = 0..2, each enemy takes rng_range(rng, 5, 20) damage
// 4. Compute signature using hashCombine over enemy_hp[0], [1], [2]
// 5. Return SimResult with hp, damage, and signature

void printGrid() {
    char grid[GRID_H][GRID_W];
    for (int y = 0; y < GRID_H; y++)
        for (int x = 0; x < GRID_W; x++)
            grid[y][x] = '.';
    grid[1][1] = '@';
    grid[2][3] = 'E';
    grid[3][5] = 'E';
    grid[4][1] = 'E';
    for (int y = 0; y < GRID_H; y++) {
        cout << "GRID_ROW|";
        for (int x = 0; x < GRID_W; x++) cout << grid[y][x];
        cout << endl;
    }
}

int main() {
    cout << "DUNGEON|determinism_test" << endl;
    printGrid();

    int init_hp[3] = {30, 25, 20};
    for (int i = 0; i < 3; i++) {
        cout << "ENTITY|enemy_" << i << "|hp=" << init_hp[i] << endl;
    }

    // TODO: Run simulation twice with seed 99
    // SimResult r1 = runSimulation(99);
    // SimResult r2 = runSimulation(99);

    // TODO: Print TURN|run_1|seed=99 then PROCESS lines for r1
    // TODO: Print STATE_SIG|run_1|<signature>
    // TODO: Print TURN|run_2|seed=99 then PROCESS lines for r2
    // TODO: Print STATE_SIG|run_2|<signature>

    // TODO: Compare signatures
    // Print DETERMINISM_CHECK|PASS or DETERMINISM_CHECK|FAIL
    // Print GAME_MESSAGE|Stable iteration order verified (if PASS)

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;
const int MAX_E = 16;
const int GRID_W = 8;
const int GRID_H = 6;
struct RNG { unsigned int state; };
void rng_seed(RNG& r, unsigned int s) { r.state = s; }
unsigned int rng_next(RNG& r) { r.state = r.state*1664525u+1013904223u; return r.state; }
int rng_range(RNG& r, int lo, int hi) { return lo+(int)(rng_next(r)%(unsigned)(hi-lo+1)); }

unsigned int hashCombine(unsigned int s, int v) {
    s ^= (unsigned int)v + 0x9e3779b9u + (s<<6) + (s>>2);
    return s;
}

struct SimResult {
    int enemy_hp[3];
    int damage[3];
    unsigned int signature;
};

SimResult runSimulation(unsigned int seed) {
    SimResult result = {};
    RNG rng;
    rng_seed(rng, seed);
    result.enemy_hp[0] = 30;
    result.enemy_hp[1] = 25;
    result.enemy_hp[2] = 20;
    for (int i = 0; i < 3; i++) {
        result.damage[i] = rng_range(rng, 5, 20);
        result.enemy_hp[i] -= result.damage[i];
    }
    result.signature = 0;
    for (int i = 0; i < 3; i++) {
        result.signature = hashCombine(result.signature, result.enemy_hp[i]);
    }
    return result;
}

void printGrid() {
    char grid[GRID_H][GRID_W];
    for (int y = 0; y < GRID_H; y++)
        for (int x = 0; x < GRID_W; x++)
            grid[y][x] = '.';
    grid[1][1] = '@';
    grid[2][3] = 'E';
    grid[3][5] = 'E';
    grid[4][1] = 'E';
    for (int y = 0; y < GRID_H; y++) {
        cout << "GRID_ROW|";
        for (int x = 0; x < GRID_W; x++) cout << grid[y][x];
        cout << endl;
    }
}

void printRun(const char* label, SimResult& r, unsigned int seed) {
    cout << "TURN|" << label << "|seed=" << seed << endl;
    for (int i = 0; i < 3; i++) {
        cout << "PROCESS|enemy_" << i << "|damage=" << r.damage[i]
             << "|hp=" << r.enemy_hp[i] << endl;
    }
    cout << "STATE_SIG|" << label << "|" << r.signature << endl;
}

int main() {
    cout << "DUNGEON|determinism_test" << endl;
    printGrid();

    int init_hp[3] = {30, 25, 20};
    for (int i = 0; i < 3; i++) {
        cout << "ENTITY|enemy_" << i << "|hp=" << init_hp[i] << endl;
    }

    SimResult r1 = runSimulation(99);
    SimResult r2 = runSimulation(99);

    printRun("run_1", r1, 99);
    printRun("run_2", r2, 99);

    if (r1.signature == r2.signature) {
        cout << "DETERMINISM_CHECK|PASS" << endl;
        cout << "GAME_MESSAGE|Stable iteration order verified" << endl;
    } else {
        cout << "DETERMINISM_CHECK|FAIL" << endl;
        cout << "GAME_MESSAGE|Determinism broken -- check iteration order" << endl;
    }

    return 0;
}`,
    tests: [
      { id: "g1", description: "Dungeon header printed", expectedOutput: "DUNGEON|determinism_test" },
      { id: "g2", description: "Grid rows rendered", expectedOutput: "GRID_ROW|", isPattern: false },
      { id: "g3", description: "Entity lines show initial HP", expectedOutput: "ENTITY|enemy_0|hp=30" },
      { id: "g4", description: "Run 1 processes enemies in ID order", expectedOutput: "PROCESS|enemy_0|damage=11|hp=19" },
      { id: "g5", description: "Run 1 state signature correct", expectedOutput: "STATE_SIG|run_1|4217230528" },
      { id: "g6", description: "Run 2 state signature matches run 1", expectedOutput: "STATE_SIG|run_2|4217230528" },
      { id: "g7", description: "Determinism check passes", expectedOutput: "DETERMINISM_CHECK|PASS" },
      { id: "g8", description: "Game message confirms stable order", expectedOutput: "GAME_MESSAGE|Stable iteration order verified" },
    ],
    hints: [
      "runSimulation must create a fresh RNG with the given seed and iterate enemies 0, 1, 2 in order.",
      "Zero-initialize SimResult with = {}. Seed the RNG, set HP to 30/25/20, loop i=0..2 applying rng_range(rng, 5, 20) damage, then compute the signature with hashCombine.",
      "SimResult result = {}; RNG rng; rng_seed(rng, seed); set HP values; for (int i=0; i<3; i++) { result.damage[i] = rng_range(rng, 5, 20); result.enemy_hp[i] -= result.damage[i]; } then hash all HP values in order 0, 1, 2.",
    ],
    estimatedMinutes: 15,
  },
};
