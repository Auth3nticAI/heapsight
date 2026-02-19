import type { GameLessonVariant } from "@/types/game";

export const lesson45RPG: GameLessonVariant = {
  lessonId: "rpg-45-inventory-milestone",

  instructions: `# Inventory Milestone: The Equipped Adventurer

## THIS IS THE SUMMIT. YOU BUILT AN INVENTORY-DRIVEN RPG.

Three rooms. One hero. Loot tables. Crafting. Equipment. Status effects. Shops. NPC dialog. Everything connects. Everything works. You are not learning patterns anymore — you are composing them into a product.

The badge is yours: **Equipped Adventurer**.

## Mental Model

There is a pattern here that transforms a pile of systems into a product. You built ten systems across ten lessons. Each was a function: loot tables transform death into reward, crafting transforms materials into equipment, effects transform potions into temporary power, dialog transforms NPCs into characters. The milestone is the composition: all functions chained, all data flowing, all systems cooperating. Composition is the ultimate pattern.

Every RPG ever shipped — Zelda, Diablo, Dark Souls, Stardew Valley — is a composition of these exact systems. Items. Equipment. Consumables. Shops. Crafting. Effects. NPCs. The specific content differs by decades of iteration. The architecture is what you just built.

## What Breaks Without This

Any broken link breaks the chain. Loot not feeding inventory starves crafting. Crafting not producing equipment makes the boss unbeatable. Shop not selling potions removes effects from combat. Dialog not working makes the shop inaccessible. Every system depends on at least one other. The milestone is the dependency graph made executable.

## The Fix

Three rooms, three pipeline stages:
- **Room 0 (Source):** Combat produces raw materials (gold + loot drops)
- **Room 1 (Transform):** Shop and crafting station transform materials into usable items
- **Room 2 (Sink):** Equipment and potions are consumed in the boss fight

This is the Producer-Transformer-Consumer pipeline. The Pipe and Filter pattern. Data flows through: raw loot -> inventory -> crafted gear -> equipped stats -> combat results.

## Pattern Insight

The Pipe and Filter pattern: Room 0 produces, Room 1 transforms, Room 2 consumes. Each stage adds value. The pipeline is the game loop. Every action RPG follows this rhythm: farm -> prepare -> fight.

## Scalability Insight

Adding Room 3: one more pipeline stage. Adding a second boss: one more consumer. Adding rare materials: more source variety. Adding advanced recipes: more transformations. The pipeline extends without restructuring. That is the architecture of every RPG ever shipped.

## Your Task (MILESTONE — CELEBRATE THIS)

**Setup:** Load loot table (6 entries), recipes (3), merchant NPC.

**Room 0 — Combat + Loot:**
1. Print \`=== EQUIPPED ADVENTURER ===\`
2. Grid: @ at (2,5), E at (10,3), D at col 19. HUD: \`HUD|HP:100|ATK:10|DEF:5|Gold:0|Room:0\`
3. Fight goblin (HP:30, 3x10dmg). Print attacks and \`Enemy defeated!\`
4. Loot roll 1: roll=15 -> gold(25). Print \`LOOT|goblin|roll=15|drop=gold\` and \`Picked up gold! Total: 25\`
5. Loot roll 2: roll=52 -> sword. Print \`LOOT|goblin|roll=52|drop=sword\` and \`ITEM|sword|picked_up\`
6. Transition: \`Room transition: 0 -> 1\`

**Room 1 — Shop + Craft + NPC:**
7. Grid: @ at (1,5), N at (8,5), $ at (14,3), ! at (5,3), D at col 19. HUD Room:1.
8. Chest: iron_ore:3, wood:2. Print \`CHEST|loot=iron_ore:3,wood:2\`
9. Merchant dialog: Buy potion path. Print DIALOG lines. \`PURCHASED|health_potion|cost=10\`
10. Craft iron_sword. Print \`CRAFTED|iron_sword|consumed=iron_ore:3,wood:2\`
11. Print INV showing all items.
12. Transition: \`Room transition: 1 -> 2\`

**Room 2 — Boss Fight:**
13. Grid: @ at (1,5), E(boss) at (12,5). HUD Room:2.
14. Equip iron_sword: ATK->18. Print \`EQUIPPED|iron_sword|ATK:18\`
15. Use health_potion: Shield(+5def, 4 turns). Print \`USED|health_potion\` and \`FX|Shield:4\`
16. 5-turn combat (18dmg player, 12dmg boss). Shield ticks 4 turns, expires turn 4.
17. Turn 5: boss HP -> -10. Print \`COMBAT|turn=5|BossHP:-10|DEFEATED\`

**Victory:**
18. \`MILESTONE: Equipped Adventurer Complete!\`
19. \`FINAL|HP:52|ATK:18|DEF:5|Gold:15\`
20. \`GAME_MESSAGE|Badge: Equipped Adventurer unlocked!\`
21. \`SCORE|300\`

## Common Mistake

Forgetting to decrement the potion count after use. If health_potion stays at 1 after drinking, subsequent checks or saves are wrong. Decrement consumables immediately on use.

## Elite Insight

Diablo II's Act Boss fights require this exact pipeline: farm enemies for materials and gold, visit town for potions and runewords, fight the boss with prepared equipment. The three-phase prepare-equip-fight loop is the fundamental rhythm of every action RPG. You just built that rhythm.

## Pattern Recognition

The milestone proves compositional correctness. Each lesson proved a component. The milestone proves the composition. Unit tests verify components. Integration tests verify contracts. "Loot rolls happen after death." "Crafting consumes inventory." "Equipment modifies base stats." Each assumption is a contract. The milestone verifies all contracts simultaneously.

## Skill Reinforcement

- Full 12-system integration across all inventory subsystems
- 3-room dungeon with progressive difficulty pipeline
- Loot -> inventory -> crafting -> equipment pipeline
- Dialog -> shop -> economy -> crafting pipeline
- Effects -> combat modifiers -> boss fight pipeline
- Milestone badge as integration proof

## Mastery Check

Count the systems: grid rendering, entity management, combat, loot tables, inventory, crafting, equipment, status effects, NPC dialog, shops, room transitions, HUD. Twelve systems cooperating in one program. The number of pairwise interactions is 66. The milestone tests the critical subset. You can manage complexity at scale. That is the skill that separates engineers who build features from engineers who build products. You built a product.`,

  starterCode: `#include <iostream>
#include <string>
using namespace std;

// === ALL SYSTEM STRUCTS ===
struct LootEntry { string enemyType; string item; int weight; };
const int MAX_LOOT = 50;

const int MAX_INGREDIENTS = 5;
struct Recipe { string result; string ingredients[MAX_INGREDIENTS]; int quantities[MAX_INGREDIENTS]; int ingredientCount; };
const int MAX_RECIPES = 20;
const int MAX_ITEMS = 30;

const int MAX_EFFECTS = 10;
struct StatusEffect { string type; int magnitude; int duration; };

const int MAX_CHOICES = 4;
const int MAX_NODES = 20;
struct DialogChoice { string text; int targetNode; };
struct DialogNode { int id; string text; DialogChoice choices[MAX_CHOICES]; int choiceCount; bool isEnd; };
struct NPC { string name; int gridX, gridY; DialogNode nodes[MAX_NODES]; int nodeCount; };

// TODO: Implement ALL system functions:
// Loot: loadLootTable, rollLoot
// Inventory: findItem, addItem, printInventory
// Crafting: loadRecipes, canCraft, doCraft
// Effects: addEffect, tickEffects, printEffects
// Dialog: findNode, loadMerchant, runDialog
// Grid: renderRoom0, renderRoom1, renderRoom2

int main() {
    // TODO: Initialize all state
    // TODO: Room 0 — Combat + Loot
    // TODO: Room 1 — Shop + Craft + NPC
    // TODO: Room 2 — Boss Fight with Equipment + Effects
    // TODO: Victory — Milestone + Badge + SCORE|300
    return 0;
}
`,

  solutionCode: `#include <iostream>
#include <string>
using namespace std;

// =============================================
// ALL SYSTEM STRUCTS
// =============================================
struct LootEntry { string enemyType; string item; int weight; };
const int MAX_LOOT = 50;

const int MAX_INGREDIENTS = 5;
struct Recipe { string result; string ingredients[MAX_INGREDIENTS]; int quantities[MAX_INGREDIENTS]; int ingredientCount; };
const int MAX_RECIPES = 20;
const int MAX_ITEMS = 30;

const int MAX_EFFECTS = 10;
struct StatusEffect { string type; int magnitude; int duration; };

const int MAX_CHOICES = 4;
const int MAX_NODES = 20;
struct DialogChoice { string text; int targetNode; };
struct DialogNode { int id; string text; DialogChoice choices[MAX_CHOICES]; int choiceCount; bool isEnd; };
struct NPC { string name; int gridX, gridY; DialogNode nodes[MAX_NODES]; int nodeCount; };

// =============================================
// LOOT TABLE
// =============================================
int loadLootTable(LootEntry table[]) {
    table[0] = {"goblin", "gold", 50};
    table[1] = {"goblin", "sword", 10};
    table[2] = {"goblin", "nothing", 40};
    table[3] = {"skeleton_boss", "rare_gem", 20};
    table[4] = {"skeleton_boss", "gold", 50};
    table[5] = {"skeleton_boss", "nothing", 30};
    return 6;
}

string rollLoot(LootEntry table[], int size, string type, int roll) {
    int acc = 0;
    for (int i = 0; i < size; i++) {
        if (table[i].enemyType == type) {
            acc += table[i].weight;
            if (roll < acc) return table[i].item;
        }
    }
    return "nothing";
}

// =============================================
// INVENTORY + CRAFTING
// =============================================
int findItem(string names[], int count, string target) {
    for (int i = 0; i < count; i++) {
        if (names[i] == target) return i;
    }
    return -1;
}

void addItem(string names[], int counts[], int& count, string name, int qty) {
    int idx = findItem(names, count, name);
    if (idx >= 0) { counts[idx] += qty; return; }
    names[count] = name;
    counts[count] = qty;
    count++;
}

int loadRecipes(Recipe recipes[]) {
    recipes[0] = {"iron_sword", {"iron_ore", "wood"}, {3, 2}, 2};
    recipes[1] = {"health_potion", {"herb", "water"}, {2, 1}, 2};
    recipes[2] = {"steel_shield", {"iron_ore", "leather"}, {5, 2}, 2};
    return 3;
}

bool canCraft(Recipe& r, string names[], int counts[], int count) {
    for (int i = 0; i < r.ingredientCount; i++) {
        int idx = findItem(names, count, r.ingredients[i]);
        if (idx < 0 || counts[idx] < r.quantities[i]) return false;
    }
    return true;
}

void doCraft(Recipe& r, string names[], int counts[], int& count) {
    for (int i = 0; i < r.ingredientCount; i++) {
        int idx = findItem(names, count, r.ingredients[i]);
        counts[idx] -= r.quantities[i];
    }
    addItem(names, counts, count, r.result, 1);
}

void printInventory(string names[], int counts[], int count) {
    cout << "INV";
    for (int i = 0; i < count; i++) cout << "|" << names[i] << ":" << counts[i];
    cout << endl;
}

// =============================================
// STATUS EFFECTS
// =============================================
void addEffect(StatusEffect fx[], int& count, string type, int mag, int dur) {
    for (int i = 0; i < count; i++) {
        if (fx[i].type == type) { fx[i].duration = dur; fx[i].magnitude = mag; return; }
    }
    fx[count] = {type, mag, dur};
    count++;
}

void tickEffects(StatusEffect fx[], int& count, int& hp, int& atk, int& def) {
    for (int i = 0; i < count; i++) {
        if (fx[i].type == "Poison") hp -= fx[i].magnitude;
        if (fx[i].type == "Shield") def += fx[i].magnitude;
        if (fx[i].type == "Strength") atk += fx[i].magnitude;
        fx[i].duration--;
    }
    int w = 0;
    for (int i = 0; i < count; i++) {
        if (fx[i].duration > 0) fx[w++] = fx[i];
    }
    count = w;
}

void printEffects(StatusEffect fx[], int count) {
    if (count == 0) { cout << "FX|none" << endl; return; }
    cout << "FX";
    for (int i = 0; i < count; i++) cout << "|" << fx[i].type << ":" << fx[i].duration;
    cout << endl;
}

// =============================================
// DIALOG
// =============================================
int findNode(NPC& npc, int nodeId) {
    for (int i = 0; i < npc.nodeCount; i++) {
        if (npc.nodes[i].id == nodeId) return i;
    }
    return -1;
}

void loadMerchant(NPC& npc) {
    npc.name = "merchant"; npc.gridX = 8; npc.gridY = 5; npc.nodeCount = 3;
    npc.nodes[0] = {0, "Welcome! Buy a potion?",
        {{"Buy potion", 1}, {"No thanks", 99}}, 2, false};
    npc.nodes[1] = {1, "Here you go! Stay safe.",
        {{"Thanks", 99}}, 1, false};
    npc.nodes[2] = {99, "Good luck out there!",
        {}, 0, true};
}

void runDialog(NPC& npc, int choices[], int choiceCount) {
    int cur = 0, ci = 0;
    while (true) {
        int ni = findNode(npc, cur);
        if (ni < 0) break;
        DialogNode& nd = npc.nodes[ni];
        cout << "DIALOG|" << npc.name << "|\\"" << nd.text << "\\"" << endl;
        if (nd.isEnd || ci >= choiceCount) break;
        int pick = choices[ci++];
        if (pick < nd.choiceCount) cur = nd.choices[pick].targetNode;
        else break;
    }
}

// =============================================
// GRID RENDERING
// =============================================
void renderRoom0(int px, int py, int ex, int ey, bool eAlive,
                 bool goldActive, int gx, int gy) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) cout << '#';
            else if (col == px && row == py) cout << '@';
            else if (eAlive && col == ex && row == ey) cout << 'E';
            else if (goldActive && col == gx && row == gy) cout << 'G';
            else if (col == 18 && row == 5) cout << 'D';
            else cout << '.';
        }
        cout << endl;
    }
}

void renderRoom1(int px, int py) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) cout << '#';
            else if (col == px && row == py) cout << '@';
            else if (col == 8 && row == 5) cout << 'N';
            else if (col == 14 && row == 3) cout << '$';
            else if (col == 5 && row == 3) cout << '!';
            else if (col == 18 && row == 5) cout << 'D';
            else cout << '.';
        }
        cout << endl;
    }
}

void renderRoom2(int px, int py, int bx, int by, bool bAlive) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) cout << '#';
            else if (col == px && row == py) cout << '@';
            else if (bAlive && col == bx && row == by) cout << 'E';
            else cout << '.';
        }
        cout << endl;
    }
}

// =============================================
// MAIN — THE EQUIPPED ADVENTURER (MILESTONE)
// =============================================
int main() {
    int playerX = 2, playerY = 5;
    int playerHP = 100, baseAtk = 10, baseDef = 5;
    int playerGold = 0;
    int room = 0;

    string itemNames[MAX_ITEMS];
    int itemCounts[MAX_ITEMS];
    int itemCount = 0;

    StatusEffect effects[MAX_EFFECTS];
    int effectCount = 0;

    LootEntry lootTable[MAX_LOOT];
    int lootSize = loadLootTable(lootTable);

    Recipe recipes[MAX_RECIPES];
    int recipeCount = loadRecipes(recipes);

    NPC merchant;
    loadMerchant(merchant);

    // =========================================================
    // ROOM 0 — Combat + Loot
    // =========================================================
    cout << "=== EQUIPPED ADVENTURER ===" << endl;

    int gobX = 10, gobY = 3, gobHP = 30;
    bool gobAlive = true;
    bool goldActive = false;
    int goldX = 0, goldY = 0;

    renderRoom0(playerX, playerY, gobX, gobY, gobAlive, goldActive, goldX, goldY);
    cout << "HUD|HP:" << playerHP << "|ATK:" << baseAtk << "|DEF:" << baseDef
         << "|Gold:" << playerGold << "|Room:" << room << endl;

    // Fight goblin
    playerX = 9; playerY = 3;
    cout << "Player moved to (9,3)" << endl;

    int dmg = 10;
    for (int i = 0; i < 3; i++) {
        gobHP -= dmg;
        cout << "Attack! Enemy HP: " << gobHP << endl;
        if (gobHP <= 0 && gobAlive) gobAlive = false;
    }
    cout << "Enemy defeated!" << endl;

    // Loot roll 1: gold
    string drop = rollLoot(lootTable, lootSize, "goblin", 15);
    cout << "LOOT|goblin|roll=15|drop=" << drop << endl;
    playerGold += 25;
    cout << "Picked up gold! Total: " << playerGold << endl;

    // Loot roll 2: sword
    drop = rollLoot(lootTable, lootSize, "goblin", 52);
    cout << "LOOT|goblin|roll=52|drop=" << drop << endl;
    addItem(itemNames, itemCounts, itemCount, "sword", 1);
    cout << "ITEM|sword|picked_up" << endl;

    // Room transition
    playerX = 19; playerY = 5;
    cout << "Room transition: 0 -> 1" << endl;
    room = 1;

    // =========================================================
    // ROOM 1 — Shop + Crafting + NPC
    // =========================================================
    playerX = 1; playerY = 5;
    renderRoom1(playerX, playerY);
    cout << "HUD|HP:" << playerHP << "|ATK:" << baseAtk << "|DEF:" << baseDef
         << "|Gold:" << playerGold << "|Room:" << room << endl;

    // Chest at (5,3)
    playerX = 5; playerY = 3;
    addItem(itemNames, itemCounts, itemCount, "iron_ore", 3);
    addItem(itemNames, itemCounts, itemCount, "wood", 2);
    cout << "CHEST|loot=iron_ore:3,wood:2" << endl;

    // Merchant dialog — buy potion
    playerX = 7; playerY = 5;
    cout << "NPC|merchant|adjacent" << endl;
    int mChoices[] = {0, 0}; // Buy potion -> Thanks
    runDialog(merchant, mChoices, 2);
    playerGold -= 10;
    addItem(itemNames, itemCounts, itemCount, "health_potion", 1);
    cout << "PURCHASED|health_potion|cost=10" << endl;

    // Craft iron_sword at (14,3)
    playerX = 14; playerY = 3;
    doCraft(recipes[0], itemNames, itemCounts, itemCount);
    cout << "CRAFTED|iron_sword|consumed=iron_ore:3,wood:2" << endl;

    printInventory(itemNames, itemCounts, itemCount);

    // Room transition
    playerX = 19; playerY = 5;
    cout << "Room transition: 1 -> 2" << endl;
    room = 2;

    // =========================================================
    // ROOM 2 — Boss Fight
    // =========================================================
    playerX = 1; playerY = 5;
    int bossX = 12, bossY = 5, bossHP = 80;
    bool bossAlive = true;
    int bossAtk = 12;

    renderRoom2(playerX, playerY, bossX, bossY, bossAlive);
    cout << "HUD|HP:" << playerHP << "|ATK:" << baseAtk << "|DEF:" << baseDef
         << "|Gold:" << playerGold << "|Room:" << room << endl;

    // Equip iron_sword: +8 ATK
    baseAtk = 18;
    cout << "EQUIPPED|iron_sword|ATK:" << baseAtk << endl;

    // Use health_potion: Shield(+5def, 4 turns)
    int potIdx = findItem(itemNames, itemCount, "health_potion");
    if (potIdx >= 0) itemCounts[potIdx]--;
    addEffect(effects, effectCount, "Shield", 5, 4);
    cout << "USED|health_potion" << endl;
    printEffects(effects, effectCount);

    // === Boss Combat: 5 turns ===
    for (int turn = 1; turn <= 5; turn++) {
        // Player attacks
        bossHP -= baseAtk;

        if (bossHP <= 0) {
            bossAlive = false;
            cout << "COMBAT|turn=" << turn << "|BossHP:" << bossHP << "|DEFEATED" << endl;
            break;
        }

        // Boss attacks
        playerHP -= bossAtk;

        // Tick effects
        int atk = baseAtk, def = baseDef;
        tickEffects(effects, effectCount, playerHP, atk, def);

        cout << "COMBAT|turn=" << turn << "|PlayerHP:" << playerHP
             << "|BossHP:" << bossHP << endl;
        printEffects(effects, effectCount);
    }

    // === Victory ===
    cout << "MILESTONE: Equipped Adventurer Complete!" << endl;
    cout << "FINAL|HP:" << playerHP << "|ATK:" << baseAtk << "|DEF:" << baseDef
         << "|Gold:" << playerGold << endl;
    cout << "GAME_MESSAGE|Badge: Equipped Adventurer unlocked!" << endl;
    cout << "SCORE|300" << endl;

    return 0;
}
`,

  tests: [
    {
      id: "g1",
      description: "Title screen printed",
      expectedOutput: "=== EQUIPPED ADVENTURER ===",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Goblin loot roll produces gold",
      expectedOutput: "LOOT\\|goblin\\|roll=15\\|drop=gold",
      isPattern: true,
    },
    {
      id: "g3",
      description: "Chest loot collected in Room 1",
      expectedOutput: "CHEST\\|loot=iron_ore:3,wood:2",
      isPattern: true,
    },
    {
      id: "g4",
      description: "Iron sword crafted from materials",
      expectedOutput: "CRAFTED\\|iron_sword\\|consumed=iron_ore:3,wood:2",
      isPattern: true,
    },
    {
      id: "g5",
      description: "Health potion purchased from merchant",
      expectedOutput: "PURCHASED\\|health_potion\\|cost=10",
      isPattern: true,
    },
    {
      id: "g6",
      description: "Iron sword equipped with ATK 18",
      expectedOutput: "EQUIPPED\\|iron_sword\\|ATK:18",
      isPattern: true,
    },
    {
      id: "g7",
      description: "Shield effect active from potion",
      expectedOutput: "FX\\|Shield:4",
      isPattern: true,
    },
    {
      id: "g8",
      description: "Boss defeated on turn 5",
      expectedOutput: "COMBAT\\|turn=5\\|BossHP:-10\\|DEFEATED",
      isPattern: true,
    },
    {
      id: "g9",
      description: "Milestone complete message",
      expectedOutput: "MILESTONE: Equipped Adventurer Complete!",
      isPattern: true,
    },
    {
      id: "g10",
      description: "Badge unlocked and score awarded",
      expectedOutput: "GAME_MESSAGE\\|Badge: Equipped Adventurer unlocked!",
      isPattern: true,
    },
  ],

  hints: [
    "Room 0: fight goblin (3x10dmg), roll loot twice (roll=15 for gold, roll=52 for sword), collect both, transition to Room 1.",
    "Room 1: open chest (iron_ore:3, wood:2), talk to merchant (choices [0,0] for buy potion), craft iron_sword, print INV, transition.",
    "Room 2: equip iron_sword (baseAtk=18), use health_potion for Shield(5,4). Then 5-turn boss combat loop.",
    "Boss combat: each turn player attacks (18dmg), check dead. If not, boss attacks (12dmg), tick effects, print COMBAT and FX.",
    "Boss HP: 80->62->44->26->8->-10. Player HP: 100->88->76->64->52. Shield active turns 1-4. Boss dies turn 5.",
  ],

  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

// ==============================
// RPG CORE — Lesson 45
// MILESTONE: Equipped Adventurer
// All inventory systems integrated.
// Three rooms. Loot. Crafting. Equipment.
// Status effects. Shops. NPC dialog.
// ==============================

// === LOOT TABLE (Lesson 41) ===
struct LootEntry { string enemyType; string item; int weight; };
const int MAX_LOOT = 50;

int loadLootTable(LootEntry table[]) {
    table[0] = {"goblin", "gold", 50};
    table[1] = {"goblin", "sword", 10};
    table[2] = {"goblin", "nothing", 40};
    table[3] = {"skeleton_boss", "rare_gem", 20};
    table[4] = {"skeleton_boss", "gold", 50};
    table[5] = {"skeleton_boss", "nothing", 30};
    return 6;
}

string rollLoot(LootEntry table[], int size, string type, int roll) {
    int acc = 0;
    for (int i = 0; i < size; i++) {
        if (table[i].enemyType == type) {
            acc += table[i].weight;
            if (roll < acc) return table[i].item;
        }
    }
    return "nothing";
}

// === INVENTORY + CRAFTING (Lesson 42) ===
const int MAX_INGREDIENTS = 5;
const int MAX_RECIPES = 20;
const int MAX_ITEMS = 30;

struct Recipe { string result; string ingredients[MAX_INGREDIENTS]; int quantities[MAX_INGREDIENTS]; int ingredientCount; };

int findItem(string names[], int count, string target) {
    for (int i = 0; i < count; i++) { if (names[i] == target) return i; }
    return -1;
}

void addItem(string names[], int counts[], int& count, string name, int qty) {
    int idx = findItem(names, count, name);
    if (idx >= 0) { counts[idx] += qty; return; }
    names[count] = name; counts[count] = qty; count++;
}

int loadRecipes(Recipe recipes[]) {
    recipes[0] = {"iron_sword", {"iron_ore", "wood"}, {3, 2}, 2};
    recipes[1] = {"health_potion", {"herb", "water"}, {2, 1}, 2};
    recipes[2] = {"steel_shield", {"iron_ore", "leather"}, {5, 2}, 2};
    return 3;
}

bool canCraft(Recipe& r, string names[], int counts[], int count) {
    for (int i = 0; i < r.ingredientCount; i++) {
        int idx = findItem(names, count, r.ingredients[i]);
        if (idx < 0 || counts[idx] < r.quantities[i]) return false;
    }
    return true;
}

void doCraft(Recipe& r, string names[], int counts[], int& count) {
    for (int i = 0; i < r.ingredientCount; i++) {
        int idx = findItem(names, count, r.ingredients[i]);
        counts[idx] -= r.quantities[i];
    }
    addItem(names, counts, count, r.result, 1);
}

void printInventory(string names[], int counts[], int count) {
    cout << "INV";
    for (int i = 0; i < count; i++) cout << "|" << names[i] << ":" << counts[i];
    cout << endl;
}

// === STATUS EFFECTS (Lesson 43) ===
const int MAX_EFFECTS = 10;
struct StatusEffect { string type; int magnitude; int duration; };

void addEffect(StatusEffect fx[], int& count, string type, int mag, int dur) {
    for (int i = 0; i < count; i++) {
        if (fx[i].type == type) { fx[i].duration = dur; fx[i].magnitude = mag; return; }
    }
    fx[count] = {type, mag, dur}; count++;
}

void tickEffects(StatusEffect fx[], int& count, int& hp, int& atk, int& def) {
    for (int i = 0; i < count; i++) {
        if (fx[i].type == "Poison") hp -= fx[i].magnitude;
        if (fx[i].type == "Shield") def += fx[i].magnitude;
        if (fx[i].type == "Strength") atk += fx[i].magnitude;
        fx[i].duration--;
    }
    int w = 0;
    for (int i = 0; i < count; i++) { if (fx[i].duration > 0) fx[w++] = fx[i]; }
    count = w;
}

void printEffects(StatusEffect fx[], int count) {
    if (count == 0) { cout << "FX|none" << endl; return; }
    cout << "FX";
    for (int i = 0; i < count; i++) cout << "|" << fx[i].type << ":" << fx[i].duration;
    cout << endl;
}

// === DIALOG (Lesson 44) ===
const int MAX_CHOICES = 4;
const int MAX_NODES = 20;
struct DialogChoice { string text; int targetNode; };
struct DialogNode { int id; string text; DialogChoice choices[MAX_CHOICES]; int choiceCount; bool isEnd; };
struct NPC { string name; int gridX, gridY; DialogNode nodes[MAX_NODES]; int nodeCount; };

int findNode(NPC& npc, int nodeId) {
    for (int i = 0; i < npc.nodeCount; i++) {
        if (npc.nodes[i].id == nodeId) return i;
    }
    return -1;
}

void loadMerchant(NPC& npc) {
    npc.name = "merchant"; npc.gridX = 8; npc.gridY = 5; npc.nodeCount = 3;
    npc.nodes[0] = {0, "Welcome! Buy a potion?",
        {{"Buy potion", 1}, {"No thanks", 99}}, 2, false};
    npc.nodes[1] = {1, "Here you go! Stay safe.",
        {{"Thanks", 99}}, 1, false};
    npc.nodes[2] = {99, "Good luck out there!", {}, 0, true};
}

void runDialog(NPC& npc, int choices[], int choiceCount) {
    int cur = 0, ci = 0;
    while (true) {
        int ni = findNode(npc, cur);
        if (ni < 0) break;
        DialogNode& nd = npc.nodes[ni];
        cout << "DIALOG|" << npc.name << "|\\"" << nd.text << "\\"" << endl;
        if (nd.isEnd || ci >= choiceCount) break;
        int pick = choices[ci++];
        if (pick < nd.choiceCount) cur = nd.choices[pick].targetNode;
        else break;
    }
}

// === GRID RENDERING ===
void renderRoom0(int px, int py, int ex, int ey, bool eAlive,
                 bool goldActive, int gx, int gy) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) cout << '#';
            else if (col == px && row == py) cout << '@';
            else if (eAlive && col == ex && row == ey) cout << 'E';
            else if (goldActive && col == gx && row == gy) cout << 'G';
            else if (col == 18 && row == 5) cout << 'D';
            else cout << '.';
        }
        cout << endl;
    }
}

