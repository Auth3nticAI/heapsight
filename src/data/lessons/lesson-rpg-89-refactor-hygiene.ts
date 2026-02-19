import { Lesson } from "@/types/lesson";

export const lessonRPG89: Lesson = {
  id: "rpg-89-refactor-hygiene",
  title: "Refactor Hygiene",
  description: "Identify and remove dead code, simplify branching, and tighten function signatures. Clean code ships faster.",
  order: 89,
  xpReward: 100,
  tier: "pro",
  concepts: ["dead code removal", "refactoring", "code hygiene", "simplification", "maintenance discipline"],
  part1: {
    title: "Concept: Cleaning Code Without Breaking It",
    type: "concept",
    instructions: `# Refactor Hygiene

## Mental Model

After 88 lessons of building, your codebase has cruft: unused variables,
functions that were replaced but never deleted, nested ifs that could be
flattened, parameters that are always the same value. None of this breaks
the game, but it makes code harder to read and maintain. Fix: three
systematic cleanup passes — dead code removal, branch flattening,
and signature tightening.

## What Breaks Without This

Without refactoring discipline:
- Dead code accumulates, obscuring live logic
- Nested ifs make control flow hard to trace
- Unused parameters confuse new contributors
- Technical debt compounds with every new feature

## The Fix

Three passes, each provably safe:

\`\`\`cpp
// Pass 1: Delete dead code
// If tests still pass after deletion, it was dead

// Pass 2: Flatten nested ifs with early returns
if (!entity_active) return;
if (hp <= 0) return;
applyDamage();

// Pass 3: Remove unused parameters
void renderHUD(int hp, int max_hp, int gold, int turn) { ... }
\`\`\`

## Key Concepts

- **Dead code**: functions/variables with zero references
- **Branch flattening**: early returns instead of nested ifs
- **Signature tightening**: remove unused parameters
- **Safe refactoring**: same output before and after

## Performance Insight

Dead code removal doesn't change runtime performance — the compiler
already ignores unreachable code. But it reduces cognitive load.
Engineers who read code faster find bugs faster.

## Memory Insight

Unused functions occupy binary space unless the linker strips them.
Cleaning up reduces binary size slightly, but the real win is
reduced complexity.

## Your Task

Write a messy function with dead code and nested ifs. Then write
the clean version. Verify both produce identical output.

## Beginner Trap

\`\`\`cpp
// BAD: Commenting out instead of deleting
// void oldDamageCalc(int hp, int dmg) { ... }
// "Just in case we need it later"
// That's what version control is for. Delete it.
\`\`\`

## Elite Insight

Google's code health practice: if a function has zero callers,
delete it. If a variable is written but never read, delete it.
Git preserves history. Living code should contain only living code.

## Systems Thinking Connection

Refactoring keeps all your systems (combat, spawn, save/load)
readable. The cleaner the code, the faster you can add features
in the next milestone.

## Skill Reinforcement

- Function design from L05
- Loop patterns from L07
- Early return from L08 (combat rules)

## Mastery Check

You pass when the messy and clean functions produce identical
COMBAT output lines.`,
    starterCode: `#include <iostream>
using namespace std;

// Messy version with dead code and nested ifs
void runCombatMessy(int unused_mode) {
    int hp = 20;
    int dead_var = 999;
    int hits[] = {5, 8, 3};
    cout << "MESSY|start" << endl;
    for (int i = 0; i < 3; i++) {
        if (true) {
            if (hp > 0) {
                if (hits[i] > 0) {
                    hp -= hits[i];
                    cout << "COMBAT|hit=" << hits[i] << "|hp=" << hp << endl;
                }
            }
        }
    }
    cout << "MESSY|final_hp=" << hp << endl;
}

// TODO: Write runCombatClean()
// Same behavior but: no unused param, no dead_var, flattened ifs

int main() {
    runCombatMessy(0);
    // TODO: runCombatClean()
    // TODO: Print REFACTOR_TEST|PASS
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

void runCombatMessy(int unused_mode) {
    int hp = 20;
    int dead_var = 999;
    int hits[] = {5, 8, 3};
    cout << "MESSY|start" << endl;
    for (int i = 0; i < 3; i++) {
        if (true) {
            if (hp > 0) {
                if (hits[i] > 0) {
                    hp -= hits[i];
                    cout << "COMBAT|hit=" << hits[i] << "|hp=" << hp << endl;
                }
            }
        }
    }
    cout << "MESSY|final_hp=" << hp << endl;
}

void runCombatClean() {
    int hp = 20;
    int hits[] = {5, 8, 3};
    cout << "CLEAN|start" << endl;
    for (int i = 0; i < 3; i++) {
        if (hp <= 0) continue;
        if (hits[i] <= 0) continue;
        hp -= hits[i];
        cout << "COMBAT|hit=" << hits[i] << "|hp=" << hp << endl;
    }
    cout << "CLEAN|final_hp=" << hp << endl;
}

int main() {
    runCombatMessy(0);
    runCombatClean();
    cout << "REFACTOR_TEST|PASS" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Messy runs", expectedOutput: "MESSY|final_hp=4", isPattern: false },
      { id: "t2", description: "Clean runs", expectedOutput: "CLEAN|final_hp=4", isPattern: false },
      { id: "t3", description: "Refactor test passes", expectedOutput: "REFACTOR_TEST|PASS", isPattern: false },
    ],
    hints: [
      "runCombatClean has no parameters, no dead_var, and uses early continue.",
      "The COMBAT lines must be identical for both functions.",
      "Only the prefix changes: MESSY vs CLEAN for start/final_hp lines.",
    ],
    estimatedMinutes: 6,
  },
  part2: {
    title: "Build: Before/After Refactoring",
    type: "game_builder",
    instructions: `# Build: Before/After Refactoring

## Mental Model

Part 1 proved you can refactor without changing behavior. Now do the
full demo: messy function with all three code smells (dead code,
nested ifs, unused params), clean function with all three fixed.
Run both, verify identical COMBAT output, print REFACTOR|PASS.

## What Breaks Without This

Without provable refactoring:
- You can't be sure the cleanup didn't break anything
- No evidence that both versions are behaviorally equivalent
- Future refactors become scarier without a testing pattern

## The Fix

Both functions process hits[] = {5, 8, 3} against hp = 20.
The messy version uses nested ifs and dead vars. The clean version
uses early continues and tight signatures. Both print identical
COMBAT lines.

## Key Concepts

- **Behavioral equivalence**: same input, same output
- **Dead code identification**: dead_var=999, unused_mode parameter
- **Branch simplification**: early continue replaces 3 nested ifs
- **Proof by output comparison**: if COMBAT lines match, refactor is safe

## Performance Insight

Both versions do the same work: 3 subtractions, 3 comparisons, 3 prints.
The clean version may be marginally faster due to fewer branch predictions,
but the real gain is readability.

## Memory Insight

The messy version wastes 4 bytes on dead_var. The clean version uses
exactly what it needs. In isolation, trivial. At scale, dead variables
add up.

## Your Task

1. Write runCombatClean: no unused param, no dead_var, flattened ifs
2. Run both messy and clean
3. Verify COMBAT output is identical
4. Print REFACTOR|PASS|same output

## Beginner Trap

\`\`\`cpp
// BAD: Changing behavior during refactoring
void runCombatClean() {
    hp -= hits[i] * 2;  // Accidentally changed damage!
}
// FIX: Refactoring means same behavior, different structure
\`\`\`

## Elite Insight

Martin Fowler's Refactoring: each transformation has a before/after
test. The test suite is your safety net. If it passes, the refactor
is safe. Your COMBAT output comparison is a mini test suite.

## Mastery Check

You pass when both functions produce final_hp=4 and
REFACTOR|PASS confirms identical behavior.`,
    starterCode: `#include <iostream>
using namespace std;

void runCombatMessy(int unused_mode) {
    int hp = 20;
    int dead_var = 999;
    int hits[] = {5, 8, 3};
    cout << "MESSY|start" << endl;
    for (int i = 0; i < 3; i++) {
        if (true) {
            if (hp > 0) {
                if (hits[i] > 0) {
                    hp -= hits[i];
                    cout << "COMBAT|hit=" << hits[i] << "|hp=" << hp << endl;
                }
            }
        }
    }
    cout << "MESSY|final_hp=" << hp << endl;
}

// TODO: Write runCombatClean()
// Same behavior, but:
// - No unused_mode parameter
// - No dead_var
// - Flattened ifs (early continue if hp<=0 or hits[i]<=0)
// - Print CLEAN|start and CLEAN|final_hp=H

int main() {
    runCombatMessy(0);
    // TODO: runCombatClean()
    // TODO: Print REFACTOR|PASS|same output
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

void runCombatMessy(int unused_mode) {
    int hp = 20;
    int dead_var = 999;
    int hits[] = {5, 8, 3};
    cout << "MESSY|start" << endl;
    for (int i = 0; i < 3; i++) {
        if (true) {
            if (hp > 0) {
                if (hits[i] > 0) {
                    hp -= hits[i];
                    cout << "COMBAT|hit=" << hits[i] << "|hp=" << hp << endl;
                }
            }
        }
    }
    cout << "MESSY|final_hp=" << hp << endl;
}

void runCombatClean() {
    int hp = 20;
    int hits[] = {5, 8, 3};
    cout << "CLEAN|start" << endl;
    for (int i = 0; i < 3; i++) {
        if (hp <= 0) continue;
        if (hits[i] <= 0) continue;
        hp -= hits[i];
        cout << "COMBAT|hit=" << hits[i] << "|hp=" << hp << endl;
    }
    cout << "CLEAN|final_hp=" << hp << endl;
}

int main() {
    runCombatMessy(0);
    runCombatClean();
    cout << "REFACTOR|PASS|same output" << endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Messy version runs", expectedOutput: "MESSY|final_hp=4", isPattern: false },
      { id: "g2", description: "Clean version runs", expectedOutput: "CLEAN|final_hp=4", isPattern: false },
      { id: "g3", description: "Same combat output", expectedOutput: "COMBAT|hit=8|hp=7", isPattern: false },
      { id: "g4", description: "Refactor passes", expectedOutput: "REFACTOR|PASS|same output", isPattern: false },
    ],
    hints: [
      "runCombatClean has no parameters, no dead_var, and uses early continue instead of nested ifs.",
      "The output must be identical for both: COMBAT|hit=5|hp=15, COMBAT|hit=8|hp=7, COMBAT|hit=3|hp=4.",
      "Only the prefix changes: MESSY|start vs CLEAN|start, MESSY|final_hp vs CLEAN|final_hp.",
    ],
    estimatedMinutes: 10,
  },
};