import { Lesson } from "@/types/lesson";

export const lessonRPG95: Lesson = {
  id: "rpg-95-gate-c-zero-warnings",
  title: "GATE C: Zero Warnings",
  description: "Build with -Wall -Wextra -Werror. Fix every warning: unused variables, signed/unsigned mismatches, missing returns. The compiler is your strictest code reviewer.",
  order: 95,
  xpReward: 300,
  tier: "pro",
  concepts: ["compiler warnings", "code discipline", "-Wall -Wextra -Werror", "clean builds", "gate system"],
  part1: {
    title: "Concept: The Compiler as Code Reviewer",
    type: "concept",
    instructions: `# GATE C: Zero Warnings

## Mental Model

Warnings are bugs that haven't crashed yet. An unused variable might
mean you forgot to use a computed result. A signed/unsigned comparison
might produce wrong behavior on edge inputs. A missing return path is
undefined behavior waiting to explode. Fix: -Wall -Wextra -Werror makes
the compiler your strictest code reviewer. Zero warnings = zero excuses.

## What Breaks Without This

Without warning discipline:
- Unused variables hide forgotten logic
- Signed/unsigned bugs cause subtle edge-case failures
- Missing returns produce undefined behavior
- Dead code accumulates without anyone noticing

## The Fix

Fix each warning category:

\`\`\`cpp
// 1. Unused variable: DELETE it
// 2. Signed/unsigned: match types (both int or both unsigned)
// 3. Missing return: add default return at end of function
// 4. Unused parameter: remove from signature
\`\`\`

## Key Concepts

- **-Wall**: enable all common warnings
- **-Wextra**: enable additional warnings
- **-Werror**: treat warnings as compilation errors
- **Zero warnings policy**: fix warnings, don't suppress them

## Performance Insight

Warning-free code has fewer bugs, which means fewer hotfix patches,
which means more time for optimization. Clean code is fast code.

## Memory Insight

Unused variables waste stack space. More importantly, they signal
the programmer lost track of data flow. Every variable should earn
its place.

## Your Task

Look at code with 2 warnings: unused variable and missing return.
Fix both and verify the code produces correct output.

## Beginner Trap

\`\`\`cpp
// BAD: Suppressing warnings with casts
(void)unused_variable; // "Shut up, compiler"
// FIX: Delete the variable. If needed, use it.
\`\`\`

## Elite Insight

Google's C++ style guide mandates -Werror. Chromium builds with over
20 additional warning flags beyond -Wall -Wextra. Zero warnings is the
industry floor, not the ceiling.

## Systems Thinking Connection

Gate C (zero warnings) combines with Gate B (determinism) and Gate A
(heap freeze). Together, they enforce: no warnings, deterministic,
no runtime allocation. Production-grade discipline.

## Skill Reinforcement

- Variable usage from L02
- Function signatures from L05
- Type discipline from L12

## Mastery Check

You pass when both warnings are fixed and the output is correct.`,
    starterCode: `#include <iostream>
using namespace std;

int applyDamage(int hp, int dmg) {
    int dead_var = 999; // WARNING: unused variable
    return hp - dmg;
}

const char* getLabel(int dmg) {
    if (dmg >= 10) return "critical";
    if (dmg >= 5) return "normal";
    // WARNING: missing return for dmg < 5
}

int main() {
    // TODO: Fix both warnings, then run
    cout << "RESULT|" << applyDamage(20, 5) << "|" << getLabel(5) << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int applyDamage(int hp, int dmg) {
    return hp - dmg;
}

const char* getLabel(int dmg) {
    if (dmg >= 10) return "critical";
    if (dmg >= 5) return "normal";
    return "weak";
}

int main() {
    cout << "RESULT|" << applyDamage(20, 5) << "|" << getLabel(5) << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Clean output", expectedOutput: "RESULT|15|normal", isPattern: false },
    ],
    hints: [
      "Delete dead_var entirely — it's never used.",
      "Add return 'weak' at the end of getLabel for dmg < 5.",
      "After fixes: applyDamage(20,5)=15, getLabel(5)='normal'.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Build: Warning-Free Combat System",
    type: "game_builder",
    instructions: `# Build: Warning-Free Combat System

## Mental Model

Part 1 fixed 2 warnings. Now fix all 4 common warning types in a full
combat system: unused variable, signed/unsigned comparison, missing
return, and unused parameter. Print each fix, run the combat, verify
correct output.

## What Breaks Without This

Without fixing all 4 warnings:
- -Werror would reject the build
- signed/unsigned loop might misbehave on large counts
- Missing return is undefined behavior (could return garbage)
- Unused parameter confuses other developers

## The Fix

1. Delete dead_var (unused variable)
2. Change unsigned count to int (signed/unsigned mismatch)
3. Add return "weak" to getLabel (missing return)
4. Remove mode param from applyDamage (unused parameter)

## Key Concepts

- **4 warning categories**: unused var, type mismatch, missing return, unused param
- **Fix documentation**: print GATE_C|fix=N|description for each
- **Verification**: combat output must be correct after all fixes
- **Gate discipline**: all 4 must be clean for PASS

## Performance Insight

Fixing warnings doesn't change runtime performance. It changes
development velocity: clean builds mean confident deploys.

## Memory Insight

Removing dead_var saves 4 bytes. Removing unused_mode saves a
register/stack slot per call. Small wins that compound.

## Your Task

1. Fix all 4 warnings in the starter code
2. Print GATE_C|fix=N|description for each
3. Run the combat: 20 - 5 - 10 = 5
4. Print GATE_C|PASS|zero warnings

## Beginner Trap

\`\`\`cpp
// BAD: Casting to hide warning
for (int i = 0; i < (int)count; i++) // Hides the real issue
// FIX: Make count an int to begin with
\`\`\`

## Elite Insight

Clang-tidy runs 100+ additional checks beyond -Wall -Wextra:
readability, modernization, performance. Zero warnings from the
compiler is step 1. Static analysis is step 2.

## Mastery Check

You pass when all 4 fix lines print and GATE_C|PASS confirms
zero warnings.`,
    starterCode: `#include <iostream>
using namespace std;

// WARNING 1: unused variable
// WARNING 2: signed/unsigned comparison
// WARNING 3: missing return path
// WARNING 4: unused parameter

int applyDamage(int hp, int dmg, int mode) {
    int dead_var = 999;
    return hp - dmg;
}

const char* getLabel(int dmg) {
    if (dmg >= 10) return "critical";
    if (dmg >= 5) return "normal";
    // missing return for dmg < 5
}

int main() {
    int damages[] = {5, 10};
    unsigned int count = 2;
    int hp = 20;
    // TODO: Fix all 4 warnings
    // Print GATE_C|fix=N|description for each
    for (int i = 0; i < count; i++) {
        hp = applyDamage(hp, damages[i], 0);
    }
    cout << "GATE_C|combat_result=" << hp << endl;
    cout << "GATE_C|label=" << getLabel(5) << endl;
    cout << "GATE_C|PASS|zero warnings" << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

int applyDamage(int hp, int dmg) {
    return hp - dmg;
}

const char* getLabel(int dmg) {
    if (dmg >= 10) return "critical";
    if (dmg >= 5) return "normal";
    return "weak";
}

int main() {
    cout << "GATE_C|fix=1|removed unused variable" << endl;
    cout << "GATE_C|fix=2|fixed signed/unsigned comparison" << endl;
    cout << "GATE_C|fix=3|added missing return" << endl;
    cout << "GATE_C|fix=4|removed unused parameter" << endl;
    int damages[] = {5, 10};
    int count = 2;
    int hp = 20;
    for (int i = 0; i < count; i++) {
        hp = applyDamage(hp, damages[i]);
    }
    cout << "GATE_C|combat_result=" << hp << endl;
    cout << "GATE_C|label=" << getLabel(5) << endl;
    cout << "GATE_C|PASS|zero warnings" << endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Fix 1 applied", expectedOutput: "GATE_C|fix=1|removed unused variable", isPattern: false },
      { id: "g2", description: "Fix 3 applied", expectedOutput: "GATE_C|fix=3|added missing return", isPattern: false },
      { id: "g3", description: "Combat result correct", expectedOutput: "GATE_C|combat_result=5", isPattern: false },
      { id: "g4", description: "Label correct", expectedOutput: "GATE_C|label=normal", isPattern: false },
      { id: "g5", description: "Gate C passes", expectedOutput: "GATE_C|PASS|zero warnings", isPattern: false },
    ],
    hints: [
      "Fix 1: Delete dead_var. Fix 2: Change unsigned int count to int count.",
      "Fix 3: Add return 'weak' at end of getLabel. Fix 4: Remove mode parameter from applyDamage.",
      "The combat result is 20 - 5 - 10 = 5. getLabel(5) returns 'normal'.",
    ],
    estimatedMinutes: 12,
  },
};