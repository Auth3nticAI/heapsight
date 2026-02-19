import type { GameLessonVariant } from "@/types/game";

export const lesson41RPG: GameLessonVariant = {
  lessonId: "rpg-41-loot-tables",

  instructions: `# Loot Tables — Weighted Random Drops

## Mental Model

There is a pattern here that separates amateur RPGs from professional ones. A loot table is a weighted coin flip. The goblin does not choose to drop gold — the data does. You have a bag of outcomes, each with a weight. Roll a random number, walk the table accumulating weights, stop when you pass the roll. One function, infinite content.

Every loot system ever built — Diablo, Path of Exile, Borderlands — reduces to this: a list of items with weights, a roll, and an accumulator. The presentation varies (fountains of legendary loot, dramatic chest openings). The algorithm does not.

## What Breaks Without This

Without loot tables, every enemy drop is hardcoded. Add a new item? Edit code. Change drop rates? Edit code and recompile. Balance the economy? Edit fifty if-else branches. Loot tables decouple content from code. Designers edit a text file. The game changes without touching a compiler.

## The Fix

A loot table is an array of entries: enemy type, item name, weight. To roll: filter entries by enemy type, accumulate weights, return the item where the roll falls. The algorithm is universal.

\`\`\`cpp
string rollLoot(LootEntry table[], int size, string enemyType, int roll) {
    int acc = 0;
    for (int i = 0; i < size; i++) {
        if (table[i].enemyType == enemyType) {
            acc += table[i].weight;
            if (roll < acc) return table[i].item;
        }
    }
    return "nothing";
}
\`\`\`

## Pattern Insight

The loot table is the Strategy pattern. The selection algorithm stays fixed. The data varies. Ship a hundred enemy types with a hundred loot tables, and rollLoot never changes. One function, infinite content. Data-driven design at its purest.

## Scalability Insight

Adding a new enemy type: add rows to the text file. Adding a new item: add one more row. Changing drop rates: edit a number. None of these require recompilation. Minecraft, Terraria, Path of Exile — all data-driven loot. Your loot.txt is the seed of that pipeline.

## Your Task

Build the loot table system integrated into dungeon combat:

1. Load loot table (7 entries), print \`LOOT_TABLE|loaded=7\`
2. Render 20x10 grid: @ at (3,5), E(goblin) at (8,3), E(skeleton) at (14,3). Print \`HUD|HP:100|Gold:0|Room:0\`
3. Move to (7,3), attack goblin (HP:30, 3x10dmg). On death, roll=25 -> gold. Print \`LOOT|goblin|roll=25|drop=gold\`
4. Pickup gold (+25). Print \`Picked up gold! Total: 25\`
5. Move to (13,3), attack skeleton (HP:40, 4x10dmg). On death, roll=32 -> shield. Print \`LOOT|skeleton|roll=32|drop=shield\`
6. Print \`INVENTORY|gold:25|shield:1\`
7. Print \`SCORE|150\`

## Common Mistake

Rolling against the wrong total weight. Goblin entries sum to 100. Skeleton entries sum to 100. If you roll against the combined 200, every roll hits goblin entries first and skeleton entries never get reached. Filter by enemy type before accumulating.

## Elite Insight

Diablo II's loot uses this exact algorithm with three layers: base item table, magic prefix table, magic suffix table. Each layer is an independent weighted roll. Your single-layer table is the foundation. Adding layers is adding more rolls.

## Pattern Recognition

The weighted random selection algorithm appears everywhere: gacha pulls, card pack openings, roguelike room generation, procedural biome selection. One of the most reused patterns in all of game development.

## Skill Reinforcement

- File I/O simulation: loading structured data into struct arrays
- Weighted random: accumulator-based selection with type filtering
- Data-driven design: behavior changes via data, not code
- Multi-entity loot: different enemy types, different tables

## Mastery Check

Why weights instead of percentages? Weights are composable. Add a new item with weight 20 and all existing probabilities adjust proportionally. With percentages, adding an item means recalculating every other entry to sum to 100. Weights self-normalize. Percentages are fragile.`,

  starterCode: `#include <iostream>
#include <string>
using namespace std;

struct LootEntry {
    string enemyType;
    string item;
    int weight;
};

const int MAX_LOOT = 50;

// TODO: Implement loadLootTable — hardcode 7 entries, return count
// TODO: Implement rollLoot — filter by enemyType, accumulate, return item

void renderGrid(int px, int py,
                int ex1, int ey1, bool e1alive,
                int ex2, int ey2, bool e2alive,
                bool goldActive, int gx, int gy) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#';
            } else if (col == px && row == py) {
                cout << '@';
            } else if (e1alive && col == ex1 && row == ey1) {
                cout << 'E';
            } else if (e2alive && col == ex2 && row == ey2) {
                cout << 'E';
            } else if (goldActive && col == gx && row == gy) {
                cout << 'G';
            } else {
                cout << '.';
            }
        }
        cout << endl;
    }
}

int main() {
    LootEntry table[MAX_LOOT];
    int tableSize = 0;

    int playerX = 3, playerY = 5;
    int playerHP = 100, playerGold = 0;
    int shields = 0;

    int gob_x = 8, gob_y = 3, gob_hp = 30;
    bool gob_alive = true;

    int skel_x = 14, skel_y = 3, skel_hp = 40;
    bool skel_alive = true;

    bool goldActive = false;
    int goldX = 0, goldY = 0;

    // TODO: Load loot table, print LOOT_TABLE|loaded=7

    // TODO: Render grid, print HUD

    // TODO: Move to (7,3), attack goblin, roll loot

    // TODO: Pickup gold at (8,3)

    // TODO: Move to (13,3), attack skeleton, roll loot

    // TODO: Print INVENTORY|gold:25|shield:1

    // TODO: Print SCORE|150

    return 0;
}
`,

  solutionCode: `#include <iostream>
#include <string>
using namespace std;

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
            if (roll < acc) {
                return table[i].item;
            }
        }
    }
    return "nothing";
}

void renderGrid(int px, int py,
                int ex1, int ey1, bool e1alive,
                int ex2, int ey2, bool e2alive,
                bool goldActive, int gx, int gy) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#';
            } else if (col == px && row == py) {
                cout << '@';
            } else if (e1alive && col == ex1 && row == ey1) {
                cout << 'E';
            } else if (e2alive && col == ex2 && row == ey2) {
                cout << 'E';
            } else if (goldActive && col == gx && row == gy) {
                cout << 'G';
            } else {
                cout << '.';
            }
        }
        cout << endl;
    }
}

int main() {
    LootEntry table[MAX_LOOT];

    int playerX = 3, playerY = 5;
    int playerHP = 100, playerGold = 0;
    int shields = 0;

    int gob_x = 8, gob_y = 3, gob_hp = 30;
    bool gob_alive = true;

    int skel_x = 14, skel_y = 3, skel_hp = 40;
    bool skel_alive = true;

    bool goldActive = false;
    int goldX = 0, goldY = 0;

    // === Load Loot Table ===
    int tableSize = loadLootTable(table);
    cout << "LOOT_TABLE|loaded=" << tableSize << endl;

    // === Render Room 0 ===
    renderGrid(playerX, playerY,
               gob_x, gob_y, gob_alive,
               skel_x, skel_y, skel_alive,
               goldActive, goldX, goldY);
    cout << "HUD|HP:" << playerHP << "|Gold:" << playerGold << "|Room:0" << endl;

    // === Move to adjacent goblin, attack ===
    playerX = 7; playerY = 3;
    cout << "Player moved to (7,3)" << endl;

    int damage = 10;
    for (int i = 0; i < 3; i++) {
        gob_hp -= damage;
        cout << "Attack! Enemy HP: " << gob_hp << endl;
        if (gob_hp <= 0 && gob_alive) {
            gob_alive = false;
        }
    }
    cout << "Enemy defeated!" << endl;

    string drop = rollLoot(table, tableSize, "goblin", 25);
    cout << "LOOT|goblin|roll=25|drop=" << drop << endl;

    // === Spawn and pickup gold ===
    goldActive = true;
    goldX = gob_x; goldY = gob_y;
    playerX = 8; playerY = 3;
    if (playerX == goldX && playerY == goldY && goldActive) {
        playerGold += 25;
        goldActive = false;
    }
    cout << "Picked up gold! Total: " << playerGold << endl;

    // === Move to adjacent skeleton, attack ===
    playerX = 13; playerY = 3;
    cout << "Player moved to (13,3)" << endl;

    for (int i = 0; i < 4; i++) {
        skel_hp -= damage;
        cout << "Attack! Enemy HP: " << skel_hp << endl;
        if (skel_hp <= 0 && skel_alive) {
            skel_alive = false;
        }
    }
    cout << "Enemy defeated!" << endl;

    drop = rollLoot(table, tableSize, "skeleton", 32);
    cout << "LOOT|skeleton|roll=32|drop=" << drop << endl;
    shields = 1;

    // === Inventory ===
    cout << "INVENTORY|gold:" << playerGold << "|shield:" << shields << endl;

    cout << "SCORE|150" << endl;

    return 0;
}
`,

  tests: [
    {
      id: "g1",
      description: "Loot table loads 7 entries",
      expectedOutput: "LOOT_TABLE\\|loaded=7",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Goblin drops gold on roll=25",
      expectedOutput: "LOOT\\|goblin\\|roll=25\\|drop=gold",
      isPattern: true,
    },
    {
      id: "g3",
      description: "Skeleton drops shield on roll=32",
      expectedOutput: "LOOT\\|skeleton\\|roll=32\\|drop=shield",
      isPattern: true,
    },
  ],

  hints: [
    "loadLootTable: assign 7 entries. Goblin: gold/50, sword/10, nothing/40. Skeleton: bone/30, shield/5, gold/35, nothing/30. Return 7.",
    "rollLoot: filter by enemyType, accumulate weight. When roll < acc, return that item. The key is the strict less-than check.",
    "For skeleton roll=32: bone weight=30 (acc=30, 32>=30 skip), shield weight=5 (acc=35, 32<35 hit) -> shield.",
    "After goblin dies, set goldActive=true, goldX=gob_x, goldY=gob_y. Move player to gold position, check pickup condition.",
    "The pickup check: playerX==goldX && playerY==goldY && goldActive. Set goldActive=false after collection.",
  ],

  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

// ==============================
// RPG CORE — Lesson 41
// Loot Tables: Weighted Random Drops
// ==============================

// === LOOT TABLE SYSTEM ===
struct LootEntry {
    string enemyType;
    string item;
    int weight;
};

const int MAX_LOOT = 50;

int loadLootTable(LootEntry table[]) {
    // Data-driven: simulating load from data/loot.txt
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
            if (roll < acc) {
                return table[i].item;
            }
        }
    }
    return "nothing";
}

