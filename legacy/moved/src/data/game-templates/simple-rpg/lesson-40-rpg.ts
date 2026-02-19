import type { GameLessonVariant } from "@/types/game";

export const lesson40RPG: GameLessonVariant = {
  lessonId: "rpg-40-shop-system",

  instructions: `# Shop System — The Merchant's Ledger

## Mental Model

There is a pattern here that governs every transaction: the validated exchange. Gold goes down, item goes up. Or reverse. The shop is an exchange machine with preconditions. Can the player afford it? Is there inventory space? Does the shop have stock? All three must pass before the transaction commits. If any fail, nothing happens. No partial states. No half-purchases. Atomicity.

"Gold in, items out. The shop is a state machine with a ledger."

The shop tile (\$) triggers a state transition: PLAYING -> SHOPPING. The player browses, buys, sells. The state returns to PLAYING. The shop is a sub-state with its own rules.

## What Breaks Without This

Without validation: negative gold, phantom items, overflowed inventories. Without the buy/sell spread: infinite money loops. Buy a sword for 50, sell for 50, repeat. With the spread (sell at half): buy for 50, sell for 25, lose 25 per cycle. The spread is the tax that stabilizes the economy.

## The Fix

\`\`\`cpp
bool buyItem(ShopItem& si, int& gold, Inventory& inv) {
    if (gold < si.price) { /* reject */ return false; }
    if (inv.count >= 10)  { /* reject */ return false; }
    if (si.stock <= 0)    { /* reject */ return false; }
    gold -= si.price;
    addItem(inv, si.item);
    si.stock--;
    return true;
}
\`\`\`

Three checks. All must pass. That is the transaction contract.

## Pattern Insight

The shop is a two-party ledger. Every buy has two sides: player gold decreases, shop stock decreases. Player inventory increases. Every sell reverses this. Double-entry bookkeeping simplified for a dungeon. The spread (buy at full, sell at half) ensures the economy has a net sink.

## Scalability Insight

Dynamic pricing: multiply price by a factor. Reputation discounts: check rep, apply percentage. Haggling: randomize the final price within a range. Each extension modifies the price before the gold check. The transaction logic stays the same.

## Your Task

**Setup:**
- Player at (2,5), Gold=80, HP=100
- Inventory: Iron Sword (Weapon, value=50, effect=5), Health Potion (Potion, value=25, effect=20)
- Shop at (15,5) with:
  - Fire Staff: 60g, stock 1 (Weapon, value=80, effect=8)
  - Iron Shield: 40g, stock 2 (Armor, value=40, effect=3)
  - Health Potion: 25g, stock 5 (Potion, value=25, effect=20)

**Sequence:**
1. Render 20x10 grid: @ at (2,5), \$ at (15,5)
2. Move to (15,5): \`Entering shop...\`
3. Print: \`SHOP|Fire Staff:60g|Iron Shield:40g|Health Potion:25g\`
4. Buy Fire Staff (60g): \`Bought Fire Staff for 60g! Gold: 20\`
5. Try Iron Shield (40g, have 20g): \`Not enough gold! Need 40g, have 20g\`
6. Sell Iron Sword (half of 50=25): \`Sold Iron Sword for 25g! Gold: 45\`
7. Buy Iron Shield (40g from 45g): \`Bought Iron Shield for 40g! Gold: 5\`
8. Print: \`INV|Health Potion,Fire Staff,Iron Shield\`
9. \`GOLD|5\`
10. \`SHOP_TRANSACTIONS|3\`
11. \`GAME_MESSAGE|Shop closed. Gear up and go.\`

## Common Mistake

Selling at full price. The buy/sell spread prevents infinite money. Buy at full, sell at half. Integer division means a 15g item sells for 7g (floor). That is the natural gold sink.

## Elite Insight

Recettear: An Item Shop's Tale (2007) made the player the shopkeeper. You set prices and haggled with NPCs. Your shop is the NPC side — the automated vendor. But the transaction validation is identical: check funds, check stock, check capacity. The ledger does not care who is merchant and who is customer.

## Pattern Recognition

The failed-buy-then-sell-then-retry flow tests the full transaction lifecycle: success, failure, recovery, success. The failed buy prints an error without corrupting state. The sell raises gold. The retry succeeds with the new balance. This sequence proves the shop handles all edge cases.

## Skill Reinforcement

- Shop display: structured price list
- Three-check buy validation: gold, capacity, stock
- Sell at half value: integer division creates natural sink
- Failed transaction: clear errors, no state corruption
- Transaction counting: track successful operations

## Mastery Check

Why does buyItem check three conditions instead of just gold? Because each prevents a different corruption. Gold check: no negative gold. Capacity check: no inventory overflow. Stock check: no phantom items. Remove any one and there is a specific exploit.`,

  starterCode: `#include <iostream>
#include <cstring>
using namespace std;

const int ITEM_WEAPON = 0;
const int ITEM_ARMOR  = 1;
const int ITEM_POTION = 2;

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

struct ShopItem { Item item; int price; int stock; };

void printShop(ShopItem* shop, int size) {
    cout << "SHOP";
    for (int i = 0; i < size; i++)
        cout << "|" << shop[i].item.name << ":" << shop[i].price << "g";
    cout << endl;
}

bool buyItem(ShopItem& si, int& gold, Inventory& inv) {
    if (gold < si.price) {
        cout << "Not enough gold! Need " << si.price
             << "g, have " << gold << "g" << endl;
        return false;
    }
    if (inv.count >= 10) { cout << "Inventory full!" << endl; return false; }
    if (si.stock <= 0) { cout << "Out of stock!" << endl; return false; }
    gold -= si.price;
    addItem(inv, si.item);
    si.stock--;
    cout << "Bought " << si.item.name << " for "
         << si.price << "g! Gold: " << gold << endl;
    return true;
}

bool sellItem(Inventory& inv, int index, int& gold) {
    if (index < 0 || index >= inv.count) return false;
    int sellPrice = inv.items[index].value / 2;
    cout << "Sold " << inv.items[index].name << " for "
         << sellPrice << "g! Gold: " << (gold + sellPrice) << endl;
    gold += sellPrice;
    removeByIndex(inv, index);
    return true;
}

int main() {
    Inventory inv; inv.count = 0;
    int playerGold = 80;
    int transactions = 0;

    // TODO: Add Iron Sword and Health Potion to inventory
    // TODO: Create shop items
    // TODO: Render grid, enter shop, print shop
    // TODO: Buy Fire Staff, try Iron Shield (fail), sell sword, buy shield
    // TODO: Print inventory, gold, transactions, GAME_MESSAGE

    return 0;
}
`,

  solutionCode: `#include <iostream>
#include <cstring>
using namespace std;

const int ITEM_WEAPON = 0;
const int ITEM_ARMOR  = 1;
const int ITEM_POTION = 2;

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

struct ShopItem { Item item; int price; int stock; };

void printShop(ShopItem* shop, int size) {
    cout << "SHOP";
    for (int i = 0; i < size; i++)
        cout << "|" << shop[i].item.name << ":" << shop[i].price << "g";
    cout << endl;
}

bool buyItem(ShopItem& si, int& gold, Inventory& inv) {
    if (gold < si.price) {
        cout << "Not enough gold! Need " << si.price
             << "g, have " << gold << "g" << endl;
        return false;
    }
    if (inv.count >= 10) { cout << "Inventory full!" << endl; return false; }
    if (si.stock <= 0) { cout << "Out of stock!" << endl; return false; }
    gold -= si.price;
    addItem(inv, si.item);
    si.stock--;
    cout << "Bought " << si.item.name << " for "
         << si.price << "g! Gold: " << gold << endl;
    return true;
}

bool sellItem(Inventory& inv, int index, int& gold) {
    if (index < 0 || index >= inv.count) return false;
    int sellPrice = inv.items[index].value / 2;
    cout << "Sold " << inv.items[index].name << " for "
         << sellPrice << "g! Gold: " << (gold + sellPrice) << endl;
    gold += sellPrice;
    removeByIndex(inv, index);
    return true;
}

void renderGrid(int px, int py, int shopX, int shopY) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#';
            } else if (col == px && row == py) {
                cout << '@';
            } else if (col == shopX && row == shopY) {
                cout << '$';
            } else {
                cout << '.';
            }
        }
        cout << endl;
    }
}

int main() {
    Inventory inv; inv.count = 0;
    int playerGold = 80;
    int transactions = 0;

    Item sword, hpot;
    strcpy(sword.name, "Iron Sword");
    sword.type = ITEM_WEAPON; sword.value = 50; sword.effect = 5;
    strcpy(hpot.name, "Health Potion");
    hpot.type = ITEM_POTION; hpot.value = 25; hpot.effect = 20;
    addItem(inv, sword);
    addItem(inv, hpot);

    const int SHOP_SIZE = 3;
    ShopItem shop[SHOP_SIZE];

    strcpy(shop[0].item.name, "Fire Staff");
    shop[0].item.type = ITEM_WEAPON; shop[0].item.value = 80; shop[0].item.effect = 8;
    shop[0].price = 60; shop[0].stock = 1;

    strcpy(shop[1].item.name, "Iron Shield");
    shop[1].item.type = ITEM_ARMOR; shop[1].item.value = 40; shop[1].item.effect = 3;
    shop[1].price = 40; shop[1].stock = 2;

    strcpy(shop[2].item.name, "Health Potion");
    shop[2].item.type = ITEM_POTION; shop[2].item.value = 25; shop[2].item.effect = 20;
    shop[2].price = 25; shop[2].stock = 5;

    int px = 2, py = 5;
    int shopX = 15, shopY = 5;

    renderGrid(px, py, shopX, shopY);

    px = shopX; py = shopY;
    cout << "Entering shop..." << endl;
    printShop(shop, SHOP_SIZE);

    // Buy Fire Staff (80 - 60 = 20)
    if (buyItem(shop[0], playerGold, inv)) transactions++;

    // Try Iron Shield (need 40, have 20) — fails
    buyItem(shop[1], playerGold, inv);

    // Sell Iron Sword (index 0, value=50, sell for 25, gold: 20+25=45)
    if (sellItem(inv, 0, playerGold)) transactions++;

    // Buy Iron Shield (45 - 40 = 5)
    if (buyItem(shop[1], playerGold, inv)) transactions++;

    printInventory(inv);
    cout << "GOLD|" << playerGold << endl;
    cout << "SHOP_TRANSACTIONS|" << transactions << endl;
    cout << "GAME_MESSAGE|Shop closed. Gear up and go." << endl;

    return 0;
}
`,

  tests: [
    {
      id: "g1",
      description: "Shop displays items with prices",
      expectedOutput: "SHOP\\|Fire Staff:60g\\|Iron Shield:40g\\|Health Potion:25g",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Failed buy shows not enough gold",
      expectedOutput: "Not enough gold! Need 40g, have 20g",
      isPattern: true,
    },
    {
      id: "g3",
      description: "Iron Sword sold for 25g",
      expectedOutput: "Sold Iron Sword for 25g! Gold: 45",
      isPattern: true,
    },
    {
      id: "g4",
      description: "Final inventory has correct items",
      expectedOutput: "INV\\|Health Potion,Fire Staff,Iron Shield",
      isPattern: true,
    },
    {
      id: "g5",
      description: "Three successful transactions completed",
      expectedOutput: "SHOP_TRANSACTIONS\\|3",
      isPattern: true,
    },
  ],

  hints: [
    "After buying Fire Staff for 60g (80->20), trying Iron Shield (40g) fails with 'Not enough gold! Need 40g, have 20g'.",
    "Sell Iron Sword at index 0 (added first). sell price = 50/2 = 25. Gold: 20 + 25 = 45. Now buy Iron Shield for 40g.",
    "After selling sword, items shift. Health Potion is index 0. Then Fire Staff and Iron Shield are added via buys.",
  ],

  accumulatedCode: `#include <iostream>
#include <cstring>
using namespace std;

// ==============================
// RPG CORE — Lesson 40
// Shop System
// "Gold in, items out."
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

// === INVENTORY — Bounded Container ===
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

// === EQUIPMENT — Modifier Layer ===
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

// === USE ITEM ===
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

// === SHOP — Transaction System ===
// Three-check buy: gold, capacity, stock.
// Sell at half value: natural gold sink.
struct ShopItem {
    Item item;
    int price;
    int stock;
};

void printShop(ShopItem* shop, int size) {
    cout << "SHOP";
    for (int i = 0; i < size; i++)
        cout << "|" << shop[i].item.name << ":" << shop[i].price << "g";
    cout << endl;
}

bool buyItem(ShopItem& si, int& gold, Inventory& inv) {
    if (gold < si.price) {
        cout << "Not enough gold! Need " << si.price
             << "g, have " << gold << "g" << endl;
        return false;
    }
    if (inv.count >= inv.capacity) {
        cout << "Inventory full!" << endl;
        return false;
    }
    if (si.stock <= 0) {
        cout << "Out of stock!" << endl;
        return false;
    }
    gold -= si.price;
    addItem(inv, si.item);
    si.stock--;
    cout << "Bought " << si.item.name << " for "
         << si.price << "g! Gold: " << gold << endl;
    return true;
}

bool sellItem(Inventory& inv, int index, int& gold) {
    if (index < 0 || index >= inv.count) return false;
    int sellPrice = inv.items[index].value / 2;
    cout << "Sold " << inv.items[index].name << " for "
         << sellPrice << "g! Gold: " << (gold + sellPrice) << endl;
    gold += sellPrice;
    removeByIndex(inv, index);
    return true;
}

// === DIAGNOSTICS ===
void printDiagnostics(int frame, int alive, int dead, int pool, int poolMax, int room) {
    cout << "DIAG|frame=" << frame
         << "|alive=" << alive
         << "|dead=" << dead
         << "|pool=" << pool << "/" << poolMax
         << "|room=" << room << endl;
}

// === GRID RENDER — With Shop Tile ===
void renderGrid(int px, int py, int shopX, int shopY) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#';
            } else if (col == px && row == py) {
                cout << '@';
            } else if (col == shopX && row == shopY) {
                cout << '$';
            } else {
                cout << '.';
            }
        }
        cout << endl;
    }
}

int main() {
    Inventory inv; inv.count = 0; inv.capacity = 10;
    int playerGold = 80;
    int transactions = 0;

    // === PLAYER INVENTORY ===
    Item sword, hpot;
    strcpy(sword.name, "Iron Sword");
    sword.type = ITEM_WEAPON; sword.value = 50; sword.effect = 5;
    strcpy(hpot.name, "Health Potion");
    hpot.type = ITEM_POTION; hpot.value = 25; hpot.effect = 20;
    addItem(inv, sword);
    addItem(inv, hpot);

    // === SHOP INVENTORY ===
    const int SHOP_SIZE = 3;
    ShopItem shop[SHOP_SIZE];

    strcpy(shop[0].item.name, "Fire Staff");
    shop[0].item.type = ITEM_WEAPON; shop[0].item.value = 80; shop[0].item.effect = 8;
    shop[0].price = 60; shop[0].stock = 1;

    strcpy(shop[1].item.name, "Iron Shield");
    shop[1].item.type = ITEM_ARMOR; shop[1].item.value = 40; shop[1].item.effect = 3;
    shop[1].price = 40; shop[1].stock = 2;

    strcpy(shop[2].item.name, "Health Potion");
    shop[2].item.type = ITEM_POTION; shop[2].item.value = 25; shop[2].item.effect = 20;
    shop[2].price = 25; shop[2].stock = 5;

    int px = 2, py = 5;
    int shopX = 15, shopY = 5;

    // === RENDER & ENTER SHOP ===
    renderGrid(px, py, shopX, shopY);
    px = shopX; py = shopY;
    cout << "Entering shop..." << endl;
    printShop(shop, SHOP_SIZE);

    // === TRANSACTIONS ===
    // Buy Fire Staff: 80 - 60 = 20
    if (buyItem(shop[0], playerGold, inv)) transactions++;

    // Try Iron Shield: need 40, have 20 — FAIL
    buyItem(shop[1], playerGold, inv);

    // Sell Iron Sword: 50/2 = 25, gold: 20 + 25 = 45
    if (sellItem(inv, 0, playerGold)) transactions++;

    // Buy Iron Shield: 45 - 40 = 5
    if (buyItem(shop[1], playerGold, inv)) transactions++;

    // === RESULTS ===
    printInventory(inv);
    cout << "GOLD|" << playerGold << endl;
    cout << "SHOP_TRANSACTIONS|" << transactions << endl;
    cout << "GAME_MESSAGE|Shop closed. Gear up and go." << endl;

    return 0;
}
`,
};
