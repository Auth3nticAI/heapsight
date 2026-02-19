import type { GameLessonVariant } from "@/types/game";

export const lesson37RPG: GameLessonVariant = {
  lessonId: "rpg-37-inventory",

  instructions: `# Inventory Container — Chest Pickup Loop

## Mental Model

There is a pattern here that separates amateur game code from professional: the bounded container. An inventory is not a set of boolean flags. It is a fixed-capacity array with operations: add, remove, has, print. The capacity limit (10 slots) is a gameplay constraint enforced by the data structure. Every RPG since Ultima (1981) has an inventory with a capacity limit. The limit creates decisions. The data structure enforces the limit.

The Inventory struct is a container with invariants. The invariant is: \`count <= capacity\`. Every operation maintains it. addItem checks before incrementing. removeItem decrements after shifting. No operation can violate the invariant. That is the contract.

## What Breaks Without This

Without a container, you have flags: hasSword, hasPotion, hasKey. Three items, three variables. Thirty items, thirty variables. You cannot iterate. You cannot count. You cannot display a list. You cannot serialize. Flags do not compose. A container composes. It is a single structure with known size, known capacity, and operations that maintain invariants.

## The Fix

\`\`\`cpp
struct Inventory {
    Item items[10];
    int count;
    int capacity;
};

bool addItem(Inventory& inv, Item item) {
    if (inv.count >= inv.capacity) return false;
    inv.items[inv.count] = item;
    inv.count++;
    return true;
}
\`\`\`

The bool return is the feedback channel. True: item added. False: inventory full. The caller decides what to do with that information.

## Pattern Insight

The bounded container is one of the most useful patterns in game programming. Entity pools, particle buffers, command queues, inventory slots — all are fixed-capacity collections with add-that-can-fail and remove-with-compaction. Your Inventory is a connection pool for items. The pattern transcends the domain.

## Scalability Insight

Change capacity from 10 to 20: one constant. The operations do not change. The output format does not change. The tests do not change. A single parameter controls the constraint. That is parameterized design.

## Your Task

Build a room with three chests. Pick up all items into inventory. Display the full inventory. Remove one item and verify state.

**Setup:**
- Player at (2,5), HP 100, Gold 50
- Inventory capacity 10, starts empty
- Chest A at (5,3): Iron Sword (Weapon, 50g, effect 5)
- Chest B at (10,4): Health Potion (Potion, 25g, effect 20)
- Chest C at (15,6): Dungeon Key (Key, 10g, effect 1)

**Sequence:**
1. Render 20x10 grid: @ at (2,5), ! at (5,3), (10,4), (15,6)
2. Move to (5,3): \`Chest opened! Found: Iron Sword\`, \`Added: Iron Sword\`
3. Move to (10,4): \`Chest opened! Found: Health Potion\`, \`Added: Health Potion\`
4. Move to (15,6): \`Chest opened! Found: Dungeon Key\`, \`Added: Dungeon Key\`
5. Print: \`INV|Iron Sword,Health Potion,Dungeon Key\`
6. Print: \`INV_COUNT|3/10\`
7. Remove Iron Sword: \`Removed: Iron Sword\`
8. Print: \`INV|Health Potion,Dungeon Key\`
9. Print: \`INV_COUNT|2/10\`
10. \`GAME_MESSAGE|Inventory operational.\`

## Common Mistake

Printing the inventory after each pickup instead of once after all three. The INV line is a snapshot of the final state. Intermediate prints are noise. Take the snapshot at the right moment.

## Elite Insight

Resident Evil's 6-slot inventory was the horror. Limited space meant limited safety. Your 10-slot inventory is the same design lever. Reduce to 5 for harder gameplay. Increase to 20 for easier. Game balance through data structure capacity.

## Pattern Recognition

Add-then-verify is the safe pattern: call addItem, check return, print feedback. Always: mutate, check, report. Never: report, then mutate.

## Skill Reinforcement

- Sequential pickup: three chests, three adds, one inventory snapshot
- Remove with compaction: shift-left after removal
- Capacity display: count/capacity format
- Bool return: addItem reports success/failure

## Mastery Check

Why print the inventory once after all pickups instead of after each? Because tests verify final state, not intermediate states. One snapshot after all mutations is cleaner, more testable, and matches real UI behavior.`,

  starterCode: `#include <iostream>
#include <cstring>
using namespace std;

const int ITEM_WEAPON = 0;
const int ITEM_POTION = 2;
const int ITEM_KEY    = 3;

struct Item { char name[32]; int type; int value; int effect; };
struct Inventory { Item items[10]; int count; int capacity; };

bool addItem(Inventory& inv, Item item) {
    if (inv.count >= inv.capacity) return false;
    inv.items[inv.count] = item; inv.count++; return true;
}

bool removeItem(Inventory& inv, const char* name) {
    for (int i = 0; i < inv.count; i++) {
        if (strcmp(inv.items[i].name, name) == 0) {
            for (int j = i; j < inv.count - 1; j++)
                inv.items[j] = inv.items[j + 1];
            inv.count--; return true;
        }
    }
    return false;
}

void printInventory(Inventory& inv) {
    cout << "INV|";
    for (int i = 0; i < inv.count; i++) {
        if (i > 0) cout << ",";
        cout << inv.items[i].name;
    }
    cout << endl;
}

int main() {
    Inventory inv; inv.count = 0; inv.capacity = 10;
    int px = 2, py = 5;

    // TODO: Create items, chests, render grid
    // TODO: Open each chest, add item to inventory
    // TODO: Print inventory and count
    // TODO: Remove Iron Sword, print updated inventory
    // TODO: GAME_MESSAGE|Inventory operational.

    return 0;
}
`,

  solutionCode: `#include <iostream>
#include <cstring>
using namespace std;

const int ITEM_WEAPON = 0;
const int ITEM_POTION = 2;
const int ITEM_KEY    = 3;

struct Item { char name[32]; int type; int value; int effect; };
struct Inventory { Item items[10]; int count; int capacity; };

bool addItem(Inventory& inv, Item item) {
    if (inv.count >= inv.capacity) return false;
    inv.items[inv.count] = item; inv.count++; return true;
}

bool removeItem(Inventory& inv, const char* name) {
    for (int i = 0; i < inv.count; i++) {
        if (strcmp(inv.items[i].name, name) == 0) {
            for (int j = i; j < inv.count - 1; j++)
                inv.items[j] = inv.items[j + 1];
            inv.count--; return true;
        }
    }
    return false;
}

void printInventory(Inventory& inv) {
    cout << "INV|";
    for (int i = 0; i < inv.count; i++) {
        if (i > 0) cout << ",";
        cout << inv.items[i].name;
    }
    cout << endl;
}

void renderGrid(int px, int py,
                int cx1, int cy1, bool a1,
                int cx2, int cy2, bool a2,
                int cx3, int cy3, bool a3) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#';
            } else if (col == px && row == py) {
                cout << '@';
            } else if (a1 && col == cx1 && row == cy1) {
                cout << '!';
            } else if (a2 && col == cx2 && row == cy2) {
                cout << '!';
            } else if (a3 && col == cx3 && row == cy3) {
                cout << '!';
            } else {
                cout << '.';
            }
        }
        cout << endl;
    }
}

int main() {
    Inventory inv; inv.count = 0; inv.capacity = 10;
    int px = 2, py = 5;

    Item sword, potion, key;
    strcpy(sword.name, "Iron Sword");
    sword.type = ITEM_WEAPON; sword.value = 50; sword.effect = 5;
    strcpy(potion.name, "Health Potion");
    potion.type = ITEM_POTION; potion.value = 25; potion.effect = 20;
    strcpy(key.name, "Dungeon Key");
    key.type = ITEM_KEY; key.value = 10; key.effect = 1;

    int cx1 = 5, cy1 = 3; bool a1 = true;
    int cx2 = 10, cy2 = 4; bool a2 = true;
    int cx3 = 15, cy3 = 6; bool a3 = true;

    renderGrid(px, py, cx1, cy1, a1, cx2, cy2, a2, cx3, cy3, a3);

    // Chest A
    px = cx1; py = cy1; a1 = false;
    cout << "Chest opened! Found: " << sword.name << endl;
    if (addItem(inv, sword)) cout << "Added: " << sword.name << endl;

    // Chest B
    px = cx2; py = cy2; a2 = false;
    cout << "Chest opened! Found: " << potion.name << endl;
    if (addItem(inv, potion)) cout << "Added: " << potion.name << endl;

    // Chest C
    px = cx3; py = cy3; a3 = false;
    cout << "Chest opened! Found: " << key.name << endl;
    if (addItem(inv, key)) cout << "Added: " << key.name << endl;

    printInventory(inv);
    cout << "INV_COUNT|" << inv.count << "/" << inv.capacity << endl;

    if (removeItem(inv, "Iron Sword")) {
        cout << "Removed: Iron Sword" << endl;
    }
    printInventory(inv);
    cout << "INV_COUNT|" << inv.count << "/" << inv.capacity << endl;

    cout << "GAME_MESSAGE|Inventory operational." << endl;

    return 0;
}
`,

  tests: [
    {
      id: "g1",
      description: "Full inventory shows all three items",
      expectedOutput: "INV\\|Iron Sword,Health Potion,Dungeon Key",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Inventory count shows 3/10 after pickups",
      expectedOutput: "INV_COUNT\\|3/10",
      isPattern: true,
    },
    {
      id: "g3",
      description: "After removal inventory shows two items",
      expectedOutput: "INV\\|Health Potion,Dungeon Key",
      isPattern: true,
    },
    {
      id: "g4",
      description: "Count updates to 2/10 after removal",
      expectedOutput: "INV_COUNT\\|2/10",
      isPattern: true,
    },
    {
      id: "g5",
      description: "Game message confirms inventory operational",
      expectedOutput: "GAME_MESSAGE\\|Inventory operational\\.",
      isPattern: true,
    },
  ],

  hints: [
    "Create three Item variables. Use strcpy for names. Set type, value, effect directly.",
    "After each chest open, call addItem and print 'Added: name' only if the return is true.",
    "Print the full inventory AFTER all three chests. Then remove and print again.",
  ],

  accumulatedCode: `#include <iostream>
#include <cstring>
using namespace std;

// ==============================
// RPG CORE — Lesson 37
// Inventory Container
// "A bag with finite space."
// ==============================

// === ITEM TYPE CONSTANTS ===
const int ITEM_WEAPON = 0;
const int ITEM_ARMOR  = 1;
const int ITEM_POTION = 2;
const int ITEM_KEY    = 3;

// === ITEM STRUCT ===
struct Item {
    char name[32];
    int type;
    int value;
    int effect;
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

void printItem(Item& item) {
    cout << "ITEM|" << item.name << "|" << getTypeName(item.type)
         << "|" << item.value << "g|effect:" << item.effect << endl;
}

// === INVENTORY — Bounded Container ===
// Invariant: count <= capacity (always)
struct Inventory {
    Item items[10];
    int count;
    int capacity;
};

// Add: returns false when full
bool addItem(Inventory& inv, Item item) {
    if (inv.count >= inv.capacity) return false;
    inv.items[inv.count] = item;
    inv.count++;
    return true;
}

// Remove by name: shift-left compaction
bool removeItem(Inventory& inv, const char* name) {
    for (int i = 0; i < inv.count; i++) {
        if (strcmp(inv.items[i].name, name) == 0) {
            for (int j = i; j < inv.count - 1; j++)
                inv.items[j] = inv.items[j + 1];
            inv.count--;
            return true;
        }
    }
    return false;
}

// Has: membership check
bool hasItem(Inventory& inv, const char* name) {
    for (int i = 0; i < inv.count; i++) {
        if (strcmp(inv.items[i].name, name) == 0) return true;
    }
    return false;
}

// Print: comma-separated list
void printInventory(Inventory& inv) {
    cout << "INV|";
    for (int i = 0; i < inv.count; i++) {
        if (i > 0) cout << ",";
        cout << inv.items[i].name;
    }
    cout << endl;
}

// === DIAGNOSTICS ===
void printDiagnostics(int frame, int alive, int dead, int pool, int poolMax, int room) {
    cout << "DIAG|frame=" << frame
         << "|alive=" << alive
         << "|dead=" << dead
         << "|pool=" << pool << "/" << poolMax
         << "|room=" << room << endl;
}

// === GRID RENDER — With Chest Support ===
void renderGrid(int px, int py,
                int cx1, int cy1, bool a1,
                int cx2, int cy2, bool a2,
                int cx3, int cy3, bool a3) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#';
            } else if (col == px && row == py) {
                cout << '@';
            } else if (a1 && col == cx1 && row == cy1) {
                cout << '!';
            } else if (a2 && col == cx2 && row == cy2) {
                cout << '!';
            } else if (a3 && col == cx3 && row == cy3) {
                cout << '!';
            } else {
                cout << '.';
            }
        }
        cout << endl;
    }
}

int main() {
    Inventory inv; inv.count = 0; inv.capacity = 10;
    int px = 2, py = 5;

    // === ITEM DATABASE ===
    Item sword, potion, key;
    strcpy(sword.name, "Iron Sword");
    sword.type = ITEM_WEAPON; sword.value = 50; sword.effect = 5;
    strcpy(potion.name, "Health Potion");
    potion.type = ITEM_POTION; potion.value = 25; potion.effect = 20;
    strcpy(key.name, "Dungeon Key");
    key.type = ITEM_KEY; key.value = 10; key.effect = 1;

    // === CHESTS ===
    int cx1 = 5, cy1 = 3; bool a1 = true;
    int cx2 = 10, cy2 = 4; bool a2 = true;
    int cx3 = 15, cy3 = 6; bool a3 = true;

    renderGrid(px, py, cx1, cy1, a1, cx2, cy2, a2, cx3, cy3, a3);

    // === PICKUP LOOP ===
    px = cx1; py = cy1; a1 = false;
    cout << "Chest opened! Found: " << sword.name << endl;
    if (addItem(inv, sword)) cout << "Added: " << sword.name << endl;

    px = cx2; py = cy2; a2 = false;
    cout << "Chest opened! Found: " << potion.name << endl;
    if (addItem(inv, potion)) cout << "Added: " << potion.name << endl;

    px = cx3; py = cy3; a3 = false;
    cout << "Chest opened! Found: " << key.name << endl;
    if (addItem(inv, key)) cout << "Added: " << key.name << endl;

    // === INVENTORY SNAPSHOT ===
    printInventory(inv);
    cout << "INV_COUNT|" << inv.count << "/" << inv.capacity << endl;

    // === REMOVE AND VERIFY ===
    if (removeItem(inv, "Iron Sword")) {
        cout << "Removed: Iron Sword" << endl;
    }
    printInventory(inv);
    cout << "INV_COUNT|" << inv.count << "/" << inv.capacity << endl;

    cout << "GAME_MESSAGE|Inventory operational." << endl;

    return 0;
}
`,
};
