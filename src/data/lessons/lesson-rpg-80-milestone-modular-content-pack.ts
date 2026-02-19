import { Lesson } from "@/types/lesson";

export const lessonRPG80: Lesson = {
  id: "rpg-80-milestone-modular-content-pack",
  title: "Milestone: Modular Content Pack",
  description: "Add a new enemy type and room via data tables only — zero code changes prove content-code separation.",
  order: 80,
  xpReward: 300,
  tier: "pro",
  concepts: ["content separation", "data-driven design", "modular content", "no-code extension", "milestone integration"],
  part1: {
    title: "Concept: Content-Code Separation",
    type: "concept",
    instructions: `# Milestone: Modular Content Pack

## Mental Model

Every time a game designer wants a new enemy, a programmer writes
a spawn function. That's a bottleneck. In production, content
should be addable by editing data tables — not by modifying source.
You've built recipe tables (L79) and behavior tables (L78). Now
combine them: define a "content pack" as additional recipe entries.
The engine loads them at startup. Gameplay code never changes.

## What Breaks Without This

Without content-code separation:
- Adding enemies requires new code + recompilation
- Game designers can't add content without programmers
- Each spawn function duplicates the same copy logic
- Balancing requires code changes, not data tweaks

## The Fix

Define recipes as const structs. Load base + pack at startup:

\`\`\`cpp
struct SpawnRecipe { const char* name; int hp; int damage; int behavior_id; };
void loadBaseContent() {
    addRecipe({"goblin", 5, 2, 1});
    addRecipe({"skeleton", 8, 3, 2});
}
void loadContentPack() {
    addRecipe({"wraith", 12, 5, 3});
}
\`\`\`

## Key Concepts

- **Content pack**: additional recipe entries loaded at startup
- **addRecipe**: generic insertion — works for base and pack
- **Zero code changes**: pack recipes use existing spawn/behavior systems
- **Milestone proof**: spawn from pack, verify identical behavior

## Performance Insight

Loading content packs at startup is O(pack size). During gameplay,
all data is in const arrays — zero overhead compared to hardcoded.

## Memory Insight

Content tables are static const — read-only segment. No heap.
More content = slightly larger binary, zero runtime cost.

## Your Task

Define a 3-entry base table and a 1-entry pack. Load both.
Spawn from each and print stats to prove pack content works.

## Beginner Trap

\`\`\`cpp
// BAD: Hardcoding new enemy in source
void spawnWraith(World& w, int x, int y) {
    // This requires recompiling for every new enemy type!
}
// FIX: Add a recipe entry — zero code changes
\`\`\`

## Elite Insight

Minecraft mods are content packs: JSON files defining new blocks,
items, and recipes. The engine code is unchanged. Your content
pack system follows the same architecture.

## Systems Thinking Connection

Content packs combine recipes (L79), behavior tables (L78), and
the spawn factory. This milestone proves those systems compose.

## Skill Reinforcement

- SpawnRecipe struct from L79
- Behavior table lookup from L78
- SoA parallel arrays from L14

## Mastery Check

You pass when BASE_PACK shows 3 base recipes loaded and PACK_ADD
shows the wraith recipe added without any code changes.`,
    starterCode: `#include <iostream>
using namespace std;

struct SpawnRecipe { const char* name; int hp; int damage; int behavior_id; };
const int MAX_RECIPES = 16;
SpawnRecipe all_recipes[MAX_RECIPES];
int recipe_count = 0;

void addRecipe(const SpawnRecipe& r) {
    if (recipe_count < MAX_RECIPES) { all_recipes[recipe_count++] = r; }
}

// TODO: Write loadBaseContent() — add goblin(5,2,1), skeleton(8,3,2), dragon(20,8,1)
// Print BASE_PACK|3 recipes loaded

// TODO: Write loadContentPack() — add wraith(12,5,3)
// Print PACK_ADD|wraith|hp=12

int main() {
    // TODO: loadBaseContent()
    // TODO: loadContentPack()
    // TODO: Print TOTAL|recipe_count recipes
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct SpawnRecipe { const char* name; int hp; int damage; int behavior_id; };
const int MAX_RECIPES = 16;
SpawnRecipe all_recipes[MAX_RECIPES];
int recipe_count = 0;

void addRecipe(const SpawnRecipe& r) {
    if (recipe_count < MAX_RECIPES) { all_recipes[recipe_count++] = r; }
}

void loadBaseContent() {
    addRecipe({"goblin", 5, 2, 1});
    addRecipe({"skeleton", 8, 3, 2});
    addRecipe({"dragon", 20, 8, 1});
    cout << "BASE_PACK|3 recipes loaded" << endl;
}

void loadContentPack() {
    addRecipe({"wraith", 12, 5, 3});
    cout << "PACK_ADD|wraith|hp=12" << endl;
}

int main() {
    loadBaseContent();
    loadContentPack();
    cout << "TOTAL|" << recipe_count << " recipes" << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Base content loaded", expectedOutput: "BASE_PACK|3 recipes loaded", isPattern: false },
      { id: "t2", description: "Pack wraith added", expectedOutput: "PACK_ADD|wraith|hp=12", isPattern: false },
      { id: "t3", description: "Total recipe count", expectedOutput: "TOTAL|4 recipes", isPattern: false },
    ],
    hints: [
      "loadBaseContent calls addRecipe 3 times with goblin, skeleton, dragon.",
      "loadContentPack calls addRecipe once with wraith(12,5,3).",
      "Print TOTAL| followed by recipe_count and the word recipes.",
    ],
    estimatedMinutes: 8,
  },
  part2: {
    title: "Build: Full Content Pack Integration",
    type: "game_builder",
    instructions: `# Build: Content Pack Integration

## Mental Model

Part 1 proved base + pack loading. Now prove the full pipeline:
load base content (3 enemies), load a content pack (2 more enemies),
spawn entities from BOTH base and pack recipes, and verify that
pack content works identically to base content. Zero code changes.

## What Breaks Without This

Without end-to-end pack integration:
- You can't prove content-code separation actually works
- Pack recipes might not spawn correctly
- No verification that pack entities behave identically
- The architecture claim is untested

## The Fix

loadBaseContent adds 3 recipes. loadContentPack adds 2 more.
spawnFromRecipe works on ANY recipe index — base or pack.
Spawn 4 entities (2 base, 2 pack), verify all spawn correctly.

## Key Concepts

- **Unified recipe table**: base and pack share the same array
- **Index-based spawning**: recipe_id works regardless of source
- **Integration test**: spawn from both, compare output format
- **Content separation proof**: pack adds content without code changes

## Performance Insight

5 recipes in a 16-slot array. 4 spawns = 4 array lookups + 20 field
copies. Under 100 nanoseconds total. The recipe source (base vs pack)
has zero performance impact.

## Memory Insight

5 recipes x ~20 bytes = 100 bytes. 4 entities use existing SoA arrays.
Zero additional allocation. Pack content costs the same as base content.

## Your Task

1. loadBaseContent: add goblin(5,2,1), skeleton(8,3,2), dragon(20,8,1)
2. loadContentPack: add wraith(12,5,3), lich(15,6,1)
3. Spawn goblin(1,1), skeleton(3,3), wraith(5,5), lich(7,7)
4. Print CONTENT_PACK|PASS|no code changes

## Beginner Trap

\`\`\`cpp
// BAD: Separate spawn functions per type
void spawnWraith(World& w) { /* hardcoded */ }
void spawnLich(World& w) { /* hardcoded */ }
// FIX: spawnFromRecipe(w, recipe_id, x, y) — works for all types
\`\`\`

## Elite Insight

Factorio's mod system loads content packs at startup. Each mod adds
recipes, entities, and items to shared tables. The engine never
changes. Your architecture mirrors this pattern.

## Mastery Check

You pass when all 4 SPAWN lines print correct stats and
CONTENT_PACK|PASS confirms zero code changes needed.`,
    starterCode: `#include <iostream>
using namespace std;

struct SpawnRecipe { const char* name; int hp; int damage; int behavior_id; };

const int MAX_RECIPES = 16;
SpawnRecipe all_recipes[MAX_RECIPES];
int recipe_count = 0;

void addRecipe(const SpawnRecipe& r) {
    if (recipe_count < MAX_RECIPES) { all_recipes[recipe_count++] = r; }
}

// TODO: Write loadBaseContent() — adds goblin(5,2,1), skeleton(8,3,2), dragon(20,8,1)
// Print CONTENT|base=3 recipes

// TODO: Write loadContentPack() — adds wraith(12,5,3), lich(15,6,1)
// Print CONTENT|pack=2 recipes

const int MAX_E = 16;
struct World { int px[MAX_E]; int py[MAX_E]; int hp[MAX_E]; int active_count; };

void spawnFromRecipe(World& w, int recipe_id, int x, int y) {
    const SpawnRecipe& r = all_recipes[recipe_id];
    int idx = w.active_count++;
    w.px[idx] = x; w.py[idx] = y; w.hp[idx] = r.hp;
    cout << "SPAWN|" << r.name << "|hp=" << r.hp << "|pos=(" << x << "," << y << ")" << endl;
}

int main() {
    // TODO: loadBaseContent()
    // TODO: loadContentPack()
    // TODO: Print CONTENT|total=N recipes
    World w = {}; w.active_count = 0;
    // TODO: Spawn goblin(1,1), skeleton(3,3), wraith(5,5), lich(7,7)
    // wraith is recipe_id=3, lich is recipe_id=4
    // TODO: Print CONTENT_PACK|PASS|no code changes
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct SpawnRecipe { const char* name; int hp; int damage; int behavior_id; };

const int MAX_RECIPES = 16;
SpawnRecipe all_recipes[MAX_RECIPES];
int recipe_count = 0;

void addRecipe(const SpawnRecipe& r) {
    if (recipe_count < MAX_RECIPES) { all_recipes[recipe_count++] = r; }
}

void loadBaseContent() {
    addRecipe({"goblin", 5, 2, 1});
    addRecipe({"skeleton", 8, 3, 2});
    addRecipe({"dragon", 20, 8, 1});
    cout << "CONTENT|base=3 recipes" << endl;
}

void loadContentPack() {
    addRecipe({"wraith", 12, 5, 3});
    addRecipe({"lich", 15, 6, 1});
    cout << "CONTENT|pack=2 recipes" << endl;
}

const int MAX_E = 16;
struct World { int px[MAX_E]; int py[MAX_E]; int hp[MAX_E]; int active_count; };

void spawnFromRecipe(World& w, int recipe_id, int x, int y) {
    const SpawnRecipe& r = all_recipes[recipe_id];
    int idx = w.active_count++;
    w.px[idx] = x; w.py[idx] = y; w.hp[idx] = r.hp;
    cout << "SPAWN|" << r.name << "|hp=" << r.hp << "|pos=(" << x << "," << y << ")" << endl;
}

int main() {
    loadBaseContent();
    loadContentPack();
    cout << "CONTENT|total=" << recipe_count << " recipes" << endl;
    World w = {}; w.active_count = 0;
    spawnFromRecipe(w, 0, 1, 1);
    spawnFromRecipe(w, 1, 3, 3);
    spawnFromRecipe(w, 3, 5, 5);
    spawnFromRecipe(w, 4, 7, 7);
    cout << "CONTENT_PACK|PASS|no code changes" << endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Base content loaded", expectedOutput: "CONTENT|base=3 recipes", isPattern: false },
      { id: "g2", description: "Pack content loaded", expectedOutput: "CONTENT|pack=2 recipes", isPattern: false },
      { id: "g3", description: "Total recipes", expectedOutput: "CONTENT|total=5 recipes", isPattern: false },
      { id: "g4", description: "Pack entity spawned", expectedOutput: "SPAWN|wraith|hp=12|pos=(5,5)", isPattern: false },
      { id: "g5", description: "Content pack passes", expectedOutput: "CONTENT_PACK|PASS|no code changes", isPattern: false },
    ],
    hints: [
      "loadBaseContent calls addRecipe 3 times with goblin, skeleton, dragon. loadContentPack adds wraith and lich.",
      "After loading both, recipe_count should be 5. Print CONTENT|total=5 recipes.",
      "wraith is recipe_id=3 (4th recipe), lich is recipe_id=4 (5th recipe). Use these indices to spawn.",
    ],
    estimatedMinutes: 15,
  },
};