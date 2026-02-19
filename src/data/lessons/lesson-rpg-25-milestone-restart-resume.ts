import { Lesson } from "@/types/lesson";

export const lessonRPG25: Lesson = {
  id: "rpg-25-milestone-restart-resume",
  title: "Milestone: Restart and Resume",
  description: "Save state, reload, verify signature matches. Complete deterministic restart -- the closed loop proof.",
  order: 25,
  xpReward: 300,
  tier: "pro",
  concepts: ["milestone", "save/load round trip", "signature verification", "deterministic restart", "closed loop", "Phase 3 checkpoint"],
  part1: {
    title: "Concept: The Deterministic Closed Loop",
    type: "concept",
    instructions: `# Milestone: Restart and Resume

## Mental Model

This is the moment everything connects. Lessons 21-24 built four pieces: deterministic RNG (21), no-rand discipline (22), state signatures (23), and save/load (24). Now they form a closed loop: play the game, save state, reload, and the state signature matches exactly. If it matches, your architecture is deterministic. If it does not, something is broken.

## What Breaks Without This

Without the closed loop, you have individual features that might work in isolation but fail together. The RNG is seeded but maybe the save does not preserve the seed correctly. The signature computes but maybe the save misses a field. The closed loop is the integration test that proves everything works.

## The Fix: Save + Load + Signature Verify

The milestone contract:

\`\`\`cpp
// 1. Initialize world with seed
// 2. Run 5 combat ticks
// 3. Compute signature A
// 4. Save to buffer
// 5. Load from buffer into fresh WorldState
// 6. Compute signature B
// 7. Assert A == B
\`\`\`

If signature A equals signature B, the save/load round trip preserved every gameplay-relevant field. The RNG seed was saved. The player state was saved. The signature proves it.

This is the same pattern used in production game engines for save verification. Run the game, save, load, compare. If the hashes match, the save system is correct.

## Key Concepts
- **Closed loop** -- play, save, load, verify. The signature is the assertion.
- **Integration test** -- this milestone tests RNG + save + signature together
- **Signature as proof** -- one number proves the entire state matches
- **Deterministic foundation** -- this milestone unlocks Phase 3: Determinism and Reproducibility

## Performance Insight

The entire milestone -- 5 combat ticks, save, load, 2 signature computations -- runs in microseconds. The save buffer is 20 bytes. The signatures are 4 bytes each. This is negligible overhead for a complete correctness proof.

## Memory Insight

Everything lives on the stack: two WorldState structs, one save buffer, two signature values. Total additional memory: ~1KB. No heap allocation anywhere in the milestone. This is the memory discipline that Gate A (Lesson 30) will formalize.

## Your Task

1. WorldState: seed 42, player (1,1) HP 100, enemy (5,3) HP 50.
2. Run 5 combat ticks with damage [5,15] from the RNG.
3. Compute and print the signature after tick 5.
4. Save to buffer (version 1, seed 42, player hp, player pos).
5. Load into fresh WorldState.
6. Compute signature on loaded state.
7. Print whether signatures match.

Expected output:
\`\`\`
TICK|5|enemy_hp=2|signature=3629190905
SAVE|version=1|seed=42|hp=100|pos=1,1
LOAD|version=1|seed=42|hp=100|pos=1,1
SIGNATURE_MATCH|true
\`\`\`

## Beginner Trap

**Saving ALL state instead of just what is needed.** You do not need to save the enemy HP or the grid. The seed reconstructs enemies. The grid is built from constants. Save only: seed, player HP, player position. The signature still matches because the save captures the player state, and the enemy state is derived from the seed up to this point.

Wait -- actually, you DO need to save enough to reconstruct the signature. Since the signature includes enemy HP, and enemy HP depends on the 5 combat ticks, the save must either store enemy HP directly or store the RNG state so combat can be replayed. For this milestone, save the full player + enemy state to keep things simple.

## Elite Insight

FromSoftware's Dark Souls uses save verification checksums. When you load a save, the game recomputes a checksum and compares it to the stored value. If they diverge, the save is rejected as corrupted. Your signature serves the same purpose -- proving that the loaded state matches what was saved.

## Systems Thinking Connection

This closed loop is the RPG equivalent of the Robotics path's rosbag regression test. Record sensor data, play it back, compare outputs. If outputs match, the system is deterministic. Your save/load/signature loop is the same pattern applied to game state instead of robot state.

## Skill Reinforcement

This milestone integrates Lessons 21 (RNG), 22 (no-rand), 23 (signature), and 24 (save/load). Lesson 26 will add inventory to the world state. Lesson 30 will enforce the Heap Freeze gate, building on the memory discipline established here.

## Mastery Check

Question: If the signatures do not match after save/load, what is the most likely cause?
Answer: A field included in computeSignature was not included in the save/load. For example, if the signature hashes enemy HP but the save does not store it, the loaded state has default (zero) enemy HP. The signature changes. Fix: save every field that the signature hashes.`,
    starterCode: `#include <iostream>
#include <cstring>
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

struct SaveHeader { unsigned int version; unsigned int seed; };
struct SaveData { int player_hp; int player_x; int player_y; int enemy_hp; };

// TODO: int writeSave(char* buf, WorldState& w)
// TODO: bool readSave(const char* buf, WorldState& w)

int main() {
    WorldState w = {};
    w.seed = 42;
    rng_seed(w.rng, w.seed);
    w.entity_count = 2;
    w.pos_x[0]=1; w.pos_y[0]=1; w.hp[0]=100; w.alive[0]=true;
    w.pos_x[1]=5; w.pos_y[1]=3; w.hp[1]=50;  w.alive[1]=true;

    // Run 5 ticks
    for (int t = 0; t < 5; t++) {
        int dmg = rng_range(w.rng, 5, 15);
        w.hp[1] -= dmg;
    }

    unsigned int sigA = computeSignature(w);
    cout << "TICK|5|enemy_hp=" << w.hp[1] << "|signature=" << sigA << endl;

    // Save
    char buffer[256];
    writeSave(buffer, w);
    cout << "SAVE|version=1|seed=" << w.seed
         << "|hp=" << w.hp[0] << "|pos=" << w.pos_x[0] << "," << w.pos_y[0] << endl;

    // Load into fresh world
    WorldState w2 = {};
    w2.entity_count = 2;
    w2.pos_x[1]=5; w2.pos_y[1]=3; w2.alive[1]=true;
    readSave(buffer, w2);
    cout << "LOAD|version=1|seed=" << w2.seed
         << "|hp=" << w2.hp[0] << "|pos=" << w2.pos_x[0] << "," << w2.pos_y[0] << endl;

    unsigned int sigB = computeSignature(w2);
    cout << "SIGNATURE_MATCH|" << (sigA == sigB ? "true" : "false") << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cstring>
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

struct SaveHeader { unsigned int version; unsigned int seed; };
struct SaveData { int player_hp; int player_x; int player_y; int enemy_hp; };

int writeSave(char* buf, WorldState& w) {
    int offset = 0;
    SaveHeader hdr = {1, w.seed};
    SaveData data = {w.hp[0], w.pos_x[0], w.pos_y[0], w.hp[1]};
    memcpy(buf + offset, &hdr, sizeof(hdr)); offset += sizeof(hdr);
    memcpy(buf + offset, &data, sizeof(data)); offset += sizeof(data);
    return offset;
}

bool readSave(const char* buf, WorldState& w) {
    int offset = 0;
    SaveHeader hdr;
    SaveData data;
    memcpy(&hdr, buf + offset, sizeof(hdr)); offset += sizeof(hdr);
    if (hdr.version != 1) return false;
    memcpy(&data, buf + offset, sizeof(data)); offset += sizeof(data);
    w.seed = hdr.seed;
    rng_seed(w.rng, w.seed);
    w.hp[0] = data.player_hp;
    w.pos_x[0] = data.player_x;
    w.pos_y[0] = data.player_y;
    w.hp[1] = data.enemy_hp;
    w.alive[0] = true;
    return true;
}

int main() {
    WorldState w = {};
    w.seed = 42;
    rng_seed(w.rng, w.seed);
    w.entity_count = 2;
    w.pos_x[0]=1; w.pos_y[0]=1; w.hp[0]=100; w.alive[0]=true;
    w.pos_x[1]=5; w.pos_y[1]=3; w.hp[1]=50;  w.alive[1]=true;

    for (int t = 0; t < 5; t++) {
        int dmg = rng_range(w.rng, 5, 15);
        w.hp[1] -= dmg;
    }

    unsigned int sigA = computeSignature(w);
    cout << "TICK|5|enemy_hp=" << w.hp[1] << "|signature=" << sigA << endl;

    char buffer[256];
    writeSave(buffer, w);
    cout << "SAVE|version=1|seed=" << w.seed
         << "|hp=" << w.hp[0] << "|pos=" << w.pos_x[0] << "," << w.pos_y[0] << endl;

    WorldState w2 = {};
    w2.entity_count = 2;
    w2.pos_x[1]=5; w2.pos_y[1]=3; w2.alive[1]=true;
    readSave(buffer, w2);
    cout << "LOAD|version=1|seed=" << w2.seed
         << "|hp=" << w2.hp[0] << "|pos=" << w2.pos_x[0] << "," << w2.pos_y[0] << endl;

    unsigned int sigB = computeSignature(w2);
    cout << "SIGNATURE_MATCH|" << (sigA == sigB ? "true" : "false") << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Five ticks completed with signature", expectedOutput: "TICK|5|enemy_hp=2|signature=3629190905" },
      { id: "t2", description: "Save executed", expectedOutput: "SAVE|version=1|seed=42|hp=100|pos=1,1" },
      { id: "t3", description: "Load executed", expectedOutput: "LOAD|version=1|seed=42|hp=100|pos=1,1" },
      { id: "t4", description: "Signatures match after round trip", expectedOutput: "SIGNATURE_MATCH|true" },
    ],
    hints: [
      "writeSave must save enemy_hp in addition to player data -- the signature includes it.",
      "readSave must restore w.hp[1] from the saved enemy_hp so the signature matches.",
      "After readSave, w2 must have the same hp, pos_x, pos_y values for BOTH entities as w.",
    ],
    estimatedMinutes: 12,
  },
  part2: {
    title: "Build: Full Deterministic Restart",
    type: "game_builder",
    instructions: `# Build: Full Deterministic Restart

## Mental Model

The ultimate test: run 5 turns, save state (including RNG state), load into a fresh world, run 5 MORE turns from the loaded state. Then run the original world 5 more turns. Both must produce the same final signature. This proves that save/load preserves not just player data but the entire deterministic sequence.

## What Breaks Without This

A save that stores player HP and position but forgets the RNG state will produce different combat results after loading. The first 5 turns match (they happened before the save), but turns 6-10 diverge because the RNG is in a different state. The signature catches this immediately.

## The Fix: Save RNG State

The save must include the RNG's current state (not just the initial seed). On load, restore the RNG state directly. Then the sequence continues exactly where it left off.

\`\`\`cpp
// In SaveData, add: unsigned int rng_state;
// writeSave: data.rng_state = w.rng.state;
// readSave: w.rng.state = data.rng_state;
\`\`\`

## Key Concepts
- **RNG state preservation** -- save the current RNG state, not just the seed
- **Extended replay** -- loaded game continues producing identical random values
- **Divergence after load** -- if RNG state is wrong, post-load combat diverges
- **SIGNATURE_MATCH|true** -- the final assertion proving deterministic restart

## Performance Insight

Saving 4 extra bytes (RNG state) costs nothing. The extended test -- 10 total combat ticks, 2 signature computations, save/load round trip -- completes in microseconds. Correctness verification is free.

## Memory Insight

SaveData grows by 4 bytes to include rng_state. Total save size: 24 bytes. Two WorldState structs on the stack for comparison. Everything stack-allocated. Zero heap.

## Your Task

1. Seed 42. Player (1,1) HP 100, enemy (5,3) HP 50.
2. Run 5 combat ticks (damage [5,15]). Print tick 5 state.
3. Save to buffer (include RNG state).
4. Load into fresh WorldState (restore RNG state).
5. Run 5 MORE ticks from loaded state.
6. Run 5 MORE ticks from original state.
7. Compare final signatures.

Expected output:
\`\`\`
PHASE1|tick=5|enemy_hp=2|signature=3629190905
SAVE_COMPLETE|rng_saved=true
LOAD_COMPLETE|rng_restored=true
PHASE2_LOADED|tick=10|signature=3629449057
PHASE2_ORIGINAL|tick=10|signature=3629449057
SIGNATURE_MATCH|true
\`\`\`

## Beginner Trap

**Saving the initial seed instead of the current RNG state.** If you save seed=42 and call \`rng_seed(w.rng, 42)\` on load, the RNG resets to the beginning. Turns 6-10 replay turns 1-5 instead of continuing from turn 5. Save \`w.rng.state\` directly.

## Elite Insight

Nethack saves the exact RNG state in its save file. Loading a game and taking the same actions produces the same dungeon generation, monster spawns, and loot drops. Your save preserves the same property: load, continue, and the sequence is unbroken. This is how speedrunners verify that save/load does not alter the RNG sequence.

## Mastery Check

Question: After this milestone, what three systems form the deterministic closed loop?
Answer: Seeded RNG (controls all randomness), state signature (verifies correctness), and save/load (preserves state across sessions). Together they guarantee: same seed + same inputs = same results, even across save/load boundaries.`,
    starterCode: `#include <iostream>
#include <cstring>
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

struct SaveHeader { unsigned int version; unsigned int seed; };
struct SaveData { int player_hp; int px; int py; int enemy_hp; unsigned int rng_state; };

// TODO: int writeSave(char* buf, WorldState& w)
// Save header + data including w.rng.state

// TODO: bool readSave(const char* buf, WorldState& w)
// Restore all fields including w.rng.state = data.rng_state

int main() {
    // Original world
    WorldState w = {};
    w.seed = 42;
    rng_seed(w.rng, w.seed);
    w.entity_count = 2;
    w.pos_x[0]=1; w.pos_y[0]=1; w.hp[0]=100; w.alive[0]=true;
    w.pos_x[1]=5; w.pos_y[1]=3; w.hp[1]=50;  w.alive[1]=true;

    // Phase 1: 5 ticks
    for (int t = 0; t < 5; t++) {
        int dmg = rng_range(w.rng, 5, 15);
        w.hp[1] -= dmg;
    }
    unsigned int sig5 = computeSignature(w);
    cout << "PHASE1|tick=5|enemy_hp=" << w.hp[1] << "|signature=" << sig5 << endl;

    // Save
    char buffer[256];
    writeSave(buffer, w);
    cout << "SAVE_COMPLETE|rng_saved=true" << endl;

    // Load into fresh world
    WorldState w2 = {};
    w2.entity_count = 2;
    w2.pos_x[1]=5; w2.pos_y[1]=3; w2.alive[1]=true;
    readSave(buffer, w2);
    cout << "LOAD_COMPLETE|rng_restored=true" << endl;

    // Phase 2: 5 more ticks on loaded state
    for (int t = 0; t < 5; t++) {
        int dmg = rng_range(w2.rng, 5, 15);
        w2.hp[1] -= dmg;
    }
    unsigned int sigLoaded = computeSignature(w2);
    cout << "PHASE2_LOADED|tick=10|signature=" << sigLoaded << endl;

    // Phase 2: 5 more ticks on original state
    for (int t = 0; t < 5; t++) {
        int dmg = rng_range(w.rng, 5, 15);
        w.hp[1] -= dmg;
    }
    unsigned int sigOrig = computeSignature(w);
    cout << "PHASE2_ORIGINAL|tick=10|signature=" << sigOrig << endl;

    cout << "SIGNATURE_MATCH|" << (sigLoaded == sigOrig ? "true" : "false") << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
#include <cstring>
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

struct SaveHeader { unsigned int version; unsigned int seed; };
struct SaveData { int player_hp; int px; int py; int enemy_hp; unsigned int rng_state; };

int writeSave(char* buf, WorldState& w) {
    int offset = 0;
    SaveHeader hdr = {1, w.seed};
    SaveData data = {w.hp[0], w.pos_x[0], w.pos_y[0], w.hp[1], w.rng.state};
    memcpy(buf + offset, &hdr, sizeof(hdr)); offset += sizeof(hdr);
    memcpy(buf + offset, &data, sizeof(data)); offset += sizeof(data);
    return offset;
}

bool readSave(const char* buf, WorldState& w) {
    int offset = 0;
    SaveHeader hdr;
    SaveData data;
    memcpy(&hdr, buf + offset, sizeof(hdr)); offset += sizeof(hdr);
    if (hdr.version != 1) return false;
    memcpy(&data, buf + offset, sizeof(data)); offset += sizeof(data);
    w.seed = hdr.seed;
    w.hp[0] = data.player_hp;
    w.pos_x[0] = data.px;
    w.pos_y[0] = data.py;
    w.hp[1] = data.enemy_hp;
    w.rng.state = data.rng_state;
    w.alive[0] = true;
    return true;
}

int main() {
    WorldState w = {};
    w.seed = 42;
    rng_seed(w.rng, w.seed);
    w.entity_count = 2;
    w.pos_x[0]=1; w.pos_y[0]=1; w.hp[0]=100; w.alive[0]=true;
    w.pos_x[1]=5; w.pos_y[1]=3; w.hp[1]=50;  w.alive[1]=true;

    for (int t = 0; t < 5; t++) {
        int dmg = rng_range(w.rng, 5, 15);
        w.hp[1] -= dmg;
    }
    unsigned int sig5 = computeSignature(w);
    cout << "PHASE1|tick=5|enemy_hp=" << w.hp[1] << "|signature=" << sig5 << endl;

    char buffer[256];
    writeSave(buffer, w);
    cout << "SAVE_COMPLETE|rng_saved=true" << endl;

    WorldState w2 = {};
    w2.entity_count = 2;
    w2.pos_x[1]=5; w2.pos_y[1]=3; w2.alive[1]=true;
    readSave(buffer, w2);
    cout << "LOAD_COMPLETE|rng_restored=true" << endl;

    for (int t = 0; t < 5; t++) {
        int dmg = rng_range(w2.rng, 5, 15);
        w2.hp[1] -= dmg;
    }
    unsigned int sigLoaded = computeSignature(w2);
    cout << "PHASE2_LOADED|tick=10|signature=" << sigLoaded << endl;

    for (int t = 0; t < 5; t++) {
        int dmg = rng_range(w.rng, 5, 15);
        w.hp[1] -= dmg;
    }
    unsigned int sigOrig = computeSignature(w);
    cout << "PHASE2_ORIGINAL|tick=10|signature=" << sigOrig << endl;

    cout << "SIGNATURE_MATCH|" << (sigLoaded == sigOrig ? "true" : "false") << endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Phase 1 complete with signature", expectedOutput: "PHASE1|tick=5|enemy_hp=2|signature=3629190905" },
      { id: "g2", description: "Save includes RNG state", expectedOutput: "SAVE_COMPLETE|rng_saved=true" },
      { id: "g3", description: "Load restores RNG state", expectedOutput: "LOAD_COMPLETE|rng_restored=true" },
      { id: "g4", description: "Loaded state produces correct extended signature", expectedOutput: "PHASE2_LOADED|tick=10|signature=3629449057" },
      { id: "g5", description: "Original state produces same extended signature", expectedOutput: "PHASE2_ORIGINAL|tick=10|signature=3629449057" },
      { id: "g6", description: "Final signatures match - determinism proven", expectedOutput: "SIGNATURE_MATCH|true" },
    ],
    hints: [
      "writeSave must include w.rng.state in the SaveData struct -- not just the seed.",
      "readSave must set w.rng.state = data.rng_state directly, not call rng_seed.",
      "Both worlds must have the same entity_count, positions, and alive flags for signatures to match.",
    ],
    estimatedMinutes: 20,
  },
};