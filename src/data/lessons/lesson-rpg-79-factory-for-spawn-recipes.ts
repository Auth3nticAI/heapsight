import { Lesson } from "@/types/lesson";

export const lessonRPG79: Lesson = {
  id: "rpg-79-factory-for-spawn-recipes",
  title: "Factory for Spawn Recipes",
  description: "Spawn entities from data-driven recipes — no hardcoded constructors. A recipe defines what to create; the factory just copies fields.",
  order: 79,
  xpReward: 100,
  tier: "pro",
  concepts: ["factory pattern", "data-driven spawning", "spawn recipes", "content separation", "no-code entity creation"],
  part1: {
    title: "Concept: Data-Driven Spawning",
    type: "concept",
    instructions: `# Factory for Spawn Recipes

## Mental Model

Every time you add a new enemy type, you write a new spawn function:
\`spawnGoblin()\`, \`spawnSkeleton()\`, \`spawnDragon()\`. Each has hardcoded
values. Fix: define entity properties in a data table (recipe). The
factory just copies fields from the recipe to the entity arrays.

## What Breaks Without This

Without data-driven spawning:
- Adding enemies requires new code + recompilation
- Game designers can't add content without programmers
- Each spawn function duplicates the same copy logic
- Balancing requires code changes, not data tweaks

## The Fix

Define recipes as const structs. Spawn by copying:

\`\`\`cpp
struct SpawnRecipe { const char* name; int hp; int damage; int behavior_id; };
const SpawnRecipe RECIPES[] = {
    {"goblin", 5, 2, 1},
    {"skeleton", 8, 3, 2},
};
// Spawn: copy RECIPES[id] fields to entity arrays
\`\`\`

## Key Concepts

- **SpawnRecipe**: const data describing an entity type
- **Recipe table**: array of recipes indexed by recipe_id
- **Field copying**: spawn = copy recipe fields to SoA arrays
- **Content separation**: data changes, code doesn't

## Performance Insight

Recipe lookup is one array index. Spawning is 5 field copies.
~10 nanoseconds total. The const table lives in read-only memory.

## Memory Insight

Each recipe is ~20 bytes. 100 types = 2 KB. Static allocation.
Zero runtime cost.

## Your Task

Define a 2-entry recipe table. Write spawnFromRecipe that copies
fields to entity arrays. Spawn a goblin and print its stats.

## Beginner Trap

\`\`\`cpp
// BAD: Factory that allocates new objects
Enemy* create(string type) {
    if (type == "goblin") return new Goblin(); // Heap!
}
\`\`\`

## Elite Insight

Diablo's monster system is entirely data-driven. Every monster is
defined by a recipe file (Monstats.txt). The engine has no
monster-specific code.

## Systems Thinking Connection

Recipes connect to behavior tables (L78): the recipe's behavior_id
indexes into the behavior table. Content defines both WHAT spawns
and HOW it behaves.

## Skill Reinforcement

- Struct design from L11
- Const data tables from L78
- SoA parallel arrays from L14

## Mastery Check

You pass when RECIPE_TEST prints a goblin with hp=5, dmg=2.`,
    starterCode: `#include <iostream>
using namespace std;

struct SpawnRecipe { const char* name; int hp; int damage; int behavior_id; };
const SpawnRecipe RECIPES[] = {{"goblin", 5, 2, 1}, {"skeleton", 8, 3, 2}};

const int MAX_E = 16;
struct World { int px[MAX_E]; int py[MAX_E]; int hp[MAX_E]; int damage[MAX_E]; int behavior_id[MAX_E]; int active_count; };

// TODO: Write spawnFromRecipe(World& w, int recipe_id, int x, int y)
// Copy recipe fields to entity arrays at active_count, then increment

int main() {
    World w = {}; w.active_count = 0;
    // TODO: spawnFromRecipe(w, 0, 2, 3)  // goblin
    // Print RECIPE_TEST|goblin|hp=5|dmg=2
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct SpawnRecipe { const char* name; int hp; int damage; int behavior_id; };
const SpawnRecipe RECIPES[] = {{"goblin", 5, 2, 1}, {"skeleton", 8, 3, 2}};

const int MAX_E = 16;
struct World { int px[MAX_E]; int py[MAX_E]; int hp[MAX_E]; int damage[MAX_E]; int behavior_id[MAX_E]; int active_count; };

void spawnFromRecipe(World& w, int recipe_id, int x, int y) {
    const SpawnRecipe& r = RECIPES[recipe_id];
    int idx = w.active_count++;
    w.px[idx] = x; w.py[idx] = y; w.hp[idx] = r.hp; w.damage[idx] = r.damage; w.behavior_id[idx] = r.behavior_id;
}

int main() {
    World w = {}; w.active_count = 0;
    spawnFromRecipe(w, 0, 2, 3);
    cout << "RECIPE_TEST|" << RECIPES[0].name << "|hp=" << w.hp[0] << "|dmg=" << w.damage[0] << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Goblin spawned with correct stats", expectedOutput: "RECIPE_TEST|goblin|hp=5|dmg=2", isPattern: false },
    ],
    hints: [
      "spawnFromRecipe gets RECIPES[recipe_id], copies hp/damage/behavior_id to entity arrays at w.active_count.",
      "Don't forget to set w.px[idx] = x and w.py[idx] = y for position.",
      "After copying, increment w.active_count++.",
    ],
    estimatedMinutes: 6,
  },
  part2: {
    title: "Build: Recipe-Based Spawning",
    type: "game_builder",
    instructions: `# Build: Spawn From Recipes

## Mental Model

Part 1 proved single-recipe spawning. Now spawn 4 different entity
types from a 4-entry recipe table. Each spawn copies recipe fields
and prints the result. This is how production games add content.

## What Breaks Without This

Without multi-recipe spawning:
- Each entity type needs a custom spawn function
- Rebalancing requires code changes, not data edits
- Modding is impossible without source access

## The Fix

4-entry RECIPES table. spawnFromRecipe copies fields and prints.
Spawn 4 entities at different positions.

## Key Concepts

- **Multi-type table**: goblin, skeleton, dragon, ghost
- **Position + stats**: recipe defines stats, caller defines position
- **Structured output**: SPAWN|name|hp|dmg|behavior|pos for verification
- **active_count tracking**: grows with each spawn

## Performance Insight

4 spawns: 4 array lookups + 20 field copies. Under 100 nanoseconds.

## Memory Insight

4 recipes × ~20 bytes = 80 bytes const. 4 entities use existing
SoA arrays. Zero additional allocation.

## Your Task

1. Write \`spawnFromRecipe\` that copies recipe fields + prints SPAWN line
2. Spawn goblin(2,3), skeleton(5,5), dragon(7,2), ghost(1,8)
3. Print SPAWNED|4 entities from recipes

## Beginner Trap

\`\`\`cpp
// BAD: forgetting to increment active_count
w.hp[idx] = r.hp;  // idx is stale if active_count not updated
\`\`\`

## Elite Insight

Production games often load recipe tables from JSON/CSV at startup.
The const array here is the in-memory representation.

## Mastery Check

You pass when all 4 SPAWN lines print correct stats and positions.`,
    starterCode: `#include <iostream>
using namespace std;

struct SpawnRecipe { const char* name; int hp; int damage; int behavior_id; };
const SpawnRecipe RECIPES[] = {{"goblin", 5, 2, 1}, {"skeleton", 8, 3, 2}, {"dragon", 20, 8, 1}, {"ghost", 3, 1, 3}};

const int MAX_E = 16;
struct World { int px[MAX_E]; int py[MAX_E]; int hp[MAX_E]; int damage[MAX_E]; int behavior_id[MAX_E]; int active_count; };

// TODO: Write spawnFromRecipe(World& w, int recipe_id, int x, int y)
// Copy recipe fields to entity arrays, print SPAWN|name|hp=H|dmg=D|behavior=B|pos=(X,Y)

int main() {
    World w = {}; w.active_count = 0;
    // TODO: Spawn goblin at (2,3), skeleton at (5,5), dragon at (7,2), ghost at (1,8)
    // TODO: Print SPAWNED|4 entities from recipes
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct SpawnRecipe { const char* name; int hp; int damage; int behavior_id; };
const SpawnRecipe RECIPES[] = {{"goblin", 5, 2, 1}, {"skeleton", 8, 3, 2}, {"dragon", 20, 8, 1}, {"ghost", 3, 1, 3}};

const int MAX_E = 16;
struct World { int px[MAX_E]; int py[MAX_E]; int hp[MAX_E]; int damage[MAX_E]; int behavior_id[MAX_E]; int active_count; };

void spawnFromRecipe(World& w, int recipe_id, int x, int y) {
    const SpawnRecipe& r = RECIPES[recipe_id];
    int idx = w.active_count++;
    w.px[idx] = x; w.py[idx] = y; w.hp[idx] = r.hp; w.damage[idx] = r.damage; w.behavior_id[idx] = r.behavior_id;
    cout << "SPAWN|" << r.name << "|hp=" << r.hp << "|dmg=" << r.damage << "|behavior=" << r.behavior_id << "|pos=(" << x << "," << y << ")" << endl;
}

int main() {
    World w = {}; w.active_count = 0;
    spawnFromRecipe(w, 0, 2, 3);
    spawnFromRecipe(w, 1, 5, 5);
    spawnFromRecipe(w, 2, 7, 2);
    spawnFromRecipe(w, 3, 1, 8);
    cout << "SPAWNED|4 entities from recipes" << endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Goblin spawned", expectedOutput: "SPAWN|goblin|hp=5|dmg=2|behavior=1|pos=(2,3)", isPattern: false },
      { id: "g2", description: "Dragon spawned", expectedOutput: "SPAWN|dragon|hp=20|dmg=8|behavior=1|pos=(7,2)", isPattern: false },
      { id: "g3", description: "Ghost spawned", expectedOutput: "SPAWN|ghost|hp=3|dmg=1|behavior=3|pos=(1,8)", isPattern: false },
      { id: "g4", description: "All spawned", expectedOutput: "SPAWNED|4 entities from recipes", isPattern: false },
    ],
    hints: [
      "spawnFromRecipe: get recipe with RECIPES[recipe_id], copy hp/damage/behavior_id to entity arrays at active_count.",
      "Use recipe_id 0=goblin, 1=skeleton, 2=dragon, 3=ghost. Positions given by caller.",
      "Print uses recipe.name for the type label. Don't forget active_count++ after each spawn.",
    ],
    estimatedMinutes: 10,
  },
};