void renderRoom1(int px, int py) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) cout << '#';
            else if (col == px && row == py) cout << '@';
            else if (col == 8 && row == 5) cout << 'N';
            else if (col == 14 && row == 3) cout << '$';
            else if (col == 5 && row == 3) cout << '!';
            else if (col == 18 && row == 5) cout << 'D';
            else cout << '.';
        }
        cout << endl;
    }
}

void renderRoom2(int px, int py, int bx, int by, bool bAlive) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            if (row == 0 || row == 9 || col == 0 || col == 19) cout << '#';
            else if (col == px && row == py) cout << '@';
            else if (bAlive && col == bx && row == by) cout << 'E';
            else cout << '.';
        }
        cout << endl;
    }
}

// =============================================
// MAIN — THE EQUIPPED ADVENTURER (MILESTONE)
// =============================================
int main() {
    int playerX = 2, playerY = 5;
    int playerHP = 100, baseAtk = 10, baseDef = 5;
    int playerGold = 0;
    int room = 0;

    string itemNames[MAX_ITEMS];
    int itemCounts[MAX_ITEMS];
    int itemCount = 0;

    StatusEffect effects[MAX_EFFECTS];
    int effectCount = 0;

    LootEntry lootTable[MAX_LOOT];
    int lootSize = loadLootTable(lootTable);

    Recipe recipes[MAX_RECIPES];
    int recipeCount = loadRecipes(recipes);

    NPC merchant;
    loadMerchant(merchant);

    // =========================================================
    // ROOM 0 — Combat + Loot
    // =========================================================
    cout << "=== EQUIPPED ADVENTURER ===" << endl;

    int gobX = 10, gobY = 3, gobHP = 30;
    bool gobAlive = true;
    bool goldActive = false;
    int goldX = 0, goldY = 0;

    renderRoom0(playerX, playerY, gobX, gobY, gobAlive, goldActive, goldX, goldY);
    cout << "HUD|HP:" << playerHP << "|ATK:" << baseAtk << "|DEF:" << baseDef
         << "|Gold:" << playerGold << "|Room:" << room << endl;

    // Fight goblin
    playerX = 9; playerY = 3;
    cout << "Player moved to (9,3)" << endl;

    int dmg = 10;
    for (int i = 0; i < 3; i++) {
        gobHP -= dmg;
        cout << "Attack! Enemy HP: " << gobHP << endl;
        if (gobHP <= 0 && gobAlive) gobAlive = false;
    }
    cout << "Enemy defeated!" << endl;

    // Loot roll 1: gold
    string drop = rollLoot(lootTable, lootSize, "goblin", 15);
    cout << "LOOT|goblin|roll=15|drop=" << drop << endl;
    playerGold += 25;
    cout << "Picked up gold! Total: " << playerGold << endl;

    // Loot roll 2: sword
    drop = rollLoot(lootTable, lootSize, "goblin", 52);
    cout << "LOOT|goblin|roll=52|drop=" << drop << endl;
    addItem(itemNames, itemCounts, itemCount, "sword", 1);
    cout << "ITEM|sword|picked_up" << endl;

    // Room transition
    playerX = 19; playerY = 5;
    cout << "Room transition: 0 -> 1" << endl;
    room = 1;

    // =========================================================
    // ROOM 1 — Shop + Crafting + NPC
    // =========================================================
    playerX = 1; playerY = 5;
    renderRoom1(playerX, playerY);
    cout << "HUD|HP:" << playerHP << "|ATK:" << baseAtk << "|DEF:" << baseDef
         << "|Gold:" << playerGold << "|Room:" << room << endl;

    // Chest at (5,3)
    playerX = 5; playerY = 3;
    addItem(itemNames, itemCounts, itemCount, "iron_ore", 3);
    addItem(itemNames, itemCounts, itemCount, "wood", 2);
    cout << "CHEST|loot=iron_ore:3,wood:2" << endl;

    // Merchant dialog — buy potion
    playerX = 7; playerY = 5;
    cout << "NPC|merchant|adjacent" << endl;
    int mChoices[] = {0, 0};
    runDialog(merchant, mChoices, 2);
    playerGold -= 10;
    addItem(itemNames, itemCounts, itemCount, "health_potion", 1);
    cout << "PURCHASED|health_potion|cost=10" << endl;

    // Craft iron_sword at (14,3)
    playerX = 14; playerY = 3;
    doCraft(recipes[0], itemNames, itemCounts, itemCount);
    cout << "CRAFTED|iron_sword|consumed=iron_ore:3,wood:2" << endl;

    printInventory(itemNames, itemCounts, itemCount);

    // Room transition
    playerX = 19; playerY = 5;
    cout << "Room transition: 1 -> 2" << endl;
    room = 2;

    // =========================================================
    // ROOM 2 — Boss Fight
    // =========================================================
    playerX = 1; playerY = 5;
    int bossX = 12, bossY = 5, bossHP = 80;
    bool bossAlive = true;
    int bossAtk = 12;

    renderRoom2(playerX, playerY, bossX, bossY, bossAlive);
    cout << "HUD|HP:" << playerHP << "|ATK:" << baseAtk << "|DEF:" << baseDef
         << "|Gold:" << playerGold << "|Room:" << room << endl;

    // Equip iron_sword: +8 ATK
    baseAtk = 18;
    cout << "EQUIPPED|iron_sword|ATK:" << baseAtk << endl;

    // Use health_potion: Shield(+5def, 4 turns)
    int potIdx = findItem(itemNames, itemCount, "health_potion");
    if (potIdx >= 0) itemCounts[potIdx]--;
    addEffect(effects, effectCount, "Shield", 5, 4);
    cout << "USED|health_potion" << endl;
    printEffects(effects, effectCount);

    // === Boss Combat: 5 turns ===
    for (int turn = 1; turn <= 5; turn++) {
        bossHP -= baseAtk;

        if (bossHP <= 0) {
            bossAlive = false;
            cout << "COMBAT|turn=" << turn << "|BossHP:" << bossHP << "|DEFEATED" << endl;
            break;
        }

        playerHP -= bossAtk;

        int atk = baseAtk, def = baseDef;
        tickEffects(effects, effectCount, playerHP, atk, def);

        cout << "COMBAT|turn=" << turn << "|PlayerHP:" << playerHP
             << "|BossHP:" << bossHP << endl;
        printEffects(effects, effectCount);
    }

    // === Victory ===
    cout << "MILESTONE: Equipped Adventurer Complete!" << endl;
    cout << "FINAL|HP:" << playerHP << "|ATK:" << baseAtk << "|DEF:" << baseDef
         << "|Gold:" << playerGold << endl;
    cout << "GAME_MESSAGE|Badge: Equipped Adventurer unlocked!" << endl;
    cout << "SCORE|300" << endl;

    return 0;
}
`,
};
