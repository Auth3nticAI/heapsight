import { Lesson } from "@/types/lesson";

export const lessonRPG21: Lesson = {
  id: "rpg-21-deterministic-rng-v0",
  title: "Deterministic RNG v0",
  description: "Introduce a seeded LCG random number generator -- same seed, same sequence, every time.",
  order: 21,
  xpReward: 100,
  tier: "pro",
  concepts: ["deterministic RNG", "LCG algorithm", "seed reproducibility", "hs_rng.h", "single source of randomness"],
  part1: {
    title: "Concept: Deterministic RNG",
    type: "concept",
    instructions: `# Deterministic RNG v0

## Mental Model

Every RPG needs randomness -- damage rolls, loot drops, enemy spawns. But if you use \`rand()\`, every playthrough is different and you cannot reproduce bugs, verify replays, or test combat balance. A deterministic RNG means: same seed, same sequence, every time. You control the randomness completely.

## What Breaks Without This

\`\`\`cpp
int damage = rand() % 10 + 1;  // different every run
int loot = rand() % 5;          // cannot reproduce
\`\`\`

A tester reports: "the boss died in one hit." You cannot reproduce it. You cannot debug it. You cannot prove it was fixed. Without deterministic RNG, your game is untestable.

## The Fix: Linear Congruential Generator

A Linear Congruential Generator (LCG) is the simplest deterministic RNG. It uses one formula:

\`\`\`cpp
state = state * 1664525u + 1013904223u;
\`\`\`

Given the same starting state (seed), it produces the exact same sequence of numbers. Every time. On every machine. This is the foundation of reproducible gameplay.

We wrap it in three functions:
- \`rng_seed(rng, s)\` -- sets the initial state
- \`rng_next(rng)\` -- advances state, returns raw value
- \`rng_range(rng, lo, hi)\` -- returns a value in [lo, hi]

The RNG struct holds one unsigned int. That is all the state you need. Feed it a seed, and the entire sequence is determined.

## Key Concepts
- **LCG formula** -- \`state = state * 1664525 + 1013904223\` (Numerical Recipes constants)
- **Seed determines sequence** -- same seed = same numbers, guaranteed
- **Struct-based RNG** -- state is explicit, not hidden in a global
- **Range mapping** -- \`lo + (rng_next(rng) % (hi - lo + 1))\`

## Performance Insight

One multiply, one add, one modulo. Three instructions per random number. No memory allocation, no system calls, no entropy pool. The LCG fits in a single register. This is why game engines use it for gameplay randomness -- it is fast and deterministic.

## Memory Insight

The RNG struct is 4 bytes -- one unsigned int on the stack. It does not allocate. It does not grow. It does not fragment memory. When you save game state, you save 4 bytes for the RNG. When you load, you restore 4 bytes and the sequence continues exactly where it left off.

## Your Task

Implement the RNG struct with \`rng_seed\`, \`rng_next\`, and \`rng_range\`. Seed with 42, generate 3 values in range [1, 10], then re-seed with 42 and generate 3 more. Both sequences must match.

Expected output:
\`\`\`
RNG_INIT|seed=42
RNG_VAL|1=N
RNG_VAL|2=N
RNG_VAL|3=N
RNG_RESEED|seed=42
RNG_VAL|1=N
RNG_VAL|2=N
RNG_VAL|3=N
RNG_MATCH|true
\`\`\`

The N values will be specific numbers determined by the LCG. Both runs must produce identical values.

## Beginner Trap

**Forgetting that \`rng_next\` modifies state.** If you call \`rng_next\` twice, you get two different values -- the state advances each time. If you accidentally call it in a debug print AND in the game logic, you have consumed an extra value and the sequence diverges. Every call to \`rng_next\` counts.

## Elite Insight

Diablo 2 uses a pair of LCGs for its item generation. One seed controls monster drops, another controls map layout. By saving both seeds, speedrunners can reproduce exact item drops. Nethack seeds its dungeon generator so that the same seed produces the same dungeon layout. Your RNG follows the same principle -- one seed, one reproducible world.

## Systems Thinking Connection

This deterministic RNG is the RPG equivalent of the Space Shooter's fixed timestep. Both enforce the rule: same input produces same output. The Shooter controls time; you control randomness. Same principle, different domain.

## Skill Reinforcement

Lesson 20 established a two-room dungeon. This lesson introduces the RNG that Lessons 22-25 will use for spawning, combat, loot, and state signatures. After this lesson, no randomness exists outside the RNG struct.

## Mastery Check

Question: Why must the RNG be a struct with explicit state instead of calling a global function like \`rand()\`?
Answer: Because \`rand()\` uses hidden global state that cannot be saved, loaded, or reproduced across runs. A struct-based RNG makes the state explicit -- you can save it, restore it, and guarantee the same sequence.`,
    starterCode: `#include <iostream>
using namespace std;

struct RNG { unsigned int state; };

// TODO: implement rng_seed(RNG& r, unsigned int s)
// Sets r.state = s

// TODO: implement rng_next(RNG& r) -> unsigned int
// state = state * 1664525u + 1013904223u; return state;

// TODO: implement rng_range(RNG& r, int lo, int hi) -> int
// return lo + (int)(rng_next(r) % (unsigned)(hi - lo + 1));

int main() {
    RNG rng;
    rng_seed(rng, 42);
    cout << "RNG_INIT|seed=42" << endl;

    int v1 = rng_range(rng, 1, 10);
    int v2 = rng_range(rng, 1, 10);
    int v3 = rng_range(rng, 1, 10);
    cout << "RNG_VAL|1=" << v1 << endl;
    cout << "RNG_VAL|2=" << v2 << endl;
    cout << "RNG_VAL|3=" << v3 << endl;

    // Re-seed and verify reproducibility
    rng_seed(rng, 42);
    cout << "RNG_RESEED|seed=42" << endl;

    int r1 = rng_range(rng, 1, 10);
    int r2 = rng_range(rng, 1, 10);
    int r3 = rng_range(rng, 1, 10);
    cout << "RNG_VAL|1=" << r1 << endl;
    cout << "RNG_VAL|2=" << r2 << endl;
    cout << "RNG_VAL|3=" << r3 << endl;

    bool match = (v1==r1 && v2==r2 && v3==r3);
    cout << "RNG_MATCH|" << (match ? "true" : "false") << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct RNG { unsigned int state; };

void rng_seed(RNG& r, unsigned int s) { r.state = s; }

unsigned int rng_next(RNG& r) {
    r.state = r.state * 1664525u + 1013904223u;
    return r.state;
}

int rng_range(RNG& r, int lo, int hi) {
    return lo + (int)(rng_next(r) % (unsigned)(hi - lo + 1));
}

int main() {
    RNG rng;
    rng_seed(rng, 42);
    cout << "RNG_INIT|seed=42" << endl;

    int v1 = rng_range(rng, 1, 10);
    int v2 = rng_range(rng, 1, 10);
    int v3 = rng_range(rng, 1, 10);
    cout << "RNG_VAL|1=" << v1 << endl;
    cout << "RNG_VAL|2=" << v2 << endl;
    cout << "RNG_VAL|3=" << v3 << endl;

    rng_seed(rng, 42);
    cout << "RNG_RESEED|seed=42" << endl;

    int r1 = rng_range(rng, 1, 10);
    int r2 = rng_range(rng, 1, 10);
    int r3 = rng_range(rng, 1, 10);
    cout << "RNG_VAL|1=" << r1 << endl;
    cout << "RNG_VAL|2=" << r2 << endl;
    cout << "RNG_VAL|3=" << r3 << endl;

    bool match = (v1==r1 && v2==r2 && v3==r3);
    cout << "RNG_MATCH|" << (match ? "true" : "false") << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "RNG initialized with seed 42", expectedOutput: "RNG_INIT|seed=42" },
      { id: "t2", description: "First RNG value generated", expectedOutput: "RNG_VAL|1=4" },
      { id: "t3", description: "Re-seed produces same sequence", expectedOutput: "RNG_MATCH|true" },
    ],
    hints: [
      "The RNG struct holds one unsigned int. rng_seed just assigns it.",
      "rng_next multiplies state by 1664525u, adds 1013904223u, stores back, and returns the new state.",
      "rng_range calls rng_next, then uses modulo: lo + (int)(rng_next(r) % (unsigned)(hi - lo + 1))",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: RNG-Driven Enemy Damage",
    type: "game_builder",
    instructions: `# Build: RNG-Driven Enemy Damage

## Mental Model

Now the RNG drives actual gameplay. Enemy damage rolls come from the seeded RNG, not from \`rand()\`. Same seed, same combat results. This is the foundation of replay-safe combat.

## What Breaks Without This

Without deterministic damage, you cannot:
- Replay a combat sequence to find a bug
- Balance damage values by testing specific seeds
- Verify that a save/load cycle produces the same result
- Ship a speedrun mode where runners compete on the same seed

## The Fix: RNG-Driven Combat Rolls

Create a WorldState struct that holds entity data and an RNG. Write a \`rollDamage\` function that uses \`rng_range\` to determine damage in [5, 15]. Run 3 turns of combat: player hits enemy, print damage and remaining HP. Then re-seed and run again -- results must match.

The RNG state advances with every roll. Turn 1 uses the first value. Turn 2 uses the second. The sequence is fixed by the seed.

## Key Concepts
- **RNG in WorldState** -- the RNG travels with game state
- **Damage rolls from seed** -- no \`rand()\`, no hidden state
- **Reproducible combat** -- same seed, same damage, same outcome
- **Turn-based consumption** -- each turn consumes one RNG value

## Performance Insight

Each damage roll costs 3 instructions (multiply, add, modulo). Zero memory allocation. Zero system calls. In a turn-based RPG, you might generate 10 random numbers per turn. That is 30 instructions total -- invisible on any CPU.

## Memory Insight

The RNG adds 4 bytes to WorldState. The combat function takes a reference to WorldState -- no copies. All damage computation happens on the stack in registers. Nothing touches the heap.

## Your Task

1. Create WorldState with entity arrays, entity_count, RNG, and seed.
2. Seed with 42. Player is entity 0 (HP 100). Enemy is entity 1 (HP 50).
3. Write \`rollDamage(WorldState& w, int lo, int hi)\` using \`rng_range(w.rng, lo, hi)\`.
4. Run 3 combat turns: player attacks enemy with damage [5, 15].
5. Re-seed with 42, reset enemy HP to 50, run 3 turns again.
6. Verify both runs produced identical damage.

Expected output:
\`\`\`
COMBAT_SEED|42
TURN|1|damage=D|enemy_hp=H
TURN|2|damage=D|enemy_hp=H
TURN|3|damage=D|enemy_hp=H
RESEED|42
TURN|1|damage=D|enemy_hp=H
TURN|2|damage=D|enemy_hp=H
TURN|3|damage=D|enemy_hp=H
COMBAT_DETERMINISTIC|true
\`\`\`

D and H are specific values computed by the LCG with seed 42 and range [5, 15].

## Beginner Trap

**Re-seeding between every damage roll.** If you call \`rng_seed(rng, 42)\` before every \`rollDamage\`, you get the same damage every turn. The RNG must advance naturally -- seed once at the start, then let the sequence flow.

## Elite Insight

Baldur's Gate uses deterministic RNG for combat rolls. When the game auto-saves before a boss fight, reloading and repeating the exact same actions produces the exact same damage values. Speedrunners exploit this to plan frame-perfect strategies. Your RNG enables the same kind of reproducible combat.

## Mastery Check

Question: If you add a loot drop between Turn 1 and Turn 2 that also calls \`rng_range\`, what happens to Turn 2's damage?
Answer: It changes. The loot drop consumed one RNG value, shifting the sequence. Turn 2 now gets what would have been Turn 3's value. This is why RNG call order must be deterministic -- same calls in same order, or the sequence diverges.`,
    starterCode: `#include <iostream>
using namespace std;
const int MAX_E = 16;

struct RNG { unsigned int state; };
void rng_seed(RNG& r, unsigned int s) { r.state = s; }
unsigned int rng_next(RNG& r) { r.state = r.state*1664525u+1013904223u; return r.state; }
int rng_range(RNG& r, int lo, int hi) { return lo+(int)(rng_next(r)%(unsigned)(hi-lo+1)); }

struct WorldState {
    int hp[MAX_E];
    bool alive[MAX_E];
    int entity_count;
    RNG rng;
    unsigned int seed;
};

// TODO: int rollDamage(WorldState& w, int lo, int hi)
// Use rng_range(w.rng, lo, hi)

int main() {
    WorldState w = {};
    w.seed = 42;
    rng_seed(w.rng, w.seed);
    w.entity_count = 2;
    w.hp[0] = 100; w.alive[0] = true;  // player
    w.hp[1] = 50;  w.alive[1] = true;  // enemy

    cout << "COMBAT_SEED|" << w.seed << endl;

    int dmg[3];
    for (int t = 0; t < 3; t++) {
        dmg[t] = rollDamage(w, 5, 15);
        w.hp[1] -= dmg[t];
        cout << "TURN|" << (t+1) << "|damage=" << dmg[t]
             << "|enemy_hp=" << w.hp[1] << endl;
    }

    // Re-seed and replay
    rng_seed(w.rng, w.seed);
    w.hp[1] = 50;
    cout << "RESEED|" << w.seed << endl;

    bool match = true;
    for (int t = 0; t < 3; t++) {
        int d = rollDamage(w, 5, 15);
        w.hp[1] -= d;
        cout << "TURN|" << (t+1) << "|damage=" << d
             << "|enemy_hp=" << w.hp[1] << endl;
        if (d != dmg[t]) match = false;
    }

    cout << "COMBAT_DETERMINISTIC|" << (match ? "true" : "false") << endl;
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
    int hp[MAX_E];
    bool alive[MAX_E];
    int entity_count;
    RNG rng;
    unsigned int seed;
};

int rollDamage(WorldState& w, int lo, int hi) {
    return rng_range(w.rng, lo, hi);
}

int main() {
    WorldState w = {};
    w.seed = 42;
    rng_seed(w.rng, w.seed);
    w.entity_count = 2;
    w.hp[0] = 100; w.alive[0] = true;
    w.hp[1] = 50;  w.alive[1] = true;

    cout << "COMBAT_SEED|" << w.seed << endl;

    int dmg[3];
    for (int t = 0; t < 3; t++) {
        dmg[t] = rollDamage(w, 5, 15);
        w.hp[1] -= dmg[t];
        cout << "TURN|" << (t+1) << "|damage=" << dmg[t]
             << "|enemy_hp=" << w.hp[1] << endl;
    }

    rng_seed(w.rng, w.seed);
    w.hp[1] = 50;
    cout << "RESEED|" << w.seed << endl;

    bool match = true;
    for (int t = 0; t < 3; t++) {
        int d = rollDamage(w, 5, 15);
        w.hp[1] -= d;
        cout << "TURN|" << (t+1) << "|damage=" << d
             << "|enemy_hp=" << w.hp[1] << endl;
        if (d != dmg[t]) match = false;
    }

    cout << "COMBAT_DETERMINISTIC|" << (match ? "true" : "false") << endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Combat seeded with 42", expectedOutput: "COMBAT_SEED|42" },
      { id: "g2", description: "Turn 1 damage dealt", expectedOutput: "TURN|1|damage=8|enemy_hp=42" },
      { id: "g3", description: "Turn 2 damage dealt", expectedOutput: "TURN|2|damage=11|enemy_hp=31" },
      { id: "g4", description: "Turn 3 damage dealt", expectedOutput: "TURN|3|damage=11|enemy_hp=20" },
      { id: "g5", description: "Combat is deterministic after reseed", expectedOutput: "COMBAT_DETERMINISTIC|true" },
    ],
    hints: [
      "rollDamage is a one-line wrapper around rng_range using w.rng.",
      "The function signature is: int rollDamage(WorldState& w, int lo, int hi) { return rng_range(w.rng, lo, hi); }",
      "Make sure you do NOT re-seed between rolls. Seed once at the start, then let the sequence advance naturally through each rollDamage call.",
    ],
    estimatedMinutes: 12,
  },
};