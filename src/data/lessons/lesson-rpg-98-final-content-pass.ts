import { Lesson } from "@/types/lesson";

export const lessonRPG98: Lesson = {
  id: "rpg-98-final-content-pass",
  title: "Final Content Pass",
  description: "Define final game content: 3 rooms, 6 enemy types, 5 item types, 2 quests. All as data tables. Prove content completeness.",
  order: 98,
  xpReward: 100,
  tier: "pro",
  concepts: ["content completeness", "data tables", "content audit", "game content", "data-driven design"],
  part1: {
    title: "Concept: Content as Measurable Completeness",
    type: "concept",
    instructions: `# Final Content Pass

## Mental Model

Your engine is solid — combat, inventory, quests, replay, tests all
work. But the game has placeholder content: 1-2 enemy types, a couple
of rooms, generic items. A portfolio project needs enough content to
demonstrate the systems. Fix: define minimum content requirements and
verify them with an audit function.

## What Breaks Without This

Without a content pass:
- Systems exist but have nothing to process
- Portfolio reviewers see an empty game
- Balance can't be tested with only 2 enemy types
- The engine looks over-engineered for the content it has

## The Fix

Define a ContentAudit struct and a passesAudit function:

\`\`\`cpp
struct ContentAudit { int rooms; int enemies; int items; int quests; };

bool passesAudit(const ContentAudit& actual, const ContentAudit& req) {
    return actual.rooms >= req.rooms
        && actual.enemies >= req.enemies
        && actual.items >= req.items
        && actual.quests >= req.quests;
}
\`\`\`

## Key Concepts

- **Content audit**: struct counting each content category
- **Minimum requirements**: define how much is "enough"
- **Pass/fail check**: same pattern as unit tests
- **Data tables**: content lives in const arrays, not code

## Performance Insight

More content in const arrays has zero runtime cost. The data lives
in read-only memory. 100 enemy types perform identically to 3 —
the systems process them the same way.

## Memory Insight

Content tables are static const. 6 enemy recipes at ~16 bytes = 96
bytes. 5 items at ~16 bytes = 80 bytes. Total content: under 500
bytes. Trivial.

## Your Task

Write passesAudit that checks actual counts against required counts.
Create an audit with 3 rooms, 4 enemies, 5 items, 2 quests. Check
against a requirement of 3/4/5/2. Print the result.

## Beginner Trap

\`\`\`cpp
// BAD: Adding content by writing new spawn functions
void spawnGoblin() { /* ... */ }
void spawnSkeleton() { /* ... */ } // New function per enemy!
// FIX: Content as data tables
const EnemyRecipe ENEMIES[] = { {"goblin",5,2}, {"skeleton",8,3} };
\`\`\`

## Elite Insight

Stardew Valley shipped with 30+ crop types, 12 fish, 20+ recipes —
all defined in data files. The engine code handles "grow a crop"
generically. Adding a new crop requires zero code changes.

## Systems Thinking Connection

Content audit connects to the factory (L79): recipes are the content,
the factory is the engine. The audit checks that the content layer
is complete enough to exercise every system.

## Skill Reinforcement

- Struct design from L11
- Const data tables from L78
- Boolean logic from L08

## Mastery Check

You pass when AUDIT_TEST shows PASS for 3/4/5/2 requirements.`,
    starterCode: `#include <iostream>
using namespace std;

struct ContentAudit { int rooms; int enemies; int items; int quests; };

// TODO: passesAudit(const ContentAudit& actual, const ContentAudit& req)
// Return true if all actual counts >= required counts

int main() {
    ContentAudit actual = {3, 4, 5, 2};
    ContentAudit required = {3, 4, 5, 2};
    // TODO: Call passesAudit and print AUDIT_TEST|PASS or AUDIT_TEST|FAIL
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct ContentAudit { int rooms; int enemies; int items; int quests; };

bool passesAudit(const ContentAudit& actual, const ContentAudit& req) {
    return actual.rooms >= req.rooms
        && actual.enemies >= req.enemies
        && actual.items >= req.items
        && actual.quests >= req.quests;
}

int main() {
    ContentAudit actual = {3, 4, 5, 2};
    ContentAudit required = {3, 4, 5, 2};
    bool pass = passesAudit(actual, required);
    cout << "AUDIT_TEST|" << (pass ? "PASS" : "FAIL") << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Audit passes", expectedOutput: "AUDIT_TEST|PASS", isPattern: false },
    ],
    hints: [
      "passesAudit checks 4 conditions with &&: rooms, enemies, items, quests.",
      "Use actual.rooms >= req.rooms for each field comparison.",
      "Print the ternary result: pass ? 'PASS' : 'FAIL'.",
    ],
    estimatedMinutes: 5,
  },
  part2: {
    title: "Build: Content Completeness Check",
    type: "game_builder",
    instructions: `# Build: Content Completeness Check

## Mental Model

Part 1 proved the audit logic. Now define ALL game content as data
tables: 6 enemy types, 5 item types, 3 rooms, 2 quests. Run the
audit to verify completeness. This is how shipped games track
content requirements.

## What Breaks Without This

Without a content completeness check:
- Missing content isn't discovered until playtest
- Balance depends on having enough variety
- Portfolio reviewers see placeholder data

## The Fix

Define const arrays for each category. Count them. Run checkCategory
for each. Report total pass/fail.

## Key Concepts

- **EnemyRecipe array**: 6 entries with name and hp
- **ItemDef array**: 5 entries with name and value
- **Room/Quest arrays**: const char* string arrays
- **checkCategory**: prints AUDIT|name|PASS or FAIL
- **Aggregate pass**: all categories must pass

## Performance Insight

6 comparisons, 4 category checks. Under 100 nanoseconds. The audit
is a build-time sanity check, not a runtime cost.

## Memory Insight

All const arrays live in read-only memory. 6 enemies + 5 items +
3 rooms + 2 quests = under 500 bytes total. Zero heap allocation.

## Your Task

1. Define ENEMIES[6], ITEMS[5], ROOMS[3], QUESTS[2] as const arrays
2. Write checkCategory(name, actual, required) that prints AUDIT line
3. Print CONTENT|category=count for each
4. Run all 4 checks, print CONTENT_PASS or CONTENT_FAIL

## Beginner Trap

\`\`\`cpp
// BAD: Forgetting to chain results
checkCategory("enemies", 6, 6);
checkCategory("items", 5, 5);
// Never checked if any failed!
// FIX: bool all = check(...) && all for each
\`\`\`

## Elite Insight

Professional studios have content checklists that run in CI. If
someone removes an asset, the build fails. Your audit is the same
pattern — automated content verification.

## Mastery Check

You pass when all 4 AUDIT lines show PASS and CONTENT_PASS prints.`,
    starterCode: `#include <iostream>
using namespace std;

struct EnemyRecipe { const char* name; int hp; };
struct ItemDef { const char* name; int value; };

// TODO: Define ENEMIES[6]: goblin(5), skeleton(8), spider(3), wraith(12), dragon(20), lich(15)
// TODO: Define ITEMS[5]: sword(3), shield(2), potion(10), ring(1), scroll(5)
// TODO: Define ROOMS[3]: "dungeon", "crypt", "throne"
// TODO: Define QUESTS[2]: "slay_dragon", "find_ring"

// TODO: checkCategory(const char* name, int actual, int required)
// Print AUDIT|name|PASS or AUDIT|name|FAIL, return bool

int main() {
    // TODO: Print CONTENT|enemies=6, CONTENT|items=5, etc.
    // TODO: Check each category, chain with &&
    // TODO: Print CONTENT_PASS|all requirements met or CONTENT_FAIL|missing content
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct EnemyRecipe { const char* name; int hp; };
struct ItemDef { const char* name; int value; };

const EnemyRecipe ENEMIES[] = {{"goblin",5}, {"skeleton",8}, {"spider",3}, {"wraith",12}, {"dragon",20}, {"lich",15}};
const int ENEMY_COUNT = 6;
const ItemDef ITEMS[] = {{"sword",3}, {"shield",2}, {"potion",10}, {"ring",1}, {"scroll",5}};
const int ITEM_COUNT = 5;
const char* ROOMS[] = {"dungeon", "crypt", "throne"};
const int ROOM_COUNT = 3;
const char* QUESTS[] = {"slay_dragon", "find_ring"};
const int QUEST_COUNT = 2;

bool checkCategory(const char* name, int actual, int required) {
    bool pass = actual >= required;
    cout << "AUDIT|" << name << "|" << (pass ? "PASS" : "FAIL") << endl;
    return pass;
}

int main() {
    cout << "CONTENT|enemies=" << ENEMY_COUNT << endl;
    cout << "CONTENT|items=" << ITEM_COUNT << endl;
    cout << "CONTENT|rooms=" << ROOM_COUNT << endl;
    cout << "CONTENT|quests=" << QUEST_COUNT << endl;
    bool all = true;
    all = checkCategory("enemies", ENEMY_COUNT, 6) && all;
    all = checkCategory("items", ITEM_COUNT, 5) && all;
    all = checkCategory("rooms", ROOM_COUNT, 3) && all;
    all = checkCategory("quests", QUEST_COUNT, 2) && all;
    if (all) cout << "CONTENT_PASS|all requirements met" << endl;
    else cout << "CONTENT_FAIL|missing content" << endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Enemy count", expectedOutput: "CONTENT|enemies=6", isPattern: false },
      { id: "g2", description: "Item count", expectedOutput: "CONTENT|items=5", isPattern: false },
      { id: "g3", description: "Enemies pass audit", expectedOutput: "AUDIT|enemies|PASS", isPattern: false },
      { id: "g4", description: "Content passes", expectedOutput: "CONTENT_PASS|all requirements met", isPattern: false },
    ],
    hints: [
      "Define const arrays for enemies, items, rooms, and quests. Count each with a const int.",
      "checkCategory prints AUDIT|name|PASS if actual >= required, else FAIL.",
      "Chain all checks with &&: all = checkCategory(...) && all for each category.",
    ],
    estimatedMinutes: 12,
  },
};