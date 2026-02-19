import type { Lesson } from "@/types/lesson";

export const lesson99: Lesson = {
  id: "99-final-refactor",
  title: "Final Refactor",
  description: "Clean up all warnings, organize headers, and verify code quality.",
  order: 99,
  xpReward: 225,
  tier: "pro",
  concepts: ["code cleanup", "warning elimination", "header organization", "final polish"],
  part1: {
    title: "Concept: Final Refactor",
    type: "concept",
    instructions: `# Final Refactor — Zero Warnings Is the Minimum Standard

You compile with \\\`-Wall\\\`. Three warnings. You ignore them. They are "just warnings." One is an unused variable that shadows a global. One is an implicit int-to-bool conversion in collision code. One is a missing return path in the particle spawner. The unused variable causes a stale read. The implicit conversion flips a comparison. The missing return corrupts the stack. Three warnings. Three bugs. Zero tolerance.

## What Breaks Without This

Without warning-free compilation, bugs hide in plain sight. The compiler tells you exactly where the problem is. It prints the file, the line, the column. It describes the issue. It even suggests the fix. And developers ignore it because the code "works." It works until it does not. Warnings are bugs that have not crashed yet.

## The Fix

Compile with \\\`-Wall -Wextra -Wpedantic\\\`. Read every warning. Fix every warning. An unused variable means dead code — remove it. An implicit conversion means type confusion — add an explicit cast. A missing return means undefined behavior — add the return. After fixes, compile again. Zero warnings. Clean.

\\\`\\\`\\\`
// Before: 5 warnings
// warning: unused variable 'temp'
// warning: implicit int-to-bool conversion
// warning: missing return in non-void function
// warning: comparison of signed and unsigned
// warning: variable may be uninitialized

// After: 0 warnings
// Every warning fixed. Every cast explicit.
// Every variable used. Every path returns.
\\\`\\\`\\\`

Code quality is measurable. Count functions and their average length. Count globals versus constants. Count magic numbers (literal values without names). Count included headers versus used headers. Professional code: short functions, few globals, named constants, no unused includes.

## Your Task

1. Simulate compiling with strict warnings — find and fix issues:
   - \\\`COMPILE|warning|unused variable 'temp' in moveSystem|FIXED|removed\\\`
   - \\\`COMPILE|warning|implicit int-to-bool conversion in collisionCheck|FIXED|explicit cast\\\`
   - \\\`COMPILE|warning|missing return in spawnParticles path|FIXED|added return\\\`
2. After fixes, clean compile
3. Print: \\\`REFACTOR|warnings_before|5|warnings_after|0|lines_changed|8\\\`
4. Run code quality checks:
   - \\\`QUALITY|functions|25|avg_length|15_lines|max_length|30_lines\\\`
   - \\\`QUALITY|globals|2|constants|12|magic_numbers|0\\\`
   - \\\`QUALITY|headers_included|5|unused_headers|0\\\`
5. Print: \\\`REFACTOR_SUMMARY|warnings_fixed|5|quality|PASS|ready_for_release|true\\\`

Expected output:
\\\`\\\`\\\`
COMPILE|warning|unused variable 'temp' in moveSystem|FIXED|removed
COMPILE|warning|implicit int-to-bool conversion in collisionCheck|FIXED|explicit cast
COMPILE|warning|missing return in spawnParticles path|FIXED|added return
REFACTOR|warnings_before|5|warnings_after|0|lines_changed|8
QUALITY|functions|25|avg_length|15_lines|max_length|30_lines
QUALITY|globals|2|constants|12|magic_numbers|0
QUALITY|headers_included|5|unused_headers|0
REFACTOR_SUMMARY|warnings_fixed|5|quality|PASS|ready_for_release|true
\\\`\\\`\\\`

## Beginner Trap

**Common Mistake:** Suppressing warnings with \\\`#pragma\\\` instead of fixing them. Pragma disables the check. The bug remains. You have not fixed the warning — you have hidden it. Suppression is lying to yourself. Fix the code. Not the compiler output.

## Elite Insight

Static analysis goes beyond compiler warnings. Tools like clang-tidy, cppcheck, and PVS-Studio find bugs that compilers miss: null dereferences, buffer overflows, resource leaks, concurrency issues. The compiler catches syntax-level problems. Static analyzers catch semantic-level problems. Professional codebases run both.

## Cross-Path Echo

Linters in web development serve the same purpose. ESLint catches unused variables, implicit type coercions, and unreachable code in JavaScript. Prettier enforces formatting. Together they produce clean, consistent code. Your \\\`-Wall -Wextra\\\` is ESLint for C++. Zero warnings, zero lint errors, zero excuses.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

int warningsBefore = 5;
int warningsAfter = 0;
int linesChanged = 8;
int warningsFixed = 0;

// TODO: Write fixWarnings() — simulate finding and fixing 3 warnings
//   Print COMPILE lines for each warning found and fixed
//   Increment warningsFixed for each

// TODO: Write runQualityChecks() — print 3 QUALITY lines
//   functions, globals, headers

int main() {
    // TODO: Call fixWarnings()
    // TODO: Print REFACTOR line
    // TODO: Call runQualityChecks()
    // TODO: Print REFACTOR_SUMMARY

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

int warningsBefore = 5;
int warningsAfter = 0;
int linesChanged = 8;
int warningsFixed = 0;

void fixWarnings() {
    cout << "COMPILE|warning|unused variable 'temp' in moveSystem|FIXED|removed" << endl;
    warningsFixed++;
    cout << "COMPILE|warning|implicit int-to-bool conversion in collisionCheck|FIXED|explicit cast" << endl;
    warningsFixed++;
    cout << "COMPILE|warning|missing return in spawnParticles path|FIXED|added return" << endl;
    warningsFixed++;
}

void runQualityChecks() {
    cout << "QUALITY|functions|25|avg_length|15_lines|max_length|30_lines" << endl;
    cout << "QUALITY|globals|2|constants|12|magic_numbers|0" << endl;
    cout << "QUALITY|headers_included|5|unused_headers|0" << endl;
}

int main() {
    fixWarnings();

    cout << "REFACTOR|warnings_before|" << warningsBefore
         << "|warnings_after|" << warningsAfter
         << "|lines_changed|" << linesChanged << endl;

    runQualityChecks();

    cout << "REFACTOR_SUMMARY|warnings_fixed|" << warningsBefore
         << "|quality|PASS|ready_for_release|true" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Unused variable fixed", expectedOutput: "COMPILE\\|warning\\|unused variable 'temp' in moveSystem\\|FIXED\\|removed", isPattern: true },
      { id: "t2", description: "Implicit conversion fixed", expectedOutput: "COMPILE\\|warning\\|implicit int-to-bool conversion in collisionCheck\\|FIXED\\|explicit cast", isPattern: true },
      { id: "t3", description: "Missing return fixed", expectedOutput: "COMPILE\\|warning\\|missing return in spawnParticles path\\|FIXED\\|added return", isPattern: true },
      { id: "t4", description: "Refactor summary", expectedOutput: "REFACTOR\\|warnings_before\\|5\\|warnings_after\\|0\\|lines_changed\\|8", isPattern: true },
      { id: "t5", description: "Function quality", expectedOutput: "QUALITY\\|functions\\|25\\|avg_length\\|15_lines\\|max_length\\|30_lines", isPattern: true },
      { id: "t6", description: "No magic numbers", expectedOutput: "QUALITY\\|globals\\|2\\|constants\\|12\\|magic_numbers\\|0", isPattern: true },
      { id: "t7", description: "Ready for release", expectedOutput: "REFACTOR_SUMMARY\\|warnings_fixed\\|5\\|quality\\|PASS\\|ready_for_release\\|true", isPattern: true },
    ],
    hints: [
      "fixWarnings prints 3 COMPILE lines, each describing a warning and its fix. The format is COMPILE|warning|description|FIXED|action. Increment warningsFixed after each.",
      "runQualityChecks prints 3 QUALITY lines with static analysis results. These are hardcoded metrics: 25 functions, 2 globals, 12 constants, 0 magic numbers, 5 headers with 0 unused.",
      "REFACTOR_SUMMARY uses warningsBefore (5) for warnings_fixed, quality is PASS, ready_for_release is true. Print it after the quality checks.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Game: Final Refactor",
    type: "game_builder",
    instructions: `# Final Refactor — Clean Code for the Space Shooter

The game compiles. The tests pass. The docs exist. But the code has warnings. Unused variables. Implicit conversions. Missing return paths. Each warning is a potential bug. The final refactor eliminates every warning and verifies code quality. Zero warnings. Short functions. Named constants. No dead code. Professional grade.

## What Breaks Without This

Without cleanup, the codebase degrades. Each warning is a broken window. Developers see warnings and add more. "The project already has warnings, one more will not matter." Six months later there are 200 warnings. Real bugs hide in the noise. The signal-to-noise ratio collapses. Clean code stays clean. Dirty code gets dirtier.

## The Fix

Compile with maximum warnings. Fix every one. Then run quality checks: function count, average length, globals, constants, magic numbers, header usage. Every metric must pass. The code is ready for release when every check is green.

\\\`\\\`\\\`
// Strict compile: -Wall -Wextra -Wpedantic
// Quality: functions < 30 lines avg, 0 magic numbers
// Headers: 0 unused includes
// Result: ready for release
\\\`\\\`\\\`

## Your Task

1. Simulate fixing 3 compiler warnings with COMPILE| lines
2. Print: \\\`REFACTOR|warnings_before|5|warnings_after|0|lines_changed|8\\\`
3. Run quality checks — print 3 QUALITY| lines
4. Print: \\\`REFACTOR_SUMMARY|warnings_fixed|5|quality|PASS|ready_for_release|true\\\`

## Beginner Trap

**Common Mistake:** Fixing the warning symptom but not the root cause. An "unused variable" warning might mean you forgot to use the result of a function call. Removing the variable fixes the warning but introduces a bug. Read the warning. Understand why the variable exists. Fix the intent, not just the message.

## Elite Insight

Google's C++ style guide mandates zero warnings with their standard warning set. Every commit must compile clean. Warnings that are false positives get explicit suppression comments explaining why. The comment is the acknowledgment. The rule is zero unacknowledged warnings. Your refactor follows the same standard.

## Cross-Path Echo

Code review in professional teams serves the same purpose. A reviewer reads every line and flags issues: unused code, unclear names, missing edge cases. Your quality checks are an automated code review. They catch the same issues a reviewer would, but they run every build.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

int warningsBefore = 5;
int warningsAfter = 0;
int linesChanged = 8;

// TODO: Write fixWarnings() — print 3 COMPILE warning lines
// TODO: Write runQualityChecks() — print 3 QUALITY lines

int main() {
    // TODO: Fix warnings, print REFACTOR, run quality, print REFACTOR_SUMMARY

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

int warningsBefore = 5;
int warningsAfter = 0;
int linesChanged = 8;

void fixWarnings() {
    cout << "COMPILE|warning|unused variable 'temp' in moveSystem|FIXED|removed" << endl;
    cout << "COMPILE|warning|implicit int-to-bool conversion in collisionCheck|FIXED|explicit cast" << endl;
    cout << "COMPILE|warning|missing return in spawnParticles path|FIXED|added return" << endl;
}

void runQualityChecks() {
    cout << "QUALITY|functions|25|avg_length|15_lines|max_length|30_lines" << endl;
    cout << "QUALITY|globals|2|constants|12|magic_numbers|0" << endl;
    cout << "QUALITY|headers_included|5|unused_headers|0" << endl;
}

int main() {
    fixWarnings();

    cout << "REFACTOR|warnings_before|" << warningsBefore
         << "|warnings_after|" << warningsAfter
         << "|lines_changed|" << linesChanged << endl;

    runQualityChecks();

    cout << "REFACTOR_SUMMARY|warnings_fixed|" << warningsBefore
         << "|quality|PASS|ready_for_release|true" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Unused variable warning fixed", expectedOutput: "COMPILE\\|warning\\|unused variable 'temp' in moveSystem\\|FIXED\\|removed", isPattern: true },
      { id: "t2", description: "Implicit conversion fixed", expectedOutput: "COMPILE\\|warning\\|implicit int-to-bool conversion in collisionCheck\\|FIXED\\|explicit cast", isPattern: true },
      { id: "t3", description: "Missing return fixed", expectedOutput: "COMPILE\\|warning\\|missing return in spawnParticles path\\|FIXED\\|added return", isPattern: true },
      { id: "t4", description: "Refactor metrics", expectedOutput: "REFACTOR\\|warnings_before\\|5\\|warnings_after\\|0\\|lines_changed\\|8", isPattern: true },
      { id: "t5", description: "Quality checks pass", expectedOutput: "QUALITY\\|functions\\|25\\|avg_length\\|15_lines\\|max_length\\|30_lines", isPattern: true },
      { id: "t6", description: "No magic numbers", expectedOutput: "QUALITY\\|globals\\|2\\|constants\\|12\\|magic_numbers\\|0", isPattern: true },
      { id: "t7", description: "Refactor summary", expectedOutput: "REFACTOR_SUMMARY\\|warnings_fixed\\|5\\|quality\\|PASS\\|ready_for_release\\|true", isPattern: true },
    ],
    hints: [
      "fixWarnings prints 3 COMPILE lines. Each follows the pattern: COMPILE|warning|description|FIXED|action. The three warnings are: unused variable, implicit conversion, missing return.",
      "runQualityChecks prints 3 QUALITY lines with project metrics. Functions: 25 total, 15 lines average, 30 lines max. Globals: 2, constants: 12, magic numbers: 0. Headers: 5 included, 0 unused.",
      "Print REFACTOR between fixWarnings and runQualityChecks. Use warningsBefore (5) and warningsAfter (0). Print REFACTOR_SUMMARY last with warnings_fixed=5 and quality=PASS.",
    ],
    estimatedMinutes: 8,
  },
};
