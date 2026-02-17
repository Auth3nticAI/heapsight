import type { Lesson } from "@/types/lesson";

export const lesson25: Lesson = {
  id: "25-final-polish",
  title: "Final Polish",
  description: "Put it all together — build a complete game scene.",
  order: 25,
  xpReward: 200,
  tier: "pro",
  concepts: ["integration", "complete game", "all concepts"],
  part1: {
    title: "Concept: Integration",
    type: "concept",
    instructions: `# Putting It All Together

You've learned everything: variables, functions, structs, pointers, arrays, loops, conditionals, memory management. Let's combine them.

## Your Task
Create a mini battle simulator that:
1. Defines an \`Entity\` struct with \`name\`, \`hp\`, \`attack\`
2. Creates a hero and 2 enemies
3. Hero attacks both enemies
4. Reports results

\`\`\`
Hero attacks Goblin for 25 damage!
Goblin HP: 15
Hero attacks Orc for 25 damage!
Orc HP: 55
Battle complete!
\`\`\`

Hero attack = 25, Goblin HP = 40, Orc HP = 80.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

// Define Entity struct

// Write attack function

int main() {
    // Create hero, goblin, orc

    // Hero attacks both

    // Print results

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct Entity {
    string name;
    int hp;
    int attack;
};

void doAttack(Entity& attacker, Entity& target) {
    target.hp = target.hp - attacker.attack;
    if (target.hp < 0) target.hp = 0;
    cout << attacker.name << " attacks " << target.name << " for " << attacker.attack << " damage!" << endl;
    cout << target.name << " HP: " << target.hp << endl;
}

int main() {
    Entity hero = {"Hero", 100, 25};
    Entity goblin = {"Goblin", 40, 10};
    Entity orc = {"Orc", 80, 15};

    doAttack(hero, goblin);
    doAttack(hero, orc);

    cout << "Battle complete!" << endl;
    return 0;
}
`,
    tests: [
      { id: "t1", description: "Should show battle results", expectedOutput: "Hero attacks Goblin for 25 damage!\nGoblin HP: 15\nHero attacks Orc for 25 damage!\nOrc HP: 55\nBattle complete!\n" },
    ],
    hints: [
      "Entity struct needs: `string name`, `int hp`, `int attack`.",
      "Use references in doAttack: `void doAttack(Entity& attacker, Entity& target)`",
      "Goblin: 40 - 25 = 15. Orc: 80 - 25 = 55.",
    ],
    estimatedMinutes: 7,
  },
  part2: {
    title: "Game: Complete Scene",
    type: "game_builder",
    instructions: `# Game Builder: Your Complete Game Scene

This is it! Build a complete game scene using everything you've learned: structs, functions, loops, conditionals, and the game protocol.

## Your Task
1. Define an Entity struct
2. Create player + 3 enemies
3. Player attacks each enemy (30 damage)
4. Render all entities with updated HP
5. Count defeated enemies and calculate score

Expected output:
\`\`\`
ENTITY|hero|player|180|200|24|24|100
ENTITY|e0|enemy|60|80|18|18|10
ENTITY|e1|enemy|180|60|18|18|0
ENTITY|e2|enemy|300|80|18|18|20
SCORE|100
GAME_MESSAGE|Battle complete! 1 defeated, Score: 100
\`\`\`

Enemies start with HP: 40, 20, 50. After 30 damage: 10, 0, 20. One defeated = 100 score.`,
    starterCode: `#include <iostream>
#include <string>
using namespace std;

struct Entity {
    string id;
    string type;
    int x, y, w, h, hp;
};

// Write renderEntity function

// Write applyDamage function (with reference)

int main() {
    // Create entities

    // Attack each enemy

    // Render all

    // Count defeated and show score

    return 0;
}
`,
    solutionCode: `#include <iostream>
#include <string>
using namespace std;

struct Entity {
    string id;
    string type;
    int x, y, w, h, hp;
};

void renderEntity(Entity e) {
    cout << "ENTITY|" << e.id << "|" << e.type << "|"
         << e.x << "|" << e.y << "|" << e.w << "|" << e.h
         << "|" << e.hp << endl;
}

void applyDamage(Entity& e, int dmg) {
    e.hp = e.hp - dmg;
    if (e.hp < 0) e.hp = 0;
}

int main() {
    Entity hero = {"hero", "player", 180, 200, 24, 24, 100};
    Entity enemies[3] = {
        {"e0", "enemy", 60, 80, 18, 18, 40},
        {"e1", "enemy", 180, 60, 18, 18, 20},
        {"e2", "enemy", 300, 80, 18, 18, 50}
    };

    for (int i = 0; i < 3; i++) {
        applyDamage(enemies[i], 30);
    }

    renderEntity(hero);
    for (int i = 0; i < 3; i++) {
        renderEntity(enemies[i]);
    }

    int defeated = 0;
    for (int i = 0; i < 3; i++) {
        if (enemies[i].hp <= 0) defeated++;
    }

    int score = defeated * 100;
    cout << "SCORE|" << score << endl;
    cout << "GAME_MESSAGE|Battle complete! " << defeated << " defeated, Score: " << score << endl;
    return 0;
}
`,
    tests: [
      { id: "g1", description: "Enemy e1 should be defeated (0 HP)", expectedOutput: "ENTITY\\|e1\\|enemy\\|180\\|60\\|18\\|18\\|0", isPattern: true },
      { id: "g2", description: "Should show score 100", expectedOutput: "SCORE\\|100", isPattern: true },
      { id: "g3", description: "Should show battle complete", expectedOutput: "GAME_MESSAGE\\|Battle complete! 1 defeated, Score: 100", isPattern: true },
    ],
    hints: [
      "applyDamage takes `Entity& e` by reference to modify the original.",
      "Enemy HPs after 30 damage: 40-30=10, 20-30=-10→0, 50-30=20. One defeated.",
      "Score = defeated * 100 = 1 * 100 = 100.",
    ],
    estimatedMinutes: 10,
  },
};
