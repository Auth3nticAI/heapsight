import { Lesson } from "@/types/lesson";

export const lessonRPG70: Lesson = {
  id: "rpg-70-gate-b-replay-determinism",
  title: "GATE B: Replay Determinism",
  description: "The second systems gate — record a full game session with combat, movement, and interaction, then replay it. Identical signatures or the gate fails.",
  order: 70,
  xpReward: 300,
  tier: "pro",
  concepts: ["gate B", "replay determinism", "full pipeline proof", "signature verification", "systems discipline"],
  part1: {
    title: "Concept: Replay Determinism Gate",
    type: "concept",
    instructions: `# GATE B: Replay Determinism

## Mental Model

Gate A (Lesson 30) proved zero heap allocations in the game loop.
Gate B proves something harder: the entire game is **deterministic**.

Record a 10-turn session that includes movement, combat (RNG-driven),
and interaction. Replay it from the same seed. If the final state
signatures match, Gate B passes. If they diverge, something in your
pipeline breaks determinism.

## What Breaks Without This

Without replay determinism:
- Save/load silently corrupts state
- Multiplayer desyncs on every session
- Bug reports cannot be reproduced
- Testing is guesswork, not proof

## The Fix

Build a \`gateB\` function that:
1. Seeds a World and runs N commands, recording each one
2. Computes a signature of the final state
3. Re-seeds the same World and replays from the log
4. Computes a second signature
5. Returns true only if both signatures match

\`\`\`cpp
bool gateB(unsigned int seed, Command* cmds, int count) {
    World w;
    ReplayEntry log[MAX_REPLAY]; int lc = 0;
    initWorld(w, seed);
    for (int t = 0; t < count; t++) {
        recordCommand(log, lc, t+1, cmds[t]);
        tick(w, cmds[t]);
    }
    unsigned int rec = computeSignature(w);
    initWorld(w, seed);
    for (int i = 0; i < lc; i++) {
        Command c = fromReplay(log[i]);
        tick(w, c);
    }
    unsigned int rep = computeSignature(w);
    return rec == rep;
}
\`\`\`

## Key Concepts

- **Gate pattern**: a hard pass/fail checkpoint, not a soft warning
- **Multi-scenario testing**: one seed proves nothing; many seeds prove everything
- **Signature equality**: the single boolean that confirms determinism
- **Input source swap**: live input vs replay log must produce identical results

## Performance Insight

Gate B tests run in microseconds. Run them on every build.
If the gate fails, the build fails. No exceptions.

## Memory Insight

The entire test — two full game runs plus replay log —
fits in a few KB of stack. No heap needed. This is the payoff
of Gate A: deterministic memory means deterministic replay.

## Your Task

Implement \`gateB\` that records a session, replays it, and returns
true only when both signatures match. Test with seed 42 and 5
movement commands.

## Beginner Trap

\`\`\`cpp
// BAD: test with 5 turns, call it done
// GOOD: test with multiple seeds, turn counts, command mixes
// Edge cases hide determinism bugs
\`\`\`

## Elite Insight

Blizzard's replay verification for StarCraft II runs on every
patch build. If any of 10,000 recorded games diverge on replay,
the patch is blocked. Gate B is your version of this discipline.

## Systems Thinking Connection

Gate B connects every system: RNG seeding (L21), command pipeline
(L16-L17), state signatures (L68), and replay logging (L64).
If any one is non-deterministic, the gate catches it.

## Skill Reinforcement

- Record/replay pattern from L64
- State signature hashing from L68
- Automated test assertions from L69
- Gate discipline from L30

## Mastery Check

You pass when a single-seed gateB call returns true and prints
matching signatures.`,
    starterCode: `#include <iostream>
using namespace std;

struct RNG { unsigned int state; int next(int lo, int hi) { state = state * 1103515245 + 12345; return lo + (int)((state >> 16) % (hi - lo + 1)); } };
struct Command { int dx; int dy; bool attack; bool interact; };
struct World { int px; int py; int hp; int gold; int turn; RNG rng; unsigned int seed; };
const int MAX_REPLAY = 1024;
struct ReplayEntry { int turn; int dx; int dy; int attack; int interact; };

void initWorld(World& w, unsigned int seed) { w.px=1; w.py=1; w.hp=20; w.gold=0; w.turn=0; w.seed=seed; w.rng={seed}; }
void tick(World& w, const Command& cmd) { w.turn++; if(cmd.attack) { int d=w.rng.next(1,3); w.hp-=d; } else { int nx=w.px+cmd.dx; int ny=w.py+cmd.dy; if(nx>=0&&nx<=9) w.px=nx; if(ny>=0&&ny<=9) w.py=ny; } }
void recordCommand(ReplayEntry* log, int& c, int t, const Command& cmd) { if(c>=MAX_REPLAY) return; log[c]={t,cmd.dx,cmd.dy,cmd.attack?1:0,cmd.interact?1:0}; c++; }
Command fromReplay(const ReplayEntry& e) { return {e.dx, e.dy, (bool)e.attack, (bool)e.interact}; }
unsigned int hashCombine(unsigned int s, int v) { s ^= (unsigned int)v + 0x9e3779b9 + (s<<6) + (s>>2); return s; }
unsigned int computeSignature(const World& w) { unsigned int s=0; s=hashCombine(s,w.px); s=hashCombine(s,w.py); s=hashCombine(s,w.hp); s=hashCombine(s,w.gold); s=hashCombine(s,w.turn); s=hashCombine(s,(int)w.rng.state); return s; }

// TODO: Implement gateB(unsigned int seed, Command* cmds, int count)
// Record phase: initWorld, loop recordCommand+tick, computeSignature
// Replay phase: initWorld same seed, loop fromReplay+tick, computeSignature
// Return rec_sig == rep_sig

int main() {
    Command cmds[5] = {{0,-1,false,false},{1,0,false,false},{0,1,false,false},{-1,0,false,false},{0,-1,false,false}};

    // TODO: Call gateB with seed=42, cmds, count=5
    // Print GATE_B_SIMPLE|PASS or GATE_B_SIMPLE|FAIL
    // Print the two signatures: RECORD_SIG|<hex> and REPLAY_SIG|<hex>

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct RNG { unsigned int state; int next(int lo, int hi) { state = state * 1103515245 + 12345; return lo + (int)((state >> 16) % (hi - lo + 1)); } };
struct Command { int dx; int dy; bool attack; bool interact; };
struct World { int px; int py; int hp; int gold; int turn; RNG rng; unsigned int seed; };
const int MAX_REPLAY = 1024;
struct ReplayEntry { int turn; int dx; int dy; int attack; int interact; };

void initWorld(World& w, unsigned int seed) { w.px=1; w.py=1; w.hp=20; w.gold=0; w.turn=0; w.seed=seed; w.rng={seed}; }
void tick(World& w, const Command& cmd) { w.turn++; if(cmd.attack) { int d=w.rng.next(1,3); w.hp-=d; } else { int nx=w.px+cmd.dx; int ny=w.py+cmd.dy; if(nx>=0&&nx<=9) w.px=nx; if(ny>=0&&ny<=9) w.py=ny; } }
void recordCommand(ReplayEntry* log, int& c, int t, const Command& cmd) { if(c>=MAX_REPLAY) return; log[c]={t,cmd.dx,cmd.dy,cmd.attack?1:0,cmd.interact?1:0}; c++; }
Command fromReplay(const ReplayEntry& e) { return {e.dx, e.dy, (bool)e.attack, (bool)e.interact}; }
unsigned int hashCombine(unsigned int s, int v) { s ^= (unsigned int)v + 0x9e3779b9 + (s<<6) + (s>>2); return s; }
unsigned int computeSignature(const World& w) { unsigned int s=0; s=hashCombine(s,w.px); s=hashCombine(s,w.py); s=hashCombine(s,w.hp); s=hashCombine(s,w.gold); s=hashCombine(s,w.turn); s=hashCombine(s,(int)w.rng.state); return s; }

bool gateB(unsigned int seed, Command* cmds, int count) {
    World w;
    ReplayEntry log[MAX_REPLAY]; int lc = 0;
    initWorld(w, seed);
    for (int t = 0; t < count; t++) {
        recordCommand(log, lc, t+1, cmds[t]);
        tick(w, cmds[t]);
    }
    unsigned int rec_sig = computeSignature(w);
    initWorld(w, seed);
    for (int i = 0; i < lc; i++) {
        Command c = fromReplay(log[i]);
        tick(w, c);
    }
    unsigned int rep_sig = computeSignature(w);
    cout << "RECORD_SIG|" << hex << rec_sig << endl;
    cout << "REPLAY_SIG|" << hex << rep_sig << endl;
    return rec_sig == rep_sig;
}

int main() {
    Command cmds[5] = {{0,-1,false,false},{1,0,false,false},{0,1,false,false},{-1,0,false,false},{0,-1,false,false}};
    bool pass = gateB(42, cmds, 5);
    cout << "GATE_B_SIMPLE|" << (pass ? "PASS" : "FAIL") << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Record signature printed", expectedOutput: "RECORD_SIG|", isPattern: false },
      { id: "t2", description: "Replay signature printed", expectedOutput: "REPLAY_SIG|", isPattern: false },
      { id: "t3", description: "Signatures match", expectedOutput: "GATE_B_SIMPLE|PASS", isPattern: false },
    ],
    hints: [
      "gateB needs two phases: record (initWorld + loop recordCommand+tick + computeSignature) and replay (initWorld + loop fromReplay+tick + computeSignature).",
      "Both phases must call initWorld with the same seed so the RNG state resets identically.",
      "Print RECORD_SIG|<hex> and REPLAY_SIG|<hex> using cout << hex << sig, then compare: return rec_sig == rep_sig.",
    ],
    estimatedMinutes: 10,
  },
  part2: {
    title: "Build: Full Replay Determinism Gate",
    type: "game_builder",
    instructions: `# Build: Gate B — Full Replay Determinism Test

## Mental Model

A single-seed test proves one path is deterministic. Gate B requires
proof across multiple scenarios: movement-only, combat-heavy, and
mixed commands. Every scenario must pass. One failure means the gate
stays locked.

## What Breaks Without This

Testing with one seed hides bugs:
- A movement-only test never exercises RNG
- A combat-only test never exercises boundary clamping
- Only mixed scenarios reveal interaction-order bugs

## The Fix

Write \`runGateBTest\` that takes a scenario name, seed, commands,
and count. It records, replays, verifies signatures, and prints
GATE_B_TEST|name|seed=S|PASS or FAIL. Run 3 scenarios. Print
final GATE_B|PASS|3/3 or GATE_B|FAIL|N/3.

## Key Concepts

- **Named test scenarios**: each test is labeled for debugging
- **Aggregate pass/fail**: all scenarios must pass for the gate to open
- **Structured output**: machine-parseable GATE_B_TEST lines
- **Defense in depth**: movement, combat, and mixed cover different code paths

## Performance Insight

Three scenarios with 5-10 turns each run in under a millisecond.
Add Gate B to your build script. If it fails, the build fails.

## Memory Insight

Each scenario uses its own stack-local replay log (MAX_REPLAY entries).
No heap allocation. The log is reused between record and replay phases.

## Your Task

1. Write \`runGateBTest(name, seed, cmds, count)\` — record, replay, verify
2. Run 3 scenarios: movement (seed=42, 5 cmds), combat (seed=777, 5 cmds), mixed (seed=12345, 10 cmds)
3. Print per-test GATE_B_TEST lines and final GATE_B aggregate

## Beginner Trap

\`\`\`cpp
// BAD: forget to re-init log_count for each scenario
// Each call to runGateBTest must have its own fresh log
\`\`\`

## Elite Insight

Production gate tests often run hundreds of seeds in parallel.
If any single seed diverges, the commit is rejected. Three seeds
is the minimum viable gate; scale up from here.

## Mastery Check

You pass when all three scenarios print PASS and the final line
reads GATE_B|PASS|3/3.`,
    starterCode: `#include <iostream>
using namespace std;

struct RNG { unsigned int state; int next(int lo, int hi) { state = state * 1103515245 + 12345; return lo + (int)((state >> 16) % (hi - lo + 1)); } };
struct Command { int dx; int dy; bool attack; bool interact; };
struct World { int px; int py; int hp; int gold; int turn; RNG rng; unsigned int seed; };
const int MAX_REPLAY = 1024;
struct ReplayEntry { int turn; int dx; int dy; int attack; int interact; };

void initWorld(World& w, unsigned int seed) { w.px=1; w.py=1; w.hp=20; w.gold=0; w.turn=0; w.seed=seed; w.rng={seed}; }
void tick(World& w, const Command& cmd) { w.turn++; if(cmd.attack) { int d=w.rng.next(1,3); w.hp-=d; } else { int nx=w.px+cmd.dx; int ny=w.py+cmd.dy; if(nx>=0&&nx<=9) w.px=nx; if(ny>=0&&ny<=9) w.py=ny; } }
void recordCommand(ReplayEntry* log, int& c, int t, const Command& cmd) { if(c>=MAX_REPLAY) return; log[c]={t,cmd.dx,cmd.dy,cmd.attack?1:0,cmd.interact?1:0}; c++; }
Command fromReplay(const ReplayEntry& e) { return {e.dx, e.dy, (bool)e.attack, (bool)e.interact}; }
unsigned int hashCombine(unsigned int s, int v) { s ^= (unsigned int)v + 0x9e3779b9 + (s<<6) + (s>>2); return s; }
unsigned int computeSignature(const World& w) { unsigned int s=0; s=hashCombine(s,w.px); s=hashCombine(s,w.py); s=hashCombine(s,w.hp); s=hashCombine(s,w.gold); s=hashCombine(s,w.turn); s=hashCombine(s,(int)w.rng.state); return s; }

// TODO: Write runGateBTest(const char* name, unsigned int seed, Command* cmds, int count)
// Record phase: initWorld, loop record+tick, compute rec_sig
// Replay phase: initWorld same seed, loop fromReplay+tick, compute rep_sig
// Print GATE_B_TEST|name|seed=S|PASS or FAIL
// Return rec_sig == rep_sig

int main() {
    int passed = 0, total = 3;

    // Scenario 1: Movement only
    Command move_cmds[5] = {{0,-1,false,false},{1,0,false,false},{0,1,false,false},{-1,0,false,false},{0,-1,false,false}};
    // TODO: run test "movement" seed=42

    // Scenario 2: Combat only
    Command atk_cmds[5] = {{0,0,true,false},{0,0,true,false},{0,0,true,false},{0,0,true,false},{0,0,true,false}};
    // TODO: run test "combat" seed=777

    // Scenario 3: Mixed
    Command mix_cmds[10] = {{0,-1,false,false},{0,0,true,false},{1,0,false,false},{0,0,true,false},{0,1,false,false},{0,0,true,false},{-1,0,false,false},{0,0,false,true},{0,-1,false,false},{0,0,true,false}};
    // TODO: run test "mixed" seed=12345

    // TODO: Print GATE_B|PASS|P/T or GATE_B|FAIL|P/T

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct RNG { unsigned int state; int next(int lo, int hi) { state = state * 1103515245 + 12345; return lo + (int)((state >> 16) % (hi - lo + 1)); } };
struct Command { int dx; int dy; bool attack; bool interact; };
struct World { int px; int py; int hp; int gold; int turn; RNG rng; unsigned int seed; };
const int MAX_REPLAY = 1024;
struct ReplayEntry { int turn; int dx; int dy; int attack; int interact; };

void initWorld(World& w, unsigned int seed) { w.px=1; w.py=1; w.hp=20; w.gold=0; w.turn=0; w.seed=seed; w.rng={seed}; }
void tick(World& w, const Command& cmd) { w.turn++; if(cmd.attack) { int d=w.rng.next(1,3); w.hp-=d; } else { int nx=w.px+cmd.dx; int ny=w.py+cmd.dy; if(nx>=0&&nx<=9) w.px=nx; if(ny>=0&&ny<=9) w.py=ny; } }
void recordCommand(ReplayEntry* log, int& c, int t, const Command& cmd) { if(c>=MAX_REPLAY) return; log[c]={t,cmd.dx,cmd.dy,cmd.attack?1:0,cmd.interact?1:0}; c++; }
Command fromReplay(const ReplayEntry& e) { return {e.dx, e.dy, (bool)e.attack, (bool)e.interact}; }
unsigned int hashCombine(unsigned int s, int v) { s ^= (unsigned int)v + 0x9e3779b9 + (s<<6) + (s>>2); return s; }
unsigned int computeSignature(const World& w) { unsigned int s=0; s=hashCombine(s,w.px); s=hashCombine(s,w.py); s=hashCombine(s,w.hp); s=hashCombine(s,w.gold); s=hashCombine(s,w.turn); s=hashCombine(s,(int)w.rng.state); return s; }

bool runGateBTest(const char* name, unsigned int seed, Command* cmds, int count) {
    World w;
    ReplayEntry log[MAX_REPLAY]; int lc = 0;
    initWorld(w, seed);
    for (int t = 0; t < count; t++) {
        recordCommand(log, lc, t+1, cmds[t]);
        tick(w, cmds[t]);
    }
    unsigned int rec_sig = computeSignature(w);
    initWorld(w, seed);
    for (int i = 0; i < lc; i++) {
        Command c = fromReplay(log[i]);
        tick(w, c);
    }
    unsigned int rep_sig = computeSignature(w);
    bool pass = rec_sig == rep_sig;
    cout << "GATE_B_TEST|" << name << "|seed=" << seed << "|" << (pass ? "PASS" : "FAIL") << endl;
    return pass;
}

int main() {
    int passed = 0, total = 3;
    Command move_cmds[5] = {{0,-1,false,false},{1,0,false,false},{0,1,false,false},{-1,0,false,false},{0,-1,false,false}};
    if (runGateBTest("movement", 42, move_cmds, 5)) passed++;
    Command atk_cmds[5] = {{0,0,true,false},{0,0,true,false},{0,0,true,false},{0,0,true,false},{0,0,true,false}};
    if (runGateBTest("combat", 777, atk_cmds, 5)) passed++;
    Command mix_cmds[10] = {{0,-1,false,false},{0,0,true,false},{1,0,false,false},{0,0,true,false},{0,1,false,false},{0,0,true,false},{-1,0,false,false},{0,0,false,true},{0,-1,false,false},{0,0,true,false}};
    if (runGateBTest("mixed", 12345, mix_cmds, 10)) passed++;
    cout << "GATE_B|" << (passed == total ? "PASS" : "FAIL") << "|" << passed << "/" << total << endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Movement test passes", expectedOutput: "GATE_B_TEST|movement|seed=42|PASS", isPattern: false },
      { id: "g2", description: "Combat test passes", expectedOutput: "GATE_B_TEST|combat|seed=777|PASS", isPattern: false },
      { id: "g3", description: "Mixed test passes", expectedOutput: "GATE_B_TEST|mixed|seed=12345|PASS", isPattern: false },
      { id: "g4", description: "Gate B passes", expectedOutput: "GATE_B|PASS|3/3", isPattern: false },
    ],
    hints: [
      "runGateBTest follows the same record-replay-compare pattern from part1, but takes a name parameter for the output label.",
      "Each scenario needs its own stack-local replay log. Declare ReplayEntry log[MAX_REPLAY] and int lc=0 inside runGateBTest.",
      "In main, call runGateBTest for each scenario. If it returns true, increment passed. Print GATE_B|PASS or FAIL based on passed==total.",
    ],
    estimatedMinutes: 18,
  },
};