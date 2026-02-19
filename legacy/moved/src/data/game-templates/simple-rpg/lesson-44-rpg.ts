import type { GameLessonVariant } from "@/types/game";

export const lesson44RPG: GameLessonVariant = {
  lessonId: "rpg-44-npc-dialog",

  instructions: `# NPC Dialog System — Dungeon Conversations

## Mental Model

There is a pattern here that you already know. A dialog tree is just a state machine wearing a friendly face. Each dialog node is a state. Each player choice is a transition. The greeting is the initial state. "Goodbye" is a terminal state. You built state machines in Lesson 19. This is the same pattern with friendlier labels.

Every RPG dialog system — Baldur's Gate, Undertale, Disco Elysium — reduces to this: a node has text and choices, each choice points to another node. The player navigates the graph. The data structure never changes.

## What Breaks Without This

Without dialog, NPCs are furniture. They occupy tiles but contribute nothing. Dialog transforms tiles into characters with personalities, information, and services. An NPC who says "The dragon is weak to ice" gives strategy. An NPC who sells potions connects to the economy. Dialog is the interface between player and game knowledge.

## The Fix

A dialog node is a struct: text, choices (each with a label and target node ID), and an optional action. The engine loops: display text, show choices, follow the chosen edge. Repeat until terminal.

\`\`\`cpp
struct DialogNode {
    int id;
    string text;
    DialogChoice choices[4];
    int choiceCount;
    bool isEnd;
};
\`\`\`

## Pattern Insight

The Mediator pattern: dialog mediates between the player and game systems. Instead of directly accessing the shop or quest system, the player goes through NPC dialog. The NPC routes intent to the right system.

## Scalability Insight

Adding a new NPC: one tile and one dialog block. Adding a quest: conditional nodes. Adding a shop: merchant dialog branches. The dialog system is the universal interface to everything.

## Your Task

Build NPC dialog integrated into the dungeon:

1. Load 2 NPCs (merchant at 15,5 and sage at 3,7). Print \`NPCS|loaded=2\`
2. Render 20x10 grid: @ at (5,5), N at (15,5), N at (3,7). Print \`HUD|HP:100|Gold:50|Room:0\`
3. Move to (14,5). Print \`NPC|merchant|adjacent\`
4. Merchant dialog: "Buy potion" (choice 0) -> "Thanks" (choice 0). Print DIALOG lines. Print \`PURCHASED|health_potion|cost=10\` and \`HUD|HP:100|Gold:40|Items:1\`
5. Move to (4,7). Print \`NPC|sage|adjacent\`
6. Sage dialog: "Tell me more" (choice 0) -> "Accept" (choice 0). Print DIALOG lines. Print \`ITEM_RECEIVED|ancient_scroll\`
7. Print \`QUEST|hint=skeleton_king_weak_to_fire\`
8. Print \`SCORE|175\`

## Common Mistake

Letting the player buy items they cannot afford. Always validate playerGold >= cost before processing the purchase. Without the check, gold goes negative and the economy breaks.

## Elite Insight

Fallout: New Vegas has 65,000+ lines of dialog. Each line is a graph node with conditional edges. The engine is structurally identical to yours. Conditions are metadata on edges — one boolean field per choice, infinite expressiveness.

## Pattern Recognition

NPC dialog is a navigation structure: the player navigates between content nodes, just as a web user navigates between pages. Hyperlinks and dialog choices are the same pattern: labeled transitions between content nodes.

## Skill Reinforcement

- NPC grid placement with N tiles
- Adjacency detection for interaction triggers
- Dialog tree traversal via choice-driven navigation
- Action integration: purchases and item grants
- Multi-NPC support with independent dialog graphs

## Mastery Check

Why simulate choices as an integer array? Deterministic testing requires deterministic input. The choice array makes dialog traversal verifiable. In production, you replace the array with user input. The engine does not change.`,

  starterCode: `#include <iostream>
#include <string>
using namespace std;

const int MAX_CHOICES = 4;
const int MAX_NODES = 20;
const int MAX_NPCS = 10;

struct DialogChoice {
    string text;
    int targetNode;
};

struct DialogNode {
    int id;
    string text;
    DialogChoice choices[MAX_CHOICES];
    int choiceCount;
    bool isEnd;
};

struct NPC {
    string name;
    int gridX, gridY;
    DialogNode nodes[MAX_NODES];
    int nodeCount;
};

// TODO: Implement findNode, loadNPCs, runDialog, renderGrid

int main() {
    NPC npcs[MAX_NPCS];
    int npcCount = 0;

    int playerX = 5, playerY = 5;
    int playerHP = 100, playerGold = 50;
    int items = 0;

    // TODO: Load NPCs, render grid, print HUD
    // TODO: Merchant dialog — buy potion path
    // TODO: Sage dialog — get scroll path
    // TODO: Print quest hint and SCORE|175

    return 0;
}
`,

  solutionCode: `#include <iostream>
#include <string>
using namespace std;

const int MAX_CHOICES = 4;
const int MAX_NODES = 20;
const int MAX_NPCS = 10;

struct DialogChoice {
    string text;
    int targetNode;
};

struct DialogNode {
    int id;
    string text;
    DialogChoice choices[MAX_CHOICES];
    int choiceCount;
    bool isEnd;
};

struct NPC {
    string name;
    int gridX, gridY;
    DialogNode nodes[MAX_NODES];
    int nodeCount;
};

int findNode(NPC& npc, int nodeId) {
    for (int i = 0; i < npc.nodeCount; i++) {
        if (npc.nodes[i].id == nodeId) return i;
    }
    return -1;
}

int loadNPCs(NPC npcs[]) {
    // Merchant
    npcs[0].name = "merchant";
    npcs[0].gridX = 15; npcs[0].gridY = 5;
    npcs[0].nodeCount = 4;
    npcs[0].nodes[0] = {0, "Welcome! What do you need?",
        {{"Buy potion", 1}, {"Advice", 2}, {"Bye", 99}}, 3, false};
    npcs[0].nodes[1] = {1, "Here is your potion!",
        {{"Thanks", 99}}, 1, false};
    npcs[0].nodes[2] = {2, "The skeleton king fears fire.",
        {{"Got it", 0}, {"Bye", 99}}, 2, false};
    npcs[0].nodes[3] = {99, "Safe travels!",
        {}, 0, true};

    // Sage
    npcs[1].name = "sage";
    npcs[1].gridX = 3; npcs[1].gridY = 7;
    npcs[1].nodeCount = 3;
    npcs[1].nodes[0] = {0, "I sense great potential in you.",
        {{"Tell me more", 1}, {"Bye", 99}}, 2, false};
    npcs[1].nodes[1] = {1, "Take this ancient scroll. It may help.",
        {{"Accept", 99}}, 1, false};
    npcs[1].nodes[2] = {99, "May wisdom guide you.",
        {}, 0, true};

    return 2;
}

void runDialog(NPC& npc, int choices[], int choiceCount) {
    int currentNode = 0;
    int choiceIdx = 0;

    while (true) {
        int ni = findNode(npc, currentNode);
        if (ni < 0) break;

        DialogNode& node = npc.nodes[ni];
        cout << "DIALOG|" << npc.name << "|\\"" << node.text << "\\"" << endl;

        if (node.isEnd) break;
        if (choiceIdx >= choiceCount) break;

        int pick = choices[choiceIdx++];
        if (pick < node.choiceCount) {
            currentNode = node.choices[pick].targetNode;
        } else {
            break;
        }
    }
}

void renderGrid(int px, int py, NPC npcs[], int npcCount) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            bool isNPC = false;
            for (int n = 0; n < npcCount; n++) {
                if (col == npcs[n].gridX && row == npcs[n].gridY) {
                    cout << 'N';
                    isNPC = true;
                    break;
                }
            }
            if (isNPC) continue;

            if (row == 0 || row == 9 || col == 0 || col == 19) {
                cout << '#';
            } else if (col == px && row == py) {
                cout << '@';
            } else {
                cout << '.';
            }
        }
        cout << endl;
    }
}

int main() {
    NPC npcs[MAX_NPCS];

    int playerX = 5, playerY = 5;
    int playerHP = 100, playerGold = 50;
    int items = 0;

    int npcCount = loadNPCs(npcs);
    cout << "NPCS|loaded=" << npcCount << endl;

    // === Render grid ===
    renderGrid(playerX, playerY, npcs, npcCount);
    cout << "HUD|HP:" << playerHP << "|Gold:" << playerGold << "|Room:0" << endl;

    // === Merchant dialog: Buy potion ===
    playerX = 14; playerY = 5;
    cout << "NPC|merchant|adjacent" << endl;

    int merchantChoices[] = {0, 0}; // Buy potion -> Thanks
    runDialog(npcs[0], merchantChoices, 2);

    playerGold -= 10;
    items++;
    cout << "PURCHASED|health_potion|cost=10" << endl;
    cout << "HUD|HP:" << playerHP << "|Gold:" << playerGold << "|Items:" << items << endl;

    // === Sage dialog: Get scroll ===
    playerX = 4; playerY = 7;
    cout << "NPC|sage|adjacent" << endl;

    int sageChoices[] = {0, 0}; // Tell me more -> Accept
    runDialog(npcs[1], sageChoices, 2);

    cout << "ITEM_RECEIVED|ancient_scroll" << endl;

    cout << "QUEST|hint=skeleton_king_weak_to_fire" << endl;

    cout << "SCORE|175" << endl;

    return 0;
}
`,

  tests: [
    {
      id: "g1",
      description: "NPCs loaded successfully",
      expectedOutput: "NPCS\\|loaded=2",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Health potion purchased from merchant",
      expectedOutput: "PURCHASED\\|health_potion\\|cost=10",
      isPattern: true,
    },
    {
      id: "g3",
      description: "Quest hint received from sage",
      expectedOutput: "QUEST\\|hint=skeleton_king_weak_to_fire",
      isPattern: true,
    },
  ],

  hints: [
    "loadNPCs: merchant has 4 nodes (0: welcome, 1: potion, 2: advice, 99: goodbye). Sage has 3 nodes (0: greeting, 1: scroll, 99: farewell).",
    "runDialog: start at node 0. Print DIALOG line. If isEnd, break. Otherwise follow choice at choiceIdx to next node.",
    "Merchant buy path: choice 0 from node 0 -> node 1 (potion). Choice 0 from node 1 -> node 99 (end).",
    "After merchant dialog, subtract 10 gold and increment items. After sage dialog, print ITEM_RECEIVED and QUEST.",
    "renderGrid: loop through npcs to check NPC positions before checking wall/player. Print N for NPC tiles.",
  ],

  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

// ==============================
// RPG CORE — Lesson 44
// NPC Dialog: Branching Conversations
// ==============================

// === LOOT TABLE (Lesson 41) ===
struct LootEntry { string enemyType; string item; int weight; };
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

// === CRAFTING (Lesson 42) ===
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

// === DIALOG SYSTEM (Lesson 44) ===
const int MAX_CHOICES = 4;
const int MAX_NODES = 20;
const int MAX_NPCS = 10;

struct DialogChoice { string text; int targetNode; };
struct DialogNode { int id; string text; DialogChoice choices[MAX_CHOICES]; int choiceCount; bool isEnd; };
struct NPC { string name; int gridX, gridY; DialogNode nodes[MAX_NODES]; int nodeCount; };

int findNode(NPC& npc, int nodeId) {
    for (int i = 0; i < npc.nodeCount; i++) {
        if (npc.nodes[i].id == nodeId) return i;
    }
    return -1;
}

int loadNPCs(NPC npcs[]) {
    npcs[0].name = "merchant";
    npcs[0].gridX = 15; npcs[0].gridY = 5; npcs[0].nodeCount = 4;
    npcs[0].nodes[0] = {0, "Welcome! What do you need?",
        {{"Buy potion", 1}, {"Advice", 2}, {"Bye", 99}}, 3, false};
    npcs[0].nodes[1] = {1, "Here is your potion!",
        {{"Thanks", 99}}, 1, false};
    npcs[0].nodes[2] = {2, "The skeleton king fears fire.",
        {{"Got it", 0}, {"Bye", 99}}, 2, false};
    npcs[0].nodes[3] = {99, "Safe travels!", {}, 0, true};

    npcs[1].name = "sage";
    npcs[1].gridX = 3; npcs[1].gridY = 7; npcs[1].nodeCount = 3;
    npcs[1].nodes[0] = {0, "I sense great potential in you.",
        {{"Tell me more", 1}, {"Bye", 99}}, 2, false};
    npcs[1].nodes[1] = {1, "Take this ancient scroll. It may help.",
        {{"Accept", 99}}, 1, false};
    npcs[1].nodes[2] = {99, "May wisdom guide you.", {}, 0, true};

    return 2;
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

void renderGrid(int px, int py, NPC npcs[], int npcCount) {
    for (int row = 0; row < 10; row++) {
        for (int col = 0; col < 20; col++) {
            bool isNPC = false;
            for (int n = 0; n < npcCount; n++) {
                if (col == npcs[n].gridX && row == npcs[n].gridY) {
                    cout << 'N'; isNPC = true; break;
                }
            }
            if (isNPC) continue;
            if (row == 0 || row == 9 || col == 0 || col == 19) cout << '#';
            else if (col == px && row == py) cout << '@';
            else cout << '.';
        }
        cout << endl;
    }
}

int main() {
    NPC npcs[MAX_NPCS];
    int playerX = 5, playerY = 5;
    int playerHP = 100, playerGold = 50;
    int items = 0;

    int npcCount = loadNPCs(npcs);
    cout << "NPCS|loaded=" << npcCount << endl;

    renderGrid(playerX, playerY, npcs, npcCount);
    cout << "HUD|HP:" << playerHP << "|Gold:" << playerGold << "|Room:0" << endl;

    // Merchant
    playerX = 14; playerY = 5;
    cout << "NPC|merchant|adjacent" << endl;
    int mC[] = {0, 0};
    runDialog(npcs[0], mC, 2);
    playerGold -= 10; items++;
    cout << "PURCHASED|health_potion|cost=10" << endl;
    cout << "HUD|HP:" << playerHP << "|Gold:" << playerGold << "|Items:" << items << endl;

    // Sage
    playerX = 4; playerY = 7;
    cout << "NPC|sage|adjacent" << endl;
    int sC[] = {0, 0};
    runDialog(npcs[1], sC, 2);
    cout << "ITEM_RECEIVED|ancient_scroll" << endl;
    cout << "QUEST|hint=skeleton_king_weak_to_fire" << endl;

    cout << "SCORE|175" << endl;
    return 0;
}
`,
};
