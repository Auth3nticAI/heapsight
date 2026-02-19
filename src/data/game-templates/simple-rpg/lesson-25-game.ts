import type { GameLessonVariant } from "@/types/game";

export const lesson25SimpleRpg: GameLessonVariant = {
  lessonId: "25-milestone-playable-loop",

  instructions: `# Complete RPG — Full Data-Driven Integration\n\nThis is the **capstone lesson**. You will build a complete RPG scene that combines every concept from the course into one cohesive data-driven game.\n\n## What You'll Build\n\n- A **warrior** with full stats (HP, ATK, DEF, Level, XP)\n- **Two enemies** (Goblin and Skeleton) with their own stats\n- An **inventory** with a Sword (weapon) and a Potion (consumable)\n- **Combat simulation**: equip sword for ATK buff, attack enemies, use potion to heal\n- **Scoring**: total damage dealt plus bonus for surviving\n\n## Concepts Combined\n\n- Structs for entities and items (Lessons 4, 20)\n- Functions for game logic (Lessons 3, 20)\n- Dynamic data flow: stats drive combat, items modify stats (Lesson 21)\n- Proper resource lifecycle (Lessons 22-23)\n- Correct formulas and loop bounds (Lesson 24)\n\n## Output Protocol\n\n- \`ENTITY|id|type|x|y|width|height\` for all game objects\n- \`GAME_MESSAGE|text\` for narration and combat log\n- \`SCORE|value\` for final score\n- \`GAME_OVER\` when the scene concludes`,

  starterCode: `#include <iostream>
#include <string>
using namespace std;

// CAPSTONE: Complete RPG with stats, inventory, combat, and scoring

struct Stats {
    int hp;
    int maxHp;
    int atk;
    int def;
    int level;
    int xp;
};

struct GameItem {
    string name;
    string type;   // "weapon" or "consumable"
    int power;
    bool used;
};

struct Entity {
    string id;
    string entityType;  // "player" or "enemy"
    int x;
    int y;
    int w;
    int h;
    Stats stats;
};

// TODO: Write renderEntity(Entity e) that outputs:
//   ENTITY|id|entityType|x|y|w|h

// TODO: Write equipWeapon(Entity& e, GameItem& item) that:
//   - Adds item.power to e.stats.atk
//   - Marks item as used
//   - Outputs: GAME_MESSAGE|Equipped <name>! ATK now <atk>

// TODO: Write usePotion(Entity& e, GameItem& item) that:
//   - Heals e.stats.hp by item.power (cap at maxHp)
//   - Marks item as used
//   - Outputs: GAME_MESSAGE|Used <name>! HP now <hp>/<maxHp>

// TODO: Write attack(Entity& attacker, Entity& target) that:
//   - Calculates damage = attacker.atk - target.stats.def (min 1)
//   - Subtracts damage from target HP
//   - Outputs: GAME_MESSAGE|<attacker.id> hits <target.id> for <damage>!
//   - If target HP <= 0: set HP to 0,
//     output GAME_MESSAGE|<target.id> defeated!
//   - Returns the damage dealt

int main() {
    // Create warrior: id="warrior", "player", pos(180,200), size(22,26)
    //   Stats: HP=85, maxHP=100, ATK=15, DEF=8, Level=5, XP=0

    // Create goblin: id="goblin1", "enemy", pos(300,180), size(18,18)
    //   Stats: HP=30, maxHP=30, ATK=10, DEF=4, Level=2, XP=0

    // Create skeleton: id="skeleton1", "enemy", pos(350,160), size(20,22)
    //   Stats: HP=45, maxHP=45, ATK=14, DEF=6, Level=3, XP=0

    // Create 2 items:
    //   sword: "Dragon Sword", "weapon", power=12, used=false
    //   potion: "Grand Potion", "consumable", power=40, used=false

    // Render all 3 entities
    // Render item entities:
    //   ENTITY|item_sword|item|140|280|14|14
    //   ENTITY|item_potion|item|200|280|12|12

    // Output: GAME_MESSAGE|=== RPG Combat Begins ===

    // Step 1: Equip the sword (ATK 15 + 12 = 27)
    // Step 2: Attack goblin (damage = 27 - 4 = 23, goblin HP 30->7)
    // Step 3: Attack goblin again (damage = 23, goblin HP 7->0, defeated)
    // Step 4: Warrior gains 25 XP from goblin
    // Step 5: Attack skeleton (damage = 27 - 6 = 21, skeleton HP 45->24)
    // Step 6: Attack skeleton again (damage = 21, skeleton HP 24->3)
    // Step 7: Attack skeleton final (damage = 21, skeleton HP 3->0, defeated)
    // Step 8: Warrior gains 40 XP from skeleton
    // Step 9: Use potion (HP 85 + 40 = 100, capped at maxHP 100)

    // Output: GAME_MESSAGE|=== Combat Complete ===
    // Output: GAME_MESSAGE|Final: warrior Lv.5 HP:<hp>/<maxHp> XP:<xp>

    // Score = total damage dealt + 50 survival bonus
    // Output: SCORE|<totalScore>
    // Output: GAME_OVER

    return 0;
}`,

  solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct Stats {
    int hp;
    int maxHp;
    int atk;
    int def;
    int level;
    int xp;
};

struct GameItem {
    string name;
    string type;
    int power;
    bool used;
};

struct Entity {
    string id;
    string entityType;
    int x;
    int y;
    int w;
    int h;
    Stats stats;
};

void renderEntity(Entity e) {
    cout << "ENTITY|" << e.id << "|" << e.entityType << "|"
         << e.x << "|" << e.y << "|" << e.w << "|" << e.h << endl;
}

void equipWeapon(Entity& e, GameItem& item) {
    e.stats.atk = e.stats.atk + item.power;
    item.used = true;
    cout << "GAME_MESSAGE|Equipped " << item.name << "! ATK now "
         << e.stats.atk << endl;
}

void usePotion(Entity& e, GameItem& item) {
    e.stats.hp = e.stats.hp + item.power;
    if (e.stats.hp > e.stats.maxHp) {
        e.stats.hp = e.stats.maxHp;
    }
    item.used = true;
    cout << "GAME_MESSAGE|Used " << item.name << "! HP now "
         << e.stats.hp << "/" << e.stats.maxHp << endl;
}

int attack(Entity& attacker, Entity& target) {
    int damage = attacker.stats.atk - target.stats.def;
    if (damage < 1) {
        damage = 1;
    }
    target.stats.hp = target.stats.hp - damage;
    cout << "GAME_MESSAGE|" << attacker.id << " hits " << target.id
         << " for " << damage << "!" << endl;
    if (target.stats.hp <= 0) {
        target.stats.hp = 0;
        cout << "GAME_MESSAGE|" << target.id << " defeated!" << endl;
    }
    return damage;
}

int main() {
    Entity warrior;
    warrior.id = "warrior";
    warrior.entityType = "player";
    warrior.x = 180;
    warrior.y = 200;
    warrior.w = 22;
    warrior.h = 26;
    warrior.stats = {85, 100, 15, 8, 5, 0};

    Entity goblin;
    goblin.id = "goblin1";
    goblin.entityType = "enemy";
    goblin.x = 300;
    goblin.y = 180;
    goblin.w = 18;
    goblin.h = 18;
    goblin.stats = {30, 30, 10, 4, 2, 0};

    Entity skeleton;
    skeleton.id = "skeleton1";
    skeleton.entityType = "enemy";
    skeleton.x = 350;
    skeleton.y = 160;
    skeleton.w = 20;
    skeleton.h = 22;
    skeleton.stats = {45, 45, 14, 6, 3, 0};

    GameItem sword = {"Dragon Sword", "weapon", 12, false};
    GameItem potion = {"Grand Potion", "consumable", 40, false};

    renderEntity(warrior);
    renderEntity(goblin);
    renderEntity(skeleton);
    cout << "ENTITY|item_sword|item|140|280|14|14" << endl;
    cout << "ENTITY|item_potion|item|200|280|12|12" << endl;

    cout << "GAME_MESSAGE|=== RPG Combat Begins ===" << endl;

    int totalDamage = 0;

    // Step 1: Equip sword
    equipWeapon(warrior, sword);

    // Step 2: Attack goblin (27 - 4 = 23, HP 30->7)
    totalDamage = totalDamage + attack(warrior, goblin);

    // Step 3: Attack goblin again (23, HP 7->0, defeated)
    totalDamage = totalDamage + attack(warrior, goblin);

    // Step 4: Gain XP from goblin
    warrior.stats.xp = warrior.stats.xp + 25;
    cout << "GAME_MESSAGE|Gained 25 XP from goblin1!" << endl;

    // Step 5: Attack skeleton (27 - 6 = 21, HP 45->24)
    totalDamage = totalDamage + attack(warrior, skeleton);

    // Step 6: Attack skeleton again (21, HP 24->3)
    totalDamage = totalDamage + attack(warrior, skeleton);

    // Step 7: Attack skeleton final (21, HP 3->0, defeated)
    totalDamage = totalDamage + attack(warrior, skeleton);

    // Step 8: Gain XP from skeleton
    warrior.stats.xp = warrior.stats.xp + 40;
    cout << "GAME_MESSAGE|Gained 40 XP from skeleton1!" << endl;

    // Step 9: Use potion (85 + 40 = 125, capped to 100)
    usePotion(warrior, potion);

    cout << "GAME_MESSAGE|=== Combat Complete ===" << endl;
    cout << "GAME_MESSAGE|Final: warrior Lv." << warrior.stats.level
         << " HP:" << warrior.stats.hp << "/" << warrior.stats.maxHp
         << " XP:" << warrior.stats.xp << endl;

    int score = totalDamage + 50;
    cout << "SCORE|" << score << endl;
    cout << "GAME_OVER" << endl;

    return 0;
}`,

  tests: [
    {
      id: "warrior-entity",
      description: "Outputs warrior entity at correct position",
      expectedOutput: "ENTITY\\|warrior\\|player\\|180\\|200\\|22\\|26",
      isPattern: true,
    },
    {
      id: "goblin-entity",
      description: "Outputs goblin entity at correct position",
      expectedOutput: "ENTITY\\|goblin1\\|enemy\\|300\\|180\\|18\\|18",
      isPattern: true,
    },
    {
      id: "skeleton-entity",
      description: "Outputs skeleton entity at correct position",
      expectedOutput: "ENTITY\\|skeleton1\\|enemy\\|350\\|160\\|20\\|22",
      isPattern: true,
    },
    {
      id: "item-sword-entity",
      description: "Renders sword item entity",
      expectedOutput: "ENTITY\\|item_sword\\|item\\|140\\|280\\|14\\|14",
      isPattern: true,
    },
    {
      id: "item-potion-entity",
      description: "Renders potion item entity",
      expectedOutput: "ENTITY\\|item_potion\\|item\\|200\\|280\\|12\\|12",
      isPattern: true,
    },
    {
      id: "combat-begins",
      description: "Displays combat start message",
      expectedOutput: "GAME_MESSAGE\\|=== RPG Combat Begins ===",
      isPattern: true,
    },
    {
      id: "equip-sword",
      description: "Equips Dragon Sword boosting ATK from 15 to 27",
      expectedOutput: "GAME_MESSAGE\\|Equipped Dragon Sword! ATK now 27",
      isPattern: true,
    },
    {
      id: "attack-goblin-1",
      description: "First attack on goblin deals 23 damage (27-4)",
      expectedOutput: "GAME_MESSAGE\\|warrior hits goblin1 for 23!",
      isPattern: true,
    },
    {
      id: "attack-goblin-2-defeat",
      description: "Second attack defeats goblin (HP 7->0)",
      expectedOutput: "GAME_MESSAGE\\|goblin1 defeated!",
      isPattern: true,
    },
    {
      id: "goblin-xp",
      description: "Warrior gains 25 XP from goblin",
      expectedOutput: "GAME_MESSAGE\\|Gained 25 XP from goblin1!",
      isPattern: true,
    },
    {
      id: "attack-skeleton-1",
      description: "First attack on skeleton deals 21 damage (27-6)",
      expectedOutput: "GAME_MESSAGE\\|warrior hits skeleton1 for 21!",
      isPattern: true,
    },
    {
      id: "skeleton-defeated",
      description: "Skeleton is defeated after taking enough damage",
      expectedOutput: "GAME_MESSAGE\\|skeleton1 defeated!",
      isPattern: true,
    },
    {
      id: "skeleton-xp",
      description: "Warrior gains 40 XP from skeleton",
      expectedOutput: "GAME_MESSAGE\\|Gained 40 XP from skeleton1!",
      isPattern: true,
    },
    {
      id: "use-potion",
      description: "Uses Grand Potion healing to 100/100 (capped at maxHp)",
      expectedOutput: "GAME_MESSAGE\\|Used Grand Potion! HP now 100/100",
      isPattern: true,
    },
    {
      id: "combat-complete",
      description: "Displays combat complete message",
      expectedOutput: "GAME_MESSAGE\\|=== Combat Complete ===",
      isPattern: true,
    },
    {
      id: "final-stats",
      description: "Shows final warrior stats with level, HP, and XP",
      expectedOutput: "GAME_MESSAGE\\|Final: warrior Lv\\.5 HP:100/100 XP:65",
      isPattern: true,
    },
    {
      id: "final-score",
      description: "Score = total damage (23+23+21+21+21=109) + 50 survival bonus = 159",
      expectedOutput: "SCORE\\|159",
      isPattern: true,
    },
    {
      id: "game-over",
      description: "Outputs GAME_OVER to end the scene",
      expectedOutput: "GAME_OVER",
      isPattern: true,
    },
  ],

  hints: [
    "Start by defining all three structs (Stats, GameItem, Entity), then create the warrior, goblin, and skeleton with the exact stats specified.",
    "equipWeapon adds item.power to the entity's ATK: warrior ATK goes from 15 to 15+12=27 after equipping Dragon Sword.",
    "In attack(), clamp damage to minimum 1: int damage = atk - def; if (damage < 1) damage = 1; This prevents negative damage.",
    "usePotion heals HP but must cap at maxHp: if (hp > maxHp) hp = maxHp; So 85+40=125 gets capped to 100.",
    "Track totalDamage by adding each attack's return value. The final score is totalDamage + 50 survival bonus.",
  ],

  accumulatedCode: `#include <iostream>
#include <string>
using namespace std;

struct Stats {
    int hp;
    int maxHp;
    int atk;
    int def;
    int level;
    int xp;
};

struct GameItem {
    string name;
    string type;
    int power;
    bool used;
};

struct Entity {
    string id;
    string entityType;
    int x;
    int y;
    int w;
    int h;
    Stats stats;
};

void renderEntity(Entity e) {
    cout << "ENTITY|" << e.id << "|" << e.entityType << "|"
         << e.x << "|" << e.y << "|" << e.w << "|" << e.h << endl;
}

void equipWeapon(Entity& e, GameItem& item) {
    e.stats.atk = e.stats.atk + item.power;
    item.used = true;
    cout << "GAME_MESSAGE|Equipped " << item.name << "! ATK now "
         << e.stats.atk << endl;
}

void usePotion(Entity& e, GameItem& item) {
    e.stats.hp = e.stats.hp + item.power;
    if (e.stats.hp > e.stats.maxHp) {
        e.stats.hp = e.stats.maxHp;
    }
    item.used = true;
    cout << "GAME_MESSAGE|Used " << item.name << "! HP now "
         << e.stats.hp << "/" << e.stats.maxHp << endl;
}

int attack(Entity& attacker, Entity& target) {
    int damage = attacker.stats.atk - target.stats.def;
    if (damage < 1) {
        damage = 1;
    }
    target.stats.hp = target.stats.hp - damage;
    cout << "GAME_MESSAGE|" << attacker.id << " hits " << target.id
         << " for " << damage << "!" << endl;
    if (target.stats.hp <= 0) {
        target.stats.hp = 0;
        cout << "GAME_MESSAGE|" << target.id << " defeated!" << endl;
    }
    return damage;
}

int main() {
    Entity warrior;
    warrior.id = "warrior";
    warrior.entityType = "player";
    warrior.x = 180;
    warrior.y = 200;
    warrior.w = 22;
    warrior.h = 26;
    warrior.stats = {85, 100, 15, 8, 5, 0};

    Entity goblin;
    goblin.id = "goblin1";
    goblin.entityType = "enemy";
    goblin.x = 300;
    goblin.y = 180;
    goblin.w = 18;
    goblin.h = 18;
    goblin.stats = {30, 30, 10, 4, 2, 0};

    Entity skeleton;
    skeleton.id = "skeleton1";
    skeleton.entityType = "enemy";
    skeleton.x = 350;
    skeleton.y = 160;
    skeleton.w = 20;
    skeleton.h = 22;
    skeleton.stats = {45, 45, 14, 6, 3, 0};

    GameItem sword = {"Dragon Sword", "weapon", 12, false};
    GameItem potion = {"Grand Potion", "consumable", 40, false};

    renderEntity(warrior);
    renderEntity(goblin);
    renderEntity(skeleton);
    cout << "ENTITY|item_sword|item|140|280|14|14" << endl;
    cout << "ENTITY|item_potion|item|200|280|12|12" << endl;

    cout << "GAME_MESSAGE|=== RPG Combat Begins ===" << endl;

    int totalDamage = 0;

    equipWeapon(warrior, sword);

    totalDamage = totalDamage + attack(warrior, goblin);
    totalDamage = totalDamage + attack(warrior, goblin);

    warrior.stats.xp = warrior.stats.xp + 25;
    cout << "GAME_MESSAGE|Gained 25 XP from goblin1!" << endl;

    totalDamage = totalDamage + attack(warrior, skeleton);
    totalDamage = totalDamage + attack(warrior, skeleton);
    totalDamage = totalDamage + attack(warrior, skeleton);

    warrior.stats.xp = warrior.stats.xp + 40;
    cout << "GAME_MESSAGE|Gained 40 XP from skeleton1!" << endl;

    usePotion(warrior, potion);

    cout << "GAME_MESSAGE|=== Combat Complete ===" << endl;
    cout << "GAME_MESSAGE|Final: warrior Lv." << warrior.stats.level
         << " HP:" << warrior.stats.hp << "/" << warrior.stats.maxHp
         << " XP:" << warrior.stats.xp << endl;

    int score = totalDamage + 50;
    cout << "SCORE|" << score << endl;
    cout << "GAME_OVER" << endl;

    return 0;
}`,
};
