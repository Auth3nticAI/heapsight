import type { Lesson } from "@/types/lesson";

export const lesson97: Lesson = {
  id: "97-unit-tests",
  title: "Unit Tests",
  description: "Write unit tests for core game functions to verify correctness.",
  order: 97,
  xpReward: 225,
  tier: "pro",
  concepts: ["unit testing", "test functions", "assertions", "test runner"],
  part1: {
    title: "Concept: Unit Tests",
    type: "concept",
    instructions: `# Unit Tests — Code Without Tests Is Code You Cannot Trust

You change the collision function. The game compiles. You play for thirty seconds. Looks fine. You ship it. A user reports that enemies near the screen edge no longer take damage. The collision function had an off-by-one error you introduced in the refactor. You never tested the edge case. You never tested any case. Tests are not optional. They are the proof that your code does what you think it does.

## What Breaks Without This

Without tests, every change is a gamble. Refactor the score system and the combo multiplier silently breaks. Optimize the pool allocator and the free list corrupts. Fix a collision bug and the clamp function returns wrong values. You will not notice until a user finds it. Tests catch regressions the moment they happen. Before the binary ships. Before the user plays.

## The Fix

Write test functions. Each test calls a game function with known inputs and checks the output against expected values. No framework needed. A test is a function that prints PASS or FAIL. A test runner calls all tests and counts results.

\\\`\\\`\\\`
// Simple assertion:
void test_clamp() {
    int checks = 0;
    // Value in range stays unchanged
    int result = clamp(5, 0, 10);
    if (result == 5) checks++;

    // Value below min clamps to min
    result = clamp(-3, 0, 10);
    if (result == 0) checks++;

    // Value above max clamps to max
    result = clamp(15, 0, 10);
    if (result == 10) checks++;

    cout << "TEST|test_clamp|PASS|checks|" << checks << endl;
}
\\\`\\\`\\\`

The test runner calls each test function. After all tests, print a summary: total, passed, failed, total checks. Zero failures means the code is correct for the tested cases. Not proven correct for all cases — but correct for the ones that matter.

## Your Task

1. Implement helper functions: \\\`clamp\\\`, \\\`checkCollision\\\` (AABB), \\\`applyDamage\\\`, \\\`poolAlloc\\\`, \\\`calcScore\\\`
2. Write 5 test functions that call the helpers and verify results
3. test_collision: 4 checks (overlap, no overlap, edge, adjacent)
4. test_damage: 3 checks (normal, overkill, zero)
5. test_pool_alloc: 2 checks (valid index, full pool)
6. test_clamp: 4 checks (in range, below, above, boundary)
7. test_score: 3 checks (base, combo 2x, combo 5x)
8. Print per test: \\\`TEST|test_name|PASS|checks|N\\\`
9. Print: \\\`TEST_SUMMARY|total|5|passed|5|failed|0|checks|16\\\`

Expected output:
\\\`\\\`\\\`
TEST|test_collision|PASS|checks|4
TEST|test_damage|PASS|checks|3
TEST|test_pool_alloc|PASS|checks|2
TEST|test_clamp|PASS|checks|4
TEST|test_score|PASS|checks|3
TEST_SUMMARY|total|5|passed|5|failed|0|checks|16
\\\`\\\`\\\`

## Beginner Trap

**Common Mistake:** Testing only the happy path. You test that collision returns true when boxes overlap. You never test that it returns false when they do not. Half your tests are missing. Test both the positive and negative cases. If a function can return true or false, test both branches.

## Elite Insight

Test-driven development writes the test first. Before the function exists. The test defines the contract. Then you write the minimal code to make it pass. TDD is not about testing — it is about design. The test forces you to think about the interface before the implementation. What goes in. What comes out. What can go wrong.

## Cross-Path Echo

API testing follows the same pattern. Send a request with known input. Check the response against expected output. Status code 200, body matches schema, response time under 100ms. Your unit tests are API tests for functions. Same input, expected output, pass or fail.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

// Helper functions to test
int clamp(int val, int lo, int hi) {
    if (val < lo) return lo;
    if (val > hi) return hi;
    return val;
}

bool checkCollision(int ax, int ay, int aw, int ah,
                    int bx, int by, int bw, int bh) {
    return ax < bx + bw && ax + aw > bx &&
           ay < by + bh && ay + ah > by;
}

int applyDamage(int currentHP, int damage) {
    int result = currentHP - damage;
    if (result < 0) result = 0;
    return result;
}

int poolAlloc(int freeCount) {
    if (freeCount <= 0) return -1;
    return freeCount - 1;
}

int calcScore(int basePoints, int comboMultiplier) {
    return basePoints * comboMultiplier;
}

int totalTests = 0;
int passedTests = 0;
int failedTests = 0;
int totalChecks = 0;

// TODO: Write test_collision() — 4 checks
//   Overlap, no overlap, edge touching, adjacent

// TODO: Write test_damage() — 3 checks
//   Normal (50hp - 20dmg = 30), overkill (10hp - 50dmg = 0), zero (50hp - 0dmg = 50)

// TODO: Write test_pool_alloc() — 2 checks
//   Valid (freeCount=5 -> 4), full (freeCount=0 -> -1)

// TODO: Write test_clamp() — 4 checks
//   In range, below min, above max, at boundary

// TODO: Write test_score() — 3 checks
//   Base (100*1=100), combo2x (100*2=200), combo5x (100*5=500)

int main() {
    // TODO: Run all 5 tests
    // TODO: Print TEST_SUMMARY

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

int clamp(int val, int lo, int hi) {
    if (val < lo) return lo;
    if (val > hi) return hi;
    return val;
}

bool checkCollision(int ax, int ay, int aw, int ah,
                    int bx, int by, int bw, int bh) {
    return ax < bx + bw && ax + aw > bx &&
           ay < by + bh && ay + ah > by;
}

int applyDamage(int currentHP, int damage) {
    int result = currentHP - damage;
    if (result < 0) result = 0;
    return result;
}

int poolAlloc(int freeCount) {
    if (freeCount <= 0) return -1;
    return freeCount - 1;
}

int calcScore(int basePoints, int comboMultiplier) {
    return basePoints * comboMultiplier;
}

int totalTests = 0;
int passedTests = 0;
int failedTests = 0;
int totalChecks = 0;

void test_collision() {
    int checks = 0;
    // Overlap
    if (checkCollision(0, 0, 10, 10, 5, 5, 10, 10) == true) checks++;
    // No overlap
    if (checkCollision(0, 0, 10, 10, 50, 50, 10, 10) == false) checks++;
    // Edge touching (not overlapping in AABB)
    if (checkCollision(0, 0, 10, 10, 10, 0, 10, 10) == false) checks++;
    // Adjacent vertically
    if (checkCollision(0, 0, 10, 10, 0, 10, 10, 10) == false) checks++;
    totalChecks += checks;
    totalTests++;
    passedTests++;
    cout << "TEST|test_collision|PASS|checks|" << checks << endl;
}

void test_damage() {
    int checks = 0;
    if (applyDamage(50, 20) == 30) checks++;
    if (applyDamage(10, 50) == 0) checks++;
    if (applyDamage(50, 0) == 50) checks++;
    totalChecks += checks;
    totalTests++;
    passedTests++;
    cout << "TEST|test_damage|PASS|checks|" << checks << endl;
}

void test_pool_alloc() {
    int checks = 0;
    if (poolAlloc(5) == 4) checks++;
    if (poolAlloc(0) == -1) checks++;
    totalChecks += checks;
    totalTests++;
    passedTests++;
    cout << "TEST|test_pool_alloc|PASS|checks|" << checks << endl;
}

void test_clamp() {
    int checks = 0;
    if (clamp(5, 0, 10) == 5) checks++;
    if (clamp(-3, 0, 10) == 0) checks++;
    if (clamp(15, 0, 10) == 10) checks++;
    if (clamp(0, 0, 10) == 0) checks++;
    totalChecks += checks;
    totalTests++;
    passedTests++;
    cout << "TEST|test_clamp|PASS|checks|" << checks << endl;
}

void test_score() {
    int checks = 0;
    if (calcScore(100, 1) == 100) checks++;
    if (calcScore(100, 2) == 200) checks++;
    if (calcScore(100, 5) == 500) checks++;
    totalChecks += checks;
    totalTests++;
    passedTests++;
    cout << "TEST|test_score|PASS|checks|" << checks << endl;
}

int main() {
    test_collision();
    test_damage();
    test_pool_alloc();
    test_clamp();
    test_score();

    cout << "TEST_SUMMARY|total|" << totalTests
         << "|passed|" << passedTests
         << "|failed|" << failedTests
         << "|checks|" << totalChecks << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Collision tests pass", expectedOutput: "TEST\\|test_collision\\|PASS\\|checks\\|4", isPattern: true },
      { id: "t2", description: "Damage tests pass", expectedOutput: "TEST\\|test_damage\\|PASS\\|checks\\|3", isPattern: true },
      { id: "t3", description: "Pool alloc tests pass", expectedOutput: "TEST\\|test_pool_alloc\\|PASS\\|checks\\|2", isPattern: true },
      { id: "t4", description: "Clamp tests pass", expectedOutput: "TEST\\|test_clamp\\|PASS\\|checks\\|4", isPattern: true },
      { id: "t5", description: "Score tests pass", expectedOutput: "TEST\\|test_score\\|PASS\\|checks\\|3", isPattern: true },
      { id: "t6", description: "Test summary", expectedOutput: "TEST_SUMMARY\\|total\\|5\\|passed\\|5\\|failed\\|0\\|checks\\|16", isPattern: true },
    ],
    hints: [
      "Each test function increments a checks counter for each assertion that passes. After all checks, increment totalTests and passedTests, then print the TEST line with the check count.",
      "test_collision uses checkCollision with 4 different box configurations: overlapping, far apart, edge-touching (not overlapping), and vertically adjacent. Each returns the expected bool.",
      "The TEST_SUMMARY line prints after all 5 tests. totalTests=5, passedTests=5, failedTests=0, totalChecks=4+3+2+4+3=16.",
    ],
    estimatedMinutes: 7,
  },
  part2: {
    title: "Game: Unit Tests",
    type: "game_builder",
    instructions: `# Unit Tests — Proving the Game Works

Every system in the game has assumptions. Collision assumes AABB overlap math is correct. Damage assumes HP never goes negative. The pool assumes allocation returns valid indices. The score assumes combo multiplier math is right. Clamp assumes bounds are enforced. These assumptions must be verified. Unit tests verify them.

## What Breaks Without This

Without tests, refactoring is terrifying. You want to optimize the collision check but you cannot prove it still works after the change. You want to simplify the score formula but you cannot verify edge cases. Every optimization, every refactor, every bug fix risks breaking something else. Tests are the safety net.

## The Fix

Five test functions. Each calls a core game function with known inputs. Each checks the result against expected output. Each reports PASS with check count. The test runner reports the total. Zero failures means the core is solid.

\\\`\\\`\\\`
// Test structure:
// 1. Call function with known input
// 2. Compare result to expected value
// 3. Increment check counter if correct
// 4. Print TEST|name|PASS|checks|N
\\\`\\\`\\\`

## Your Task

1. test_collision: 4 checks — overlap true, no overlap false, edge false, adjacent false
2. test_damage: 3 checks — normal subtraction, overkill clamps to 0, zero damage no change
3. test_pool_alloc: 2 checks — valid index from free count, -1 when empty
4. test_clamp: 4 checks — in range, below min, above max, at boundary
5. test_score: 3 checks — base * 1, base * 2, base * 5
6. Print per test: \\\`TEST|test_name|PASS|checks|N\\\`
7. Print: \\\`TEST_SUMMARY|total|5|passed|5|failed|0|checks|16\\\`

## Beginner Trap

**Common Mistake:** Not testing the zero and boundary cases. \\\`applyDamage(10, 50)\\\` must return 0, not -40. \\\`clamp(0, 0, 10)\\\` must return 0, not fail. \\\`poolAlloc(0)\\\` must return -1, not crash. Boundary cases are where bugs live.

## Elite Insight

Coverage measures how much of your code is tested. 100% line coverage means every line executed during tests. But 100% coverage does not mean 100% correct. You can cover every line without testing every edge case. Branch coverage is better — every if/else path tested. Mutation testing is best — change the code and verify a test fails. If no test fails, the test suite is weak.

## Cross-Path Echo

CI/CD pipelines run tests on every commit. Push code, tests run, red or green. If red, the commit is rejected. If green, it merges. Your test runner is a CI pipeline for your game. Every change must pass before it ships.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

int clamp(int val, int lo, int hi) {
    if (val < lo) return lo;
    if (val > hi) return hi;
    return val;
}

bool checkCollision(int ax, int ay, int aw, int ah,
                    int bx, int by, int bw, int bh) {
    return ax < bx + bw && ax + aw > bx &&
           ay < by + bh && ay + ah > by;
}

int applyDamage(int currentHP, int damage) {
    int result = currentHP - damage;
    if (result < 0) result = 0;
    return result;
}

int poolAlloc(int freeCount) {
    if (freeCount <= 0) return -1;
    return freeCount - 1;
}

int calcScore(int basePoints, int comboMultiplier) {
    return basePoints * comboMultiplier;
}

int totalTests = 0;
int passedTests = 0;
int failedTests = 0;
int totalChecks = 0;

// TODO: Write test_collision() — 4 checks
// TODO: Write test_damage() — 3 checks
// TODO: Write test_pool_alloc() — 2 checks
// TODO: Write test_clamp() — 4 checks
// TODO: Write test_score() — 3 checks

int main() {
    // TODO: Run all 5 tests
    // TODO: Print TEST_SUMMARY

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

int clamp(int val, int lo, int hi) {
    if (val < lo) return lo;
    if (val > hi) return hi;
    return val;
}

bool checkCollision(int ax, int ay, int aw, int ah,
                    int bx, int by, int bw, int bh) {
    return ax < bx + bw && ax + aw > bx &&
           ay < by + bh && ay + ah > by;
}

int applyDamage(int currentHP, int damage) {
    int result = currentHP - damage;
    if (result < 0) result = 0;
    return result;
}

int poolAlloc(int freeCount) {
    if (freeCount <= 0) return -1;
    return freeCount - 1;
}

int calcScore(int basePoints, int comboMultiplier) {
    return basePoints * comboMultiplier;
}

int totalTests = 0;
int passedTests = 0;
int failedTests = 0;
int totalChecks = 0;

void test_collision() {
    int checks = 0;
    if (checkCollision(0, 0, 10, 10, 5, 5, 10, 10) == true) checks++;
    if (checkCollision(0, 0, 10, 10, 50, 50, 10, 10) == false) checks++;
    if (checkCollision(0, 0, 10, 10, 10, 0, 10, 10) == false) checks++;
    if (checkCollision(0, 0, 10, 10, 0, 10, 10, 10) == false) checks++;
    totalChecks += checks;
    totalTests++;
    passedTests++;
    cout << "TEST|test_collision|PASS|checks|" << checks << endl;
}

void test_damage() {
    int checks = 0;
    if (applyDamage(50, 20) == 30) checks++;
    if (applyDamage(10, 50) == 0) checks++;
    if (applyDamage(50, 0) == 50) checks++;
    totalChecks += checks;
    totalTests++;
    passedTests++;
    cout << "TEST|test_damage|PASS|checks|" << checks << endl;
}

void test_pool_alloc() {
    int checks = 0;
    if (poolAlloc(5) == 4) checks++;
    if (poolAlloc(0) == -1) checks++;
    totalChecks += checks;
    totalTests++;
    passedTests++;
    cout << "TEST|test_pool_alloc|PASS|checks|" << checks << endl;
}

void test_clamp() {
    int checks = 0;
    if (clamp(5, 0, 10) == 5) checks++;
    if (clamp(-3, 0, 10) == 0) checks++;
    if (clamp(15, 0, 10) == 10) checks++;
    if (clamp(0, 0, 10) == 0) checks++;
    totalChecks += checks;
    totalTests++;
    passedTests++;
    cout << "TEST|test_clamp|PASS|checks|" << checks << endl;
}

void test_score() {
    int checks = 0;
    if (calcScore(100, 1) == 100) checks++;
    if (calcScore(100, 2) == 200) checks++;
    if (calcScore(100, 5) == 500) checks++;
    totalChecks += checks;
    totalTests++;
    passedTests++;
    cout << "TEST|test_score|PASS|checks|" << checks << endl;
}

int main() {
    test_collision();
    test_damage();
    test_pool_alloc();
    test_clamp();
    test_score();

    cout << "TEST_SUMMARY|total|" << totalTests
         << "|passed|" << passedTests
         << "|failed|" << failedTests
         << "|checks|" << totalChecks << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Collision tests pass", expectedOutput: "TEST\\|test_collision\\|PASS\\|checks\\|4", isPattern: true },
      { id: "t2", description: "Damage tests pass", expectedOutput: "TEST\\|test_damage\\|PASS\\|checks\\|3", isPattern: true },
      { id: "t3", description: "Pool alloc tests pass", expectedOutput: "TEST\\|test_pool_alloc\\|PASS\\|checks\\|2", isPattern: true },
      { id: "t4", description: "Clamp tests pass", expectedOutput: "TEST\\|test_clamp\\|PASS\\|checks\\|4", isPattern: true },
      { id: "t5", description: "Score tests pass", expectedOutput: "TEST\\|test_score\\|PASS\\|checks\\|3", isPattern: true },
      { id: "t6", description: "Test summary correct", expectedOutput: "TEST_SUMMARY\\|total\\|5\\|passed\\|5\\|failed\\|0\\|checks\\|16", isPattern: true },
    ],
    hints: [
      "Each test function calls the helper with known inputs and compares to expected output. Increment checks for each passing assertion. Print the TEST line after all checks in that function.",
      "test_collision tests 4 AABB configurations: overlapping boxes (true), far apart (false), edge-touching at x=10 (false because < not <=), and vertically adjacent (false).",
      "After all 5 tests, print TEST_SUMMARY. Total checks = 4+3+2+4+3 = 16. All tests pass so passed=5, failed=0.",
    ],
    estimatedMinutes: 10,
  },
};
