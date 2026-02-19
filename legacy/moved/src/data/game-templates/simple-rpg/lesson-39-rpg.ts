import type { GameLessonVariant } from "@/types/game";

export const lesson39RPG: GameLessonVariant = {
  lessonId: "rpg-39-use-items",

  instructions: `# Consumable Items — Heal, Unlock, Survive

## Mental Model

There is a pattern here that makes items matter: the effect dispatch. Every consumable item is a one-shot command. The player issues the command ("use potion"), the game interprets the item's type to determine the action (heal), reads the effect field for the parameter (20 HP), applies it to the game state, and destroys the item. The item is data. The interpretation is code. The separation is the pattern.

"The potion does not know about the player. It just knows: add 20 to a number."

A switch on item.type dispatches to the correct logic. Potion heals. Key unlocks. Scroll damages. The item struct never changes. Only the switch grows. That is the Interpreter pattern applied to gameplay.

## What Breaks Without This

Without a use system, items are inert. The player has a Health Potion but cannot heal. They have a Key but cannot open doors. Items without effects are decorations in a museum called Inventory. The use system is the bridge between item data and game state.

## The Fix

\`\`\`cpp
switch (item.type) {
    case ITEM_POTION:
        playerHP += item.effect;
        if (playerHP > maxHP) playerHP = maxHP;
        break;
    case ITEM_KEY:
        // find first locked door, unlock it
        break;
}
\`\`\`

Each case reads item.effect and applies it to the appropriate state. The item provides the parameter. The switch provides the logic.

## Pattern Insight

This is parameterized strategy through data. Two Health Potions with different effect values (20 vs 50) use the same strategy with different parameters. The item type selects the strategy. The effect field parameterizes it. One pattern. Infinite variations. All through data.

## Scalability Insight

Adding a Scroll of Lightning: one new case in useItem, reading item.effect as damage. The scroll data is one line in items.txt. The code change is 5 lines. Content scales faster than code.

## Your Task

**Setup:**
- Player at (3,5), HP=60, maxHP=100, Gold=30
- Enemy at (7,3) with HP=20
- Locked door at (14,5)
- Inventory: Health Potion (Potion, effect=25), Dungeon Key (Key, effect=1), Iron Sword (Weapon, effect=5)

**Sequence:**
1. Print \`HP:60/100\`
2. Render 20x10 grid: @ at (3,5), E at (7,3)
3. Move to (6,3), attack: \`Attack! Enemy HP: 10\`, \`Attack! Enemy HP: 0\`, \`Enemy defeated!\`
4. Player takes 15 damage: \`Player hit! HP: 45\`
5. Print \`HP:45/100\`
6. Use Health Potion: \`Used Health Potion! HP +25 (HP: 70)\`
7. Remove potion, print \`HP:70/100\`
8. Use Dungeon Key: \`Used Dungeon Key! Door at (14,5) unlocked!\`
9. Remove key
10. Print \`INV|Iron Sword\`
11. \`ITEMS_USED|2\`
12. \`GAME_MESSAGE|Items consumed. Dungeon progresses.\`

## Common Mistake

Forgetting to cap HP at maxHP. If HP is 90 and the potion heals 25, HP should be 100 (max), not 115. The cap: \`if (playerHP > maxHP) playerHP = maxHP;\`. Every RPG enforces this. Every RPG bug tracker has a ticket for the time someone forgot.

## Elite Insight

The original Rogue (1980) used ASCII characters as item types: ? for scrolls, ! for potions, / for wands. Each mapped to a type, each type to an effect function. Your switch on item.type is the same dispatch with integers instead of ASCII. The pattern has survived 45 years.

## Pattern Recognition

The use-and-remove pattern is a transaction. The effect (heal) and the cost (removal) must both happen or neither. If heal succeeds but removal fails: free healing forever. The bool return gates the removal.

## Skill Reinforcement

- Switch dispatch: item type selects behavior at runtime
- HP capping: heal bounded by maxHP
- Door unlocking: grid state mutation via item
- Inventory consumption: remove after successful use
- Negative test: non-consumables reject use

## Mastery Check

Why does useItem return bool? Because not all uses succeed. A key fails if no doors are locked. A weapon fails because weapons are not consumable. The bool tells the caller whether to remove the item. True: consumed, remove it. False: not consumed, keep it.`,

  starterCode: `#include <iostream>
#include <cstring>
using namespace std;

const int ITEM_WEAPON = 0;
const int ITEM_POTION = 2;
const int ITEM_KEY    = 3;

struct Item { char name[32]; int type; int value; int effect; };
struct Inventory { Item items[10]; int count; };

bool addItem(Inventory& inv, Item item) {
    if (inv.count >= 10) return false;
    inv.items[inv.count] = item; inv.count++; return true;
}

bool removeByIndex(Inventory& inv, int index) {
    if (index < 0 || index >= inv.count) return false;
    for (int j = index; j < inv.count - 1; j++)
        inv.items[j] = inv.items[j + 1];
    inv.count--; return true;
}

void printInventory(Inventory& inv) {
    cout << "INV|";
    for (int i = 0; i < inv.count; i++) {
        if (i > 0) cout << ",";
        cout << inv.items[i].name;
    }
    cout << endl;
}

bool useItem(Item& item, int& playerHP, int maxHP,
             int* doorX, int* doorY, bool* doorLocked, int doorCount) {
    switch (item.type) {
        case ITEM_POTION: {
            int heal = item.effect;
            playerHP += heal;
            if (playerHP > maxHP) playerHP = maxHP;
            cout << "Used " << item.name << "! HP +" << heal
                 << " (HP: " << playerHP << ")" << endl;
            return true;
        }
        case ITEM_KEY: {
            for (int i = 0; i < doorCount; i++) {
                if (doorLocked[i]) {
                    doorLocked[i] = false;
                    cout << "Used " << item.name << "! Door at ("
                         << doorX[i] << "," << doorY[i] << ") unlocked!" << endl;
                    return true;
                }
            }
            return false;
        }
        default:
            cout << item.name << " cannot be used." << endl;
            return false;
    }
}

int main() {
    Inventory inv; inv.count = 0;
    int playerHP = 60, maxHP = 100;
    int itemsUsed = 0;
    int doorX[1] = {14}, doorY[1] = {5};
    bool doorLocked[1] = {true};

    // TODO: Create items, add to inventory
    // TODO: Print HP, render grid, fight enemy, take damage
    // TODO: Use potion, remove, print HP
    // TODO: Use key, remove
    // TODO: Print inventory, ITEMS_USED, GAME_MESSAGE

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
struct Inventory { Item items[10]; int count; };

bool addItem(Inventory& inv, Item item) {
    if (inv.count >= 10) return false;
    inv.items[inv.count] = item; inv.count++; return true;
}

bool removeByIndex(Inventory& inv, int index) {
    if (index < 0 || index >= inv.count) return false;
    for (int j = index; j < inv.count - 1; j++)
        inv.items[j] = inv.items[j + 1];
    inv.count--; return true;
}

void printInventory(Inventory& inv) {
    cout << "INV|";
    for (int i = 0; i < inv.count; i++) {
        if (i > 0) cout << ",";
        cout << inv.items[i].name;
    }
    cout << endl;
}

bool useItem(Item& item, int& playerHP, int maxHP,
             int* doorX, int* doorY, bool* doorLocked, int doorCount) {
    switch (item.type) {
        case ITEM_POTION: {
            int heal = item.effect;
            playerHP += heal;
            if (playerHP > maxHP) playerHP = maxHP;
            cout << "Used " << item.name << "! HP +" << heal
                 << " (HP: " << playerHP << ")" << endl;
            return true;
        }
        case ITEM_KEY: {
            for (int i = 0; i < doorCount; i++) {
                if (doorLocked[i]) {
                    doorLocked[i] = false;
                    cout << "Used " << item.name << "! Door at ("
                         << doorX[i] << "," << doorY[i] << ") unlocked!" << endl;
                    return true;
                }
            }
            return false;
        }
        default:
            cout << item.name << " cannot be used." << endl;
            return false;
    }
}

void renderGrid(int px, int py, int ex, int ey, bool eAlive) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#';
            } else if (col == px && row == py) {
                cout << '@';
            } else if (eAlive && col == ex && row == ey) {
                cout << 'E';
            } else {
                cout << '.';
            }
        }
        cout << endl;
    }
}

int main() {
    Inventory inv; inv.count = 0;

    Item potion, key, sword;
    strcpy(potion.name, "Health Potion");
    potion.type = ITEM_POTION; potion.value = 25; potion.effect = 25;
    strcpy(key.name, "Dungeon Key");
    key.type = ITEM_KEY; key.value = 10; key.effect = 1;
    strcpy(sword.name, "Iron Sword");
    sword.type = ITEM_WEAPON; sword.value = 50; sword.effect = 5;

    addItem(inv, potion);
    addItem(inv, key);
    addItem(inv, sword);

    int playerHP = 60, maxHP = 100;
    int itemsUsed = 0;

    int doorX[1] = {14}, doorY[1] = {5};
    bool doorLocked[1] = {true};
    int doorCount = 1;

    int px = 3, py = 5;
    int enemyX = 7, enemyY = 3, enemyHP = 20;
    bool enemyAlive = true;

    cout << "HP:" << playerHP << "/" << maxHP << endl;
    renderGrid(px, py, enemyX, enemyY, enemyAlive);

    // Combat
    px = 6; py = 3;
    int damage = 10;
    while (enemyHP > 0) {
        enemyHP -= damage;
        if (enemyHP < 0) enemyHP = 0;
        cout << "Attack! Enemy HP: " << enemyHP << endl;
    }
    enemyAlive = false;
    cout << "Enemy defeated!" << endl;

    playerHP -= 15;
    cout << "Player hit! HP: " << playerHP << endl;
    cout << "HP:" << playerHP << "/" << maxHP << endl;

    // Use Health Potion (index 0)
    if (useItem(inv.items[0], playerHP, maxHP, doorX, doorY, doorLocked, doorCount)) {
        removeByIndex(inv, 0);
        itemsUsed++;
    }
    cout << "HP:" << playerHP << "/" << maxHP << endl;

    // Use Dungeon Key (now index 0)
    if (useItem(inv.items[0], playerHP, maxHP, doorX, doorY, doorLocked, doorCount)) {
        removeByIndex(inv, 0);
        itemsUsed++;
    }

    printInventory(inv);
    cout << "ITEMS_USED|" << itemsUsed << endl;
    cout << "GAME_MESSAGE|Items consumed. Dungeon progresses." << endl;

    return 0;
}
`,

  tests: [
    {
      id: "g1",
      description: "Health Potion heals player HP",
      expectedOutput: "Used Health Potion! HP \\+25 \\(HP: 70\\)",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Dungeon Key unlocks door",
      expectedOutput: "Used Dungeon Key! Door at \\(14,5\\) unlocked!",
      isPattern: true,
    },
    {
      id: "g3",
      description: "Only Iron Sword remains in inventory",
      expectedOutput: "INV\\|Iron Sword",
      isPattern: true,
    },
    {
      id: "g4",
      description: "Two items were used",
      expectedOutput: "ITEMS_USED\\|2",
      isPattern: true,
    },
    {
      id: "g5",
      description: "Game message confirms dungeon progresses",
      expectedOutput: "GAME_MESSAGE\\|Items consumed\\. Dungeon progresses\\.",
      isPattern: true,
    },
  ],

  hints: [
    "Create potion (effect=25), key (effect=1), sword (effect=5). Add in order: potion, key, sword.",
    "After using and removing the potion (index 0), the key shifts to index 0. Use inv.items[0] for the key.",
    "After both consumables are removed, only Iron Sword remains at index 0.",
  ],

  accumulatedCode: `#include <iostream>
#include <cstring>
using namespace std;

// ==============================
// RPG CORE — Lesson 39
// Consumable Items
// "The potion doesn't know about the player."
// ==============================

// === ITEM TYPES ===
const int ITEM_WEAPON = 0;
const int ITEM_ARMOR  = 1;
const int ITEM_POTION = 2;
const int ITEM_KEY    = 3;

const int SLOT_WEAPON    = 0;
const int SLOT_ARMOR     = 1;
const int SLOT_ACCESSORY = 2;

// === ITEM STRUCT ===
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

// === INVENTORY ===
struct Inventory { Item items[10]; int count; int capacity; };

bool addItem(Inventory& inv, Item item) {
    if (inv.count >= inv.capacity) return false;
    inv.items[inv.count] = item; inv.count++; return true;
}

bool removeByIndex(Inventory& inv, int index) {
    if (index < 0 || index >= inv.count) return false;
    for (int j = index; j < inv.count - 1; j++)
        inv.items[j] = inv.items[j + 1];
    inv.count--; return true;
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

// === EQUIPMENT ===
struct Equipment {
    int slotItemIndex[3];
    bool occupied[3];
};

bool equip(Equipment& eq, Inventory& inv, int invIdx, int slot) {
    if (invIdx < 0 || invIdx >= inv.count) return false;
    eq.slotItemIndex[slot] = invIdx;
    eq.occupied[slot] = true;
    return true;
}

bool unequip(Equipment& eq, int slot) {
    if (!eq.occupied[slot]) return false;
    eq.occupied[slot] = false;
    eq.slotItemIndex[slot] = -1;
    return true;
}

int getAttack(int base, Equipment& eq, Inventory& inv) {
    int bonus = 0;
    if (eq.occupied[SLOT_WEAPON])
        bonus += inv.items[eq.slotItemIndex[SLOT_WEAPON]].effect;
    return base + bonus;
}

int getDefense(int base, Equipment& eq, Inventory& inv) {
    int bonus = 0;
    if (eq.occupied[SLOT_ARMOR])
        bonus += inv.items[eq.slotItemIndex[SLOT_ARMOR]].effect;
    return base + bonus;
}

// === USE ITEM — Effect Dispatch ===
// Switch on type. Potion heals. Key unlocks. Default rejects.
// Returns true if consumed (remove from inventory).
bool useItem(Item& item, int& playerHP, int maxHP,
             int* doorX, int* doorY, bool* doorLocked, int doorCount) {
    switch (item.type) {
        case ITEM_POTION: {
            int heal = item.effect;
            playerHP += heal;
            if (playerHP > maxHP) playerHP = maxHP;
            cout << "Used " << item.name << "! HP +" << heal
                 << " (HP: " << playerHP << ")" << endl;
            return true;
        }
        case ITEM_KEY: {
            for (int i = 0; i < doorCount; i++) {
                if (doorLocked[i]) {
                    doorLocked[i] = false;
                    cout << "Used " << item.name << "! Door at ("
                         << doorX[i] << "," << doorY[i] << ") unlocked!" << endl;
                    return true;
                }
            }
            return false;
        }
        default:
            cout << item.name << " cannot be used." << endl;
            return false;
    }
}

// === DIAGNOSTICS ===
void printDiagnostics(int frame, int alive, int dead, int pool, int poolMax, int room) {
    cout << "DIAG|frame=" << frame
         << "|alive=" << alive
         << "|dead=" << dead
         << "|pool=" << pool << "/" << poolMax
         << "|room=" << room << endl;
}

// === GRID RENDER ===
void renderGrid(int px, int py, int ex, int ey, bool eAlive) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#';
            } else if (col == px && row == py) {
                cout << '@';
            } else if (eAlive && col == ex && row == ey) {
                cout << 'E';
            } else {
                cout << '.';
            }
        }
        cout << endl;
    }
}

int main() {
    Inventory inv; inv.count = 0; inv.capacity = 10;

    Item potion, key, sword;
    strcpy(potion.name, "Health Potion");
    potion.type = ITEM_POTION; potion.value = 25; potion.effect = 25;
    strcpy(key.name, "Dungeon Key");
    key.type = ITEM_KEY; key.value = 10; key.effect = 1;
    strcpy(sword.name, "Iron Sword");
    sword.type = ITEM_WEAPON; sword.value = 50; sword.effect = 5;

    addItem(inv, potion);
    addItem(inv, key);
    addItem(inv, sword);

    int playerHP = 60, maxHP = 100;
    int itemsUsed = 0;

    int doorX[1] = {14}, doorY[1] = {5};
    bool doorLocked[1] = {true};
    int doorCount = 1;

    int px = 3, py = 5;
    int enemyX = 7, enemyY = 3, enemyHP = 20;
    bool enemyAlive = true;

    // === INITIAL STATE ===
    cout << "HP:" << playerHP << "/" << maxHP << endl;
    renderGrid(px, py, enemyX, enemyY, enemyAlive);

    // === COMBAT ===
    px = 6; py = 3;
    int damage = 10;
    while (enemyHP > 0) {
        enemyHP -= damage;
        if (enemyHP < 0) enemyHP = 0;
        cout << "Attack! Enemy HP: " << enemyHP << endl;
    }
    enemyAlive = false;
    cout << "Enemy defeated!" << endl;

    // Player takes hit
    playerHP -= 15;
    cout << "Player hit! HP: " << playerHP << endl;
    cout << "HP:" << playerHP << "/" << maxHP << endl;

    // === USE HEALTH POTION ===
    if (useItem(inv.items[0], playerHP, maxHP, doorX, doorY, doorLocked, doorCount)) {
        removeByIndex(inv, 0);
        itemsUsed++;
    }
    cout << "HP:" << playerHP << "/" << maxHP << endl;

    // === USE DUNGEON KEY (now index 0 after shift) ===
    if (useItem(inv.items[0], playerHP, maxHP, doorX, doorY, doorLocked, doorCount)) {
        removeByIndex(inv, 0);
        itemsUsed++;
    }

    // === RESULTS ===
    printInventory(inv);
    cout << "ITEMS_USED|" << itemsUsed << endl;
    cout << "GAME_MESSAGE|Items consumed. Dungeon progresses." << endl;

    return 0;
}
`,
};
