import type { GameLessonVariant } from "@/types/game";

export const lesson31RPG: GameLessonVariant = {
  lessonId: "rpg-31-component-pattern",

  instructions: `# Component Pattern — Flexible Entities

## Mental Model

There's a pattern here. The monolithic Entity struct is dead. Long live components. An entity is just an ID — a number — wearing whatever components it needs. Entity 0 wears Position, Stats, and Inventory. That makes it a player. Entity 2 wears Position and Inventory. That makes it a gold pile. Same system, different costumes.

The component pattern replaces inheritance with composition. Instead of "a Warrior IS-A Entity," you say "Entity 0 HAS-A position, HAS-A stats, HAS-A inventory." The HAS-A approach is more flexible because you can mix and match at will. No class hierarchy. No diamond inheritance. Just data and flags.

## What Breaks Without This

Without components, every entity is a blob. A gold pile carries an attack field set to 0. A wall carries an inventory field set to empty. The struct is a universal bucket that wastes space and creates bugs. Someone queries \`entity.attack > 0\` to find combatants, and the wall sneaks in because its attack defaulted to 1 during a test. Monolithic structs make everything look the same.

## The Fix

Split the blob into focused structs. Boolean mask arrays say which entities have which components. Systems only process entities whose masks are set.

\`\`\`cpp
struct PositionComponent { int x, y; };
struct StatsComponent { int hp, maxHp, attack; };
struct AIComponent { int aiType; };
struct InventoryComponent { int gold; };

bool hasStats[MAX_ENTITIES] = {};
bool hasAI[MAX_ENTITIES] = {};
bool hasInventory[MAX_ENTITIES] = {};
\`\`\`

## Pattern Insight

This is the Component pattern. Unity uses it. Unreal uses it. Every major engine converged on this idea because the combinatorial explosion of entity types cannot be expressed as a class hierarchy. Two axes of variation (faction x combat style) produce 2x3=6 classes with inheritance, or 2+3=5 components with composition. Components scale additively. Hierarchies scale multiplicatively.

## Scalability Insight

Adding a new component type means adding one struct and one boolean array. Zero existing code changes. Want poison? Add \`struct PoisonComponent { int dmg, turns; };\` and \`bool hasPoison[]\`. Every system that does not care about poison ignores it. Growth by addition, never modification. That is the Open-Closed Principle.

## Your Task

Build the full component-based entity system with 3 entities:
- Entity 0 (Player): Position(3,5), Stats(100,100,10), Inventory(0 gold)
- Entity 1 (Enemy): Position(10,3), Stats(30,30,5), AI(chase)
- Entity 2 (Gold Pile): Position(15,7), Inventory(25 gold)

Print component reports, render the grid, show HUD, attack Entity 1, and print the component summary.

## Common Mistake

Printing components out of order. The convention is Position, Stats, AI, Inventory. Always. If you swap AI and Stats in the output, the test pattern will not match. Conventions are contracts between systems.

## Elite Insight

You do not need a full Entity-Component-System framework to use the component pattern. Structs, arrays, and boolean masks give you 80% of the flexibility for 20% of the complexity. Ship with this. Only refactor to a full ECS when the architecture genuinely demands it.

## Pattern Recognition

Use components when entity types multiply. If you are creating \`PlayerWarrior\`, \`PlayerMage\`, \`EnemyWarrior\`, \`EnemyMage\` — stop. Two components (Faction, CombatStyle) replace four classes. Components compose. Classes cascade.

## Skill Reinforcement

- Parallel arrays from Lesson 14: one array per component type
- Boolean masks from Lesson 8: presence flags determine capabilities
- Entity management from Lesson 16: entities as indices
- Grid rendering from Lesson 3: position data drives the display

## Mastery Check

Why boolean masks instead of sentinel values? Because \`hasStats[i]\` is always true or false. \`stats[i].hp != -1\` requires every system to agree that -1 means "absent." Masks are contracts. Sentinels are assumptions. Assumptions break at 3 AM.`,

  starterCode: `#include <iostream>
using namespace std;

struct PositionComponent { int x, y; };
struct StatsComponent { int hp, maxHp, attack; };
struct AIComponent { int aiType; };
struct InventoryComponent { int gold; };

const int MAX_ENTITIES = 20;

PositionComponent positions[MAX_ENTITIES];
StatsComponent stats[MAX_ENTITIES];
AIComponent ai[MAX_ENTITIES];
InventoryComponent inventory[MAX_ENTITIES];

bool hasStats[MAX_ENTITIES] = {};
bool hasAI[MAX_ENTITIES] = {};
bool hasInventory[MAX_ENTITIES] = {};

int main() {
    // TODO: Set up Entity 0 (Player)
    //   position (3,5), stats (100,100,10), inventory (0), no AI

    // TODO: Set up Entity 1 (Enemy)
    //   position (10,3), stats (30,30,5), AI type 1, no inventory

    // TODO: Set up Entity 2 (Gold Pile)
    //   position (15,7), no stats, no AI, inventory 25

    int entityCount = 3;

    // TODO: Print entity component reports

    // TODO: Render 20x10 grid

    // TODO: Print HUD

    // TODO: Combat — player attacks entity 1

    // TODO: Print COMPONENT_SYSTEM summary

    return 0;
}
`,

  solutionCode: `#include <iostream>
using namespace std;

struct PositionComponent { int x, y; };
struct StatsComponent { int hp, maxHp, attack; };
struct AIComponent { int aiType; };
struct InventoryComponent { int gold; };

const int MAX_ENTITIES = 20;

PositionComponent positions[MAX_ENTITIES];
StatsComponent stats[MAX_ENTITIES];
AIComponent ai[MAX_ENTITIES];
InventoryComponent inventory[MAX_ENTITIES];

bool hasStats[MAX_ENTITIES] = {};
bool hasAI[MAX_ENTITIES] = {};
bool hasInventory[MAX_ENTITIES] = {};

int main() {
    // Entity 0: Player
    positions[0] = {3, 5};
    stats[0] = {100, 100, 10};
    hasStats[0] = true;
    inventory[0] = {0};
    hasInventory[0] = true;

    // Entity 1: Enemy
    positions[1] = {10, 3};
    stats[1] = {30, 30, 5};
    hasStats[1] = true;
    ai[1] = {1};
    hasAI[1] = true;

    // Entity 2: Gold Pile
    positions[2] = {15, 7};
    inventory[2] = {25};
    hasInventory[2] = true;

    int entityCount = 3;

    // Component reports
    for (int i = 0; i < entityCount; i++) {
        cout << "Entity " << i << ": Position(" << positions[i].x << "," << positions[i].y << ")";
        if (hasStats[i]) {
            cout << " Stats(" << stats[i].hp << "/" << stats[i].maxHp << ",atk=" << stats[i].attack << ")";
        }
        if (hasAI[i]) {
            string aiName = "none";
            if (ai[i].aiType == 1) aiName = "chase";
            if (ai[i].aiType == 2) aiName = "patrol";
            cout << " AI(" << aiName << ")";
        }
        if (hasInventory[i]) {
            cout << " Inventory(gold=" << inventory[i].gold << ")";
        }
        cout << endl;
    }

    // Render grid
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#';
            } else {
                bool drawn = false;
                for (int i = 0; i < entityCount; i++) {
                    if (positions[i].x == col && positions[i].y == row) {
                        if (i == 0) { cout << '@'; drawn = true; break; }
                        else if (hasAI[i]) { cout << 'E'; drawn = true; break; }
                        else if (hasInventory[i] && !hasStats[i]) { cout << 'G'; drawn = true; break; }
                    }
                }
                if (!drawn) cout << '.';
            }
        }
        cout << endl;
    }

    // HUD
    cout << "HUD|HP:" << stats[0].hp << "|Gold:" << inventory[0].gold << "|Room:0" << endl;

    // Combat
    stats[1].hp -= stats[0].attack;
    cout << "Attack! Entity 1 HP: " << stats[1].hp << endl;

    // Summary
    int withStats = 0, withAI = 0, withInv = 0;
    for (int i = 0; i < entityCount; i++) {
        if (hasStats[i]) withStats++;
        if (hasAI[i]) withAI++;
        if (hasInventory[i]) withInv++;
    }
    cout << "COMPONENT_SYSTEM|entities=" << entityCount
         << "|with_stats=" << withStats
         << "|with_ai=" << withAI
         << "|with_inventory=" << withInv << endl;

    return 0;
}
`,

  tests: [
    {
      id: "g1",
      description: "Entity 0 component report shows player with stats and inventory",
      expectedOutput: "Entity 0: Position\\(3,5\\) Stats\\(100/100,atk=10\\) Inventory\\(gold=0\\)",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Entity 1 component report shows enemy with AI",
      expectedOutput: "Entity 1: Position\\(10,3\\) Stats\\(30/30,atk=5\\) AI\\(chase\\)",
      isPattern: true,
    },
    {
      id: "g3",
      description: "Entity 2 component report shows gold pile",
      expectedOutput: "Entity 2: Position\\(15,7\\) Inventory\\(gold=25\\)",
      isPattern: true,
    },
    {
      id: "g4",
      description: "Grid renders with wall borders",
      expectedOutput: "####################",
      isPattern: true,
    },
    {
      id: "g5",
      description: "HUD shows initial player state",
      expectedOutput: "HUD\\|HP:100\\|Gold:0\\|Room:0",
      isPattern: true,
    },
    {
      id: "g6",
      description: "Combat reduces entity 1 HP by player attack",
      expectedOutput: "Attack! Entity 1 HP: 20",
      isPattern: true,
    },
    {
      id: "g7",
      description: "Component system summary is correct",
      expectedOutput: "COMPONENT_SYSTEM\\|entities=3\\|with_stats=2\\|with_ai=1\\|with_inventory=2",
      isPattern: true,
    },
  ],

  hints: [
    "Set each entity with aggregate initialization: `positions[0] = {3, 5};` then set mask flags like `hasStats[0] = true;`.",
    "Component report order: Position first (always), then Stats, AI, Inventory. Only print if the mask flag is true.",
    "Grid glyphs: Entity 0 = @, hasAI entities = E, hasInventory && !hasStats entities = G.",
    "Combat: `stats[1].hp -= stats[0].attack;` gives 30-10=20.",
    "Summary: loop entityCount, count trues in each mask array.",
  ],

  accumulatedCode: `#include <iostream>
using namespace std;

// ==============================
// RPG CORE — Lesson 31
// Component Pattern: Composition Over Inheritance
// An entity is just an ID wearing components.
// ==============================

// === COMPONENTS ===
struct PositionComponent { int x, y; };
struct StatsComponent { int hp, maxHp, attack; };
struct AIComponent { int aiType; }; // 0=none, 1=chase, 2=patrol
struct InventoryComponent { int gold; };

const int MAX_ENTITIES = 20;

// === COMPONENT ARRAYS ===
PositionComponent positions[MAX_ENTITIES];
StatsComponent stats[MAX_ENTITIES];
AIComponent ai[MAX_ENTITIES];
InventoryComponent inventory[MAX_ENTITIES];

// === COMPONENT MASKS ===
bool hasStats[MAX_ENTITIES] = {};
bool hasAI[MAX_ENTITIES] = {};
bool hasInventory[MAX_ENTITIES] = {};

// === GRID RENDER ===
void renderGrid(int entityCount) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#';
            } else {
                bool drawn = false;
                for (int i = 0; i < entityCount; i++) {
                    if (positions[i].x == col && positions[i].y == row) {
                        if (i == 0) { cout << '@'; drawn = true; break; }
                        else if (hasAI[i]) { cout << 'E'; drawn = true; break; }
                        else if (hasInventory[i] && !hasStats[i]) { cout << 'G'; drawn = true; break; }
                    }
                }
                if (!drawn) cout << '.';
            }
        }
        cout << endl;
    }
}

int main() {
    // Entity 0: Player
    positions[0] = {3, 5};
    stats[0] = {100, 100, 10};
    hasStats[0] = true;
    inventory[0] = {0};
    hasInventory[0] = true;

    // Entity 1: Enemy
    positions[1] = {10, 3};
    stats[1] = {30, 30, 5};
    hasStats[1] = true;
    ai[1] = {1};
    hasAI[1] = true;

    // Entity 2: Gold Pile
    positions[2] = {15, 7};
    inventory[2] = {25};
    hasInventory[2] = true;

    int entityCount = 3;

    // Component reports
    for (int i = 0; i < entityCount; i++) {
        cout << "Entity " << i << ": Position(" << positions[i].x << "," << positions[i].y << ")";
        if (hasStats[i]) {
            cout << " Stats(" << stats[i].hp << "/" << stats[i].maxHp << ",atk=" << stats[i].attack << ")";
        }
        if (hasAI[i]) {
            string aiName = "none";
            if (ai[i].aiType == 1) aiName = "chase";
            if (ai[i].aiType == 2) aiName = "patrol";
            cout << " AI(" << aiName << ")";
        }
        if (hasInventory[i]) {
            cout << " Inventory(gold=" << inventory[i].gold << ")";
        }
        cout << endl;
    }

    // Grid
    renderGrid(entityCount);

    // HUD
    cout << "HUD|HP:" << stats[0].hp << "|Gold:" << inventory[0].gold << "|Room:0" << endl;

    // Combat
    stats[1].hp -= stats[0].attack;
    cout << "Attack! Entity 1 HP: " << stats[1].hp << endl;

    // Summary
    int withStats = 0, withAI = 0, withInv = 0;
    for (int i = 0; i < entityCount; i++) {
        if (hasStats[i]) withStats++;
        if (hasAI[i]) withAI++;
        if (hasInventory[i]) withInv++;
    }
    cout << "COMPONENT_SYSTEM|entities=" << entityCount
         << "|with_stats=" << withStats
         << "|with_ai=" << withAI
         << "|with_inventory=" << withInv << endl;

    return 0;
}
`,
};