// === GRID RENDER ===
void renderGrid(int px, int py,
                int ex1, int ey1, bool e1alive,
                int ex2, int ey2, bool e2alive,
                bool goldActive, int gx, int gy) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#';
            } else if (col == px && row == py) {
                cout << '@';
            } else if (e1alive && col == ex1 && row == ey1) {
                cout << 'E';
            } else if (e2alive && col == ex2 && row == ey2) {
                cout << 'E';
            } else if (goldActive && col == gx && row == gy) {
                cout << 'G';
            } else {
                cout << '.';
            }
        }
        cout << endl;
    }
}

int main() {
    LootEntry table[MAX_LOOT];

    int playerX = 3, playerY = 5;
    int playerHP = 100, playerGold = 0;
    int shields = 0;

    int gob_x = 8, gob_y = 3, gob_hp = 30;
    bool gob_alive = true;

    int skel_x = 14, skel_y = 3, skel_hp = 40;
    bool skel_alive = true;

    bool goldActive = false;
    int goldX = 0, goldY = 0;

    // === Load Loot Table ===
    int tableSize = loadLootTable(table);
    cout << "LOOT_TABLE|loaded=" << tableSize << endl;

    // === Render Room 0 ===
    renderGrid(playerX, playerY,
               gob_x, gob_y, gob_alive,
               skel_x, skel_y, skel_alive,
               goldActive, goldX, goldY);
    cout << "HUD|HP:" << playerHP << "|Gold:" << playerGold << "|Room:0" << endl;

    // === Fight Goblin ===
    playerX = 7; playerY = 3;
    cout << "Player moved to (7,3)" << endl;
    int damage = 10;
    for (int i = 0; i < 3; i++) {
        gob_hp -= damage;
        cout << "Attack! Enemy HP: " << gob_hp << endl;
        if (gob_hp <= 0 && gob_alive) gob_alive = false;
    }
    cout << "Enemy defeated!" << endl;

    string drop = rollLoot(table, tableSize, "goblin", 25);
    cout << "LOOT|goblin|roll=25|drop=" << drop << endl;

    goldActive = true; goldX = gob_x; goldY = gob_y;
    playerX = 8; playerY = 3;
    if (playerX == goldX && playerY == goldY && goldActive) {
        playerGold += 25;
        goldActive = false;
    }
    cout << "Picked up gold! Total: " << playerGold << endl;

    // === Fight Skeleton ===
    playerX = 13; playerY = 3;
    cout << "Player moved to (13,3)" << endl;
    for (int i = 0; i < 4; i++) {
        skel_hp -= damage;
        cout << "Attack! Enemy HP: " << skel_hp << endl;
        if (skel_hp <= 0 && skel_alive) skel_alive = false;
    }
    cout << "Enemy defeated!" << endl;

    drop = rollLoot(table, tableSize, "skeleton", 32);
    cout << "LOOT|skeleton|roll=32|drop=" << drop << endl;
    shields = 1;

    cout << "INVENTORY|gold:" << playerGold << "|shield:" << shields << endl;
    cout << "SCORE|150" << endl;

    return 0;
}
`,
};
