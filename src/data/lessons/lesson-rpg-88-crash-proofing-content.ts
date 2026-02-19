import { Lesson } from "@/types/lesson";

export const lessonRPG88: Lesson = {
  id: "rpg-88-crash-proofing-content",
  title: "Crash-Proofing Content",
  description: "Validate data at load time. Out-of-range values get clamped to safe defaults instead of crashing the game.",
  order: 88,
  xpReward: 100,
  tier: "pro",
  concepts: ["defensive parsing", "data validation", "safe defaults", "crash prevention", "input sanitization"],
  part1: {
    title: "Concept: Defensive Data Loading",
    type: "concept",
    instructions: `# Crash-Proofing Content

## Mental Model

Your data tables work perfectly — until someone puts enemy_hp = -5
or spawn_count = 9999 in a content file. Without validation, negative
HP creates immortal enemies and massive spawn counts eat your pool.
Fix: validate and clamp at load time. Never crash. Clamp to safe
range, set valid = false, continue. Report problems without halting.

## What Breaks Without This

Without data validation:
- Negative HP creates immortal enemies
- Huge spawn counts exhaust the entity pool
- The game doesn't crash — it becomes unplayable
- Bad content silently corrupts game state

## The Fix

Validate each field against a safe range. Clamp and flag:

\`\`\`cpp
ValidatedRecipe validateRecipe(const char* name, int hp, int dmg, int count) {
    ValidatedRecipe r;
    r.name = name; r.valid = true;
    r.hp = hp;
    if (r.hp < 1) { r.hp = 1; r.valid = false; }
    if (r.hp > 100) { r.hp = 100; r.valid = false; }
    // ... same for damage [0,50] and count [1,10]
    return r;
}
\`\`\`

## Key Concepts

- **Clamp-and-continue**: never crash, always produce usable data
- **valid flag**: marks whether any field was clamped
- **Load-time validation**: validate once, trust data in game loop
- **Range constants**: HP [1,100], damage [0,50], count [1,10]

## Performance Insight

Validation runs once at startup, not per-tick. A few comparisons
cost microseconds. The game loop never checks validity — it trusts
the validated data.

## Memory Insight

Adding a bool valid flag costs 1 byte (padded to 4). The tradeoff:
4 bytes of diagnostic data prevents crashes that would corrupt
entire game state.

## Your Task

Write validateRecipe that clamps HP to [1,100]. Test with a valid
recipe (hp=5) and an invalid one (hp=-5). Print the results.

## Beginner Trap

\`\`\`cpp
// BAD: Assert and crash on bad data
assert(hp > 0 && "Invalid HP!");  // Crashes in release builds!
// FIX: Clamp and warn
if (hp < 1) { hp = 1; valid = false; }
\`\`\`

## Elite Insight

Valve's Source Engine validates every entity property at load time.
Invalid values get clamped to engine-defined ranges. The game never
crashes from bad map data — it degrades gracefully.

## Systems Thinking Connection

Validation sits between content loading (L80) and the game loop.
Content packs pass through validateRecipe before entering the
recipe table. Untrusted data never reaches gameplay systems.

## Skill Reinforcement

- Struct design from L11
- Content packs from L80
- Error handling from L39

## Mastery Check

You pass when CLAMP_TEST shows hp=-5 clamped to hp=1 with
status=CLAMPED.`,
    starterCode: `#include <iostream>
using namespace std;

struct ValidatedRecipe { const char* name; int hp; int damage; int spawn_count; bool valid; };

// TODO: Write validateRecipe(const char* name, int hp, int dmg, int count)
// Clamp hp to [1,100], damage to [0,50], spawn_count to [1,10]
// Set valid=false if any clamping occurred

int main() {
    // TODO: Validate goblin(5, 2, 3) — should be OK
    // TODO: Validate broken(-5, 60, 0) — should be CLAMPED
    // Print CLAMP_TEST|name|hp=H|dmg=D|count=C|status
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct ValidatedRecipe { const char* name; int hp; int damage; int spawn_count; bool valid; };

ValidatedRecipe validateRecipe(const char* name, int hp, int dmg, int count) {
    ValidatedRecipe r;
    r.name = name; r.valid = true;
    r.hp = hp;
    if (r.hp < 1) { r.hp = 1; r.valid = false; }
    if (r.hp > 100) { r.hp = 100; r.valid = false; }
    r.damage = dmg;
    if (r.damage < 0) { r.damage = 0; r.valid = false; }
    if (r.damage > 50) { r.damage = 50; r.valid = false; }
    r.spawn_count = count;
    if (r.spawn_count < 1) { r.spawn_count = 1; r.valid = false; }
    if (r.spawn_count > 10) { r.spawn_count = 10; r.valid = false; }
    return r;
}

int main() {
    ValidatedRecipe g = validateRecipe("goblin", 5, 2, 3);
    cout << "CLAMP_TEST|" << g.name << "|hp=" << g.hp << "|dmg=" << g.damage
         << "|count=" << g.spawn_count << "|" << (g.valid ? "OK" : "CLAMPED") << endl;
    ValidatedRecipe b = validateRecipe("broken", -5, 60, 0);
    cout << "CLAMP_TEST|" << b.name << "|hp=" << b.hp << "|dmg=" << b.damage
         << "|count=" << b.spawn_count << "|" << (b.valid ? "OK" : "CLAMPED") << endl;
    return 0;
}`,
    tests: [
      { id: "t1", description: "Valid goblin passes", expectedOutput: "CLAMP_TEST|goblin|hp=5|dmg=2|count=3|OK", isPattern: false },
      { id: "t2", description: "Broken recipe clamped", expectedOutput: "CLAMP_TEST|broken|hp=1|dmg=50|count=1|CLAMPED", isPattern: false },
    ],
    hints: [
      "Check each field: if hp < 1, set to 1 and valid = false. Same for upper bounds.",
      "broken has hp=-5 (clamp to 1), dmg=60 (clamp to 50), count=0 (clamp to 1).",
      "Use ternary: r.valid ? 'OK' : 'CLAMPED' for the status string.",
    ],
    estimatedMinutes: 6,
  },
  part2: {
    title: "Build: Content Validation Pipeline",
    type: "game_builder",
    instructions: `# Build: Content Validation Pipeline

## Mental Model

Part 1 proved single-recipe validation. Now validate 5 recipes in
a batch — 3 valid, 2 with out-of-range values. Track how many pass
vs how many get clamped. This is the load-time validation pipeline
that production games run before entering the game loop.

## What Breaks Without This

Without batch validation:
- One bad entry in a content pack can ruin the entire game
- No summary of data quality after loading
- Can't distinguish "mostly valid" from "totally corrupt" data

## The Fix

Loop through all recipes, validate each, count OK vs CLAMPED.
Print per-recipe results and a summary line.

## Key Concepts

- **Batch validation**: process all recipes in a loop
- **Counting**: track valid_count and clamped_count separately
- **Structured output**: VALIDATE|name|...|status per recipe
- **Summary line**: CRASHPROOF|valid=V|clamped=C|total=N

## Performance Insight

5 recipes, 3 range checks each = 15 comparisons. Under 1 microsecond.
This runs once at load time, never during gameplay.

## Memory Insight

5 ValidatedRecipe structs on the stack (~100 bytes total). The
validation loop allocates nothing on the heap.

## Your Task

1. Write validateRecipe with full clamping (HP, damage, count)
2. Validate 5 recipes: goblin, skeleton, dragon, broken, overflow
3. Print VALIDATE|...|OK or CLAMPED for each
4. Print CRASHPROOF|valid=3|clamped=2|total=5

## Beginner Trap

\`\`\`cpp
// BAD: Stopping on first invalid recipe
if (!r.valid) return; // Skips remaining recipes!
// FIX: Validate ALL recipes, count results, continue
\`\`\`

## Elite Insight

Unity's asset import pipeline validates every asset on import.
Invalid textures get replaced with magenta placeholders. Invalid
meshes get default boxes. The editor never crashes from bad assets.

## Mastery Check

You pass when all 5 VALIDATE lines print correctly and
CRASHPROOF shows valid=3, clamped=2, total=5.`,
    starterCode: `#include <iostream>
using namespace std;

struct ValidatedRecipe { const char* name; int hp; int damage; int spawn_count; bool valid; };

// TODO: Write validateRecipe(const char* name, int hp, int dmg, int count)
// Clamp hp to [1,100], damage to [0,50], spawn_count to [1,10]
// Set valid=false if any clamping occurred

int main() {
    const char* names[] = {"goblin", "skeleton", "dragon", "broken", "overflow"};
    int hps[] = {5, 8, 20, -5, 200};
    int dmgs[] = {2, 3, 8, 60, 3};
    int counts[] = {3, 2, 4, 0, 99};
    int valid_count = 0, clamped_count = 0;
    for (int i = 0; i < 5; i++) {
        // TODO: Validate each recipe
        // TODO: Print VALIDATE|name|hp=H|dmg=D|count=C|OK or CLAMPED
        // TODO: Count valid vs clamped
    }
    // TODO: Print CRASHPROOF|valid=V|clamped=C|total=5
    return 0;
}`,
    solutionCode: `#include <iostream>
using namespace std;

struct ValidatedRecipe { const char* name; int hp; int damage; int spawn_count; bool valid; };

ValidatedRecipe validateRecipe(const char* name, int hp, int dmg, int count) {
    ValidatedRecipe r;
    r.name = name; r.valid = true;
    r.hp = hp;
    if (r.hp < 1) { r.hp = 1; r.valid = false; }
    if (r.hp > 100) { r.hp = 100; r.valid = false; }
    r.damage = dmg;
    if (r.damage < 0) { r.damage = 0; r.valid = false; }
    if (r.damage > 50) { r.damage = 50; r.valid = false; }
    r.spawn_count = count;
    if (r.spawn_count < 1) { r.spawn_count = 1; r.valid = false; }
    if (r.spawn_count > 10) { r.spawn_count = 10; r.valid = false; }
    return r;
}

int main() {
    const char* names[] = {"goblin", "skeleton", "dragon", "broken", "overflow"};
    int hps[] = {5, 8, 20, -5, 200};
    int dmgs[] = {2, 3, 8, 60, 3};
    int counts[] = {3, 2, 4, 0, 99};
    int valid_count = 0, clamped_count = 0;
    for (int i = 0; i < 5; i++) {
        ValidatedRecipe r = validateRecipe(names[i], hps[i], dmgs[i], counts[i]);
        cout << "VALIDATE|" << r.name << "|hp=" << r.hp << "|dmg=" << r.damage
             << "|count=" << r.spawn_count << "|" << (r.valid ? "OK" : "CLAMPED") << endl;
        if (r.valid) valid_count++; else clamped_count++;
    }
    cout << "CRASHPROOF|valid=" << valid_count << "|clamped=" << clamped_count << "|total=5" << endl;
    return 0;
}`,
    tests: [
      { id: "g1", description: "Valid goblin passes", expectedOutput: "VALIDATE|goblin|hp=5|dmg=2|count=3|OK", isPattern: false },
      { id: "g2", description: "Broken recipe clamped", expectedOutput: "VALIDATE|broken|hp=1|dmg=50|count=1|CLAMPED", isPattern: false },
      { id: "g3", description: "Overflow recipe clamped", expectedOutput: "VALIDATE|overflow|hp=100|dmg=3|count=10|CLAMPED", isPattern: false },
      { id: "g4", description: "Summary counts", expectedOutput: "CRASHPROOF|valid=3|clamped=2|total=5", isPattern: false },
    ],
    hints: [
      "validateRecipe checks each field against its range. If any clamp triggers, set valid=false.",
      "Use the ternary operator: r.valid ? 'OK' : 'CLAMPED' for the status string.",
      "broken has hp=-5 (clamp to 1), dmg=60 (clamp to 50), count=0 (clamp to 1). All three trigger clamping.",
    ],
    estimatedMinutes: 10,
  },
};