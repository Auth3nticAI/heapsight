import type { GameLessonVariant } from "@/types/game";

export const lesson43RPG: GameLessonVariant = {
  lessonId: "rpg-43-status-effects",

  instructions: `# Status Effects — Combat Buffs and Debuffs

## Mental Model

There is a pattern here that separates static combat from dynamic combat. A sword does 10 damage forever. A poisoned sword does 10 damage plus 3 per turn for 5 turns. The poison is not a different sword — it is a status effect attached to the target. Each effect has a type, magnitude, and duration. Each turn, it ticks: magnitude fires, duration decrements. At zero, the effect expires.

Status effects are the Decorator pattern applied to entities. The base entity has stats. Effects temporarily modify those stats. The entity does not know about the effects — the effect system applies and removes modifiers each turn. The base is never permanently mutated.

## What Breaks Without This

Without effects, combat is flat arithmetic: my attack minus your defense. Every fight feels the same. Effects add temporal dynamics: "I am poisoned, so I need to heal." "Shield buff is active, so I can be aggressive." "Enemy is slowed, so I can kite." Effects turn combat from math into strategy.

## The Fix

An effect is a struct: type, magnitude, duration. Each turn, tickEffects iterates active effects, applies per-turn logic, decrements duration, and removes expired entries via write-pointer compaction.

\`\`\`cpp
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
\`\`\`

## Pattern Insight

The State pattern in miniature. Each effect type defines a behavior that activates each turn. The tick function dispatches by type. Add a new effect type? Add one if-branch. The loop never changes shape.

## Scalability Insight

Final Fantasy has dozens of status effects. The tick loop is identical — just more branches. Scale is linear in the number of effect types.

## Your Task

Wire status effects into combat:

1. Player starts: HP=100, ATK=10, DEF=5. Enemy HP=50, ATK=5, has poison attack. Print \`HUD|HP:100|ATK:10|DEF:5|FX:none\`
2. Drink Shield potion: Shield(+5def, 3 turns). Print \`USED|shield_potion\` then \`FX|Shield:3\`
3. Turn 1: Player attacks (10dmg, enemy HP:40). Enemy attacks (5dmg, applies Poison(3,3)). Tick. Print \`COMBAT|turn=1|PlayerHP:92|EnemyHP:40\` then \`FX|Shield:2|Poison:2\`
4. Turn 2: Player attacks (10dmg, enemy HP:30). Enemy attacks (5dmg). Tick. Print \`COMBAT|turn=2|PlayerHP:84|EnemyHP:30\` then \`FX|Shield:1|Poison:1\`
5. Drink Strength potion: Strength(+5atk, 3 turns). Print \`USED|strength_potion\` then \`FX|Strength:3\`
6. Turn 3: Player attacks (15dmg, enemy HP:15). Enemy attacks (5dmg). Tick: Shield+Poison expire. Print \`COMBAT|turn=3|PlayerHP:76|EnemyHP:15\` then \`FX|Strength:2\`
7. Turn 4: Player attacks (15dmg, enemy HP:0). Print \`COMBAT|turn=4|EnemyHP:0|DEFEATED\`
8. Print \`FINAL|HP:76|ATK:10|DEF:5\` then \`SCORE|175\`

## Common Mistake

Applying effect bonuses permanently. Shield adds +5 DEF during its duration only. Reset to base stats before each tick. If you add 5 every tick without resetting, DEF grows by 5 per turn indefinitely.

## Elite Insight

Pokemon's status system (Burn, Paralysis, Poison, Sleep, Freeze) uses this exact pattern. Per-turn effects with different behaviors. Your RPG and Pokemon are architecturally identical.

## Pattern Recognition

The tick-decrement-expire pattern: cooldowns, buffs, power-ups, particle lifetimes. Temporary data with a lifecycle. One of the most common patterns in interactive software.

## Skill Reinforcement

- Status effect application with refresh semantics
- Per-turn tick with stat modification and reset
- Effect expiry via array compaction
- Combat integration with modified damage calculations

## Mastery Check

Why show effects in the HUD? Because invisible mechanics feel like bugs. If the player is losing HP per turn without knowing why, they think the game is broken. The FX line is a debugging tool for the player.`,

  starterCode: `#include <iostream>
#include <string>
using namespace std;

const int MAX_EFFECTS = 10;

struct StatusEffect {
    string type;
    int magnitude;
    int duration;
};

// TODO: Implement addEffect, tickEffects, printEffects

int main() {
    StatusEffect effects[MAX_EFFECTS];
    int effectCount = 0;

    int hp = 100, baseAtk = 10, baseDef = 5;
    int enemyHP = 50, enemyAtk = 5;

    // TODO: Print initial HUD|HP:100|ATK:10|DEF:5|FX:none

    // TODO: Use shield potion, print USED and FX

    // TODO: Combat turns 1-4 with effect ticks

    // TODO: Print FINAL and SCORE|175

    return 0;
}
`,

  solutionCode: `#include <iostream>
#include <string>
using namespace std;

const int MAX_EFFECTS = 10;

struct StatusEffect {
    string type;
    int magnitude;
    int duration;
};

void addEffect(StatusEffect effects[], int& count, string type, int mag, int dur) {
    for (int i = 0; i < count; i++) {
        if (effects[i].type == type) {
            effects[i].duration = dur;
            effects[i].magnitude = mag;
            return;
        }
    }
    effects[count] = {type, mag, dur};
    count++;
}

void tickEffects(StatusEffect effects[], int& count, int& hp, int& atk, int& def) {
    for (int i = 0; i < count; i++) {
        if (effects[i].type == "Poison") hp -= effects[i].magnitude;
        if (effects[i].type == "Shield") def += effects[i].magnitude;
        if (effects[i].type == "Strength") atk += effects[i].magnitude;
        effects[i].duration--;
    }
    int write = 0;
    for (int i = 0; i < count; i++) {
        if (effects[i].duration > 0) {
            effects[write++] = effects[i];
        }
    }
    count = write;
}

void printEffects(StatusEffect effects[], int count) {
    if (count == 0) {
        cout << "FX|none" << endl;
        return;
    }
    cout << "FX";
    for (int i = 0; i < count; i++) {
        cout << "|" << effects[i].type << ":" << effects[i].duration;
    }
    cout << endl;
}

int main() {
    StatusEffect effects[MAX_EFFECTS];
    int effectCount = 0;

    int hp = 100, baseAtk = 10, baseDef = 5;
    int enemyHP = 50, enemyAtk = 5;

    cout << "HUD|HP:" << hp << "|ATK:" << baseAtk << "|DEF:" << baseDef << "|FX:none" << endl;

    // === Shield potion ===
    addEffect(effects, effectCount, "Shield", 5, 3);
    cout << "USED|shield_potion" << endl;
    printEffects(effects, effectCount);

    // === Combat Turn 1 ===
    enemyHP -= baseAtk; // 50-10=40
    hp -= enemyAtk;     // 100-5=95
    addEffect(effects, effectCount, "Poison", 3, 3);
    int atk = baseAtk, def = baseDef;
    tickEffects(effects, effectCount, hp, atk, def);
    // hp: 95-3=92
    cout << "COMBAT|turn=1|PlayerHP:" << hp << "|EnemyHP:" << enemyHP << endl;
    printEffects(effects, effectCount);

    // === Combat Turn 2 ===
    enemyHP -= baseAtk; // 40-10=30
    hp -= enemyAtk;     // 92-5=87
    atk = baseAtk; def = baseDef;
    tickEffects(effects, effectCount, hp, atk, def);
    // hp: 87-3=84
    cout << "COMBAT|turn=2|PlayerHP:" << hp << "|EnemyHP:" << enemyHP << endl;
    printEffects(effects, effectCount);

    // === Strength potion ===
    addEffect(effects, effectCount, "Strength", 5, 3);
    cout << "USED|strength_potion" << endl;
    printEffects(effects, effectCount);

    // === Combat Turn 3 ===
    enemyHP -= (baseAtk + 5); // 30-15=15
    hp -= enemyAtk;           // 84-5=79
    atk = baseAtk; def = baseDef;
    tickEffects(effects, effectCount, hp, atk, def);
    // hp: 79-3=76 (poison last tick), shield expires, poison expires
    cout << "COMBAT|turn=3|PlayerHP:" << hp << "|EnemyHP:" << enemyHP << endl;
    printEffects(effects, effectCount);

    // === Combat Turn 4 ===
    enemyHP -= (baseAtk + 5); // 15-15=0
    cout << "COMBAT|turn=4|EnemyHP:" << enemyHP << "|DEFEATED" << endl;

    cout << "FINAL|HP:" << hp << "|ATK:" << baseAtk << "|DEF:" << baseDef << endl;
    cout << "SCORE|175" << endl;

    return 0;
}
`,

  tests: [
    {
      id: "g1",
      description: "Initial HUD with base stats and no effects",
      expectedOutput: "HUD\\|HP:100\\|ATK:10\\|DEF:5\\|FX:none",
      isPattern: true,
    },
    {
      id: "g2",
      description: "Combat turn 1 shows correct HP after poison and combat",
      expectedOutput: "COMBAT\\|turn=1\\|PlayerHP:92\\|EnemyHP:40",
      isPattern: true,
    },
    {
      id: "g3",
      description: "Enemy defeated on turn 4",
      expectedOutput: "COMBAT\\|turn=4\\|EnemyHP:0\\|DEFEATED",
      isPattern: true,
    },
  ],

  hints: [
    "addEffect: check if type already exists. If yes, refresh duration and magnitude. If no, add at effects[count] and increment.",
    "Before each tick, reset atk and def to base values. Effects apply bonuses during tick only for the current turn.",
    "Turn 1 math: player attacks (10dmg), enemy attacks (5dmg => hp=95), then tick poison (-3 => hp=92). Shield makes def=10.",
    "Turn 3: strength active so player does 15dmg. After tick, poison (dur was 1) and shield (dur was 1) both expire.",
    "printEffects: if count==0, print FX|none. Otherwise print FX|type:duration for each active effect.",
  ],

  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

// ==============================
// RPG CORE — Lesson 43
// Status Effects: Buffs and Debuffs
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

int main() {
    StatusEffect effects[MAX_EFFECTS];
    int effectCount = 0;

    int hp = 100, baseAtk = 10, baseDef = 5;
    int enemyHP = 50, enemyAtk = 5;

    cout << "HUD|HP:" << hp << "|ATK:" << baseAtk << "|DEF:" << baseDef << "|FX:none" << endl;

    // Shield potion
    addEffect(effects, effectCount, "Shield", 5, 3);
    cout << "USED|shield_potion" << endl;
    printEffects(effects, effectCount);

    // Turn 1
    enemyHP -= baseAtk;
    hp -= enemyAtk;
    addEffect(effects, effectCount, "Poison", 3, 3);
    int atk = baseAtk, def = baseDef;
    tickEffects(effects, effectCount, hp, atk, def);
    cout << "COMBAT|turn=1|PlayerHP:" << hp << "|EnemyHP:" << enemyHP << endl;
    printEffects(effects, effectCount);

    // Turn 2
    enemyHP -= baseAtk;
    hp -= enemyAtk;
    atk = baseAtk; def = baseDef;
    tickEffects(effects, effectCount, hp, atk, def);
    cout << "COMBAT|turn=2|PlayerHP:" << hp << "|EnemyHP:" << enemyHP << endl;
    printEffects(effects, effectCount);

    // Strength potion
    addEffect(effects, effectCount, "Strength", 5, 3);
    cout << "USED|strength_potion" << endl;
    printEffects(effects, effectCount);

    // Turn 3
    enemyHP -= (baseAtk + 5);
    hp -= enemyAtk;
    atk = baseAtk; def = baseDef;
    tickEffects(effects, effectCount, hp, atk, def);
    cout << "COMBAT|turn=3|PlayerHP:" << hp << "|EnemyHP:" << enemyHP << endl;
    printEffects(effects, effectCount);

    // Turn 4
    enemyHP -= (baseAtk + 5);
    cout << "COMBAT|turn=4|EnemyHP:" << enemyHP << "|DEFEATED" << endl;

    cout << "FINAL|HP:" << hp << "|ATK:" << baseAtk << "|DEF:" << baseDef << endl;
    cout << "SCORE|175" << endl;
    return 0;
}
`,
};
