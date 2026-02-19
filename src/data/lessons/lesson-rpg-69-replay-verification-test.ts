import { Lesson } from "@/types/lesson";

export const lessonRPG69: Lesson = {
  id: "rpg-69-replay-verification-test",
  title: "Replay Verification Test",
  description: "Build an automated test that records, replays, and asserts signature equality — a mismatch is a hard error, not a warning.",
  order: 69,
  xpReward: 100,
  tier: "pro",
  concepts: ["automated testing", "replay verification", "assertion pattern", "regression detection", "test harness"],
  part1: {
    title: "Concept: Automated Replay Testing",
    type: "concept",
    instructions: `# Replay Verification Test

## Mental Model

You can manually run record-and-replay to check determinism. But manual tests get skipped. They get forgotten. They don't run when someone adds a "small" change at 2 AM. You need a test that runs automatically and fails loudly when determinism breaks. A replay verification test encapsulates record-replay-compare into a single function that returns pass or fail.

## What Breaks Without This

Without automated testing, determinism regressions hide until a player reports "my replay is wrong." By then, you don't know which change broke it. With automated tests running on every build, the regression is caught immediately — the failing test tells you which seed exposed the bug, giving you a reproducible starting point.

## The Fix: runReplayTest Function

Wrap the record-replay pattern in a test function:

\`\`\`cpp
bool runReplayTest(unsigned int seed, Command* cmds, int count) {
    World w;
    ReplayEntry log[MAX_REPLAY]; int log_count = 0;
    initWorld(w, seed);
    for (int t = 0; t < count; t++) {
        recordCommand(log, log_count, t+1, cmds[t]);
        tick(w, cmds[t]);
    }
    unsigned int rec_sig = computeSignature(w);
    initWorld(w, seed);
    for (int i = 0; i < log_count; i++) { /* replay from log */ }
    unsigned int rep_sig = computeSignature(w);
    return rec_sig == rep_sig;
}
\`\`\`

Run multiple test cases with different seeds and command sequences. A single failure means determinism is broken.

## Key Concepts
- Test encapsulation: record-replay-compare in one function
- Multiple seeds: different seeds exercise different RNG paths
- Pass/fail reporting: explicit result, not implicit "it looked ok"
- Regression detection: tests run on every change, catch breakage immediately

## Performance Insight

A 10-turn replay test takes microseconds. You can run hundreds of test cases per second. There's no excuse not to run them on every code change. Even 1000 tests with 100 turns each completes in under a second.

## Memory Insight

Each test uses stack-allocated World and ReplayEntry arrays. No cleanup needed — the stack frame disappears when the function returns. Run 100 tests with zero cumulative memory cost. No heap, no leaks, no fragmentation.

## Your Task

Write a simple replay test: create a World, modify it through a few ticks, compute the signature, then repeat with the same seed and commands. Verify the signatures match. Print TEST|PASS or TEST|FAIL.

Expected output:
\`\`\`
INIT|seed=42
RECORD_SIG|<value>
REPLAY_SIG|<value>
TEST|PASS
\`\`\`

## Beginner Trap

**Only testing one seed.** Some bugs only manifest with specific RNG sequences. If you only test seed=42 and the bug appears at seed=999, your test suite gives a false green. Always test multiple seeds to maximize coverage.

## Elite Insight

Riot Games runs thousands of replay tests per build for League of Legends. Each test uses a different seed and command sequence. If any test fails, the build is rejected. This is CI-level determinism enforcement — the same pattern you're implementing here at a smaller scale.

## Systems Thinking Connection

The Robotics path uses deterministic replay to verify planner outputs match expected trajectories. Both paths use the same pattern: record inputs, replay them, compare outputs. The assertion mechanism differs (signature hash vs trajectory error), but the testing discipline is identical.

## Skill Reinforcement

Lesson 64 introduced the replay log. Lesson 68 added state signatures. This lesson combines them into an automated test. Lesson 70 (Gate B) will require this test to pass as a gating condition.

## Mastery Check

Why must each test case create its own World on the stack instead of reusing a shared one?
Answer: If tests share a World, the state from test 1 leaks into test 2. Test 2 would start with test 1's final state, not a clean initial state. Each test needs an independent World to ensure isolation. Stack allocation makes this free — the World is created on entry and destroyed on exit, no explicit cleanup needed.`,
    starterCode: `#include <iostream>
using namespace std;

struct RNG{unsigned int state;int next(int lo,int hi){state=state*1103515245+12345;return lo+(int)((state>>16)%(hi-lo+1));}};
struct Command{int dx;int dy;bool attack;bool interact;};
struct World{int px;int py;int hp;int gold;int turn;RNG rng;unsigned int seed;};

void initWorld(World& w,unsigned int seed){w.px=1;w.py=1;w.hp=20;w.gold=0;w.turn=0;w.seed=seed;w.rng={seed};}
void tick(World& w,const Command& cmd){w.turn++;if(cmd.attack){int d=w.rng.next(1,3);w.hp-=d;}else{int nx=w.px+cmd.dx;int ny=w.py+cmd.dy;if(nx>=0&&nx<=9)w.px=nx;if(ny>=0&&ny<=9)w.py=ny;}}
unsigned int hashCombine(unsigned int s,int v){s^=(unsigned int)v+0x9e3779b9+(s<<6)+(s>>2);return s;}
unsigned int computeSignature(const World& w){unsigned int s=0;s=hashCombine(s,w.px);s=hashCombine(s,w.py);s=hashCombine(s,w.hp);s=hashCombine(s,w.gold);s=hashCombine(s,w.turn);s=hashCombine(s,(int)w.rng.state);return s;}

int main(){
    World w;
    Command cmds[3]={{1,0,false,false},{0,0,true,false},{0,1,false,false}};

    // Record phase
    initWorld(w,42);
    cout<<"INIT|seed=42"<<endl;
    for(int t=0;t<3;t++) tick(w,cmds[t]);
    unsigned int rec_sig=computeSignature(w);
    cout<<"RECORD_SIG|"<<rec_sig<<endl;

    // TODO: Replay phase - reinit with same seed, run same commands
    // TODO: Compute replay signature
    // TODO: Compare and print TEST|PASS or TEST|FAIL
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct RNG{unsigned int state;int next(int lo,int hi){state=state*1103515245+12345;return lo+(int)((state>>16)%(hi-lo+1));}};
struct Command{int dx;int dy;bool attack;bool interact;};
struct World{int px;int py;int hp;int gold;int turn;RNG rng;unsigned int seed;};

void initWorld(World& w,unsigned int seed){w.px=1;w.py=1;w.hp=20;w.gold=0;w.turn=0;w.seed=seed;w.rng={seed};}
void tick(World& w,const Command& cmd){w.turn++;if(cmd.attack){int d=w.rng.next(1,3);w.hp-=d;}else{int nx=w.px+cmd.dx;int ny=w.py+cmd.dy;if(nx>=0&&nx<=9)w.px=nx;if(ny>=0&&ny<=9)w.py=ny;}}
unsigned int hashCombine(unsigned int s,int v){s^=(unsigned int)v+0x9e3779b9+(s<<6)+(s>>2);return s;}
unsigned int computeSignature(const World& w){unsigned int s=0;s=hashCombine(s,w.px);s=hashCombine(s,w.py);s=hashCombine(s,w.hp);s=hashCombine(s,w.gold);s=hashCombine(s,w.turn);s=hashCombine(s,(int)w.rng.state);return s;}

int main(){
    World w;
    Command cmds[3]={{1,0,false,false},{0,0,true,false},{0,1,false,false}};

    initWorld(w,42);
    cout<<"INIT|seed=42"<<endl;
    for(int t=0;t<3;t++) tick(w,cmds[t]);
    unsigned int rec_sig=computeSignature(w);
    cout<<"RECORD_SIG|"<<rec_sig<<endl;

    initWorld(w,42);
    for(int t=0;t<3;t++) tick(w,cmds[t]);
    unsigned int rep_sig=computeSignature(w);
    cout<<"REPLAY_SIG|"<<rep_sig<<endl;

    if(rec_sig==rep_sig) cout<<"TEST|PASS"<<endl;
    else cout<<"TEST|FAIL"<<endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Initialized with seed", expectedOutput: "INIT|seed=42", isPattern: false },
      { id: "t2", description: "Record signature computed", expectedOutput: "RECORD_SIG|", isPattern: true },
      { id: "t3", description: "Replay signature computed", expectedOutput: "REPLAY_SIG|", isPattern: true },
      { id: "t4", description: "Test passes", expectedOutput: "TEST|PASS", isPattern: false },
    ],
    hints: [
      "The replay phase is identical to the record phase: initWorld with the same seed, tick with the same commands in the same order.",
      "After replaying, call computeSignature(w) again and store it as rep_sig. Compare rec_sig == rep_sig.",
      "Print TEST|PASS if the signatures match, TEST|FAIL if they differ. Use a simple if/else on the comparison result."
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Replay Test Harness",
    type: "game_builder",
    instructions: `# Build: Replay Test Harness

## Mental Model

A single test proves one seed works. A test harness proves the system works. Encapsulate record-replay-compare into \`runReplayTest()\`, then call it with multiple seeds and command sequences. Each test is independent — its own World, its own replay log, its own signature comparison. The final report summarizes pass/fail counts.

## What Breaks Without This

With only one test case, a determinism bug that only manifests at seed=999 goes undetected. Different seeds exercise different RNG paths. Different command sequences exercise different game logic branches. Multiple tests catch more bugs. A harness makes running multiple tests trivial.

## The Fix: Test Harness Function

Write \`runReplayTest(unsigned int seed, Command* cmds, int count)\` that creates its own World and replay log on the stack, runs both phases, compares signatures, and returns pass/fail. Main calls it 3 times with different parameters and tallies results.

## Key Concepts
- Test isolation: each test creates its own World on the stack
- Multiple seeds: different seeds exercise different RNG sequences
- Pass/fail tally: summary report at the end
- Zero cumulative memory: stack frames clean up automatically

## Performance Insight

Three test cases with 3-5 turns each completes in under 10 microseconds. Even scaling to 100 test cases with 100 turns each, the total runtime is under 1ms. The test harness imposes zero performance burden — run it on every build.

## Memory Insight

Each \`runReplayTest\` call allocates ~20KB on the stack (World + ReplayEntry[1024]). When the function returns, the stack frame is reclaimed instantly. Three calls = three stack frames, each independent. No heap allocation. No cleanup code.

## Your Task

Write \`runReplayTest()\` that encapsulates record-replay-compare. Run 3 test cases with seeds 42, 999, and 12345. Print TEST|seed=S|rec=R|rep=P|PASS (or FAIL) for each, and RESULTS|passed=P|failed=F at the end.

Expected output:
\`\`\`
TEST|seed=42|rec=<val>|rep=<val>|PASS
TEST|seed=999|rec=<val>|rep=<val>|PASS
TEST|seed=12345|rec=<val>|rep=<val>|PASS
RESULTS|passed=3|failed=0
\`\`\`

## Beginner Trap

**Reusing the same World across tests without reinitializing.** If test 1 leaves the World in a modified state and test 2 starts from that state, test 2 is not independent. Each test must call initWorld with its own seed at the start of both record and replay phases. Creating the World inside the function guarantees isolation.

## Elite Insight

StarCraft 2's determinism test suite runs 10,000+ replay tests per build, each with a unique seed. A single failure blocks the build. The seeds are chosen to cover edge cases in the RNG output space. Your 3-seed harness follows the same architecture — production just scales the seed count.

## Mastery Check

If you intentionally break determinism by adding a \`rand()\` call inside tick(), which tests will fail?
Answer: All of them — because \`rand()\` uses a separate, non-seeded RNG. The record phase consumes \`rand()\` values in one sequence, the replay phase in another (since \`rand()\` has its own global state). Every test will show FAIL because record and replay signatures will differ.`,
    starterCode: `#include <iostream>
using namespace std;

struct RNG{unsigned int state;int next(int lo,int hi){state=state*1103515245+12345;return lo+(int)((state>>16)%(hi-lo+1));}};
struct Command{int dx;int dy;bool attack;bool interact;};
struct World{int px;int py;int hp;int gold;int turn;RNG rng;unsigned int seed;};
const int MAX_REPLAY=1024;
struct ReplayEntry{int turn;int dx;int dy;int attack;int interact;};

void initWorld(World& w,unsigned int seed){w.px=1;w.py=1;w.hp=20;w.gold=0;w.turn=0;w.seed=seed;w.rng={seed};}
void tick(World& w,const Command& cmd){w.turn++;if(cmd.attack){int d=w.rng.next(1,3);w.hp-=d;}else{int nx=w.px+cmd.dx;int ny=w.py+cmd.dy;if(nx>=0&&nx<=9)w.px=nx;if(ny>=0&&ny<=9)w.py=ny;}}
void recordCommand(ReplayEntry* log,int& c,int t,const Command& cmd){if(c>=MAX_REPLAY)return;log[c]={t,cmd.dx,cmd.dy,cmd.attack?1:0,cmd.interact?1:0};c++;}
unsigned int hashCombine(unsigned int s,int v){s^=(unsigned int)v+0x9e3779b9+(s<<6)+(s>>2);return s;}
unsigned int computeSignature(const World& w){unsigned int s=0;s=hashCombine(s,w.px);s=hashCombine(s,w.py);s=hashCombine(s,w.hp);s=hashCombine(s,w.gold);s=hashCombine(s,w.turn);s=hashCombine(s,(int)w.rng.state);return s;}

// TODO: Write runReplayTest(unsigned int seed, Command* cmds, int count)
// 1. Create World and ReplayEntry log on stack
// 2. Record phase: initWorld, loop recording+ticking, compute rec_sig
// 3. Replay phase: initWorld same seed, loop replaying from log, compute rep_sig
// 4. Print TEST|seed=S|rec=R|rep=P|PASS or FAIL
// 5. Return rec_sig == rep_sig

int main(){
    int passed=0,failed=0;

    Command cmds1[5]={{0,-1,false,false},{1,0,false,false},{0,0,true,false},{0,1,false,false},{0,0,true,false}};
    Command cmds2[3]={{1,0,false,false},{0,0,true,false},{-1,0,false,false}};
    Command cmds3[4]={{0,1,false,false},{0,1,false,false},{0,0,true,false},{0,0,false,true}};

    // TODO: Run 3 tests with seeds 42, 999, 12345
    // Increment passed or failed for each

    cout<<"RESULTS|passed="<<passed<<"|failed="<<failed<<endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct RNG{unsigned int state;int next(int lo,int hi){state=state*1103515245+12345;return lo+(int)((state>>16)%(hi-lo+1));}};
struct Command{int dx;int dy;bool attack;bool interact;};
struct World{int px;int py;int hp;int gold;int turn;RNG rng;unsigned int seed;};
const int MAX_REPLAY=1024;
struct ReplayEntry{int turn;int dx;int dy;int attack;int interact;};

void initWorld(World& w,unsigned int seed){w.px=1;w.py=1;w.hp=20;w.gold=0;w.turn=0;w.seed=seed;w.rng={seed};}
void tick(World& w,const Command& cmd){w.turn++;if(cmd.attack){int d=w.rng.next(1,3);w.hp-=d;}else{int nx=w.px+cmd.dx;int ny=w.py+cmd.dy;if(nx>=0&&nx<=9)w.px=nx;if(ny>=0&&ny<=9)w.py=ny;}}
void recordCommand(ReplayEntry* log,int& c,int t,const Command& cmd){if(c>=MAX_REPLAY)return;log[c]={t,cmd.dx,cmd.dy,cmd.attack?1:0,cmd.interact?1:0};c++;}
unsigned int hashCombine(unsigned int s,int v){s^=(unsigned int)v+0x9e3779b9+(s<<6)+(s>>2);return s;}
unsigned int computeSignature(const World& w){unsigned int s=0;s=hashCombine(s,w.px);s=hashCombine(s,w.py);s=hashCombine(s,w.hp);s=hashCombine(s,w.gold);s=hashCombine(s,w.turn);s=hashCombine(s,(int)w.rng.state);return s;}

bool runReplayTest(unsigned int seed,Command* cmds,int count){
    World w;
    ReplayEntry log[MAX_REPLAY];int log_count=0;
    initWorld(w,seed);
    for(int t=0;t<count;t++){recordCommand(log,log_count,t+1,cmds[t]);tick(w,cmds[t]);}
    unsigned int rec_sig=computeSignature(w);
    initWorld(w,seed);
    for(int i=0;i<log_count;i++){Command c={log[i].dx,log[i].dy,(bool)log[i].attack,(bool)log[i].interact};tick(w,c);}
    unsigned int rep_sig=computeSignature(w);
    cout<<"TEST|seed="<<seed<<"|rec="<<rec_sig<<"|rep="<<rep_sig;
    if(rec_sig==rep_sig){cout<<"|PASS"<<endl;return true;}
    cout<<"|FAIL"<<endl;return false;
}

int main(){
    int passed=0,failed=0;
    Command cmds1[5]={{0,-1,false,false},{1,0,false,false},{0,0,true,false},{0,1,false,false},{0,0,true,false}};
    Command cmds2[3]={{1,0,false,false},{0,0,true,false},{-1,0,false,false}};
    Command cmds3[4]={{0,1,false,false},{0,1,false,false},{0,0,true,false},{0,0,false,true}};
    if(runReplayTest(42,cmds1,5)) passed++; else failed++;
    if(runReplayTest(999,cmds2,3)) passed++; else failed++;
    if(runReplayTest(12345,cmds3,4)) passed++; else failed++;
    cout<<"RESULTS|passed="<<passed<<"|failed="<<failed<<endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Test 1 runs with seed 42", expectedOutput: "TEST|seed=42|", isPattern: true },
      { id: "g2", description: "Test 2 runs with seed 999", expectedOutput: "TEST|seed=999|", isPattern: true },
      { id: "g3", description: "Test 3 runs with seed 12345", expectedOutput: "TEST|seed=12345|", isPattern: true },
      { id: "g4", description: "All tests pass", expectedOutput: "RESULTS|passed=3|failed=0", isPattern: false },
    ],
    hints: [
      "runReplayTest creates its own World and ReplayEntry arrays on the stack. It runs both phases internally and returns the comparison result.",
      "In the record loop, use recordCommand then tick. In the replay loop, reconstruct Command from ReplayEntry fields (dx, dy, attack cast to bool, interact cast to bool).",
      "In main, call runReplayTest three times with different seeds and command arrays. Increment passed or failed based on the bool return value."
    ],
    estimatedMinutes: 15,
  },
};
