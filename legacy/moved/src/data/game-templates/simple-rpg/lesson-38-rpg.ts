import type { GameLessonVariant } from "@/types/game";

export const lesson38RPG: GameLessonVariant = {
  lessonId: "rpg-38-equipment",

  instructions: `# Equipment Slots — Gear Up for Combat

## Mental Model

There is a pattern here that bridges inventory to power: the equipment slot. An item in inventory is potential. An item in an equipment slot is kinetic. A sword in the bag does nothing. A sword in the Weapon slot adds +5 attack. Equipment is the activation layer. It answers the question: which items are currently affecting your stats?

Three slots: Weapon, Armor, Accessory. Each holds at most one item. Stats are computed, never stored: \`totalAttack = baseAttack + weaponBonus\`. Compute fresh every time. Never cache derived stats. Stale data is the most common bug in RPG stat systems.

## What Breaks Without This

Without equipment, items are cosmetic. The player has an Iron Sword but deals base damage. The sword is decoration. Equipment connects items to the damage formula. Without that connection, the entire item system is pointless.

## The Fix

\`\`\`cpp
int getAttack(int base, Equipment& eq, Inventory& inv) {
    int bonus = 0;
    if (eq.occupied[SLOT_WEAPON])
        bonus += inv.items[eq.slotItemIndex[SLOT_WEAPON]].effect;
    return base + bonus;
}
\`\`\`

Compute on read, not on write. Every time combat needs the attack value, call getAttack(). It returns the current truth.

## Pattern Insight

Equipment slots implement the Strategy pattern for stats. The player chooses a strategy (which weapon). The combat system uses it (reads the bonus). Changing equipment changes the strategy without changing combat code. Decoupling through indirection.

## Scalability Insight

Adding a Ring slot: one more constant, one more check in getMaxHP(), one more entry in printEquipment. Three additions. No refactoring.

## Your Task

**Setup:**
- Player at (3,5): baseAttack=10, baseDefense=5, HP=100
- Enemy at (10,3): HP=30
- Inventory: Iron Sword (Weapon, effect=5), Iron Shield (Armor, effect=3)

**Sequence:**
1. Print \`STATS|ATK:10|DEF:5|HP:100\` (base)
2. Equip Iron Sword -> Weapon: \`Equipped: Iron Sword -> Weapon\`
3. Equip Iron Shield -> Armor: \`Equipped: Iron Shield -> Armor\`
4. Print \`STATS|ATK:15|DEF:8|HP:100\` (with equipment)
5. Print \`EQ|Iron Sword(+5)|Iron Shield(+3)\`
6. Render 20x10 grid: @ at (3,5), E at (10,3)
7. Move to (9,3), attack with computed attack (15):
   - \`Attack! Damage: 15, Enemy HP: 15\`
   - \`Attack! Damage: 15, Enemy HP: 0\`
   - \`Enemy defeated!\`
8. Unequip Iron Sword: \`Unequipped: Iron Sword <- Weapon\`
9. Print \`STATS|ATK:10|DEF:8|HP:100\` (weapon removed)
10. \`GAME_MESSAGE|Equipment system active.\`

## Common Mistake

Using baseAttack in combat instead of getAttack(). If the player equips a +5 sword but the damage formula reads baseAttack (10) instead of getAttack() (15), the equipment does nothing. Always call getAttack() in combat.

## Elite Insight

Dark Souls computes stats from a complex modifier tree: base + weapon scaling + ring modifiers + buffs. Your three-slot system is the same tree with three leaves. The pattern is identical. The depth changes.

## Pattern Recognition

The equip-compute-fight sequence is a pipeline: configure -> derive -> apply. Equipment is the configuration step. Stat computation is the derivation. Combat is the application. Pipelines enforce causality.

## Skill Reinforcement

- Equip/unequip with slot validation
- Computed stats: base + modifiers, fresh every time
- Combat uses computed stats, not base values
- Equipment HUD with bonus annotations

## Mastery Check

Why does the second attack deal 15 damage and not 10? Because combat reads the computed attack. If it dealt 10, equipment is disconnected from combat. The test catches this by checking the exact damage number.`,

  starterCode: `#include <iostream>
#include <cstring>
using namespace std;

const int ITEM_WEAPON = 0;
const int ITEM_ARMOR  = 1;
const int SLOT_WEAPON = 0;
const int SLOT_ARMOR  = 1;

struct Item { char name[32]; int type; int value; int effect; };
struct Inventory { Item items[10]; int count; };
struct Equipment { int slotItemIndex[3]; bool occupied[3]; };

bool addItem(Inventory& inv, Item item) {
    if (inv.count >= 10) return false;
    inv.items[inv.count] = item; inv.count++; return true;
}

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

int main() {
    Inventory inv; inv.count = 0;
    Equipment eq;
    for (int i = 0; i < 3; i++) { eq.slotItemIndex[i] = -1; eq.occupied[i] = false; }

    int baseAtk = 10, baseDef = 5, hp = 100;
    int enemyHP = 30;

    // TODO: Add items, print base stats, equip, print computed stats
    // TODO: Print EQ HUD, render grid, fight enemy with computed attack
    // TODO: Unequip weapon, print stats, GAME_MESSAGE

    return 0;
}
`,

  solutionCode: `#include <iostream>
#include <cstring>
using namespace std;

const int ITEM_WEAPON = 0;
const int ITEM_ARMOR  = 1;
const int SLOT_WEAPON = 0;
const int SLOT_ARMOR  = 1;

struct Item { char name[32]; int type; int value; int effect; };
struct Inventory { Item items[10]; int count; };
struct Equipment { int slotItemIndex[3]; bool occupied[3]; };

bool addItem(Inventory& inv, Item item) {
    if (inv.count >= 10) return false;
    inv.items[inv.count] = item; inv.count++; return true;
}

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

void printEquipment(Equipment& eq, Inventory& inv) {
    cout << "EQ";
    for (int i = 0; i < 3; i++) {
        if (eq.occupied[i]) {
            Item& item = inv.items[eq.slotItemIndex[i]];
            cout << "|" << item.name << "(+" << item.effect << ")";
        }
    }
    cout << endl;
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
    Equipment eq;
    for (int i = 0; i < 3; i++) { eq.slotItemIndex[i] = -1; eq.occupied[i] = false; }

    Item sword, shield;
    strcpy(sword.name, "Iron Sword");
    sword.type = ITEM_WEAPON; sword.value = 50; sword.effect = 5;
    strcpy(shield.name, "Iron Shield");
    shield.type = ITEM_ARMOR; shield.value = 30; shield.effect = 3;

    addItem(inv, sword);   // index 0
    addItem(inv, shield);  // index 1

    int baseAtk = 10, baseDef = 5, hp = 100;
    int enemyX = 10, enemyY = 3, enemyHP = 30;
    bool enemyAlive = true;
    int px = 3, py = 5;

    // Base stats
    cout << "STATS|ATK:" << baseAtk << "|DEF:" << baseDef << "|HP:" << hp << endl;

    // Equip
    if (equip(eq, inv, 0, SLOT_WEAPON))
        cout << "Equipped: " << inv.items[0].name << " -> Weapon" << endl;
    if (equip(eq, inv, 1, SLOT_ARMOR))
        cout << "Equipped: " << inv.items[1].name << " -> Armor" << endl;

    int atk = getAttack(baseAtk, eq, inv);
    int def = getDefense(baseDef, eq, inv);
    cout << "STATS|ATK:" << atk << "|DEF:" << def << "|HP:" << hp << endl;
    printEquipment(eq, inv);

    // Render grid
    renderGrid(px, py, enemyX, enemyY, enemyAlive);

    // Move and attack
    px = 9; py = 3;
    while (enemyHP > 0) {
        int dmg = getAttack(baseAtk, eq, inv);
        enemyHP -= dmg;
        if (enemyHP < 0) enemyHP = 0;
        cout << "Attack! Damage: " << dmg << ", Enemy HP: " << enemyHP << endl;
    }
    enemyAlive = false;
    cout << "Enemy defeated!" << endl;

    // Unequip weapon
    if (unequip(eq, SLOT_WEAPON))
        cout << "Unequipped: Iron Sword <- Weapon" << endl;

    atk = getAttack(baseAtk, eq, inv);
    def = getDefense(baseDef, eq, inv);
    cout << "STATS|ATK:" << atk << "|DEF:" << def << "|HP:" << hp << endl;

    cout << "GAME_MESSAGE|Equipment system active." << endl;

    return 0;
}
`,

  tests: [
    {
      id: "g1",
      description: "Equipped stats show ATK:15 and DEF:8",
      expectedOutput: "STATS\\|ATK:15\\|DEF:8\\|HP:100",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Equipment HUD shows sword and shield bonuses",
      expectedOutput: "EQ\\|Iron Sword\\(\\+5\\)\\|Iron Shield\\(\\+3\\)",
      isPattern: true,
    },
    {
      id: "g3",
      description: "Attack uses equipped damage value of 15",
      expectedOutput: "Attack! Damage: 15, Enemy HP: 15",
      isPattern: true,
    },
    {
      id: "g4",
      description: "Stats after unequip revert ATK to 10",
      expectedOutput: "STATS\\|ATK:10\\|DEF:8\\|HP:100",
      isPattern: true,
    },
    {
      id: "g5",
      description: "Game message confirms equipment system active",
      expectedOutput: "GAME_MESSAGE\\|Equipment system active\\.",
      isPattern: true,
    },
  ],

  hints: [
    "Add sword (index 0) and shield (index 1) to inventory first. Then equip by index.",
    "In combat, call getAttack(baseAtk, eq, inv) for the damage value. With the sword equipped, it returns 15.",
    "After unequip(eq, SLOT_WEAPON), getAttack returns baseAtk (10). The shield bonus persists in DEF.",
  ],

  accumulatedCode: `#include <iostream>
#include <cstring>
using namespace std;

// ==============================
// RPG CORE — Lesson 38
// Equipment Slots
// "A sword in the hand is power."
// ==============================

// === ITEM TYPES & SLOTS ===
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

void printItem(Item& item) {
    cout << "ITEM|" << item.name << "|" << getTypeName(item.type)
         << "|" << item.value << "g|effect:" << item.effect << endl;
}

// === INVENTORY — Bounded Container ===
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

// === EQUIPMENT — Modifier Layer ===
// Slots hold indices into inventory. Stats computed on read.
struct Equipment {
    int slotItemIndex[3]; // -1 = empty
    bool occupied[3];
};

bool equip(Equipment& eq, Inventory& inv, int invIdx, int slot) {
    if (invIdx < 0 || invIdx >= inv.count) return false;
    if (slot < 0 || slot > 2) return false;
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

// Computed stats: base + equipment bonuses
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

void printEquipment(Equipment& eq, Inventory& inv) {
    cout << "EQ";
    for (int i = 0; i < 3; i++) {
        if (eq.occupied[i]) {
            Item& item = inv.items[eq.slotItemIndex[i]];
            cout << "|" << item.name << "(+" << item.effect << ")";
        }
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
    Equipment eq;
    for (int i = 0; i < 3; i++) { eq.slotItemIndex[i] = -1; eq.occupied[i] = false; }

    Item sword, shield;
    strcpy(sword.name, "Iron Sword");
    sword.type = ITEM_WEAPON; sword.value = 50; sword.effect = 5;
    strcpy(shield.name, "Iron Shield");
    shield.type = ITEM_ARMOR; shield.value = 30; shield.effect = 3;

    addItem(inv, sword);   // index 0
    addItem(inv, shield);  // index 1

    int baseAtk = 10, baseDef = 5, hp = 100;
    int enemyX = 10, enemyY = 3, enemyHP = 30;
    bool enemyAlive = true;
    int px = 3, py = 5;

    // === BASE STATS ===
    cout << "STATS|ATK:" << baseAtk << "|DEF:" << baseDef << "|HP:" << hp << endl;

    // === EQUIP ===
    if (equip(eq, inv, 0, SLOT_WEAPON))
        cout << "Equipped: " << inv.items[0].name << " -> Weapon" << endl;
    if (equip(eq, inv, 1, SLOT_ARMOR))
        cout << "Equipped: " << inv.items[1].name << " -> Armor" << endl;

    int atk = getAttack(baseAtk, eq, inv);
    int def = getDefense(baseDef, eq, inv);
    cout << "STATS|ATK:" << atk << "|DEF:" << def << "|HP:" << hp << endl;
    printEquipment(eq, inv);

    // === COMBAT ===
    renderGrid(px, py, enemyX, enemyY, enemyAlive);
    px = 9; py = 3;
    while (enemyHP > 0) {
        int dmg = getAttack(baseAtk, eq, inv);
        enemyHP -= dmg;
        if (enemyHP < 0) enemyHP = 0;
        cout << "Attack! Damage: " << dmg << ", Enemy HP: " << enemyHP << endl;
    }
    enemyAlive = false;
    cout << "Enemy defeated!" << endl;

    // === UNEQUIP ===
    if (unequip(eq, SLOT_WEAPON))
        cout << "Unequipped: Iron Sword <- Weapon" << endl;

    atk = getAttack(baseAtk, eq, inv);
    def = getDefense(baseDef, eq, inv);
    cout << "STATS|ATK:" << atk << "|DEF:" << def << "|HP:" << hp << endl;

    cout << "GAME_MESSAGE|Equipment system active." << endl;

    return 0;
}
`,
};
