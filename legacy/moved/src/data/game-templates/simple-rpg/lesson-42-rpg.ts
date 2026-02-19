import type { GameLessonVariant } from "@/types/game";

export const lesson42RPG: GameLessonVariant = {
  lessonId: "rpg-42-crafting",

  instructions: `# Crafting System — Recipe Workshop

## Mental Model

There is a pattern here that turns junk into treasure. Crafting is just a function: inputs in, output out. The recipe is the function signature. The inventory is the argument list. The crafted item is the return value. The magic is not in the code — it is in the data. A text file full of recipes turns raw materials into an entire equipment system.

Every crafting system ever built — Minecraft's 3x3 grid, Skyrim's smithing bench, Stardew Valley's kitchen — reduces to the same algorithm: check requirements, consume inputs, produce output. The presentation varies. The pattern does not.

## What Breaks Without This

Without crafting, items are only found or bought. The economy is one-dimensional: kill, loot, spend. Crafting adds a second dimension: collect materials, combine them, create gear. Two paths to power. Two reasons to explore. Crafting doubles the depth of the economy with one system.

## The Fix

A recipe is a struct: required items and quantities, plus a result item. The crafting function checks inventory against each requirement. If all requirements met, consume inputs, add output. Always validate before mutating.

\`\`\`cpp
bool canCraft(Recipe& recipe, string names[], int counts[], int invSize) {
    for (int r = 0; r < recipe.ingredientCount; r++) {
        int idx = findItem(names, invSize, recipe.ingredients[r]);
        if (idx < 0 || counts[idx] < recipe.quantities[r])
            return false;
    }
    return true;
}
\`\`\`

## Pattern Insight

Crafting is the Template Method pattern. The algorithm is fixed: check, consume, produce. The data varies: which inputs, how many, which output. Add a hundred recipes without touching the code. The code is the template. The data fills in the blanks.

## Scalability Insight

Adding a new recipe: one line in a text file. Adding a new material: just reference it. The system is open to extension by default. Minecraft has 600+ recipes. Same algorithm. Scale is a content problem, not a code problem.

## Your Task

Build the crafting system in the dungeon:

1. Load 3 recipes. Print \`RECIPES|loaded=3\`
2. Render 20x10 grid: @ at (1,5), !(chest) at (5,3), !(chest) at (10,3), $(craft) at (15,5). Print \`HUD|HP:100|Gold:0|Items:0\`
3. Open chest at (5,3): iron_ore x3, wood x2. Print \`CHEST|loot=iron_ore:3,wood:2\`
4. Open chest at (10,3): herb x2, water x1. Print \`CHEST|loot=herb:2,water:1\`
5. Print \`INV|iron_ore:3|wood:2|herb:2|water:1\`
6. Move to craft station. Print \`CRAFT_STATION|recipes_available=2\`
7. Craft iron_sword. Print \`CRAFTED|iron_sword|consumed=iron_ore:3,wood:2\`
8. Craft health_potion. Print \`CRAFTED|health_potion|consumed=herb:2,water:1\`
9. Print \`INV|iron_ore:0|wood:0|herb:0|water:0|iron_sword:1|health_potion:1\`
10. Print \`SCORE|175\`

## Common Mistake

Crafting in the wrong order when resources overlap. If two recipes share iron_ore, crafting order matters. Always check canCraft before each doCraft, not once at the start. The inventory changes between crafts.

## Elite Insight

Factorio's entire gameplay is crafting at scale. Every factory is a recipe running in parallel. Iron plate = iron ore + furnace. Green circuit = iron plate + copper wire. Your single-step recipes are the atoms of that graph.

## Pattern Recognition

The chest-to-crafting pipeline is the Producer-Consumer pattern. Chests produce materials, the craft station consumes them. The inventory is the buffer. This pattern appears in every resource management game.

## Skill Reinforcement

- Multi-item inventory with parallel arrays
- Recipe validation: canCraft before doCraft
- Ingredient consumption and result production
- Craft station interaction on the grid

## Mastery Check

Why check canCraft before every doCraft? Because the inventory changes between crafts. The check from before the first craft may be stale after it. Always re-validate. Stale checks are silent bugs.`,

  starterCode: `#include <iostream>
#include <string>
using namespace std;

const int MAX_INGREDIENTS = 5;
const int MAX_RECIPES = 20;
const int MAX_ITEMS = 30;

struct Recipe {
    string result;
    string ingredients[MAX_INGREDIENTS];
    int quantities[MAX_INGREDIENTS];
    int ingredientCount;
};

// TODO: Implement findItem, addItem, loadRecipes, canCraft, doCraft, printInventory

void renderGrid(int px, int py) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#';
            } else if (col == px && row == py) {
                cout << '@';
            } else if ((col == 5 && row == 3) || (col == 10 && row == 3)) {
                cout << '!';
            } else if (col == 15 && row == 5) {
                cout << '$';
            } else {
                cout << '.';
            }
        }
        cout << endl;
    }
}

int main() {
    Recipe recipes[MAX_RECIPES];
    string itemNames[MAX_ITEMS];
    int itemCounts[MAX_ITEMS];
    int itemCount = 0;
    int recipeCount = 0;

    int playerX = 1, playerY = 5;

    // TODO: Load recipes, print RECIPES|loaded=3
    // TODO: Render grid, print HUD
    // TODO: Loot chests, craft items, print inventory
    // TODO: Print SCORE|175

    return 0;
}
`,

  solutionCode: `#include <iostream>
#include <string>
using namespace std;

const int MAX_INGREDIENTS = 5;
const int MAX_RECIPES = 20;
const int MAX_ITEMS = 30;

struct Recipe {
    string result;
    string ingredients[MAX_INGREDIENTS];
    int quantities[MAX_INGREDIENTS];
    int ingredientCount;
};

int findItem(string names[], int count, string target) {
    for (int i = 0; i < count; i++) {
        if (names[i] == target) return i;
    }
    return -1;
}

int addItem(string names[], int counts[], int& itemCount, string name, int qty) {
    int idx = findItem(names, itemCount, name);
    if (idx >= 0) {
        counts[idx] += qty;
        return idx;
    }
    names[itemCount] = name;
    counts[itemCount] = qty;
    itemCount++;
    return itemCount - 1;
}

int loadRecipes(Recipe recipes[]) {
    recipes[0] = {"iron_sword", {"iron_ore", "wood"}, {3, 2}, 2};
    recipes[1] = {"health_potion", {"herb", "water"}, {2, 1}, 2};
    recipes[2] = {"steel_shield", {"iron_ore", "leather"}, {5, 2}, 2};
    return 3;
}

bool canCraft(Recipe& recipe, string names[], int counts[], int itemCount) {
    for (int r = 0; r < recipe.ingredientCount; r++) {
        int idx = findItem(names, itemCount, recipe.ingredients[r]);
        if (idx < 0 || counts[idx] < recipe.quantities[r])
            return false;
    }
    return true;
}

void doCraft(Recipe& recipe, string names[], int counts[], int& itemCount) {
    for (int r = 0; r < recipe.ingredientCount; r++) {
        int idx = findItem(names, itemCount, recipe.ingredients[r]);
        counts[idx] -= recipe.quantities[r];
    }
    addItem(names, counts, itemCount, recipe.result, 1);
}

void printInventory(string names[], int counts[], int itemCount) {
    cout << "INV";
    for (int i = 0; i < itemCount; i++) {
        cout << "|" << names[i] << ":" << counts[i];
    }
    cout << endl;
}

void renderGrid(int px, int py) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#';
            } else if (col == px && row == py) {
                cout << '@';
            } else if ((col == 5 && row == 3) || (col == 10 && row == 3)) {
                cout << '!';
            } else if (col == 15 && row == 5) {
                cout << '$';
            } else {
                cout << '.';
            }
        }
        cout << endl;
    }
}

int main() {
    Recipe recipes[MAX_RECIPES];
    string itemNames[MAX_ITEMS];
    int itemCounts[MAX_ITEMS];
    int itemCount = 0;

    int playerX = 1, playerY = 5;
    int playerHP = 100, playerGold = 0;

    int recipeCount = loadRecipes(recipes);
    cout << "RECIPES|loaded=" << recipeCount << endl;

    // === Render initial grid ===
    renderGrid(playerX, playerY);
    cout << "HUD|HP:" << playerHP << "|Gold:" << playerGold << "|Items:" << itemCount << endl;

    // === Chest 1 at (5,3) ===
    playerX = 5; playerY = 3;
    addItem(itemNames, itemCounts, itemCount, "iron_ore", 3);
    addItem(itemNames, itemCounts, itemCount, "wood", 2);
    cout << "CHEST|loot=iron_ore:3,wood:2" << endl;

    // === Chest 2 at (10,3) ===
    playerX = 10; playerY = 3;
    addItem(itemNames, itemCounts, itemCount, "herb", 2);
    addItem(itemNames, itemCounts, itemCount, "water", 1);
    cout << "CHEST|loot=herb:2,water:1" << endl;

    printInventory(itemNames, itemCounts, itemCount);

    // === Craft station at (15,5) ===
    playerX = 15; playerY = 5;
    int available = 0;
    for (int i = 0; i < recipeCount; i++) {
        if (canCraft(recipes[i], itemNames, itemCounts, itemCount)) available++;
    }
    cout << "CRAFT_STATION|recipes_available=" << available << endl;

    // Craft iron_sword
    doCraft(recipes[0], itemNames, itemCounts, itemCount);
    cout << "CRAFTED|iron_sword|consumed=iron_ore:3,wood:2" << endl;

    // Craft health_potion
    doCraft(recipes[1], itemNames, itemCounts, itemCount);
    cout << "CRAFTED|health_potion|consumed=herb:2,water:1" << endl;

    printInventory(itemNames, itemCounts, itemCount);

    cout << "SCORE|175" << endl;

    return 0;
}
`,

  tests: [
    {
      id: "g1",
      description: "Recipes loaded from data",
      expectedOutput: "RECIPES\\|loaded=3",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Iron sword crafted with correct ingredients consumed",
      expectedOutput: "CRAFTED\\|iron_sword\\|consumed=iron_ore:3,wood:2",
      isPattern: true,
    },
    {
      id: "g3",
      description: "Health potion crafted with correct ingredients consumed",
      expectedOutput: "CRAFTED\\|health_potion\\|consumed=herb:2,water:1",
      isPattern: true,
    },
  ],

  hints: [
    "loadRecipes: recipes[0] = {\"iron_sword\", {\"iron_ore\", \"wood\"}, {3, 2}, 2}; and similarly for health_potion and steel_shield.",
    "addItem: use findItem first. If found, increment count. If not, add new entry at itemCount position.",
    "At the craft station, loop through all recipes and count how many pass canCraft to get recipes_available.",
    "After crafting iron_sword, iron_ore drops from 3 to 0 and wood from 2 to 0. Then health_potion consumes herb:2 and water:1.",
    "printInventory: print INV followed by |name:count for each item in the array.",
  ],

  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

// ==============================
// RPG CORE — Lesson 42
// Crafting System: Recipe Matching
// ==============================

// === LOOT TABLE (from Lesson 41) ===
struct LootEntry {
    string enemyType;
    string item;
    int weight;
};
const int MAX_LOOT = 50;

int loadLootTable(LootEntry table[]) {
    table[0] = {"goblin", "gold", 50};
    table[1] = {"goblin", "sword", 10};
    table[2] = {"goblin", "nothing", 40};
    table[3] = {"skeleton", "bone", 30};
    table[4] = {"skeleton", "shield", 5};
    table[5] = {"skeleton", "gold", 35};
    table[6] = {"skeleton", "nothing", 30};
    return 7;
}

string rollLoot(LootEntry table[], int tableSize, string enemyType, int roll) {
    int acc = 0;
    for (int i = 0; i < tableSize; i++) {
        if (table[i].enemyType == enemyType) {
            acc += table[i].weight;
            if (roll < acc) return table[i].item;
        }
    }
    return "nothing";
}

// === CRAFTING SYSTEM (Lesson 42) ===
const int MAX_INGREDIENTS = 5;
const int MAX_RECIPES = 20;
const int MAX_ITEMS = 30;

struct Recipe {
    string result;
    string ingredients[MAX_INGREDIENTS];
    int quantities[MAX_INGREDIENTS];
    int ingredientCount;
};

int findItem(string names[], int count, string target) {
    for (int i = 0; i < count; i++) {
        if (names[i] == target) return i;
    }
    return -1;
}

int addItem(string names[], int counts[], int& itemCount, string name, int qty) {
    int idx = findItem(names, itemCount, name);
    if (idx >= 0) { counts[idx] += qty; return idx; }
    names[itemCount] = name;
    counts[itemCount] = qty;
    itemCount++;
    return itemCount - 1;
}

int loadRecipes(Recipe recipes[]) {
    recipes[0] = {"iron_sword", {"iron_ore", "wood"}, {3, 2}, 2};
    recipes[1] = {"health_potion", {"herb", "water"}, {2, 1}, 2};
    recipes[2] = {"steel_shield", {"iron_ore", "leather"}, {5, 2}, 2};
    return 3;
}

bool canCraft(Recipe& recipe, string names[], int counts[], int itemCount) {
    for (int r = 0; r < recipe.ingredientCount; r++) {
        int idx = findItem(names, itemCount, recipe.ingredients[r]);
        if (idx < 0 || counts[idx] < recipe.quantities[r]) return false;
    }
    return true;
}

void doCraft(Recipe& recipe, string names[], int counts[], int& itemCount) {
    for (int r = 0; r < recipe.ingredientCount; r++) {
        int idx = findItem(names, itemCount, recipe.ingredients[r]);
        counts[idx] -= recipe.quantities[r];
    }
    addItem(names, counts, itemCount, recipe.result, 1);
}

void printInventory(string names[], int counts[], int itemCount) {
    cout << "INV";
    for (int i = 0; i < itemCount; i++) cout << "|" << names[i] << ":" << counts[i];
    cout << endl;
}

// === GRID RENDER ===
void renderGrid(int px, int py) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) cout << '#';
            else if (col == px && row == py) cout << '@';
            else if ((col == 5 && row == 3) || (col == 10 && row == 3)) cout << '!';
            else if (col == 15 && row == 5) cout << '$';
            else cout << '.';
        }
        cout << endl;
    }
}

