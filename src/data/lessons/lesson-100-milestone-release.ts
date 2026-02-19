import type { Lesson } from "@/types/lesson";

export const lesson100: Lesson = {
  id: "100-milestone-release",
  title: "Milestone: Release v1.0",
  description: "Tag version 1.0 — the complete Space Shooter ships now.",
  order: 100,
  xpReward: 500,
  tier: "pro",
  concepts: ["release", "version tagging", "final build", "ship it", "complete game"],
  part1: {
    title: "Concept: Milestone — Release v1.0",
    type: "concept",
    instructions: `# Milestone: Release v1.0 — Ship It

One hundred lessons. Fifteen systems. Twelve hundred lines of C++. You started with \\\`cout << "Hello"\\\` and now you have a complete game: entity pool, collision, scoring, waves, bosses, particles, shake, trails, achievements, replay, settings, audio, build system, tests, documentation. Every system tested. Every warning fixed. Every feature integrated. This is v1.0. This is what shipping looks like.

## What Breaks Without This

Without a release process, the project is never done. There is always one more feature to add, one more bug to fix, one more optimization to make. The release is the line in the sand. It says: this is good enough. Ship it. The perfect is the enemy of the shipped. Version 1.0 is not perfect. It is complete. There is a difference.

## The Fix

A release checklist. Seven categories. Every check must pass. Build: zero warnings. Tests: all suites green. Docs: README and .gitignore present. Config: loads and saves. Gameplay: 10 waves, 3 bosses, score, lives, victory. Features: all 15 systems active. Performance: 500 entities with >80% pool utilization. If every check passes, tag the commit, generate the manifest, ship the binary.

\\\`\\\`\\\`
// Release checklist:
// 1. Build      -> compile with 0 warnings
// 2. Tests      -> 5/5 suites, 16 checks
// 3. Docs       -> README.md, .gitignore
// 4. Config     -> loads, saves
// 5. Gameplay   -> 10 waves, 3 bosses
// 6. Features   -> 15 systems active
// 7. Performance -> 500 entities, 85% pool
\\\`\\\`\\\`

Version tagging marks the exact commit that shipped. \\\`git tag v1.0\\\` creates an immutable reference. If a bug is found in production, you can check out v1.0 and reproduce it. Without tags, you guess which commit shipped. Guessing is not engineering.

The changelog documents what changed between versions. For v1.0, the changelog is everything — the entire game. For v1.1, it will be the diff. Changelogs are release notes for developers. They answer: what is new, what changed, what broke.

## Your Task

1. Run the complete release checklist — 7 categories
2. Print the release manifest:
   \\\`RELEASE|=== SPACE SHOOTER v1.0 ===\\\`
   \\\`RELEASE|Build:       PASS (0 warnings)\\\`
   \\\`RELEASE|Tests:       PASS (5/5 suites, 16 checks)\\\`
   \\\`RELEASE|Docs:        PASS (README.md, .gitignore)\\\`
   \\\`RELEASE|Gameplay:    PASS (10 waves, 3 bosses)\\\`
   \\\`RELEASE|Features:    PASS (15 systems active)\\\`
   \\\`RELEASE|Performance: PASS (500 entities, 85% pool)\\\`
   \\\`RELEASE|Crash Proof: PASS (0 unhandled errors)\\\`
   \\\`RELEASE|\\\`
   \\\`RELEASE|Total Lessons: 100\\\`
   \\\`RELEASE|Systems Built: 15\\\`
   \\\`RELEASE|Lines of C++: ~1200\\\`
   \\\`RELEASE|\\\`
   \\\`RELEASE|SHIP IT.\\\`
3. Print: \\\`MILESTONE_100|PASS|Space Shooter v1.0 released\\\`
4. Print: \\\`VERSION|tag|v1.0|status|RELEASED|date|2024-01-01\\\`

Expected output:
\\\`\\\`\\\`
RELEASE|=== SPACE SHOOTER v1.0 ===
RELEASE|Build:       PASS (0 warnings)
RELEASE|Tests:       PASS (5/5 suites, 16 checks)
RELEASE|Docs:        PASS (README.md, .gitignore)
RELEASE|Gameplay:    PASS (10 waves, 3 bosses)
RELEASE|Features:    PASS (15 systems active)
RELEASE|Performance: PASS (500 entities, 85% pool)
RELEASE|Crash Proof: PASS (0 unhandled errors)
RELEASE|
RELEASE|Total Lessons: 100
RELEASE|Systems Built: 15
RELEASE|Lines of C++: ~1200
RELEASE|
RELEASE|SHIP IT.
MILESTONE_100|PASS|Space Shooter v1.0 released
VERSION|tag|v1.0|status|RELEASED|date|2024-01-01
\\\`\\\`\\\`

## Beginner Trap

**Common Mistake:** Shipping without running the full checklist. You tested gameplay but forgot to run the unit tests. The collision function has a regression from the refactor. The tests would have caught it. The checklist is not bureaucracy — it is the last line of defense. Run every check. Every release. No shortcuts.

## Elite Insight

Professional game studios have release certification processes that take weeks. Console certification (Sony TRC, Microsoft XR, Nintendo Lotcheck) tests hundreds of requirements: proper controller disconnect handling, save data compliance, language requirements, accessibility features. Your 7-point checklist is a miniature certification pass. It proves the game meets a minimum quality bar. Certification is what separates a demo from a product.

## Cross-Path Echo

Deployment pipelines in web applications follow the same pattern. Build, test, lint, security scan, staging deploy, smoke test, production deploy. Each stage must pass before the next runs. A failure at any stage stops the pipeline. Your release checklist is a deployment pipeline for a game. Seven stages. Zero failures. Ship it.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

bool buildPass = false;
bool testsPass = false;
bool docsPass = false;
bool gameplayPass = false;
bool featuresPass = false;
bool performancePass = false;
bool crashProofPass = false;

// TODO: Write runReleaseChecklist() — verify all 7 categories
//   Set each bool to true after verification

// TODO: Write printReleaseManifest() — print the RELEASE block
//   13 RELEASE| lines including blank separator lines
//   Header, 7 checks, blank, 3 stats, blank, SHIP IT.

int main() {
    // TODO: Run checklist
    // TODO: Print manifest
    // TODO: Print MILESTONE_100
    // TODO: Print VERSION

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

bool buildPass = false;
bool testsPass = false;
bool docsPass = false;
bool gameplayPass = false;
bool featuresPass = false;
bool performancePass = false;
bool crashProofPass = false;

void runReleaseChecklist() {
    buildPass = true;
    testsPass = true;
    docsPass = true;
    gameplayPass = true;
    featuresPass = true;
    performancePass = true;
    crashProofPass = true;
}

void printReleaseManifest() {
    cout << "RELEASE|=== SPACE SHOOTER v1.0 ===" << endl;
    cout << "RELEASE|Build:       PASS (0 warnings)" << endl;
    cout << "RELEASE|Tests:       PASS (5/5 suites, 16 checks)" << endl;
    cout << "RELEASE|Docs:        PASS (README.md, .gitignore)" << endl;
    cout << "RELEASE|Gameplay:    PASS (10 waves, 3 bosses)" << endl;
    cout << "RELEASE|Features:    PASS (15 systems active)" << endl;
    cout << "RELEASE|Performance: PASS (500 entities, 85% pool)" << endl;
    cout << "RELEASE|Crash Proof: PASS (0 unhandled errors)" << endl;
    cout << "RELEASE|" << endl;
    cout << "RELEASE|Total Lessons: 100" << endl;
    cout << "RELEASE|Systems Built: 15" << endl;
    cout << "RELEASE|Lines of C++: ~1200" << endl;
    cout << "RELEASE|" << endl;
    cout << "RELEASE|SHIP IT." << endl;
}

int main() {
    runReleaseChecklist();
    printReleaseManifest();

    cout << "MILESTONE_100|PASS|Space Shooter v1.0 released" << endl;
    cout << "VERSION|tag|v1.0|status|RELEASED|date|2024-01-01" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Release header", expectedOutput: "RELEASE\\|=== SPACE SHOOTER v1\\.0 ===", isPattern: true },
      { id: "t2", description: "Build passes", expectedOutput: "RELEASE\\|Build:       PASS \\(0 warnings\\)", isPattern: true },
      { id: "t3", description: "Tests pass", expectedOutput: "RELEASE\\|Tests:       PASS \\(5/5 suites, 16 checks\\)", isPattern: true },
      { id: "t4", description: "Docs pass", expectedOutput: "RELEASE\\|Docs:        PASS \\(README\\.md, \\.gitignore\\)", isPattern: true },
      { id: "t5", description: "Features pass", expectedOutput: "RELEASE\\|Features:    PASS \\(15 systems active\\)", isPattern: true },
      { id: "t6", description: "Performance pass", expectedOutput: "RELEASE\\|Performance: PASS \\(500 entities, 85% pool\\)", isPattern: true },
      { id: "t7", description: "Ship it", expectedOutput: "RELEASE\\|SHIP IT\\.", isPattern: true },
      { id: "t8", description: "Milestone 100 passes", expectedOutput: "MILESTONE_100\\|PASS\\|Space Shooter v1\\.0 released", isPattern: true },
      { id: "t9", description: "Version tagged", expectedOutput: "VERSION\\|tag\\|v1\\.0\\|status\\|RELEASED\\|date\\|2024-01-01", isPattern: true },
    ],
    hints: [
      "runReleaseChecklist sets all 7 booleans to true. In a real release, each would run actual verification. Here the checklist is a simulation — all checks pass.",
      "printReleaseManifest prints 13 lines prefixed with RELEASE|. The 7 check lines are aligned with consistent spacing. Two blank RELEASE| lines separate the checks from the stats and the stats from SHIP IT.",
      "After the manifest, print MILESTONE_100 and VERSION as separate lines. The version tag is v1.0, status is RELEASED, date is 2024-01-01.",
    ],
    estimatedMinutes: 15,
  },
  part2: {
    title: "Game: Milestone — Release v1.0",
    type: "game_builder",
    instructions: `# Milestone: Release v1.0 — The Complete Space Shooter Ships Now

This is it. One hundred lessons. Every system built, tested, documented, and polished. The entity pool handles 500 objects. The collision system resolves AABB overlaps. The score system multiplies combos. The wave system escalates through 10 waves with 3 boss types. Particles erupt. The screen shakes. Trails follow. Achievements pop. Stats track. The replay deterministically reproduces every frame. Settings persist. Audio events fire. Music crossfades between states. The build system compiles it. The tests prove it. The docs explain it. The refactor cleaned it. Now ship it.

## What Breaks Without This

Without a formal release, the project is perpetually "almost done." There is always one more thing. One more feature. One more fix. One more optimization. The release is the decision to stop adding and start shipping. Version 1.0 is the contract: this works, this is documented, this is tested, this is the product. Everything after v1.0 is v1.1.

## The Fix

A complete release checklist. Seven categories covering every aspect of the project. Each category runs verification and reports PASS or FAIL. If all pass, print the release manifest, tag the version, and ship. The checklist is the quality gate. Nothing passes without clearing every check.

\\\`\\\`\\\`
// Release pipeline:
// 1. Build verification
// 2. Test suite execution
// 3. Documentation check
// 4. Config persistence check
// 5. Gameplay verification
// 6. Feature inventory
// 7. Performance benchmark
// -> All PASS -> Tag v1.0 -> SHIP IT
\\\`\\\`\\\`

## Your Task

1. Run complete release checklist (7 categories)
2. Print release manifest — all RELEASE| lines
3. Print: \\\`MILESTONE_100|PASS|Space Shooter v1.0 released\\\`
4. Print: \\\`VERSION|tag|v1.0|status|RELEASED|date|2024-01-01\\\`

Release manifest format:
\\\`\\\`\\\`
RELEASE|=== SPACE SHOOTER v1.0 ===
RELEASE|Build:       PASS (0 warnings)
RELEASE|Tests:       PASS (5/5 suites, 16 checks)
RELEASE|Docs:        PASS (README.md, .gitignore)
RELEASE|Gameplay:    PASS (10 waves, 3 bosses)
RELEASE|Features:    PASS (15 systems active)
RELEASE|Performance: PASS (500 entities, 85% pool)
RELEASE|Crash Proof: PASS (0 unhandled errors)
RELEASE|
RELEASE|Total Lessons: 100
RELEASE|Systems Built: 15
RELEASE|Lines of C++: ~1200
RELEASE|
RELEASE|SHIP IT.
MILESTONE_100|PASS|Space Shooter v1.0 released
VERSION|tag|v1.0|status|RELEASED|date|2024-01-01
\\\`\\\`\\\`

## Beginner Trap

**Common Mistake:** Thinking v1.0 means the game is finished forever. v1.0 means the game is shippable. Bugs will be found. Features will be requested. Performance will need tuning. v1.1 fixes the critical bugs. v1.2 adds the requested feature. v2.0 rewrites the renderer. Shipping is the beginning of the product lifecycle, not the end.

## Elite Insight

John Carmack shipped Doom in December 1993. The code was not perfect. The BSP tree had edge cases. The fixed-point math had precision limits. The renderer had known artifacts at extreme angles. But it shipped. And it changed the industry. Shipping imperfect code that works is infinitely more valuable than perfect code that never ships. v1.0 is the proof that you can ship. Everything else is iteration.

## Cross-Path Echo

Production deployment in web applications follows this exact pattern. CI builds the artifact, runs the test suite, checks documentation, verifies configuration, runs smoke tests, benchmarks performance, deploys to staging, then promotes to production. Your release checklist is a CI/CD pipeline for a game. Seven stages. All green. Deploy to production. Ship it.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

bool buildPass = false;
bool testsPass = false;
bool docsPass = false;
bool gameplayPass = false;
bool featuresPass = false;
bool performancePass = false;
bool crashProofPass = false;

// TODO: Write runReleaseChecklist() — set all 7 checks to true

// TODO: Write printReleaseManifest() — print 13 RELEASE| lines
//   Header, 7 check results, blank, 3 stats, blank, SHIP IT.

int main() {
    // TODO: Run checklist
    // TODO: Print manifest
    // TODO: Print MILESTONE_100
    // TODO: Print VERSION

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

bool buildPass = false;
bool testsPass = false;
bool docsPass = false;
bool gameplayPass = false;
bool featuresPass = false;
bool performancePass = false;
bool crashProofPass = false;

void runReleaseChecklist() {
    buildPass = true;
    testsPass = true;
    docsPass = true;
    gameplayPass = true;
    featuresPass = true;
    performancePass = true;
    crashProofPass = true;
}

void printReleaseManifest() {
    cout << "RELEASE|=== SPACE SHOOTER v1.0 ===" << endl;
    cout << "RELEASE|Build:       PASS (0 warnings)" << endl;
    cout << "RELEASE|Tests:       PASS (5/5 suites, 16 checks)" << endl;
    cout << "RELEASE|Docs:        PASS (README.md, .gitignore)" << endl;
    cout << "RELEASE|Gameplay:    PASS (10 waves, 3 bosses)" << endl;
    cout << "RELEASE|Features:    PASS (15 systems active)" << endl;
    cout << "RELEASE|Performance: PASS (500 entities, 85% pool)" << endl;
    cout << "RELEASE|Crash Proof: PASS (0 unhandled errors)" << endl;
    cout << "RELEASE|" << endl;
    cout << "RELEASE|Total Lessons: 100" << endl;
    cout << "RELEASE|Systems Built: 15" << endl;
    cout << "RELEASE|Lines of C++: ~1200" << endl;
    cout << "RELEASE|" << endl;
    cout << "RELEASE|SHIP IT." << endl;
}

int main() {
    runReleaseChecklist();
    printReleaseManifest();

    cout << "MILESTONE_100|PASS|Space Shooter v1.0 released" << endl;
    cout << "VERSION|tag|v1.0|status|RELEASED|date|2024-01-01" << endl;

    return 0;
}
`,
    tests: [
      { id: "t1", description: "Release header", expectedOutput: "RELEASE\\|=== SPACE SHOOTER v1\\.0 ===", isPattern: true },
      { id: "t2", description: "Build check passes", expectedOutput: "RELEASE\\|Build:       PASS \\(0 warnings\\)", isPattern: true },
      { id: "t3", description: "Tests check passes", expectedOutput: "RELEASE\\|Tests:       PASS \\(5/5 suites, 16 checks\\)", isPattern: true },
      { id: "t4", description: "Docs check passes", expectedOutput: "RELEASE\\|Docs:        PASS \\(README\\.md, \\.gitignore\\)", isPattern: true },
      { id: "t5", description: "Gameplay check passes", expectedOutput: "RELEASE\\|Gameplay:    PASS \\(10 waves, 3 bosses\\)", isPattern: true },
      { id: "t6", description: "Features check passes", expectedOutput: "RELEASE\\|Features:    PASS \\(15 systems active\\)", isPattern: true },
      { id: "t7", description: "Performance check passes", expectedOutput: "RELEASE\\|Performance: PASS \\(500 entities, 85% pool\\)", isPattern: true },
      { id: "t8", description: "Ship it declared", expectedOutput: "RELEASE\\|SHIP IT\\.", isPattern: true },
      { id: "t9", description: "Milestone 100 passes", expectedOutput: "MILESTONE_100\\|PASS\\|Space Shooter v1\\.0 released", isPattern: true },
      { id: "t10", description: "Version tagged", expectedOutput: "VERSION\\|tag\\|v1\\.0\\|status\\|RELEASED\\|date\\|2024-01-01", isPattern: true },
    ],
    hints: [
      "runReleaseChecklist sets all 7 booleans to true. Each represents a category of verification: build, tests, docs, gameplay, features, performance, crash proof.",
      "printReleaseManifest outputs 13 RELEASE| lines. Seven check results with aligned formatting, a blank line, three statistics lines, another blank line, and SHIP IT. Blank lines are \"RELEASE|\" with nothing after the pipe.",
      "MILESTONE_100 and VERSION are printed after the manifest. The milestone confirms the release. The version tags the commit as v1.0 with status RELEASED and date 2024-01-01.",
    ],
    estimatedMinutes: 25,
  },
};
