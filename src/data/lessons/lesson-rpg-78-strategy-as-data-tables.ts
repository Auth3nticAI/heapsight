import { Lesson } from "@/types/lesson";

export const lessonRPG78: Lesson = {
  id: "rpg-78-strategy-as-data-tables",
  title: "Strategy as Data Tables",
  description: "Enemy behavior selected by ID from a table of function pointers — no virtual calls, no inheritance, just data-driven dispatch.",
  order: 78,
  xpReward: 100,
  tier: "pro",
  concepts: ["strategy pattern", "function pointers", "behavior tables", "data-driven AI", "no virtual dispatch"],
  part1: {
    title: "Concept: Table-Driven Behavior",
    type: "concept",
    instructions: `# Strategy as Data Tables

## Mental Model

You want 4 enemy types: idle, chase, patrol, flee. The OOP approach
creates 4 classes with virtual \`update()\` methods. That means heap
allocation, vtable lookups, and cache misses. Fix: store behavior as
a function pointer in a lookup table, indexed by behavior_id.

## What Breaks Without This

Without data-driven behaviors:
- Adding new enemy types requires new classes + recompilation
- Virtual dispatch costs 10+ cycles per entity per tick
- Entity serialization requires type IDs anyway
- Can't add behaviors from data files

## The Fix

Define behaviors as plain functions, store them in a const table:

\`\`\`cpp
typedef void (*BehaviorFn)(int&, int&, int, int, RNG&);

struct BehaviorEntry { const char* name; BehaviorFn fn; };
BehaviorEntry TABLE[] = {
    {"idle", behaviorIdle},
    {"chase", behaviorChase},
};
// Dispatch: TABLE[entity.behavior_id].fn(px, py, tx, ty, rng);
\`\`\`

## Key Concepts

- **Function pointer table**: array of {name, function} pairs
- **behavior_id**: integer index into the table, stored per entity
- **O(1) dispatch**: array lookup + function call, no vtable
- **Data-driven**: new behaviors = new function + one table entry

## Performance Insight

Function pointer call: ~3 cycles. Virtual dispatch: ~10+ cycles.
For 50 entities per tick, that's 350 cycles saved.

## Memory Insight

The behavior table is a const array in read-only memory. Each entity
stores one int (behavior_id) instead of a vtable pointer. Smaller.

## Your Task

Define two behaviors (idle and chase), a 2-entry table, and dispatch
by behavior_id. Print the result of each dispatch.

## Beginner Trap

\`\`\`cpp
// BAD: class hierarchy for enemy types
class Enemy { virtual void update() = 0; };
class Chaser : public Enemy { void update() override { ... } };
// Heap + vtable + harder to serialize
\`\`\`

## Elite Insight

Mike Acton's CppCon talk: "Where there is one, there are many.
Process the many, not the one." Tables are for the many.

## Systems Thinking Connection

Behavior tables connect to the command pattern (L76): commands
describe what to do, behaviors describe how entities react.
Both use enum/ID-based dispatch.

## Skill Reinforcement

- Function pointers from C fundamentals
- Enum types from L13/L76
- Entity parallel arrays from L14

## Mastery Check

You pass when BEHAV_TEST shows idle staying at (5,5) and chase
moving from (3,3) toward (5,5).`,
    starterCode: `#include <iostream>
using namespace std;
struct RNG { unsigned int state; int next(int lo, int hi) { state = state * 1103515245 + 12345; return lo + (int)((state >> 16) % (hi - lo + 1)); } };

typedef void (*BehaviorFn)(int&, int&, int, int, RNG&);

void behaviorIdle(int& px, int& py, int tx, int ty, RNG& r) {}

// TODO: Write behaviorChase — move px toward tx, py toward ty (one step each)

struct BehaviorEntry { const char* name; BehaviorFn fn; };
// TODO: Define BEHAVIOR_TABLE with 2 entries: idle, chase

int main() {
    RNG rng = {42};
    int px1 = 5, py1 = 5; // idle entity
    int px2 = 3, py2 = 3; // chase entity

    // TODO: Dispatch behavior 0 (idle) on entity 1
    // TODO: Dispatch behavior 1 (chase) on entity 2 toward (5,5)
    // Print BEHAV_TEST|idle|px=5|py=5
    // Print BEHAV_TEST|chase|px=4|py=4

    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;
struct RNG { unsigned int state; int next(int lo, int hi) { state = state * 1103515245 + 12345; return lo + (int)((state >> 16) % (hi - lo + 1)); } };

typedef void (*BehaviorFn)(int&, int&, int, int, RNG&);
void behaviorIdle(int& px, int& py, int tx, int ty, RNG& r) {}
void behaviorChase(int& px, int& py, int tx, int ty, RNG& r) { if (px < tx) px++; else if (px > tx) px--; if (py < ty) py++; else if (py > ty) py--; }

struct BehaviorEntry { const char* name; BehaviorFn fn; };
BehaviorEntry BEHAVIOR_TABLE[] = {{"idle", behaviorIdle}, {"chase", behaviorChase}};

int main() {
    RNG rng = {42};
    int px1 = 5, py1 = 5;
    int px2 = 3, py2 = 3;
    BEHAVIOR_TABLE[0].fn(px1, py1, 5, 5, rng);
    cout << "BEHAV_TEST|" << BEHAVIOR_TABLE[0].name << "|px=" << px1 << "|py=" << py1 << endl;
    BEHAVIOR_TABLE[1].fn(px2, py2, 5, 5, rng);
    cout << "BEHAV_TEST|" << BEHAVIOR_TABLE[1].name << "|px=" << px2 << "|py=" << py2 << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Idle stays put", expectedOutput: "BEHAV_TEST|idle|px=5|py=5", isPattern: false },
      { id: "t2", description: "Chase moves toward target", expectedOutput: "BEHAV_TEST|chase|px=4|py=4", isPattern: false },
    ],
    hints: [
      "behaviorChase: if (px < tx) px++; else if (px > tx) px--; Same for py.",
      "BEHAVIOR_TABLE is an array of BehaviorEntry: { {'idle', behaviorIdle}, {'chase', behaviorChase} }.",
      "Dispatch: BEHAVIOR_TABLE[id].fn(px, py, tx, ty, rng); then print BEHAVIOR_TABLE[id].name.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Behavior Table Dispatch",
    type: "game_builder",
    instructions: `# Build: Table-Driven Enemy AI

## Mental Model

Part 1 proved 2 behaviors work. Now implement all 4: idle, chase,
patrol, flee. Tick 6 entities with different behavior_ids. Each
entity's behavior is selected by table lookup, not by type.

## What Breaks Without This

Without a full behavior table:
- Patrol and flee require custom per-entity code
- Behavior changes require editing entity spawn code
- Can't rebalance AI by changing a table entry

## The Fix

4 behavior functions, a 4-entry table, behavior_id per entity.
Tick loops once, dispatches through the table.

## Key Concepts

- **4 behaviors**: idle (noop), chase (toward target), patrol (+1 px), flee (away)
- **behavior_id array**: parallel to position arrays
- **Single loop dispatch**: TABLE[bid[i]].fn for each entity
- **Named output**: print behavior name from table entry

## Performance Insight

6 entities with table dispatch: 6 array lookups + 6 function calls.
Zero virtual dispatch overhead. The table is const — lives in
instruction cache.

## Memory Insight

4 table entries × 16 bytes each = 64 bytes. Plus 6 behavior_id
ints = 24 bytes. Total: 88 bytes for the entire AI system.

## Your Task

1. Write behaviorChase (move toward target), behaviorPatrol (+1 px),
   behaviorFlee (move away from target)
2. Fill BEHAVIOR_TABLE with all 4 entries
3. Tick 6 entities, print TICK|eid=I|behavior=NAME|px=X|py=Y
4. Print BEHAVIORS_APPLIED|6

## Beginner Trap

\`\`\`cpp
// BAD: if/else chain instead of table lookup
if (bid == 0) idle(px, py);
else if (bid == 1) chase(px, py);
// Table lookup is O(1) and extensible
\`\`\`

## Elite Insight

Behavior tables can be loaded from data files at runtime.
A modder adds a new behavior function + table entry = new enemy
AI without recompiling the game.

## Mastery Check

You pass when all 6 entities tick with correct behavior names
and positions, ending with BEHAVIORS_APPLIED|6.`,
    starterCode: `#include <iostream>
using namespace std;
struct RNG { unsigned int state; int next(int lo, int hi) { state = state * 1103515245 + 12345; return lo + (int)((state >> 16) % (hi - lo + 1)); } };

typedef void (*BehaviorFn)(int&, int&, int, int, RNG&);

void behaviorIdle(int& px, int& py, int tx, int ty, RNG& r) {}

// TODO: Write behaviorChase — move toward target (px toward tx, py toward ty)
// TODO: Write behaviorPatrol — move px by +1
// TODO: Write behaviorFlee — move away from target

struct BehaviorEntry { const char* name; BehaviorFn fn; };
// TODO: Fill BEHAVIOR_TABLE with 4 entries: idle, chase, patrol, flee

int main() {
    int px[] = {5, 3, 1, 8, 7, 1}; int py[] = {5, 3, 3, 8, 7, 1};
    int bid[] = {0, 1, 2, 3, 1, 0};
    int target_x = 5, target_y = 5;
    RNG rng = {42};
    for (int i = 0; i < 6; i++) {
        // TODO: Call BEHAVIOR_TABLE[bid[i]].fn(px[i], py[i], target_x, target_y, rng)
        // TODO: Print TICK|eid=I|behavior=NAME|px=X|py=Y
    }
    // TODO: Print BEHAVIORS_APPLIED|6
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;
struct RNG { unsigned int state; int next(int lo, int hi) { state = state * 1103515245 + 12345; return lo + (int)((state >> 16) % (hi - lo + 1)); } };

typedef void (*BehaviorFn)(int&, int&, int, int, RNG&);

void behaviorIdle(int& px, int& py, int tx, int ty, RNG& r) {}
void behaviorChase(int& px, int& py, int tx, int ty, RNG& r) { if (px < tx) px++; else if (px > tx) px--; if (py < ty) py++; else if (py > ty) py--; }
void behaviorPatrol(int& px, int& py, int tx, int ty, RNG& r) { px++; }
void behaviorFlee(int& px, int& py, int tx, int ty, RNG& r) { if (px < tx) px--; else if (px > tx) px++; if (py < ty) py--; else if (py > ty) py++; }

struct BehaviorEntry { const char* name; BehaviorFn fn; };
BehaviorEntry BEHAVIOR_TABLE[] = {{"idle", behaviorIdle}, {"chase", behaviorChase}, {"patrol", behaviorPatrol}, {"flee", behaviorFlee}};

int main() {
    int px[] = {5, 3, 1, 8, 7, 1}; int py[] = {5, 3, 3, 8, 7, 1};
    int bid[] = {0, 1, 2, 3, 1, 0};
    int target_x = 5, target_y = 5;
    RNG rng = {42};
    for (int i = 0; i < 6; i++) {
        BEHAVIOR_TABLE[bid[i]].fn(px[i], py[i], target_x, target_y, rng);
        cout << "TICK|eid=" << i << "|behavior=" << BEHAVIOR_TABLE[bid[i]].name << "|px=" << px[i] << "|py=" << py[i] << endl;
    }
    cout << "BEHAVIORS_APPLIED|6" << endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Idle stays put", expectedOutput: "TICK|eid=0|behavior=idle|px=5|py=5", isPattern: false },
      { id: "g2", description: "Chase moves toward target", expectedOutput: "TICK|eid=1|behavior=chase|px=4|py=4", isPattern: false },
      { id: "g3", description: "Flee moves away", expectedOutput: "TICK|eid=3|behavior=flee|px=9|py=9", isPattern: false },
      { id: "g4", description: "All behaviors applied", expectedOutput: "BEHAVIORS_APPLIED|6", isPattern: false },
    ],
    hints: [
      "behaviorChase: if (px < tx) px++; else if (px > tx) px--; Same for py. behaviorFlee does the opposite.",
      "behaviorPatrol just does px++. Simple oscillation for this exercise.",
      "Dispatch: BEHAVIOR_TABLE[bid[i]].fn(px[i], py[i], target_x, target_y, rng); then print .name.",
    ],
    estimatedMinutes: 12,
  },
};