int main() {
    Recipe recipes[MAX_RECIPES];
    string itemNames[MAX_ITEMS];
    int itemCounts[MAX_ITEMS];
    int itemCount = 0;

    int playerX = 1, playerY = 5;
    int playerHP = 100, playerGold = 0;

    int recipeCount = loadRecipes(recipes);
    cout << "RECIPES|loaded=" << recipeCount << endl;

    renderGrid(playerX, playerY);
    cout << "HUD|HP:" << playerHP << "|Gold:" << playerGold << "|Items:" << itemCount << endl;

    // Chest 1
    playerX = 5; playerY = 3;
    addItem(itemNames, itemCounts, itemCount, "iron_ore", 3);
    addItem(itemNames, itemCounts, itemCount, "wood", 2);
    cout << "CHEST|loot=iron_ore:3,wood:2" << endl;

    // Chest 2
    playerX = 10; playerY = 3;
    addItem(itemNames, itemCounts, itemCount, "herb", 2);
    addItem(itemNames, itemCounts, itemCount, "water", 1);
    cout << "CHEST|loot=herb:2,water:1" << endl;

    printInventory(itemNames, itemCounts, itemCount);

    // Craft station
    playerX = 15; playerY = 5;
    int available = 0;
    for (int i = 0; i < recipeCount; i++) {
        if (canCraft(recipes[i], itemNames, itemCounts, itemCount)) available++;
    }
    cout << "CRAFT_STATION|recipes_available=" << available << endl;

    doCraft(recipes[0], itemNames, itemCounts, itemCount);
    cout << "CRAFTED|iron_sword|consumed=iron_ore:3,wood:2" << endl;

    doCraft(recipes[1], itemNames, itemCounts, itemCount);
    cout << "CRAFTED|health_potion|consumed=herb:2,water:1" << endl;

    printInventory(itemNames, itemCounts, itemCount);

    cout << "SCORE|175" << endl;
    return 0;
}
`,
};
