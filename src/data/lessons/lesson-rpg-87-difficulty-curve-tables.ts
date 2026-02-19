import { Lesson } from "@/types/lesson";

export const lessonRPG87: Lesson = {
  id: "rpg-87-difficulty-curve-tables",
  title: "Difficulty Curve Tables",
  description: "Scale enemy HP and damage per dungeon level using a data table. Balance lives in data, not code.",
  order: 87,
  xpReward: 100,
  tier: "pro",
  concepts: ["difficulty scaling", "data tables", "balance design", "curve tuning", "data-driven design"],
  part1: {
    title: "Concept: Balance as Data",
    type: "concept",
    instructions: `# Difficulty Curve Tables

## Mental Model

Your enemies deal the same damage on floor 1 and floor 10. The game
starts fair and stays flat — no ramp, no tension, no reason to
improve. Hardcoding enemy_hp = 5 + floor * 2 works until a designer
wants to tweak it, then they're editing source code. Fix: a const
table indexed by floor number. Each entry defines HP, damage, and
spawn count. Designers edit data, not code.

## What Breaks Without This

Without difficulty tables:
- Balance changes require code changes + recompilation
- Can't tune individual floors independently
- Formulas create smooth curves but can't express hand-crafted difficulty
- No way for non-programmers to adjust game feel

## The Fix

A const table indexed by floor:

\`\`\`cpp
struct DifficultyEntry { int floor; int enemy_hp; int enemy_damage; int spawn_count; };
const DifficultyEntry DIFFICULTY_TABLE[] = {
    {1, 5, 2, 2}, {2, 8, 3, 3}, {3, 12, 4, 3}, {4, 15, 5, 4}, {5, 20, 7, 4}
};
\`\`\`

## Key Concepts

- **DifficultyEntry**: struct with floor, enemy_hp, enemy_damage, spawn_count
- **getDifficulty(floor)**: clamp-and-lookup, returns table entry
- **Clamping**: out-of-range floors get valid data (no crash)
- **Data-driven balance**: edit numbers, not formulas

## Performance Insight

One array lookup per spawn event. O(1). The table is const and lives
in read-only memory. Even with 100 floors, trivial lookup.

## Memory Insight

Each DifficultyEntry is 16 bytes. 5 floors = 80 bytes. Even 100 floors
would be 1.6 KB of static const data. No heap, no runtime allocation.

## Your Task

Write getDifficulty(int floor) with clamping. Look up floor 3 and
print its stats to prove the table works.

## Beginner Trap

\`\`\`cpp
// BAD: Hardcoded formula
int enemy_hp = 5 + floor * 3;
// Can't tune individual floors independently
// FIX: Use DIFFICULTY_TABLE[floor - 1] lookup
\`\`\`

## Elite Insight

Diablo II's monster scaling is entirely table-driven — MonStats.txt
defines HP, damage, resistances per difficulty level. Designers edit
spreadsheets, not code.

## Systems Thinking Connection

Difficulty tables feed into spawn recipes (L79): the table says HOW
MANY and HOW STRONG, the recipe says WHAT TYPE. Combined, they define
the full encounter.

## Skill Reinforcement

- Const data tables from L78
- Struct design from L11
- Array indexing from L06

## Mastery Check

You pass when DIFF_TEST shows floor 3 with hp=12, dmg=4, spawn=3.`,
    starterCode: `#include <iostream>
using namespace std;

struct DifficultyEntry { int floor; int enemy_hp; int enemy_damage; int spawn_count; };
const DifficultyEntry DIFFICULTY_TABLE[] = {
    {1, 5, 2, 2}, {2, 8, 3, 3}, {3, 12, 4, 3}, {4, 15, 5, 4}, {5, 20, 7, 4}
};
const int DIFFICULTY_COUNT = 5;

// TODO: Write getDifficulty(int floor)
// Clamp index to [0, DIFFICULTY_COUNT-1], return reference

int main() {
    // TODO: const DifficultyEntry& d = getDifficulty(3);
    // Print DIFF_TEST|floor=3|hp=H|dmg=D|spawn=S
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct DifficultyEntry { int floor; int enemy_hp; int enemy_damage; int spawn_count; };
const DifficultyEntry DIFFICULTY_TABLE[] = {
    {1, 5, 2, 2}, {2, 8, 3, 3}, {3, 12, 4, 3}, {4, 15, 5, 4}, {5, 20, 7, 4}
};
const int DIFFICULTY_COUNT = 5;

const DifficultyEntry& getDifficulty(int floor) {
    int idx = floor - 1;
    if (idx < 0) idx = 0;
    if (idx >= DIFFICULTY_COUNT) idx = DIFFICULTY_COUNT - 1;
    return DIFFICULTY_TABLE[idx];
}

int main() {
    const DifficultyEntry& d = getDifficulty(3);
    cout << "DIFF_TEST|floor=3|hp=" << d.enemy_hp << "|dmg=" << d.enemy_damage
         << "|spawn=" << d.spawn_count << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Floor 3 lookup", expectedOutput: "DIFF_TEST|floor=3|hp=12|dmg=4|spawn=3", isPattern: false },
    ],
    hints: [
      "getDifficulty takes floor, computes idx = floor - 1, clamps to [0, DIFFICULTY_COUNT-1].",
      "Return DIFFICULTY_TABLE[idx] by const reference.",
      "Floor 3 maps to index 2: {3, 12, 4, 3} so hp=12, dmg=4, spawn=3.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Build: Floor-Based Difficulty Scaling",
    type: "game_builder",
    instructions: `# Build: Floor-Based Difficulty Scaling

## Mental Model

Part 1 proved single-floor lookup. Now iterate all 5 floors,
spawning enemies with scaled stats from the difficulty table.
Print each floor's stats and count total enemies across all floors.
This is how production games scale encounters per level.

## What Breaks Without This

Without full-table iteration:
- You can't verify the entire difficulty curve
- Clamping bugs at floor 0 or floor 99 go undetected
- Total spawn counts aren't tracked for balance analysis

## The Fix

Loop floors 1-5, call getDifficulty, print stats, sum spawn_count.

## Key Concepts

- **Table iteration**: loop over floors, lookup each
- **Spawn count accumulation**: total enemies across all floors
- **Structured output**: FLOOR|F|enemies=N|hp=H|dmg=D for verification
- **Clamping safety**: getDifficulty handles any floor value

## Performance Insight

5 lookups, 5 prints. Under 1 microsecond for the data work.
The table is cache-friendly (80 bytes, sequential access).

## Memory Insight

80 bytes const table + one int accumulator. Zero heap allocation.

## Your Task

1. Write getDifficulty with clamping
2. Loop floors 1-5, print FLOOR|F|enemies|hp|dmg for each
3. Accumulate and print DIFFICULTY|total_enemies=16
4. Print DIFFICULTY|PASS|data-driven scaling

## Beginner Trap

\`\`\`cpp
// BAD: Forgetting to clamp
return DIFFICULTY_TABLE[floor - 1]; // Crash if floor=0 or floor=99!
// FIX: Clamp idx to [0, DIFFICULTY_COUNT-1] before lookup
\`\`\`

## Elite Insight

Slay the Spire scales encounters using per-act difficulty tables.
Each act has hand-tuned enemy pools and stat ranges. Your per-floor
table is the same pattern at smaller scale.

## Mastery Check

You pass when all 5 FLOOR lines print correctly and
DIFFICULTY|total_enemies=16.`,
    starterCode: `#include <iostream>
using namespace std;

struct DifficultyEntry { int floor; int enemy_hp; int enemy_damage; int spawn_count; };

const DifficultyEntry DIFFICULTY_TABLE[] = {
    {1, 5, 2, 2}, {2, 8, 3, 3}, {3, 12, 4, 3}, {4, 15, 5, 4}, {5, 20, 7, 4}
};
const int DIFFICULTY_COUNT = 5;

// TODO: Write getDifficulty(int floor)
// Clamp index to valid range [0, DIFFICULTY_COUNT-1]
// Return reference to DIFFICULTY_TABLE entry

int main() {
    int total = 0;
    for (int f = 1; f <= 5; f++) {
        // TODO: Get difficulty for floor f
        // TODO: Print FLOOR|F|enemies=N|hp=H|dmg=D
        // TODO: Add spawn_count to total
    }
    // TODO: Print DIFFICULTY|total_enemies=T
    // TODO: Print DIFFICULTY|PASS|data-driven scaling
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct DifficultyEntry { int floor; int enemy_hp; int enemy_damage; int spawn_count; };

const DifficultyEntry DIFFICULTY_TABLE[] = {
    {1, 5, 2, 2}, {2, 8, 3, 3}, {3, 12, 4, 3}, {4, 15, 5, 4}, {5, 20, 7, 4}
};
const int DIFFICULTY_COUNT = 5;

const DifficultyEntry& getDifficulty(int floor) {
    int idx = floor - 1;
    if (idx < 0) idx = 0;
    if (idx >= DIFFICULTY_COUNT) idx = DIFFICULTY_COUNT - 1;
    return DIFFICULTY_TABLE[idx];
}

int main() {
    int total = 0;
    for (int f = 1; f <= 5; f++) {
        const DifficultyEntry& d = getDifficulty(f);
        cout << "FLOOR|" << f << "|enemies=" << d.spawn_count
             << "|hp=" << d.enemy_hp << "|dmg=" << d.enemy_damage << endl;
        total += d.spawn_count;
    }
    cout << "DIFFICULTY|total_enemies=" << total << endl;
    cout << "DIFFICULTY|PASS|data-driven scaling" << endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Floor 1 stats", expectedOutput: "FLOOR|1|enemies=2|hp=5|dmg=2", isPattern: false },
      { id: "g2", description: "Floor 3 stats", expectedOutput: "FLOOR|3|enemies=3|hp=12|dmg=4", isPattern: false },
      { id: "g3", description: "Floor 5 stats", expectedOutput: "FLOOR|5|enemies=4|hp=20|dmg=7", isPattern: false },
      { id: "g4", description: "Total enemies", expectedOutput: "DIFFICULTY|total_enemies=16", isPattern: false },
      { id: "g5", description: "Scaling passes", expectedOutput: "DIFFICULTY|PASS|data-driven scaling", isPattern: false },
    ],
    hints: [
      "getDifficulty clamps (floor-1) to [0, DIFFICULTY_COUNT-1] and returns DIFFICULTY_TABLE[idx].",
      "In the loop, get the entry, print its fields, and accumulate spawn_count into total.",
      "Each DifficultyEntry already has all the data you need. Just read and print.",
    ],
    estimatedMinutes: 10,
  },
};