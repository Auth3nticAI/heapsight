import type { GameLessonVariant } from "@/types/game";

export const lesson36RPG: GameLessonVariant = {
  lessonId: "rpg-36-item-system",

  instructions: `# Item System — Data-Driven Chest Loot

## Mental Model

There is a pattern here that underpins every RPG ever made: an item is just data. Not a class. Not an object with methods. Data. A struct with fields: name, type, value, effect. The type field is a discriminator — it tells the engine how to interpret the effect. A Weapon's effect is damage. A Potion's effect is heal amount. A Key's effect is which door it opens. One struct. Four interpretations. The switch statement is the dispatch.

"An item is just data. A sword is a name, a damage number, and a dream."

The multi-file mental model matters: items.h defines the struct, items.txt holds the data, main.cpp runs the logic. Data is separate from code. When a designer wants a new sword, they edit the data file. The programmer never touches the engine.

## What Breaks Without This

Without data-driven items, every new piece of loot requires a code change. A new sword? New class. A new potion? New class. A Fire Sword that is also a torch? The class hierarchy collapses. With data-driven items, a Fire Sword is: name="Fire Sword", type=Weapon, value=75, effect=8. One line of data. No new code.

## The Fix

\`\`\`cpp
struct Item {
    char name[32];
    int type;    // 0=Weapon, 1=Armor, 2=Potion, 3=Key
    int value;   // gold value
    int effect;  // context-dependent on type
};
\`\`\`

The type field is the key. Everything else follows from it.

## Pattern Insight

This is the Flyweight pattern meets the Type Object pattern. The Item struct is the flyweight — a small, shared data structure. The type field is the type object — it determines behavior without inheritance. Together they give you a flat, serializable, cache-friendly item system. No vtables. No heap allocations. No pointer chasing. Just arrays of structs and a switch.

## Scalability Insight

Adding a Scroll type: add \`const int ITEM_SCROLL = 4;\`, add one case to getTypeName, add scroll entries to the data. Three changes. No existing code modified. The item array grows by one element per new item. The type switch grows by one case per new type. Types grow slowly (maybe 8 total). Items grow fast (hundreds). The data-driven approach handles both growth rates.

## Your Task

Build a room with two chests containing data-driven items. Load 5 items into the database. Render the grid. Open both chests.

**Item Database (5 items):**
- Iron Sword: Weapon, 50g, effect 5
- Leather Armor: Armor, 30g, effect 3
- Health Potion: Potion, 25g, effect 20
- Dungeon Key: Key, 10g, effect 1
- Fire Staff: Weapon, 80g, effect 8

**Setup:**
- Player at (2,5)
- Chest 1 at (6,3): contains item index 0 (Iron Sword)
- Chest 2 at (14,6): contains item index 4 (Fire Staff)

**Required Output:**
1. Print all 5 items: \`ITEM|name|type|valueg|effect:N\`
2. Render 20x10 grid: @ at (2,5), ! at (6,3) and (14,6)
3. Move to (6,3): \`Chest opened! Found: Iron Sword (Weapon)\`
4. Render grid (first chest gone)
5. Move to (14,6): \`Chest opened! Found: Fire Staff (Weapon)\`
6. \`ITEMS_LOADED|5\`
7. \`GAME_MESSAGE|Item system online.\`

## Common Mistake

Copying the entire Item struct into the chest. The chest should store an index into the item array, not a copy of the item. Copies waste memory and create consistency problems. Indices are 4 bytes. Item structs are 44 bytes. For 100 chests, that is 400 bytes vs 4400 bytes. More importantly, updating the Iron Sword's damage updates every chest that references it — if you used indices. Copies would require updating 100 copies.

## Elite Insight

NetHack (1987) stores every item as a struct with a type discriminator. Forty years later, the pattern has not changed because it does not need to. Data-driven items are a solved problem.

## Pattern Recognition

The chest-to-item relationship is indirection: the chest holds an index, not data. Indirection is everywhere — pointers, foreign keys, URLs, file paths. Same pattern, different domain. The index is a foreign key into the items table.

## Skill Reinforcement

- Struct definition with type discriminator
- Array-based item database
- Grid rendering with chest entities (!)
- Indirection: chest stores index, lookup resolves item
- Type name resolution via switch

## Mastery Check

Why is the effect field a single integer instead of separate damage/defense/heal fields? Because only one interpretation applies per item type. A Weapon reads effect as damage. An Armor reads effect as defense. Having all three wastes memory and invites bugs — reading damage on a Potion. The type discriminator tells you which interpretation to use. That is the discriminated union pattern.`,

  starterCode: `#include <iostream>
#include <cstring>
using namespace std;

const int ITEM_WEAPON = 0;
const int ITEM_ARMOR  = 1;
const int ITEM_POTION = 2;
const int ITEM_KEY    = 3;

struct Item {
    char name[32];
    int type;
    int value;
    int effect;
};

const char* getTypeName(int type) {
    switch (type) {
        case ITEM_WEAPON: return "Weapon";
        case ITEM_ARMOR:  return "Armor";
        case ITEM_POTION: return "Potion";
        case ITEM_KEY:    return "Key";
        default:          return "Unknown";
    }
}

void printItem(Item& item) {
    cout << "ITEM|" << item.name << "|" << getTypeName(item.type)
         << "|" << item.value << "g|effect:" << item.effect << endl;
}

void renderGrid(int px, int py,
                int c1x, int c1y, bool c1active,
                int c2x, int c2y, bool c2active) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#';
            } else if (col == px && row == py) {
                cout << '@';
            } else if (c1active && col == c1x && row == c1y) {
                cout << '!';
            } else if (c2active && col == c2x && row == c2y) {
                cout << '!';
            } else {
                cout << '.';
            }
        }
        cout << endl;
    }
}

int main() {
    const int NUM_ITEMS = 5;
    Item items[NUM_ITEMS];

    // TODO: Initialize 5 items
    // TODO: Print all 5 items
    // TODO: Setup chests and render grid
    // TODO: Open chest 1, render, open chest 2
    // TODO: Print ITEMS_LOADED|5 and GAME_MESSAGE

    return 0;
}
`,

  solutionCode: `#include <iostream>
#include <cstring>
using namespace std;

const int ITEM_WEAPON = 0;
const int ITEM_ARMOR  = 1;
const int ITEM_POTION = 2;
const int ITEM_KEY    = 3;

struct Item {
    char name[32];
    int type;
    int value;
    int effect;
};

const char* getTypeName(int type) {
    switch (type) {
        case ITEM_WEAPON: return "Weapon";
        case ITEM_ARMOR:  return "Armor";
        case ITEM_POTION: return "Potion";
        case ITEM_KEY:    return "Key";
        default:          return "Unknown";
    }
}

void printItem(Item& item) {
    cout << "ITEM|" << item.name << "|" << getTypeName(item.type)
         << "|" << item.value << "g|effect:" << item.effect << endl;
}

void renderGrid(int px, int py,
                int c1x, int c1y, bool c1active,
                int c2x, int c2y, bool c2active) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#';
            } else if (col == px && row == py) {
                cout << '@';
            } else if (c1active && col == c1x && row == c1y) {
                cout << '!';
            } else if (c2active && col == c2x && row == c2y) {
                cout << '!';
            } else {
                cout << '.';
            }
        }
        cout << endl;
    }
}

int main() {
    const int NUM_ITEMS = 5;
    Item items[NUM_ITEMS];

    strcpy(items[0].name, "Iron Sword");
    items[0].type = ITEM_WEAPON; items[0].value = 50; items[0].effect = 5;

    strcpy(items[1].name, "Leather Armor");
    items[1].type = ITEM_ARMOR; items[1].value = 30; items[1].effect = 3;

    strcpy(items[2].name, "Health Potion");
    items[2].type = ITEM_POTION; items[2].value = 25; items[2].effect = 20;

    strcpy(items[3].name, "Dungeon Key");
    items[3].type = ITEM_KEY; items[3].value = 10; items[3].effect = 1;

    strcpy(items[4].name, "Fire Staff");
    items[4].type = ITEM_WEAPON; items[4].value = 80; items[4].effect = 8;

    for (int i = 0; i < NUM_ITEMS; i++) {
        printItem(items[i]);
    }

    int px = 2, py = 5;
    int chest1X = 6, chest1Y = 3, chest1Item = 0;
    bool chest1Active = true;
    int chest2X = 14, chest2Y = 6, chest2Item = 4;
    bool chest2Active = true;

    renderGrid(px, py, chest1X, chest1Y, chest1Active,
               chest2X, chest2Y, chest2Active);

    px = chest1X; py = chest1Y;
    chest1Active = false;
    cout << "Chest opened! Found: " << items[chest1Item].name
         << " (" << getTypeName(items[chest1Item].type) << ")" << endl;

    renderGrid(px, py, chest1X, chest1Y, chest1Active,
               chest2X, chest2Y, chest2Active);

    px = chest2X; py = chest2Y;
    chest2Active = false;
    cout << "Chest opened! Found: " << items[chest2Item].name
         << " (" << getTypeName(items[chest2Item].type) << ")" << endl;

    cout << "ITEMS_LOADED|" << NUM_ITEMS << endl;
    cout << "GAME_MESSAGE|Item system online." << endl;

    return 0;
}
`,

  tests: [
    {
      id: "g1",
      description: "All items printed including Fire Staff",
      expectedOutput: "ITEM\\|Fire Staff\\|Weapon\\|80g\\|effect:8",
      isPattern: true,
    },
    {
      id: "g2",
      description: "First chest opened reveals Iron Sword",
      expectedOutput: "Chest opened! Found: Iron Sword \\(Weapon\\)",
      isPattern: true,
    },
    {
      id: "g3",
      description: "Second chest opened reveals Fire Staff",
      expectedOutput: "Chest opened! Found: Fire Staff \\(Weapon\\)",
      isPattern: true,
    },
    {
      id: "g4",
      description: "Items loaded count is 5",
      expectedOutput: "ITEMS_LOADED\\|5",
      isPattern: true,
    },
    {
      id: "g5",
      description: "Game message confirms item system online",
      expectedOutput: "GAME_MESSAGE\\|Item system online\\.",
      isPattern: true,
    },
  ],

  hints: [
    "Use strcpy for item names: strcpy(items[0].name, \"Iron Sword\"). Set type, value, effect with direct assignment.",
    "Chest stores an index: chest1Item = 0 means items[0] = Iron Sword. On open: print items[chest1Item].name.",
    "After opening chest 1, set chest1Active = false. The second renderGrid shows only chest 2 because chest1Active is false.",
  ],

  accumulatedCode: `#include <iostream>
#include <cstring>
using namespace std;

// ==============================
// RPG CORE — Lesson 36
// Item System — Data-Driven Items
// "An item is just data."
// ==============================

// === ITEM TYPE CONSTANTS ===
const int ITEM_WEAPON = 0;
const int ITEM_ARMOR  = 1;
const int ITEM_POTION = 2;
const int ITEM_KEY    = 3;

// === ITEM STRUCT — Pure Data ===
// No methods. No behavior. Just fields.
// The type field is the discriminator.
struct Item {
    char name[32];
    int type;    // 0=Weapon, 1=Armor, 2=Potion, 3=Key
    int value;   // gold value
    int effect;  // type-dependent: damage, defense, heal, door ID
};

// === TYPE NAME RESOLVER ===
const char* getTypeName(int type) {
    switch (type) {
        case ITEM_WEAPON: return "Weapon";
        case ITEM_ARMOR:  return "Armor";
        case ITEM_POTION: return "Potion";
        case ITEM_KEY:    return "Key";
        default:          return "Unknown";
    }
}

// === ITEM PRINTER — Structured Output ===
void printItem(Item& item) {
    cout << "ITEM|" << item.name << "|" << getTypeName(item.type)
         << "|" << item.value << "g|effect:" << item.effect << endl;
}

// === DIAGNOSTICS — Read-Only Observer ===
void printDiagnostics(int frame, int alive, int dead, int pool, int poolMax, int room) {
    cout << "DIAG|frame=" << frame
         << "|alive=" << alive
         << "|dead=" << dead
         << "|pool=" << pool << "/" << poolMax
         << "|room=" << room << endl;
}

// === GRID RENDER — With Chest Support ===
void renderGrid(int px, int py,
                int c1x, int c1y, bool c1active,
                int c2x, int c2y, bool c2active) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#';
            } else if (col == px && row == py) {
                cout << '@';
            } else if (c1active && col == c1x && row == c1y) {
                cout << '!';
            } else if (c2active && col == c2x && row == c2y) {
                cout << '!';
            } else {
                cout << '.';
            }
        }
        cout << endl;
    }
}

int main() {
    // === ITEM DATABASE — Loaded from Data ===
    const int NUM_ITEMS = 5;
    Item items[NUM_ITEMS];

    strcpy(items[0].name, "Iron Sword");
    items[0].type = ITEM_WEAPON; items[0].value = 50; items[0].effect = 5;

    strcpy(items[1].name, "Leather Armor");
    items[1].type = ITEM_ARMOR; items[1].value = 30; items[1].effect = 3;

    strcpy(items[2].name, "Health Potion");
    items[2].type = ITEM_POTION; items[2].value = 25; items[2].effect = 20;

    strcpy(items[3].name, "Dungeon Key");
    items[3].type = ITEM_KEY; items[3].value = 10; items[3].effect = 1;

    strcpy(items[4].name, "Fire Staff");
    items[4].type = ITEM_WEAPON; items[4].value = 80; items[4].effect = 8;

    // Print all items
    for (int i = 0; i < NUM_ITEMS; i++) {
        printItem(items[i]);
    }

    // === CHESTS — Indirection via Item Index ===
    int px = 2, py = 5;
    int chest1X = 6, chest1Y = 3, chest1Item = 0;
    bool chest1Active = true;
    int chest2X = 14, chest2Y = 6, chest2Item = 4;
    bool chest2Active = true;

    // Render initial grid
    renderGrid(px, py, chest1X, chest1Y, chest1Active,
               chest2X, chest2Y, chest2Active);

    // Open chest 1
    px = chest1X; py = chest1Y;
    chest1Active = false;
    cout << "Chest opened! Found: " << items[chest1Item].name
         << " (" << getTypeName(items[chest1Item].type) << ")" << endl;

    // Render after chest 1 opened
    renderGrid(px, py, chest1X, chest1Y, chest1Active,
               chest2X, chest2Y, chest2Active);

    // Open chest 2
    px = chest2X; py = chest2Y;
    chest2Active = false;
    cout << "Chest opened! Found: " << items[chest2Item].name
         << " (" << getTypeName(items[chest2Item].type) << ")" << endl;

    cout << "ITEMS_LOADED|" << NUM_ITEMS << endl;
    cout << "GAME_MESSAGE|Item system online." << endl;

    return 0;
}
`,
};
