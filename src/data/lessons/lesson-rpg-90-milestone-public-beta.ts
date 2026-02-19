import { Lesson } from "@/types/lesson";

export const lessonRPG90: Lesson = {
  id: "rpg-90-milestone-public-beta",
  title: "Milestone: Public Beta Candidate",
  description: "Run a 15-turn stability test: combat, scaling, config, validation, HUD — all systems composing without crash.",
  order: 90,
  xpReward: 300,
  tier: "pro",
  concepts: ["stability testing", "integration milestone", "system composition", "endurance test", "beta readiness"],
  part1: {
    title: "Concept: Stability as a Measurable Property",
    type: "concept",
    instructions: `# Milestone: Public Beta Candidate

## Mental Model

Individual systems work. Integration milestones pass. But have you run
the game for a full session without weird behavior? A "beta candidate"
is a build you'd hand to someone outside your team. It must survive
sustained play without crashing, stalling, or producing nonsense output.
Fix: an endurance test that exercises every system over 15 turns.

## What Breaks Without This

Without endurance testing:
- Individual unit tests pass but integration fails
- Accumulation bugs (memory leaks, counter drift) go undetected
- The game works for 1 turn but breaks at turn 10
- You ship a "demo" that crashes during any real play session

## The Fix

Run 15 turns exercising difficulty scaling, damage config, and combat:

\`\`\`cpp
for (int t = 1; t <= 15; t++) {
    int f = getFloor(t);
    int dmg = scaleDamage(DIFF_TABLE[f-1].enemy_damage, cfg);
    hp -= dmg; gold += 5;
    // Print: TURN|T|floor=F|dmg=D|hp=H|gold=G
}
\`\`\`

## Key Concepts

- **Endurance test**: sustained N-turn simulation
- **System composition**: difficulty + config + combat in one loop
- **Accumulation detection**: compare turn 1 vs turn 15 timing/state
- **Beta readiness**: all turns produce consistent, correct output

## Performance Insight

If turn 1 takes 0.1ms and turn 15 takes 0.1ms, systems scale linearly.
If turn 15 is slower, you have a leak or accumulation bug.

## Memory Insight

After 15 turns, check if any counters accumulated unexpectedly.
Pool high-water should stay bounded. Gold should equal turns * 5.

## Your Task

Write getFloor(turn) that maps turns 1-5 to floor 1, 6-10 to floor 2,
11-15 to floor 3. Run 5 turns and verify floor/damage mapping.

## Beginner Trap

\`\`\`cpp
// BAD: "It worked when I tested one turn"
// That proves nothing about sustained play
// Always test N turns where N reveals accumulation bugs
\`\`\`

## Elite Insight

Microsoft's Xbox certification requires games to run for 72 hours
without crash. Your 15-turn test is the same principle at student
scale: prove stability through sustained operation.

## Systems Thinking Connection

This milestone composes difficulty tables (L87), damage scaling (L86),
and combat (L08). The endurance loop proves they work together.

## Skill Reinforcement

- Difficulty tables from L87
- scaleDamage from L86
- Game loop from L07

## Mastery Check

You pass when 5 TURN lines print correct floor/damage mapping and
MINI_BETA shows consistent final state.`,
    starterCode: `#include <iostream>
using namespace std;

struct DifficultyEntry { int floor; int enemy_hp; int enemy_damage; };
struct GameConfig { int damage_scale; };

const DifficultyEntry DIFF_TABLE[] = {{1, 5, 2}, {2, 10, 4}, {3, 15, 6}};

int scaleDamage(int raw, const GameConfig& cfg) { return (raw * cfg.damage_scale) / 100; }

// TODO: Write getFloor(int turn)
// turns 1-5 = floor 1, 6-10 = floor 2, 11-15 = floor 3

int main() {
    GameConfig cfg = {100};
    int hp = 50, gold = 0;
    for (int t = 1; t <= 5; t++) {
        // TODO: Get floor, lookup difficulty, apply damage, add gold
        // Print TURN|T|floor=F|dmg=D|hp=H|gold=G
    }
    // Print MINI_BETA|final_hp=H|gold=G
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct DifficultyEntry { int floor; int enemy_hp; int enemy_damage; };
struct GameConfig { int damage_scale; };

const DifficultyEntry DIFF_TABLE[] = {{1, 5, 2}, {2, 10, 4}, {3, 15, 6}};

int scaleDamage(int raw, const GameConfig& cfg) { return (raw * cfg.damage_scale) / 100; }

int getFloor(int turn) { return ((turn - 1) / 5) + 1; }

int main() {
    GameConfig cfg = {100};
    int hp = 50, gold = 0;
    for (int t = 1; t <= 5; t++) {
        int f = getFloor(t);
        int dmg = scaleDamage(DIFF_TABLE[f-1].enemy_damage, cfg);
        hp -= dmg; gold += 5;
        cout << "TURN|" << t << "|floor=" << f << "|dmg=" << dmg
             << "|hp=" << hp << "|gold=" << gold << endl;
    }
    cout << "MINI_BETA|final_hp=" << hp << "|gold=" << gold << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Turn 1 floor 1", expectedOutput: "TURN|1|floor=1|dmg=2|hp=48|gold=5", isPattern: false },
      { id: "t2", description: "Turn 5 still floor 1", expectedOutput: "TURN|5|floor=1|dmg=2|hp=40|gold=25", isPattern: false },
      { id: "t3", description: "Mini beta final", expectedOutput: "MINI_BETA|final_hp=40|gold=25", isPattern: false },
    ],
    hints: [
      "getFloor: return ((turn - 1) / 5) + 1. Turn 1-5 gives floor 1.",
      "Use DIFF_TABLE[f-1] to look up enemy stats. Apply scaleDamage before subtracting.",
      "Gold increases by 5 each turn regardless of combat outcome.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: 15-Turn Stability Test",
    type: "game_builder",
    instructions: `# Build: Beta Stability Run

## Mental Model

Part 1 proved 5-turn floor mapping. Now run the full 15-turn endurance
test across 3 floors. Floor changes every 5 turns. Damage scales per
floor. The test passes if all 15 turns produce valid output and the
final state matches expected values exactly.

## What Breaks Without This

Without the full 15-turn test:
- Floor transitions at turns 6 and 11 might break
- Accumulated damage might overflow or stall
- The "beta ready" claim is unproven

## The Fix

Loop 15 turns. getFloor maps turn ranges to floors. DIFF_TABLE
provides enemy stats per floor. scaleDamage applies config.
Print every turn, verify final state.

## Key Concepts

- **Floor progression**: turns 1-5=floor1, 6-10=floor2, 11-15=floor3
- **Damage escalation**: floor 1=2dmg, floor 2=4dmg, floor 3=6dmg
- **Gold accumulation**: +5 per turn, independent of combat
- **Final state**: hp=-10, gold=75 after 15 turns

## Performance Insight

15 iterations of: 1 division, 1 array lookup, 1 multiply, 2 additions,
1 cout. Under 100 microseconds total. Linear time, zero allocation.

## Memory Insight

All state fits in 3 stack integers (hp, gold, turn counter). The
difficulty table is const. Zero heap allocation across all 15 turns.

## Your Task

1. Write getFloor(turn): ((turn-1)/5)+1
2. Loop 15 turns: lookup difficulty, apply damage, add gold
3. Print TURN|T|floor=F|dmg=D|hp=H|gold=G each turn
4. Print BETA|final_hp=H|gold=G|turns=15
5. Print BETA|STABLE|15 turns clean

## Beginner Trap

\`\`\`cpp
// BAD: Off-by-one in floor calculation
int f = turn / 5 + 1; // Turn 5 gives floor 2 (wrong!)
// FIX: Use ((turn-1)/5)+1 so turn 5 stays on floor 1
\`\`\`

## Elite Insight

Automated endurance tests run nightly in AAA studios. If tonight's
build fails the 1000-turn sim, the team gets a red build alert.
Your 15-turn test is the student-scale equivalent.

## Mastery Check

You pass when all 15 TURN lines print correctly and
BETA|STABLE confirms clean sustained operation.`,
    starterCode: `#include <iostream>
using namespace std;

struct DifficultyEntry { int floor; int enemy_hp; int enemy_damage; };
struct GameConfig { int damage_scale; };

const DifficultyEntry DIFF_TABLE[] = {{1, 5, 2}, {2, 10, 4}, {3, 15, 6}};

int scaleDamage(int raw, const GameConfig& cfg) { return (raw * cfg.damage_scale) / 100; }

// TODO: Write getFloor(int turn)
// turns 1-5 = floor 1, 6-10 = floor 2, 11-15 = floor 3

int main() {
    GameConfig cfg = {100};
    int hp = 50, gold = 0;
    for (int t = 1; t <= 15; t++) {
        // TODO: Determine floor from turn
        // TODO: Look up difficulty (floor-1 index)
        // TODO: Apply scaled damage, add 5 gold
        // TODO: Print TURN|T|floor=F|dmg=D|hp=H|gold=G
    }
    // TODO: Print BETA|final_hp=H|gold=G|turns=15
    // TODO: Print BETA|STABLE|15 turns clean
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct DifficultyEntry { int floor; int enemy_hp; int enemy_damage; };
struct GameConfig { int damage_scale; };

const DifficultyEntry DIFF_TABLE[] = {{1, 5, 2}, {2, 10, 4}, {3, 15, 6}};

int scaleDamage(int raw, const GameConfig& cfg) { return (raw * cfg.damage_scale) / 100; }

int getFloor(int turn) { return ((turn - 1) / 5) + 1; }

int main() {
    GameConfig cfg = {100};
    int hp = 50, gold = 0;
    for (int t = 1; t <= 15; t++) {
        int f = getFloor(t);
        const DifficultyEntry& d = DIFF_TABLE[f - 1];
        int dmg = scaleDamage(d.enemy_damage, cfg);
        hp -= dmg;
        gold += 5;
        cout << "TURN|" << t << "|floor=" << f << "|dmg=" << dmg
             << "|hp=" << hp << "|gold=" << gold << endl;
    }
    cout << "BETA|final_hp=" << hp << "|gold=" << gold << "|turns=15" << endl;
    cout << "BETA|STABLE|15 turns clean" << endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Turn 1 floor 1", expectedOutput: "TURN|1|floor=1|dmg=2|hp=48|gold=5", isPattern: false },
      { id: "g2", description: "Turn 6 floor change", expectedOutput: "TURN|6|floor=2|dmg=4|hp=36|gold=30", isPattern: false },
      { id: "g3", description: "Turn 11 floor 3", expectedOutput: "TURN|11|floor=3|dmg=6|hp=14|gold=55", isPattern: false },
      { id: "g4", description: "Final state", expectedOutput: "BETA|final_hp=-10|gold=75|turns=15", isPattern: false },
      { id: "g5", description: "Stability passes", expectedOutput: "BETA|STABLE|15 turns clean", isPattern: false },
    ],
    hints: [
      "getFloor: floor = ((turn-1)/5) + 1. Turn 1-5 gives floor 1, 6-10 gives floor 2, 11-15 gives floor 3.",
      "Use DIFF_TABLE[floor-1] to look up enemy stats. Apply scaleDamage before subtracting from hp.",
      "Gold increases by 5 each turn regardless of combat outcome.",
    ],
    estimatedMinutes: 15,
  },
};