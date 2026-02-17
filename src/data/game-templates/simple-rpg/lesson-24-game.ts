import type { GameLessonVariant } from "@/types/game";

export const lesson24SimpleRpg: GameLessonVariant = {
  lessonId: "24-debugging",

  instructions: `# Quest Bugs — Fix 3 RPG Logic Errors\n\nDebugging is a critical skill. This lesson presents RPG code with **3 bugs** that break combat and progression. Your job is to find and fix them all.\n\n## The 3 Bugs\n\n1. **Wrong damage formula**: The attack function subtracts defense from damage incorrectly, giving negative damage on strong armor\n2. **Inventory off-by-one**: The inventory display loop uses \`<=\` instead of \`<\`, accessing out-of-bounds memory\n3. **XP miscalculation**: The level-up threshold check uses \`>\` instead of \`>=\`, so a player at exactly the XP threshold never levels up\n\n## What You'll Fix\n\n- Correct the damage formula to clamp minimum damage to 1\n- Fix the inventory loop boundary\n- Fix the XP threshold comparison to use \`>=\`\n\n## Output Protocol\n\n- \`ENTITY|id|type|x|y|width|height\` for game objects\n- \`GAME_MESSAGE|text\` for combat and progression results\n- \`SCORE|value\` for total score after fixes`,

  starterCode: `#include <iostream>
#include <string>
using namespace std;

// BUG HUNT: This RPG code has 3 bugs. Find and fix them all!

struct Fighter {
    string name;
    int hp;
    int atk;
    int def;
    int xp;
    int level;
};

// BUG 1: This function can produce negative damage when defense > attack.
// Fix: ensure minimum damage is always at least 1.
int calcDamage(int atk, int def) {
    int damage = atk - def;
    return damage;
}

// BUG 2: This loop has an off-by-one error.
// Fix: the loop condition should use < not <=
void showInventory(string items[], int count) {
    cout << "GAME_MESSAGE|Inventory:" << endl;
    for (int i = 0; i <= count; i++) {
        cout << "GAME_MESSAGE|  - " << items[i] << endl;
    }
}

// BUG 3: This function uses > but should use >= for the threshold.
// A player at exactly 100 XP should level up.
void checkLevelUp(Fighter& f) {
    if (f.xp > 100) {
        f.level = f.level + 1;
        f.xp = f.xp - 100;
        cout << "GAME_MESSAGE|" << f.name << " leveled up to "
             << f.level << "!" << endl;
    }
}

int main() {
    Fighter warrior = {"Aldric", 100, 18, 5, 80, 3};
    Fighter goblin = {"Goblin", 30, 12, 20, 0, 1};

    cout << "ENTITY|warrior|player|180|200|22|26" << endl;
    cout << "ENTITY|goblin1|enemy|300|180|18|18" << endl;

    // Warrior attacks goblin (atk=18, goblin def=20)
    // Without fix: damage = 18-20 = -2 (BUG!)
    // With fix: damage should be clamped to 1
    int dmg1 = calcDamage(warrior.atk, goblin.def);
    goblin.hp = goblin.hp - dmg1;
    cout << "GAME_MESSAGE|" << warrior.name << " deals " << dmg1
         << " damage to " << goblin.name << "!" << endl;
    cout << "GAME_MESSAGE|" << goblin.name << " HP: " << goblin.hp << endl;

    // Show inventory with 2 items
    // Without fix: loop goes 0,1,2 accessing items[2] which is out of bounds
    // With fix: loop goes 0,1 only
    string items[2] = {"Iron Sword", "Health Potion"};
    showInventory(items, 2);

    // Add XP and check level up
    // warrior.xp = 80 + 20 = 100, which is exactly the threshold
    // Without fix: 100 > 100 is false, so no level up (BUG!)
    // With fix: 100 >= 100 is true, warrior levels up to 4
    warrior.xp = warrior.xp + 20;
    checkLevelUp(warrior);

    cout << "GAME_MESSAGE|Final: " << warrior.name << " Lv."
         << warrior.level << " XP:" << warrior.xp << endl;

    cout << "SCORE|" << (dmg1 + warrior.level * 10) << endl;

    return 0;
}`,

  solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct Fighter {
    string name;
    int hp;
    int atk;
    int def;
    int xp;
    int level;
};

// FIX 1: Clamp damage to minimum of 1
int calcDamage(int atk, int def) {
    int damage = atk - def;
    if (damage < 1) {
        damage = 1;
    }
    return damage;
}

// FIX 2: Use < instead of <= to prevent off-by-one
void showInventory(string items[], int count) {
    cout << "GAME_MESSAGE|Inventory:" << endl;
    for (int i = 0; i < count; i++) {
        cout << "GAME_MESSAGE|  - " << items[i] << endl;
    }
}

// FIX 3: Use >= instead of > so exact threshold triggers level up
void checkLevelUp(Fighter& f) {
    if (f.xp >= 100) {
        f.level = f.level + 1;
        f.xp = f.xp - 100;
        cout << "GAME_MESSAGE|" << f.name << " leveled up to "
             << f.level << "!" << endl;
    }
}

int main() {
    Fighter warrior = {"Aldric", 100, 18, 5, 80, 3};
    Fighter goblin = {"Goblin", 30, 12, 20, 0, 1};

    cout << "ENTITY|warrior|player|180|200|22|26" << endl;
    cout << "ENTITY|goblin1|enemy|300|180|18|18" << endl;

    int dmg1 = calcDamage(warrior.atk, goblin.def);
    goblin.hp = goblin.hp - dmg1;
    cout << "GAME_MESSAGE|" << warrior.name << " deals " << dmg1
         << " damage to " << goblin.name << "!" << endl;
    cout << "GAME_MESSAGE|" << goblin.name << " HP: " << goblin.hp << endl;

    string items[2] = {"Iron Sword", "Health Potion"};
    showInventory(items, 2);

    warrior.xp = warrior.xp + 20;
    checkLevelUp(warrior);

    cout << "GAME_MESSAGE|Final: " << warrior.name << " Lv."
         << warrior.level << " XP:" << warrior.xp << endl;

    cout << "SCORE|" << (dmg1 + warrior.level * 10) << endl;

    return 0;
}`,

  tests: [
    {
      id: "warrior-entity",
      description: "Outputs warrior entity on screen",
      expectedOutput: "ENTITY\\|warrior\\|player\\|180\\|200\\|22\\|26",
      isPattern: true,
    },
    {
      id: "goblin-entity",
      description: "Outputs goblin entity on screen",
      expectedOutput: "ENTITY\\|goblin1\\|enemy\\|300\\|180\\|18\\|18",
      isPattern: true,
    },
    {
      id: "damage-clamped",
      description: "Damage clamped to 1 when defense exceeds attack (18 ATK vs 20 DEF)",
      expectedOutput: "GAME_MESSAGE\\|Aldric deals 1 damage to Goblin!",
      isPattern: true,
    },
    {
      id: "goblin-hp-after",
      description: "Goblin HP reduced by clamped damage (30 - 1 = 29)",
      expectedOutput: "GAME_MESSAGE\\|Goblin HP: 29",
      isPattern: true,
    },
    {
      id: "inventory-header",
      description: "Displays inventory header",
      expectedOutput: "GAME_MESSAGE\\|Inventory:",
      isPattern: true,
    },
    {
      id: "inventory-sword",
      description: "Displays Iron Sword in inventory",
      expectedOutput: "GAME_MESSAGE\\|  - Iron Sword",
      isPattern: true,
    },
    {
      id: "inventory-potion",
      description: "Displays Health Potion in inventory",
      expectedOutput: "GAME_MESSAGE\\|  - Health Potion",
      isPattern: true,
    },
    {
      id: "level-up",
      description: "Warrior levels up at exactly 100 XP (80+20=100, >= triggers)",
      expectedOutput: "GAME_MESSAGE\\|Aldric leveled up to 4!",
      isPattern: true,
    },
    {
      id: "final-stats",
      description: "Final stats show Level 4 and 0 XP remaining (100-100=0)",
      expectedOutput: "GAME_MESSAGE\\|Final: Aldric Lv\\.4 XP:0",
      isPattern: true,
    },
    {
      id: "score-output",
      description: "Score = clamped damage (1) + level*10 (4*10=40) = 41",
      expectedOutput: "SCORE\\|41",
      isPattern: true,
    },
  ],

  hints: [
    "Bug 1: In calcDamage, add a check: if (damage < 1) damage = 1; to prevent negative or zero damage.",
    "Bug 2: In showInventory, change the loop from i <= count to i < count. Arrays are 0-indexed, so 2 items are at indices 0 and 1.",
    "Bug 3: In checkLevelUp, change f.xp > 100 to f.xp >= 100 so that exactly 100 XP triggers a level up.",
    "After all fixes: damage=1, goblin HP=29, inventory shows 2 items without crash, warrior reaches level 4 with 0 XP remaining.",
  ],

  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

struct Fighter {
    string name;
    int hp;
    int atk;
    int def;
    int xp;
    int level;
};

int calcDamage(int atk, int def) {
    int damage = atk - def;
    if (damage < 1) {
        damage = 1;
    }
    return damage;
}

void showInventory(string items[], int count) {
    cout << "GAME_MESSAGE|Inventory:" << endl;
    for (int i = 0; i < count; i++) {
        cout << "GAME_MESSAGE|  - " << items[i] << endl;
    }
}

void checkLevelUp(Fighter& f) {
    if (f.xp >= 100) {
        f.level = f.level + 1;
        f.xp = f.xp - 100;
        cout << "GAME_MESSAGE|" << f.name << " leveled up to "
             << f.level << "!" << endl;
    }
}

int main() {
    Fighter warrior = {"Aldric", 100, 18, 5, 80, 3};
    Fighter goblin = {"Goblin", 30, 12, 20, 0, 1};

    cout << "ENTITY|warrior|player|180|200|22|26" << endl;
    cout << "ENTITY|goblin1|enemy|300|180|18|18" << endl;

    int dmg1 = calcDamage(warrior.atk, goblin.def);
    goblin.hp = goblin.hp - dmg1;
    cout << "GAME_MESSAGE|" << warrior.name << " deals " << dmg1
         << " damage to " << goblin.name << "!" << endl;
    cout << "GAME_MESSAGE|" << goblin.name << " HP: " << goblin.hp << endl;

    string items[2] = {"Iron Sword", "Health Potion"};
    showInventory(items, 2);

    warrior.xp = warrior.xp + 20;
    checkLevelUp(warrior);

    cout << "GAME_MESSAGE|Final: " << warrior.name << " Lv."
         << warrior.level << " XP:" << warrior.xp << endl;

    cout << "SCORE|" << (dmg1 + warrior.level * 10) << endl;

    return 0;
}`,
};
