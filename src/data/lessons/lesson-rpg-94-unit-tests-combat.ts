import { Lesson } from "@/types/lesson";

export const lessonRPG94: Lesson = {
  id: "rpg-94-unit-tests-combat",
  title: "Unit Tests: Combat",
  description: "Automated combat tests: damage resolution, death at zero HP, overkill handling. Prove the combat system is deterministic.",
  order: 94,
  xpReward: 100,
  tier: "pro",
  concepts: ["unit testing", "combat testing", "edge case testing", "deterministic verification", "test_combat.cpp"],
  part1: {
    title: "Concept: Testing Combat Logic",
    type: "concept",
    instructions: `# Unit Tests: Combat

## Mental Model

Combat is the RPG's most critical system. If damage resolution has an
off-by-one error, if death doesn't trigger at exactly zero HP, if
overkill causes underflow — the game breaks in ways players notice
immediately. Fix: targeted test cases that exercise each critical path.
Pure function tests: set up state, call, check result. No side effects.

## What Breaks Without This

Without combat tests:
- Off-by-one errors in damage go undetected
- Death threshold bugs appear only during play
- Overkill underflow corrupts HP to -999
- Refactoring combat breaks behavior silently

## The Fix

Three test categories:

\`\`\`cpp
bool testNormalDamage() { return applyDamage(20, 5) == 15; }
bool testExactLethal() { return applyDamage(5, 5) == 0 && isDead(0); }
bool testOverkill() { return applyDamage(3, 10) == 0; } // clamped, not -7
\`\`\`

## Key Concepts

- **Pure function test**: input in, output out, no side effects
- **Edge cases**: zero damage, exact lethal, overkill
- **Boolean result**: pass/fail, no visual inspection
- **Deterministic**: same input always gives same output

## Performance Insight

Tests run in microseconds. 10 combat tests take less time than a
single frame render. Zero excuse for not running them before every build.

## Memory Insight

Tests use stack variables only. No heap allocation, no global state
mutation. Each test is independent — ordering doesn't matter.

## Your Task

Write applyDamage that clamps to 0. Write 2 tests: normal damage
and overkill. Run both and print results.

## Beginner Trap

\`\`\`cpp
// BAD: Testing by visual inspection
cout << "HP: " << applyDamage(20, 5) << endl;
// "Looks like 15... I think?"
// FIX: Assert with boolean: applyDamage(20, 5) == 15
\`\`\`

## Elite Insight

Riot Games runs thousands of automated combat tests for League of
Legends every patch. Each champion's abilities are tested against
edge cases: zero armor, max attack speed, negative health regen.

## Systems Thinking Connection

Combat tests validate the damage pipeline from L08, L18, and L86.
If these tests pass, the entire combat chain is proven correct.

## Skill Reinforcement

- applyDamage from L08
- Clamping from L88
- Boolean logic from L04

## Mastery Check

You pass when TEST|normal shows PASS and TEST|overkill shows PASS.`,
    starterCode: `#include <iostream>
using namespace std;

// TODO: applyDamage(int hp, int dmg) — returns max(hp - dmg, 0)
// TODO: isDead(int hp) — returns hp <= 0

bool testNormal() { return applyDamage(20, 5) == 15; }
bool testOverkill() { return applyDamage(3, 10) == 0; }

int main() {
    cout << "TEST|normal|" << (testNormal() ? "PASS" : "FAIL") << endl;
    cout << "TEST|overkill|" << (testOverkill() ? "PASS" : "FAIL") << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int applyDamage(int hp, int dmg) { int r = hp - dmg; return r < 0 ? 0 : r; }
bool isDead(int hp) { return hp <= 0; }

bool testNormal() { return applyDamage(20, 5) == 15; }
bool testOverkill() { return applyDamage(3, 10) == 0; }

int main() {
    cout << "TEST|normal|" << (testNormal() ? "PASS" : "FAIL") << endl;
    cout << "TEST|overkill|" << (testOverkill() ? "PASS" : "FAIL") << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Normal damage test", expectedOutput: "TEST|normal|PASS", isPattern: false },
      { id: "t2", description: "Overkill test", expectedOutput: "TEST|overkill|PASS", isPattern: false },
    ],
    hints: [
      "applyDamage: int r = hp - dmg; return r < 0 ? 0 : r;",
      "testOverkill expects applyDamage(3, 10) == 0, NOT -7.",
      "isDead returns hp <= 0. Simple boolean check.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Build: Combat Test Suite",
    type: "game_builder",
    instructions: `# Build: Combat Unit Tests

## Mental Model

Part 1 proved basic test functions. Now build a full 5-test suite:
normal damage, zero damage, exact lethal, overkill clamp, and assist
scaling. Each test returns bool. A harness runs all 5 and prints a
summary with pass count.

## What Breaks Without This

Without a full test suite:
- Zero damage edge case might return -0 or NaN
- Exact lethal (5-5=0) might not trigger isDead
- Assist scaling might have integer truncation bugs

## The Fix

5 test functions, each returning bool. A runTest helper prints
TEST|name|PASS or FAIL. Count passes, print summary.

## Key Concepts

- **Test harness**: runTest(name, result, &passed) prints and counts
- **Edge coverage**: normal, zero, lethal, overkill, scaling
- **Summary line**: COMBAT_TESTS|passed=P|total=5
- **Independence**: each test uses local variables only

## Performance Insight

5 tests: 5 function calls, 5 comparisons, 5 prints. Under 10
microseconds total. Tests should run every build.

## Memory Insight

Each test uses 2-3 stack integers. The harness counter is one int.
Total memory: ~30 bytes. Zero heap allocation.

## Your Task

1. Write applyDamage (clamp to 0), isDead, scaleDamage
2. Write 5 test functions returning bool
3. Use runTest to execute and print each
4. Print COMBAT_TESTS|passed=5|total=5

## Beginner Trap

\`\`\`cpp
// BAD: Tests that modify global state
int global_hp = 20;
bool testDamage() { global_hp -= 5; return global_hp == 15; }
// Second call fails! Use local variables in each test.
\`\`\`

## Elite Insight

Google Test (gtest) uses a similar pattern: TEST macros that return
pass/fail, a runner that collects results, a summary line. Your
hand-rolled harness teaches the same pattern.

## Mastery Check

You pass when all 5 TEST lines show PASS and
COMBAT_TESTS|passed=5|total=5.`,
    starterCode: `#include <iostream>
using namespace std;

// TODO: applyDamage(int hp, int dmg) — returns max(hp - dmg, 0)
// TODO: isDead(int hp) — returns hp <= 0
// TODO: scaleDamage(int raw, int scale) — returns (raw * scale) / 100

bool testNormalDamage() { return applyDamage(20, 5) == 15; }
bool testZeroDamage() { return applyDamage(20, 0) == 20; }
// TODO: testExactLethal — applyDamage(5,5)==0 && isDead(0)
// TODO: testOverkillClamp — applyDamage(3,10)==0 (not -7)
// TODO: testAssistScaling — scaleDamage(10,50)==5

void runTest(const char* name, bool result, int& passed) {
    cout << "TEST|" << name << "|" << (result ? "PASS" : "FAIL") << endl;
    if (result) passed++;
}

int main() {
    int passed = 0;
    runTest("normal_damage", testNormalDamage(), passed);
    runTest("zero_damage", testZeroDamage(), passed);
    // TODO: Run remaining 3 tests
    cout << "COMBAT_TESTS|passed=" << passed << "|total=5" << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int applyDamage(int hp, int dmg) { int r = hp - dmg; return r < 0 ? 0 : r; }
bool isDead(int hp) { return hp <= 0; }
int scaleDamage(int raw, int scale) { return (raw * scale) / 100; }

bool testNormalDamage() { return applyDamage(20, 5) == 15; }
bool testZeroDamage() { return applyDamage(20, 0) == 20; }
bool testExactLethal() { return applyDamage(5, 5) == 0 && isDead(0); }
bool testOverkillClamp() { return applyDamage(3, 10) == 0; }
bool testAssistScaling() { return scaleDamage(10, 50) == 5; }

void runTest(const char* name, bool result, int& passed) {
    cout << "TEST|" << name << "|" << (result ? "PASS" : "FAIL") << endl;
    if (result) passed++;
}

int main() {
    int passed = 0;
    runTest("normal_damage", testNormalDamage(), passed);
    runTest("zero_damage", testZeroDamage(), passed);
    runTest("exact_lethal", testExactLethal(), passed);
    runTest("overkill_clamp", testOverkillClamp(), passed);
    runTest("assist_scaling", testAssistScaling(), passed);
    cout << "COMBAT_TESTS|passed=" << passed << "|total=5" << endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Normal damage test", expectedOutput: "TEST|normal_damage|PASS", isPattern: false },
      { id: "g2", description: "Exact lethal test", expectedOutput: "TEST|exact_lethal|PASS", isPattern: false },
      { id: "g3", description: "Overkill clamp test", expectedOutput: "TEST|overkill_clamp|PASS", isPattern: false },
      { id: "g4", description: "Assist scaling test", expectedOutput: "TEST|assist_scaling|PASS", isPattern: false },
      { id: "g5", description: "All tests pass", expectedOutput: "COMBAT_TESTS|passed=5|total=5", isPattern: false },
    ],
    hints: [
      "applyDamage: int r = hp - dmg; return r < 0 ? 0 : r; The ternary clamps to zero.",
      "testExactLethal checks both: applyDamage(5,5)==0 AND isDead(0)==true.",
      "testOverkillClamp verifies applyDamage(3,10) returns 0, not -7.",
    ],
    estimatedMinutes: 10,
  },
};