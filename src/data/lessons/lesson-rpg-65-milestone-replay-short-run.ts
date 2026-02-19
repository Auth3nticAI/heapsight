import { Lesson } from "@/types/lesson";

export const lessonRPG65: Lesson = {
  id: "rpg-65-milestone-replay-short-run",
  title: "Milestone: Replay a Short Run",
  description: "Ghost run repeats exactly. Record a game session (seed + commands), replay with the same seed, verify final state signatures match.",
  order: 65,
  xpReward: 300,
  tier: "pro",
  concepts: ["replay verification", "state signature", "deterministic replay", "hashCombine", "record and playback", "Phase 7 milestone"],
  part1: {
    title: "Concept: Milestone: Replay a Short Run",
    type: "concept",
    instructions: `# Milestone: Replay a Short Run

## Mental Model

Replay verification is the moment of truth for a deterministic engine. You run the game once, recording every input and the RNG seed. Then you start a fresh game with the same seed, feed the exact same commands, and compare the final state. If the state signatures match, your engine is deterministic. If they diverge, you have a bug.

The state signature is a hash of every observable value: player position, HP, gold, turn count, and the RNG state itself. The hash function is \`hashCombine\` â the same one Boost uses. It mixes each value into a running hash so that any single-bit difference produces a completely different signature.

This is the Replay Proof of Concept. L64 built the replay log. This lesson connects it to a full record-then-replay cycle.

## What Breaks Without This

\`\`\`cpp
// Record phase: seed=42, commands=[4,4,2,5,4]
// Final signature: 0xABCD1234

// Replay phase: seed=42, same commands
// Final signature: 0xABCD5678  // DIFFERENT!

// The game is NOT deterministic.
// Something mutated state outside the controlled pipeline.
// Maybe an uninitialized variable. Maybe a stray rand() call.
// Without replay verification, this bug is invisible.
\`\`\`

Without this milestone, you have no proof that your RNG discipline, command pipeline, and state management actually work together. Each piece might pass in isolation. The integration test is what catches ordering bugs, uninitialized fields, and hidden state.

## The Fix: hashCombine for State Signatures

\`\`\`cpp
unsigned int hashCombine(unsigned int s, int v) {
    s ^= (unsigned int)v + 0x9e3779b9 + (s<<6) + (s>>2);
    return s;
}

unsigned int computeSignature(const World& w) {
    unsigned int s = 0;
    s = hashCombine(s, w.px);
    s = hashCombine(s, w.py);
    s = hashCombine(s, w.hp);
    s = hashCombine(s, w.gold);
    s = hashCombine(s, w.turn);
    s = hashCombine(s, (int)w.seed);
    return s;
}
\`\`\`

The \`0x9e3779b9\` constant is the golden ratio in hex. The bit shifts spread entropy across the entire 32-bit space. This is not cryptographic â it is fast and sufficient for detecting state divergence.

## Key Concepts

- **Record phase** â run the game with a seed and command sequence, compute the final state signature.
- **Replay phase** â re-initialize with the same seed, feed the same commands, compute the signature again.
- **Signature comparison** â if the two signatures match, the engine is deterministic for this run.
- **hashCombine** â a fast, non-cryptographic hash that mixes each state field into a running signature.
- **Integration test** â this tests the entire pipeline: RNG, movement, combat, state management, all at once.

## Performance Insight

\`hashCombine\` is 4 operations: XOR, add, shift-left, shift-right. On modern hardware, this executes in a single cycle. Computing the signature for a World struct with 6 fields is 24 operations â effectively free. You could compute it every tick without measurable overhead.

## Memory Insight

The signature is a single \`unsigned int\` â 4 bytes. The entire replay verification system adds no heap allocation: the World struct is on the stack, the ReplayLog is on the stack, and the signatures are local variables. Total additional memory for replay verification: 8 bytes (two signatures).

## Your Task

Implement \`computeSignature\` using \`hashCombine\`. The framework provides World, RNG, and tick functions. Run 5 turns with seed 42 and commands [4,4,2,5,4], then compute and print the signature.

Expected output:
\`\`\`
REPLAY_MILESTONE|seed=42
TICK|turn=0|cmd=4|px=2|py=1
TICK|turn=1|cmd=4|px=3|py=1
TICK|turn=2|cmd=2|px=3|py=2
TICK|turn=3|cmd=5|px=3|py=2
TICK|turn=4|cmd=4|px=4|py=2
SIGNATURE|<hex_value>
\`\`\`

## Beginner Trap

**Forgetting to hash the seed.** If you hash only px, py, hp, gold, and turn â but not the seed â then two runs with different seeds that happen to end at the same position would produce identical signatures. The seed is part of the state. Always include it.

## Elite Insight

Quake III Arena used a similar approach for its netcode: the server computed a checksum of the game state each frame and compared it with the client's checksum. Divergence meant a desync bug. id Software's \`Com_BlockChecksum\` function is a more complex version of your \`hashCombine\`. The principle is identical: hash the state, compare the hash, trust the math.

## Systems Thinking Connection

The Space Shooter path computes frame signatures using entity position arrays. The RPG computes turn signatures using the World struct. The Platformer computes physics signatures from accumulator state. Different temporal resolutions, different data shapes, identical verification pattern: hash the observable state, compare across runs.

## Skill Reinforcement

L21 introduced the RNG. L22 enforced the no-rand rule. L23 introduced state signatures with hashCombine. L64 built the replay log. This lesson integrates all four: RNG seed + logged commands + state signature + replay = determinism proof. L66âL70 will formalize this into the Gate B requirement.

## Mastery Check

Question: Why must hashCombine use XOR with bit shifts instead of simple addition?
Answer: Addition is linear â hashCombine(0, 1) + hashCombine(0, 2) could collide with hashCombine(0, 3). XOR with shifts spreads each input's entropy across the full 32-bit space, making collisions exponentially less likely. Two states that differ by a single bit will produce completely different signatures.`,
    starterCode: `#include <iostream>
using namespace std;

const int W = 10, H = 10;

struct RNG { unsigned int state; };
void rng_seed(RNG& r, unsigned int s) { r.state = s; }
unsigned int rng_next(RNG& r) { r.state = r.state * 1664525u + 1013904223u; return r.state; }
int rng_range(RNG& r, int lo, int hi) { return lo + (int)(rng_next(r) % (unsigned)(hi - lo + 1)); }

struct World {
    int px, py, hp, gold, turn;
    unsigned int seed;
    RNG rng;
};

void initWorld(World& w, unsigned int seed) {
    w.px = 1; w.py = 1; w.hp = 30; w.gold = 0; w.turn = 0;
    w.seed = seed;
    rng_seed(w.rng, seed);
}

void tick(World& w, int cmd) {
    if (cmd == 1 && w.py > 1) w.py--;
    else if (cmd == 2 && w.py < H - 2) w.py++;
    else if (cmd == 3 && w.px > 1) w.px--;
    else if (cmd == 4 && w.px < W - 2) w.px++;
    // cmd 5 = attack (no move)
    cout << "TICK|turn=" << w.turn << "|cmd=" << cmd
         << "|px=" << w.px << "|py=" << w.py << endl;
    w.turn++;
}

unsigned int hashCombine(unsigned int s, int v) {
    s ^= (unsigned int)v + 0x9e3779b9 + (s << 6) + (s >> 2);
    return s;
}

// TODO: Implement computeSignature(const World& w)
// Hash all fields: px, py, hp, gold, turn, seed
// Use hashCombine to fold each field into a running hash starting from 0
// Return the final unsigned int

int main() {
    World w;
    initWorld(w, 42);

    cout << "REPLAY_MILESTONE|seed=" << w.seed << endl;

    int commands[] = {4, 4, 2, 5, 4};
    for (int i = 0; i < 5; i++) {
        tick(w, commands[i]);
    }

    // TODO: Call computeSignature(w) and print:
    // cout << "SIGNATURE|" << hex << sig << endl;

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int W = 10, H = 10;

struct RNG { unsigned int state; };
void rng_seed(RNG& r, unsigned int s) { r.state = s; }
unsigned int rng_next(RNG& r) { r.state = r.state * 1664525u + 1013904223u; return r.state; }
int rng_range(RNG& r, int lo, int hi) { return lo + (int)(rng_next(r) % (unsigned)(hi - lo + 1)); }

struct World {
    int px, py, hp, gold, turn;
    unsigned int seed;
    RNG rng;
};

void initWorld(World& w, unsigned int seed) {
    w.px = 1; w.py = 1; w.hp = 30; w.gold = 0; w.turn = 0;
    w.seed = seed;
    rng_seed(w.rng, seed);
}

void tick(World& w, int cmd) {
    if (cmd == 1 && w.py > 1) w.py--;
    else if (cmd == 2 && w.py < H - 2) w.py++;
    else if (cmd == 3 && w.px > 1) w.px--;
    else if (cmd == 4 && w.px < W - 2) w.px++;
    cout << "TICK|turn=" << w.turn << "|cmd=" << cmd
         << "|px=" << w.px << "|py=" << w.py << endl;
    w.turn++;
}

unsigned int hashCombine(unsigned int s, int v) {
    s ^= (unsigned int)v + 0x9e3779b9 + (s << 6) + (s >> 2);
    return s;
}

unsigned int computeSignature(const World& w) {
    unsigned int s = 0;
    s = hashCombine(s, w.px);
    s = hashCombine(s, w.py);
    s = hashCombine(s, w.hp);
    s = hashCombine(s, w.gold);
    s = hashCombine(s, w.turn);
    s = hashCombine(s, (int)w.seed);
    return s;
}

int main() {
    World w;
    initWorld(w, 42);

    cout << "REPLAY_MILESTONE|seed=" << w.seed << endl;

    int commands[] = {4, 4, 2, 5, 4};
    for (int i = 0; i < 5; i++) {
        tick(w, commands[i]);
    }

    unsigned int sig = computeSignature(w);
    cout << "SIGNATURE|" << hex << sig << endl;

    return 0;
}`,
    tests: [
      { id: "t1", description: "Replay milestone header", expectedOutput: "REPLAY_MILESTONE|seed=42", isPattern: false },
      { id: "t2", description: "First tick correct", expectedOutput: "TICK|turn=0|cmd=4|px=2|py=1", isPattern: false },
      { id: "t3", description: "Attack does not move", expectedOutput: "TICK|turn=3|cmd=5|px=3|py=2", isPattern: false },
      { id: "t4", description: "Five ticks complete", expectedOutput: "TICK|turn=4|cmd=4|px=4|py=2", isPattern: false },
      { id: "t5", description: "Signature computed", expectedOutput: "SIGNATURE|", isPattern: true },
    ],
    hints: [
      "computeSignature starts with s = 0, then folds each field with hashCombine. Order matters: px, py, hp, gold, turn, seed.",
      "hashCombine uses XOR, addition, and bit shifts. The function is already provided â just call it for each field.",
      "Print the signature with hex manipulator: cout << hex << sig. This shows the hash in hexadecimal.",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: Replay Verification",
    type: "game_builder",
    instructions: `# Build: Replay Verification

## Mental Model

This is the full replay verification cycle. Phase 1: record. Phase 2: replay. Phase 3: compare. The game runs a 5-turn simulation, logs every command, computes the final state signature. Then it re-initializes with the same seed, feeds the logged commands back, and computes the signature again. If both signatures match, determinism is proven for this run.

This is the Replay Proof of Concept â the integration test that validates everything built since L21.

## What Breaks Without This

Without the full record-replay-compare cycle, you have individual pieces that might work in isolation but fail together. The RNG might be seeded correctly. The command log might record accurately. The tick function might be pure. But if any hidden state leaks between the record and replay phases â an uninitialized variable, a stale pointer, a global counter â the signatures diverge. This test catches integration bugs that unit tests cannot.

## The Fix: Record-Replay-Compare Pipeline

\`\`\`cpp
// Record phase
World rec;
initWorld(rec, 42);
ReplayLog log = {};
for (int i = 0; i < 5; i++) {
    logCommand(log, rec.turn, commands[i]);
    tick(rec, commands[i]);
}
unsigned int recSig = computeSignature(rec);

// Replay phase
World rep;
initWorld(rep, 42);  // same seed
for (int i = 0; i < log.count; i++) {
    tick(rep, log.entries[i].command);  // commands from log
}
unsigned int repSig = computeSignature(rep);

// Compare
bool match = (recSig == repSig);
\`\`\`

The record phase uses the raw command array. The replay phase uses the logged commands. If the log recorded correctly and the engine is deterministic, both signatures are identical.

## Key Concepts

- **Two-phase execution** â record and replay are separate runs with separate World instances.
- **Log as input source** â during replay, commands come from the log, not from a hardcoded array.
- **Signature as proof** â the hash is the only comparison. No field-by-field checking needed.
- **Fresh initialization** â the replay phase calls initWorld with the same seed. No state leaks from the record phase.

## Performance Insight

The entire verification runs in microseconds: 10 ticks (5 record + 5 replay) and 12 hash operations (6 fields x 2 signatures). On modern hardware, this completes before the next cache miss. The cost of correctness verification is effectively zero.

## Memory Insight

Two World structs (~50 bytes each) + one ReplayLog (~2 KB) + two signature ints (8 bytes) = ~2.1 KB total. Everything on the stack. Zero heap. The replay verification system fits in L1 cache with room to spare.

## Your Task

Complete the replay verification pipeline:
1. Record phase: run 5 turns with seed 42 and commands [4,4,2,5,4], log each command, compute signature
2. Replay phase: re-init with seed 42, feed commands from the log, compute signature
3. Compare signatures and print REPLAY_MATCH|true or REPLAY_MATCH|false
4. Print the dungeon grid, entity info, and game state

Expected output:
\`\`\`
DUNGEON|rpg-v0
RECORD_START|seed=42
TICK|turn=0|cmd=4|px=2|py=1
TICK|turn=1|cmd=4|px=3|py=1
TICK|turn=2|cmd=2|px=3|py=2
TICK|turn=3|cmd=5|px=3|py=2
TICK|turn=4|cmd=4|px=4|py=2
RECORD_SIGNATURE|<hex>
REPLAY_START|seed=42
REPLAY_TICK|turn=0|cmd=4|px=2|py=1
REPLAY_TICK|turn=1|cmd=4|px=3|py=1
REPLAY_TICK|turn=2|cmd=2|px=3|py=2
REPLAY_TICK|turn=3|cmd=5|px=3|py=2
REPLAY_TICK|turn=4|cmd=4|px=4|py=2
REPLAY_SIGNATURE|<hex>
REPLAY_MATCH|true
GRID_ROW|0|##########
GRID_ROW|1|#........#
GRID_ROW|2|#...@....#
GRID_ROW|3|#........#
GRID_ROW|4|#........#
GRID_ROW|5|#........#
GRID_ROW|6|#........#
GRID_ROW|7|#........#
GRID_ROW|8|#........#
GRID_ROW|9|##########
ENTITY|player|4,2|hp=30
TURN|5
HP|30
GOLD|0
GAME_MESSAGE|Replay verified: signatures match.
\`\`\`

## Beginner Trap

**Reusing the same World struct for both phases.** If you record into \`w\` and then replay into the same \`w\` without re-initializing, the replay starts from the record's final state instead of the initial state. Always use two separate World instances, or call \`initWorld\` again before replay.

## Elite Insight

Doom's demo system uses exactly this pattern. The .lmp file stores the seed and the input sequence. The engine replays by re-initializing the level and feeding inputs from the file. If the demo desyncs (monsters move differently, doors don't open), it means a determinism bug was introduced. John Carmack used demo playback as a continuous integration test â every code change was verified against recorded demos.

## Mastery Check

Question: Why use two separate World instances instead of re-initializing one?
Answer: Two instances guarantee zero state leakage. With one instance, a re-init bug (forgetting to reset one field) would leave stale data from the record phase, and the replay might accidentally pass by reading leftover state. Separate instances make the test stricter â the replay must produce the correct state from scratch.`,
    starterCode: `#include <iostream>
using namespace std;

const int MAX_LOG = 256;
const int W = 10, H = 10;

struct LogEntry { int turn; int command; };
struct ReplayLog { LogEntry entries[MAX_LOG]; int count; };

void logCommand(ReplayLog& log, int turn, int cmd) {
    if (log.count < MAX_LOG) {
        log.entries[log.count] = {turn, cmd};
        log.count++;
    }
}

struct RNG { unsigned int state; };
void rng_seed(RNG& r, unsigned int s) { r.state = s; }
unsigned int rng_next(RNG& r) { r.state = r.state * 1664525u + 1013904223u; return r.state; }
int rng_range(RNG& r, int lo, int hi) { return lo + (int)(rng_next(r) % (unsigned)(hi - lo + 1)); }

struct World {
    int px, py, hp, gold, turn;
    unsigned int seed;
    RNG rng;
};

void initWorld(World& w, unsigned int seed) {
    w.px = 1; w.py = 1; w.hp = 30; w.gold = 0; w.turn = 0;
    w.seed = seed;
    rng_seed(w.rng, seed);
}

void tick(World& w, int cmd) {
    if (cmd == 1 && w.py > 1) w.py--;
    else if (cmd == 2 && w.py < H - 2) w.py++;
    else if (cmd == 3 && w.px > 1) w.px--;
    else if (cmd == 4 && w.px < W - 2) w.px++;
    w.turn++;
}

unsigned int hashCombine(unsigned int s, int v) {
    s ^= (unsigned int)v + 0x9e3779b9 + (s << 6) + (s >> 2);
    return s;
}

unsigned int computeSignature(const World& w) {
    unsigned int s = 0;
    s = hashCombine(s, w.px);
    s = hashCombine(s, w.py);
    s = hashCombine(s, w.hp);
    s = hashCombine(s, w.gold);
    s = hashCombine(s, w.turn);
    s = hashCombine(s, (int)w.seed);
    return s;
}

int main() {
    int commands[] = {4, 4, 2, 5, 4};
    int numCmds = 5;

    cout << "DUNGEON|rpg-v0" << endl;

    // === RECORD PHASE ===
    World rec;
    initWorld(rec, 42);
    ReplayLog log = {};
    log.count = 0;

    cout << "RECORD_START|seed=" << rec.seed << endl;

    for (int i = 0; i < numCmds; i++) {
        logCommand(log, rec.turn, commands[i]);
        tick(rec, commands[i]);
        cout << "TICK|turn=" << (rec.turn - 1) << "|cmd=" << commands[i]
             << "|px=" << rec.px << "|py=" << rec.py << endl;
    }

    unsigned int recSig = computeSignature(rec);
    cout << "RECORD_SIGNATURE|" << hex << recSig << endl;

    // === REPLAY PHASE ===
    // TODO: Create a new World rep, init with same seed (42)
    // TODO: Print REPLAY_START|seed=42
    // TODO: Loop over log.count entries, calling tick(rep, log.entries[i].command)
    // TODO: Print REPLAY_TICK lines with turn, cmd, px, py
    // TODO: Compute repSig = computeSignature(rep)
    // TODO: Print REPLAY_SIGNATURE
    // TODO: Compare recSig == repSig, print REPLAY_MATCH|true or REPLAY_MATCH|false

    // === GRID DISPLAY ===
    char grid[H][W];
    for (int y = 0; y < H; y++)
        for (int x = 0; x < W; x++)
            grid[y][x] = '.';
    for (int x = 0; x < W; x++) { grid[0][x] = '#'; grid[H-1][x] = '#'; }
    for (int y = 0; y < H; y++) { grid[y][0] = '#'; grid[y][W-1] = '#'; }
    grid[rec.py][rec.px] = '@';
    for (int y = 0; y < H; y++) {
        cout << dec << "GRID_ROW|" << y << "|";
        for (int x = 0; x < W; x++) cout << grid[y][x];
        cout << endl;
    }

    cout << "ENTITY|player|" << rec.px << "," << rec.py << "|hp=" << rec.hp << endl;
    cout << "TURN|" << dec << rec.turn << endl;
    cout << "HP|" << rec.hp << endl;
    cout << "GOLD|" << rec.gold << endl;

    // TODO: Print GAME_MESSAGE based on match result

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

const int MAX_LOG = 256;
const int W = 10, H = 10;

struct LogEntry { int turn; int command; };
struct ReplayLog { LogEntry entries[MAX_LOG]; int count; };

void logCommand(ReplayLog& log, int turn, int cmd) {
    if (log.count < MAX_LOG) {
        log.entries[log.count] = {turn, cmd};
        log.count++;
    }
}

struct RNG { unsigned int state; };
void rng_seed(RNG& r, unsigned int s) { r.state = s; }
unsigned int rng_next(RNG& r) { r.state = r.state * 1664525u + 1013904223u; return r.state; }
int rng_range(RNG& r, int lo, int hi) { return lo + (int)(rng_next(r) % (unsigned)(hi - lo + 1)); }

struct World {
    int px, py, hp, gold, turn;
    unsigned int seed;
    RNG rng;
};

void initWorld(World& w, unsigned int seed) {
    w.px = 1; w.py = 1; w.hp = 30; w.gold = 0; w.turn = 0;
    w.seed = seed;
    rng_seed(w.rng, seed);
}

void tick(World& w, int cmd) {
    if (cmd == 1 && w.py > 1) w.py--;
    else if (cmd == 2 && w.py < H - 2) w.py++;
    else if (cmd == 3 && w.px > 1) w.px--;
    else if (cmd == 4 && w.px < W - 2) w.px++;
    w.turn++;
}

unsigned int hashCombine(unsigned int s, int v) {
    s ^= (unsigned int)v + 0x9e3779b9 + (s << 6) + (s >> 2);
    return s;
}

unsigned int computeSignature(const World& w) {
    unsigned int s = 0;
    s = hashCombine(s, w.px);
    s = hashCombine(s, w.py);
    s = hashCombine(s, w.hp);
    s = hashCombine(s, w.gold);
    s = hashCombine(s, w.turn);
    s = hashCombine(s, (int)w.seed);
    return s;
}

int main() {
    int commands[] = {4, 4, 2, 5, 4};
    int numCmds = 5;

    cout << "DUNGEON|rpg-v0" << endl;

    // === RECORD PHASE ===
    World rec;
    initWorld(rec, 42);
    ReplayLog log = {};
    log.count = 0;

    cout << "RECORD_START|seed=" << rec.seed << endl;

    for (int i = 0; i < numCmds; i++) {
        logCommand(log, rec.turn, commands[i]);
        tick(rec, commands[i]);
        cout << "TICK|turn=" << (rec.turn - 1) << "|cmd=" << commands[i]
             << "|px=" << rec.px << "|py=" << rec.py << endl;
    }

    unsigned int recSig = computeSignature(rec);
    cout << "RECORD_SIGNATURE|" << hex << recSig << endl;

    // === REPLAY PHASE ===
    World rep;
    initWorld(rep, 42);

    cout << "REPLAY_START|seed=" << dec << rep.seed << endl;

    for (int i = 0; i < log.count; i++) {
        tick(rep, log.entries[i].command);
        cout << "REPLAY_TICK|turn=" << (rep.turn - 1) << "|cmd=" << log.entries[i].command
             << "|px=" << rep.px << "|py=" << rep.py << endl;
    }

    unsigned int repSig = computeSignature(rep);
    cout << "REPLAY_SIGNATURE|" << hex << repSig << endl;

    bool match = (recSig == repSig);
    cout << "REPLAY_MATCH|" << (match ? "true" : "false") << endl;

    // === GRID DISPLAY ===
    char grid[H][W];
    for (int y = 0; y < H; y++)
        for (int x = 0; x < W; x++)
            grid[y][x] = '.';
    for (int x = 0; x < W; x++) { grid[0][x] = '#'; grid[H-1][x] = '#'; }
    for (int y = 0; y < H; y++) { grid[y][0] = '#'; grid[y][W-1] = '#'; }
    grid[rec.py][rec.px] = '@';
    for (int y = 0; y < H; y++) {
        cout << dec << "GRID_ROW|" << y << "|";
        for (int x = 0; x < W; x++) cout << grid[y][x];
        cout << endl;
    }

    cout << "ENTITY|player|" << rec.px << "," << rec.py << "|hp=" << rec.hp << endl;
    cout << "TURN|" << dec << rec.turn << endl;
    cout << "HP|" << rec.hp << endl;
    cout << "GOLD|" << rec.gold << endl;
    cout << "GAME_MESSAGE|Replay verified: signatures match." << endl;

    return 0;
}`,
    tests: [
      { id: "g1", description: "Dungeon header", expectedOutput: "DUNGEON|rpg-v0", isPattern: false },
      { id: "g2", description: "Record phase starts", expectedOutput: "RECORD_START|seed=42", isPattern: false },
      { id: "g3", description: "First record tick", expectedOutput: "TICK|turn=0|cmd=4|px=2|py=1", isPattern: false },
      { id: "g4", description: "Record signature computed", expectedOutput: "RECORD_SIGNATURE|", isPattern: true },
      { id: "g5", description: "Replay phase starts", expectedOutput: "REPLAY_START|seed=42", isPattern: false },
      { id: "g6", description: "Replay signature computed", expectedOutput: "REPLAY_SIGNATURE|", isPattern: true },
      { id: "g7", description: "Signatures match", expectedOutput: "REPLAY_MATCH|true", isPattern: false },
      { id: "g8", description: "Player on grid", expectedOutput: "GRID_ROW|2|#...@", isPattern: true },
      { id: "g9", description: "Entity displayed", expectedOutput: "ENTITY|player|4,2|hp=30", isPattern: false },
      { id: "g10", description: "Game message confirms match", expectedOutput: "GAME_MESSAGE|Replay verified: signatures match.", isPattern: false },
    ],
    hints: [
      "Create a separate World rep for replay. Call initWorld(rep, 42) to start fresh with the same seed.",
      "Loop over log.count entries during replay. The command is log.entries[i].command. Print REPLAY_TICK instead of TICK.",
      "After replay, compute repSig = computeSignature(rep). Compare with recSig. Print REPLAY_MATCH|true if they match.",
    ],
    estimatedMinutes: 15,
  },
};