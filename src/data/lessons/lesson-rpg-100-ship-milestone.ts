import { Lesson } from "@/types/lesson";

export const lessonRPG100: Lesson = {
  id: "rpg-100-ship-milestone",
  title: "Ship Milestone: Export Ready",
  description: "The final milestone. Run a complete game demo: boot, configure, fight across 3 floors, test determinism, verify content, print release notes. You shipped an RPG.",
  order: 100,
  xpReward: 500,
  tier: "pro",
  concepts: ["ship milestone", "complete integration", "portfolio project", "professional delivery", "systems engineering"],
  part1: {
    title: "Concept: What It Means to Ship",
    type: "concept",
    instructions: `# Ship Milestone: Export Ready

## Mental Model

100 lessons. You started with cout and ended with a deterministic,
replay-verified, accessibility-aware, data-driven, test-covered,
warning-free ASCII RPG. You didn't just learn C++. You learned
systems engineering:

- **Deterministic pipelines** — input -> command -> resolve -> apply -> cleanup -> render
- **Data-first architecture** — SoA, data tables, IDs over pointers
- **Memory discipline** — heap freeze at Gate A, pool monitoring, zero leaks
- **Replay as truth** — command log + seed = identical state signature
- **Ship discipline** — tests, warnings, docs, content audit, release checklist

## What Breaks Without This

Without a ship milestone:
- The project never reaches "done"
- Systems are tested individually but never integrated
- Portfolio reviewers see pieces, not a product
- You never prove the full pipeline works end-to-end

## The Fix

One function that runs a mini version of every major system:

\`\`\`cpp
// Boot sequence:
// 1. Print version (L91)
// 2. Verify content (L98)
// 3. Configure (L86)
// 4. Run combat (L90)
// 5. Compute signature (L70)
// 6. Run checklist (L99)
// 7. SHIP|COMPLETE
\`\`\`

## Key Concepts

- **Integration test**: every system exercised in one run
- **Deterministic output**: same seed produces same signature
- **Ship complete**: the entire pipeline from boot to release
- **Version tagging**: marks the code as release-ready

## Performance Insight

The entire demo runs in milliseconds. That's the result of 100
lessons of performance-conscious design: fixed arrays, no heap in
the game loop, O(1) lookups, batch processing.

## Memory Insight

Peak memory usage: a few hundred bytes of stack. No dynamic
allocation during gameplay. Every byte is accounted for. That's
systems engineering.

## Your Task

Write a mini boot sequence: print a version string, run 2 simulated
checks, and print BOOT_TEST|PASS if both succeed.

## Beginner Trap

\`\`\`cpp
// BAD: "I'll finish it later"
// Unshipped projects teach you 80% of what shipped projects do.
// The last 20% — integration, polish, docs — is where
// engineering discipline lives.
\`\`\`

## Elite Insight

John Carmack: "The idea that I can be presented with a problem,
set out to logically solve it with the tools at my disposal, and
wind up with a program that could not be improved upon — that
is a beautiful thing." You've experienced that. Now ship it.

## Systems Thinking Connection

This lesson IS the systems thinking lesson. Every prior system
feeds into this final demo: combat (L08), inventory (L26),
quests (L54), replay (L64), tests (L92-94), gates (L30/L70/L95),
content (L98), release (L99). Ship is the integration.

## Skill Reinforcement

- Every concept from L01 through L99
- Boolean logic, struct design, loops, functions
- Output formatting, data tables, determinism

## Mastery Check

You pass when BOOT_TEST|PASS prints after version and 2 checks.`,
    starterCode: `#include <iostream>
using namespace std;

struct BootCheck { const char* name; bool passed; };

// TODO: runBootChecks(BootCheck* checks, int count)
// Print BOOT|name|PASS or FAIL for each, return true if all pass

int main() {
    cout << "HEAPSIGHT_RPG|v1.0.0" << endl;
    BootCheck checks[] = {
        {"systems_ready", true},
        {"content_loaded", true}
    };
    // TODO: bool ready = runBootChecks(checks, 2)
    // TODO: Print BOOT_TEST|PASS or BOOT_TEST|FAIL
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct BootCheck { const char* name; bool passed; };

bool runBootChecks(BootCheck* checks, int count) {
    bool all = true;
    for (int i = 0; i < count; i++) {
        cout << "BOOT|" << checks[i].name << "|"
             << (checks[i].passed ? "PASS" : "FAIL") << endl;
        if (!checks[i].passed) all = false;
    }
    return all;
}

int main() {
    cout << "HEAPSIGHT_RPG|v1.0.0" << endl;
    BootCheck checks[] = {
        {"systems_ready", true},
        {"content_loaded", true}
    };
    bool ready = runBootChecks(checks, 2);
    cout << "BOOT_TEST|" << (ready ? "PASS" : "FAIL") << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Version prints", expectedOutput: "HEAPSIGHT_RPG|v1.0.0", isPattern: false },
      { id: "t2", description: "Systems checked", expectedOutput: "BOOT|systems_ready|PASS", isPattern: false },
      { id: "t3", description: "Boot test passes", expectedOutput: "BOOT_TEST|PASS", isPattern: false },
    ],
    hints: [
      "runBootChecks loops through the array, printing BOOT|name|PASS or FAIL for each.",
      "Track all_pass: set to false if any check.passed is false.",
      "Use ternary for output: checks[i].passed ? 'PASS' : 'FAIL'.",
    ],
    estimatedMinutes: 6,
  },
  part2: {
    title: "Build: The Complete Demo",
    type: "game_builder",
    instructions: `# Build: Ship the RPG

## Mental Model

Part 1 proved a mini boot sequence. Now build the definitive demo:
version header, content summary, config, a 3-floor combat run with
damage scaling, determinism check via hash signature, release
checklist, and the final SHIP|COMPLETE. This is 100 lessons
integrated into one program.

## What Breaks Without This

Without the complete demo:
- No proof that all systems work together
- Portfolio reviewers can't see the full pipeline
- The project looks like scattered experiments, not a product

## The Fix

One main() that exercises every major system in sequence: version,
content, config, combat loop, signature, checklist, ship.

## Key Concepts

- **Version header**: HEAPSIGHT_RPG|v1.0.0
- **Content summary**: enemy/item/room/quest counts
- **Config**: damage_scale parameter
- **Combat loop**: 3 floors with different damage values
- **State signature**: hash of final hp, gold, floor count
- **Release checklist**: 6 boolean checks, all must pass
- **Ship marker**: SHIP|COMPLETE|100 lessons

## Performance Insight

3 combat iterations, 6 checklist prints, 1 hash computation.
Total: under 50 microseconds. The entire RPG demo runs faster
than a single frame of a 60fps game.

## Memory Insight

All data on stack: GameConfig (4 bytes), hp/gold (8 bytes),
floor_dmg[3] (12 bytes), checks[6] (~96 bytes), signature
(4 bytes). Total: ~124 bytes. Zero heap.

## Your Task

1. Print HEAPSIGHT_RPG|v1.0.0
2. Print CONTENT|loaded|enemies=6|items=5|rooms=3|quests=2
3. Print CONFIG|mode=normal|scale=100
4. Run 3 fights: floor_dmg = {3, 5, 8}, gain 10 gold each
5. Compute signature: hashCombine(0, hp), then gold, then 3
6. Run 6-check release checklist (all pass)
7. Print RELEASE|v1.0.0|all_gates_passed
8. Print SHIP|COMPLETE|100 lessons

## Beginner Trap

\`\`\`cpp
// BAD: Hardcoding expected output without running logic
cout << "FIGHT|floor=1|dmg=3|hp=27|gold=10" << endl; // Lies!
// FIX: Compute values from actual game state
hp -= scaleDamage(floor_dmg[f], cfg);
\`\`\`

## Elite Insight

Every shipped game has a "gold master" build — the final binary
that passes all certification tests. Your SHIP|COMPLETE is the
gold master moment. The checklist proves it's ready.

## Mastery Check

You pass when all output lines match: version, content, config,
3 fights, signature, 6 checks, release, and SHIP|COMPLETE.`,
    starterCode: `#include <iostream>
using namespace std;

struct GameConfig { int damage_scale; };
struct ReleaseCheck { const char* name; bool passed; };

int scaleDamage(int raw, const GameConfig& cfg) {
    return (raw * cfg.damage_scale) / 100;
}

unsigned int hashCombine(unsigned int s, int v) {
    s ^= (unsigned int)v + 0x9e3779b9 + (s << 6) + (s >> 2);
    return s;
}

// TODO: runChecklist(ReleaseCheck* checks, int count)
// Print CHECK|name|PASS or FAIL for each, return true if all pass

int main() {
    GameConfig cfg = {100};
    int hp = 30, gold = 0;
    int floor_dmg[] = {3, 5, 8};
    // TODO: Print version header
    // TODO: Print content loaded line
    // TODO: Print config line
    // TODO: Run 3 fights, print FIGHT line each
    // TODO: Compute and print signature
    // TODO: Define 6 release checks, run checklist
    // TODO: Print RELEASE line if all pass
    // TODO: Print SHIP|COMPLETE|100 lessons
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct GameConfig { int damage_scale; };
struct ReleaseCheck { const char* name; bool passed; };

int scaleDamage(int raw, const GameConfig& cfg) {
    return (raw * cfg.damage_scale) / 100;
}

unsigned int hashCombine(unsigned int s, int v) {
    s ^= (unsigned int)v + 0x9e3779b9 + (s << 6) + (s >> 2);
    return s;
}

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
    GameConfig cfg = {100};
    cout << "HEAPSIGHT_RPG|v1.0.0" << endl;
    cout << "CONTENT|loaded|enemies=6|items=5|rooms=3|quests=2" << endl;
    cout << "CONFIG|mode=normal|scale=100" << endl;
    int hp = 30, gold = 0;
    int floor_dmg[] = {3, 5, 8};
    for (int f = 0; f < 3; f++) {
        int dmg = scaleDamage(floor_dmg[f], cfg);
        hp -= dmg;
        gold += 10;
        cout << "FIGHT|floor=" << (f + 1) << "|dmg=" << dmg
             << "|hp=" << hp << "|gold=" << gold << endl;
    }
    unsigned int sig = 0;
    sig = hashCombine(sig, hp);
    sig = hashCombine(sig, gold);
    sig = hashCombine(sig, 3);
    cout << "SIGNATURE|value=" << sig << endl;
    ReleaseCheck checks[] = {
        {"gate_a", true}, {"gate_b", true}, {"gate_c", true},
        {"tests", true}, {"content", true}, {"stability", true}
    };
    bool ready = runChecklist(checks, 6);
    if (ready) cout << "RELEASE|v1.0.0|all_gates_passed" << endl;
    cout << "SHIP|COMPLETE|100 lessons" << endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Version header", expectedOutput: "HEAPSIGHT_RPG|v1.0.0", isPattern: false },
      { id: "g2", description: "Content loaded", expectedOutput: "CONTENT|loaded|enemies=6|items=5|rooms=3|quests=2", isPattern: false },
      { id: "g3", description: "Floor 1 fight", expectedOutput: "FIGHT|floor=1|dmg=3|hp=27|gold=10", isPattern: false },
      { id: "g4", description: "Floor 3 fight", expectedOutput: "FIGHT|floor=3|dmg=8|hp=14|gold=30", isPattern: false },
      { id: "g5", description: "All gates passed", expectedOutput: "RELEASE|v1.0.0|all_gates_passed", isPattern: false },
      { id: "g6", description: "Ship complete", expectedOutput: "SHIP|COMPLETE|100 lessons", isPattern: false },
    ],
    hints: [
      "Follow the sequence: version, content, config, 3 fights, signature, checklist, ship.",
      "hashCombine chains: sig = hashCombine(0, hp), then hashCombine(sig, gold), then hashCombine(sig, 3).",
      "The release checklist uses runChecklist which prints CHECK|name|PASS for each of 6 checks.",
    ],
    estimatedMinutes: 15,
  },
};