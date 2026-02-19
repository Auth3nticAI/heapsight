import { Lesson } from "@/types/lesson";

export const lessonRPG99: Lesson = {
  id: "rpg-99-release-checklist-tag",
  title: "Release Checklist + Tag",
  description: "Run all three gates (A, B, C), verify content audit, check test suite. Print v1.0 release notes if everything passes.",
  order: 99,
  xpReward: 100,
  tier: "pro",
  concepts: ["release checklist", "gate verification", "release process", "version tagging", "ship discipline"],
  part1: {
    title: "Concept: The Release Checklist",
    type: "concept",
    instructions: `# Release Checklist + Tag

## Mental Model

Everything works in isolation. Tests pass. Content exists. Gates were
passed at some point. But have you verified everything together, right
now, in the current build? A release checklist is the final integration
test before shipping. One function, one boolean: ready or not.

## What Breaks Without This

Without a release checklist:
- Individual tests pass but integration fails
- Gates were passed once but code changed since
- "Works on my machine" replaces systematic verification
- Shipping relies on memory, not automation

## The Fix

Define a ReleaseCheck struct and run all checks:

\`\`\`cpp
struct ReleaseCheck { const char* name; bool passed; };

bool runChecklist(ReleaseCheck* checks, int count) {
    bool all = true;
    for (int i = 0; i < count; i++) {
        cout << "CHECK|" << checks[i].name << "|"
             << (checks[i].passed ? "PASS" : "FAIL") << endl;
        if (!checks[i].passed) all = false;
    }
    return all;
}
\`\`\`

## Key Concepts

- **ReleaseCheck struct**: name + pass/fail boolean
- **Checklist runner**: loops all checks, returns aggregate
- **Short-circuit discipline**: any FAIL means no release
- **Version tagging**: only if all checks pass

## Performance Insight

The checklist is 6 boolean checks — microseconds. The value is in
the discipline: every release candidate runs the same verification.
No "I think it's ready." Only "the checklist says it's ready."

## Memory Insight

6 ReleaseCheck structs: ~96 bytes on the stack. The entire release
process uses less memory than a single enemy entity.

## Your Task

Write a runChecklist function that takes 3 ReleaseCheck entries and
prints CHECK|name|PASS or FAIL for each. Return true if all pass.

## Beginner Trap

\`\`\`cpp
// BAD: "Ship it, I tested manually"
// Manual testing forgets edge cases
// FIX: Automated checklists catch what you forgot
\`\`\`

## Elite Insight

SpaceX runs automated pre-launch checklists on every mission. If
any check fails, the launch is scrubbed — no overrides. Your
release checklist follows the same principle.

## Systems Thinking Connection

The release checklist references every gate: A (L30 heap freeze),
B (L70 replay determinism), C (L95 zero warnings). It's the
integration test for your entire quality pipeline.

## Skill Reinforcement

- Struct arrays from L11
- Boolean logic from L08
- Loop iteration from L07

## Mastery Check

You pass when 3 CHECK lines print PASS and CHECKLIST_TEST|PASS prints.`,
    starterCode: `#include <iostream>
using namespace std;

struct ReleaseCheck { const char* name; bool passed; };

// TODO: runChecklist(ReleaseCheck* checks, int count)
// Print CHECK|name|PASS or FAIL for each, return true if all pass

int main() {
    ReleaseCheck checks[] = {
        {"gate_a", true},
        {"gate_b", true},
        {"gate_c", true}
    };
    // TODO: bool ready = runChecklist(checks, 3)
    // TODO: Print CHECKLIST_TEST|PASS or CHECKLIST_TEST|FAIL
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct ReleaseCheck { const char* name; bool passed; };

bool runChecklist(ReleaseCheck* checks, int count) {
    bool all = true;
    for (int i = 0; i < count; i++) {
        cout << "CHECK|" << checks[i].name << "|"
             << (checks[i].passed ? "PASS" : "FAIL") << endl;
        if (!checks[i].passed) all = false;
    }
    return all;
}

int main() {
    ReleaseCheck checks[] = {
        {"gate_a", true},
        {"gate_b", true},
        {"gate_c", true}
    };
    bool ready = runChecklist(checks, 3);
    cout << "CHECKLIST_TEST|" << (ready ? "PASS" : "FAIL") << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Gate A checked", expectedOutput: "CHECK|gate_a|PASS", isPattern: false },
      { id: "t2", description: "Gate C checked", expectedOutput: "CHECK|gate_c|PASS", isPattern: false },
      { id: "t3", description: "Checklist passes", expectedOutput: "CHECKLIST_TEST|PASS", isPattern: false },
    ],
    hints: [
      "runChecklist loops through the array, printing CHECK|name|PASS or FAIL for each entry.",
      "Track all_pass with a boolean: set to false if any check fails.",
      "Use the ternary operator for PASS/FAIL: checks[i].passed ? 'PASS' : 'FAIL'.",
    ],
    estimatedMinutes: 6,
  },
  part2: {
    title: "Build: Release Verification",
    type: "game_builder",
    instructions: `# Build: Release Checklist Runner

## Mental Model

Part 1 proved the checklist pattern with 3 checks. Now build the
full 6-check release verification: all three gates, unit tests,
content audit, and stability. If everything passes, print the
version tag and release notes.

## What Breaks Without This

Without full release verification:
- Any single gate regression blocks shipping
- No single source of truth for "is this ready?"
- Release notes are manual and error-prone

## The Fix

6-entry ReleaseCheck array. runReleaseChecklist prints each,
returns aggregate. If all pass, print version tag + release notes.

## Key Concepts

- **6 release checks**: gate_a, gate_b, gate_c, unit_tests, content_audit, stability
- **Aggregate result**: all must pass for release
- **Version tag**: RELEASE|v1.0.0 only on full pass
- **Release notes**: project name, description, gate status

## Performance Insight

6 boolean checks + 6 string prints. Under 10 microseconds. The
release process itself is negligible; the discipline it enforces
is what matters.

## Memory Insight

6 structs at ~16 bytes = 96 bytes. All const char* strings point
to read-only memory. Zero heap allocation for the entire release.

## Your Task

1. Define 6 ReleaseCheck entries (all passing)
2. Write runReleaseChecklist that prints each check
3. If all pass, print RELEASE|v1.0.0 and 3 release note lines
4. Print RELEASE|READY at the end

## Beginner Trap

\`\`\`cpp
// BAD: Printing RELEASE|READY without checking
cout << "RELEASE|READY" << endl; // Didn't verify anything!
// FIX: Only print after checklist confirms all pass
\`\`\`

## Elite Insight

Production game studios have "release candidates" that go through
automated test suites, QA checklists, and certification requirements.
Your 6-check pipeline is the same pattern at small scale.

## Mastery Check

You pass when all 6 CHECK lines print PASS, version tag prints,
and RELEASE|READY confirms completion.`,
    starterCode: `#include <iostream>
using namespace std;

struct ReleaseCheck { const char* name; bool passed; };

// TODO: runReleaseChecklist(ReleaseCheck* checks, int count)
// Print CHECK|name|PASS or FAIL for each, return true if all pass

int main() {
    ReleaseCheck checks[] = {
        {"gate_a_heap_freeze", true},
        {"gate_b_replay_determinism", true},
        {"gate_c_zero_warnings", true},
        {"unit_tests", true},
        {"content_audit", true},
        {"stability_15_turns", true}
    };
    // TODO: Run checklist
    // TODO: If all pass, print RELEASE|v1.0.0 and release notes
    // TODO: Print RELEASE|READY
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct ReleaseCheck { const char* name; bool passed; };

bool runReleaseChecklist(ReleaseCheck* checks, int count) {
    bool all = true;
    for (int i = 0; i < count; i++) {
        cout << "CHECK|" << checks[i].name << "|"
             << (checks[i].passed ? "PASS" : "FAIL") << endl;
        if (!checks[i].passed) all = false;
    }
    return all;
}

int main() {
    ReleaseCheck checks[] = {
        {"gate_a_heap_freeze", true},
        {"gate_b_replay_determinism", true},
        {"gate_c_zero_warnings", true},
        {"unit_tests", true},
        {"content_audit", true},
        {"stability_15_turns", true}
    };
    bool ready = runReleaseChecklist(checks, 6);
    if (ready) {
        cout << "RELEASE|v1.0.0" << endl;
        cout << "RELEASE|HeapSight RPG" << endl;
        cout << "RELEASE|Turn-based ASCII dungeon crawler" << endl;
        cout << "RELEASE|All gates passed" << endl;
    }
    cout << "RELEASE|READY" << endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Gate A checked", expectedOutput: "CHECK|gate_a_heap_freeze|PASS", isPattern: false },
      { id: "g2", description: "Gate C checked", expectedOutput: "CHECK|gate_c_zero_warnings|PASS", isPattern: false },
      { id: "g3", description: "Version tag", expectedOutput: "RELEASE|v1.0.0", isPattern: false },
      { id: "g4", description: "All gates passed", expectedOutput: "RELEASE|All gates passed", isPattern: false },
      { id: "g5", description: "Release ready", expectedOutput: "RELEASE|READY", isPattern: false },
    ],
    hints: [
      "runReleaseChecklist loops through checks, prints each, and tracks whether all passed.",
      "After the checklist, use if(ready) to conditionally print the version tag and release notes.",
      "RELEASE|READY prints regardless — it indicates the checklist completed, not that it passed.",
    ],
    estimatedMinutes: 10,
  },
};