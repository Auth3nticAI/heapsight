import { Lesson } from "@/types/lesson";

export const lessonRPG23: Lesson = {
  id: "rpg-23-state-signature-v0",
  title: "State Signature v0",
  description: "Hash game state each tick with hashCombine to detect hidden mutations and verify determinism.",
  order: 23,
  xpReward: 100,
  tier: "pro",
  concepts: ["state signature", "hash combining", "determinism verification", "observable state", "hs_metrics.h"],
  part1: {
    title: "Concept: State Signatures",
    type: "concept",
    instructions: `# State Signature v0

## Mental Model

A state signature is a single number that represents the entire game state. If any value changes -- HP, position, entity count -- the signature changes. Think of it as a fingerprint for your world. Same state, same signature. Different state, different signature. This is how you verify determinism: run the same inputs twice, compare signatures.

## What Breaks Without This

Your RNG is seeded. Your combat is deterministic. But how do you PROVE it? Without a signature, you must compare every field in the world struct manually. With 16 entities, each with position, HP, and alive status, that is 80+ values to check. A signature collapses all of that into one number.

Worse: hidden mutations become invisible. If a bug changes one HP value by 1, you might not notice until ten turns later when combat diverges. A signature catches it immediately -- the number changes the tick the mutation happens.

## The Fix: hashCombine

The \`hashCombine\` function folds a new value into an existing hash:

\`\`\`cpp
unsigned int hashCombine(unsigned int s, unsigned int v) {
    return s ^ (v + 0x9e3779b9u + (s << 6) + (s >> 2));
}
\`\`\`

The magic constant \`0x9e3779b9\` comes from the golden ratio. The bit shifts spread entropy across the hash. This is the same technique used in Boost's hash_combine and many game engines.

To compute a signature, fold every relevant value into the hash:

\`\`\`cpp
unsigned int computeSignature(WorldState& w) {
    unsigned int sig = 0;
    for (int i = 0; i < w.entity_count; i++) {
        sig = hashCombine(sig, (unsigned int)w.hp[i]);
        sig = hashCombine(sig, (unsigned int)w.pos_x[i]);
        sig = hashCombine(sig, (unsigned int)w.pos_y[i]);
    }
    return sig;
}
\`\`\`

## Key Concepts
- **hashCombine** -- folds one value into a running hash. Order matters.
- **State signature** -- one number representing the entire game state
- **Determinism proof** -- same inputs produce same signature
- **Mutation detection** -- any hidden state change flips the signature

## Performance Insight

hashCombine is 5 operations: XOR, add, shift left, shift right, add. For 16 entities with 3 values each, that is 48 calls = 240 operations. Negligible. You can compute a signature every tick without measurable cost.

## Memory Insight

The signature is one unsigned int -- 4 bytes. It does not allocate. It does not grow. Storing a history of signatures for replay verification costs 4 bytes per tick. A 1000-tick game stores 4KB of signature history. Trivial.

## Your Task

Implement \`hashCombine\` and \`computeSignature\`. Create a world with player at (1,1) HP 100 and enemy at (5,3) HP 30. Compute the signature before and after dealing 10 damage to the enemy.

Expected output:
\`\`\`
ENTITY|0|pos=1,1|hp=100
ENTITY|1|pos=5,3|hp=30
SIGNATURE|before=3631159158
DAMAGE|eid=1|amount=10
ENTITY|1|pos=5,3|hp=20
SIGNATURE|after=3629166032
SIGNATURE_CHANGED|true
\`\`\`

## Beginner Trap

**Hashing only HP and forgetting position.** If you move an entity without updating the signature, two different game states produce the same hash. The signature must include EVERY value that affects gameplay. If it changes behavior, it must be in the hash.

## Elite Insight

Valve's Source engine uses CRC32 checksums on entity state for network synchronization. When a client's state diverges from the server, the checksum mismatch triggers a correction. Your signature is the same idea at a simpler scale -- detect divergence immediately, not after symptoms appear.

## Systems Thinking Connection

This state signature is the RPG equivalent of the Platformer's physics state hash. Both answer the same question: is the state identical? The Platformer hashes position and velocity for replay verification. You hash HP and position for determinism proof. Same pattern, different data.

## Skill Reinforcement

Lesson 22 enforced the no-rand rule. This lesson makes state observable. Lesson 24 will serialize state to a save file. Lesson 25 will combine all three: save state, reload, verify the signature matches.

## Mastery Check

Question: If two different game states produce the same signature, what happened?
Answer: A hash collision. It is theoretically possible but astronomically unlikely with a good hash function. In practice, if signatures match, states match. If they differ, states differ -- guaranteed.`,
    starterCode: `#include <iostream>
using namespace std;
const int MAX_E = 16;

struct WorldState {
    int pos_x[MAX_E], pos_y[MAX_E];
    int hp[MAX_E]; bool alive[MAX_E];
    int entity_count;
};

// TODO: unsigned int hashCombine(unsigned int s, unsigned int v)
// return s ^ (v + 0x9e3779b9u + (s << 6) + (s >> 2));

// TODO: unsigned int computeSignature(WorldState& w)
// Fold hp[i], pos_x[i], pos_y[i] for each entity into hash

int main() {
    WorldState w = {};
    w.entity_count = 2;
    w.pos_x[0]=1; w.pos_y[0]=1; w.hp[0]=100; w.alive[0]=true;
    w.pos_x[1]=5; w.pos_y[1]=3; w.hp[1]=30;  w.alive[1]=true;

    for (int i=0; i<w.entity_count; i++)
        cout<<"ENTITY|"<<i<<"|pos="<<w.pos_x[i]<<","<<w.pos_y[i]<<"|hp="<<w.hp[i]<<endl;

    unsigned int sig_before = computeSignature(w);
    cout << "SIGNATURE|before=" << sig_before << endl;

    w.hp[1] -= 10;
    cout << "DAMAGE|eid=1|amount=10" << endl;
    cout << "ENTITY|1|pos=" << w.pos_x[1] << "," << w.pos_y[1] << "|hp=" << w.hp[1] << endl;

    unsigned int sig_after = computeSignature(w);
    cout << "SIGNATURE|after=" << sig_after << endl;
    cout << "SIGNATURE_CHANGED|" << (sig_before != sig_after ? "true" : "false") << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;
const int MAX_E = 16;

struct WorldState {
    int pos_x[MAX_E], pos_y[MAX_E];
    int hp[MAX_E]; bool alive[MAX_E];
    int entity_count;
};

unsigned int hashCombine(unsigned int s, unsigned int v) {
    return s ^ (v + 0x9e3779b9u + (s << 6) + (s >> 2));
}

unsigned int computeSignature(WorldState& w) {
    unsigned int sig = 0;
    for (int i = 0; i < w.entity_count; i++) {
        sig = hashCombine(sig, (unsigned int)w.hp[i]);
        sig = hashCombine(sig, (unsigned int)w.pos_x[i]);
        sig = hashCombine(sig, (unsigned int)w.pos_y[i]);
    }
    return sig;
}

int main() {
    WorldState w = {};
    w.entity_count = 2;
    w.pos_x[0]=1; w.pos_y[0]=1; w.hp[0]=100; w.alive[0]=true;
    w.pos_x[1]=5; w.pos_y[1]=3; w.hp[1]=30;  w.alive[1]=true;

    for (int i=0; i<w.entity_count; i++)
        cout<<"ENTITY|"<<i<<"|pos="<<w.pos_x[i]<<","<<w.pos_y[i]<<"|hp="<<w.hp[i]<<endl;

    unsigned int sig_before = computeSignature(w);
    cout << "SIGNATURE|before=" << sig_before << endl;

    w.hp[1] -= 10;
    cout << "DAMAGE|eid=1|amount=10" << endl;
    cout << "ENTITY|1|pos=" << w.pos_x[1] << "," << w.pos_y[1] << "|hp=" << w.hp[1] << endl;

    unsigned int sig_after = computeSignature(w);
    cout << "SIGNATURE|after=" << sig_after << endl;
    cout << "SIGNATURE_CHANGED|" << (sig_before != sig_after ? "true" : "false") << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Signature before damage", expectedOutput: "SIGNATURE|before=3631159158" },
      { id: "t2", description: "Damage dealt", expectedOutput: "DAMAGE|eid=1|amount=10" },
      { id: "t3", description: "Signature changed", expectedOutput: "SIGNATURE_CHANGED|true" },
      { id: "t4", description: "Signature after damage", expectedOutput: "SIGNATURE|after=3629166032" },
    ],
    hints: [
      "hashCombine is one return statement: s ^ (v + 0x9e3779b9u + (s << 6) + (s >> 2))",
      "computeSignature loops 0 to entity_count, folding hp, pos_x, pos_y into the hash.",
      "Cast int to unsigned int: hashCombine(sig, (unsigned int)w.hp[i])",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: Signature-Verified Combat Tick",
    type: "game_builder",
    instructions: `# Build: Signature-Verified Combat Tick

## Mental Model

Now signatures run every tick alongside combat. After each damage roll, the state changes and the signature changes with it. Print the signature each tick and watch it evolve. If you replay the same seed and signatures diverge, you have a determinism bug.

## What Breaks Without This

Without per-tick signatures, a determinism bug might hide for dozens of turns. The combat looks correct, the damage looks right, but one entity's position was off by 1 since turn 3. By turn 20, the cascade has made the game unrecognizable. Per-tick signatures catch the divergence at turn 3.

## The Fix: Signature After Every State Change

After each combat tick:
1. Roll damage from RNG
2. Apply damage to enemy HP
3. Compute new signature
4. Print the signature

## Key Concepts
- **Per-tick hashing** -- compute signature after every state mutation
- **Signature trail** -- a sequence of hashes that uniquely identifies a run
- **Divergence detection** -- if signature at tick N differs between runs, tick N has a bug
- **RNG + signature synergy** -- deterministic RNG ensures same mutations; signature verifies it

## Performance Insight

Computing a signature for 2 entities costs around 30 operations. Even 16 entities costs around 240 operations per tick. In a turn-based RPG with one tick per player action, the signature cost is invisible.

## Memory Insight

Each signature is 4 bytes. A trace of 100 tick signatures costs 400 bytes. You could store 10,000 tick signatures in under 40KB. Negligible compared to the game state itself.

## Your Task

1. WorldState with player (1,1) HP 100 and enemy (5,3) HP 50.
2. Seed RNG with 42.
3. Print initial signature.
4. Run 3 combat ticks: roll damage [5,15], apply, print signature.
5. Print final signature.

Expected output:
\`\`\`
TICK|0|signature=3631111004
TICK|1|damage=8|enemy_hp=42|signature=3631208539
TICK|2|damage=11|enemy_hp=31|signature=3631171079
TICK|3|damage=11|enemy_hp=20|signature=3629166032
FINAL_SIGNATURE|3629166032
\`\`\`

## Beginner Trap

**Computing the signature BEFORE applying damage.** The signature must reflect state AFTER the mutation. If you hash before applying damage, the signature represents the old state. Compute signature last in the tick.

## Elite Insight

The Source engine uses entity state checksums for multiplayer synchronization. Every frame, the server computes a hash of all entity states. Clients compute the same hash. Divergence triggers a correction. Your per-tick signature is the single-player version -- detecting desync between runs instead of between machines.

## Mastery Check

Question: If you add a new entity field like armor but forget to include it in computeSignature, what happens?
Answer: Two runs with different armor values produce the same signature. The signature fails to detect a real state difference. Every gameplay-relevant field must be in the hash.`,
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

unsigned int hashCombine(unsigned int s, unsigned int v) {
    return s ^ (v + 0x9e3779b9u + (s << 6) + (s >> 2));
}

// TODO: unsigned int computeSignature(WorldState& w)

// TODO: int rollDamage(WorldState& w, int lo, int hi)

int main() {
    WorldState w = {};
    w.seed = 42;
    rng_seed(w.rng, w.seed);
    w.entity_count = 2;
    w.pos_x[0]=1; w.pos_y[0]=1; w.hp[0]=100; w.alive[0]=true;
    w.pos_x[1]=5; w.pos_y[1]=3; w.hp[1]=50;  w.alive[1]=true;

    unsigned int sig = computeSignature(w);
    cout << "TICK|0|signature=" << sig << endl;

    for (int t = 1; t <= 3; t++) {
        int dmg = rollDamage(w, 5, 15);
        w.hp[1] -= dmg;
        sig = computeSignature(w);
        cout << "TICK|" << t << "|damage=" << dmg
             << "|enemy_hp=" << w.hp[1]
             << "|signature=" << sig << endl;
    }

    cout << "FINAL_SIGNATURE|" << sig << endl;
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

unsigned int hashCombine(unsigned int s, unsigned int v) {
    return s ^ (v + 0x9e3779b9u + (s << 6) + (s >> 2));
}

unsigned int computeSignature(WorldState& w) {
    unsigned int sig = 0;
    for (int i = 0; i < w.entity_count; i++) {
        sig = hashCombine(sig, (unsigned int)w.hp[i]);
        sig = hashCombine(sig, (unsigned int)w.pos_x[i]);
        sig = hashCombine(sig, (unsigned int)w.pos_y[i]);
    }
    return sig;
}

int rollDamage(WorldState& w, int lo, int hi) {
    return rng_range(w.rng, lo, hi);
}

int main() {
    WorldState w = {};
    w.seed = 42;
    rng_seed(w.rng, w.seed);
    w.entity_count = 2;
    w.pos_x[0]=1; w.pos_y[0]=1; w.hp[0]=100; w.alive[0]=true;
    w.pos_x[1]=5; w.pos_y[1]=3; w.hp[1]=50;  w.alive[1]=true;

    unsigned int sig = computeSignature(w);
    cout << "TICK|0|signature=" << sig << endl;

    for (int t = 1; t <= 3; t++) {
        int dmg = rollDamage(w, 5, 15);
        w.hp[1] -= dmg;
        sig = computeSignature(w);
        cout << "TICK|" << t << "|damage=" << dmg
             << "|enemy_hp=" << w.hp[1]
             << "|signature=" << sig << endl;
    }

    cout << "FINAL_SIGNATURE|" << sig << endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Initial signature", expectedOutput: "TICK|0|signature=3631111004" },
      { id: "g2", description: "Tick 1 correct", expectedOutput: "TICK|1|damage=8|enemy_hp=42|signature=3631208539" },
      { id: "g3", description: "Tick 2 correct", expectedOutput: "TICK|2|damage=11|enemy_hp=31|signature=3631171079" },
      { id: "g4", description: "Tick 3 correct", expectedOutput: "TICK|3|damage=11|enemy_hp=20|signature=3629166032" },
      { id: "g5", description: "Final signature", expectedOutput: "FINAL_SIGNATURE|3629166032" },
    ],
    hints: [
      "computeSignature loops 0 to entity_count, folding hp, pos_x, pos_y into the hash.",
      "rollDamage is a one-liner: return rng_range(w.rng, lo, hi)",
      "Compute signature AFTER applying damage, not before.",
    ],
    estimatedMinutes: 15,
  },
};