import { Lesson } from "@/types/lesson";

export const lessonRPG92: Lesson = {
  id: "rpg-92-unit-tests-rng",
  title: "Unit Tests: RNG",
  description: "Automated RNG verification. Test that same seed produces same sequence. Test range bounds.",
  order: 92,
  xpReward: 100,
  tier: "pro",
  concepts: ["unit testing", "RNG determinism", "test automation", "bounds checking", "test_rng.cpp"],
  part1: {
    title: "Concept: Unit Tests for RNG",
    type: "concept",
    instructions: `# Unit Tests: RNG

## Mental Model

You built a deterministic RNG in Lesson 21 and enforced the no-rand rule in Lesson 22. But how do you PROVE it works? Manual testing is unreliable — you run it once, eyeball the output, and move on. Automated tests run every build and catch regressions the moment they appear.

A unit test for RNG answers two questions: Does the same seed produce the same sequence? Does rng_range() stay within bounds?

## What Breaks Without This

\`\`\`cpp
// Someone "improves" the RNG algorithm
unsigned int rng_next(RNG& r) {
    r.state = r.state * 6364136223846793005u + 1; // new LCG
    return r.state;
}
// All replays are now broken. Every save that depends on
// RNG sequence is corrupted. No test caught the change.
\`\`\`

Without an automated test, any "improvement" to the RNG silently breaks replay determinism. The test is the contract.

## The Fix: Determinism and Bounds Tests

Write two test functions. testRNGDeterminism() seeds the RNG twice with the same seed and verifies both produce identical sequences. testRNGBounds() calls rng_range() many times and verifies every result is within [lo, hi].

\`\`\`cpp
bool testRNGDeterminism() {
    RNG a, b;
    rng_seed(a, 42); rng_seed(b, 42);
    for (int i = 0; i < 100; i++) {
        if (rng_next(a) != rng_next(b)) return false;
    }
    return true;
}
\`\`\`

The test is a contract: if you change the RNG, the determinism test fails. That forces you to either revert the change or update all replay data. No silent breakage.

## Key Concepts

- **Determinism test** — same seed must produce same sequence, always.
- **Bounds test** — rng_range(lo, hi) must return values in [lo, hi], every time.
- **Test as contract** — the test defines correct behavior. Changes that break the test are bugs.
- **Automated verification** — run on every build, not just when you remember.

## Performance Insight

Tests run at build time, not game time. A 1000-iteration bounds check adds zero cost to the player's experience. The CPU cost of tests is paid by the developer, not the user.

## Memory Insight

Each RNG instance is 4 bytes (one unsigned int state). Two RNG instances for the determinism test = 8 bytes on the stack. Tests are the cheapest code in your project.

## Beginner Trap

**Testing with random seeds:**

\`\`\`cpp
// BAD: different seed every run — test is non-deterministic
rng_seed(r, time(nullptr));
if (rng_range(r, 0, 10) > 10) cout << "FAIL";
\`\`\`

**Tests must use fixed seeds.** A test that passes sometimes and fails sometimes is worse than no test at all. Use seed 42 (or any constant) so the test is deterministic.

## Elite Insight

Nethack's RNG is so deterministic that players can manipulate it — they know the sequence and plan moves accordingly. That level of determinism is only possible because the RNG contract is iron-clad. Diablo 2's map generation from seeds was tested exhaustively to ensure every seed produced a valid dungeon. Carmack's Quake III used a fixed LCG with known test vectors — any change to the algorithm would break the test suite immediately.

## Systems Thinking Connection

RNG testing is the RPG equivalent of the Robotics path's rosbag regression tests — both verify that the same input produces the same output across builds. The principle is identical: deterministic replay requires deterministic subsystems.

## Skill Reinforcement

This builds on Lesson 21 (Deterministic RNG) and Lesson 22 (No-rand Rule). It feeds into Lesson 95 (Gate C) where all tests must pass for a clean build, and Lesson 99 (Release Checklist) where test results are part of the pre-release audit.

## Mastery Check

**Q:** Why must RNG tests use fixed seeds instead of time-based seeds?
**A:** A test with a random seed is non-deterministic — it might pass today and fail tomorrow. Fixed seeds make the test reproducible: same seed, same sequence, same result. If it fails, you can debug it reliably.`,
    starterCode: `#include <iostream>
using namespace std;

struct RNG { unsigned int state; };
void rng_seed(RNG& r, unsigned int s) { r.state = s; }
unsigned int rng_next(RNG& r) { r.state = r.state*1664525u+1013904223u; return r.state; }
int rng_range(RNG& r, int lo, int hi) { return lo+(int)(rng_next(r)%(unsigned)(hi-lo+1)); }

// TODO: bool testRNGDeterminism() — seed two RNGs with 42, compare 100 values

// TODO: bool testRNGBounds() — call rng_range(r,0,9) 1000 times, check all in [0,9]

int main() {
    // TODO: run both tests, print PASS or FAIL for each
    // TEST_RNG_DETERMINISM|PASS
    // TEST_RNG_BOUNDS|PASS
    // RNG_TESTS|all_passed
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct RNG { unsigned int state; };
void rng_seed(RNG& r, unsigned int s) { r.state = s; }
unsigned int rng_next(RNG& r) { r.state = r.state*1664525u+1013904223u; return r.state; }
int rng_range(RNG& r, int lo, int hi) { return lo+(int)(rng_next(r)%(unsigned)(hi-lo+1)); }

bool testRNGDeterminism() {
    RNG a, b;
    rng_seed(a, 42); rng_seed(b, 42);
    for (int i = 0; i < 100; i++) {
        if (rng_next(a) != rng_next(b)) return false;
    }
    return true;
}

bool testRNGBounds() {
    RNG r;
    rng_seed(r, 42);
    for (int i = 0; i < 1000; i++) {
        int v = rng_range(r, 0, 9);
        if (v < 0 || v > 9) return false;
    }
    return true;
}

int main() {
    bool d = testRNGDeterminism();
    cout << "TEST_RNG_DETERMINISM|" << (d ? "PASS" : "FAIL") << endl;
    bool b = testRNGBounds();
    cout << "TEST_RNG_BOUNDS|" << (b ? "PASS" : "FAIL") << endl;
    bool all = d && b;
    cout << "RNG_TESTS|" << (all ? "all_passed" : "some_failed") << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Determinism test passes", expectedOutput: "TEST_RNG_DETERMINISM|PASS", isPattern: false },
      { id: "t2", description: "Bounds test passes", expectedOutput: "TEST_RNG_BOUNDS|PASS", isPattern: false },
      { id: "t3", description: "All tests passed", expectedOutput: "RNG_TESTS|all_passed", isPattern: false },
    ],
    hints: [
      "testRNGDeterminism creates two RNG instances, seeds both with the same value, and compares their outputs.",
      "testRNGBounds calls rng_range in a loop and checks each value is between lo and hi inclusive.",
      "Both functions return bool. Print PASS if true, FAIL if false. Use the ternary operator: (result ? \"PASS\" : \"FAIL\")",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: RNG Test Suite",
    type: "game_builder",
    instructions: `# Build: RNG Test Suite

## Mental Model

A test suite is a collection of automated checks that verify your subsystems work correctly. Each test is independent, returns pass/fail, and the suite reports a summary. If any test fails, the build is blocked.

## What Breaks Without This

Without automated tests, "it works on my machine" is the only verification. Someone changes the LCG constants, replay breaks, and nobody notices until a player reports corrupted saves three weeks later.

## Your Task

Build a complete RNG test suite with three tests:

1. **testRNGDeterminism()** — same seed (42) produces same 100-value sequence
2. **testRNGBounds()** — rng_range(r, 0, 9) stays in [0,9] for 1000 calls
3. **testRNGSequence()** — seed 42, call rng_next() 3 times, verify exact values

The exact values for seed 42 with our LCG (state*1664525+1013904223):
- Call 1: state = 42*1664525+1013904223 = 1083916273
- Call 2: next iteration from state 1083916273
- Call 3: next iteration from that

Print results and a summary line.

**Expected output:**
\`\`\`
TEST_RNG_DETERMINISM|PASS
TEST_RNG_BOUNDS|PASS
TEST_RNG_SEQUENCE|PASS
RNG_SUITE|3/3|all_passed
\`\`\`

## Performance Insight

Running 1000 RNG calls in a bounds test takes microseconds. Tests are cheap. Debugging a broken replay system takes hours. Always invest in tests.

## Memory Insight

Each test allocates RNG structs (4 bytes each) on the stack. No heap. No cleanup. Tests are the lightest code you will write.

## Beginner Trap

**Not testing exact values:**

\`\`\`cpp
// BAD: only tests that rng_next returns SOMETHING
if (rng_next(r) != 0) pass++;  // this tells you nothing

// GOOD: tests that seed 42 produces EXACT expected value
if (rng_next(r) == 1083916273u) pass++;  // deterministic contract
\`\`\`

Determinism means exact values, not just non-zero values. Test the contract precisely.

## Elite Insight

Valve's Source engine has regression tests for its random number generator that verify exact sequences. When they switched from one LCG to Mersenne Twister, every test had to be updated — the old tests caught the change immediately. Nintendo's internal QA runs deterministic test suites on every ROM build. Your test suite follows the same principle at a smaller scale.`,
    starterCode: `#include <iostream>
using namespace std;

struct RNG { unsigned int state; };
void rng_seed(RNG& r, unsigned int s) { r.state = s; }
unsigned int rng_next(RNG& r) { r.state = r.state*1664525u+1013904223u; return r.state; }
int rng_range(RNG& r, int lo, int hi) { return lo+(int)(rng_next(r)%(unsigned)(hi-lo+1)); }

// TODO: bool testRNGDeterminism()
// TODO: bool testRNGBounds()
// TODO: bool testRNGSequence() — verify first value from seed 42 is 1083916273

int main() {
    int passed = 0;
    // TODO: run all 3 tests, print result for each, count passes
    // TODO: print RNG_SUITE|3/3|all_passed (or N/3|some_failed)
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct RNG { unsigned int state; };
void rng_seed(RNG& r, unsigned int s) { r.state = s; }
unsigned int rng_next(RNG& r) { r.state = r.state*1664525u+1013904223u; return r.state; }
int rng_range(RNG& r, int lo, int hi) { return lo+(int)(rng_next(r)%(unsigned)(hi-lo+1)); }

bool testRNGDeterminism() {
    RNG a, b;
    rng_seed(a, 42); rng_seed(b, 42);
    for (int i = 0; i < 100; i++) {
        if (rng_next(a) != rng_next(b)) return false;
    }
    return true;
}

bool testRNGBounds() {
    RNG r;
    rng_seed(r, 42);
    for (int i = 0; i < 1000; i++) {
        int v = rng_range(r, 0, 9);
        if (v < 0 || v > 9) return false;
    }
    return true;
}

bool testRNGSequence() {
    RNG r;
    rng_seed(r, 42);
    unsigned int v1 = rng_next(r);
    if (v1 != 1083916273u) return false;
    return true;
}

int main() {
    int passed = 0;
    bool d = testRNGDeterminism();
    cout << "TEST_RNG_DETERMINISM|" << (d ? "PASS" : "FAIL") << endl;
    if (d) passed++;
    bool b = testRNGBounds();
    cout << "TEST_RNG_BOUNDS|" << (b ? "PASS" : "FAIL") << endl;
    if (b) passed++;
    bool s = testRNGSequence();
    cout << "TEST_RNG_SEQUENCE|" << (s ? "PASS" : "FAIL") << endl;
    if (s) passed++;
    cout << "RNG_SUITE|" << passed << "/3|" << (passed==3 ? "all_passed" : "some_failed") << endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Determinism test passes", expectedOutput: "TEST_RNG_DETERMINISM|PASS", isPattern: false },
      { id: "g2", description: "Bounds test passes", expectedOutput: "TEST_RNG_BOUNDS|PASS", isPattern: false },
      { id: "g3", description: "Sequence test passes", expectedOutput: "TEST_RNG_SEQUENCE|PASS", isPattern: false },
      { id: "g4", description: "Suite summary", expectedOutput: "RNG_SUITE|3/3|all_passed", isPattern: false },
    ],
    hints: [
      "Each test function returns bool. Run all three in main, count how many pass.",
      "testRNGSequence seeds with 42, calls rng_next once, checks the value equals 1083916273u.",
      "Summary line: cout << \"RNG_SUITE|\" << passed << \"/3|\" << (passed==3 ? \"all_passed\" : \"some_failed\") << endl;",
    ],
    estimatedMinutes: 12,
  },
};